/*
  script.js adds the small pieces of behavior on the page.
  It uses only features built into the browser, so there is nothing to install.
*/

const timeElement = document.querySelector("#current-time");
const dateElement = document.querySelector("#current-date");
const greetingElement = document.querySelector("#greeting-time");
const themeButton = document.querySelector("#theme-button");

// Update the clock and greeting from the visitor's own device time.
function updateClock() {
  const now = new Date();
  const hour = now.getHours();

  timeElement.textContent = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit"
  }).format(now);

  dateElement.textContent = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric"
  }).format(now);

  greetingElement.textContent = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
}

// Remember the theme on this device. No information is sent anywhere.
function setTheme(useDarkTheme) {
  document.body.classList.toggle("dark-theme", useDarkTheme);
  themeButton.textContent = useDarkTheme ? "Use light theme" : "Use dark theme";
  themeButton.setAttribute("aria-pressed", String(useDarkTheme));
  localStorage.setItem("dashboard-theme", useDarkTheme ? "dark" : "light");
}

themeButton.addEventListener("click", () => {
  setTheme(!document.body.classList.contains("dark-theme"));
});

const savedTheme = localStorage.getItem("dashboard-theme");
const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
setTheme(savedTheme ? savedTheme === "dark" : systemPrefersDark);

updateClock();
setInterval(updateClock, 30_000);
