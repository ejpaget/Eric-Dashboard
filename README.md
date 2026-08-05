# Eric's Kitchen Dashboard

A hands-free personal dashboard designed first for a Galaxy Tab S9 FE in portrait mode. The tablet can sit on a kitchen counter and show local weather plus a slowly scrolling news feed without requiring constant touching.

The site uses plain HTML, CSS, and JavaScript, so GitHub Pages can host it without a server or build process.

## Current version

- Permanent low-glare dark theme
- Large type intended to be read from roughly two feet away
- Current conditions and a three-day forecast for the general 95945 area
- Live forecast data from the free National Weather Service API
- A slow vertical news feed that pauses or resumes when tapped
- Sample news content for evaluating the layout and scrolling speed
- A bottom navigation design ready for future Home and More pages

No API keys, passwords, exact street address, or private device information are stored in the project. ZIP code 95945 is represented only by general coordinates used for the weather forecast.

## File structure

```text
Eric-Dashboard/
|-- index.html   # Page content: weather strip, stories, and navigation
|-- styles.css   # Permanent dark theme and portrait tablet layout
|-- script.js    # Clock, live weather, and automatic news scrolling
`-- README.md    # This guide
```

An easy way to think about the website files:

- **HTML is the frame.** It defines what appears on the page.
- **CSS is the appearance.** It controls the dark colors, text sizes, spacing, and layout.
- **JavaScript is the behavior.** It updates the clock and weather and moves the news feed.

## How the weather works

The dashboard first asks the National Weather Service which forecast grid covers the general Grass Valley coordinates. It then requests the hourly forecast for the current temperature and the daily forecast for the next three daytime periods.

This service is free and does not require an API key. If weather.gov or the tablet's internet connection is unavailable, the dashboard displays a short message while the clock and news continue working.

## How the news scrolling works

The news container moves downward at 18 pixels per second. It pauses for five seconds at the end and then returns to the beginning.

- Tap the news area or the pause button to stop it.
- Tap again to resume.
- Visitors who enable **Reduce motion** in their operating system start with scrolling paused.

The stories are samples, not current headlines. This lets us adjust the design and reading speed before selecting and connecting live news sources.

## View it locally

Double-click `index.html` to open it in a browser. The layout and scrolling will work, although some browsers may restrict live weather when a page is opened directly from a file.

For the most accurate preview, run a small local web server from this folder:

```powershell
python -m http.server 8000
```

Then visit `http://localhost:8000`. Press `Ctrl+C` in the terminal when finished.

## Publish with GitHub Pages

After the pull request is merged:

1. Open the repository on GitHub.
2. Select **Settings**, then **Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Choose `main` and `/ (root)`, then select **Save**.
5. GitHub will display the dashboard's public address after deployment finishes.

## Good next steps

- Adjust headline size and scrolling speed after trying it on the tablet.
- Choose trusted sources for live local, national, world, and technology news.
- Build the Home page for device and network information.
- Add swipe gestures or larger page controls if needed.

Never commit passwords, access tokens, medical information, exact home addresses, or private home-network details. A normal GitHub Pages site is public.
