# RON Family Agape Counselling Solutions — website

Redesigned marketing site for **RON Family Agape Counselling Solutions** (Rosemond Owusu Nyarko, RSW — Brampton, Ontario).
Replaces the WordPress site at ronfamilyagapecounsellingsolutions.com. The client dashboard will live in a separate repo; this site has no login.

## Stack

Plain HTML, CSS and JavaScript with no build step, so it runs anywhere (GitHub Pages, Netlify, Vercel, cPanel).

```
index.html                 Home: hero, about, services, approach (CBT), process, hours, policies, booking
privacy.html               Privacy policy
book-appointment/          Redirects the old /book-appointment/ URL to the booking form
css/styles.css             All styles (brand colours in :root)
js/main.js                 Animations and interactions
assets/                    Logo + favicon (SVG)
```

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy on GitHub Pages

Settings → Pages → Source: *Deploy from a branch* → `main` / root.
To use the existing domain, add it under *Custom domain* (this creates a `CNAME` file) and point the domain's DNS to GitHub Pages.

## Features

- Animated hero (word-by-word headline, morphing blobs, breathing heart orb, floating cards)
- Live "Open now / Opens Tuesday 6 pm" status calculated in Toronto time, with today highlighted in the hours table
- Filterable services grid with tilt and glow on hover
- Animated CBT cycle diagram (thoughts, feelings, behaviours)
- Scroll-driven "How it works" timeline, scroll progress bar, active nav link
- Accessible accordion for policies, mobile menu, skip link, `prefers-reduced-motion` support
- Booking form that opens the visitor's email app with a pre-filled request to Ronfamily.agape@outlook.com (no server needed)

## Easy upgrades

- **Photo of Rosemond:** add `assets/rosemond.jpg` and replace the `portrait__monogram` div in `index.html` with
  `<img src="assets/rosemond.jpg" alt="Rosemond Owusu Nyarko">`.
- **LinkedIn:** the old site had a LinkedIn icon with no link; add the profile URL to the footer when available.
- **Form without email app:** swap the form's submit handler for a service like Formspree or the future dashboard API.
