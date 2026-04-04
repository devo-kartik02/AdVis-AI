# 👁️ AdVis AI - Deep Learning Based Visibility Analysis for Food and Cosmetic Advertisements

![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=flat-square&logo=nodedotjs)
![Python](https://img.shields.io/badge/AI%20Engine-Python%203.10-3776AB?style=flat-square&logo=python)
![YOLOv8](https://img.shields.io/badge/Vision-YOLOv8%20%2B%20OpenCV-FF5A5F?style=flat-square)

AdVis AI is a full-stack, multi-modal AI platform designed to objectively measure how human audiences perceive video and image advertisements. It calculates product visibility, flags visual distractions, and provides LLM-powered strategic verdicts to optimize marketing ROI.

## 🌟 Key Features

- **🧠 Multi-Modal AI Analysis**: Combines Computer Vision (YOLOv8 + OpenCV), Text Extraction (PaddleOCR), and Audio Transcription (OpenAI Whisper).
- **🔥 Spectral Residual Saliency**: Generates predictive heatmaps showing exactly where the human eye will naturally focus within the first 3 seconds.
- **🎯 Distraction Scoring**: Algorithmically compares the target product's visibility against background distractions (e.g., human faces, secondary objects).
- **💬 LLM Strategic Consultant**: Uses Gemini 1.5 Flash to translate raw pixel data into a human-readable "Pass/Fail" verdict and actionable marketing advice.
- **📊 Interactive Dashboard**: Modern React/Vite frontend with dynamic Bento-grid charts, PDF report exports, and an Admin control panel.

📸 **Screenshots** <p align="center">
  <img width="1900" height="927" alt="S1" src="https://github.com/user-attachments/assets/411eebea-049d-4aba-bd4a-baa011059349" />
  <img width="1903" height="928" alt="Screenshot 2026-03-24 141530" src="https://github.com/user-attachments/assets/31508967-fe41-479d-975d-18ece55471d4" />
  <img width="1900" height="926" alt="SS3" src="https://github.com/user-attachments/assets/c6c25a24-cab6-4e6f-b367-b692a22f9f99" />
<img width="1898" height="927" alt="SS4" src="https://github.com/user-attachments/assets/543d15b3-9b88-401c-852b-3a8cd7adcd45" />
<img width="1901" height="926" alt="SS5" src="https://github.com/user-attachments/assets/81cd1cb4-3357-4546-b5a7-821cf5432d53" />
<img width="1897" height="927" alt="SS6" src="https://github.com/user-attachments/assets/b8e78010-c9d2-4803-ab63-0b4487855973" />
<img width="1900" height="928" alt="SS8" src="https://github.com/user-attachments/assets/4d14b843-4cb9-4b9c-bbdd-c016f98ac9f9" />
<img width="1905" height="928" alt="SS9" src="https://github.com/user-attachments/assets/2b987fbe-fba1-465d-bca8-cc35cfa42a9d" />


</p>




## 🏗️ System Architecture

AdVis.ai is built on a highly decoupled, three-tier micro-services architecture:

### 1. AI Processing Engine (Python)
- **`processor.py`**: The core execution script orchestrating the AI pipeline.
- **Vision Models**: Custom-trained YOLOv8 weights (`food_best.pt`, `cosmetic_best.pt`) optimized for retail and consumer goods.
- **Heuristics**: Custom math engine calculating Area Ratios, Contrast Penalties, and Blur Variance.

### 2. API Orchestrator (Node.js + MongoDB)
- **`server.js`**: Express server handling file uploads (Multer), route protection, and database writes.
- **Security**: JWT-based authentication with strict Role-Based Access Control (`isAdmin` flags).

### 3. Client Application (React + Vite)
- **State Management**: Custom Context API (`AuthContext.tsx`) for global user and token state.
- **Styling**: Tailwind CSS for a highly responsive, dark-mode-first aesthetic.

---

## 🚀 Quick Start

Launch the entire ecosystem with a single click using the provided batch script.

```bash
# Clone the repository
git clone [https://github.com/devo-kartik02/AdVis-AI.git](https://github.com/devo-kartik02/AdVis-AI.git)
cd AdVis-AI

# Run the complete system
start.bat
