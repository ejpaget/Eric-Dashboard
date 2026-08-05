/*
  This file provides three behaviors:
  1. A clock based on the tablet's time.
  2. Live weather from the free National Weather Service API.
  3. Slow news scrolling that pauses or resumes when tapped.
*/

const timeElement = document.querySelector("#current-time");
const dateElement = document.querySelector("#current-date");
const currentTemperature = document.querySelector("#current-temperature");
const currentCondition = document.querySelector("#current-condition");
const currentSymbol = document.querySelector("#current-symbol");
const weatherStatus = document.querySelector("#weather-status");
const forecastCards = [...document.querySelectorAll(".forecast-day")];
const newsFeed = document.querySelector("#news-feed");
const scrollToggle = document.querySelector("#scroll-toggle");
const scrollToggleText = document.querySelector("#scroll-toggle-text");
const controlIcon = document.querySelector(".control-icon");

// General coordinates for ZIP code 95945. No exact address is stored here.
const WEATHER_POINT_URL = "https://api.weather.gov/points/39.2191,-121.0611";

function updateClock() {
  const now = new Date();

  timeElement.textContent = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit"
  }).format(now);

  dateElement.textContent = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric"
  }).format(now);
}

// Choose a simple, readable symbol from the forecast description.
function weatherSymbol(description = "") {
  const text = description.toLowerCase();
  if (text.includes("snow")) return "❄";
  if (text.includes("thunder")) return "ϟ";
  if (text.includes("rain") || text.includes("showers")) return "☂";
  if (text.includes("fog") || text.includes("haze")) return "≋";
  if (text.includes("cloud") || text.includes("overcast")) return "☁";
  if (text.includes("sun") || text.includes("clear")) return "☀";
  return "☁";
}

function dayLabel(startTime) {
  const date = new Date(startTime);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return "Today";
  return new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(date);
}

async function getJson(url) {
  const response = await fetch(url, { headers: { Accept: "application/geo+json" } });
  if (!response.ok) throw new Error(`Weather request failed: ${response.status}`);
  return response.json();
}

async function loadWeather() {
  try {
    // The point lookup tells us which NWS forecast grid serves Grass Valley.
    const pointData = await getJson(WEATHER_POINT_URL);
    const forecastUrl = pointData.properties.forecast;
    const hourlyUrl = pointData.properties.forecastHourly;

    const [forecastData, hourlyData] = await Promise.all([
      getJson(forecastUrl),
      getJson(hourlyUrl)
    ]);

    const current = hourlyData.properties.periods[0];
    const daytimeForecasts = forecastData.properties.periods
      .filter((period) => period.isDaytime)
      .slice(0, 3);

    currentTemperature.textContent = `${current.temperature}°`;
    currentCondition.textContent = current.shortForecast;
    currentSymbol.textContent = weatherSymbol(current.shortForecast);

    forecastCards.forEach((card, index) => {
      const forecast = daytimeForecasts[index];
      if (!forecast) return;
      card.querySelector("h2").textContent = dayLabel(forecast.startTime);
      card.querySelector(".day-symbol").textContent = weatherSymbol(forecast.shortForecast);
      card.querySelector("strong").textContent = `${forecast.temperature}°`;
      card.querySelector("p").textContent = forecast.shortForecast;
    });

    weatherStatus.textContent = "Live forecast · National Weather Service";
  } catch (error) {
    // The rest of the dashboard still works when weather.gov or Wi-Fi is down.
    currentCondition.textContent = "Weather temporarily unavailable";
    weatherStatus.textContent = "Could not update weather · will retry when reloaded";
    weatherStatus.classList.add("error");
    console.warn(error.message);
  }
}

let isScrollPaused = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let previousFrameTime = 0;
let restartAt = 0;
const SCROLL_SPEED = 18; // Pixels per second: deliberately slow for reading.
const END_PAUSE = 5000;

function showScrollState() {
  scrollToggle.setAttribute("aria-pressed", String(isScrollPaused));
  scrollToggleText.textContent = isScrollPaused ? "Tap to resume" : "Tap to pause";
  controlIcon.textContent = isScrollPaused ? "▶" : "Ⅱ";
}

function toggleScrolling() {
  isScrollPaused = !isScrollPaused;
  restartAt = 0;
  showScrollState();
}

function animateNews(timestamp) {
  const elapsed = previousFrameTime ? Math.min(timestamp - previousFrameTime, 100) : 0;
  previousFrameTime = timestamp;

  if (!isScrollPaused) {
    const reachedEnd = newsFeed.scrollTop + newsFeed.clientHeight >= newsFeed.scrollHeight - 2;

    if (reachedEnd) {
      if (!restartAt) restartAt = timestamp + END_PAUSE;
      if (timestamp >= restartAt) {
        newsFeed.scrollTop = 0;
        restartAt = 0;
      }
    } else {
      newsFeed.scrollTop += (SCROLL_SPEED * elapsed) / 1000;
    }
  }

  requestAnimationFrame(animateNews);
}

// The button and the large news area both act as pause/resume controls.
scrollToggle.addEventListener("click", toggleScrolling);
newsFeed.addEventListener("click", (event) => {
  if (!event.target.closest("a")) toggleScrolling();
});

updateClock();
loadWeather();
showScrollState();
setInterval(updateClock, 30_000);
requestAnimationFrame(animateNews);
