import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { buildScormPrompt, generateFallbackPackage, generateManifestXml, UNIVERSAL_SCORM_API_JS } from './src/skills/scormSkillTemplate.ts';

dotenv.config();

const app = express();
// AI Studio dev environment requires port 3000. In production builds, use process.env.PORT.
const isProduction = process.env.NODE_ENV === 'production';
const PORT = isProduction && process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '25mb' }));

// Initialize Gemini client with aistudio-build user agent
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    model: 'gemini-3.8-flash',
    cloudProviders: ['google_drive', 'google_docs', 'dropbox', 'cloudinary', 'custom_url'],
    timestamp: new Date().toISOString(),
  });
});

// Cloud Document Fetcher API (Google Docs, Google Drive, Dropbox, Custom URL)
app.post('/api/cloud/fetch-doc', async (req, res) => {
  try {
    const { url, provider, accessToken } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'A valid URL is required.' });
    }

    const trimmedUrl = url.trim();

    // 1. Google Docs Handler
    if (trimmedUrl.includes('docs.google.com/document')) {
      const match = trimmedUrl.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
      if (!match) {
        return res.status(400).json({ error: 'Could not extract Google Document ID from the URL.' });
      }
      const docId = match[1];

      // If user supplied OAuth token, use Google Docs/Drive API
      if (accessToken) {
        try {
          const apiRes = await fetch(`https://www.googleapis.com/drive/v3/files/${docId}/export?mimeType=text/plain`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (apiRes.ok) {
            const text = await apiRes.text();
            const title = text.split('\n')[0].replace(/^#+\s*/, '').trim() || 'Imported Google Doc';
            return res.json({
              provider: 'google_docs',
              docId,
              title,
              content: text,
              wordCount: text.trim().split(/\s+/).length,
            });
          }
        } catch (apiErr) {
          console.warn('Google Drive API with token failed, attempting export link fallback:', apiErr);
        }
      }

      // Public export link attempt (works for documents shared with link)
      const exportUrl = `https://docs.google.com/document/d/${docId}/export?format=txt`;
      const exportRes = await fetch(exportUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LMS-SCORM-Generator/1.0)' },
      });

      if (exportRes.ok) {
        const text = await exportRes.text();
        const title = text.split('\n')[0].replace(/^#+\s*/, '').trim() || 'Imported Google Doc';
        return res.json({
          provider: 'google_docs',
          docId,
          title,
          content: text,
          wordCount: text.trim().split(/\s+/).length,
        });
      } else {
        return res.status(403).json({
          error: 'Unable to access Google Doc. Please ensure the document is set to "Anyone with the link can view", or provide your Google Access Token in Cloud Settings.',
        });
      }
    }

    // 2. Google Drive File Handler
    if (trimmedUrl.includes('drive.google.com/file')) {
      const match = trimmedUrl.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
      if (!match) {
        return res.status(400).json({ error: 'Could not extract Google Drive File ID from the URL.' });
      }
      const fileId = match[1];

      if (accessToken) {
        const apiRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (apiRes.ok) {
          const text = await apiRes.text();
          return res.json({
            provider: 'google_drive',
            fileId,
            title: 'Drive File ' + fileId.slice(0, 8),
            content: text,
            wordCount: text.trim().split(/\s+/).length,
          });
        }
      }

      // Attempt public Drive download URL
      const driveExport = `https://drive.google.com/uc?export=download&id=${fileId}`;
      const driveRes = await fetch(driveExport);
      if (driveRes.ok) {
        const text = await driveRes.text();
        return res.json({
          provider: 'google_drive',
          fileId,
          title: 'Imported Drive Document',
          content: text,
          wordCount: text.trim().split(/\s+/).length,
        });
      }

      return res.status(403).json({
        error: 'Unable to download Drive file. Please ensure public link sharing is enabled or connect your Google Access Token in Settings.',
      });
    }

    // 3. Dropbox Handler
    if (trimmedUrl.includes('dropbox.com')) {
      let directUrl = trimmedUrl;
      if (directUrl.includes('dl=0')) {
        directUrl = directUrl.replace('dl=0', 'raw=1');
      } else if (!directUrl.includes('raw=1')) {
        directUrl += (directUrl.includes('?') ? '&' : '?') + 'raw=1';
      }

      const headers: Record<string, string> = {};
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const dropRes = await fetch(directUrl, { headers });
      if (dropRes.ok) {
        const text = await dropRes.text();
        const title = text.split('\n')[0].replace(/^#+\s*/, '').trim() || 'Imported Dropbox Document';
        return res.json({
          provider: 'dropbox',
          title,
          content: text,
          wordCount: text.trim().split(/\s+/).length,
        });
      } else {
        return res.status(400).json({ error: 'Failed to retrieve file from Dropbox. Check link permissions.' });
      }
    }

    // 4. Raw Cloud Storage URL (AWS S3, OneDrive, GitHub, Azure, etc.)
    const genericRes = await fetch(trimmedUrl, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });

    if (!genericRes.ok) {
      return res.status(genericRes.status).json({
        error: `Failed to fetch cloud document from URL (HTTP ${genericRes.status}).`,
      });
    }

    const text = await genericRes.text();
    const title = text.split('\n')[0].replace(/^#+\s*/, '').trim() || 'Cloud Document';

    return res.json({
      provider: 'custom_cloud',
      title,
      content: text,
      wordCount: text.trim().split(/\s+/).length,
    });
  } catch (err: any) {
    console.error('Error fetching cloud document:', err);
    return res.status(500).json({ error: `Cloud fetch failed: ${err.message}` });
  }
});

// SCORM Package Generation API
app.post('/api/generate-scorm', async (req, res) => {
  const { courseTitle, moduleBadge, lessonTitle, lessonContent, mediaAssets, settings } = req.body;

  if (!courseTitle || !lessonTitle || !lessonContent) {
    return res.status(400).json({ error: 'Missing required course title, lesson title, or content.' });
  }

  const payload = {
    courseTitle: String(courseTitle || 'Executive Course'),
    moduleBadge: String(moduleBadge || 'Module 1'),
    lessonTitle: String(lessonTitle || 'Lesson 1'),
    lessonContent: String(lessonContent || ''),
    mediaAssets: Array.isArray(mediaAssets) ? mediaAssets : [],
    settings: {
      scormVersion: (settings?.scormVersion === '2004' ? '2004' : '1.2') as '1.2' | '2004',
      layout: (settings?.layout === 'scroll' ? 'scroll' : 'no-scroll') as 'no-scroll' | 'scroll',
      targetScreens: Number(settings?.targetScreens) || 6,
      gamification: settings?.gamification !== false,
      selectedPatterns: Array.isArray(settings?.selectedPatterns) ? settings.selectedPatterns : ['pill-classifier', 'decision-simulator'],
      lightbox: settings?.lightbox !== false,
      customInstructions: String(settings?.customInstructions || ''),
      theme: settings?.theme || 'slate-dark',
    },
  };

  // If Gemini API is available (either environment or user-provided key), try generating through gemini-3.8-flash
  const userApiKey = req.body.cloudAiConfig?.apiKey || process.env.GEMINI_API_KEY;
  let activeAi = ai;

  if (req.body.cloudAiConfig?.apiKey && req.body.cloudAiConfig.apiKey !== process.env.GEMINI_API_KEY) {
    try {
      activeAi = new GoogleGenAI({
        apiKey: req.body.cloudAiConfig.apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (e) {
      console.warn('Custom Gemini key init fallback:', e);
    }
  }

  if (activeAi && userApiKey) {
    try {
      const { systemInstruction, userPrompt } = buildScormPrompt(payload);

      const targetModel = req.body.cloudAiConfig?.model || 'gemini-3.8-flash';
      const response = await activeAi.models.generateContent({
        model: targetModel,
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text || '';
      let parsed: { indexHtml?: string; manifestXml?: string } = {};

      try {
        parsed = JSON.parse(responseText);
      } catch (jsonErr) {
        // In case the model returned wrapped text or markdown
        const cleaned = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleaned);
      }

      if (parsed.indexHtml && parsed.indexHtml.length > 200) {
        let manifest = parsed.manifestXml;
        if (!manifest || manifest.length < 50) {
          manifest = generateManifestXml(payload.courseTitle, payload.lessonTitle, payload.settings.scormVersion);
        }

        // Ensure js/scormAPI.js is properly linked
        let html = parsed.indexHtml;
        if (!html.includes('js/scormAPI.js')) {
          html = html.replace('</head>', '<script src="js/scormAPI.js"></script>\n</head>');
        }

        // Guarantee block-level list styling so lists are never inline
        const listStyleEnforcement = `<style>
          ul, ol { display: block !important; margin: 0.75rem 0 1rem 1.25rem !important; padding-left: 1.25rem !important; list-style-type: disc !important; }
          ol { list-style-type: decimal !important; }
          li { display: list-item !important; margin-bottom: 0.5rem !important; line-height: 1.55 !important; color: #334155 !important; }
        </style>`;
        if (!html.includes('display: list-item')) {
          html = html.replace('</head>', `${listStyleEnforcement}\n</head>`);
        }

        return res.json({
          source: 'gemini-3.8-flash',
          files: {
            'index.html': html,
            'imsmanifest.xml': manifest,
            'js/scormAPI.js': UNIVERSAL_SCORM_API_JS,
            'source_context.json': JSON.stringify({
              courseTitle: payload.courseTitle,
              moduleBadge: payload.moduleBadge,
              lessonTitle: payload.lessonTitle,
              settings: payload.settings,
              mediaAssets: payload.mediaAssets,
              generatedWith: 'gemini-3.8-flash',
              generatedAt: new Date().toISOString(),
            }, null, 2),
          },
        });
      }
    } catch (apiErr: any) {
      console.warn('Gemini API call failed or returned unexpected format, falling back to deterministic skill generator:', apiErr?.message);
    }
  }

  // Fallback: Generate 100% compliant, rich, complete SCORM package using the embedded skill template
  const files = generateFallbackPackage(payload);
  return res.json({
    source: 'deterministic-skill-engine',
    notice: 'Generated using SCORM Studio embedded skill engine.',
    files,
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LMS SCORM Generator running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
