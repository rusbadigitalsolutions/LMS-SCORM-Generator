---
name: "scorm-generator"
description: >
  Comprehensive guide and instructions for generating standalone SCORM 1.2, SCORM 2004, and modern HTML5 e-learning packages (.zip archives) with embedded runtime JavaScript, SCORM API calls (Initialize, SetValue, Commit, Terminate), no-scroll paginated deck navigation, interactive gamification mechanics, image enlargement / lightbox modals, local and Cloudinary media streaming (video, audio, infographics), quiz scoring, and imsmanifest.xml schemas.
---

# SCORM & HTML5 Course Package Generator Skill

This guide enables AI models to construct valid, self-contained SCORM 1.2 / 2004 / HTML5 e-learning course ZIP packages directly from lesson copy, outlines, local media assets, or remote Cloudinary media links.

---

## 1. Core Architectural Standards

All generated course lessons must adhere to three core design requirements:
1. **No-Scroll, Paginated Layout**: Fixed-viewport presentation deck with pinned headers, progress indicators, screen counters, and bottom navigation buttons (`Previous` / `Next`).
2. **Interactive Gamification Elements**: Hands-on cognitive engagement activities (e.g., scenario simulators, archetype matching engines, trap detectors, dynamic sentiment gauges) that assign scores and transmit telemetry to the LMS.
3. **Responsive Image Enlargement (Lightbox Modal)**: Accessible, full-screen lightbox zoom for infographics, framework diagrams, and complex charts with close triggers (`✕` button, backdrop click, or `Escape` key).

---

## 2. Directory Structure Required in ZIP

### Local Asset Structure (When bundling files locally)
```text
lesson_scorm_package/
├── imsmanifest.xml       (At ZIP root)
├── index.html            (Main entry point)
├── js/
│   └── scormAPI.js       (Universal SCORM 1.2 & 2004 runtime wrapper)
└── assets/               (Folder for local MP4 video, MP3 audio, and PNG/JPEG images)
    ├── lesson_video.mp4
    └── framework_diagram.png
```

### Remote / Cloudinary Asset Structure
When assets are hosted on Cloudinary or external CDNs, they are directly referenced via HTTPS in `index.html`. In this case, the `assets/` directory can be omitted from the ZIP archive to keep file size lightweight while remaining 100% SCORM compliant:
```text
lesson_scorm_package/
├── imsmanifest.xml       (At ZIP root)
├── index.html            (Main entry point with Cloudinary URLs)
└── js/
    └── scormAPI.js       (Universal runtime wrapper)
```

---

## 3. Universal SCORM JS Wrapper (`js/scormAPI.js`)

Save this exact runtime wrapper inside `js/scormAPI.js`. It automatically detects whether the host LMS is SCORM 1.2 or SCORM 2004:

```javascript
(function(window) {
  var API = null, version = null;
  function findAPI(win) {
    var attempts = 0;
    while (win && attempts < 10) {
      if (win.API) { version = '1.2'; return win.API; }
      if (win.API_1484_11) { version = '2004'; return win.API_1484_11; }
      win = (win.parent && win.parent !== win) ? win.parent : win.opener;
      attempts++;
    }
    return null;
  }
  window.ScormAdapter = {
    init: function() {
      API = findAPI(window);
      if (API) {
        if (version === '1.2') { 
          API.LMSInitialize(""); 
          API.LMSSetValue("cmi.core.lesson_status", "incomplete"); 
          API.LMSCommit(""); 
        } else { 
          API.Initialize(""); 
          API.SetValue("cmi.completion_status", "incomplete"); 
          API.Commit(""); 
        }
      }
    },
    saveProgress: function(loc, score, passed) {
      if (!API) return;
      if (version === '1.2') {
        if (loc) API.LMSSetValue("cmi.core.lesson_location", String(loc));
        if (score !== undefined) API.LMSSetValue("cmi.core.score.raw", String(score));
        if (passed !== undefined) API.LMSSetValue("cmi.core.lesson_status", passed ? "passed" : "completed");
        API.LMSCommit("");
      } else {
        if (loc) API.SetValue("cmi.location", String(loc));
        if (score !== undefined) { 
          API.SetValue("cmi.score.raw", String(score)); 
          API.SetValue("cmi.score.scaled", String(score/100)); 
        }
        if (passed !== undefined) {
          API.SetValue("cmi.completion_status", "completed");
          API.SetValue("cmi.success_status", passed ? "passed" : "failed");
        }
        API.Commit("");
      }
    },
    finish: function() {
      if (API) { 
        version === '1.2' ? API.LMSFinish("") : API.Terminate(""); 
      }
    }
  };
  window.addEventListener("load", function() { window.ScormAdapter.init(); });
  window.addEventListener("beforeunload", function() { window.ScormAdapter.finish(); });
})(window);
```

---

## 4. No-Scroll Paginated Layout Pattern

To prevent vertical page scrolling, wrap lesson screens in a fixed-height container (`94vh`, max `840px`), allowing only internal viewport scrolling when screen content exceeds the box height.

### Layout HTML Blueprint
```html
<div class="deck-container">
  <!-- Pinned Header -->
  <header>
    <div class="header-left">
      <div class="badge">Module X &bull; Lesson Y</div>
      <div class="module-title">Lesson Title Goes Here</div>
    </div>
    <div class="screen-counter" id="screen-counter">Screen 1 of 6</div>
  </header>

  <!-- Progress Bar -->
  <div class="progress-bar-container">
    <div class="progress-fill" id="progress-fill"></div>
  </div>

  <!-- Viewport Area -->
  <div class="viewport" id="viewport">
    <section class="screen active" data-screen="1">
      <!-- Screen 1 Content -->
    </section>
    <section class="screen" data-screen="2">
      <!-- Screen 2 Content -->
    </section>
    <!-- Additional Screens (3 to N) -->
  </div>

  <!-- Pinned Bottom Navigation -->
  <footer>
    <button class="btn-nav" id="btn-prev" onclick="navigateScreen(-1)" disabled>
      &#8592; Previous
    </button>
    <div id="status-hint" class="status-hint">Navigate through all screens to complete.</div>
    <button class="btn-nav btn-next" id="btn-next" onclick="navigateScreen(1)">
      Next &#8594;
    </button>
  </footer>
</div>
```

### Essential Navigation CSS & JavaScript
```css
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
  background: #090d16;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}
.deck-container {
  width: 100%;
  max-width: 980px;
  height: 94vh;
  max-height: 840px;
  background: #ffffff;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
}
.viewport {
  flex: 1;
  padding: 1.5rem 2rem;
  overflow-y: auto;
  position: relative;
}
.screen { display: none; }
.screen.active { display: block; animation: fadeIn 0.25s ease-in-out; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
```

```javascript
let currentScreen = 1;
const totalScreens = 6;

function updateUI() {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const activeScreen = document.querySelector(`.screen[data-screen="${currentScreen}"]`);
  if (activeScreen) activeScreen.classList.add('active');

  document.getElementById('viewport').scrollTop = 0;
  document.getElementById('screen-counter').textContent = `Screen ${currentScreen} of ${totalScreens}`;
  const pct = (currentScreen / totalScreens) * 100;
  document.getElementById('progress-fill').style.width = `${pct}%`;

  document.getElementById('btn-prev').disabled = (currentScreen === 1);
  const nextBtn = document.getElementById('btn-next');
  if (currentScreen === totalScreens) {
    nextBtn.textContent = "Finish Lesson ✓";
    nextBtn.style.background = "#16a34a";
  } else {
    nextBtn.innerHTML = "Next &#8594;";
    nextBtn.style.background = "#2563eb";
  }

  if (window.ScormAdapter) {
    window.ScormAdapter.saveProgress(`screen_${currentScreen}`, Math.round(pct), false);
  }
}

function navigateScreen(delta) {
  if (currentScreen === totalScreens && delta > 0) {
    completeLesson();
    return;
  }
  const target = currentScreen + delta;
  if (target >= 1 && target <= totalScreens) {
    currentScreen = target;
    updateUI();
  }
}

function completeLesson() {
  if (window.ScormAdapter) {
    window.ScormAdapter.saveProgress("lesson_completed", 100, true);
  }
  document.getElementById('completion-banner').style.display = "block";
  document.getElementById('btn-next').disabled = true;
  document.getElementById('status-hint').textContent = "Lesson finished and recorded.";
}

window.addEventListener('keydown', (e) => {
  if (e.key === "ArrowRight") navigateScreen(1);
  if (e.key === "ArrowLeft") navigateScreen(-1);
});
```

---

## 5. Responsive Image Enlargement (Lightbox Modal)

Whenever complex diagrams, perceptual maps, matrices, or high-density infographics are embedded, provide a modal zoom so learners can inspect them in high resolution without page disruption.

### Lightbox HTML Component
```html
<!-- In-Screen Clickable Image Card -->
<div class="media-card">
  <div class="zoom-hint" onclick="openLightbox('assets/infographic.png')">🔍 Click to Enlarge</div>
  <img src="assets/infographic.png" alt="Framework Diagram" onclick="openLightbox('assets/infographic.png')">
  <p class="media-caption">Figure 1.1: Core Strategic Architecture (Click to expand)</p>
</div>

<!-- Global Lightbox Modal Container (Place right before </body>) -->
<div class="lightbox-modal" id="lightbox-modal" onclick="closeLightbox(event)">
  <div class="lightbox-content">
    <div class="lightbox-close" onclick="closeLightboxDirect()">✕</div>
    <img id="lightbox-img" src="" alt="Enlarged Diagram Preview">
  </div>
</div>
```

### Lightbox CSS & Modal Scripts
```css
.zoom-hint {
  position: absolute;
  top: 14px;
  right: 14px;
  background: rgba(15, 23, 42, 0.85);
  color: #ffffff;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.25rem 0.55rem;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  backdrop-filter: blur(4px);
}
.lightbox-modal {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(9, 13, 22, 0.92);
  backdrop-filter: blur(8px);
  z-index: 9999;
  justify-content: center;
  align-items: center;
  padding: 1.5rem;
  animation: fadeIn 0.2s ease-out;
}
.lightbox-modal.active { display: flex; }
.lightbox-content {
  max-width: 92vw;
  max-height: 90vh;
  position: relative;
}
.lightbox-content img {
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 88vh;
  border-radius: 8px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.15);
  display: block;
}
.lightbox-close {
  position: absolute;
  top: -12px;
  right: -12px;
  background: #ef4444;
  color: #fff;
  border: 2px solid #fff;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 1rem;
  font-weight: 800;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  transition: transform 0.15s;
}
.lightbox-close:hover { transform: scale(1.1); }
```

```javascript
function openLightbox(src) {
  const modal = document.getElementById('lightbox-modal');
  const img = document.getElementById('lightbox-img');
  img.src = src;
  modal.classList.add('active');
}

function closeLightbox(e) {
  if (e.target.id === 'lightbox-modal') {
    document.getElementById('lightbox-modal').classList.remove('active');
  }
}

function closeLightboxDirect() {
  document.getElementById('lightbox-modal').classList.remove('active');
}

window.addEventListener('keydown', (e) => {
  if (e.key === "Escape") closeLightboxDirect();
});
```

---

## 6. Interactive Gamification Patterns

Integrate at least one gamified interaction per module lesson. Recommended archetypes:

### Pattern A: Multi-Category Pill Classifier
Tests concept recognition across 3–4 categories (e.g., *Feature vs. Benefit vs. Emotional Driver*, or *Jungian Archetype Matching*):
```html
<div class="game-zone">
  <div class="game-item" data-correct="Benefit">
    <span>"Listen to audiobooks for 5 days without needing to recharge":</span>
    <div class="game-btn-group">
      <button class="btn-pill" onclick="checkAnswer(this, 'Feature')">Feature</button>
      <button class="btn-pill" onclick="checkAnswer(this, 'Benefit')">Benefit</button>
      <button class="btn-pill" onclick="checkAnswer(this, 'Emotion')">Emotion</button>
    </div>
  </div>
</div>
```

### Pattern B: Strategic Scenario Simulator
Presents high-stakes executive decisions where learners choose between short-term revenue and brand equity integrity, adjusting dynamic live gauges:
```html
<div class="sim-board">
  <div class="sim-meter">
    <span>Brand Equity Score:</span>
    <strong id="equity-score">100</strong>
  </div>
  <p>An unregulated broker offers a $50k sponsorship deal. Stated value: "User Financial Protection".</p>
  <button class="btn-pill" onclick="playDecision(true)">Decline Deal (+25 Equity)</button>
  <button class="btn-pill" onclick="playDecision(false)">Accept Cash (-40 Equity)</button>
</div>
```

### Pattern C: Interactive White-Space / Perceptual Radar
A 2-axis perceptual coordinate plane where learners evaluate clustered competitors and click to claim defensible, underserved white space quadrants.

---

## 7. Media Handling: Local Files vs. Cloudinary Links

### Option 1: Cloudinary HTTPS Streaming (Recommended)
Embed Cloudinary URLs directly in `<video>` and `<img>` tags. This avoids large SCORM ZIP package sizes and delivers adaptive streaming:
```html
<video controls preload="metadata" playsinline>
  <source src="https://res.cloudinary.com/your-cloud/video/upload/v12345/lesson_video.mp4" type="video/mp4">
  Your browser does not support HTML5 video.
</video>
```

### Option 2: Local ZIP Assets
When using local files:
1. Place files inside `assets/` (e.g., `assets/video.mp4`, `assets/diagram.png`).
2. Verify exact case-sensitivity and filename matching (e.g., watch out for single `_` vs. double `__` underscores).
3. Always register every file under `<resources>` in `imsmanifest.xml`.

---

## 8. Standard Manifest Schema (`imsmanifest.xml`)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="MANIFEST-COURSE-ID" version="1.0"
          xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
          xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd
                              http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd
                              http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>
  <organizations default="ORG-COURSE">
    <organization identifier="ORG-COURSE">
      <title>Course Title</title>
      <item identifier="ITEM-LESSON-01" identifierref="RES-LESSON-01">
        <title>Lesson Title</title>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="RES-LESSON-01" type="webcontent" adlcp:scormtype="sco" href="index.html">
      <file href="index.html"/>
      <file href="js/scormAPI.js"/>
    </resource>
  </resources>
</manifest>
```

---

## 9. Final QA Packaging Checklist

- [ ] `imsmanifest.xml` is located at the absolute root of the ZIP archive.
- [ ] `index.html` loads without horizontal or vertical window scrollbars.
- [ ] `js/scormAPI.js` is correctly linked in `<head>` and fires `LMSInitialize` on load.
- [ ] Previous and Next buttons correctly increment and decrement screens, resetting `scrollTop` to 0.
- [ ] Keyboard navigation (`ArrowRight`, `ArrowLeft`, `Escape`) operates smoothly.
- [ ] All infographics include an interactive zoom trigger opening the lightbox modal.
- [ ] At least one gamified exercise is present with instant visual feedback and score updates.
- [ ] The final screen commits completion (`cmi.core.lesson_status` = `passed` or `completed`) to the LMS.