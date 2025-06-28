from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
from typing import Any, Text, Dict, List
import requests
import re
import logging

logger = logging.getLogger(__name__)

class ActionExtractSymptoms(Action):
    def name(self) -> Text:
        return "action_extract_symptoms"

    async def run(self, dispatcher: CollectingDispatcher,
                  tracker: Tracker,
                  domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        message = tracker.latest_message.get('text', '').lower()
        symptoms = []

        try:
            response = requests.get('http://localhost:8000/symptoms', timeout=5)
            known_symptoms = [s.strip().lower() for s in response.json().get('symptoms', [])]
        except requests.exceptions.RequestException as e:
            logger.error(f"⚠️ Symptom API error: {str(e)}")
            known_symptoms = []

        # Direct match
        symptoms = [symptom for symptom in known_symptoms
                    if re.search(rf'\b{re.escape(symptom)}\b', message)]

        # Fallback pattern match
        if not symptoms:
            patterns = [
                r"(?:i have|i am having|i'm experiencing|i feel|suffering from)\s+([a-zA-Z\s,]+)",
                r"(?:my|the)\s+([a-zA-Z\s]+)\s+(?:hurts|aches|is in pain|has discomfort)"
            ]

            for pattern in patterns:
                matches = re.findall(pattern, message)
                for match in matches:
                    candidates = re.split(r'[,.]?\s*(?:and|or)?\s+', match)
                    symptoms.extend([s.strip() for s in candidates if s.strip() in known_symptoms])

        symptoms = list(set(symptoms))

        if symptoms:
            dispatcher.utter_message(text=f"✅ Recorded symptoms: {', '.join(symptoms)}")
            return [SlotSet("symptoms", symptoms)]

        dispatcher.utter_message(text="⚠️ I couldn't identify any symptoms. Please try describing them differently.")
        return [SlotSet("symptoms", None)]


class ActionPredictDisease(Action):
    def name(self) -> Text:
        return "action_predict_disease"

    async def run(self, dispatcher: CollectingDispatcher,
                  tracker: Tracker,
                  domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        symptoms = tracker.get_slot("symptoms") or []

        if not symptoms:
            dispatcher.utter_message(text="❗ Please tell me your symptoms first.")
            return []

        try:
            # 🔍 Optional: Check FastAPI status
            health_response = requests.get("http://localhost:8000/health", timeout=3)
            if health_response.status_code != 200:
                raise ConnectionError("FastAPI service is unhealthy.")

            logger.info(f"Sending symptoms to FastAPI: {symptoms}")
            response = requests.post(
                "http://localhost:8000/predict",
                json={"symptoms": symptoms},
                timeout=20
            )

            logger.info(f"FastAPI Response [{response.status_code}]: {response.text}")
            response.raise_for_status()
            data = response.json()

            if "error" in data:
                raise ValueError(data["error"])

            disease = data.get("disease")
            confidence = data.get("confidence")
            valid_symptoms = data.get("valid_symptoms", [])

            if not disease or confidence is None:
                dispatcher.utter_message("⚠️ Could not determine the condition. Please try with more symptoms.")
                return []

            message = (
                f"🩺 *Diagnosis Result:*\n\n"
                f"🧬 *Condition:* {disease}\n"
                f"📊 *Confidence:* {confidence*100:.1f}%\n"
                f"📋 *Matched Symptoms:* {', '.join(valid_symptoms)}"
            )

            dispatcher.utter_message(text=message)
            return [SlotSet("symptoms", [])]

        except requests.exceptions.ConnectionError:
            logger.error("❌ Connection to FastAPI prediction service failed")
            dispatcher.utter_message(text="🚫 The medical service is currently unavailable. Please try again later.")
        except requests.exceptions.Timeout:
            logger.error("⏰ Prediction request timed out")
            dispatcher.utter_message(text="⏳ The diagnosis took too long. Try again in a few moments.")
        except Exception as e:
            logger.error(f"⚠️ Prediction error: {str(e)}")
            dispatcher.utter_message(text="⚠️ Could not complete diagnosis. Please try describing your symptoms again.")

        return []
