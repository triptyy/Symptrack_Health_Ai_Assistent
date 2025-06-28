const fetchDoctors = async (latitude, longitude, disease) => {
    try {
        const response = await fetch('http://localhost:15000/find-doctors', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ latitude, longitude, disease })
        });

        if (response.ok) {
            const doctors = await response.json();
            console.log("✅ Backend connection successful. Doctors received:");
            console.table(doctors);
        } else {
            const errorData = await response.json();
            console.error('❌ Backend responded with error:', errorData);
        }
    } catch (error) {
        console.error('❌ Error fetching from backend:', error);
    }
};

const getLocationAndFindDoctors = () => {
    const disease = prompt("Enter your disease (e.g., heart disease):");

    if (!disease) {
        alert("Please enter a disease.");
        return;
    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                console.log(`📍 User's location: (${latitude}, ${longitude})`);
                fetchDoctors(latitude, longitude, disease);
            },
            (error) => {
                console.error('❌ Error getting location:', error);
                alert('Unable to access your location.');
            }
        );
    } else {
        alert("Geolocation is not supported by this browser.");
    }
};