import cv2
import os
import numpy as np  # <--- This was missing
from paddleocr import PaddleOCR

# Initialize OCR
print("[INFO] Initializing PaddleOCR...")
# use_angle_cls=True is crucial for rotated text on packs
ocr = PaddleOCR(use_angle_cls=True, lang='en')

# Create a dummy white image
print("[INFO] Generating test image...")
img = 255 * np.ones((100, 300, 3), dtype=np.uint8)

# Write "LAYS 50% OFF" on it in Black text
cv2.putText(img, 'LAYS 50% OFF', (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 0), 2)
cv2.imwrite("test_text.jpg", img)

print("[INFO] Running OCR on generated test image...")
result = ocr.ocr("test_text.jpg")

print("\n" + "="*30)
print("OCR RESULT:")
if result and result[0]:
    for line in result[0]:
        print(f"Text: {line[1][0]} | Confidence: {line[1][1]}")
else:
    print("❌ No text detected.")
print("="*30 + "\n")

# Clean up
if os.path.exists("test_text.jpg"):
    os.remove("test_text.jpg")