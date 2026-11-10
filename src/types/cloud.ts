export interface CloudAccountSettings {
  google: {
    accessToken: string;
    clientId: string;
    connected: boolean;
    userEmail?: string;
  };
  dropbox: {
    accessToken: string;
    connected: boolean;
  };
  cloudinary: {
    cloudName: string;
    uploadPreset: string;
    apiKey: string;
  };
  customAi: {
    provider: 'gemini' | 'openai' | 'anthropic' | 'groq' | 'ollama' | 'openrouter';
    apiKey: string;
    model: string;
    baseUrl: string;
  };
}

export const DEFAULT_CLOUD_SETTINGS: CloudAccountSettings = {
  google: {
    accessToken: '',
    clientId: '',
    connected: false,
  },
  dropbox: {
    accessToken: '',
    connected: false,
  },
  cloudinary: {
    cloudName: '',
    uploadPreset: '',
    apiKey: '',
  },
  customAi: {
    provider: 'gemini',
    apiKey: '',
    model: 'gemini-3.8-flash',
    baseUrl: '',
  },
};
