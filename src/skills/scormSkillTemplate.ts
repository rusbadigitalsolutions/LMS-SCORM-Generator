import { GeneratorSettings, MediaAsset, ScormPackageFiles } from '../types/scorm';

/**
 * Universal SCORM 1.2 & SCORM 2004 runtime wrapper.
 * Exact specification as defined in Section 3 of new_scorm_generator_skill.md
 */
export const UNIVERSAL_SCORM_API_JS = `(function(window) {
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
})(window);`;

/**
 * Generates imsmanifest.xml compliant with SCORM 1.2 or SCORM 2004
 */
export function generateManifestXml(courseTitle: string, lessonTitle: string, version: '1.2' | '2004'): string {
  const courseId = 'COURSE-' + courseTitle.toUpperCase().replace(/[^A-Z0-9]/g, '_').slice(0, 20);
  const orgId = 'ORG-' + courseId;
  const itemId = 'ITEM-' + lessonTitle.toUpperCase().replace(/[^A-Z0-9]/g, '_').slice(0, 20);
  const resId = 'RES-' + itemId;

  if (version === '2004') {
    return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${courseId}" version="1.3"
          xmlns="http://www.imsglobal.org/xsd/imscp_v1p1"
          xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_v1p3"
          xmlns:adlseq="http://www.adlnet.org/xsd/adlseq_v1p3"
          xmlns:adlnav="http://www.adlnet.org/xsd/adlnav_v1p3"
          xmlns:imsss="http://www.imsglobal.org/xsd/imsss"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://www.imsglobal.org/xsd/imscp_v1p1 imscp_v1p1.xsd
                              http://www.adlnet.org/xsd/adlcp_v1p3 adlcp_v1p3.xsd
                              http://www.imsglobal.org/xsd/imsss imsss_v1p0.xsd">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>2004 4th Edition</schemaversion>
  </metadata>
  <organizations default="${orgId}">
    <organization identifier="${orgId}">
      <title>${escapeXml(courseTitle)}</title>
      <item identifier="${itemId}" identifierref="${resId}">
        <title>${escapeXml(lessonTitle)}</title>
        <imsss:sequencing>
          <imsss:deliveryControls completionSetByContent="true" objectiveSetByContent="true"/>
        </imsss:sequencing>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="${resId}" type="webcontent" adlcp:scormType="sco" href="index.html">
      <file href="index.html"/>
      <file href="js/scormAPI.js"/>
    </resource>
  </resources>
</manifest>`;
  }

  // SCORM 1.2 Default
  return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${courseId}" version="1.0"
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
  <organizations default="${orgId}">
    <organization identifier="${orgId}">
      <title>${escapeXml(courseTitle)}</title>
      <item identifier="${itemId}" identifierref="${resId}">
        <title>${escapeXml(lessonTitle)}</title>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="${resId}" type="webcontent" adlcp:scormtype="sco" href="index.html">
      <file href="index.html"/>
      <file href="js/scormAPI.js"/>
    </resource>
  </resources>
</manifest>`;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

/**
 * Builds the AI System Instruction and Prompt to instruct Gemini according to the SCORM Generator Skill
 */
export function buildScormPrompt(payload: {
  courseTitle: string;
  moduleBadge: string;
  lessonTitle: string;
  lessonContent: string;
  mediaAssets: MediaAsset[];
  settings: GeneratorSettings;
}): { systemInstruction: string; userPrompt: string } {
  const { courseTitle, moduleBadge, lessonTitle, lessonContent, mediaAssets, settings } = payload;

  const systemInstruction = `You are the SCORM Studio AI Engine, an expert e-learning software architect.
You build production-grade, standalone, self-contained SCORM 1.2 and SCORM 2004 interactive course packages (.zip contents) based on provided curriculum lesson text and media assets.

CRITICAL ARCHITECTURAL CONSTRAINTS:
1. ZERO HALLUCINATION / ZERO CITATION RULE:
   The lesson text must be 100% natural, polished, and instructional.
   NEVER include bracketed citations like [1], [2], footnote numbers, Wikipedia references, academic paper citations, or url markdown tags in the lesson presentation.
2. FULL UN-TRUNCATED CODE ONLY:
   You MUST return 100% complete, fully implemented index.html code.
   NEVER emit placeholders, TODOs, or comments like "<!-- Insert remaining screens here -->" or "<!-- Screen 3 to 6 ... -->". Every single screen must have complete HTML, copy, and layout.
3. NO-SCROLL PAGINATED DECK PATTERN:
   The entire lesson deck MUST fit inside a fixed-viewport container (94vh, max 840px, max-width 980px).
   html, body { height: 100%; margin: 0; padding: 0; background: #090d16; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; justify-content: center; align-items: center; overflow: hidden; }
   The deck container has:
   - Pinned Header: with Module Badge ("${moduleBadge || 'Module 1'}"), Lesson Title ("${lessonTitle}"), and Screen Counter ("Screen 1 of N").
   - Progress Bar: with animated width percentage fill.
   - Viewport Area: .viewport { flex: 1; padding: 1.5rem 2rem; overflow-y: auto; position: relative; }
   - Individual Screens: .screen { display: none; } .screen.active { display: block; animation: fadeIn 0.25s ease-in-out; }
   - Pinned Bottom Navigation: #btn-prev (disabled on screen 1), #status-hint, #btn-next (turns into "Finish Lesson ✓" on final screen, calls ScormAdapter.saveProgress("lesson_completed", 100, true)).
   - Keyboard arrows listener: ArrowRight -> next, ArrowLeft -> prev, Escape -> close lightbox.
4. RESPONSIVE IMAGE ENLARGEMENT (LIGHTBOX MODAL):
   Always include a global lightbox modal container right before </body>:
   <div class="lightbox-modal" id="lightbox-modal" onclick="closeLightbox(event)">
     <div class="lightbox-content">
       <div class="lightbox-close" onclick="closeLightboxDirect()">✕</div>
       <img id="lightbox-img" src="" alt="Enlarged Diagram Preview">
     </div>
   </div>
   And openLightbox(src), closeLightbox(e), closeLightboxDirect() JavaScript functions.
5. INTERACTIVE GAMIFICATION:
   You MUST embed at least one rich gamified interactive component within the lesson (e.g. on Screen 3, 4, or 5).
   - Pattern A: Multi-Category Pill Classifier (test knowledge with instant visual green/red feedback and score addition).
   - Pattern B: Strategic Scenario Simulator (high-stakes decision dilemma with dynamic live metric gauge/equity meter that adjusts on choice).
   - Pattern C: Perceptual Radar / Quadrant Matrix.
   Gamification must call window.ScormAdapter.saveProgress(location, currentScore, isCompleted) when learners interact.
6. SCORM API INTEGRATION:
   Link <script src="js/scormAPI.js"></script> in <head>.
   The JavaScript must initialize on load and save location + score on screen change:
   if (window.ScormAdapter) { window.ScormAdapter.saveProgress('screen_' + currentScreen, Math.round(pct), false); }
   On completion, calls window.ScormAdapter.saveProgress('lesson_completed', 100, true);
7. OUTPUT FORMAT:
   Return valid JSON containing two keys: "indexHtml" (string) and "manifestXml" (string).`;

  const mediaListFormatted = mediaAssets.map((m, idx) => {
    return `- Asset #${idx + 1}: Type: ${m.type.toUpperCase()}, Caption: "${m.caption}", URL: "${m.url}", Target Screen: ${m.targetScreen === 0 ? 'Auto-Align' : 'Screen ' + m.targetScreen}`;
  }).join('\n');

  const userPrompt = `Generate a complete, production-ready SCORM package for the following course:

COURSE TITLE: ${courseTitle}
MODULE: ${moduleBadge}
LESSON TITLE: ${lessonTitle}
SCORM STANDARD: SCORM ${settings.scormVersion}
SCREEN COUNT TARGET: ${settings.targetScreens} Screens
LAYOUT: ${settings.layout === 'no-scroll' ? 'No-Scroll Paginated Deck (94vh fixed viewport)' : 'Single Page Continuous Scroll'}
GAMIFICATION: ${settings.gamification ? 'ENABLED (' + settings.selectedPatterns.join(', ') + ')' : 'DISABLED'}
LIGHTBOX MODAL: ${settings.lightbox ? 'ENABLED' : 'DISABLED'}
CUSTOM INSTRUCTOR DIRECTIVES:
${settings.customInstructions || 'Ensure clean typography, dark slate executive styling, high contrast, WCAG AA compliance, and engaging micro-learning layout.'}

MEDIA ASSETS:
${mediaAssets.length > 0 ? mediaListFormatted : 'No remote media assets provided. Generate modern SVG diagrams and visual cards.'}

SOURCE CURRICULUM TEXT:
"""
${lessonContent}
"""

Please synthesize this into exactly ${settings.targetScreens} complete screens.
Screen 1: Introduction, Objectives, Executive Hook, Module Context.
Screen 2: Core Fundamentals, Key Principles, Visual Concept Card/Diagram.
Screen 3: Applied Architecture, Deep Dive, Case Study or Framework Diagram (with Lightbox zoom).
${settings.targetScreens >= 5 ? 'Screen 4: Interactive Gamification Activity (' + (settings.selectedPatterns[0] || 'Strategic Scenario Simulator') + ') with dynamic scoring and immediate feedback.' : ''}
${settings.targetScreens >= 6 ? 'Screen 5: Advanced Tactical Nuances, Common Pitfalls, or Industry Benchmarks.' : ''}
Screen ${settings.targetScreens}: Key Takeaways, Action Checklist, and "Finish Lesson" completion trigger.

Remember: Output valid JSON with keys "indexHtml" and "manifestXml". No markdown wrap around the JSON.`;

  return { systemInstruction, userPrompt };
}

/**
 * High-fidelity deterministic generator when offline or fallback is needed.
 * Generates 100% valid, beautiful, complete SCORM packages matching the exact skill specifications.
 */
export function generateFallbackPackage(payload: {
  courseTitle: string;
  moduleBadge: string;
  lessonTitle: string;
  lessonContent: string;
  mediaAssets: MediaAsset[];
  settings: GeneratorSettings;
}): ScormPackageFiles {
  const { courseTitle, moduleBadge, lessonTitle, lessonContent, mediaAssets, settings } = payload;
  const numScreens = Math.max(4, Math.min(8, settings.targetScreens || 6));
  const manifestXml = generateManifestXml(courseTitle, lessonTitle, settings.scormVersion);

  // Parse paragraphs from lessonContent for dynamic injection
  const paragraphs = lessonContent
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0 && !p.startsWith('#'));

  const leadSummary = paragraphs[0] || `Master the essential competencies and strategic frameworks of ${lessonTitle}.`;
  const p1 = paragraphs[1] || `Understanding the foundational mechanics provides immediate operational leverage in real-world scenarios.`;
  const p2 = paragraphs[2] || `Strategic practitioners evaluate constraints, optimize telemetry, and implement defensible protocols.`;
  const p3 = paragraphs[3] || `Consistent execution requires continuous feedback, automated verification, and scenario-based decision making.`;
  const p4 = paragraphs[4] || `By aligning operational protocols with standard best practices, organizations safeguard long-term compliance.`;

  // Media helpers
  const primaryVideo = mediaAssets.find(m => m.type === 'video');
  const primaryImage = mediaAssets.find(m => m.type === 'image');

  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeXml(courseTitle)} - ${escapeXml(lessonTitle)}</title>
  <script src="js/scormAPI.js"></script>
  <style>
    * { box-sizing: border-box; }
    html, body {
      height: 100%;
      margin: 0;
      padding: 0;
      background: #090d16;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      color: #0f172a;
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
      border-radius: 14px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    header {
      background: #0f172a;
      color: #f8fafc;
      padding: 1rem 1.75rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #1e293b;
    }
    .header-left { display: flex; flex-direction: column; gap: 0.25rem; }
    .badge {
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 700;
      color: #38bdf8;
      background: rgba(56, 189, 248, 0.12);
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
      display: inline-block;
      width: fit-content;
    }
    .module-title { font-size: 1.15rem; font-weight: 700; color: #ffffff; }
    .screen-counter {
      font-size: 0.82rem;
      font-weight: 600;
      color: #94a3b8;
      background: #1e293b;
      padding: 0.35rem 0.75rem;
      border-radius: 8px;
    }
    .progress-bar-container { width: 100%; height: 4px; background: #e2e8f0; }
    .progress-fill { height: 100%; width: 16.6%; background: #2563eb; transition: width 0.3s ease; }
    .viewport {
      flex: 1;
      padding: 1.75rem 2.25rem;
      overflow-y: auto;
      position: relative;
      background: #f8fafc;
    }
    .screen { display: none; }
    .screen.active { display: block; animation: fadeIn 0.22s ease-in-out; }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    h2 { margin-top: 0; color: #0f172a; font-size: 1.6rem; font-weight: 800; letter-spacing: -0.02em; }
    h3 { color: #1e293b; font-size: 1.15rem; margin-top: 1.25rem; margin-bottom: 0.5rem; }
    p { color: #334155; line-height: 1.65; font-size: 0.98rem; margin: 0 0 1rem; }
    .card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem; margin: 1.25rem 0; }
    .info-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 1.25rem;
      box-shadow: 0 2px 6px rgba(0,0,0,0.03);
    }
    .info-card strong { color: #1e293b; display: block; margin-bottom: 0.4rem; font-size: 1.02rem; }
    .callout {
      background: #eff6ff;
      border-left: 4px solid #3b82f6;
      padding: 1rem 1.25rem;
      border-radius: 0 8px 8px 0;
      margin: 1.25rem 0;
    }
    .callout p { margin: 0; color: #1e40af; font-weight: 500; font-size: 0.95rem; }
    /* Media & Lightbox */
    .media-card {
      position: relative;
      background: #0f172a;
      border-radius: 10px;
      overflow: hidden;
      margin: 1.25rem 0;
      border: 1px solid #334155;
    }
    .media-card img, .media-card video { width: 100%; max-height: 280px; object-fit: cover; display: block; }
    .zoom-hint {
      position: absolute;
      top: 12px;
      right: 12px;
      background: rgba(15, 23, 42, 0.85);
      color: #ffffff;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.35rem 0.65rem;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      backdrop-filter: blur(6px);
      transition: background 0.15s;
    }
    .zoom-hint:hover { background: #2563eb; }
    .media-caption {
      padding: 0.6rem 1rem;
      font-size: 0.82rem;
      color: #94a3b8;
      background: #0f172a;
      margin: 0;
      border-top: 1px solid #1e293b;
    }
    /* Gamification Components */
    .game-zone {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      padding: 1.5rem;
      margin: 1.25rem 0;
      box-shadow: 0 4px 14px rgba(0,0,0,0.05);
    }
    .game-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .game-score-badge {
      background: #10b981;
      color: #ffffff;
      font-weight: 700;
      font-size: 0.85rem;
      padding: 0.35rem 0.75rem;
      border-radius: 20px;
    }
    .game-item {
      background: #f1f5f9;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }
    .game-btn-group { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .btn-pill {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      color: #1e293b;
      padding: 0.45rem 1rem;
      font-size: 0.85rem;
      font-weight: 600;
      border-radius: 9999px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .btn-pill:hover { background: #e2e8f0; border-color: #94a3b8; }
    .btn-pill.correct { background: #16a34a !important; color: #ffffff !important; border-color: #16a34a !important; }
    .btn-pill.wrong { background: #dc2626 !important; color: #ffffff !important; border-color: #dc2626 !important; }
    /* Simulator Gauge */
    .sim-meter-bar { height: 10px; background: #e2e8f0; border-radius: 6px; overflow: hidden; margin: 0.75rem 0 1.25rem; }
    .sim-meter-fill { height: 100%; width: 70%; background: #3b82f6; transition: width 0.4s ease, background 0.4s ease; }
    /* Pinned Footer */
    footer {
      background: #ffffff;
      padding: 1rem 1.75rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #e2e8f0;
    }
    .btn-nav {
      background: #0f172a;
      color: #ffffff;
      border: none;
      padding: 0.65rem 1.4rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.92rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.15s;
    }
    .btn-nav:hover:not(:disabled) { background: #1e293b; transform: translateY(-1px); }
    .btn-nav:disabled { opacity: 0.4; cursor: not-allowed; }
    .btn-next { background: #2563eb; }
    .btn-next:hover:not(:disabled) { background: #1d4ed8; }
    .status-hint { font-size: 0.82rem; color: #64748b; font-weight: 500; }
    /* Lightbox Modal */
    .lightbox-modal {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(9, 13, 22, 0.94);
      backdrop-filter: blur(8px);
      z-index: 9999;
      justify-content: center;
      align-items: center;
      padding: 2rem;
    }
    .lightbox-modal.active { display: flex; }
    .lightbox-content { max-width: 90vw; max-height: 88vh; position: relative; }
    .lightbox-content img {
      max-width: 100%;
      max-height: 85vh;
      border-radius: 10px;
      box-shadow: 0 25px 60px rgba(0,0,0,0.8);
      border: 1px solid rgba(255,255,255,0.2);
      display: block;
    }
    .lightbox-close {
      position: absolute;
      top: -14px;
      right: -14px;
      background: #ef4444;
      color: #fff;
      border: 2px solid #ffffff;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      font-size: 1.1rem;
      font-weight: 800;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    }
    .completion-banner {
      display: none;
      background: #dcfce7;
      border: 2px solid #22c55e;
      color: #15803d;
      padding: 1.5rem;
      border-radius: 10px;
      text-align: center;
      margin: 1.5rem 0;
    }
    .completion-banner h3 { color: #166534; margin: 0 0 0.5rem; }
  </style>
</head>
<body>
  <div class="deck-container">
    <header>
      <div class="header-left">
        <span class="badge">${escapeXml(moduleBadge || 'Module 1')} &bull; Lesson ${escapeXml(lessonTitle)}</span>
        <div class="module-title">${escapeXml(courseTitle)}</div>
      </div>
      <div class="screen-counter" id="screen-counter">Screen 1 of ${numScreens}</div>
    </header>

    <div class="progress-bar-container">
      <div class="progress-fill" id="progress-fill"></div>
    </div>

    <div class="viewport" id="viewport">
      <!-- Screen 1: Overview & Orientation -->
      <section class="screen active" data-screen="1">
        <h2>${escapeXml(lessonTitle)}</h2>
        <div class="callout">
          <p>🎯 <strong>Objective:</strong> Master executive principles, navigate critical operational workflows, and execute with verified telemetry.</p>
        </div>
        <p>${escapeXml(leadSummary)}</p>
        
        <div class="card-grid">
          <div class="info-card">
            <strong>1. Foundational Doctrine</strong>
            <p style="font-size:0.88rem; margin:0;">Core operational primitives and strategic guardrails designed to minimize systemic risk.</p>
          </div>
          <div class="info-card">
            <strong>2. Applied Decision Matrix</strong>
            <p style="font-size:0.88rem; margin:0;">Real-time prioritization techniques balancing risk exposure against velocity.</p>
          </div>
          <div class="info-card">
            <strong>3. Verified LMS Telemetry</strong>
            <p style="font-size:0.88rem; margin:0;">Continuous progression tracking through SCORM API compliance protocols.</p>
          </div>
        </div>

        <p style="font-size:0.88rem; color:#64748b; margin-top:1.5rem;">Use the <strong>Next</strong> button or your keyboard right-arrow (&rarr;) to advance through each screen.</p>
      </section>

      <!-- Screen 2: Deep Dive & Fundamentals -->
      <section class="screen" data-screen="2">
        <h2>Core Fundamentals & Governance</h2>
        <p>${escapeXml(p1)}</p>
        
        ${primaryVideo ? `
        <div class="media-card">
          <video controls preload="metadata" playsinline>
            <source src="${primaryVideo.url}" type="video/mp4">
            Your browser does not support HTML5 video.
          </video>
          <p class="media-caption">📹 ${escapeXml(primaryVideo.caption || 'Operational Briefing Video')}</p>
        </div>
        ` : `
        <div class="callout" style="background:#f8fafc; border-left: 4px solid #0f172a;">
          <p style="color:#0f172a;">💡 <strong>Key Tenet:</strong> Decouple emotional reaction from protocol execution. Standard operating procedures safeguard quality when stress levels peak.</p>
        </div>
        `}

        <p>${escapeXml(p2)}</p>
      </section>

      <!-- Screen 3: Architecture Framework & Visual Inspection -->
      <section class="screen" data-screen="3">
        <h2>Architecture & Decision Framework</h2>
        <p>${escapeXml(p3)}</p>

        <div class="media-card">
          <div class="zoom-hint" onclick="openLightbox('${primaryImage ? primaryImage.url : 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80'}')">
            🔍 Click to Enlarge Diagram
          </div>
          <img src="${primaryImage ? primaryImage.url : 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80'}" 
               alt="Framework Architecture Matrix"
               onclick="openLightbox(this.src)">
          <p class="media-caption">Figure 3.1: ${escapeXml(primaryImage ? primaryImage.caption : 'Standard Operating Continuum and Telemetry Architecture')} (Click to expand high-res)</p>
        </div>

        <p>${escapeXml(p4)}</p>
      </section>

      <!-- Screen 4: Gamified Cognitive Interaction -->
      <section class="screen" data-screen="4">
        <h2>Executive Challenge: Decision Simulator</h2>
        <p>Analyze the operational scenario below. Your choice affects both the tactical outcome and organizational equity score transmitted to the LMS.</p>

        <div class="game-zone">
          <div class="game-header">
            <div>
              <span style="font-weight:700; color:#0f172a; font-size:1.05rem;">Organizational Health Meter</span>
              <div style="font-size:0.82rem; color:#64748b;">Threshold required for passing: 70%</div>
            </div>
            <div class="game-score-badge" id="meter-score-badge">Health: 75%</div>
          </div>

          <div class="sim-meter-bar">
            <div class="sim-meter-fill" id="sim-meter-fill" style="width: 75%;"></div>
          </div>

          <div class="game-item" id="sim-scenario-box">
            <strong style="color:#0f172a; font-size:0.96rem;">Dilemma: Critical Telemetry Discrepancy Detected</strong>
            <p style="margin:0; font-size:0.9rem; color:#475569;">
              During a routine sprint audit, an unverified configuration bypass is discovered. Fixing it now introduces a 2-hour deployment delay, but ignoring it creates an audit liability.
            </p>
            <div class="game-btn-group" id="decision-buttons" style="margin-top:0.5rem;">
              <button class="btn-pill" onclick="handleDecision(this, 25, 'Pass: Immediate remediation preserves compliance and systemic resilience (+25% Health).', true)">
                ✅ Halt & Remediate (Prioritize Integrity)
              </button>
              <button class="btn-pill" onclick="handleDecision(this, -35, 'Fail: Bypassing protocols creates unmitigated audit risk (-35% Health).', false)">
                ❌ Ship Anyway (Prioritize Speed)
              </button>
            </div>
            <div id="decision-feedback" style="display:none; font-size:0.88rem; font-weight:600; padding:0.6rem 0.8rem; border-radius:6px; margin-top:0.4rem;"></div>
          </div>

          <!-- Multi-Pill Classifier Challenge -->
          <div style="margin-top: 1.25rem;">
            <strong style="color:#0f172a; font-size:0.95rem; display:block; margin-bottom:0.5rem;">Concept Classification: Categorize this operational rule:</strong>
            <div class="game-item">
              <span style="font-size:0.92rem; font-weight:500;">"All telemetry logs must be sealed and cryptographically signed before transmission":</span>
              <div class="game-btn-group">
                <button class="btn-pill" onclick="checkClassification(this, false)">Operational Guideline</button>
                <button class="btn-pill" onclick="checkClassification(this, true)">Mandatory Policy</button>
                <button class="btn-pill" onclick="checkClassification(this, false)">Optional Recommendation</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Screen 5: Pitfalls & Best Practices (if numScreens >= 6) -->
      ${numScreens >= 6 ? `
      <section class="screen" data-screen="5">
        <h2>Common Anti-Patterns & Risk Mitigations</h2>
        <p>High-performing teams avoid common traps by enforcing standardized checklists before committing changes:</p>
        
        <div class="card-grid">
          <div class="info-card" style="border-left:4px solid #ef4444;">
            <strong style="color:#dc2626;">Anti-Pattern: Siloed Telemetry</strong>
            <p style="font-size:0.88rem; margin:0;">Failing to synchronize lesson progress with the SCORM Data Model leads to lost learner progress and inaccurate LMS reporting.</p>
          </div>
          <div class="info-card" style="border-left:4px solid #f59e0b;">
            <strong style="color:#d97706;">Anti-Pattern: Citation Clutter</strong>
            <p style="font-size:0.88rem; margin:0;">Overloading instructional content with academic brackets distracts from core experiential comprehension.</p>
          </div>
          <div class="info-card" style="border-left:4px solid #10b981;">
            <strong style="color:#059669;">Best Practice: Active Gamification</strong>
            <p style="font-size:0.88rem; margin:0;">Incorporate immediate formative checks to reinforce retention without interrupting flow.</p>
          </div>
        </div>
      </section>
      ` : ''}

      <!-- Screen N: Completion & LMS Commit -->
      <section class="screen" data-screen="${numScreens}">
        <h2>Lesson Summary & Certification</h2>
        <p>Congratulations! You have successfully reviewed all foundational doctrines, analyzed architecture frameworks, and completed the operational simulator challenge.</p>

        <div class="card-grid">
          <div class="info-card">
            <strong>✅ Doctrine Verified</strong>
            <p style="font-size:0.86rem; margin:0;">Mastered core fundamentals and risk boundaries.</p>
          </div>
          <div class="info-card">
            <strong>✅ Telemetry Recorded</strong>
            <p style="font-size:0.86rem; margin:0;">Session location and score queued for LMS commit.</p>
          </div>
          <div class="info-card">
            <strong>✅ SCORM Compliant</strong>
            <p style="font-size:0.86rem; margin:0;">Ready for official gradebook synchronization.</p>
          </div>
        </div>

        <div class="completion-banner" id="completion-banner">
          <h3>🎉 Lesson Complete!</h3>
          <p style="margin:0;">Your completion status (passed) and final score have been committed to the Learning Management System.</p>
        </div>

        <div class="callout" style="background:#f1f5f9; border-left:4px solid #2563eb;">
          <p style="color:#1e293b; margin:0;">Click the green <strong>Finish Lesson ✓</strong> button below to permanently transmit your score to the LMS.</p>
        </div>
      </section>
    </div>

    <footer>
      <button class="btn-nav" id="btn-prev" onclick="navigateScreen(-1)" disabled>
        &#8592; Previous
      </button>
      <div id="status-hint" class="status-hint">Navigate through all screens to record completion.</div>
      <button class="btn-nav btn-next" id="btn-next" onclick="navigateScreen(1)">
        Next &#8594;
      </button>
    </footer>
  </div>

  <!-- Global Lightbox Modal -->
  <div class="lightbox-modal" id="lightbox-modal" onclick="closeLightbox(event)">
    <div class="lightbox-content">
      <div class="lightbox-close" onclick="closeLightboxDirect()">✕</div>
      <img id="lightbox-img" src="" alt="Enlarged Diagram Preview">
    </div>
  </div>

  <script>
    var currentScreen = 1;
    var totalScreens = ${numScreens};
    var currentScore = 80;

    function updateUI() {
      document.querySelectorAll('.screen').forEach(function(s) {
        s.classList.remove('active');
      });
      var activeScreen = document.querySelector('.screen[data-screen="' + currentScreen + '"]');
      if (activeScreen) activeScreen.classList.add('active');

      document.getElementById('viewport').scrollTop = 0;
      document.getElementById('screen-counter').textContent = 'Screen ' + currentScreen + ' of ' + totalScreens;
      
      var pct = Math.round((currentScreen / totalScreens) * 100);
      document.getElementById('progress-fill').style.width = pct + '%';

      document.getElementById('btn-prev').disabled = (currentScreen === 1);
      var nextBtn = document.getElementById('btn-next');
      if (currentScreen === totalScreens) {
        nextBtn.textContent = "Finish Lesson ✓";
        nextBtn.style.background = "#16a34a";
      } else {
        nextBtn.innerHTML = "Next &#8594;";
        nextBtn.style.background = "#2563eb";
      }

      if (window.ScormAdapter) {
        window.ScormAdapter.saveProgress('screen_' + currentScreen, currentScore, false);
      }
    }

    function navigateScreen(delta) {
      if (currentScreen === totalScreens && delta > 0) {
        completeLesson();
        return;
      }
      var target = currentScreen + delta;
      if (target >= 1 && target <= totalScreens) {
        currentScreen = target;
        updateUI();
      }
    }

    function completeLesson() {
      if (window.ScormAdapter) {
        window.ScormAdapter.saveProgress("lesson_completed", Math.min(100, Math.max(0, currentScore)), true);
      }
      var banner = document.getElementById('completion-banner');
      if (banner) banner.style.display = "block";
      var nextBtn = document.getElementById('btn-next');
      nextBtn.disabled = true;
      nextBtn.style.opacity = "0.7";
      document.getElementById('status-hint').textContent = "Lesson finished and recorded with LMS.";
    }

    /* Lightbox modal functions */
    function openLightbox(src) {
      var modal = document.getElementById('lightbox-modal');
      var img = document.getElementById('lightbox-img');
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

    /* Gamification handlers */
    function handleDecision(btn, delta, feedbackText, isPositive) {
      currentScore = Math.min(100, Math.max(10, currentScore + delta));
      var fill = document.getElementById('sim-meter-fill');
      var badge = document.getElementById('meter-score-badge');
      if (fill) {
        fill.style.width = currentScore + '%';
        fill.style.background = currentScore >= 70 ? '#10b981' : '#ef4444';
      }
      if (badge) {
        badge.textContent = 'Health: ' + currentScore + '%';
        badge.style.background = currentScore >= 70 ? '#10b981' : '#ef4444';
      }

      var fb = document.getElementById('decision-feedback');
      fb.style.display = 'block';
      fb.textContent = feedbackText;
      fb.style.background = isPositive ? '#dcfce7' : '#fee2e2';
      fb.style.color = isPositive ? '#166534' : '#991b1b';

      var buttons = document.querySelectorAll('#decision-buttons .btn-pill');
      buttons.forEach(function(b) { b.disabled = true; });
      btn.classList.add(isPositive ? 'correct' : 'wrong');

      if (window.ScormAdapter) {
        window.ScormAdapter.saveProgress('screen_' + currentScreen, currentScore, false);
      }
    }

    function checkClassification(btn, isCorrect) {
      if (isCorrect) {
        btn.classList.add('correct');
        currentScore = Math.min(100, currentScore + 10);
      } else {
        btn.classList.add('wrong');
        currentScore = Math.max(10, currentScore - 5);
      }
      var parent = btn.parentElement;
      var siblings = parent.querySelectorAll('.btn-pill');
      siblings.forEach(function(s) { s.disabled = true; });

      if (window.ScormAdapter) {
        window.ScormAdapter.saveProgress('screen_' + currentScreen, currentScore, false);
      }
    }

    window.addEventListener('keydown', function(e) {
      if (e.key === "ArrowRight") navigateScreen(1);
      if (e.key === "ArrowLeft") navigateScreen(-1);
      if (e.key === "Escape") closeLightboxDirect();
    });

    // Initialize layout
    updateUI();
  </script>
</body>
</html>`;

  return {
    'index.html': indexHtml,
    'imsmanifest.xml': manifestXml,
    'js/scormAPI.js': UNIVERSAL_SCORM_API_JS,
    'source_context.json': JSON.stringify({
      courseTitle,
      moduleBadge,
      lessonTitle,
      settings,
      mediaCount: mediaAssets.length,
      generatedAt: new Date().toISOString(),
      standardsCompliance: {
        scormVersion: settings.scormVersion,
        noScrollDeck: true,
        lightboxZoom: settings.lightbox,
        gamifiedTelemetry: settings.gamification,
      }
    }, null, 2)
  };
}
