# 👁️ AdVis.ai - Deep Learning Based Visibility Analysis for Food and Cosmetic Advertisements

![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=flat-square&logo=nodedotjs)
![Python](https://img.shields.io/badge/AI%20Engine-Python%203.10-3776AB?style=flat-square&logo=python)
![YOLOv8](https://img.shields.io/badge/Vision-YOLOv8%20%2B%20OpenCV-FF5A5F?style=flat-square)
![Gemini](https://img.shields.io/badge/LLM-Gemini%201.5%20Flash-8E75B2?style=flat-square)

AdVis.ai is a full-stack, multi-modal AI platform designed to objectively measure how human audiences perceive video and image advertisements. It calculates product visibility, flags visual distractions, and provides LLM-powered strategic verdicts to optimize marketing ROI.

## 🌟 Key Features

- **🧠 Multi-Modal AI Analysis**: Combines Computer Vision (YOLOv8 + OpenCV), Text Extraction (PaddleOCR), and Audio Transcription (OpenAI Whisper).
- **🔥 Spectral Residual Saliency**: Generates predictive heatmaps showing exactly where the human eye will naturally focus within the first 3 seconds.
- **🎯 Distraction Scoring**: Algorithmically compares the target product's visibility against background distractions (e.g., human faces, secondary objects).
- **💬 LLM Strategic Consultant**: Uses Gemini 1.5 Flash to translate raw pixel data into a human-readable "Pass/Fail" verdict and actionable marketing advice.
- **📊 Interactive Dashboard**: Modern React/Vite frontend with dynamic Bento-grid charts, PDF report exports, and an Admin control panel.

📸 **Screenshots** <p align="center">
  *(Add your image links here)*
</p>

---

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
