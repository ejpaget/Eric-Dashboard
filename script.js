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
const newsStatus = document.querySelector("#news-status");
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

function publishedLabel(value) {
  if (!value) return "Recently published";
  const published = new Date(value);
  if (Number.isNaN(published.getTime())) return "Recently published";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(published);
}

function buildStory(story, isFinalStory) {
  const article = document.createElement("article");
  article.className = isFinalStory ? "story final-story" : "story";

  const metadata = document.createElement("p");
  metadata.className = "story-meta";

  const category = document.createElement("span");
  category.textContent = story.category;
  const sourceAndTime = document.createElement("span");
  sourceAndTime.textContent = `${story.source} · ${publishedLabel(story.publishedAt)}`;
  metadata.append(category, sourceAndTime);

  const heading = document.createElement("h3");
  const link = document.createElement("a");
  link.href = story.url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = story.title;
  heading.append(link);

  const summary = document.createElement("p");
  summary.textContent = story.summary || "Tap the headline to read the complete story from the publisher.";

  article.append(metadata, heading, summary);
  return article;
}

async function loadNews() {
  try {
    // The timestamp prevents the tablet from holding onto an older cached file.
    const response = await fetch(`news.json?time=${Date.now()}`);
    if (!response.ok) throw new Error(`News request failed: ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data.stories) || !data.stories.length) throw new Error("No news stories found");

    const storyElements = data.stories.map((story, index) =>
      buildStory(story, index === data.stories.length - 1)
    );
    newsFeed.replaceChildren(...storyElements);
    newsFeed.scrollTop = 0;

    const updated = new Date(data.updatedAt);
    const updateText = Number.isNaN(updated.getTime())
      ? "Live headlines"
      : `Updated ${new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(updated)}`;
    newsStatus.textContent = `${updateText} · Local · World · Sports · Science & Tech`;
  } catch (error) {
    // The sample HTML remains visible if news.json cannot be loaded.
    newsStatus.textContent = "Offline preview stories · live headlines unavailable";
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
loadNews();
showScrollState();
setInterval(updateClock, 30_000);
requestAnimationFrame(animateNews);
