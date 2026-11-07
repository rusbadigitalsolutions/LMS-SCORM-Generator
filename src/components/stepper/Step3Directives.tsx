import React from 'react';
import { 
  Settings2, 
  Gamepad2, 
  ZoomIn, 
  Layers, 
  Sparkles, 
  Sliders, 
  Check, 
  ArrowLeft, 
  ArrowRight,
  ShieldCheck,
  Palette
} from 'lucide-react';
import { GamificationPattern, GeneratorSettings } from '../../types/scorm';

interface Step3DirectivesProps {
  settings: GeneratorSettings;
  setSettings: React.Dispatch<React.SetStateAction<GeneratorSettings>>;
  onGenerate: () => void;
  onPrev: () => void;
}

export const Step3Directives: React.FC<Step3DirectivesProps> = ({
  settings,
  setSettings,
  onGenerate,
  onPrev,
}) => {
  const togglePattern = (pattern: GamificationPattern) => {
    if (settings.selectedPatterns.includes(pattern)) {
      setSettings({
        ...settings,
        selectedPatterns: settings.selectedPatterns.filter((p) => p !== pattern),
      });
    } else {
      setSettings({
        ...settings,
        selectedPatterns: [...settings.selectedPatterns, pattern],
      });
    }
  };

  const addDirectiveChip = (text: string) => {
    const current = settings.customInstructions ? settings.customInstructions + ' ' : '';
    if (!current.includes(text)) {
      setSettings({
        ...settings,
        customInstructions: current + text,
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
      {/* Title */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
          <Settings2 className="w-3.5 h-3.5" />
          Step 3: Directives & Gamification
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Architecture, Layout & SCORM Standards
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Configure viewport constraints, cognitive gamification mechanics, image zoom modals, and LMS SCORM telemetry specifications.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Standards & Layout */}
        <div className="space-y-6">
          {/* SCORM Standard */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              Target LMS Standard
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSettings({ ...settings, scormVersion: '1.2' })}
                className={`p-4 rounded-xl border text-left transition-all ${
                  settings.scormVersion === '1.2'
                    ? 'bg-blue-600/15 border-blue-500 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-white">SCORM 1.2</span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
                    Recommended
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Universal compatibility across 99% of all LMS platforms (Moodle, Canvas, Blackboard, TalentLMS).
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSettings({ ...settings, scormVersion: '2004' })}
                className={`p-4 rounded-xl border text-left transition-all ${
                  settings.scormVersion === '2004'
                    ? 'bg-blue-600/15 border-blue-500 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-white">SCORM 2004</span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    4th Edition
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Detailed sequencing and navigation tracking using modern CMI data models.
                </p>
              </button>
            </div>
          </div>

          {/* Layout Mode & Screen Count */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              Viewport & Screen Count
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Layout Presentation Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, layout: 'no-scroll' })}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      settings.layout === 'no-scroll'
                        ? 'bg-blue-600/15 border-blue-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-bold text-xs text-white block">No-Scroll Paginated Deck</span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      94vh fixed container prevents accidental double scrollbars in LMS iframes.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, layout: 'scroll' })}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      settings.layout === 'scroll'
                        ? 'bg-blue-600/15 border-blue-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-bold text-xs text-white block">Continuous Scroll</span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Traditional single-page document format with persistent header.
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-300">
                    Pagination Target Count: <strong className="text-blue-400">{settings.targetScreens} Screens</strong>
                  </label>
                  <span className="text-xs text-slate-500">Fixed slide deck length</span>
                </div>
                <div className="flex items-center gap-2">
                  {[4, 5, 6, 7, 8].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setSettings({ ...settings, targetScreens: num })}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                        settings.targetScreens === num
                          ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {num} Slides
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Lightbox Zoom Toggle */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-blue-400 shrink-0">
                <ZoomIn className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Responsive Diagram Lightbox Zoom</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Allows learners to click any diagram or matrix to enlarge it full-screen without losing their place.
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.lightbox}
                onChange={(e) => setSettings({ ...settings, lightbox: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Right Column: Gamification & Instructor Directives */}
        <div className="space-y-6">
          {/* Gamification Engine */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-emerald-400" />
                Interactive Gamification Mechanics
              </h2>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.gamification}
                  onChange={(e) => setSettings({ ...settings, gamification: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Cognitive gamification elements test retention and automatically stream scores to the LMS via <code>cmi.core.score.raw</code>.
            </p>

            <div className={`space-y-3 ${!settings.gamification ? 'opacity-40 pointer-events-none' : ''}`}>
              {/* Pattern A */}
              <div
                onClick={() => togglePattern('decision-simulator')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                  settings.selectedPatterns.includes('decision-simulator')
                    ? 'bg-emerald-950/40 border-emerald-500/60 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                  settings.selectedPatterns.includes('decision-simulator')
                    ? 'bg-emerald-600 text-white'
                    : 'border border-slate-700'
                }`}>
                  {settings.selectedPatterns.includes('decision-simulator') && <Check className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <span className="font-bold text-xs text-white block">
                    Strategic Scenario Dilemma & Dynamic Live Gauge
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    High-stakes executive dilemma with animated organizational health meter that rises or falls on choice.
                  </span>
                </div>
              </div>

              {/* Pattern B */}
              <div
                onClick={() => togglePattern('pill-classifier')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                  settings.selectedPatterns.includes('pill-classifier')
                    ? 'bg-emerald-950/40 border-emerald-500/60 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                  settings.selectedPatterns.includes('pill-classifier')
                    ? 'bg-emerald-600 text-white'
                    : 'border border-slate-700'
                }`}>
                  {settings.selectedPatterns.includes('pill-classifier') && <Check className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <span className="font-bold text-xs text-white block">
                    Multi-Category Pill Classifier
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Pill buttons with instant green/red feedback testing concept categorizations and rule distinctions.
                  </span>
                </div>
              </div>

              {/* Pattern C */}
              <div
                onClick={() => togglePattern('perceptual-radar')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                  settings.selectedPatterns.includes('perceptual-radar')
                    ? 'bg-emerald-950/40 border-emerald-500/60 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                  settings.selectedPatterns.includes('perceptual-radar')
                    ? 'bg-emerald-600 text-white'
                    : 'border border-slate-700'
                }`}>
                  {settings.selectedPatterns.includes('perceptual-radar') && <Check className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <span className="font-bold text-xs text-white block">
                    Perceptual Radar / Quadrant Matrix
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    2-axis coordinate plane evaluating competitive white-space quadrants and defensive positioning.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Custom Instructor Directives */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              Custom Instructor Directives
            </h2>
            <p className="text-xs text-slate-400 mb-3">
              Add prompt instructions for formatting, accessibility standards, or visual themes.
            </p>

            <textarea
              value={settings.customInstructions}
              onChange={(e) => setSettings({ ...settings, customInstructions: e.target.value })}
              rows={3}
              placeholder="e.g., Ensure strict WCAG AA contrast, dark slate executive styling, concise bullet cards..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />

            <div className="flex flex-wrap gap-1.5 mt-2.5">
              <button
                type="button"
                onClick={() => addDirectiveChip('Enforce WCAG AA high contrast compliance.')}
                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              >
                + Strict WCAG AA
              </button>
              <button
                type="button"
                onClick={() => addDirectiveChip('Executive dark slate theme with crisp borders.')}
                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              >
                + Dark Slate Style
              </button>
              <button
                type="button"
                onClick={() => addDirectiveChip('Emphasize realistic corporate dilemmas and risk triage.')}
                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              >
                + Scenario-Heavy
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
        <button
          onClick={onPrev}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Media
        </button>

        <button
          onClick={onGenerate}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold shadow-xl shadow-blue-600/30 transition-all hover:scale-[1.02]"
        >
          <Sparkles className="w-4 h-4" />
          <span>Launch AI SCORM Generator</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
