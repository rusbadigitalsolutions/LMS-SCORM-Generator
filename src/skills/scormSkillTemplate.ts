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
  return String(unsafe || '').replace(/[<>&'"]/g, (c) => {
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

  const systemInstruction = `You are the SCORM Studio AI Engine, an elite e-learning software architect and instructional designer.
You transform raw curriculum text and media assets into production-grade, standalone SCORM 1.2 and SCORM 2004 interactive course packages (.zip contents) designed for modern LMS platforms (Canvas, Moodle, Blackboard, TalentLMS, SCORM Cloud).

CRITICAL INSTRUCTIONAL DESIGN & ARCHITECTURAL RULES:
1. CURRICULUM SYNTHESIS RULE (NEVER DUMP RAW TEXT):
   - The provided lesson text is RAW SOURCE MATERIAL ONLY. 
   - NEVER copy-paste the text verbatim as a massive wall of text or long introduction on Screen 1 or any screen!
   - You must synthesize and distill the core knowledge into short, punchy explanations (max 2 concise paragraphs or structured bullet cards per screen).
   - Screen 1 MUST be an executive briefing only:
     * A compelling 2-sentence hook explaining why this topic matters.
     * An objective callout box listing 2-3 concrete competencies the learner will gain.
     * A 3-column card grid summarizing the core module pillars.
     * TOTAL words on Screen 1 must be under 120 words.
2. STRICT NO-SCROLL VIEWPORT DISCIPLINE:
   - The course container has a fixed viewport (94vh, max 840px height, max-width 980px).
   - EVERY screen MUST fit cleanly inside this viewport without requiring vertical scrolling!
   - html, body { height: 100%; margin: 0; padding: 0; background: #090d16; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; justify-content: center; align-items: center; overflow: hidden; }
   - .viewport { flex: 1; padding: 1.5rem 2rem; overflow-y: auto; position: relative; }
   - .screen { display: none; } .screen.active { display: block; animation: fadeIn 0.22s ease-in-out; }
3. BLOCK-LEVEL LISTS ONLY (NO INLINE LISTS):
   - Every bulleted or numbered list MUST be formatted as proper block-level elements:
     ul, ol { display: block !important; margin: 0.75rem 0 1rem 1.25rem !important; padding-left: 1rem !important; list-style-type: disc !important; }
     li { display: list-item !important; margin-bottom: 0.5rem !important; line-height: 1.5 !important; color: #334155 !important; }
   - Or format lists as stylish individual cards (.info-card, .list-card).
   - NEVER concatenate list items into inline sentences or comma-separated paragraphs!
4. 100% MANDATORY MEDIA INCLUSION RULE:
   - You MUST embed EVERY SINGLE media asset provided in the MEDIA ASSETS list!
   - If the user provided 3 media assets (e.g. 2 videos and 1 infographic), each of the 3 media assets MUST be embedded onto its own dedicated screen!
   - Never omit, drop, or ignore any video or image.
   - For Videos:
     <div class="media-card">
       <video controls preload="metadata" playsinline>
         <source src="URL" type="video/mp4">
         Your browser does not support HTML5 video.
       </video>
       <p class="media-caption">📹 Caption</p>
     </div>
   - For Images/Diagrams:
     <div class="media-card">
       <div class="zoom-hint" onclick="openLightbox('URL')">🔍 Click to Enlarge Diagram</div>
       <img src="URL" alt="Caption" onclick="openLightbox(this.src)">
       <p class="media-caption">📊 Caption (Click to expand high-res)</p>
     </div>
5. RESPONSIVE IMAGE LIGHTBOX MODAL:
   Always include a global lightbox modal container right before </body>:
   <div class="lightbox-modal" id="lightbox-modal" onclick="closeLightbox(event)">
     <div class="lightbox-content">
       <div class="lightbox-close" onclick="closeLightboxDirect()">✕</div>
       <img id="lightbox-img" src="" alt="Enlarged Diagram Preview">
     </div>
   </div>
   And openLightbox(src), closeLightbox(e), closeLightboxDirect() JavaScript functions with Escape key handling.
6. ZERO CITATION RULE:
   Never include bracketed citations like [1], [2], footnote numbers, Wikipedia references, academic paper citations, or url markdown tags.
7. ACTIVE GAMIFIED TELEMETRY:
   Embed at least one rich interactive scenario or classifier (e.g. Multi-Category Pill Classifier, Strategic Scenario Simulator with live organizational health gauge).
   Gamification must invoke:
   window.ScormAdapter.saveProgress(location, currentScore, isCompleted);
8. SCORM API INTEGRATION:
   Link <script src="js/scormAPI.js"></script> in <head>.
   Save location on screen changes: ScormAdapter.saveProgress('screen_' + currentScreen, pct, false);
   On final screen "Finish Lesson ✓" click: ScormAdapter.saveProgress('lesson_completed', 100, true);
9. OUTPUT FORMAT:
   Return valid JSON containing two keys: "indexHtml" (string) and "manifestXml" (string). No markdown backticks.`;

  const mediaListFormatted = mediaAssets.map((m, idx) => {
    return `- Media Item #${idx + 1}: [TYPE: ${m.type.toUpperCase()}] Caption: "${m.caption}" | URL: "${m.url}" | Placement: ${m.targetScreen === 0 ? 'Auto-Distribute to Screen ' + (idx + 2) : 'Screen ' + m.targetScreen}`;
  }).join('\n');

  const userPrompt = `Generate a complete, production-grade SCORM package for the following course:

COURSE TITLE: ${courseTitle}
MODULE: ${moduleBadge}
LESSON TITLE: ${lessonTitle}
SCORM STANDARD: SCORM ${settings.scormVersion}
SCREEN COUNT TARGET: ${settings.targetScreens} Screens
LAYOUT: No-Scroll Paginated Deck (94vh fixed viewport)
GAMIFICATION: ${settings.gamification ? 'ENABLED (' + settings.selectedPatterns.join(', ') + ')' : 'DISABLED'}
LIGHTBOX MODAL: ${settings.lightbox ? 'ENABLED' : 'DISABLED'}
CUSTOM INSTRUCTOR DIRECTIVES:
${settings.customInstructions || 'Ensure clean typography, dark slate executive styling, high contrast, WCAG AA compliance, and engaging micro-learning layout.'}

MEDIA ASSETS TO EMBED (CRITICAL: ALL ${mediaAssets.length} ASSETS MUST BE EMBEDDED):
${mediaAssets.length > 0 ? mediaListFormatted : 'No remote media assets provided. Generate modern SVG diagrams and visual cards.'}

SOURCE CURRICULUM TEXT (SYNTHESIZE, DO NOT COPY AS A WALL OF TEXT):
"""
${lessonContent}
"""

DISTRIBUTION OF SCREENS:
- Screen 1: Executive Briefing & Orientation (Concise hook, 2-3 objective cards, max 120 words).
${mediaAssets.map((m, i) => `- Screen ${i + 2}: Dedicate to Media Item #${i + 1} (${m.type.toUpperCase()} - "${m.caption}") paired with synthesized instructional principles and block-level list takeaways.`).join('\n')}
${settings.targetScreens > mediaAssets.length + 2 ? `- Screen ${Math.min(settings.targetScreens - 1, mediaAssets.length + 2)}: Interactive Gamification Activity (${settings.selectedPatterns[0] || 'Decision Simulator'}) with instant feedback.` : ''}
- Screen ${settings.targetScreens}: Summary, Action Checklist, and "Finish Lesson ✓" completion trigger.

Remember:
1. Every list item MUST have display: list-item and proper margin, never inline.
2. Every media asset (${mediaAssets.length} total) MUST appear in the final package.
3. Every screen must fit within 94vh without scrolling.
4. Output valid JSON with keys "indexHtml" and "manifestXml".`;

  return { systemInstruction, userPrompt };
}

/**
 * Intelligent curriculum synthesizer for the deterministic engine.
 */
function extractCurriculumPillars(rawText: string, lessonTitle: string) {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  
  // Extract bullet points
  const bulletItems = lines
    .filter(l => /^[-*•]|\d+\.\s/.test(l))
    .map(l => l.replace(/^[-*•]\s*|\d+\.\s*/, '').trim());

  // Extract paragraphs (excluding headings and bullets)
  const paragraphs = rawText
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0 && !p.startsWith('#') && !/^[-*•]/.test(p));

  // Synthesize concise lead summary (max 2 clean sentences, under 180 chars)
  let lead = paragraphs[0] || `Master the operational principles, core frameworks, and decision protocols of ${lessonTitle}.`;
  if (lead.length > 200) {
    const sentences = lead.split(/(?<=[.?!])\s+/);
    lead = sentences.slice(0, 2).join(' ');
    if (lead.length > 220) {
      lead = lead.slice(0, 217) + '...';
    }
  }

  // Curate bullet items
  const cleanBullets = bulletItems.length >= 3 ? bulletItems.slice(0, 6) : [
    'Analyze core requirements and establish verified baseline metrics',
    'Deploy standard operating protocols to mitigate systemic vulnerability',
    'Enforce continuous feedback and automated LMS telemetry synchronization'
  ];

  return {
    leadSummary: lead,
    bullets: cleanBullets,
    concepts: paragraphs.slice(1, 6).map(p => {
      if (p.length > 220) {
        return p.split(/(?<=[.?!])\s+/).slice(0, 2).join(' ');
      }
      return p;
    }),
  };
}

/**
 * Renders HTML for any given MediaAsset (Video, Image, Audio)
 */
function renderMediaHtml(asset: MediaAsset): string {
  if (asset.type === 'video') {
    return `
      <div class="media-card">
        <video controls preload="metadata" playsinline>
          <source src="${escapeXml(asset.url)}" type="video/mp4">
          Your browser does not support HTML5 video.
        </video>
        <p class="media-caption">📹 ${escapeXml(asset.caption || 'Video Walkthrough')}</p>
      </div>`;
  }

  if (asset.type === 'audio') {
    return `
      <div class="media-card" style="padding: 1.25rem; background: #0f172a;">
        <audio controls style="width: 100%;">
          <source src="${escapeXml(asset.url)}" type="audio/mpeg">
          Your browser does not support HTML5 audio.
        </audio>
        <p class="media-caption">🎧 ${escapeXml(asset.caption || 'Audio Briefing')}</p>
      </div>`;
  }

  // Default Image / Infographic with Lightbox
  return `
    <div class="media-card">
      <div class="zoom-hint" onclick="openLightbox('${escapeXml(asset.url)}')">
        🔍 Click to Enlarge Diagram
      </div>
      <img src="${escapeXml(asset.url)}" 
           alt="${escapeXml(asset.caption || 'Infographic Diagram')}"
           onclick="openLightbox(this.src)">
      <p class="media-caption">📊 ${escapeXml(asset.caption || 'Figure Diagram')} (Click to expand high-res)</p>
    </div>`;
}

/**
 * High-fidelity deterministic generator when offline or fallback is needed.
 * Incorporates 100% of attached media assets, strict No-Scroll layout, and block-level list formatting.
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
  
  // Calculate total screens needed: ensure enough screens to feature EVERY media asset + intro + game + summary
  const minRequiredScreens = Math.max(4, mediaAssets.length + 3);
  const numScreens = Math.max(minRequiredScreens, Math.min(8, settings.targetScreens || 6));
  const manifestXml = generateManifestXml(courseTitle, lessonTitle, settings.scormVersion);

  const { leadSummary, bullets, concepts } = extractCurriculumPillars(lessonContent, lessonTitle);

  // Map every media asset to a screen index (1-based, starting at screen 2)
  const mediaByScreen: Record<number, MediaAsset[]> = {};
  mediaAssets.forEach((asset, idx) => {
    let screenNum = asset.targetScreen;
    if (screenNum <= 1 || screenNum >= numScreens) {
      // Auto-distribute evenly across middle screens
      screenNum = Math.min(numScreens - 1, idx + 2);
    }
    if (!mediaByScreen[screenNum]) {
      mediaByScreen[screenNum] = [];
    }
    mediaByScreen[screenNum].push(asset);
  });

  // Ensure any media assets that weren't assigned get allocated
  mediaAssets.forEach((asset, idx) => {
    const isPlaced = Object.values(mediaByScreen).some(arr => arr.includes(asset));
    if (!isPlaced) {
      const fallbackScreen = Math.min(numScreens - 1, idx + 2);
      if (!mediaByScreen[fallbackScreen]) mediaByScreen[fallbackScreen] = [];
      mediaByScreen[fallbackScreen].push(asset);
    }
  });

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
      padding: 0.9rem 1.75rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #1e293b;
      flex-shrink: 0;
    }
    .header-left { display: flex; flex-direction: column; gap: 0.2rem; }
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
    .module-title { font-size: 1.12rem; font-weight: 700; color: #ffffff; }
    .screen-counter {
      font-size: 0.82rem;
      font-weight: 600;
      color: #94a3b8;
      background: #1e293b;
      padding: 0.35rem 0.75rem;
      border-radius: 8px;
    }
    .progress-bar-container { width: 100%; height: 4px; background: #e2e8f0; flex-shrink: 0; }
    .progress-fill { height: 100%; width: 16.6%; background: #2563eb; transition: width 0.3s ease; }
    .viewport {
      flex: 1;
      padding: 1.5rem 2.25rem;
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
    h2 { margin-top: 0; color: #0f172a; font-size: 1.45rem; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 0.6rem; }
    h3 { color: #1e293b; font-size: 1.05rem; margin-top: 1rem; margin-bottom: 0.4rem; font-weight: 700; }
    p { color: #334155; line-height: 1.6; font-size: 0.94rem; margin: 0 0 0.85rem; }
    
    /* Strict Block-level list styling */
    ul, ol {
      display: block !important;
      margin: 0.75rem 0 1rem 1.25rem !important;
      padding-left: 1rem !important;
      list-style-type: disc !important;
    }
    ol { list-style-type: decimal !important; }
    li {
      display: list-item !important;
      margin-bottom: 0.5rem !important;
      line-height: 1.55 !important;
      color: #334155 !important;
      font-size: 0.92rem;
    }

    .card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 0.85rem; margin: 1rem 0; }
    .info-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 1rem 1.15rem;
      box-shadow: 0 2px 6px rgba(0,0,0,0.03);
    }
    .info-card strong { color: #0f172a; display: block; margin-bottom: 0.3rem; font-size: 0.96rem; }
    .info-card p { margin: 0; font-size: 0.86rem; color: #475569; line-height: 1.5; }
    
    .callout {
      background: #eff6ff;
      border-left: 4px solid #3b82f6;
      padding: 0.85rem 1.15rem;
      border-radius: 0 8px 8px 0;
      margin: 0.9rem 0;
    }
    .callout p { margin: 0; color: #1e40af; font-weight: 500; font-size: 0.92rem; }

    /* Media & Lightbox */
    .media-card {
      position: relative;
      background: #0f172a;
      border-radius: 10px;
      overflow: hidden;
      margin: 1rem 0;
      border: 1px solid #334155;
    }
    .media-card img, .media-card video { width: 100%; max-height: 250px; object-fit: contain; display: block; background: #020617; }
    .zoom-hint {
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(15, 23, 42, 0.85);
      color: #ffffff;
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.3rem 0.6rem;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      backdrop-filter: blur(6px);
      transition: background 0.15s;
      z-index: 2;
    }
    .zoom-hint:hover { background: #2563eb; }
    .media-caption {
      padding: 0.5rem 0.9rem;
      font-size: 0.8rem;
      color: #94a3b8;
      background: #0f172a;
      margin: 0;
      border-top: 1px solid #1e293b;
      font-weight: 500;
    }

    /* Gamification Components */
    .game-zone {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      padding: 1.25rem;
      margin: 1rem 0;
      box-shadow: 0 4px 14px rgba(0,0,0,0.05);
    }
    .game-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem; }
    .game-score-badge {
      background: #10b981;
      color: #ffffff;
      font-weight: 700;
      font-size: 0.82rem;
      padding: 0.3rem 0.7rem;
      border-radius: 20px;
    }
    .game-item {
      background: #f1f5f9;
      border-radius: 8px;
      padding: 0.9rem;
      margin-bottom: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .game-btn-group { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .btn-pill {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      color: #1e293b;
      padding: 0.4rem 0.9rem;
      font-size: 0.82rem;
      font-weight: 600;
      border-radius: 9999px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .btn-pill:hover { background: #e2e8f0; border-color: #94a3b8; }
    .btn-pill.correct { background: #16a34a !important; color: #ffffff !important; border-color: #16a34a !important; }
    .btn-pill.wrong { background: #dc2626 !important; color: #ffffff !important; border-color: #dc2626 !important; }
    .sim-meter-bar { height: 9px; background: #e2e8f0; border-radius: 6px; overflow: hidden; margin: 0.6rem 0 1rem; }
    .sim-meter-fill { height: 100%; width: 75%; background: #3b82f6; transition: width 0.4s ease, background 0.4s ease; }

    /* Pinned Footer */
    footer {
      background: #ffffff;
      padding: 0.9rem 1.75rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #e2e8f0;
      flex-shrink: 0;
    }
    .btn-nav {
      background: #0f172a;
      color: #ffffff;
      border: none;
      padding: 0.6rem 1.3rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.88rem;
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
    .status-hint { font-size: 0.8rem; color: #64748b; font-weight: 500; }

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
      width: 32px;
      height: 32px;
      border-radius: 50%;
      font-size: 1rem;
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
      padding: 1.25rem;
      border-radius: 10px;
      text-align: center;
      margin: 1.25rem 0;
    }
    .completion-banner h3 { color: #166534; margin: 0 0 0.4rem; }
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
      <!-- Screen 1: Executive Briefing & Orientation (Strictly under 120 words, zero scrolling) -->
      <section class="screen active" data-screen="1">
        <h2>${escapeXml(lessonTitle)}: Executive Briefing</h2>
        
        <div class="callout">
          <p>🎯 <strong>Learning Objectives:</strong> Master strategic workflows, execute tactical decisions, and verify competencies through live telemetry.</p>
        </div>

        <p>${escapeXml(leadSummary)}</p>
        
        <div class="card-grid">
          <div class="info-card">
            <strong>1. Foundational Core</strong>
            <p>Master the architectural principles and operational guardrails required for execution.</p>
          </div>
          <div class="info-card">
            <strong>2. Visual & Media Walkthroughs</strong>
            <p>Inspect multi-angle video briefings, diagrams, and responsive technical infographics.</p>
          </div>
          <div class="info-card">
            <strong>3. Interactive Telemetry</strong>
            <p>Apply competencies through decision simulators and sync completion with the LMS.</p>
          </div>
        </div>

        <p style="font-size:0.84rem; color:#64748b; margin-top:1.25rem;">
          Press <strong>Next &#8594;</strong> or use your keyboard right-arrow to begin Screen 2.
        </p>
      </section>

      <!-- Middle Screens: Guaranteed placement of all media assets + concepts -->
      ${Array.from({ length: numScreens - 2 }, (_, idx) => {
        const screenIndex = idx + 2;
        const screenMedia = mediaByScreen[screenIndex] || [];
        const conceptText = concepts[idx] || `Consistent application of these frameworks eliminates ambiguity and delivers verifiable results across enterprise environments.`;
        
        // If this is the designated gamification screen (usually second-to-last screen)
        const isGameScreen = (screenIndex === numScreens - 1 && settings.gamification);

        if (isGameScreen) {
          return `
          <!-- Screen ${screenIndex}: Interactive Gamification & Decision Simulator -->
          <section class="screen" data-screen="${screenIndex}">
            <h2>Interactive Checkpoint: Strategic Decision Simulator</h2>
            <p>Analyze the operational dilemma below. Your decision directly modulates organizational health and transmits your score to the LMS.</p>

            <div class="game-zone">
              <div class="game-header">
                <div>
                  <span style="font-weight:700; color:#0f172a; font-size:1rem;">Organizational Health Gauge</span>
                  <div style="font-size:0.8rem; color:#64748b;">LMS passing threshold: 70%</div>
                </div>
                <div class="game-score-badge" id="meter-score-badge">Health: 75%</div>
              </div>

              <div class="sim-meter-bar">
                <div class="sim-meter-fill" id="sim-meter-fill" style="width: 75%;"></div>
              </div>

              <div class="game-item" id="sim-scenario-box">
                <strong style="color:#0f172a; font-size:0.94rem;">Operational Dilemma: Critical Protocol Bypass Detected</strong>
                <p style="margin:0; font-size:0.88rem; color:#475569;">
                  An unverified shortcut was discovered during execution. Halting for remediation delays delivery by 2 hours, but proceeding without audit risks systemic failure.
                </p>
                <div class="game-btn-group" id="decision-buttons" style="margin-top:0.4rem;">
                  <button class="btn-pill" onclick="handleDecision(this, 25, '✅ Pass: Remediating preserves systemic integrity (+25% Health).', true)">
                    Halt & Remediate (Prioritize Integrity)
                  </button>
                  <button class="btn-pill" onclick="handleDecision(this, -35, '❌ Fail: Bypassing creates critical unmitigated risk (-35% Health).', false)">
                    Deploy Immediately (Prioritize Velocity)
                  </button>
                </div>
                <div id="decision-feedback" style="display:none; font-size:0.85rem; font-weight:600; padding:0.5rem 0.75rem; border-radius:6px; margin-top:0.4rem;"></div>
              </div>

              <!-- Pill Classifier -->
              <div style="margin-top: 1rem;">
                <strong style="color:#0f172a; font-size:0.92rem; display:block; margin-bottom:0.4rem;">Knowledge Check: Categorize this requirement:</strong>
                <div class="game-item">
                  <span style="font-size:0.88rem; font-weight:500;">"Audit logs must be cryptographically timestamped and committed on completion":</span>
                  <div class="game-btn-group">
                    <button class="btn-pill" onclick="checkClassification(this, false)">Optional Recommendation</button>
                    <button class="btn-pill" onclick="checkClassification(this, true)">Mandatory Policy</button>
                    <button class="btn-pill" onclick="checkClassification(this, false)">Informational Only</button>
                  </div>
                </div>
              </div>
            </div>
          </section>`;
        }

        // Standard instructional & media screen
        return `
        <!-- Screen ${screenIndex}: Tactical Module Screen -->
        <section class="screen" data-screen="${screenIndex}">
          <h2>${escapeXml(screenMedia.length > 0 ? screenMedia[0].caption : `Module Deep Dive: Core Protocols (Part ${idx + 1})`)}</h2>
          <p>${escapeXml(conceptText)}</p>

          ${screenMedia.map(m => renderMediaHtml(m)).join('\n')}

          <h3>Key Takeaways & Execution Rules</h3>
          <ul>
            ${bullets.slice(idx * 2, (idx * 2) + 2).map(b => `<li>${escapeXml(b)}</li>`).join('\n')}
          </ul>
        </section>`;
      }).join('\n')}

      <!-- Screen N: Completion & LMS Commit -->
      <section class="screen" data-screen="${numScreens}">
        <h2>Lesson Complete: Verification & Gradebook Commit</h2>
        <p>You have successfully completed all instruction screens, examined the media assets, and verified your competencies through the interactive checkpoint.</p>

        <div class="card-grid">
          <div class="info-card">
            <strong>✅ Competencies Verified</strong>
            <p>Core operational rules and tactical frameworks reviewed.</p>
          </div>
          <div class="info-card">
            <strong>✅ All Media Reviewed</strong>
            <p>All video briefings and architecture diagrams inspected.</p>
          </div>
          <div class="info-card">
            <strong>✅ Telemetry Ready</strong>
            <p>Score and completion status ready for LMS gradebook commit.</p>
          </div>
        </div>

        <div class="completion-banner" id="completion-banner">
          <h3>🎉 Progress Recorded with LMS!</h3>
          <p style="margin:0;">Status: <strong>passed</strong> &bull; Score committed to Learning Management System.</p>
        </div>

        <div class="callout" style="background:#f1f5f9; border-left:4px solid #16a34a; margin-top:1.25rem;">
          <p style="color:#1e293b; margin:0;">Click the green <strong>Finish Lesson ✓</strong> button below to permanently transmit your final score to the LMS gradebook.</p>
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
      embeddedMediaList: mediaAssets.map(m => ({ caption: m.caption, type: m.type, url: m.url })),
      generatedAt: new Date().toISOString(),
      standardsCompliance: {
        scormVersion: settings.scormVersion,
        noScrollDeck: true,
        lightboxZoom: settings.lightbox,
        gamifiedTelemetry: settings.gamification,
        allMediaEmbedded: true,
      }
    }, null, 2)
  };
}
