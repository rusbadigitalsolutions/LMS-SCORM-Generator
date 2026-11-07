import React, { useState } from 'react';
import { 
  BookOpen, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  X,
  Layers
} from 'lucide-react';

interface LmsGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LmsGuideModal: React.FC<LmsGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeLms, setActiveLms] = useState<'scormcloud' | 'moodle' | 'canvas' | 'blackboard' | 'talentlms'>('scormcloud');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">LMS Integration & Deployment Guide</h2>
              <p className="text-xs text-slate-400">Step-by-step instructions for uploading and testing your SCORM package</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-6 overflow-x-auto no-scrollbar gap-2">
          {[
            { id: 'scormcloud', label: 'SCORM Cloud (Testing)' },
            { id: 'moodle', label: 'Moodle' },
            { id: 'canvas', label: 'Canvas LMS' },
            { id: 'blackboard', label: 'Blackboard' },
            { id: 'talentlms', label: 'TalentLMS' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveLms(tab.id as any)}
              className={`py-3 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeLms === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          {activeLms === 'scormcloud' && (
            <div className="space-y-4">
              <div className="bg-blue-950/30 border border-blue-800/40 rounded-xl p-4 text-xs text-blue-200">
                <strong>Recommended Industry Sandbox:</strong> SCORM Cloud (by Rustici Software) is the gold standard testing harness used by LMS vendors to certify package compatibility.
              </div>

              <ol className="space-y-3 list-decimal list-inside text-xs leading-relaxed text-slate-300">
                <li>Create a free account at <a href="https://cloud.scorm.com" target="_blank" rel="noreferrer" className="text-blue-400 underline inline-flex items-center gap-1">cloud.scorm.com <ExternalLink className="w-3 h-3" /></a>.</li>
                <li>Click <strong>Add Content</strong> &rarr; <strong>Import a SCORM, AICC, xAPI or cmi5 package</strong>.</li>
                <li>Upload the generated <code>.zip</code> file directly (do not unzip before uploading).</li>
                <li>Click <strong>Launch</strong> to run the course in the debug console.</li>
                <li>Observe the Rustici Telemetry Log confirming <code>LMSInitialize</code>, <code>LMSSetValue("cmi.core.lesson_status", "passed")</code>, and <code>LMSCommit</code>.</li>
              </ol>
            </div>
          )}

          {activeLms === 'moodle' && (
            <div className="space-y-4">
              <ol className="space-y-3 list-decimal list-inside text-xs leading-relaxed text-slate-300">
                <li>Log in to your Moodle course as an Instructor and turn <strong>Edit Mode ON</strong>.</li>
                <li>Click <strong>Add an activity or resource</strong> in the target topic section.</li>
                <li>Choose <strong>SCORM package</strong>.</li>
                <li>Enter the Lesson Title, drag-and-drop the <code>.zip</code> archive into the Package field.</li>
                <li>Under <strong>Appearance</strong>:
                  <ul className="list-disc list-inside ml-4 mt-1 text-slate-400 space-y-1">
                    <li>Display package: <em>Current window</em> or <em>New window</em>.</li>
                    <li>Stage width: <em>100%</em> or <em>980</em>, Stage height: <em>840</em>.</li>
                  </ul>
                </li>
                <li>Under <strong>Grade</strong>: Set grading method to <em>Highest grade</em> or <em>Learning Objects</em>.</li>
                <li>Save and display!</li>
              </ol>
            </div>
          )}

          {activeLms === 'canvas' && (
            <div className="space-y-4">
              <ol className="space-y-3 list-decimal list-inside text-xs leading-relaxed text-slate-300">
                <li>Navigate to your Canvas course settings and ensure the <strong>SCORM</strong> navigation item is enabled.</li>
                <li>Click <strong>SCORM</strong> in the course navigation menu.</li>
                <li>Click the <strong>Upload</strong> button in the upper right corner and select your generated <code>.zip</code> file.</li>
                <li>Once processed, choose import type: <strong>Import as Graded Assignment</strong> or <strong>Import as Page</strong>.</li>
                <li>Publish the assignment so students can access it in Modules.</li>
              </ol>
            </div>
          )}

          {activeLms === 'blackboard' && (
            <div className="space-y-4">
              <ol className="space-y-3 list-decimal list-inside text-xs leading-relaxed text-slate-300">
                <li>In Blackboard Learn (Ultra or Original), enter your Course Content area.</li>
                <li>Click the <strong>+</strong> icon &rarr; <strong>Content Market</strong>.</li>
                <li>Select <strong>SCORM package</strong> &rarr; click <strong>Upload SCORM package</strong>.</li>
                <li>Select the <code>.zip</code> file. Blackboard will automatically validate the <code>imsmanifest.xml</code>.</li>
                <li>Configure grading, attempts, and visibility settings, then click <strong>Save</strong>.</li>
              </ol>
            </div>
          )}

          {activeLms === 'talentlms' && (
            <div className="space-y-4">
              <ol className="space-y-3 list-decimal list-inside text-xs leading-relaxed text-slate-300">
                <li>Edit your course in TalentLMS as an Administrator or Instructor.</li>
                <li>Click <strong>Add</strong> &rarr; select <strong>SCORM / xAPI / cmi5</strong>.</li>
                <li>Upload the <code>.zip</code> file.</li>
                <li>TalentLMS will verify the manifest title and lesson SCO automatically.</li>
                <li>Publish unit. Learners will have progress saved via SCORM CMI data model.</li>
              </ol>
            </div>
          )}

          {/* Golden Rules Checklist */}
          <div className="pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Packaging Checklist for 100% LMS Compliance
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">&bull;</span>
                <span><code>imsmanifest.xml</code> at absolute root of ZIP</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">&bull;</span>
                <span>Fixed 94vh deck avoids iframe scrollbars</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">&bull;</span>
                <span>SCORM API wrapper links correctly</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">&bull;</span>
                <span>Zero citation brackets in lesson copy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
