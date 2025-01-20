function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('clock').textContent = `${hours}:${minutes}:${seconds}`;
}

function updateDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: '2-digit' };
    const dateString = now.toLocaleDateString('en-US', options);
    document.getElementById('date').textContent = dateString;
}

async function updateWeather() {
    try {
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=35.6895&longitude=139.6917&current_weather=true'); // Example: Tokyo coordinates
        const data = await response.json();
        const weather = data.current_weather;

        const weatherDescriptions = {
            0: "☀️",
            1: "🌤️",
            2: "⛅",
            3: "☁️",
            45: "🌫️",
            48: "🌫️",
            51: "🌦️",
            53: "🌦️",
            55: "🌦️",
            61: "🌧️",
            63: "🌧️",
            65: "🌧️",
            71: "❄️",
            73: "❄️",
            75: "❄️",
            80: "🌦️",
            81: "🌦️",
            82: "🌦️",
            95: "⛈️",
            96: "⛈️",
            99: "⛈️"
        };

        const weatherDescription = weatherDescriptions[weather.weathercode] || "🌈";
        document.getElementById('weather').textContent = `Temp: ${weather.temperature}°C ${weatherDescription}`;
    } catch (error) {
        document.getElementById('weather').textContent = 'Weather unavailable';
    }
}

setInterval(updateClock, 1000); // Clock updates every second
updateClock();
updateDate();

// Weather updates every 10 minutes to reduce server load
updateWeather();
setInterval(updateWeather, 600000);