const apiKey = 'cd4cacee9cd5e92c9e8bd4a2ee6cf50b';

const cityForm = document.getElementById('city-form');
const cityInput = document.getElementById('city-input');
const currentWeatherSection = document.getElementById('current-weather');
const forecastSection = document.getElementById('forecast');
const searchHistorySection = document.getElementById('search-history');

cityForm.addEventListener('submit', function (e) {
  e.preventDefault();
  const cityName = cityInput.value.trim();
  
  if (cityName) {
    getCoordinates(cityName)
      .then(coordinates => {
        if (coordinates) {
          getWeatherData(coordinates.lat, coordinates.lon);
        } else {
          console.error('Coordinates not found for the city.');
        }
      })
      .catch(error => {
        console.error('Error getting coordinates:', error);
      });
  }
});

function getCoordinates(city) {
  // Use fetch to get coordinates data from OpenWeatherMap API
  return fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`)
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('City not found.');
      }
    })
    .then(data => {
      const coordinates = {
        lat: data.coord.lat,
        lon: data.coord.lon,
      };
      return coordinates;
    })
    .catch(error => {
      console.error('Error fetching coordinates data:', error);
      return null;
    });
}

function getWeatherData(lat, lon) {
  // Use fetch to get weather data from OpenWeatherMap API using coordinates
  fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`)
    .then(response => response.json())
    .then(data => {
      // Process and display current weather and forecast data
      displayCurrentWeather(data);
      displayForecast(data);
      saveSearchHistory(cityInput.value.trim());
    })
    .catch(error => {
      console.error('Error fetching weather data:', error);
    });
}

function displayCurrentWeather(data) {
  const currentWeather = data.list[0];
  
  const cityName = data.city.name;
  const date = new Date(currentWeather.dt * 1000).toLocaleDateString();
  const iconUrl = `https://openweathermap.org/img/w/${currentWeather.weather[0].icon}.png`;
  const temperature = Math.round(currentWeather.main.temp - 273.15); // Convert to Celsius
  const humidity = currentWeather.main.humidity;
  const windSpeed = currentWeather.wind.speed;
  
  const htmlContent = `
    <h2>${cityName} (${date}) <img src="${iconUrl}" alt="${currentWeather.weather[0].description}"></h2>
    <p>Temperature: ${temperature} °C</p>
    <p>Humidity: ${humidity}%</p>
    <p>Wind Speed: ${windSpeed} m/s</p>
  `;
  
  currentWeatherSection.innerHTML = htmlContent;
}

function displayForecast(data) {
  // Extract and display forecast data for the next 5 days
  const forecast = data.list.slice(1, 6); // Get forecast for the next 5 days
  let forecastHtml = '<h2>5-Day Forecast</h2>';
  
  forecast.forEach(dayData => {
    const date = new Date(dayData.dt * 1000).toLocaleDateString();
    const iconUrl = `https://openweathermap.org/img/w/${dayData.weather[0].icon}.png`;
    const temperature = Math.round(dayData.main.temp - 273.15); // Convert to Celsius
    const humidity = dayData.main.humidity;
    const windSpeed = dayData.wind.speed;
    
    forecastHtml += `
      <div class="forecast-item">
        <p>Date: ${date}</p>
        <img src="${iconUrl}" alt="${dayData.weather[0].description}">
        <p>Temperature: ${temperature} °C</p>
        <p>Humidity: ${humidity}%</p>
        <p>Wind Speed: ${windSpeed} m/s</p>
      </div>
    `;
  });

  forecastSection.innerHTML = forecastHtml;
}

function saveSearchHistory(city) {
  // Save searched city to local storage for history
  let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

  // Check if the city is already in the search history
  if (!searchHistory.includes(city)) {
    // Limit search history to 10 items
    if (searchHistory.length >= 10) {
      searchHistory.shift(); // Remove the oldest entry
    }
    searchHistory.push(city);
    
    // Save updated search history
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    
    // Update the searchHistorySection with HTML content
    renderSearchHistory();
  }
}

function renderSearchHistory() {
  let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
  let historyHtml = '<h2>Search History</h2>';
  
  searchHistory.forEach(city => {
    historyHtml += `
      <div class="history-item">${city}</div>
    `;
  });

  searchHistorySection.innerHTML = historyHtml;
}

// Load search history from local storage on page load
document.addEventListener('DOMContentLoaded', function () {
  renderSearchHistory();
});

// Handle click events on search history items
searchHistorySection.addEventListener('click', function (e) {
  if (e.target.classList.contains('history-item')) {
    const selectedCity = e.target.textContent;
    getWeatherData(selectedCity);
  }
});

