import cv2
import os
import subprocess
import shutil
import sys
import numpy as np

# ==========================================
# 🔧 SETUP FFMPG (Matches processor.py)
# ==========================================
def setup_ffmpeg():
    # ⚠️ Ensure this path matches the one in processor.py
    folder = r"D:\Visibility-Analysis-Project\venv\Lib\site-packages\imageio_ffmpeg\binaries"
    long_name = "ffmpeg-win-x86_64-v7.1.exe"
    target_name = "ffmpeg.exe"
    full_target_path = os.path.join(folder, target_name)
    
    # If the renamed 'ffmpeg.exe' doesn't exist, create it from the long name
    if not os.path.exists(full_target_path):
        src = os.path.join(folder, long_name)
        if os.path.exists(src): 
            try:
                shutil.copy(src, full_target_path)
            except: pass
            
    return full_target_path

FFMPEG_EXE = setup_ffmpeg()
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# 📂 PATH CONFIG: Save to ai_engine/public/fixes
OUTPUT_DIR = os.path.join(BASE_DIR, "public", "fixes")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ==========================================
# 🎨 THE DESIGNER ENGINE
# ==========================================
def draw_styled_text(frame, text):
    """
    Draws a semi-transparent 'Lower Third' banner with text.
    """
    h, w = frame.shape[:2]
    
    # Text Settings
    font = cv2.FONT_HERSHEY_SIMPLEX
    scale = 1.5 if w > 1000 else 0.8
    thickness = 3 if w > 1000 else 2
    color_text = (255, 255, 255) # White text
    color_bg = (0, 0, 200)       # Dark Red background
    
    # Calculate Size
    (text_w, text_h), baseline = cv2.getTextSize(text, font, scale, thickness)
    
    # Position: Bottom Center (15% from bottom)
    x = int((w - text_w) / 2)
    y = int(h - (h * 0.15))
    
    # Draw Background Box
    overlay = frame.copy()
    box_pad = 20
    cv2.rectangle(overlay, 
                  (x - box_pad, y - text_h - box_pad), 
                  (x + text_w + box_pad, y + box_pad), 
                  color_bg, -1)
    
    # Blend Background (Opacity 0.7)
    cv2.addWeighted(overlay, 0.7, frame, 0.3, 0, frame)
    
    # Draw Text
    cv2.putText(frame, text, (x, y), font, scale, color_text, thickness, cv2.LINE_AA)
    
    return frame

# ==========================================
# 🛠️ THE FIXER MAIN LOGIC
# ==========================================
def generate_text_overlay_fix(video_path, text_to_add):
    if not os.path.exists(video_path): 
        print(f"JSON_RESULT:{{\"status\":\"error\", \"message\":\"Video file not found\"}}")
        return

    # 1. Paths
    video_filename = os.path.basename(video_path)
    temp_video = os.path.join(OUTPUT_DIR, "temp_" + video_filename)
    final_video = os.path.join(OUTPUT_DIR, "FIXED_" + video_filename)

    # 2. Read Video
    cap = cv2.VideoCapture(video_path)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    
    # 3. Write Temp Video (No Audio yet)
    # using 'mp4v' codec as it is widely supported for opencv writing
    out = cv2.VideoWriter(temp_video, cv2.VideoWriter_fourcc(*'mp4v'), fps, (width, height))

    frame_count = 0
    duration_frames = int(fps * 5) # Apply text for first 5 seconds

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret: break
        
        # Apply visual fix only for the first 5 seconds
        if frame_count < duration_frames:
            frame = draw_styled_text(frame, text_to_add)
        
        out.write(frame)
        frame_count += 1

    cap.release()
    out.release()

    # 4. Merge Audio using FFmpeg
    # We take the video from the Temp file [0] and Audio from Original file [1]
    if os.path.exists(final_video): os.remove(final_video)
    
    command = [
        FFMPEG_EXE, 
        "-i", temp_video, 
        "-i", video_path, 
        "-c:v", "copy",   # Copy the video stream (fast)
        "-c:a", "aac",    # Encode audio for web compatibility
        "-map", "0:v:0", 
        "-map", "1:a:0", 
        "-y", "-loglevel", "quiet", 
        final_video
    ]
    
    try:
        subprocess.run(command, check=True)
        # 5. Output JSON for Node.js to read
        # Using forward slashes for web URL compatibility
        relative_path = f"/public/fixes/{os.path.basename(final_video)}"
        print(f"JSON_RESULT:{{\"status\":\"success\", \"file\":\"{relative_path}\"}}")
        
        # Cleanup
        if os.path.exists(temp_video): os.remove(temp_video)
        
    except Exception as e:
        print(f"JSON_RESULT:{{\"status\":\"error\", \"message\":\"{str(e)}\"}}")

if __name__ == "__main__":
    # Expecting arguments: python fixer.py "path/to/video.mp4" "Text To Add"
    if len(sys.argv) > 2:
        generate_text_overlay_fix(sys.argv[1], sys.argv[2])
    else:
        print("JSON_RESULT:{{\"status\":\"error\", \"message\":\"Missing arguments\"}}")