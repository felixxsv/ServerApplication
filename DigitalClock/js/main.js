// Update clock and date
function updateClock() {
    const now = new Date();
    const clock = document.getElementById('clock');
    const date = document.getElementById('date');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

    clock.textContent = now.toLocaleTimeString('en-US', { hour12: false });
    date.textContent = now.toLocaleDateString('en-US', options);
}

async function updateWeather() {
    try {
        // Coordinate for Sapporo
        const latitude = 43.0642;
        const longitude = 141.3469;

        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
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

// Settings menu functionality
const settingsButton = document.getElementById('settings-button');
const settingsMenu = document.getElementById('settings-menu');

document.body.addEventListener('mousemove', (event) => {
    if (window.innerWidth - event.clientX < 50 && window.innerHeight - event.clientY < 50) {
        settingsButton.style.display = 'block';
    } else {
        settingsButton.style.display = 'none';
        settingsMenu.addEventListener('mouseleave', () => {
            settingsMenu.style.display = 'none';
        });
    }
});

settingsButton.addEventListener('click', () => {
    settingsMenu.style.display = settingsMenu.style.display === 'none' || settingsMenu.style.display === '' ? 'block' : 'none';
});

// Customization handlers
const textColorPicker = document.getElementById('text-color-picker');
const textOutlineColorPicker = document.getElementById('text-outline-color-picker');
const textOutlineThicknessDial = document.getElementById('text-outline-thickness-dial');
const boldCheckbox = document.getElementById('bold-checkbox');
const italicCheckbox = document.getElementById('italic-checkbox');
const backgroundColorPicker = document.getElementById('background-color-picker');
const backgroundImagePicker = document.getElementById('backgroundImagePicker');
const fileStatus = document.getElementById('fileStatus');

const clock = document.getElementById('clock');
const date = document.getElementById('date');
const weather = document.getElementById('weather');
const container = document.getElementById('container');

textColorPicker.addEventListener('input', (e) => {
    clock.style.color = e.target.value;
    date.style.color = e.target.value;
    weather.style.color = e.target.value;
    localStorage.setItem('textColor', e.target.value);
});

let textOutlineColor = "";
let textOutlineThickness = "";

function changeStyleTextOutline() {
    const textShadow = `${textOutlineThickness}px ${textOutlineThickness}px 0 ${textOutlineColor}, -${textOutlineThickness}px ${textOutlineThickness}px 0 ${textOutlineColor}, ${textOutlineThickness}px -${textOutlineThickness}px 0 ${textOutlineColor}, -${textOutlineThickness}px -${textOutlineThickness}px 0 ${textOutlineColor}`;
    clock.style.textShadow = textShadow;
    date.style.textShadow = textShadow;
    weather.style.textShadow = textShadow;
    localStorage.setItem('textOutlineColor', textOutlineColor);
    localStorage.setItem('textOutlineThickness', textOutlineThickness);
}

textOutlineColorPicker.addEventListener('input', (e) => {
    textOutlineColor = e.target.value;
    changeStyleTextOutline()
});

textOutlineThicknessDial.addEventListener('input', (e) => {
    textOutlineThickness = e.target.value;
    changeStyleTextOutline()
});

boldCheckbox.addEventListener('change', (e) => {
    const fontWeight = e.target.checked ? 'bold' : 'normal';
    clock.style.fontWeight = fontWeight;
    date.style.fontWeight = fontWeight;
    weather.style.fontWeight = fontWeight;
    localStorage.setItem('fontWeight', e.target.checked);
});

italicCheckbox.addEventListener('change', (e) => {
    const fontStyle = e.target.checked ? 'italic' : 'normal';
    clock.style.fontStyle = fontStyle;
    date.style.fontStyle = fontStyle;
    weather.style.fontStyle = fontStyle;
    localStorage.setItem('fontStyle', e.target.checked);
});

backgroundColorPicker.addEventListener('input', (e) => {
    fileStatus.textContent = '';
    container.style.backgroundImage = '';
    container.style.backgroundColor = e.target.value;
    localStorage.setItem('backgroundImage', '');
    localStorage.setItem('backgroundColor', e.target.value);
});


function inputClick() {
    backgroundImagePicker.click();
}

backgroundImagePicker.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            console.log(event.target.result);
            fileStatus.textContent = event.target.result;
            container.style.backgroundColor = '';
            container.style.backgroundImage = `url(${event.target.result})`;
            localStorage.setItem('backgroundColor', '');
            localStorage.setItem('backgroundImage', `url(${event.target.result})`);
        };
        reader.readAsDataURL(file);
    }
});

window.addEventListener('DOMContentLoaded', function() {
    if (textColor = localStorage.getItem('textColor')) {
        clock.style.color = textColor;
        date.style.color = textColor;
        weather.style.color = textColor;
        textColorPicker.value = textColor;
    }
    if ((textOutlineColor = localStorage.getItem('textOutlineColor')) && (textOutlineThickness = localStorage.getItem('textOutlineThickness'))) {
        const textShadow = `${textOutlineThickness}px ${textOutlineThickness}px 0 ${textOutlineColor}, -${textOutlineThickness}px ${textOutlineThickness}px 0 ${textOutlineColor}, ${textOutlineThickness}px -${textOutlineThickness}px 0 ${textOutlineColor}, -${textOutlineThickness}px -${textOutlineThickness}px 0 ${textOutlineColor}`;
        clock.style.textShadow = textShadow;
        date.style.textShadow = textShadow;
        weather.style.textShadow = textShadow;
        textOutlineColorPicker.value = textOutlineColor;
        textOutlineThicknessDial.value = textOutlineThickness;
    }else if ((textOutlineColor = localStorage.getItem('textOutlineColor')) && !(textOutlineThickness = localStorage.getItem('textOutlineThickness'))) {
        const textOutlineThicknessDefault = 3;
        const textShadow = `${textOutlineThicknessDefault}px ${textOutlineThicknessDefault}px 0 ${textOutlineColor}, -${textOutlineThicknessDefault}px ${textOutlineThicknessDefault}px 0 ${textOutlineColor}, ${textOutlineThicknessDefault}px -${textOutlineThicknessDefault}px 0 ${textOutlineColor}, -${textOutlineThicknessDefault}px -${textOutlineThicknessDefault}px 0 ${textOutlineColor}`;
        clock.style.textShadow = textShadow;
        date.style.textShadow = textShadow;
        weather.style.textShadow = textShadow;
        textOutlineColorPicker.value = textOutlineColor;
        textOutlineThicknessDial.value = textOutlineThicknessDefault;
    }else {
        const textOutlineColorDefault = "#000";
        const textShadow = `${textOutlineThickness}px ${textOutlineThickness}px 0 ${textOutlineColorDefault}, -${textOutlineThickness}px ${textOutlineThickness}px 0 ${textOutlineColorDefault}, ${textOutlineThickness}px -${textOutlineThickness}px 0 ${textOutlineColorDefault}, -${textOutlineThickness}px -${textOutlineThickness}px 0 ${textOutlineColorDefault}`;
        clock.style.textShadow = textShadow;
        date.style.textShadow = textShadow;
        weather.style.textShadow = textShadow;
        textOutlineColorPicker.value = textOutlineColorDefault;
        textOutlineThicknessDial.value = textOutlineThickness;
    }
    if (fontWeight = localStorage.getItem('fontWeight')) {
        const fontWeightStr = fontWeight ? 'bold' : 'normal';
        clock.style.fontWeight = fontWeightStr;
        date.style.fontWeight = fontWeightStr;
        weather.style.fontWeight = fontWeightStr;
        boldCheckbox.checked = fontWeight;
    }
    if (fontStyle = localStorage.getItem('fontStyle')) {
        const fontStyleStr = fontStyle ? 'italic' : 'normal';
        clock.style.fontStyle = fontStyleStr;
        date.style.fontStyle = fontStyleStr;
        weather.style.fontStyle = fontStyleStr;
        italicCheckbox.checked = fontStyle;
    }
    if (backgroundImage = localStorage.getItem('backgroundImage')) {
        const backgroundColorDefault = "#000";
        container.style.backgroundColor = '';
        container.style.backgroundImage = backgroundImage;
        backgroundColorPicker.value = backgroundColorDefault;
        backgroundImagePicker.value = backgroundImage;
    } else if (backgroundColor = this.localStorage.getItem('backgroundColor')) {
        container.style.backgroundColor = backgroundColor;
        container.style.backgroundImage = '';
        backgroundColorPicker.value = backgroundColor;
        backgroundImagePicker.value = '';
    }
})

setInterval(updateClock, 1000);
updateClock();
updateWeather();
setInterval(updateWeather, 3600000); 