const apiKey = '720b746a93db3c6125d2b4a235edd3be';
const weatherForm = document.getElementById('weatherForm');
const cityInput = document.getElementById('cityInput');
const weatherResult = document.getElementById('weatherResult');
const geoBtn = document.getElementById('geoBtn');
const forecastBtn = document.getElementById('forecastBtn');
const forecastResult = document.getElementById('forecastResult');

let lastCity = null;
let lastCoords = null;

// Smer vetra (N, NE, E...)
function windDirection(deg) {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

// Prikaz trenutnog vremena
function displayWeather(data) {
  const html = `
    <div class="weather-fade">
      <h2>${data.name}, ${data.sys.country}</h2>
      <table class="weather-table">
        <tr>
          <td class="icon-cell" rowspan="6" style="vertical-align:middle;">
            <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="icon">
          </td>
          <td class="label-cell">Weather:</td>
          <td><b>${data.weather[0].main}</b> (${data.weather[0].description})</td>
        </tr>
        <tr>
          <td class="label-cell">Temperature:</td>
          <td>🌡️ ${data.main.temp}°C (feels like ${data.main.feels_like}°C)</td>
        </tr>
        <tr>
          <td class="label-cell">Min/Max:</td>
          <td>⬇️ ${data.main.temp_min}°C / ⬆️ ${data.main.temp_max}°C</td>
        </tr>
        <tr>
          <td class="label-cell">Humidity:</td>
          <td>💧 ${data.main.humidity}%</td>
        </tr>
        <tr>
          <td class="label-cell">Pressure:</td>
          <td>🔽 ${data.main.pressure} hPa</td>
        </tr>
        <tr>
          <td class="label-cell">Wind:</td>
          <td>💨 ${data.wind.speed} m/s (${windDirection(data.wind.deg)})</td>
        </tr>
      </table>
    </div>
  `;
  weatherResult.innerHTML = html;
  setTimeout(() => {
    document.querySelector('.weather-fade').classList.add('fade-in');
  }, 10);
}

// Prikaz greške
function showError(msg) {
  weatherResult.innerHTML = `<span class="error">${msg}</span>`;
  forecastBtn.style.display = "none";
  forecastResult.innerHTML = "";
}

// Pozovi API po gradu
function fetchWeatherByCity(city) {
  weatherResult.innerHTML = '<span class="loading">Loading...</span>';
  forecastResult.innerHTML = "";
  forecastBtn.style.display = "none";
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`)
    .then(res => res.json())
    .then(data => {
      if (data.cod !== 200) {
        showError('City not found!');
        return;
      }
      // Pamti poslednji grad
      localStorage.setItem('lastWeatherCity', city);
      lastCity = city;
      lastCoords = {lat: data.coord.lat, lon: data.coord.lon};
      displayWeather(data);
      forecastBtn.style.display = "block";
    })
    .catch(() => {
      showError('Error fetching weather data!');
    });
}

// Pozovi API po koordinatama
function fetchWeatherByCoords(lat, lon) {
  weatherResult.innerHTML = '<span class="loading">Loading...</span>';
  forecastResult.innerHTML = "";
  forecastBtn.style.display = "none";
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
    .then(res => res.json())
    .then(data => {
      if (data.cod !== 200) {
        showError('Location not found!');
        return;
      }
      localStorage.setItem('lastWeatherCity', data.name);
      lastCity = data.name;
      lastCoords = {lat: data.coord.lat, lon: data.coord.lon};
      displayWeather(data);
      forecastBtn.style.display = "block";
    })
    .catch(() => {
      showError('Error fetching weather data!');
    });
}

// Pozovi 5-day forecast po gradu ili koordinatama
function fetchForecast() {
  forecastResult.innerHTML = '<span class="loading">Loading forecast...</span>';

  let url = "";
  if (lastCoords) {
    url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lastCoords.lat}&lon=${lastCoords.lon}&appid=${apiKey}&units=metric`;
  } else if (lastCity) {
    url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(lastCity)}&appid=${apiKey}&units=metric`;
  } else {
    forecastResult.innerHTML = `<span class="error">No location available for forecast.</span>`;
    return;
  }

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.cod !== "200") {
        forecastResult.innerHTML = `<span class="error">Forecast not found.</span>`;
        return;
      }
      // Grupisi po danima
      const daily = {};
      data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('en-US', {weekday: 'short', month: 'short', day: 'numeric'});
        // biraj podatak oko 12:00h
        const hour = date.getHours();
        if (!daily[day] || Math.abs(hour - 12) < Math.abs(daily[day].hour - 12)) {
          daily[day] = {
            ...item,
            hour,
            displayDate: day
          };
        }
      });
      // Prikazi prvih 5 dana
      let cards = '';
      Object.values(daily).slice(0,5).forEach(item => {
        cards += `
        <div class="forecast-card">
          <div class="forecast-day">${item.displayDate}</div>
          <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt="icon">
          <div class="forecast-temp">${Math.round(item.main.temp_min)}°C / ${Math.round(item.main.temp_max)}°C</div>
          <div class="forecast-desc">${item.weather[0].main}</div>
        </div>
        `;
      });
      forecastResult.innerHTML = cards;
    })
    .catch(() => {
      forecastResult.innerHTML = `<span class="error">Error fetching forecast!</span>`;
    });
}

// Forma – pretraga po gradu
weatherForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (!city) return;
  fetchWeatherByCity(city);
});

// Dugme za geolokaciju
geoBtn.addEventListener('click', function() {
  if (!navigator.geolocation) {
    showError('Geolocation is not supported by your browser.');
    return;
  }
  weatherResult.innerHTML = '<span class="loading">Getting your location...</span>';
  forecastResult.innerHTML = "";
  forecastBtn.style.display = "none";
  navigator.geolocation.getCurrentPosition(
    (position) => {
      fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
    },
    () => {
      showError('Unable to retrieve your location.');
    }
  );
});

// Dugme za prognozu
forecastBtn.addEventListener('click', function() {
  fetchForecast();
});

// Prikaz poslednjeg grada pri otvaranju
window.addEventListener('DOMContentLoaded', function() {
  const last = localStorage.getItem('lastWeatherCity');
  if (last) {
    fetchWeatherByCity(last);
    cityInput.value = last;
  }
});
