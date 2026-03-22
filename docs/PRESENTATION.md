# Jorbex — Product Presentation Guide

The presentation is a self-contained HTML slideshow located at:

```
public/presentation.html
```

View it locally at **http://localhost:3000/presentation.html**

---

## Slides

| # | Title |
|---|-------|
| 1 | Cover — branding + key stats |
| 2 | Problem & opportunity |
| 3 | Platform overview — 3 user worlds |
| 4 | Candidate experience |
| 5 | Employer experience |
| 6 | Admin dashboard |
| 7 | Programmes portal |
| 8 | Notifications & comms |
| 9 | Billing & payments |
| 10 | Legal & compliance |
| 11 | Tech stack |
| 12 | Signup & onboarding |
| 13 | Roadmap |
| 14 | Closing |

---

## Controls

| Action | Key / Gesture |
|--------|--------------|
| Next slide | `→` or `Space` |
| Previous slide | `←` |
| Fullscreen | `F` |
| Mobile swipe | Swipe left / right |

---

## Adding Screenshots

Each slide with a dashed placeholder box accepts a real screenshot:

1. Press `Win + Shift + S` to capture the screen
2. Save the image into `/public/` (e.g. `public/ss-jobs.png`)
3. Open `public/presentation.html` and find the matching `.screenshot` div
4. Add an `<img>` tag inside it:

```html
<div class="screenshot" style="flex:1;">
  <img src="/ss-jobs.png" />
</div>
```

### Recommended screenshots

| Slide | Page to capture |
|-------|----------------|
| 4 — Candidate Experience | `/candidate/jobs` and `/candidate/jobs/[id]` |
| 5 — Employer Experience | `/employer/search` and `/employer/candidates/[id]` |
| 6 — Admin Dashboard | `/admin/dashboard` and `/admin/verifications` |
| 12 — Signup & Onboarding | `/signup` |

---

## Export to PDF

1. Open `http://localhost:3000/presentation.html` in **Google Chrome**
2. Press `Ctrl + P`
3. Set **Destination** → Save as PDF
4. Set **Margins** → None
5. Enable **Background graphics**
6. Click **Save**

---

## Folder Structure

```
public/
├── presentation.html     ← The slideshow
├── ss-dashboard.png      ← (add your screenshots here)
├── ss-jobs.png
├── ss-employer-search.png
└── ss-signup.png

docs/
└── PRESENTATION.md       ← This file
```
