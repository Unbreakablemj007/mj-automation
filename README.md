# MJ Automations

Website of **Mohammad Jaafar**, AI Automation Specialist, in English and Arabic.

Plain HTML, CSS and JavaScript with no build step.

| File | What it is |
|---|---|
| `index.html` | The page |
| `styles.css` | Styles, including right-to-left (Arabic) rules |
| `script.js` | Animations, ROI calculator, language switch, contact form, contact links |
| `i18n-ar.js` | Arabic translations |
| `film-video.js` | The hero film: plays `frames/` as you scroll and places the laptop dashboard on the screen |
| `frames/`, `frames-hd/` | The hero film's frames (1280 wide for phones, 1920 wide for large screens) |
| `og-image.png` | Image shown when the link is shared |

## Editing

- **Contact links:** fill in `CONTACT` at the top of `script.js` (booking link, WhatsApp number, LinkedIn, GitHub). Empty values stay hidden.
- **Contact form:** sends through [FormSubmit](https://formsubmit.co) to the address in `MAIL_TO` in `script.js`. The first real submission sends an activation email that must be confirmed once.
- **Arabic text:** edit `i18n-ar.js`. Keys are the English text exactly as it appears on the page.
- **Hero film dashboard:** the laptop's dashboard at the end of the film is plain HTML inside `#film-dash` in `index.html` (workflow steps, status tiles, activity list); its styles are the `.fd-*` rules in `styles.css`.
- **Arabic link:** add `#ar` to the URL to open the site in Arabic.

## Deploying

Import this repo in Vercel (Framework Preset: Other, Root Directory: `./`, no build command). Every push to `main` redeploys.
