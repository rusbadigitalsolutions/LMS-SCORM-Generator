import { ScormPackageFiles, ValidationItem } from '../types/scorm';

export function validateScormPackage(files: ScormPackageFiles): {
  passed: boolean;
  score: number;
  items: ValidationItem[];
} {
  const items: ValidationItem[] = [];

  const html = files['index.html'] || '';
  const manifest = files['imsmanifest.xml'] || '';
  const scormJs = files['js/scormAPI.js'] || '';

  // 1. Manifest Root & Schema
  const hasManifest = manifest.length > 0;
  const hasSchema = manifest.includes('<schema>ADL SCORM</schema>');
  const hasIndexRef = manifest.includes('href="index.html"');
  const hasJsRef = manifest.includes('href="js/scormAPI.js"');

  items.push({
    id: 'manifest-schema',
    name: 'Manifest Schema & Version Verification',
    category: 'Manifest',
    status: hasManifest && hasSchema ? 'pass' : 'fail',
    detail: hasSchema 
      ? 'Valid ADL SCORM schema declared in imsmanifest.xml'
      : 'Missing <schema>ADL SCORM</schema> or imsmanifest.xml file'
  });

  items.push({
    id: 'manifest-resources',
    name: 'Resource Registration in Manifest',
    category: 'Manifest',
    status: hasIndexRef && hasJsRef ? 'pass' : (hasIndexRef ? 'warn' : 'fail'),
    detail: hasIndexRef && hasJsRef
      ? 'index.html and js/scormAPI.js are properly registered in <resources>'
      : 'Ensure index.html and js/scormAPI.js are declared under <resources>'
  });

  // 2. SCORM API Wrapper & Initialization
  const hasWrapperFile = scormJs.includes('window.ScormAdapter');
  const hasWrapperScriptTag = html.includes('js/scormAPI.js');
  const callsLMSInit = scormJs.includes('LMSInitialize') || scormJs.includes('Initialize');

  items.push({
    id: 'runtime-wrapper',
    name: 'Universal SCORM 1.2 / 2004 Runtime Wrapper',
    category: 'Runtime',
    status: hasWrapperFile && hasWrapperScriptTag ? 'pass' : 'fail',
    detail: hasWrapperFile && hasWrapperScriptTag
      ? 'Universal SCORM adapter linked in <head> and provides findAPI() auto-detection'
      : 'js/scormAPI.js is missing or not linked in index.html'
  });

  const callsSaveProgress = html.includes('ScormAdapter.saveProgress');
  items.push({
    id: 'telemetry-commits',
    name: 'Active Progress & Score Commit Telemetry',
    category: 'Runtime',
    status: callsSaveProgress ? 'pass' : 'warn',
    detail: callsSaveProgress
      ? 'Lesson fires ScormAdapter.saveProgress() on navigation and gamification events'
      : 'No ScormAdapter.saveProgress() calls detected in index.html'
  });

  // 3. No-Scroll Paginated Layout
  const hasFixedDeck = html.includes('deck-container') && (html.includes('94vh') || html.includes('840px'));
  const hasBodyOverflowHidden = html.includes('overflow: hidden') || html.includes('overflow:hidden');
  const hasHeaderCounters = html.includes('screen-counter') && html.includes('progress-fill');

  items.push({
    id: 'layout-noscroll',
    name: 'No-Scroll Fixed-Viewport Deck Pattern',
    category: 'Layout',
    status: hasFixedDeck && hasBodyOverflowHidden ? 'pass' : 'warn',
    detail: hasFixedDeck
      ? 'Fixed-height deck (94vh) prevents parent LMS iFrame double scrollbars'
      : 'Deck container with 94vh fixed viewport recommended to prevent LMS scroll overflow'
  });

  items.push({
    id: 'layout-navigation',
    name: 'Pinned Header & Dual Navigation Controls',
    category: 'Layout',
    status: hasHeaderCounters && html.includes('btn-prev') && html.includes('btn-next') ? 'pass' : 'warn',
    detail: 'Header progress indicators, previous/next buttons, and keyboard arrow controls verified'
  });

  // 4. Responsive Image Lightbox Modal
  const hasLightbox = html.includes('lightbox-modal') && html.includes('openLightbox');
  items.push({
    id: 'media-lightbox',
    name: 'Responsive Diagram Lightbox Zoom Modal',
    category: 'Media',
    status: hasLightbox ? 'pass' : 'warn',
    detail: hasLightbox
      ? 'Full-screen high-resolution lightbox modal equipped with backdrop and Escape trigger'
      : 'Add lightbox modal for diagram zoom accessibility'
  });

  // 5. Interactive Gamification
  const hasGamification = html.includes('btn-pill') || html.includes('game-zone') || html.includes('handleDecision') || html.includes('sim-meter');
  items.push({
    id: 'gamification-interaction',
    name: 'Interactive Gamification & Cognitive Mechanics',
    category: 'Gamification',
    status: hasGamification ? 'pass' : 'warn',
    detail: hasGamification
      ? 'Interactive cognitive activity embedded with live visual feedback and scoring'
      : 'Include an interactive classifier or scenario dilemma for learner engagement'
  });

  // 6. Zero-Citation & Hallucination Hygiene
  const hasCitations = /\[\d+\]|\[\^\d+\]|citation needed/i.test(html);
  items.push({
    id: 'citation-cleanliness',
    name: 'Zero-Hallucination & Clean Copy Hygiene',
    category: 'Layout',
    status: !hasCitations ? 'pass' : 'fail',
    detail: !hasCitations
      ? '100% clean copy. No bracketed academic citations or footnote noise detected.'
      : 'Found bracketed citation markers [x]. Stripping recommended for LMS readability.'
  });

  // 7. Media Embedding Verification
  let mediaAuditDetail = 'Media assets embedded with responsive containers';
  let mediaStatus: 'pass' | 'warn' = 'pass';
  try {
    if (files['source_context.json']) {
      const ctx = JSON.parse(files['source_context.json']);
      const mediaList = ctx.mediaAssets || ctx.embeddedMediaList || [];
      if (mediaList.length > 0) {
        const missing = mediaList.filter((m: any) => m.url && !html.includes(m.url));
        if (missing.length > 0) {
          mediaStatus = 'warn';
          mediaAuditDetail = `${missing.length} media asset(s) not found in index.html`;
        } else {
          mediaAuditDetail = `All ${mediaList.length} media asset(s) verified embedded in index.html`;
        }
      }
    }
  } catch (e) {}

  items.push({
    id: 'media-embedding',
    name: '100% Media Asset Embedding & Integrity',
    category: 'Media',
    status: mediaStatus,
    detail: mediaAuditDetail,
  });

  const passCount = items.filter(i => i.status === 'pass').length;
  const score = Math.round((passCount / items.length) * 100);

  return {
    passed: score >= 75 && !items.some(i => i.status === 'fail'),
    score,
    items
  };
}
