import React, { useState } from 'react';
import { 
  ShieldCheck, 
  HelpCircle, 
  Printer, 
  RotateCcw, 
  Database,
  SlidersHorizontal,
  BookmarkPlus,
  BookOpen,
  FileSpreadsheet
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'assess' | 'knowledge';
  onTabChange: (tab: 'assess' | 'knowledge') => void;
  onReset: () => void;
  onOpenReport: () => void;
  hasResult: boolean;
  knowledgeCount: number;
  onOpenArchiveModal: () => void;
  onOpenSpreadsheetModal: () => void;
  spreadsheetCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onReset,
  onOpenReport,
  hasResult,
  knowledgeCount,
  onOpenArchiveModal,
  onOpenSpreadsheetModal,
  spreadsheetCount,
}) => {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <>
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-indigo-600 p-0.5 shadow-lg shadow-cyan-950 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-wider text-cyan-400 uppercase font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/40">
                  SEAH SPECIAL STEEL QC ENGINE
                </span>
                <span className="text-[10px] text-slate-400 font-mono hidden md:inline-block">
                  IATF 16949 / ISO 9001
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>특수강 환봉 절단면 품질 판독 및 특채(Concession) 심사 AI</span>
              </h1>
            </div>
          </div>

          {/* Center Tabs: Assess vs Knowledge Base */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => onTabChange('assess')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'assess'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>특채 심사기</span>
            </button>
            <button
              onClick={() => onTabChange('knowledge')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'knowledge'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>불량 패턴 축적 DB</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-indigo-300 font-mono">
                {knowledgeCount}
              </span>
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSpreadsheetModal}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-600/50 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="구글 스프레드시트 자동 누적 데이터 관리"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>구글 시트 누적 ({spreadsheetCount})</span>
            </button>

            <button
              onClick={onOpenArchiveModal}
              className="px-2.5 py-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="현재 사진을 불량 패턴 DB에 추가 축적"
            >
              <BookmarkPlus className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">불량 축적</span>
            </button>

            <button
              onClick={() => setShowGuide(true)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">심사 가이드</span>
            </button>

            {hasResult && (
              <button
                onClick={onOpenReport}
                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-950 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>심사의견서</span>
              </button>
            )}

            <button
              onClick={onReset}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
              title="초기화"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                현장 핵심 결함 (편면취 / 미면취 / 절단면 상태) & 4대 특채 심사 체계
              </h3>
              <button onClick={() => setShowGuide(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <div>
                <h4 className="font-bold text-cyan-400 text-sm mb-2">1. 현장 핵심 결함 3대 요소</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <strong className="text-slate-200 block mb-1">· 편면취 (Eccentric)</strong>
                    <span className="text-slate-400 text-[11px] leading-relaxed">
                      원주상 모따기 폭 편차. 로봇 핑거 투입 시 틸팅 각도가 생겨 콜렛 척 파손 및 잼 유발.
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <strong className="text-slate-200 block mb-1">· 미면취 (No Chamfer)</strong>
                    <span className="text-slate-400 text-[11px] leading-relaxed">
                      모따기 가공 누락. 날카로운 직각 엣지 잔류로 이송 슈트 손상 및 금형 턱 걸림.
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <strong className="text-slate-200 block mb-1">· 절단면 단차 / 버</strong>
                    <span className="text-slate-400 text-[11px] leading-relaxed">
                      톱날 결손 계단형 단차(스토퍼 밀착 런아웃 오차) 및 관통부 돌출 버(단조 금형 흠집).
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-indigo-400 text-sm mb-2">2. "이런 형태는 문제이다" 데이터 축적 원리</h4>
                <p className="text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800">
                  현장에서 라인 트러블이나 클레임이 발생했던 실제 절단면 사진을 <strong>[불량 축적 DB]</strong>에 등록해두면,
                  신규 환봉 심사 시 해당 사례의 트러블 메커니즘과 한도 기준이 AI 분석 프롬프트에 자동으로 주입되어
                  동일한 실수를 사전에 차단하고 판정의 정밀도를 향상시킵니다.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowGuide(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
