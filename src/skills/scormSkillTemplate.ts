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

  const systemInstruction = `You are the SCORM Studio AI Engine, an elite e-learning curriculum architect and instructional designer.
You transform raw source text into an intuitive, enlightened, interactive micro-learning journey packaged as a standalone SCORM 1.2 or SCORM 2004 web app.

CRITICAL PEDAGOGICAL & ARCHITECTURAL DIRECTIVES:
1. CURRICULUM DECOMPOSITION (NEVER COPY-PASTE A WALL OF TEXT):
   - The provided lesson text is raw background curriculum ONLY.
   - You must NOT dump raw paragraphs or multiple pages of text onto any screen.
   - Screen 1 MUST be titled: "Introduction: ${lessonTitle}" (or Executive Orientation).
     * It MUST contain a concise 2-sentence hook synthesizing the introduction of the lesson.
     * A learning outcomes callout box stating 2-3 concrete competencies the learner will gain.
     * A 3-pillar roadmap grid previewing the upcoming topics.
     * TOTAL word count on Screen 1 must be under 120 words to strictly honor the No-Scroll viewport constraint.
2. SCREEN TITLES MUST BE INSTRUCTIONAL TOPICS (NEVER MEDIA CAPTIONS):
   - Every middle screen must have a clear, instructional topic title (h2) representing the core concept (e.g. "Core Operational Dilemma", "Strategic Governance Framework", "Applied Execution Protocols").
   - NEVER name a screen after a media caption or filename (e.g. NEVER make an h2 "Figure 1" or "Video 1")!
   - Media assets are supporting illustrative exhibits. Place them inside:
     <div class="media-card">...</div> with a figure caption below (e.g. "<p class='media-caption'>Exhibit 2.1: Operational Flowchart</p>").
3. BLOCK-LEVEL LISTS & INTUITIVE CHUNKING:
   - All bullet points and numbered lists MUST be formatted with proper block styling:
     ul, ol { display: block !important; margin: 0.75rem 0 1rem 1.25rem !important; padding-left: 1rem !important; list-style-type: disc !important; }
     li { display: list-item !important; margin-bottom: 0.5rem !important; line-height: 1.55 !important; color: #334155 !important; }
   - Never output lists as inline or comma-separated text.
4. 100% MANDATORY MEDIA INCLUSION:
   - Every single media asset in the MEDIA ASSETS list (${mediaAssets.length} total) MUST be embedded into the course deck on its appropriate screen.
   - For Videos:
     <div class="media-card">
       <video controls preload="metadata" playsinline>
         <source src="URL" type="video/mp4">
         Your browser does not support HTML5 video.
       </video>
       <p class="media-caption">📹 Exhibit: [Caption]</p>
     </div>
   - For Images/Diagrams:
     <div class="media-card">
       <div class="zoom-hint" onclick="openLightbox('URL')">🔍 Click to Enlarge Diagram</div>
       <img src="URL" alt="[Caption]" onclick="openLightbox(this.src)">
       <p class="media-caption">📊 Exhibit: [Caption] (Click to expand high-res)</p>
     </div>
5. STRICT NO-SCROLL VIEWPORT CONSTRAINT:
   - Fixed height container: 94vh (max 840px, max-width 980px).
   - Content on each screen MUST fit without requiring the user to scroll vertically.
6. INTERACTIVE GAMIFICATION & TELEMETRY:
   - Include an interactive Decision Simulator (Scenario Dilemma with dynamic Organizational Health Meter) or Multi-Category Pill Classifier.
   - Fire window.ScormAdapter.saveProgress(location, currentScore, isCompleted) on learner interactions.
7. SCORM API LINKAGE:
   - Link <script src="js/scormAPI.js"></script> in <head>.
   - Commit completion on the final screen button "Finish Lesson ✓".
8. OUTPUT FORMAT:
   - Output valid JSON only: { "indexHtml": "...", "manifestXml": "..." }. No markdown code fence wrap around the JSON.`;

  const mediaListFormatted = mediaAssets.map((m, idx) => {
    return `- Media Item #${idx + 1}: [TYPE: ${m.type.toUpperCase()}] Caption: "${m.caption}" | URL: "${m.url}" | Recommended Placement: ${m.targetScreen === 0 ? 'Screen ' + (idx + 2) : 'Screen ' + m.targetScreen}`;
  }).join('\n');

  const userPrompt = `Deconstruct and synthesize the following source curriculum into an enlightening, interactive SCORM course:

COURSE TITLE: ${courseTitle}
MODULE: ${moduleBadge}
LESSON TITLE: ${lessonTitle}
SCORM STANDARD: SCORM ${settings.scormVersion}
SCREEN COUNT TARGET: ${settings.targetScreens} Screens
LAYOUT: No-Scroll Paginated Deck (94vh fixed viewport)
GAMIFICATION: ${settings.gamification ? 'ENABLED (' + settings.selectedPatterns.join(', ') + ')' : 'DISABLED'}
LIGHTBOX MODAL: ${settings.lightbox ? 'ENABLED' : 'DISABLED'}
CUSTOM INSTRUCTOR DIRECTIVES:
${settings.customInstructions || 'Deliver clear pedagogical flow, executive micro-learning, zero academic citations, and high-contrast accessibility.'}

MEDIA ASSETS TO EMBED (ALL ${mediaAssets.length} MUST BE EMBEDDED):
${mediaAssets.length > 0 ? mediaListFormatted : 'No remote media assets provided. Generate modern SVG diagrams and visual cards.'}

SOURCE CURRICULUM TEXT:
"""
${lessonContent}
"""

PEDAGOGICAL STRUCTURE REQUIREMENTS:
1. Screen 1: Introduction: ${lessonTitle}
   - Clear executive hook synthesizing the introductory context from the text.
   - Objectives callout box with 2-3 bulleted competencies.
   - 3-card roadmap previewing upcoming core topics. Max 120 words total.
2. Screens 2 to ${settings.targetScreens - 1}:
   - Give each screen an instructional concept title (e.g., "Core Principles", "Strategic Framework", "Operational Playbook").
   - Pair concise explanations with supporting media exhibits and block-level key takeaway bullets.
   - Embed an interactive Decision Simulator or Knowledge Check on Screen ${Math.max(3, settings.targetScreens - 1)}.
3. Screen ${settings.targetScreens}: Certification & Action Plan
   - Action checklist, key takeaway cards, and "Finish Lesson ✓" SCORM commit.

Remember: Output valid JSON with keys "indexHtml" and "manifestXml".`;

  return { systemInstruction, userPrompt };
}

// -----------------------------------------------------------------------------------------
// Structural Curriculum Decomposer & Pedagogical Engine (Deterministic Fallback)
// -----------------------------------------------------------------------------------------

interface ParsedCurriculumTopic {
  title: string;
  summary: string;
  detail: string;
  takeaways: string[];
  interactivePrompt?: {
    question: string;
    options: { text: string; correct: boolean }[];
  };
}

/**
 * Parses raw lesson text into structured, coherent pedagogical modules.
 * Accurately extracts real titles, prevents text dumping, and aligns media as exhibits.
 */
function parseCurriculumStructure(rawText: string, lessonTitle: string): {
  introHook: string;
  objectives: string[];
  topics: ParsedCurriculumTopic[];
} {
  // Strip academic citations [1], [^2], url markdown tags
  const sanitized = (rawText || '')
    .replace(/\[\^?\d+\]/g, '')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .trim();

  const lines = sanitized.split('\n').map(l => l.trim());
  const paragraphs = sanitized
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  // Extract explicit bullet points
  const rawBullets = lines
    .filter(l => /^[-*•]|\d+\.\s/.test(l))
    .map(l => l.replace(/^[-*•]\s*|\d+\.\s*/, '').trim());

  const rawLines = sanitized.split(/\r?\n/).map(l => l.trim());
  interface RawSection {
    heading: string;
    paragraphs: string[];
    bullets: string[];
  }
  const sections: RawSection[] = [];
  let currentHeading = 'Introduction';
  let currentParas: string[] = [];
  let currentBullets: string[] = [];
  let currentParaBuffer: string[] = [];

  function flushPara() {
    if (currentParaBuffer.length > 0) {
      currentParas.push(currentParaBuffer.join(' '));
      currentParaBuffer = [];
    }
  }

  function flushSection() {
    flushPara();
    if (currentParas.length > 0 || currentBullets.length > 0) {
      sections.push({
        heading: currentHeading,
        paragraphs: [...currentParas],
        bullets: [...currentBullets]
      });
      currentParas = [];
      currentBullets = [];
    }
  }

  for (const line of rawLines) {
    if (!line) {
      flushPara();
      continue;
    }

    if (/^[-*•]|\d+\.\s/.test(line)) {
      flushPara();
      currentBullets.push(line.replace(/^[-*•]\s*|\d+\.\s*/, '').trim());
      continue;
    }

    const isMdHeading = /^#{1,4}\s+(.+)/.exec(line);
    const isNumberedHeading = /^(?:Section|Chapter|Part|Module|\d+[\.\:])\s*(.+)/i.exec(line);
    const isShortTitle = line.length < 55 && !line.includes('.') && (line.endsWith(':') || (/^[A-Z0-9\s—–\-]+$/.test(line) && line.length > 3));

    if (isMdHeading || isNumberedHeading || isShortTitle) {
      flushSection();
      currentHeading = (isMdHeading ? isMdHeading[1] : (isNumberedHeading ? isNumberedHeading[1] : line)).replace(/:$/, '').trim();
      continue;
    }

    currentParaBuffer.push(line);
  }
  flushSection();

  // 1. Synthesize Intro Hook & Objectives from the actual curriculum
  let introHook = '';
  if (sections.length > 0 && sections[0].paragraphs.length > 0) {
    introHook = sections[0].paragraphs[0];
  } else if (rawBullets.length > 0) {
    introHook = `Master the operational principles, core frameworks, and decision protocols of ${lessonTitle}.`;
  } else {
    introHook = `Master the foundational doctrines, risk parameters, and execution frameworks of ${lessonTitle}.`;
  }

  // Truncate intro hook if too long (max 2 clean sentences, under 180 chars)
  if (introHook.length > 180) {
    const sentences = introHook.split(/(?<=[.?!])\s+/);
    introHook = sentences.slice(0, 2).join(' ');
    if (introHook.length > 200) {
      introHook = introHook.slice(0, 197) + '...';
    }
  }

  // Synthesize 3 concrete learning objectives
  const objectives: string[] = rawBullets.length >= 3 
    ? rawBullets.slice(0, 3) 
    : [
      `Analyze core principles and evaluate risk constraints in ${lessonTitle}`,
      `Execute standardized operational protocols with verified quality guardrails`,
      `Apply decision frameworks to navigate complex real-world incident scenarios`
    ];

  // 2. Build Thematic Module Topics from Extracted Sections
  // Filter out introduction section from subsequent topic cards
  const topicSections = sections.filter((s, idx) => {
    const isIntro = idx === 0 || s.heading.toLowerCase().includes('introduction') || s.heading.toLowerCase().includes('overview');
    return !isIntro && (s.paragraphs.length > 0 || s.bullets.length > 0);
  });
  const topics: ParsedCurriculumTopic[] = [];

  if (topicSections.length >= 1) {
    topicSections.forEach((sec, idx) => {
      const summary = sec.paragraphs[0] || `Understanding the dynamics of ${sec.heading} provides essential operational leverage.`;
      const detail = sec.paragraphs[1] || `Consistent execution requires continuous feedback, automated verification, and scenario-based decision making.`;

      topics.push({
        title: `${idx + 1}. ${sec.heading}`,
        summary: summary.length > 220 ? summary.split(/(?<=[.?!])\s+/).slice(0, 2).join(' ') : summary,
        detail: detail.length > 220 ? detail.split(/(?<=[.?!])\s+/).slice(0, 2).join(' ') : detail,
        takeaways: sec.bullets.length >= 2 ? sec.bullets.slice(0, 4) : [
          `Prioritize baseline compliance before accelerating deployment velocity`,
          `Enforce cryptographic telemetry validation across all operational stages`,
          `Conduct systematic reviews to eliminate recurring anti-patterns`
        ],
        interactivePrompt: {
          question: `Regarding ${sec.heading}: What is the primary operational rule?`,
          options: [
            { text: 'Establishing proactive governance and repeatable quality', correct: true },
            { text: 'Maximizing delivery speed regardless of verification', correct: false },
            { text: 'Bypassing compliance audits to avoid schedule delays', correct: false },
          ]
        }
      });
    });
  } else {
    // If text lacked explicit headings, generate 4 pedagogical topic modules from the content
    const remainingParas = paragraphs.slice(1);
    const p1 = remainingParas[0] || `Foundational mechanics provide the baseline architecture for all subsequent operational workflows.`;
    const p2 = remainingParas[1] || `Strategic decision matrices allow teams to balance delivery pressure against structural integrity.`;
    const p3 = remainingParas[2] || `Automated telemetry and real-time observability ensure that divergence is detected prior to deployment.`;
    const p4 = remainingParas[3] || `Rigorous post-execution retrospectives transform isolated incidents into permanent organizational competencies.`;

    topics.push({
      title: '1. Foundational Architecture & Core Tenets',
      summary: p1.length > 220 ? p1.split(/(?<=[.?!])\s+/).slice(0, 2).join(' ') : p1,
      detail: `Operating without explicit architectural guardrails creates compounding technical debt and systemic fragility.`,
      takeaways: [
        'Define explicit boundaries and invariant operating standards',
        'Decouple emotional reaction from protocol execution',
        'Establish automated compliance checkpoints at critical handoffs'
      ],
      interactivePrompt: {
        question: 'When establishing foundational architecture, what takes precedence?',
        options: [
          { text: 'Defensible baseline standards and verified telemetry', correct: true },
          { text: 'Unverified feature velocity', correct: false },
          { text: 'Ad-hoc manual interventions', correct: false },
        ]
      }
    });

    topics.push({
      title: '2. Strategic Governance & Execution Frameworks',
      summary: p2.length > 220 ? p2.split(/(?<=[.?!])\s+/).slice(0, 2).join(' ') : p2,
      detail: `High-performing organizations employ standardized decision heuristics to resolve operational dilemmas in high-stakes environments.`,
      takeaways: [
        'Quantify trade-offs between velocity and systemic integrity',
        'Require cryptographic sign-off before committing state changes',
        'Maintain transparent escalation pathways for blocked protocols'
      ],
      interactivePrompt: {
        question: 'How should teams resolve conflict between speed and protocol compliance?',
        options: [
          { text: 'Halt and remediate to preserve systemic resilience', correct: true },
          { text: 'Deploy immediately and address audits later', correct: false },
          { text: 'Suppress warning telemetry to meet deadlines', correct: false },
        ]
      }
    });

    topics.push({
      title: '3. Technical Verification & Observability',
      summary: p3.length > 220 ? p3.split(/(?<=[.?!])\s+/).slice(0, 2).join(' ') : p3,
      detail: `Observability must be continuous and passive, automatically relaying milestone progress directly to the Learning Management System.`,
      takeaways: [
        'Stream SCORM data model mutations via standard CMI elements',
        'Validate learner interaction times and raw score increments',
        'Guarantee persistent commit on session unload'
      ],
    });

    topics.push({
      title: '4. Applied Incident Simulator & Risk Mitigation',
      summary: p4.length > 220 ? p4.split(/(?<=[.?!])\s+/).slice(0, 2).join(' ') : p4,
      detail: `Scenario-based learning cements mental models by exposing practitioners to consequences in safe, simulated sandbox conditions.`,
      takeaways: [
        'Run periodic simulation drills to stress-test team heuristics',
        'Audit post-incident root causes with blameless accountability',
        'Integrate lessons learned directly into automated test suites'
      ],
    });
  }

  return { introHook, objectives, topics };
}

/**
 * Renders an illustrative media exhibit inside a structured lesson card
 */
function renderMediaExhibitHtml(asset: MediaAsset, exhibitIndex: number): string {
  const caption = asset.caption || (asset.type === 'video' ? 'Instructional Video Briefing' : 'Architecture & Process Diagram');

  if (asset.type === 'video') {
    return `
      <div class="media-card">
        <video controls preload="metadata" playsinline>
          <source src="${escapeXml(asset.url)}" type="video/mp4">
          Your browser does not support HTML5 video.
        </video>
        <p class="media-caption">📹 Exhibit ${exhibitIndex}: ${escapeXml(caption)}</p>
      </div>`;
  }

  if (asset.type === 'audio') {
    return `
      <div class="media-card" style="padding: 1.25rem; background: #0f172a;">
        <audio controls style="width: 100%;">
          <source src="${escapeXml(asset.url)}" type="audio/mpeg">
          Your browser does not support HTML5 audio.
        </audio>
        <p class="media-caption">🎧 Exhibit ${exhibitIndex}: ${escapeXml(caption)}</p>
      </div>`;
  }

  // Default Image / Infographic with Lightbox
  return `
    <div class="media-card">
      <div class="zoom-hint" onclick="openLightbox('${escapeXml(asset.url)}')">
        🔍 Click to Enlarge Diagram
      </div>
      <img src="${escapeXml(asset.url)}" 
           alt="${escapeXml(caption)}"
           onclick="openLightbox(this.src)">
      <p class="media-caption">📊 Exhibit ${exhibitIndex}: ${escapeXml(caption)} <span style="color:#60a5fa;">(Click diagram to expand in full-screen)</span></p>
    </div>`;
}

/**
 * Deterministic generation engine applying deep curriculum decomposition,
 * strictly separating instructional section titles from media exhibits.
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
  
  // Calculate total screens needed
  const minRequiredScreens = Math.max(5, mediaAssets.length + 3);
  const numScreens = Math.max(minRequiredScreens, Math.min(8, settings.targetScreens || 6));
  const manifestXml = generateManifestXml(courseTitle, lessonTitle, settings.scormVersion);

  const { introHook, objectives, topics } = parseCurriculumStructure(lessonContent, lessonTitle);

  // Map every media asset to a middle screen (Screen 2 through numScreens - 2)
  const mediaByScreen: Record<number, MediaAsset[]> = {};
  mediaAssets.forEach((asset, idx) => {
    let screenNum = asset.targetScreen;
    if (screenNum <= 1 || screenNum >= numScreens) {
      // Auto-distribute evenly across middle screens
      screenNum = Math.min(numScreens - 2, idx + 2);
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
      const fallbackScreen = Math.min(numScreens - 2, idx + 2);
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
    
    /* Typography & Hierarchy */
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

    /* Media Exhibits & Lightbox */
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
      font-size: 0.82rem;
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
    .sim-meter-bar { height: 9px; background: #e2e8f0; border-radius: 6px; overflow: hidden; margin: 0.6rem 0 1rem; }
    .sim-meter-fill { height: 100%; width: 75%; background: #3b82f6; transition: width 0.4s ease, background 0.4s ease; }

    /* Interactive Insight Expanders */
    .insight-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 0.85rem 1rem;
      margin: 0.75rem 0;
      cursor: pointer;
      transition: all 0.15s;
    }
    .insight-box:hover { border-color: #93c5fd; background: #eff6ff; }
    .insight-header { display: flex; justify-content: space-between; align-items: center; font-weight: 700; color: #1e293b; font-size: 0.92rem; }

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
        <span class="badge">${escapeXml(moduleBadge || 'Module 1')} &bull; ${escapeXml(lessonTitle)}</span>
        <div class="module-title">${escapeXml(courseTitle)}</div>
      </div>
      <div class="screen-counter" id="screen-counter">Screen 1 of ${numScreens}</div>
    </header>

    <div class="progress-bar-container">
      <div class="progress-fill" id="progress-fill"></div>
    </div>

    <div class="viewport" id="viewport">
      <!-- Screen 1: True Lesson Introduction & Orientation -->
      <section class="screen active" data-screen="1">
        <h2>Introduction: ${escapeXml(lessonTitle)}</h2>
        
        <div class="callout">
          <p>🎯 <strong>Learning Objectives:</strong> By completing this interactive module, you will:</p>
          <ul style="margin: 0.5rem 0 0; padding-left: 1.25rem;">
            ${objectives.map(obj => `<li>${escapeXml(obj)}</li>`).join('')}
          </ul>
        </div>

        <p>${escapeXml(introHook)}</p>
        
        <h3 style="margin-top: 1.2rem; font-size: 0.95rem; color: #475569; text-transform: uppercase; letter-spacing: 0.05em;">Curriculum Roadmap</h3>
        <div class="card-grid">
          ${topics.slice(0, 3).map((t, i) => `
            <div class="info-card">
              <strong>${escapeXml(t.title)}</strong>
              <p>${escapeXml(t.summary.slice(0, 95))}...</p>
            </div>
          `).join('')}
        </div>

        <p style="font-size:0.84rem; color:#64748b; margin-top:1.25rem;">
          Press <strong>Next &#8594;</strong> or use your keyboard right-arrow to explore the first core concept.
        </p>
      </section>

      <!-- Middle Instructional Screens (Content-First with Embedded Exhibits) -->
      ${Array.from({ length: numScreens - 2 }, (_, idx) => {
        const screenIndex = idx + 2;
        const topic = topics[idx % topics.length];
        const screenMedia = mediaByScreen[screenIndex] || [];
        const isGameScreen = (screenIndex === numScreens - 1 && settings.gamification);

        if (isGameScreen) {
          return `
          <!-- Screen ${screenIndex}: Interactive Gamification & Decision Simulator -->
          <section class="screen" data-screen="${screenIndex}">
            <h2>Strategic Simulation: Incident Decision Triage</h2>
            <p>Apply the principles learned in this lesson. Your decisions will directly modulate the organizational health gauge below and record completion telemetry to your LMS.</p>

            <div class="game-zone">
              <div class="game-header">
                <div>
                  <span style="font-weight:700; color:#0f172a; font-size:1rem;">Organizational Health Metric</span>
                  <div style="font-size:0.8rem; color:#64748b;">Passing threshold: 70%</div>
                </div>
                <div class="game-score-badge" id="meter-score-badge">Health: 75%</div>
              </div>

              <div class="sim-meter-bar">
                <div class="sim-meter-fill" id="sim-meter-fill" style="width: 75%;"></div>
              </div>

              <div class="game-item" id="sim-scenario-box">
                <strong style="color:#0f172a; font-size:0.94rem;">Operational Dilemma: Critical Protocol Bypass Detected</strong>
                <p style="margin:0; font-size:0.88rem; color:#475569;">
                  During sprint execution, an unverified shortcut was discovered. Halting to remediate delays delivery by 2 hours, but proceeding without audit risks systemic compromise.
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

              <!-- Pill Classifier Knowledge Check -->
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

        // Standard instructional screen: Title is the curriculum topic, media is embedded as supporting exhibit
        return `
        <!-- Screen ${screenIndex}: ${escapeXml(topic.title)} -->
        <section class="screen" data-screen="${screenIndex}">
          <h2>${escapeXml(topic.title)}</h2>
          <p>${escapeXml(topic.summary)}</p>

          ${screenMedia.length > 0 ? `
            <div style="margin: 0.85rem 0;">
              ${screenMedia.map((m, mIdx) => renderMediaExhibitHtml(m, mIdx + 1)).join('\n')}
            </div>
          ` : `
            <div class="callout" style="background:#f8fafc; border-left: 4px solid #0f172a;">
              <p style="color:#0f172a;">💡 <strong>Strategic Tenet:</strong> Decouple emotional reaction from protocol execution. Standard operating procedures safeguard quality when stress levels peak.</p>
            </div>
          `}

          <p>${escapeXml(topic.detail)}</p>

          <h3>Key Takeaways & Execution Rules</h3>
          <ul>
            ${topic.takeaways.map(t => `<li>${escapeXml(t)}</li>`).join('\n')}
          </ul>

          ${topic.interactivePrompt ? `
            <div class="insight-box" onclick="this.classList.toggle('expanded')">
              <div class="insight-header">
                <span>🤔 Reflective Check: ${escapeXml(topic.interactivePrompt.question)}</span>
                <span style="font-size: 0.8rem; color: #2563eb;">Show Answer ▾</span>
              </div>
              <p style="margin: 0.4rem 0 0; font-size: 0.86rem; color: #059669; font-weight: 600;">
                ✓ Correct Answer: ${escapeXml(topic.interactivePrompt.options.find(o => o.correct)?.text || 'Establishing proactive governance and repeatable quality')}
              </p>
            </div>
          ` : ''}
        </section>`;
      }).join('\n')}

      <!-- Screen N: Completion & LMS Commit -->
      <section class="screen" data-screen="${numScreens}">
        <h2>Lesson Complete: Verification & Gradebook Commit</h2>
        <p>Congratulations! You have completed all foundational modules, examined the media exhibits, and verified your competencies through the strategic decision simulator.</p>

        <div class="card-grid">
          <div class="info-card">
            <strong>✅ Competencies Mastered</strong>
            <p>Reviewed all core doctrines and execution frameworks.</p>
          </div>
          <div class="info-card">
            <strong>✅ All Media Exhibits Inspected</strong>
            <p>Video briefings and architecture diagrams verified.</p>
          </div>
          <div class="info-card">
            <strong>✅ SCORM Telemetry Committed</strong>
            <p>Passing score and completion queued for LMS sync.</p>
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
        contentFirstHeadings: true,
      }
    }, null, 2)
  };
}
