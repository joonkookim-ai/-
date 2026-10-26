import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Clock,
  ArrowUpRight,
  FileCheck
} from 'lucide-react';
import { DefectKnowledgeItem, SubDefectItem } from '../data/defectKnowledge';

interface DefectKnowledgeBaseViewProps {
  mainItems: DefectKnowledgeItem[];
  subItems: SubDefectItem[];
  onSelectPatternForTest: (item: DefectKnowledgeItem | SubDefectItem) => void;
  onOpenCreateMainModal: () => void;
  onPromoteSubItem: (subItem: SubDefectItem) => void;
  onDeleteMainItem: (id: string) => void;
  onDeleteSubItem: (id: string) => void;
  onExportJson: () => void;
}

export const DefectKnowledgeBaseView: React.FC<DefectKnowledgeBaseViewProps> = ({
  mainItems,
  subItems,
  onSelectPatternForTest,
  onOpenCreateMainModal,
  onPromoteSubItem,
  onDeleteMainItem,
  onDeleteSubItem,
  onExportJson,
}) => {
  const [dataTab, setDataTab] = useState<'MAIN' | 'SUB'>('MAIN');
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredMainItems = mainItems.filter((item) => {
    const matchFilter = selectedFilter === 'ALL' || item.defectType === selectedFilter;
    const matchSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.whyProblem.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.steelGrade.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFilter && matchSearch;
  });

  const filteredSubItems = subItems.filter((item) => {
    const matchSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.steelGrade.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.detectedDefectsSummary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch;
  });

  const getSeverityBadge = (sev: string) => {
    if (sev.includes('치명') || sev.includes('Critical')) {
      return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    }
    if (sev.includes('경고') || sev.includes('Major')) {
      return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    }
    return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
  };

  const getVerdictBadge = (grade: string) => {
    if (grade.includes('승인 권고')) {
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
    if (grade.includes('조건부')) {
      return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    }
    if (grade.includes('불가') || grade.includes('폐기')) {
      return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    }
    return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
  };

  return (
    <div className="space-y-6">
      {/* Educational Header: Main vs Sub Architecture */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 p-5 rounded-2xl border border-indigo-500/30 shadow-xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>특수강 불량 형태 2단계 축적 시스템 (메인 DB & 서브 Data)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                작업자 심사 시 <strong className="text-cyan-400">서브 Data 자동 축적</strong> → 관리자 검토 후 <strong className="text-indigo-400">메인 Data 승격</strong> → 모든 판정은 항상 <strong className="text-emerald-400">메인 Data를 근거로 진행</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenCreateMainModal}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>관리자 메인 DB 직접 등록</span>
            </button>
            <button
              onClick={onExportJson}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>전체 데이터셋 백업 (JSON)</span>
            </button>
          </div>
        </div>

        {/* 2-Tier Workflow Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-1">
          <button
            onClick={() => setDataTab('MAIN')}
            className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              dataTab === 'MAIN'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-indigo-300" />
            <span>[메인 Data] 관리자 승인 기준 DB</span>
            <span className="px-1.5 py-0.2 rounded-full bg-indigo-900 text-[10px] text-indigo-200 font-mono">
              {mainItems.length}건
            </span>
          </button>

          <button
            onClick={() => setDataTab('SUB')}
            className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              dataTab === 'SUB'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4 text-cyan-300" />
            <span>[서브 Data] 현장 작업자 판독 이력</span>
            <span className="px-1.5 py-0.2 rounded-full bg-cyan-900 text-[10px] text-cyan-200 font-mono">
              {subItems.length}건
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================
          TAB 1: 메인 Data (관리자 승인 불량 DB)
      ======================================================== */}
      {dataTab === 'MAIN' && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-500 mr-1 text-[11px] flex items-center gap-1">
                <Filter className="w-3 h-3" /> 결함 유형:
              </span>
              {[
                { id: 'ALL', label: '전체' },
                { id: '편면취', label: '편면취' },
                { id: '미면취', label: '미면취' },
                { id: '절단단차', label: '절단단차' },
                { id: '버(Burr)', label: '버(Burr)' },
                { id: '절단크랙', label: '절단크랙' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedFilter(tab.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    selectedFilter === tab.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="강종, 결함명, 트러블 사유 검색..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-400 font-sans"
              />
            </div>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>
              모든 작업자 특채 심사는 아래 <strong>{mainItems.length}건의 관리자 메인 Data</strong>를 절대적 기준(Ground Truth)으로 대조하여 실행됩니다.
            </span>
          </div>

          {/* Main Defect Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMainItems.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 hover:border-indigo-500/60 rounded-xl overflow-hidden shadow-xl flex flex-col transition-all"
              >
                {/* Card Header */}
                <div className="p-4 bg-slate-850/80 border-b border-slate-800 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 border border-indigo-800/60 text-indigo-300 font-mono">
                        {item.defectType}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getSeverityBadge(item.severity)}`}>
                        {item.severity}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[9.5px] font-semibold bg-emerald-950 border border-emerald-800/60 text-emerald-300 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        메인 기준
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-100 text-sm">{item.title}</h3>
                    <span className="text-[11px] text-slate-400 font-mono block">
                      강종: <strong className="text-slate-200">{item.steelGrade}</strong> · 규격: Ø{item.diameterMm}mm
                    </span>
                  </div>

                  <button
                    onClick={() => onDeleteMainItem(item.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                    title="삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between text-xs">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                      <img
                        src={item.imageSrc}
                        alt={item.title}
                        className="w-16 h-16 object-contain rounded-md bg-slate-900 border border-slate-800 shrink-0"
                      />
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-500 block">적용 고객사 및 공정</span>
                        <span className="font-medium text-slate-200">{item.customerAndProcess}</span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          등록주체: {item.registeredBy || '관리자 승인'} ({item.createdAt})
                        </span>
                      </div>
                    </div>

                    {/* Problem reason */}
                    <div className="bg-rose-950/20 border border-rose-900/40 p-3 rounded-lg space-y-1">
                      <span className="text-[11px] font-bold text-rose-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        왜 이런 형태가 문제인가? (트러블 원인)
                      </span>
                      <p className="text-slate-300 leading-relaxed text-xs font-sans">
                        {item.whyProblem}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-slate-950/60 p-2.5 rounded-lg border border-slate-850">
                      <div>
                        <span className="text-slate-500 block text-[10px] font-semibold">한도 기준 (Rule)</span>
                        <span className="text-slate-300">{item.boundaryRule}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] font-semibold">과거 실제 판례</span>
                        <span className="text-amber-300 font-medium">{item.concessionPrecedent}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 font-mono">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => onSelectPatternForTest(item)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>이 메인 기준으로 심사 대조</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: 서브 Data (현장 작업자 판독 이력 & 승격 관리)
      ======================================================== */}
      {dataTab === 'SUB' && (
        <div className="space-y-4">
          <div className="bg-cyan-950/30 border border-cyan-800/40 p-4 rounded-xl flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="text-slate-200">
                현장 작업자가 심사를 실행할 때마다 사진 및 판정 결과가 여기에 <strong>[서브 Data]</strong>로 자동 축적됩니다.
                관리자는 유의미한 불량 형태를 검토하여 <strong>[메인 Data로 승격]</strong>할 수 있습니다.
              </span>
            </div>
            <span className="text-cyan-400 font-mono font-bold">
              누적 서브 데이터: {subItems.length}건
            </span>
          </div>

          {subItems.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-10 text-center text-slate-500 space-y-2">
              <FileCheck className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-sm font-semibold text-slate-400">아직 축적된 작업자 서브 Data가 없습니다.</p>
              <p className="text-xs text-slate-500">
                [특채 심사기] 화면에서 작업자가 심사를 실행하면 자동으로 여기에 서브 Data가 기록됩니다.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSubItems.map((sub) => (
                <div
                  key={sub.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col justify-between"
                >
                  {/* Card Header */}
                  <div className="p-4 bg-slate-850/90 border-b border-slate-800 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 border border-cyan-800 text-cyan-300">
                          {sub.defectType}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getVerdictBadge(sub.verdictGrade)}`}>
                          {sub.verdictGrade}
                        </span>
                        {sub.status === 'PROMOTED' ? (
                          <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-indigo-950 border border-indigo-700 text-indigo-300">
                            메인 승격 완료
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[9.5px] font-medium bg-amber-950 border border-amber-800 text-amber-300">
                            관리자 검토 대기
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-slate-100 text-sm">{sub.title}</h4>
                      <span className="text-[11px] text-slate-400 font-mono block">
                        고객사: <strong className="text-slate-200">{sub.customerName}</strong> | 강종: <strong className="text-cyan-300">{sub.steelGrade}</strong> (Ø{sub.diameterMm}mm)
                      </span>
                    </div>

                    <button
                      onClick={() => onDeleteSubItem(sub.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-3 text-xs flex-1">
                    <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                      <img
                        src={sub.imageSrc}
                        alt="절단면"
                        className="w-16 h-16 object-contain rounded-md bg-slate-900 border border-slate-800 shrink-0"
                      />
                      <div className="space-y-1 flex-1">
                        <div className="text-[11px] text-slate-300 font-medium">
                          {sub.summaryVerdict}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          판독 일시: {sub.inspectedAt} | 신뢰도 {sub.confidenceScore}%
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850 space-y-1">
                      <span className="text-[10px] font-semibold text-slate-400 block">
                        작업자 현장 메모 및 관찰 결함:
                      </span>
                      <p className="text-slate-300 font-sans">{sub.detectedDefectsSummary}</p>
                      {sub.operatorNotes && (
                        <p className="text-slate-400 text-[11px] italic mt-0.5">"{sub.operatorNotes}"</p>
                      )}
                    </div>
                  </div>

                  {/* Promotion Action Footer */}
                  <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onSelectPatternForTest(sub as any)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      다시 심사하기
                    </button>

                    {/* Manager Promotion Button: Crucial Flow */}
                    <button
                      onClick={() => onPromoteSubItem(sub)}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-950 transition-colors cursor-pointer"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>관리자 메인 Data로 승격 축적</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
