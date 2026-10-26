import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Search, 
  ShieldAlert, 
  Award,
  Zap,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import { ConcessionAnalysisResult } from '../types';

interface VerdictStampProps {
  result: ConcessionAnalysisResult;
}

export const VerdictStamp: React.FC<VerdictStampProps> = ({ result }) => {
  const { verdictGrade, verdictCode, confidenceScore, riskLevel, summaryVerdict } = result;

  // Determine styling theme
  let theme = {
    bg: 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300',
    stampBorder: 'border-emerald-500',
    stampBg: 'bg-emerald-500/10 text-emerald-400',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    icon: CheckCircle2,
    gradient: 'from-emerald-500/20 to-transparent',
    glow: 'shadow-emerald-900/20',
  };

  if (verdictCode === 'CONDITIONAL_REWORK' || verdictGrade.includes('조건부')) {
    theme = {
      bg: 'bg-amber-950/40 border-amber-500/50 text-amber-300',
      stampBorder: 'border-amber-500',
      stampBg: 'bg-amber-500/10 text-amber-400',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      icon: AlertTriangle,
      gradient: 'from-amber-500/20 to-transparent',
      glow: 'shadow-amber-900/20',
    };
  } else if (verdictCode === 'REJECTED_SCRAP_DIVERT' || verdictGrade.includes('불가') || verdictGrade.includes('폐기')) {
    theme = {
      bg: 'bg-rose-950/40 border-rose-500/50 text-rose-300',
      stampBorder: 'border-rose-500',
      stampBg: 'bg-rose-500/10 text-rose-400',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      icon: XCircle,
      gradient: 'from-rose-500/20 to-transparent',
      glow: 'shadow-rose-900/20',
    };
  } else if (verdictCode === 'MANUAL_INSPECTION_REQUIRED' || verdictGrade.includes('육안 검사')) {
    theme = {
      bg: 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300',
      stampBorder: 'border-cyan-500',
      stampBg: 'bg-cyan-500/10 text-cyan-400',
      badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      icon: Search,
      gradient: 'from-cyan-500/20 to-transparent',
      glow: 'shadow-cyan-900/20',
    };
  }

  const IconComponent = theme.icon;

  return (
    <div className={`relative overflow-hidden rounded-2xl border p-6 bg-gradient-to-br ${theme.gradient} ${theme.bg} ${theme.glow} shadow-xl`}>
      {/* Decorative Stamp watermark */}
      <div className="absolute right-4 -top-6 select-none pointer-events-none opacity-10 font-black text-8xl text-white tracking-widest uppercase transform rotate-12">
        {verdictCode}
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-900/80 border border-slate-700 text-slate-300 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              20년 경력 특수강 품질보증 심사의견
            </span>

            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${theme.badge}`}>
              리스크: {riskLevel}
            </span>

            <span className="px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-slate-900/60 border border-slate-700 text-slate-400">
              신뢰도 {confidenceScore}%
            </span>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <IconComponent className="w-8 h-8 shrink-0" />
              <span>{verdictGrade}</span>
            </h2>
            <p className="mt-2 text-sm text-slate-200 leading-relaxed font-medium">
              "{summaryVerdict}"
            </p>
          </div>
        </div>

        {/* Industrial QA Stamp Seal */}
        <div className="shrink-0 flex items-center justify-center self-center md:self-auto">
          <div className={`border-4 ${theme.stampBorder} ${theme.stampBg} rounded-xl px-5 py-3 transform rotate-[-4deg] flex flex-col items-center justify-center text-center shadow-lg backdrop-blur-sm`}>
            <span className="text-[10px] font-mono font-black tracking-widest uppercase text-slate-400">
              QUALITY CONTROL CONCESSION
            </span>
            <span className="text-base font-black tracking-wider my-0.5 whitespace-nowrap">
              {verdictGrade.replace(/[\[\]]/g, '')}
            </span>
            <span className="text-[9px] font-mono text-slate-400">
              IATF 16949 / SEAH QA AUDIT
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
