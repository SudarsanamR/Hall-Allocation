# Student Seat Viewer

A lightweight, static website where students can look up their exam seat allocation.

## How It Works

1. **Admin exports** allocation data as JSON from the Tauri desktop app (Dashboard → Export JSON)
2. **Admin uploads** the JSON file to this viewer (or hosts it at a URL)
3. **Students search** by register number to find their hall and seat

## Deploying to GitHub Pages

1. Push this `student-viewer/` folder to a GitHub repository
2. Go to **Settings → Pages → Source** → select the branch and `/student-viewer` folder
3. The site will be live at `https://your-username.github.io/your-repo/`

### Auto-loading data from a URL

You can host the JSON file in the same repo and link to it:

```
https://your-username.github.io/your-repo/?data=https://your-username.github.io/your-repo/data.json
```

Or use any other URL that serves the JSON file.

## JSON Format

The expected JSON format (exported from the Tauri app):

```json
{
  "generated_at": "2026-03-07T12:00:00",
  "sessions": ["25-05-2024_FN"],
  "total_students": 500,
  "allocations": [
    {
      "registerNumber": "731120104024",
      "hallName": "I1",
      "seatNumber": "12",
      "session": "25-05-2024_FN",
      "subject": "CS3401",
      "department": "CSE"
    }
  ]
}
```

## No Build Tools Required

This is a pure HTML/CSS/JS site. No npm, no frameworks, no build step. Just open `index.html` in a browser or deploy to any static hosting.
