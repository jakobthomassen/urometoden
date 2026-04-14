# Urometoden — Theme

Warm earthy light mode. Neutral dark mode (no warm cast). Forest green primary accent, aged gold secondary.  
Dark mode applied via `html.dark` class set by JS, persisted to `localStorage`.

---

## Palette overview

**Light** — backgrounds, text, accents  
![#F5F2EE](https://placehold.co/18x18/F5F2EE/F5F2EE) `--bg`
![#FDFCFA](https://placehold.co/18x18/FDFCFA/FDFCFA) `--surface`
![#F0EDE8](https://placehold.co/18x18/F0EDE8/F0EDE8) `--surface2`
![#1C1612](https://placehold.co/18x18/1C1612/1C1612) `--text`
![#6B5E52](https://placehold.co/18x18/6B5E52/6B5E52) `--text-2`
![#A8998C](https://placehold.co/18x18/A8998C/A8998C) `--text-3`
![#3D6B5A](https://placehold.co/18x18/3D6B5A/3D6B5A) `--accent`
![#EBF2EE](https://placehold.co/18x18/EBF2EE/EBF2EE) `--accent-bg`
![#C4A46B](https://placehold.co/18x18/C4A46B/C4A46B) `--accent-2`
![#B87333](https://placehold.co/18x18/B87333/B87333) `--amber`
![#9E4C2E](https://placehold.co/18x18/9E4C2E/9E4C2E) `--danger`

**Dark** — same tokens, neutral gray base  
![#1a1a1a](https://placehold.co/18x18/1a1a1a/1a1a1a) `--bg`
![#222222](https://placehold.co/18x18/222222/222222) `--surface`
![#2a2a2a](https://placehold.co/18x18/2a2a2a/2a2a2a) `--surface2`
![#EDEDEC](https://placehold.co/18x18/EDEDEC/EDEDEC) `--text`
![#A3A3A3](https://placehold.co/18x18/A3A3A3/A3A3A3) `--text-2`
![#737373](https://placehold.co/18x18/737373/737373) `--text-3`
![#52A882](https://placehold.co/18x18/52A882/52A882) `--accent`
![#C8A86E](https://placehold.co/18x18/C8A86E/C8A86E) `--accent-2`
![#C89650](https://placehold.co/18x18/C89650/C89650) `--amber`
![#C4664A](https://placehold.co/18x18/C4664A/C4664A) `--danger`

---

## Complete CSS

```css
:root {
  /* Surfaces */
  --bg:             #F5F2EE;
  --surface:        #FDFCFA;
  --surface2:       #F0EDE8;

  /* Borders */
  --border:         rgba(60,45,30,0.12);
  --border-md:      rgba(60,45,30,0.20);

  /* Text */
  --text:           #1C1612;
  --text-2:         #6B5E52;
  --text-3:         #A8998C;

  /* Primary accent — forest green */
  --accent:         #3D6B5A;
  --accent-bg:      #EBF2EE;
  --done:           #3D6B5A;   /* alias for progress/completion */

  /* Secondary accent — aged gold */
  --accent-2:       #C4A46B;
  --accent-2-bg:    #F7F1E6;
  --amber:          #B87333;
  --active:         #C4A46B;   /* alias for current/active state */

  /* States */
  --locked:         #C8BDB4;
  --danger:         #9E4C2E;

  /* Content type colors */
  --color-audio-bg: #E8F0F9;
  --color-audio-fg: #3A6EA5;
  --color-case-bg:  #EDE8F5;
  --color-case-fg:  #7B5EA7;
  --color-video-bg: #F5EAE8;
  --color-video-fg: #A0503A;
  /* reflect type uses --accent / --accent-bg */

  /* Typography */
  --font-display:   'DM Serif Display', serif;
  --font-body:      'DM Sans', sans-serif;
  --font-script:    'Dancing Script', cursive;

  /* Shape */
  --radius:         10px;
  --radius-lg:      14px;

  /* Elevation */
  --shadow:         0 1px 3px rgba(30,20,10,0.07), 0 0 0 0.5px rgba(30,20,10,0.06);
  --shadow-lg:      0 4px 16px rgba(30,20,10,0.10), 0 0 0 0.5px rgba(30,20,10,0.07);
}

html.dark {
  --bg:             #1a1a1a;
  --surface:        #222222;
  --surface2:       #2a2a2a;

  --border:         rgba(255,255,255,0.08);
  --border-md:      rgba(255,255,255,0.14);

  --text:           #EDEDEC;
  --text-2:         #A3A3A3;
  --text-3:         #737373;

  --accent:         #52A882;
  --accent-bg:      #16231E;
  --done:           #52A882;

  --accent-2:       #C8A86E;
  --accent-2-bg:    #252016;
  --amber:          #C89650;
  --active:         #C8A86E;

  --locked:         #3A3A3A;
  --danger:         #C4664A;

  --color-audio-bg: #1A2030;
  --color-audio-fg: #6B9FD4;
  --color-case-bg:  #1E1A2C;
  --color-case-fg:  #A07ED4;
  --color-video-bg: #261A16;
  --color-video-fg: #C4785A;

  --shadow:         0 1px 4px rgba(0,0,0,0.40), 0 0 0 0.5px rgba(0,0,0,0.35);
  --shadow-lg:      0 4px 20px rgba(0,0,0,0.55), 0 0 0 0.5px rgba(0,0,0,0.40);
}
```
