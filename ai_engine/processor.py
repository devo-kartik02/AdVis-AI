import sys
import json
import cv2
import os
import shutil
import numpy as np
import subprocess
import re
import datetime
import math
from ultralytics import YOLO
from paddleocr import PaddleOCR
from difflib import SequenceMatcher
import whisper
import logging
from google import genai
from dotenv import load_dotenv
from groq import Groq

# Load the key from the .env file we just created
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

API_KEY = os.getenv("GEMINI_API_KEY")

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def get_llm_verdict(prompt):
    try:
        # Use the specific GROQ client here
        completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.5,
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        # If Groq fails, try Gemini as a backup
        try:
            response = gemini_client.models.generate_content(
                model='gemini-1.5-flash',
                contents=prompt
            )
            return response.text.strip()
        except Exception as e2:
            return f"Dual Engine Error: {str(e)} | {str(e2)}"
    
# ==========================================
# 🔧 AUDIO ENGINE SETUP
# ==========================================
def setup_ffmpeg():
    folder = r"D:\Visibility-Analysis-Project\venv\Lib\site-packages\imageio_ffmpeg\binaries"
    long_name = "ffmpeg-win-x86_64-v7.1.exe"
    target_name = "ffmpeg.exe"
    
    full_target_path = os.path.join(folder, target_name)
    if os.path.exists(os.path.join(folder, long_name)) and not os.path.exists(full_target_path):
        try: shutil.copy(os.path.join(folder, long_name), full_target_path)
        except: pass
    
    if folder not in os.environ["PATH"]:
        os.environ["PATH"] += os.pathsep + folder
    return full_target_path

FFMPEG_EXE = setup_ffmpeg()

# ==========================================
# ⚙️ CONFIG & SETUP
# ==========================================
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# Anchor all public paths to that SCRIPT_DIR
PUBLIC_DIR = os.path.join(SCRIPT_DIR, "public")
HEATMAP_DIR = os.path.join(PUBLIC_DIR, "heatmaps")
VIDEO_OUT_DIR = os.path.join(PUBLIC_DIR, "uploads")

# Create them if they don't exist
for d in [HEATMAP_DIR, VIDEO_OUT_DIR]:
    os.makedirs(d, exist_ok=True)

SERVER_URL = "http://localhost:5000"

MODELS = {
    "food": os.path.join(BASE_DIR, "models/food_best.pt"),
    "cosmetic": os.path.join(BASE_DIR, "models/cosmetic_best.pt")
}
DEFAULT_MODEL = "yolov8n.pt"

try:
    ocr_engine = PaddleOCR(use_angle_cls=True, lang='en', use_gpu=False, ocr_version='PP-OCRv4', drop_score=0.5, show_log=False)
except: ocr_engine = None

saliency = cv2.saliency.StaticSaliencySpectralResidual_create()

try: audio_model = whisper.load_model("base")
except: audio_model = None

# ==========================================
# 🧠 HELPER FUNCTIONS
# ==========================================
def safe_div(n, d):
    return n / d if d > 0 else 0.0

def calculate_box_area_ratio(box, width, height):
    x1, y1, x2, y2 = box
    box_area = (x2 - x1) * (y2 - y1)
    screen_area = width * height
    return safe_div(box_area, screen_area)

def calculate_placement_label(box_center, img_w, img_h, area_ratio):
    cx, cy = box_center
    if area_ratio > 0.30: depth = "Foreground"
    elif area_ratio < 0.05: depth = "Background"
    else: depth = "Mid-Ground"
    
    x_start, x_end = img_w * 0.3, img_w * 0.7
    y_start, y_end = img_h * 0.3, img_h * 0.7
    
    if x_start < cx < x_end and y_start < cy < y_end:
        pos = "Center"
    else:
        h_pos = "Left" if cx < img_w/2 else "Right"
        v_pos = "Top" if cy < img_h/2 else "Bottom"
        pos = f"{v_pos}-{h_pos}"
        
    return f"{pos} ({depth})"

def analyze_audio(video_path):
    if audio_model is None: return "Audio Analysis Disabled."
    
    # 🛑 SKIP AUDIO FOR IMAGES
    ext = os.path.splitext(video_path)[1].lower()
    if ext in ['.jpg', '.jpeg', '.png', '.webp', '.bmp']:
        return "N/A (Image Input)"

    try:
        audio_path = video_path.replace(ext, ".mp3")
        if not os.path.exists(FFMPEG_EXE): return "Audio Error: FFmpeg file missing."

        command = [FFMPEG_EXE, "-i", video_path, "-vn", "-ar", "16000", "-ac", "1", "-b:a", "64k", "-y", "-loglevel", "quiet", audio_path]
        subprocess.run(command, check=True)
        
        result = audio_model.transcribe(audio_path, fp16=False)
        text = result["text"].strip()
        
        if os.path.exists(audio_path): os.remove(audio_path)

        # 🛑 HALLUCINATION FILTER
        hallucinations = ["you", "thank you", "thanks", "thanks for watching", "click like", "subscribe", "music", "soy", "too"]
        text_lower = text.lower().replace(".", "").strip()
        
        if text_lower in hallucinations: return "No Speech Detected (Background Music Only)"
        if len(text_lower) < 3 and text_lower not in ["hi", "ok", "go", "no"]: return "No Speech Detected (Silence)"
        if text_lower == "you you" or text_lower == "soy soy": return "No Speech Detected (Background Music Only)"

        return text if text else "No Speech Detected."

    except Exception as e: return f"Audio Error: {str(e)}"

def preprocess_low_light(frame):
    if np.mean(frame) < 100: 
        lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8,8))
        limg = cv2.merge((clahe.apply(l), a, b))
        return cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)
    return frame

def get_all_text_from_crop(crop_img):
    if ocr_engine is None: return ""
    try:
        # 1. Convert to Gray
        gray = cv2.cvtColor(crop_img, cv2.COLOR_BGR2GRAY)
        
        # 2. Check for Blur (Lower threshold to allow softer text)
        blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()
        if blur_score < 40: return "" # Too blurry, give up
        
        # 3. SMART SHARPEN: If it's borderline blurry, sharpen it!
        if blur_score < 100:
            kernel = np.array([[0, -1, 0], [-1, 5,-1], [0, -1, 0]])
            crop_img = cv2.filter2D(crop_img, -1, kernel)

        h, w = crop_img.shape[:2]
        if w < 100: crop_img = cv2.resize(crop_img, (w*2, h*2), interpolation=cv2.INTER_LINEAR)
        
        result = ocr_engine.ocr(crop_img, cls=True)
        if not result or result[0] is None: return ""
        
        words = []
        for line in result[0]:
            text, conf = line[1]
            clean = re.sub(r'[^a-zA-Z0-9% ]', '', text).strip()
            # Lower confidence threshold slightly
            if conf > 0.50 and len(clean) > 2: words.append(clean)
            
        return " ".join(words)
    except: return ""

# ==========================================
# 📊 METRICS ENGINE (REALISTIC + CONNECTED SCORING)
# ==========================================
def calculate_final_metrics(all_detections, total_frames, fps, category, audio_text, width, height, is_image):
    product_dets = [d for d in all_detections if d['type'] == 'product']
    face_dets = [d for d in all_detections if d['type'] == 'distraction']

    # --- EDGE CASE: NO PRODUCT DETECTED ---
    if not product_dets:
        return {
            "visibility_score": 0, "placement": "Not Found", "duration": "N/A", 
            "recognizability": "None", "avg_confidence": 0, "distraction_rate": 0,
            "brand_text": "None", 
            "llm_verdict": "Audit Inconclusive: No product detected. Ensure the brand is clearly visible."
        }

    # 1. DURATION & PLACEMENT
    if is_image:
        duration_str = "Static Image"
        dur_score = 100
        duration_pct = 100.0
    else:
        unique_frames = len(set(d['frame_id'] for d in product_dets))
        # Estimate total presence based on 5-frame sampling
        est_frames = min(unique_frames * 5, total_frames) 
        duration_sec = round(est_frames / fps, 1) if fps > 0 else 0
        duration_pct = round((est_frames / total_frames) * 100, 1) if total_frames > 0 else 0
        duration_str = f"{duration_sec}s ({duration_pct}%)"
        dur_score = min(duration_sec / 8.0, 1.0) * 100

    avg_cx = sum(d['center'][0] for d in product_dets) / len(product_dets)
    avg_cy = sum(d['center'][1] for d in product_dets) / len(product_dets)
    avg_size = sum(d['area_ratio'] for d in product_dets) / len(product_dets)
    placement_label = calculate_placement_label((avg_cx, avg_cy), width, height, avg_size)

    # 2. CONFIDENCE & RECOGNIZABILITY
    avg_conf_raw = sum(d['confidence'] for d in product_dets) / len(product_dets)
    avg_conf_pct = round(avg_conf_raw * 100, 1)

    if avg_conf_raw > 0.80 and avg_size > 0.10: recognizability = "High (Clear)"
    elif avg_conf_raw > 0.50: recognizability = "Medium"
    else: recognizability = "Low (Blurry)"

    # 3. DISTRACTION RATE (Vampire Effect Logic) 🎯 FIXED HERE
    distracted_frames = 0
    # Analyze every frame that had ANY detection (Product OR Face)
    all_sampled_frame_ids = set(d['frame_id'] for d in all_detections)
    
    for f_id in all_sampled_frame_ids:
        p_items = [d for d in product_dets if d['frame_id'] == f_id]
        f_items = [d for d in face_dets if d['frame_id'] == f_id]
        
        if not f_items: 
            continue # No human/face in this frame, no distraction
            
        # Scenario A: Human is visible but Product is MISSING (Total Distraction)
        if f_items and not p_items:
            distracted_frames += 1
            continue

        # Scenario B: Both are visible (Competition for Gaze)
        max_p_sal = max(d['saliency'] for d in p_items)
        max_f_sal = max(d['saliency'] for d in f_items)
        max_f_area = max(d['area_ratio'] for d in f_items)
        
        # Human faces are biological attention magnets. 
        # We count distraction if face saliency is at least 80% of product saliency 
        # OR if the face occupies more than 7% of the screen.
        if max_f_sal > (max_p_sal * 0.8) or max_f_area > 0.07:
            distracted_frames += 1
            
    # Calculate rate based on total processed frames
    total_processed = len(all_sampled_frame_ids)
    distraction_rate = round((distracted_frames / total_processed) * 100, 1) if total_processed > 0 else 0

    # 4. FINAL VISIBILITY SCORE (Penalty System)
    size_score = min(avg_size * 3.3, 1.0) * 100 
    base_visibility = size_score if is_image else (size_score * 0.4) + (dur_score * 0.6)
    
    # Apply Penalties for low clarity or high distraction
    clarity_penalty = 0.75 if avg_conf_raw < 0.60 else 1.0
    # Distraction penalty: Reduces score if human elements dominate the frame
    dist_penalty = 1.0 - (distraction_rate / 200) # Max 50% penalty

    visibility_score = round(base_visibility * clarity_penalty * dist_penalty, 1)

    # 5. BRAND TEXT SUMMARY
    words = []
    for d in product_dets:
        if d.get('brand'): words.extend(d['brand'].split())
    unique_words = sorted(list(set([w for w in words if len(w) > 3])))
    brand_summary = ", ".join(unique_words[:12]) if unique_words else "None"

    is_pass = visibility_score >= 60 and (duration_pct >= 30 or is_image)
    verdict_status = "PASS" if is_pass else "FAIL"

    # --- REFINED LLM PROMPT ---
    prompt = (
        f"ACT AS: Senior Visual Auditor for AdVis AI.\n"
        f"METRICS: Visibility {visibility_score}/100, Placement {placement_label}, "
        f"Presence {duration_str}, Distraction {distraction_rate}%.\n"
        f"DETECTED TEXT: {brand_summary}\n\n"
        f"TASK: Provide a report using these EXACT headers on new lines:\n"
        f"1. SIGNAL: [Explain visibility and brand recall impact]\n"
        f"2. NOISE: [List specific OCR errors or visual distractions from {brand_summary}]\n"
        f"3. RECOMMENDATIONS: [Provide 2 technical steps]\n"
        f"Strictly 100 words total."
    )

    try:
        llm_verdict = get_llm_verdict(prompt) 
    except:
        llm_verdict = "LLM Generation failed. Summary metrics available above."

    return {
        "visibility_score": visibility_score,
        "placement": placement_label,
        "duration": duration_str,
        "recognizability": recognizability,
        "avg_confidence": avg_conf_pct,
        "distraction_rate": distraction_rate,
        "brand_text": brand_summary,
        "llm_verdict": llm_verdict 
    }

# ==========================================
# 🚀 MAIN LOOP (UNIVERSAL)
# ==========================================
def analyze_video(input_path, category):
    model_path = MODELS.get(category, DEFAULT_MODEL)
    if not os.path.exists(model_path): model_path = DEFAULT_MODEL
    try: model = YOLO(model_path)
    except: return print(json.dumps({"error": "Model load failed"}))

    # 🕵️ CHECK IF IMAGE OR VIDEO
    ext = os.path.splitext(input_path)[1].lower()
    is_image = ext in ['.jpg', '.jpeg', '.png', '.webp', '.bmp']
    
    audio_text = analyze_audio(input_path)

    base_name = os.path.basename(input_path)
    clean_name = os.path.splitext(base_name)[0]
    
    # ----------------------------------------------------
    # 🖼️ IMAGE MODE
    # ----------------------------------------------------
    if is_image:
        frame = cv2.imread(input_path)
        if frame is None: return print(json.dumps({"error": "Could not read image"}))
        
        height, width = frame.shape[:2]
        fps = 0 # Not applicable
        total_frames = 1
        
        # Analyze the single frame
        ai_frame = preprocess_low_light(frame)
        small = cv2.resize(ai_frame, (640, 360))
        (success, saliencyMap) = saliency.computeSaliency(small)
        
        saliencyMapResized = None
        if success:
            saliencyMap = (saliencyMap * 255).astype("uint8")
            saliencyMapResized = cv2.resize(saliencyMap, (width, height))

        results = model.predict(ai_frame, conf=0.25, verbose=False)
        
        # Process Detection
        all_detections = []
        frame_max_score = 0
        
        for r in results:
            for box in r.boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                conf = float(box.conf[0])
                cls_id = int(box.cls[0])
                label = model.names[cls_id].lower()
                
                is_distraction = label in ['person', 'face', 'human', 'man', 'woman']
                det_type = 'distraction' if is_distraction else 'product'

                area_ratio = calculate_box_area_ratio((x1,y1,x2,y2), width, height)
                center_point = ((x1+x2)/2, (y1+y2)/2)
                
                s_score = 0
                if saliencyMapResized is not None:
                     roi = saliencyMapResized[y1:y2, x1:x2]
                     if roi.size > 0: s_score = np.mean(roi)

                brand = ""
                if det_type == 'product' and conf > 0.40 and (x2-x1) > 50:
                    brand = get_all_text_from_crop(ai_frame[y1:y2, x1:x2])

                all_detections.append({
                    "frame_id": 1,
                    "type": det_type,
                    "confidence": conf,
                    "area_ratio": area_ratio,
                    "center": center_point,
                    "saliency": s_score,
                    "brand": brand
                })
                if det_type == 'product' and s_score > frame_max_score: frame_max_score = s_score
        
        # Create Output Assets
        final_frame = frame.copy()
        if saliencyMapResized is not None:
            heatmap_img = cv2.applyColorMap(saliencyMapResized, cv2.COLORMAP_JET)
            final_frame = cv2.addWeighted(final_frame, 0.6, heatmap_img, 0.4, 0)
        
        # 🎥 SAVE HEATMAP VIDEO -> UPLOADS
        heatmap_video_name = f"{clean_name}_heatmap.mp4"
        heatmap_video_path = os.path.join(VIDEO_OUT_DIR, heatmap_video_name)
        
        try:
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            out = cv2.VideoWriter(heatmap_video_path, fourcc, 1, (width, height)) # 1 FPS
            for _ in range(3): out.write(final_frame) # 3 sec loop
            out.release()
        except: pass

        # 📸 SAVE PEAK FRAME -> HEATMAPS
        peak_name = f"peak_{clean_name}.jpg"
        cv2.imwrite(os.path.join(HEATMAP_DIR, peak_name), final_frame)
        
        heatmap_url = f"{SERVER_URL}/public/uploads/{heatmap_video_name}"
        peak_url = f"{SERVER_URL}/public/heatmaps/{peak_name}"
        
        metrics = calculate_final_metrics(all_detections, 1, 1, category, audio_text, width, height, True)
        
        print(json.dumps({
            "meta": {"fps": 0},
            "heatmap_url": heatmap_url,
            "peak_frame": peak_url,
            "summary": metrics
        }))
        return

    # ----------------------------------------------------
    # 🎥 VIDEO MODE
    # ----------------------------------------------------
    cap = cv2.VideoCapture(input_path)
    if not cap.isOpened(): return print(json.dumps({"error": "Video load failed"}))

    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    heatmap_name = f"{clean_name}_heatmap.mp4"
    # 🎥 SAVE HEATMAP VIDEO -> UPLOADS
    heatmap_path = os.path.join(VIDEO_OUT_DIR, heatmap_name)

    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(heatmap_path, fourcc, fps, (width, height))

    all_detections = [] 
    frame_count = 0
    peak_score = -1
    peak_url = None

    last_saliency_map = None
    save_peak_this_frame = False

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret: break
        frame_count += 1
        
        should_detect = (frame_count == 1) or (frame_count % 5 == 0)
        save_peak_this_frame = False

        if should_detect:
            ai_frame = preprocess_low_light(frame)
            small = cv2.resize(ai_frame, (640, 360))
            (success, saliencyMap) = saliency.computeSaliency(small)
            if success:
                saliencyMap = (saliencyMap * 255).astype("uint8")
                last_saliency_map = cv2.resize(saliencyMap, (width, height))
            
            results = model.predict(ai_frame, conf=0.25, verbose=False)
            frame_max_score = 0
            
            for r in results:
                for box in r.boxes:
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    conf = float(box.conf[0])
                    cls_id = int(box.cls[0])
                    label = model.names[cls_id].lower()
                    
                    is_distraction = label in ['person', 'face', 'human', 'man', 'woman']
                    det_type = 'distraction' if is_distraction else 'product'

                    area_ratio = calculate_box_area_ratio((x1,y1,x2,y2), width, height)
                    center_point = ((x1+x2)/2, (y1+y2)/2)
                    
                    s_score = 0
                    if last_saliency_map is not None:
                         roi = last_saliency_map[y1:y2, x1:x2]
                         if roi.size > 0: s_score = np.mean(roi)

                    brand = ""
                    if det_type == 'product' and conf > 0.40 and (x2-x1) > 50:
                        brand = get_all_text_from_crop(ai_frame[y1:y2, x1:x2])

                    all_detections.append({
                        "frame_id": frame_count,
                        "type": det_type,
                        "confidence": conf,
                        "area_ratio": area_ratio,
                        "center": center_point,
                        "saliency": s_score,
                        "brand": brand
                    })
                    
                    if det_type == 'product' and s_score > frame_max_score: 
                        frame_max_score = s_score
            
            if frame_max_score > peak_score:
                peak_score = frame_max_score
                save_peak_this_frame = True

        final_frame = frame.copy()
        if last_saliency_map is not None:
            heatmap_img = cv2.applyColorMap(last_saliency_map, cv2.COLORMAP_JET)
            final_frame = cv2.addWeighted(final_frame, 0.6, heatmap_img, 0.4, 0)
        
        # 📸 SAVE PEAK FRAME -> HEATMAPS
        if save_peak_this_frame:
            peak_name = f"peak_{clean_name}.jpg"
            cv2.imwrite(os.path.join(HEATMAP_DIR, peak_name), final_frame)
            peak_url = f"{SERVER_URL}/public/heatmaps/{peak_name}"

        out.write(final_frame)

    cap.release()
    out.release()

    heatmap_url = f"{SERVER_URL}/public/uploads/{heatmap_name}"
    metrics = calculate_final_metrics(all_detections, total_frames, fps, category, audio_text, width, height, False)
    
    output = {
        "meta": {"fps": fps},
        "heatmap_url": heatmap_url,
        "peak_frame": peak_url,
        "summary": metrics
    }   
    print(json.dumps(output))

if __name__ == "__main__":
    if len(sys.argv) > 2: analyze_video(sys.argv[1], sys.argv[2])
    else: print(json.dumps({"error": "Missing Args"}))