const form = document.getElementById('weather-search-form');
const cityInput = document.getElementById('city-input');
const errorMessage = document.getElementById('error-message');
const cityNameEl = document.getElementById('city-name');
const countryNameEl = document.getElementById('country-name');
const temperatureEl = document.getElementById('temperature');
const descriptionEl = document.getElementById('weather-description');
const humidityEl = document.getElementById('humidity');
const windSpeedEl = document.getElementById('wind-speed');
const uvIndexEl = document.getElementById('uv-index');
const forecastList = document.getElementById('forecast-list');
const weatherIconEl = document.getElementById('weather-icon');


const loadingElement = document.createElement('div');
loadingElement.id = 'loading-state';
loadingElement.className = 'loading-state';
loadingElement.textContent = 'Complete...';

const weatherCodeMap = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Light rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Light snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Light rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Light snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with hail',
  99: 'Severe thunderstorm with hail'
};

const weatherIconMap = {
  0: '☀️',
  1: '🌤️',
  2: '⛅️',
  3: '☁️',
  45: '🌫️',
  48: '🌫️',
  51: '🌦️',
  53: '🌦️',
  55: '🌧️',
  56: '🌧️',
  57: '🌧️',
  61: '🌧️',
  63: '🌧️',
  65: '🌧️',
  66: '🌧️',
  67: '🌧️',
  71: '❄️',
  73: '❄️',
  75: '❄️',
  77: '🌨️',
  80: '🌧️',
  81: '🌧️',
  82: '⛈️',
  85: '🌨️',
  86: '❄️',
  95: '⛈️',
  96: '⛈️',
  99: '⛈️'
};

//Shows the loading element below the search form.
function showLoading() {
  if (!form.contains(loadingElement)) {
    form.insertAdjacentElement('afterend', loadingElement);
  }
}

//Removes the loading element when data loading is complete.

function hideLoading() {
  if (form.contains(loadingElement)) {
    loadingElement.remove();
  }
}

// Displays an error message to the user in the error message area.

function displayError(message) {
  errorMessage.textContent = message;
}

//Clears any existing error message.
 
function clearError() {
  errorMessage.textContent = '';
}

// collects the latitude and longitude for a given city from the Open-Meteo Geocoding API.

  
async function getCoordinates(city) {
  const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
  const response = await fetch(geocodeUrl);

  if (!response.ok) {
    throw new Error('Failed to load location data.');
  }

  const data = await response.json();
  if (!data.results || data.results.length === 0) {
    throw new Error('City not found. Please enter a valid city name.');
  }

  const result = data.results[0];
  return {
    latitude: result.latitude,
    longitude: result.longitude,
    name: result.name,
    country: result.country
  };
}

// collects weather information using latitude and longitude from the Open-Meteo Weather API.

async function getWeatherData(latitude, longitude) {
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
    '&current_weather=true' +
    '&daily=weathercode,temperature_2m_max,temperature_2m_min,uv_index_max' +
    '&hourly=relativehumidity_2m,windspeed_10m' +
    '&timezone=auto';

  const response = await fetch(weatherUrl);
  if (!response.ok) {
    throw new Error('Failed to load weather data.');
  }

  const data = await response.json();
  if (!data.current_weather || !data.daily) {
    throw new Error('Weather service returned incomplete data.');
  }

  return data;
}

// Returns a weather description from the WMO weather code.

function getWeatherDescription(code) {
  return weatherCodeMap[code] || 'Unknown weather';
}

// Returns a weather icon for the WMO weather code.
 
 
function getWeatherIcon(code) {
  return weatherIconMap[code] || '🌈';
}

// Gets the index for the current hour inside hourly datasets.
 
 
function getHourlyIndex(timeString, timeArray) {
  const currentTime = new Date(timeString).getTime();
  let closestIndex = 0;
  let minDiff = Math.abs(new Date(timeArray[0]).getTime() - currentTime);

  for (let i = 1; i < timeArray.length; i++) {
    const diff = Math.abs(new Date(timeArray[i]).getTime() - currentTime);
    if (diff < minDiff) {
      minDiff = diff;
      closestIndex = i;
    }
  }
  return closestIndex;
}

// Converts a date string to the day name
 

function getDayName(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { weekday: 'short' });
}

//shows the current weather information on the page.
 
 
function renderCurrentWeather(weatherData, cityName, countryName) {
  const current = weatherData.current_weather;
  const humidityIndex = getHourlyIndex(current.time, weatherData.hourly.time);
  const humidity = humidityIndex >= 0 ? weatherData.hourly.relativehumidity_2m[humidityIndex] : '--';

  cityNameEl.textContent = cityName;
  countryNameEl.textContent = countryName;
  temperatureEl.textContent = `${Math.round(current.temperature)}°C`;
  descriptionEl.textContent = getWeatherDescription(current.weathercode);
  weatherIconEl.textContent = getWeatherIcon(current.weathercode);
  humidityEl.textContent = `${humidity}%`;
  windSpeedEl.textContent = `${Math.round(current.windspeed)} km/h`;
  uvIndexEl.textContent = weatherData.daily.uv_index_max?.[0] ?? '--';
}

//a 5-day forecast list using the daily weather forecast data.

 
function renderForecast(dailyData) {
  forecastList.innerHTML = '';
  const daysToShow = Math.min(5, dailyData.time.length - 1);

  for (let i = 1; i <= daysToShow; i += 1) {
    const forecastDate = dailyData.time[i];
    const dayName = getDayName(forecastDate);
    const weatherCode = dailyData.weathercode[i];
    const icon = getWeatherIcon(weatherCode);
    const maxTemp = Math.round(dailyData.temperature_2m_max[i]);
    const minTemp = Math.round(dailyData.temperature_2m_min[i]);

    const card = document.createElement('article');
    card.className = 'forecast-day';
    card.innerHTML = `
      <h3>${dayName}</h3>
      <p class="forecast-icon">${icon}</p>
      <p class="forecast-temp">High ${maxTemp}° / Low ${minTemp}°</p>
      <p class="forecast-desc">${getWeatherDescription(weatherCode)}</p>
    `;

    forecastList.appendChild(card);
  }
}

// Main handler that coordinates city search, data loading, and UI updates.

 
async function handleSearch(event) {
  event.preventDefault();
  const city = cityInput.value.trim();

  if (!city) {
    displayError('Please enter a city name.');
    return;
  }

  clearError();
  showLoading();

  try {
    const location = await getCoordinates(city);
    const weatherData = await getWeatherData(location.latitude, location.longitude);
    renderCurrentWeather(weatherData, location.name, location.country);
    renderForecast(weatherData.daily);
  } catch (error) {
    displayError(error.message || 'Unable to load weather data.');
    forecastList.innerHTML = '';
    cityNameEl.textContent = 'City Name';
    countryNameEl.textContent = 'Country';
    temperatureEl.textContent = '--°';
    descriptionEl.textContent = 'Weather description';
    humidityEl.textContent = '--%';
    windSpeedEl.textContent = '-- km/h';
    uvIndexEl.textContent = '--';
  } finally {
    hideLoading();
  }
}


form.addEventListener('submit', handleSearch);




//get user location and fetch weather data for that location.


//function getCurrentLocationWeather() {
  //navigator.geolocation.getCurrentPosition(
    //async (position) => {
     // const { latitude, longitude } = position.coords;
      //const weatherData = await getWeatherData(latitude, longitude);
     // renderCurrentWeather(weatherData, Location.name, Location.country);
     // renderForecast(weatherData.daily);
   // },
    //(error) => {
     // displayError('Unable to retrieve your location.');
   // }
 // );
//}
//addEventListener('DOMContentLoaded', getCurrentLocationWeather);

//addEventListener('DOMContentLoaded', showCurrentLocation);