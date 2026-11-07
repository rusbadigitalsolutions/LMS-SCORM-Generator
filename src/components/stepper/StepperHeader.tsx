import React from 'react';
import { 
  FileText, 
  Image as ImageIcon, 
  Settings2, 
  Sparkles, 
  PlayCircle, 
  PackageCheck,
  Check
} from 'lucide-react';

interface StepperHeaderProps {
  currentStep: number;
  onSelectStep: (step: number) => void;
  isGenerated: boolean;
}

const STEPS = [
  { id: 1, title: 'Content Ingestion', icon: FileText, desc: 'Curriculum & Text' },
  { id: 2, title: 'Media Manager', icon: ImageIcon, desc: 'Cloudinary & Video' },
  { id: 3, title: 'Directives & Logic', icon: Settings2, desc: 'Layout & Gamification' },
  { id: 4, title: 'AI Generation', icon: Sparkles, desc: 'Synthesizing Deck' },
  { id: 5, title: 'Player & Code', icon: PlayCircle, desc: 'SCORM Mock & Monaco' },
  { id: 6, title: 'Export Package', icon: PackageCheck, desc: 'Download .ZIP' },
];

export const StepperHeader: React.FC<StepperHeaderProps> = ({
  currentStep,
  onSelectStep,
  isGenerated,
}) => {
  return (
    <div className="bg-slate-900 border-b border-slate-800 py-3 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between overflow-x-auto no-scrollbar gap-2 sm:gap-4 py-1">
          {STEPS.map((step, idx) => {
            const isCompleted = currentStep > step.id || (step.id <= 3 && isGenerated);
            const isCurrent = currentStep === step.id;
            const StepIcon = step.icon;

            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => onSelectStep(step.id)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all whitespace-nowrap group ${
                    isCurrent
                      ? 'bg-blue-600/15 border border-blue-500/40 text-blue-400'
                      : isCompleted
                      ? 'hover:bg-slate-800 text-slate-300'
                      : 'opacity-60 text-slate-500 hover:opacity-80'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                        : isCompleted
                        ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isCompleted && !isCurrent ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <StepIcon className="w-4 h-4" />
                    )}
                  </div>

                  <div className="hidden sm:block">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Step {step.id}
                      </span>
                    </div>
                    <div className="text-xs font-semibold leading-tight text-slate-200">
                      {step.title}
                    </div>
                  </div>
                </button>

                {idx < STEPS.length - 1 && (
                  <div className="hidden lg:block w-8 h-[2px] bg-slate-800 shrink-0 self-center" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
