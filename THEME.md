# Urometoden — Color Palette

Warm, earthy tones. Forest green primary accent. Aged-gold secondary accent. Norwegian wellness aesthetic.

Dark mode uses neutral grays (no warm cast) so content feels clean and modern, not earthy.

---

## Fonts

| Token | Value |
|---|---|
| `--font-display` | `'DM Serif Display', serif` |
| `--font-body` | `'DM Sans', sans-serif` |

---

## Light Mode

### Backgrounds & Surfaces

| Token | Hex | Description |
|---|---|---|
| `--bg` | `#F5F2EE` | App background — warm off-white |
| `--surface` | `#FDFCFA` | Card/panel surface — near white |
| `--surface2` | `#F0EDE8` | Hover states, stat cards, secondary surfaces |

### Borders

| Token | Value | Description |
|---|---|---|
| `--border` | `rgba(60,45,30,0.12)` | Default border — very subtle warm |
| `--border-md` | `rgba(60,45,30,0.20)` | Medium border — hover, focus rings |

### Text

| Token | Hex | Description |
|---|---|---|
| `--text` | `#1C1612` | Primary text — near-black warm |
| `--text-2` | `#6B5E52` | Secondary text — muted brown |
| `--text-3` | `#A8998C` | Tertiary / labels / captions |

### Accent — Forest Green

| Token | Hex | Description |
|---|---|---|
| `--accent` | `#3D6B5A` | Primary accent, nav indicators, done state |
| `--accent-bg` | `#EBF2EE` | Light green tint background |
| `--done` | `#3D6B5A` | Progress done — same as `--accent` |

### Accent 2 — Aged Gold

| Token | Hex | Description |
|---|---|---|
| `--accent-2` | `#C4A46B` | Secondary accent, active state |
| `--accent-2-bg` | `#F7F1E6` | Light gold tint background |
| `--amber` | `#B87333` | Amber/copper — trial badge text |
| `--active` | `#C4A46B` | Current week indicator — same as `--accent-2` |

### Semantic / State

| Token | Hex | Description |
|---|---|---|
| `--locked` | `#C8BDB4` | Locked/disabled state |
| `--danger` | `#9E4C2E` | Destructive actions, errors |

### Content Type Colors

| Type | Background | Foreground | Usage |
|---|---|---|---|
| Audio | `#E8F0F9` | `#3A6EA5` | Audio file tags and icons |
| Case | `#EDE8F5` | `#7B5EA7` | Case file tags and icons |
| Video | `#F5EAE8` | `#A0503A` | Video tags and icons |
| Reflect | — | `#3D6B5A` | Reflection tag — uses `--accent` |

### Shadows

| Token | Value |
|---|---|
| `--shadow` | `0 1px 3px rgba(30,20,10,0.07), 0 0 0 0.5px rgba(30,20,10,0.06)` |
| `--shadow-lg` | `0 4px 16px rgba(30,20,10,0.10), 0 0 0 0.5px rgba(30,20,10,0.07)` |

### Border Radius

| Token | Value |
|---|---|
| `--radius` | `10px` |
| `--radius-lg` | `14px` |

---

## Dark Mode

Applied via `html.dark` class on `<html>`, set by JS. Neutral grays — no warm brown cast.

### Backgrounds & Surfaces

| Token | Hex | Description |
|---|---|---|
| `--bg` | `#1a1a1a` | App background — neutral dark |
| `--surface` | `#222222` | Card/panel surface |
| `--surface2` | `#2a2a2a` | Hover states, stat cards |

### Borders

| Token | Value |
|---|---|
| `--border` | `rgba(255,255,255,0.08)` |
| `--border-md` | `rgba(255,255,255,0.14)` |

### Text

| Token | Hex | Description |
|---|---|---|
| `--text` | `#EDEDEC` | Primary text — near white, faint warm tint |
| `--text-2` | `#A3A3A3` | Secondary text — neutral mid-gray |
| `--text-3` | `#737373` | Tertiary / labels |

### Accent — Forest Green (dark)

| Token | Hex | Description |
|---|---|---|
| `--accent` | `#52A882` | Primary accent — brightened for dark bg |
| `--accent-bg` | `#16231E` | Dark green tint background |
| `--done` | `#52A882` | Same as `--accent` |

### Accent 2 — Aged Gold (dark)

| Token | Hex | Description |
|---|---|---|
| `--accent-2` | `#C8A86E` | Secondary accent |
| `--accent-2-bg` | `#252016` | Dark gold tint background |
| `--amber` | `#C89650` | Amber — trial badge |
| `--active` | `#C8A86E` | Same as `--accent-2` |

### Semantic / State (dark)

| Token | Hex | Description |
|---|---|---|
| `--locked` | `#3A3A3A` | Locked/disabled |
| `--danger` | `#C4664A` | Destructive / errors |

### Content Type Colors (dark)

| Type | Background | Foreground |
|---|---|---|
| Audio | `#1A2030` | `#6B9FD4` |
| Case | `#1E1A2C` | `#A07ED4` |
| Video | `#261A16` | `#C4785A` |

### Shadows (dark)

| Token | Value |
|---|---|
| `--shadow` | `0 1px 4px rgba(0,0,0,0.40), 0 0 0 0.5px rgba(0,0,0,0.35)` |
| `--shadow-lg` | `0 4px 20px rgba(0,0,0,0.55), 0 0 0 0.5px rgba(0,0,0,0.40)` |

---

## CSS Implementation

```css
:root {
  --bg:          #F5F2EE;
  --surface:     #FDFCFA;
  --surface2:    #F0EDE8;
  --border:      rgba(60,45,30,0.12);
  --border-md:   rgba(60,45,30,0.20);
  --text:        #1C1612;
  --text-2:      #6B5E52;
  --text-3:      #A8998C;
  --accent:      #3D6B5A;
  --accent-bg:   #EBF2EE;
  --done:        #3D6B5A;
  --accent-2:    #C4A46B;
  --accent-2-bg: #F7F1E6;
  --amber:       #B87333;
  --active:      #C4A46B;
  --locked:      #C8BDB4;
  --danger:      #9E4C2E;
  --color-audio-bg: #E8F0F9;
  --color-audio-fg: #3A6EA5;
  --color-case-bg:  #EDE8F5;
  --color-case-fg:  #7B5EA7;
  --color-video-bg: #F5EAE8;
  --color-video-fg: #A0503A;
  --font-display: 'DM Serif Display', serif;
  --font-body:    'DM Sans', sans-serif;
  --radius:      10px;
  --radius-lg:   14px;
  --shadow:      0 1px 3px rgba(30,20,10,0.07), 0 0 0 0.5px rgba(30,20,10,0.06);
  --shadow-lg:   0 4px 16px rgba(30,20,10,0.10), 0 0 0 0.5px rgba(30,20,10,0.07);
}

/* Applied via html.dark class — set by JS, persisted to localStorage */
html.dark {
  --bg:          #1a1a1a;
  --surface:     #222222;
  --surface2:    #2a2a2a;
  --border:      rgba(255,255,255,0.08);
  --border-md:   rgba(255,255,255,0.14);
  --text:        #EDEDEC;
  --text-2:      #A3A3A3;
  --text-3:      #737373;
  --accent:      #52A882;
  --accent-bg:   #16231E;
  --done:        #52A882;
  --accent-2:    #C8A86E;
  --accent-2-bg: #252016;
  --amber:       #C89650;
  --active:      #C8A86E;
  --locked:      #3A3A3A;
  --danger:      #C4664A;
  --color-audio-bg: #1A2030;
  --color-audio-fg: #6B9FD4;
  --color-case-bg:  #1E1A2C;
  --color-case-fg:  #A07ED4;
  --color-video-bg: #261A16;
  --color-video-fg: #C4785A;
  --shadow:      0 1px 4px rgba(0,0,0,0.40), 0 0 0 0.5px rgba(0,0,0,0.35);
  --shadow-lg:   0 4px 20px rgba(0,0,0,0.55), 0 0 0 0.5px rgba(0,0,0,0.40);
}
```
