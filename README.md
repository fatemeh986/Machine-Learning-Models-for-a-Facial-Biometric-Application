# Facial Recognition App

A Dockerized Django + React application for face verification and identification using a custom CNN, MediaPipe, FER, and DeepFace.

## 🛠️ Tech Stack

- **Backend:** Django REST Framework, Uvicorn, SQLite (dev), TensorFlow, OpenCV, MediaPipe, FER, DeepFace  
- **Frontend:** React + Vite, SCSS  
- **Containerization:** Docker & Docker Compose
- **Evaluation Metrics:** False Acceptance Rate (FAR), False Rejection Rate (FRR), and Receiver Operating Characteristic (ROC) curves for face verification

Identification accuracy, confusion matrices, and Cumulative Match Characteristic (CMC) curves for face identification


## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose installed  
- (Optional) Git  

### Local Dev
1. Clone the repo  
   ```bash
   git clone git@github.com:<you>/<repo>.git