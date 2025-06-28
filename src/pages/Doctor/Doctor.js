import React, { useState, useEffect } from "react";

function Doctor() {
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!window.google) {
      setError("Google Maps API failed to load.");
      setLoading(false);
      return;
    }

    // Get User's Location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchDoctors(latitude, longitude);
        },
        (error) => {
          setError("Location access denied. Enable location to find doctors.");
          setLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
      setLoading(false);
    }
  }, []);

  const fetchDoctors = (lat, lng) => {
    const service = new window.google.maps.places.PlacesService(document.createElement("div"));
    const request = {
      location: new window.google.maps.LatLng(lat, lng),
      radius: 5000, // Search within 5km radius
      type: "doctor",
    };

    service.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        setDoctors(results);
      } else {
        setError(`Failed to fetch doctors: ${status}`);
      }
      setLoading(false);
    });
  };

  return (
    <div className="doctor-container">
      <h1>Nearby Doctors</h1>
      {error && <p className="error">{error}</p>}
      {loading && <p>Loading...</p>}

      <div className="doctor-list">
        {doctors.length > 0 ? (
          doctors.map((doctor, index) => (
            <div key={index} className="doctor-card">
              <h3>{doctor.name || "Unknown Doctor"}</h3>
              <p>{doctor.vicinity}</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${doctor.geometry.location.lat},${doctor.geometry.location.lng}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on Google Maps
              </a>
            </div>
          ))
        ) : (
          !loading && <p>No doctors found in your area.</p>
        )}
      </div>
    </div>
  );
}

export default Doctor;
