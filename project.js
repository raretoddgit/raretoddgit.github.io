async function getUserLocation() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

async function fetchPurpleAirData(lat, lon) {
  const response = await fetch(`https://api.purpleair.com/v1/sensors?fields=name,location_type,latitude,longitude,pm2.5,humidity&location_type=0&max_age=3600&nwlng=${lon - 0.1}&nwlat=${lat + 0.1}&selng=${lon + 0.1}&selat=${lat - 0.1}`, {
    headers: {
      "X-API-Key": "YOUR_PURPLEAIR_API_KEY"
    }
  });

  const data = await response.json();
  const closest = data.data[0];
  return closest;
}

function interpretPM(pm25) {
  if (pm25 < 12) return { status: "Good", class: "aqi-good", message: "clear and calm" };
  if (pm25 < 35.5) return { status: "Moderate", class: "aqi-moderate", message: "a little dusty" };
  if (pm25 < 55.5) return { status: "Unhealthy", class: "aqi-unhealthy", message: "hazy and heavy" };
  return { status: "Hazardous", class: "aqi-hazardous", message: "thick and toxic" };
}

async function applyAirMood() {
  try {
    const loc = await getUserLocation();
    const data = await fetchPurpleAirData(loc.coords.latitude, loc.coords.longitude);
    const pm25 = data[6];
    const mood = interpretPM(pm25);
    document.body.className = mood.class;
    document.getElementById("air-status").textContent = `The air here is ${mood.message}.`;
  } catch (err) {
    console.error("Could not load air data", err);
    document.getElementById("air-status").textContent = "Unable to determine air quality.";
  }
}

applyAirMood();
