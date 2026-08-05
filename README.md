# Eric Dashboard

A beginner-friendly personal dashboard built with plain HTML, CSS, and JavaScript. It is designed to work as a static site on GitHub Pages—no server, paid service, API key, or private information is required.

## What is included

- A responsive layout for computers, tablets, Fire TV browsers, and phones
- A live clock, date, and time-of-day greeting
- Light and dark themes remembered on the visitor's device
- Practical starting sections for weather, news, home status, projects, and emergency information
- Accessibility touches such as meaningful headings, keyboard focus support, and reduced-motion support

The weather and home readings are clearly labeled samples. They are not live yet. This keeps version 1 simple and avoids exposing passwords, addresses, device names, or API keys.

## File structure

```text
Eric-Dashboard/
├── index.html   # The content and structure of the page
├── styles.css   # Colors, spacing, cards, and responsive layouts
├── script.js    # Clock, greeting, and theme button behavior
└── README.md    # This guide
```

Here is an easy way to think about those three website files:

- **HTML is the frame of the house.** It defines the headings, cards, links, and text.
- **CSS is the paint and furniture.** It controls colors, spacing, type, and how the layout changes on smaller screens.
- **JavaScript is the electricity.** It makes the clock update and the theme button respond to a click.

The files are intentionally separate so changes are easier to understand. The browser connects them through the `<link>` and `<script>` lines near the top of `index.html`.

## View it on your computer

The simplest option is to open `index.html` in a browser. You can double-click the file after downloading or cloning the repository.

For a more realistic local preview, run a small web server from the project folder:

```powershell
python -m http.server 8000
```

Then visit `http://localhost:8000` in a browser. Press `Ctrl+C` in the terminal when you are finished.

## Publish with GitHub Pages

After these changes are merged into the repository's default branch:

1. Open the repository on GitHub.
2. Select **Settings**, then **Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Choose the default branch and the `/ (root)` folder, then select **Save**.
5. Wait a minute or two for GitHub to show the public website address.

## Make your first edits

Try changing one small thing at a time:

- Change card text in `index.html`.
- Change `--accent` near the top of `styles.css` to try a new highlight color.
- Add another project by copying one of the `<div class="project">` blocks.

Save the file and refresh the browser to see the result.

## Safe ideas for later

- Display live weather using a service that supports safe browser access.
- Load headlines from a public RSS feed through a trusted service.
- Connect Home Assistant through a private, authenticated setup.
- Show Starlink, UPS, or energy status without publishing the home network publicly.
- Add a large-screen mode for a tablet or television.

Never commit passwords, access tokens, exact home addresses, personal medical information, or private device details. GitHub Pages sites are public unless access is specifically restricted through a different hosting arrangement.
