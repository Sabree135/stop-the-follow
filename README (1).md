# STOP THE FOLLOW - GitHub Pages Web App

**STOP THE FOLLOW** is a minimal, privacy-first stalking-assessment web app designed to help survivors quickly assess risk and download a safety plan. This repository is ready to be published to GitHub Pages.

## What's included
- `index.html` - Main app (12 yes/no questions, results, download buttons)
- `script.js` - App logic (scoring, PDF/text export, save/delete, local analytics counter)
- `style.css` - Minimal clean styling
- `manifest.json` - PWA manifest
- `resources.html` - Links to hotlines and PA legal aid
- `README.md` - This file

## How to publish
1. Create a new public GitHub repository.
2. Upload these files to the repository root.
3. In GitHub, go to Settings → Pages → Source: choose `main` branch `/ (root)`.
4. Save and wait a minute — your app will be live at `https://<your-username>.github.io/<repo-name>/`.

## Privacy & Safety
- **All assessment answers and generated files are created on the user's device.** Nothing is sent to a server.
- Results can be saved locally to the user's browser or deleted immediately.
- The app includes a Quick Exit button that redirects to a neutral site.

## Amber Grant guidance
This project is suitable for social-impact funding: emphasize accessibility (no signup, works offline), privacy-first design, and clear impact on survivor safety. Use screenshots of the app and the README to support your application.

## Notes
- The PDF generation uses client-side libraries (html2canvas + jsPDF). For best experience, test on mobile Chrome.
- If you want encrypted exports or cloud analytics later, these can be added while keeping plaintext client-side by default.
