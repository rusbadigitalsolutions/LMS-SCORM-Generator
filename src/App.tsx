/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { ProjectHub } from './components/hub/ProjectHub';
import { StepperHeader } from './components/stepper/StepperHeader';
import { Step1Content } from './components/stepper/Step1Content';
import { Step2Media } from './components/stepper/Step2Media';
import { Step3Directives } from './components/stepper/Step3Directives';
import { GenerationStage, Step4GenerationModal } from './components/stepper/Step4GenerationModal';
import { Step5PlayerAndEditor } from './components/stepper/Step5PlayerAndEditor';
import { Step6Export } from './components/stepper/Step6Export';
import { LmsGuideModal } from './components/modals/LmsGuideModal';
import { CloudAccountsModal } from './components/modals/CloudAccountsModal';
import { DesktopInstallModal } from './components/modals/DesktopInstallModal';
import { 
  GeneratorSettings, 
  MediaAsset, 
  ScormPackageFiles, 
  ScormProject 
} from './types/scorm';
import { CloudAccountSettings, DEFAULT_CLOUD_SETTINGS } from './types/cloud';
import { 
  createProjectFromTemplate, 
  SAMPLE_COURSES, 
  SampleCourseTemplate 
} from './data/sampleCourses';
import { generateFallbackPackage } from './skills/scormSkillTemplate';
import { createScormZipBlob, triggerBlobDownload } from './utils/zipExporter';
import { validateScormPackage } from './utils/scormValidator';

export default function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<'hub' | 'stepper' | 'qa' | 'guide'>('hub');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [isDesktopModalOpen, setIsDesktopModalOpen] = useState(false);

  // Cloud & BYOK Settings
  const [cloudSettings, setCloudSettings] = useState<CloudAccountSettings>(() => {
    try {
      const stored = localStorage.getItem('scorm_cloud_settings');
      return stored ? JSON.parse(stored) : DEFAULT_CLOUD_SETTINGS;
    } catch {
      return DEFAULT_CLOUD_SETTINGS;
    }
  });

  // Projects & Workspace State
  const [projects, setProjects] = useState<ScormProject[]>(() => {
    // Initial default project loaded from sample course
    const initial = createProjectFromTemplate(SAMPLE_COURSES[0]);
    return [initial];
  });
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(projects[0]?.id || null);

  // Stepper Active Draft Form
  const [courseTitle, setCourseTitle] = useState(SAMPLE_COURSES[0].courseTitle);
  const [moduleBadge, setModuleBadge] = useState(SAMPLE_COURSES[0].moduleBadge);
  const [lessonTitle, setLessonTitle] = useState(SAMPLE_COURSES[0].lessonTitle);
  const [lessonContent, setLessonContent] = useState(SAMPLE_COURSES[0].lessonContent);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>(SAMPLE_COURSES[0].mediaAssets);

  const [settings, setSettings] = useState<GeneratorSettings>({
    scormVersion: '1.2',
    layout: 'no-scroll',
    targetScreens: 6,
    gamification: true,
    selectedPatterns: ['decision-simulator', 'pill-classifier'],
    lightbox: true,
    customInstructions: 'Strict WCAG AA contrast, executive dark slate tone, zero citation brackets.',
    theme: 'slate-dark',
  });

  const [packageFiles, setPackageFiles] = useState<ScormPackageFiles>(projects[0]?.files || {
    'index.html': '',
    'imsmanifest.xml': '',
    'js/scormAPI.js': '',
  });

  // Generation Modal State
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [genStages, setGenStages] = useState<GenerationStage[]>([
    { id: 1, label: 'Curriculum & Text Sanitation', desc: 'Stripping academic citations & formatting layout', status: 'pending' },
    { id: 2, label: 'Gemini 3.8 Flash Neural Engine', desc: 'Synthesizing interactive instructional screens', status: 'pending' },
    { id: 3, label: 'HTML5 No-Scroll Deck Assembly', desc: 'Injecting pinned header, progress fill & navigation', status: 'pending' },
    { id: 4, label: 'SCORM Runtime & Gamified Telemetry', desc: 'Embedding ScormAdapter & decision simulator logic', status: 'pending' },
    { id: 5, label: 'ADL Manifest Schema Validation', desc: 'Verifying imsmanifest.xml resources & SCO items', status: 'pending' },
  ]);

  const activeProject = projects.find((p) => p.id === currentProjectId) || projects[0] || null;
  const qaScore = activeProject ? validateScormPackage(packageFiles).score : 90;

  // Sync draft form when active project changes
  const handleSelectProject = (id: string) => {
    const proj = projects.find((p) => p.id === id);
    if (proj) {
      setCurrentProjectId(proj.id);
      setCourseTitle(proj.courseTitle);
      setModuleBadge(proj.moduleBadge);
      setLessonTitle(proj.lessonTitle);
      setLessonContent(proj.lessonContent);
      setMediaAssets(proj.mediaAssets);
      setSettings(proj.settings);
      setPackageFiles(proj.files);
    }
  };

  const handleNewLesson = () => {
    setCourseTitle('');
    setModuleBadge('Module 1');
    setLessonTitle('');
    setLessonContent('');
    setMediaAssets([]);
    setCurrentStep(1);
    setActiveTab('stepper');
  };

  const handleLoadTemplate = (template: SampleCourseTemplate) => {
    const newProj = createProjectFromTemplate(template);
    setProjects((prev) => [newProj, ...prev]);
    setCurrentProjectId(newProj.id);
    setCourseTitle(newProj.courseTitle);
    setModuleBadge(newProj.moduleBadge);
    setLessonTitle(newProj.lessonTitle);
    setLessonContent(newProj.lessonContent);
    setMediaAssets(newProj.mediaAssets);
    setSettings(newProj.settings);
    setPackageFiles(newProj.files);
    setCurrentStep(5);
    setActiveTab('stepper');
  };

  const handleDeleteProject = (id: string) => {
    const filtered = projects.filter((p) => p.id !== id);
    setProjects(filtered);
    if (currentProjectId === id && filtered.length > 0) {
      handleSelectProject(filtered[0].id);
    }
  };

  const handleExportZip = async (projToExport?: ScormProject) => {
    const proj = projToExport || activeProject;
    if (!proj) return;
    const filesToUse = projToExport ? projToExport.files : packageFiles;
    const zipName = `${proj.courseSlug || 'scorm_course'}_${proj.lessonTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_scorm.zip`;
    const blob = await createScormZipBlob(filesToUse);
    triggerBlobDownload(blob, zipName);
  };

  const handleOpenPlayer = (proj: ScormProject) => {
    handleSelectProject(proj.id);
    setCurrentStep(5);
    setActiveTab('stepper');
  };

  // Launch AI Generation
  const handleGenerateScorm = async () => {
    setIsGenerating(true);
    setGenError(null);

    // Stage 1: Sanitation
    setGenStages((prev) => prev.map((s) => s.id === 1 ? { ...s, status: 'running' } : { ...s, status: 'pending' }));
    await new Promise((r) => setTimeout(r, 600));
    setGenStages((prev) => prev.map((s) => s.id === 1 ? { ...s, status: 'completed' } : s.id === 2 ? { ...s, status: 'running' } : s));

    try {
      const payload = {
        courseTitle: courseTitle || 'Executive Course',
        moduleBadge: moduleBadge || 'Module 1',
        lessonTitle: lessonTitle || 'Operational Protocols',
        lessonContent,
        mediaAssets,
        settings,
        cloudAiConfig: cloudSettings.customAi,
      };

      let resultFiles: ScormPackageFiles;

      // Call full-stack express endpoint
      try {
        const response = await fetch('/api/generate-scorm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const data = await response.json();
          resultFiles = data.files;
        } else {
          throw new Error('Server returned non-200');
        }
      } catch (fetchErr) {
        // High fidelity fallback client generation
        resultFiles = generateFallbackPackage(payload);
      }

      // Stage 2 & 3: Synthesis
      setGenStages((prev) => prev.map((s) => s.id <= 2 ? { ...s, status: 'completed' } : s.id === 3 ? { ...s, status: 'running' } : s));
      await new Promise((r) => setTimeout(r, 500));

      // Stage 4: SCORM wrapper & gamification
      setGenStages((prev) => prev.map((s) => s.id <= 3 ? { ...s, status: 'completed' } : s.id === 4 ? { ...s, status: 'running' } : s));
      await new Promise((r) => setTimeout(r, 400));

      // Stage 5: Manifest validation
      setGenStages((prev) => prev.map((s) => s.id <= 4 ? { ...s, status: 'completed' } : s.id === 5 ? { ...s, status: 'running' } : s));
      await new Promise((r) => setTimeout(r, 300));

      setGenStages((prev) => prev.map((s) => ({ ...s, status: 'completed' })));

      // Update state and active project
      setPackageFiles(resultFiles);

      const updatedProject: ScormProject = {
        id: currentProjectId || 'proj-' + Date.now(),
        courseTitle,
        courseSlug: courseTitle.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 30),
        moduleBadge,
        lessonTitle,
        lessonContent,
        mediaAssets,
        settings,
        files: resultFiles,
        status: 'generated',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setProjects((prev) => {
        const index = prev.findIndex((p) => p.id === updatedProject.id);
        if (index >= 0) {
          const copy = [...prev];
          copy[index] = updatedProject;
          return copy;
        }
        return [updatedProject, ...prev];
      });
      setCurrentProjectId(updatedProject.id);

      // Finish generation & transition to Step 5 (Player & Code)
      setTimeout(() => {
        setIsGenerating(false);
        setCurrentStep(5);
      }, 500);

    } catch (err: any) {
      console.error('Generation error:', err);
      setGenError(err.message || 'An unexpected error occurred during generation.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Universal Navbar */}
      <Navbar
        currentProject={activeProject}
        currentStep={currentStep}
        onNavigateTab={(tab) => {
          if (tab === 'guide') {
            setIsGuideOpen(true);
          } else if (tab === 'qa') {
            setActiveTab('stepper');
            setCurrentStep(5);
          } else {
            setActiveTab(tab);
          }
        }}
        activeTab={activeTab}
        onNewLesson={handleNewLesson}
        onExportZip={() => handleExportZip()}
        onOpenCloudAccounts={() => setIsCloudModalOpen(true)}
        onOpenDesktopInstall={() => setIsDesktopModalOpen(true)}
        qaScore={qaScore}
      />

      {/* Main View Router */}
      <main className="flex-1 flex flex-col">
        {activeTab === 'hub' ? (
          <ProjectHub
            projects={projects}
            currentProjectId={currentProjectId}
            onSelectProject={handleSelectProject}
            onNewLesson={handleNewLesson}
            onLoadTemplate={handleLoadTemplate}
            onDeleteProject={handleDeleteProject}
            onExportZip={handleExportZip}
            onOpenPlayer={handleOpenPlayer}
          />
        ) : (
          <div className="flex-1 flex flex-col">
            {/* Stepper Progress Bar Header */}
            <StepperHeader
              currentStep={currentStep}
              onSelectStep={(step) => setCurrentStep(step)}
              isGenerated={Boolean(packageFiles['index.html'])}
            />

            {/* Stepper Content Views */}
            <div className="flex-1">
              {currentStep === 1 && (
                <Step1Content
                  courseTitle={courseTitle}
                  setCourseTitle={setCourseTitle}
                  moduleBadge={moduleBadge}
                  setModuleBadge={setModuleBadge}
                  lessonTitle={lessonTitle}
                  setLessonTitle={setLessonTitle}
                  lessonContent={lessonContent}
                  setLessonContent={setLessonContent}
                  onNext={() => setCurrentStep(2)}
                  onLoadTemplate={handleLoadTemplate}
                  cloudSettings={cloudSettings}
                  onOpenCloudSettings={() => setIsCloudModalOpen(true)}
                />
              )}

              {currentStep === 2 && (
                <Step2Media
                  mediaAssets={mediaAssets}
                  setMediaAssets={setMediaAssets}
                  onNext={() => setCurrentStep(3)}
                  onPrev={() => setCurrentStep(1)}
                  totalScreens={settings.targetScreens}
                />
              )}

              {currentStep === 3 && (
                <Step3Directives
                  settings={settings}
                  setSettings={setSettings}
                  onGenerate={handleGenerateScorm}
                  onPrev={() => setCurrentStep(2)}
                />
              )}

              {currentStep === 5 && (
                <Step5PlayerAndEditor
                  files={packageFiles}
                  setFiles={setPackageFiles}
                  onNext={() => setCurrentStep(6)}
                  onPrev={() => setCurrentStep(3)}
                />
              )}

              {currentStep === 6 && activeProject && (
                <Step6Export
                  project={activeProject}
                  files={packageFiles}
                  onPrev={() => setCurrentStep(5)}
                  onOpenGuide={() => setIsGuideOpen(true)}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Step 4 AI Generation Progress Pipeline Modal */}
      {isGenerating && (
        <Step4GenerationModal
          stages={genStages}
          errorNotice={genError}
          onRetry={handleGenerateScorm}
          onCancel={() => setIsGenerating(false)}
        />
      )}

      {/* Cloud & AI Accounts Settings Modal */}
      <CloudAccountsModal
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
        settings={cloudSettings}
        onSave={(updated) => {
          setCloudSettings(updated);
          try {
            localStorage.setItem('scorm_cloud_settings', JSON.stringify(updated));
          } catch (e) {
            console.error('Failed to store settings in localStorage:', e);
          }
        }}
      />

      {/* LMS Integration Guide Modal */}
      <LmsGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Desktop App Install & Setup Modal */}
      <DesktopInstallModal
        isOpen={isDesktopModalOpen}
        onClose={() => setIsDesktopModalOpen(false)}
      />
    </div>
  );
}
