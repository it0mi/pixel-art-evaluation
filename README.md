# Pixel Art Subjective Evaluation

Web app for subjective pairwise evaluation of image-to-pixel-art conversion methods.

This project was created as a part of a master's thesis at the Faculty of Information Technology, Brno University of Technology.

# Project structure

```text
configs/        pair generation configurations
google_sheets/  Google Apps Script backend
web/            frontend application
```

# Requirements

- Python 3.10+
- (makefile)

# Usage

## Pair generation

Generate all test pairs using the Makefile:

- `make pairs`

Or generate pairs manually:

- Create a `congif.json` file with the following structure:

```json
{
  "runnable_from_root": true,
  "input_root_dir": "results/resizeVariety",
  "methods": [
    "area",
    "cubic",
    "lanczos",
    "linear",
    "linearExact",
    "nearest",
    "nearestExact"
  ],
  "default_color_limit": 10,
  "color_limit_enabled": false,
  "output_file": "web/pairs/naive.json",
  "image_extensions": [".png"],
  "shuffle_pairs": true,
  "shuffle_left_right": true
}
```

- Run `python pairGenerator.py config.json`

## Web Application

The frontend is a fully static website.

Run the website using:

- VS Code Live Server,
- Python HTTP server,
- or deploy it using any static hosting service.

## Deployment

### Google Apps Script

- Create new google sheet and using `Extensions -> Apps Script` create new script.
- Copy the script from the `google_sheets/` directory into the editor.
- Replace the spreadsheet ID with your own Google Sheet ID:

```js
const spreadsheet = SpreadsheetApp.openById(
  "17vIHSeYVnqFUAFjhVH-FnuhcBRv37pkTICtCwJYnCEk",
);
```

- Deploy the script as a web application.
- Copy the generated deployment URL.
- Replace the URL in `web/app.js` to send the requests to your sheet.

# Author

Tomáš Kurtin (xkurti03@stud.fit.vut.cz)

Faculty of Information Technology  
Brno University of Technology

Master's Thesis 2026
