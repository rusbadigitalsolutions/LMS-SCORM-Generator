/**
 * Electron Main Process for LMS SCORM Generator Desktop App
 */
const { app, BrowserWindow, ipcMain, dialog, shell, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');

let mainWindow = null;
const DEV_PORT = process.env.PORT || 3000;
const DEV_URL = process.env.ELECTRON_START_URL || `http://localhost:${DEV_PORT}`;

// In-memory or local config store for persistent keys/preferences
const configPath = path.join(app.getPath('userData'), 'scorm-generator-config.json');

function loadConfig() {
  try {
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
  } catch (e) {
    console.error('Error loading config:', e);
  }
  return {};
}

function saveConfig(data) {
  try {
    const current = loadConfig();
    const updated = { ...current, ...data };
    fs.writeFileSync(configPath, JSON.stringify(updated, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving config:', e);
  }
}

function checkServerReady(url, callback, maxTries = 20, interval = 1000) {
  let tries = 0;
  const check = () => {
    tries++;
    const req = http.get(url, (res) => {
      callback(true);
    });
    req.on('error', () => {
      if (tries < maxTries) {
        setTimeout(check, interval);
      } else {
        callback(false);
      }
    });
    req.end();
  };
  check();
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1080,
    minHeight: 720,
    backgroundColor: '#090d16',
    title: 'LMS SCORM Generator — Desktop Studio',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    autoHideMenuBar: false,
  });

  // Open external links in user's default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  // Check if server is running or wait for it
  checkServerReady(DEV_URL, (isReady) => {
    if (isReady && mainWindow) {
      mainWindow.loadURL(DEV_URL);
    } else if (mainWindow) {
      // If dev server hasn't been started yet, show friendly guidance
      const htmlNotice = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>LMS SCORM Generator - Waiting for Server</title>
          <style>
            body {
              background: #090d16;
              color: #f1f5f9;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              text-align: center;
            }
            .card {
              max-width: 520px;
              padding: 36px;
              background: #0f172a;
              border: 1px solid #1e293b;
              border-radius: 20px;
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            }
            h1 { font-size: 20px; margin-bottom: 12px; color: #60a5fa; }
            p { font-size: 14px; line-height: 1.6; color: #94a3b8; }
            code { background: #020617; padding: 4px 8px; border-radius: 6px; color: #38bdf8; font-family: monospace; }
            button {
              margin-top: 24px;
              background: #2563eb;
              border: none;
              color: white;
              padding: 10px 20px;
              border-radius: 10px;
              cursor: pointer;
              font-weight: bold;
              font-size: 13px;
            }
            button:hover { background: #1d4ed8; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Connecting to LMS SCORM Generator</h1>
            <p>Make sure the development server is running in your terminal:</p>
            <p><code>npm run dev</code></p>
            <p>Once started on <strong>${DEV_URL}</strong>, click below to connect:</p>
            <button onclick="window.location.href='${DEV_URL}'">Retry Connection</button>
          </div>
        </body>
        </html>
      `;
      mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlNotice)}`);
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  setupAppMenu();
}

function setupAppMenu() {
  const isMac = process.platform === 'darwin';
  const template = [
    ...(isMac ? [{ role: 'appMenu' }] : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'Open Workspace Folder...',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              properties: ['openDirectory', 'createDirectory'],
              title: 'Select SCORM Workspace Directory',
            });
            if (!result.canceled && result.filePaths[0]) {
              mainWindow.webContents.send('workspace:selected', result.filePaths[0]);
            }
          },
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'SCORM Cloud Sandbox',
          click: () => shell.openExternal('https://cloud.scorm.com/'),
        },
        {
          label: 'Moodle SCORM Documentation',
          click: () => shell.openExternal('https://docs.moodle.org/en/SCORM_settings'),
        },
        { type: 'separator' },
        {
          label: 'About LMS SCORM Generator',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About LMS SCORM Generator',
              message: 'LMS SCORM Generator Desktop App',
              detail: 'Production SCORM 1.2 & 2004 authoring engine with live telemetry sandbox and multi-cloud lesson ingestion.\nVersion 1.0.0',
            });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// ----------------------------------------------------
// IPC Handlers
// ----------------------------------------------------

ipcMain.handle('workspace:select-dir', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory', 'createDirectory'],
    title: 'Select Workspace Directory',
  });
  if (result.canceled || !result.filePaths.length) return null;
  return result.filePaths[0];
});

ipcMain.handle('file:parse', async (_, filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error('File does not exist: ' + filePath);
    }
    const content = fs.readFileSync(filePath, 'utf8');
    return { filename: path.basename(filePath), content };
  } catch (err) {
    return { filename: path.basename(filePath), content: '', error: err.message };
  }
});

ipcMain.handle('workspace:save-files', async (_, { projectPath, files }) => {
  try {
    if (!fs.existsSync(projectPath)) {
      fs.mkdirSync(projectPath, { recursive: true });
    }
    for (const [relativePath, content] of Object.entries(files)) {
      const fullPath = path.join(projectPath, relativePath);
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(fullPath, content, 'utf8');
    }
    return true;
  } catch (err) {
    console.error('Failed to save files:', err);
    return false;
  }
});

ipcMain.handle('store:save-key', async (_, { provider, key }) => {
  const cfg = loadConfig();
  if (!cfg.keys) cfg.keys = {};
  cfg.keys[provider] = key;
  saveConfig(cfg);
  return true;
});

ipcMain.handle('store:get-key', async (_, provider) => {
  const cfg = loadConfig();
  return (cfg.keys && cfg.keys[provider]) || null;
});

// App Lifecycle
app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
