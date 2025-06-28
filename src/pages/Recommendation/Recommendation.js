
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const PORT = 15000;

app.use(cors({ origin: ['http://localhost:8000', 'http://localhost:3000'] })); // Allow FastAPI and React
app.use(express.json());

const diseaseToSpecialist = {
    "musculoskeletal diseases": "orthopedic surgeon",
    "cardiovascular diseases": "cardiologist",
    "dermatological diseases": "dermatologist",
    "hematological diseases": "hematologist",
    "respiratory diseases": "pulmonologist",
    "gastrointestinal diseases": "gastroenterologist",
    "endocrine diseases": "endocrinologist",
    "neurological diseases": "neurologist",
    "renal and urological diseases": "nephrologist",
    "infectious diseases": "infectious disease specialist",
    "mental health disorders": "psychiatrist",
    "ophthalmological diseases": "ophthalmologist",
    "otolaryngological diseases": "otolaryngologist",
    "immunological diseases": "immunologist",
    "genetic diseases": "medical geneticist",
    "gynecological diseases": "gynecologist",
    "dental diseases": "dentist",
    "oncological diseases": "oncologist",
    "toxicological/environmental diseases": "toxicologist",
    "other": "general practitioner"
};

const apiKey = 'AIzaSyD-ZKUKNZLIVeNFZppSTJ9D8_x7Nq_G2JY'; // Replace with your valid Google Places API key

app.post('/find-doctors', async (req, res) => {
    const { latitude, longitude, disease } = req.body;
    console.log(`📡 Received request for doctors near (${latitude}, ${longitude}) for disease: ${disease}`);

    const specialist = diseaseToSpecialist[disease.toLowerCase()];
    if (!specialist) {
        console.log('❗ Specialist not found');
        return res.status(400).json({ error: 'Specialist not found for given disease' });
    }

    const url = 'https://places.googleapis.com/v1/places:searchText';
    const payload = {
        textQuery: specialist,
        locationBias: {
            circle: {
                center: { latitude, longitude },
                radius: 10000
            }
        }
    };
    const headers = {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.displayName.text,places.formattedAddress,places.rating'
    };

    try {
        const response = await axios.post(url, payload, { headers });
        const doctors = (response.data.places || []).map(place => ({
            name: place.displayName?.text || 'Unknown',
            address: place.formattedAddress || 'No address available',
            rating: place.rating || 'N/A'
        }));
        console.log(`✅ Fetched ${doctors.length} doctors for specialist: ${specialist}`);
        res.json(doctors);
    } catch (error) {
        console.error('❌ Error fetching data from new Places API');
        if (error.response) {
            console.error('🔍 Status Code:', error.response.status);
            console.error('🔍 Error Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('🔍 Error Message:', error.message);
        }
        res.status(500).json({ error: 'Error fetching doctor data' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
