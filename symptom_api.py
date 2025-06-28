from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import joblib
import numpy as np
import pandas as pd
import csv
import httpx
from typing import List, Optional

app = FastAPI()

import sys, joblib, sklearn, numpy
print("Python:", sys.version)
print("joblib:", joblib.__version__)
print("scikit-learn:", sklearn.__version__)
print("numpy:", numpy.__version__)

    
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


xgb_model = joblib.load(r"C:\Users\tript\OneDrive\Desktop\Project\symptrack\pklmodels\model.pkl")
label_binarizer = joblib.load(r"C:\Users\tript\OneDrive\Desktop\Project\symptrack\pklmodels\label_encoder.pkl")


disease_descriptions_df = pd.read_csv(
    r"C:\Users\tript\OneDrive\Desktop\Project\symptrack\disease_descriptions.csv",
    quoting=csv.QUOTE_NONNUMERIC,
    on_bad_lines='warn'
)
disease_fatality_rates_df = pd.read_csv(
    r"C:\Users\tript\OneDrive\Desktop\Project\symptrack\disease_fatality_rates.csv",
    quoting=csv.QUOTE_NONNUMERIC,
    on_bad_lines='warn'
)
classified_diseases_df = pd.read_csv(
    r"C:\Users\tript\OneDrive\Desktop\Project\symptrack\classified_diseases.csv",
    quoting=csv.QUOTE_NONNUMERIC,
    on_bad_lines='warn'
)


disease_descriptions_df['Disease'] = disease_descriptions_df['Disease'].str.lower().str.strip()
disease_fatality_rates_df['Disease'] = disease_fatality_rates_df['Disease'].str.lower().str.strip()
classified_diseases_df['disease'] = classified_diseases_df['disease'].str.lower().str.strip()

disease_descriptions_df.set_index('Disease', inplace=True)
disease_fatality_rates_df.set_index('Disease', inplace=True)
classified_diseases_df.set_index('disease', inplace=True)


SYMPTOM_LIST = [
    "anxiety and nervousness", "depression", "shortness of breath", "depressive or psychotic symptoms",
    "sharp chest pain", "dizziness", "insomnia", "abnormal involuntary movements", "chest tightness",
    "palpitations", "irregular heartbeat", "breathing fast", "hoarse voice", "sore throat",
    "difficulty speaking", "cough", "nasal congestion", "throat swelling", "diminished hearing",
    "lump in throat", "throat feels tight", "difficulty in swallowing", "skin swelling",
    "retention of urine", "groin mass", "leg pain", "hip pain", "suprapubic pain", "blood in stool",
    "lack of growth", "emotional symptoms", "elbow weakness", "back weakness",
    "symptoms of the scrotum and testes", "swelling of scrotum", "pain in testicles", "flatulence",
    "pus draining from ear", "jaundice", "mass in scrotum", "white discharge from eye",
    "irritable infant", "abusing alcohol", "fainting", "hostile behavior", "drug abuse",
    "sharp abdominal pain", "feeling ill", "vomiting", "headache", "nausea", "diarrhea",
    "vaginal itching", "vaginal dryness", "painful urination", "involuntary urination",
    "pain during intercourse", "frequent urination", "lower abdominal pain", "vaginal discharge",
    "blood in urine", "hot flashes", "intermenstrual bleeding", "hand or finger pain", "wrist pain",
    "hand or finger swelling", "arm pain", "wrist swelling", "arm stiffness or tightness",
    "arm swelling", "hand or finger stiffness or tightness", "wrist stiffness or tightness",
    "lip swelling", "toothache", "abnormal appearing skin", "skin lesion", "acne or pimples",
    "dry lips", "facial pain", "mouth ulcer", "skin growth", "eye deviation", "diminished vision",
    "double vision", "cross-eyed", "symptoms of eye", "pain in eye", "eye moves abnormally",
    "abnormal movement of eyelid", "foreign body sensation in eye", "irregular appearing scalp",
    "swollen lymph nodes", "back pain", "neck pain", "low back pain", "pain of the anus",
    "pain during pregnancy", "pelvic pain", "impotence", "infant spitting up", "vomiting blood",
    "regurgitation", "burning abdominal pain", "restlessness", "symptoms of infants", "wheezing",
    "peripheral edema", "neck mass", "ear pain", "jaw swelling", "mouth dryness", "neck swelling",
    "knee pain", "foot or toe pain", "bowlegged or knock-kneed", "ankle pain", "bones are painful",
    "knee weakness", "elbow pain", "knee swelling", "skin moles", "knee lump or mass",
    "weight gain", "problems with movement", "knee stiffness or tightness", "leg swelling",
    "foot or toe swelling", "heartburn", "smoking problems", "muscle pain", "infant feeding problem",
    "recent weight loss", "problems with shape or size of breast", "difficulty eating",
    "scanty menstrual flow", "vaginal pain", "vaginal redness", "vulvar irritation", "weakness",
    "decreased heart rate", "increased heart rate", "bleeding or discharge from nipple",
    "ringing in ear", "plugged feeling in ear", "itchy ear(s)", "frontal headache", "fluid in ear",
    "neck stiffness or tightness", "spots or clouds in vision", "eye redness", "lacrimation",
    "itchiness of eye", "blindness", "eye burns or stings", "itchy eyelid", "feeling cold",
    "decreased appetite", "excessive appetite", "excessive anger", "loss of sensation",
    "focal weakness", "slurring words", "symptoms of the face", "disturbance of memory",
    "paresthesia", "side pain", "fever", "shoulder pain", "shoulder stiffness or tightness",
    "shoulder weakness", "shoulder swelling", "tongue lesions", "leg cramps or spasms",
    "ache all over", "lower body pain", "problems during pregnancy",
    "spotting or bleeding during pregnancy", "cramps and spasms", "upper abdominal pain",
    "stomach bloating", "changes in stool appearance", "unusual color or odor to urine",
    "kidney mass", "swollen abdomen", "symptoms of prostate", "leg stiffness or tightness",
    "difficulty breathing", "rib pain", "joint pain", "muscle stiffness or tightness",
    "hand or finger lump or mass", "chills", "groin pain", "fatigue", "abdominal distention",
    "regurgitation.1", "symptoms of the kidneys", "melena", "flushing", "coughing up sputum",
    "seizures", "delusions or hallucinations", "pain or soreness of breast",
    "excessive urination at night", "bleeding from eye", "rectal bleeding", "constipation",
    "temper problems", "coryza", "wrist weakness", "hemoptysis", "lymphedema",
    "skin on leg or foot looks infected", "allergic reaction", "congestion in chest",
    "muscle swelling", "low back weakness", "sleepiness", "apnea", "abnormal breathing sounds",
    "excessive growth", "blood clots during menstrual periods", "absence of menstruation",
    "pulling at ears", "gum pain", "redness in ear", "fluid retention", "flu-like syndrome",
    "sinus congestion", "painful sinuses", "fears and phobias", "recent pregnancy",
    "uterine contractions", "burning chest pain", "back cramps or spasms", "stiffness all over",
    "muscle cramps, contractures, or spasms", "low back cramps or spasms", "back mass or lump",
    "nosebleed", "long menstrual periods", "heavy menstrual flow", "unpredictable menstruation",
    "painful menstruation", "infertility", "frequent menstruation", "sweating", "mass on eyelid",
    "swollen eye", "eyelid swelling", "eyelid lesion or rash", "unwanted hair",
    "symptoms of bladder", "irregular appearing nails", "itching of skin", "hurts to breath",
    "skin dryness, peeling, scaliness, or roughness", "skin on arm or hand looks infected",
    "skin irritation", "itchy scalp", "incontinence of stool", "warts", "bumps on penis",
    "too little hair", "foot or toe lump or mass", "skin rash", "mass or swelling around the anus",
    "ankle swelling", "drainage in throat", "dry or flaky scalp",
    "premenstrual tension or irritability", "feeling hot", "foot or toe stiffness or tightness",
    "pelvic pressure", "elbow swelling", "early or late onset of menopause", "bleeding from ear",
    "hand or finger weakness", "low self-esteem", "itching of the anus", "swollen or red tonsils",
    "irregular belly button", "lip sore", "vulvar sore", "hip stiffness or tightness",
    "mouth pain", "arm weakness", "leg lump or mass", "penis pain", "loss of sex drive",
    "obsessions and compulsions", "antisocial behavior", "neck cramps or spasms",
    "poor circulation", "thirst", "sneezing", "bladder mass", "premature ejaculation",
    "leg weakness", "penis redness", "penile discharge", "shoulder lump or mass", "cloudy eye",
    "hysterical behavior", "arm lump or mass", "nightmares", "bleeding gums", "pain in gums",
    "bedwetting", "diaper rash", "lump or mass of breast", "vaginal bleeding after menopause",
    "itching of scrotum", "postpartum problems of the breast", "hesitancy", "muscle weakness",
    "throat redness", "joint swelling", "redness in or around nose", "wrinkles on skin",
    "foot or toe weakness", "hand or finger cramps or spasms", "back stiffness or tightness",
    "wrist lump or mass", "skin pain", "low urine output", "sore in nose", "ankle weakness"
]

SYMPTOM_INDEX = {symptom: idx for idx, symptom in enumerate(SYMPTOM_LIST)}
ALL_SYMPTOMS = list(SYMPTOM_INDEX.keys())

class SymptomInput(BaseModel):
    symptoms: List[str]
    latitude: Optional[float] = None
    longitude: Optional[float] = None

@app.get("/symptoms")
async def get_symptoms():
    return {"symptoms": ALL_SYMPTOMS}

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/predict")
async def predict_disease(input: SymptomInput):
    user_symptoms = [s.lower().strip() for s in input.symptoms]
    matched_symptoms = [s for s in user_symptoms if s in SYMPTOM_INDEX]

    if not matched_symptoms:
        return {"error": "No valid symptoms provided."}

    
    input_vector = pd.DataFrame(np.zeros((1, len(SYMPTOM_LIST))), columns=SYMPTOM_LIST)
    for symptom in matched_symptoms:
        input_vector[symptom] = 1

    
    prediction = xgb_model.predict(input_vector)
    probabilities = xgb_model.predict_proba(input_vector)
    predicted_disease = label_binarizer.inverse_transform(prediction)[0]
    confidence_score = float(np.max(probabilities)) if probabilities is not None else None

    
    predicted_disease_lower = predicted_disease.lower().strip()

    
    description = disease_descriptions_df.loc[predicted_disease_lower, 'Description'] if predicted_disease_lower in disease_descriptions_df.index else "Not available"
    fatality_rate = disease_fatality_rates_df.loc[predicted_disease_lower, 'Fatality Rate'] if predicted_disease_lower in disease_fatality_rates_df.index else "Not available"
    disease_type = classified_diseases_df.loc[predicted_disease_lower, 'Predicted Categories'] if predicted_disease_lower in classified_diseases_df.index else "Not available"

    
    doctors = []
    doctors_error = None
    if input.latitude is not None and input.longitude is not None:
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    "http://localhost:15000/find-doctors",
                    json={"latitude": input.latitude, "longitude": input.longitude, "disease": disease_type}
                )
                response.raise_for_status()
                doctors = response.json()
            except httpx.HTTPStatusError as e:
                doctors_error = f"Failed to fetch doctors: {e.response.status_code} - {e.response.text}"
            except httpx.RequestError as e:
                doctors_error = f"Failed to fetch doctors: {str(e)}"

   
    response = {
        "disease": predicted_disease,
        "confidence": confidence_score,
        "valid_symptoms": matched_symptoms,
        "description": description,
        "fatality_rate": fatality_rate,
        "disease_type": disease_type,
        "doctors": doctors,
    }
    if doctors_error:
        response["doctors_error"] = doctors_error

    return response
