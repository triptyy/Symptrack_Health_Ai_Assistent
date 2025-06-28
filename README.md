# SympTrack: Intelligent AI Health Assistant

## Overview
SympTrack is an intelligent healthcare web platform that uses AI to analyze user symptoms (via text or voice), predict potential diseases (with description, type, and fatality rate), and recommend nearby specialized doctors based on user location.

It bridges the gap between early symptom awareness and timely medical guidance through an interactive, easy-to-use interface.

## Features
- Symptom extraction using a custom Rasa NLP model.
- Disease prediction using an Gaussian Naive byes model in backend.
- Disease description, fatality rate, and classification details.
- Nearby doctor recommendations via a location-based API.
- Firebase authentication and secure medical history storage.
- Voice-based input & TTS responses.
- Admin and developer-friendly architecture, fully documented.

## Requirements
Python dependencies listed in requirements.txt (FastAPI, scikit-learn, joblib, pandas, numpy, etc.)
Node.js dependencies listed in package.json for doctor recommendation server.

## Project Architecture
```
Frontend (React.js + Rasa integration)
    |
    ↓
Backend (FastAPI + Disease Prediction Model)
    |
    ↓
Doctor Recommendation Service (JS server)

```
## Tech Stack
- Frontend: React.js, CSS, Web Speech API
- NLP & Chatbot: Rasa (Custom actions, NLU, stories, rules)
- Backend API: FastAPI, Python, Gaussian Naive byes model
- Doctor API: google Places Api
- Database & Auth: Firebase
- Deployment: Local & container-ready


## Backend
🔬 FastAPI Service
File: main.py
Hosts /predict endpoint to receive symptoms and return predicted disease, description, fatality rate, and type.
Integrates with: Gaussian Naive byes model for disease prediction model (model.pkl)
Label encoder for disease labels (label_encoder.pkl)
Disease description CSVs
Handles requests from frontend and Rasa chatbot.

## Doctor Recommendation
File: jsserver.js
Node.js Express service running on port 15000.
Receives coordinates and predicted disease type, then returns nearby doctors.
Can be extended with real data or third-party APIs.

## Rasa Model
### Key Files
domain.yml
Defines intents, entities (symptoms), slots, responses, and custom actions.
nlu.yml
Contains training examples for intents like describing symptoms, asking for help, etc.
rules.yml
Defines rule-based flows (e.g., fallback, restart, confirm symptoms).
stories.yml
Conversation paths that guide how the bot interacts and collects symptoms.
actions.py
Custom action to extract symptoms (action_extract_symptoms)
Custom action to call FastAPI predict endpoint and return disease diagnosis (action_predict_disease)

## FrontendFolders
public/
Static assets, images, voice icons, etc.
src/
Contains main React code, pages, components, hooks, and Rasa chatbot integration.

## FLOW
- User logs in via Firebase Auth.
- User describes symptoms in chatbot or form.
- Frontend calls FastAPI /predict or interacts with Rasa chatbot directly.
- Backend returns disease prediction, doctor recommendations, and extra details.
- User sees output and can contact nearby doctors.

## Running the Project
 - pip install -r requirements.txt
 - uvicorn main:app --reload
 - node jsserver.js
 - npm start  

 
