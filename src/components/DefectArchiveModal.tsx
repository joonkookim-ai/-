import React, { useState, useEffect } from 'react';
import { 
  X, 
  BookmarkPlus, 
  ShieldCheck, 
  Layers, 
  AlertTriangle, 
  Check, 
  Sparkles,
  ArrowUpRight,
  Database
} from 'lucide-react';
import { DefectKnowledgeItem, SubDefectItem } from '../data/defectKnowledge';
import { CustomerFormData } from './CustomerDataForm';

interface DefectArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string | null;
  customerData: CustomerFormData;
  subItemToPromote?: SubDefectItem | null;
  onSaveMainDefect: (item: Partial<DefectKnowledgeItem>) => Promise<void>;
}

export const DefectArchiveModal: React.FC<DefectArchiveModalProps> = ({
  isOpen,
  onClose,
  imageSrc,
  customerData,
  subItemToPromote,
  onSaveMainDefect,
}) => {
  const isPromoteMode = !!subItemToPromote;

  const [defectType, setDefectType] = useState<DefectKnowledgeItem['defectType']>('편면취');
  const [severity, setSeverity] = useState<DefectKnowledgeItem['severity']>('경고 (Major)');
  const [title, setTitle] = useState<string>('');
  const [steelGrade, setSteelGrade] = useState<string>('');
  const [diameterMm, setDiameterMm] = useState<number | string>(90);
  const [customerAndProcess, setCustomerAndProcess] = useState<string>('');
  const [whyProblem, setWhyProblem] = useState<string>('');
  const [boundaryRule, setBoundaryRule] = useState<string>('');
  const [concessionPrecedent, setConcessionPrecedent] = useState<string>('');
  const [tagsInput, setTagsInput] = useState<string>('편면취, 척킹오차, 콜렛잼');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleTypeSelect = (type: DefectKnowledgeItem['defectType']) => {
    setDefectType(type);
    if (type === '편면취') {
      setTitle(`[메인] 편면취 과다로 인한 ${customerData.customerName || '고객사'} 후가공 척킹 편심`);
      setWhyProblem(
        '원주상 면취 폭 편차가 심하여, 로봇 자동 공급 척킹 시 환봉이 한쪽으로 기울어(Tilting) 콜렛 척 진입 잼(Jam) 및 파손을 유발함.'
      );
      setBoundaryRule('원주 방향 면취 폭 편차 ΔC ≤ 0.8mm 이내 (1.0mm 초과 시 콜렛 물림 불량 직결).');
      setConcessionPrecedent('[조건부 승인 - 전량 수동 재면취(Re-chamfering) 후 납품].');
      setTagsInput('편면취, 척킹오차, 콜렛잼');
    } else if (type === '미면취') {
      setTitle('[메인] 면취 가공 누락(미면취)으로 인한 이송 라인 손상 및 안전 사고');
      setWhyProblem(
        '면취가 누락되어 날카로운 직각 엣지(Sharp Edge)가 잔류함. 단조 가열로 롤러 슈트 파손 및 금형 투입 턱 걸림 발생.'
      );
      setBoundaryRule('미면취는 사내 규격상 Zero-Tolerance. 최소 C1.0 이상 모따기 필수.');
      setConcessionPrecedent('[특채 불가 - 전량 라인 회수 후 긴급 재면취].');
      setTagsInput('미면취, 날카로운엣지, 가공누락');
    } else if (type === '절단단차') {
      setTitle('[메인] 톱날 결손에 의한 절단 단차(0.8mm) 및 기준면 평행도 오차');
      setWhyProblem(
        '절단면 단차로 인해 고객사 CNC 선반 가공 시 끝단 스토퍼 밀착 불량 및 축 방향 런아웃(Runout) 규격 초과 발생.'
      );
      setBoundaryRule('절단 단차 Max 0.30mm 이하 (0.50mm 초과 시 척킹 기준면 불가).');
      setConcessionPrecedent('끝단 가공 여유 5mm 이상 시 [특채 승인], 척킹 기준면일 경우 [조건부 단면 사상].');
      setTagsInput('절단단차, 런아웃오차, 스토퍼밀착');
    } else if (type === '버(Burr)') {
      setTitle('[메인] 절단 관통부 과대 버(Burr)로 인한 단조 금형 씹힘 및 흠집');
      setWhyProblem(
        '절단 종료부 찌꺼기 버가 단조 금형 파팅 라인에 끼여 금형 마모 및 단조품 표면 겹침(Lap) 결함을 유발함.'
      );
      setBoundaryRule('버 높이 Max 0.20mm 이하 (0.50mm 초과는 디버링 필수).');
      setConcessionPrecedent('[조건부 승인 - 핸드 에어그라인더 디버링 사상 후 출하].');
      setTagsInput('버, Burr, 금형파손, 디버링사상');
    } else if (type === '절단크랙') {
      setTitle('[메인] 전단 응력에 의한 절단면 미세 크랙 (성형 중 폭발 파단)');
      setWhyProblem(
        '절단면 외주부 미세 균열이 고압 성형/단조 시 응력 집중으로 급격히 전파되어 부품 파단 및 금형 파손 초래.'
      );
      setBoundaryRule('크랙 결함은 어떠한 경우에도 Zero Tolerance (0.0mm).');
      setConcessionPrecedent('[특채 불가 - 전량 폐기(Scrap) 또는 재용해].');
      setTagsInput('크랙, 성형파단, 치명적불량, 전량폐기');
    }
  };

  // Initialize or prefill from subItemToPromote or customerData
  useEffect(() => {
    if (!isOpen) return;

    if (subItemToPromote) {
      setTitle(`[관리자 승인 메인] ${subItemToPromote.title}`);
      setSteelGrade(subItemToPromote.steelGrade);
      setDiameterMm(subItemToPromote.diameterMm);
      setCustomerAndProcess(`${subItemToPromote.customerName} / ${subItemToPromote.processType}`);
      setWhyProblem(
        `현장 판독 결과: ${subItemToPromote.detectedDefectsSummary}.\n후공정 트러블: ${subItemToPromote.summaryVerdict}`
      );
      setBoundaryRule('사내 품질 기준 및 고객사 합의 한도 공차 준용');
      setConcessionPrecedent(subItemToPromote.verdictGrade);
      setTagsInput(`${subItemToPromote.defectType}, 서브승격, 관리자검증`);
    } else {
      setSteelGrade(customerData.steelGrade || 'SCM440');
      setDiameterMm(customerData.diameterMm || 90);
      setCustomerAndProcess(`${customerData.customerName || '고객사'} / ${customerData.processType}`);
      handleTypeSelect('편면취');
    }
  }, [subItemToPromote, customerData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !whyProblem) return;

    setIsSaving(true);
    try {
      await onSaveMainDefect({
        title,
        defectType,
        severity,
        imageSrc: (subItemToPromote ? subItemToPromote.imageSrc : imageSrc) || '',
        steelGrade: steelGrade || customerData.steelGrade,
        diameterMm: Number(diameterMm) || 90,
        customerAndProcess: customerAndProcess || `${customerData.customerName} / ${customerData.processType}`,
        whyProblem,
        boundaryRule: boundaryRule || '사내 품질 관리 기준 준용',
        concessionPrecedent: concessionPrecedent || '[특채 심사 보류]',
        tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
        createdAt: new Date().toISOString().split('T')[0],
        isMain: true,
        registeredBy: isPromoteMode ? '서브 Data 검토 후 승격 승인' : '품질 관리자 직접 축적',
        promotedFromSubId: subItemToPromote?.id,
      });
      onClose();
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const activeImage = subItemToPromote ? subItemToPromote.imageSrc : imageSrc;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full my-auto flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-400">
              {isPromoteMode ? <ArrowUpRight className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>{isPromoteMode ? '서브 Data → 관리자 메인 DB 승격 축적' : '관리자 메인 불량 DB 신규 축적 등록'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-mono">
                  메인 Data
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                {isPromoteMode
                  ? '작업자가 심사한 서브 데이터를 관리자가 검토 및 한도 기준을 보강하여 메인 DB로 등록합니다.'
                  : '향후 모든 작업자 심사의 판단 근거(Ground Truth)가 되는 메인 데이터를 등록합니다.'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-slate-300 overflow-y-auto max-h-[80vh]">
          {/* Top Preview */}
          <div className="flex items-center gap-4 bg-slate-950 p-3 rounded-xl border border-slate-800">
            {activeImage ? (
              <img src={activeImage} alt="절단면" className="w-20 h-20 object-contain rounded-lg bg-slate-900 border border-slate-800 shrink-0" />
            ) : (
              <div className="w-20 h-20 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                사진 없음
              </div>
            )}
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block font-bold">
                {isPromoteMode ? `작업자 기록 건 [${subItemToPromote?.id}] 검토` : '관리자 메인 기준 소재'}
              </span>
              <div className="font-bold text-slate-200">
                적용 강종: <span className="font-mono text-cyan-300">{steelGrade}</span> · 규격: <span className="font-mono">Ø{diameterMm}mm</span>
              </div>
              <div className="text-[11px] text-slate-400">
                고객사/공정: {customerAndProcess}
              </div>
            </div>
          </div>

          {/* Defect Category Tabs */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1.5">
              1. 핵심 결함 형태 분류:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {(['편면취', '미면취', '절단단차', '버(Burr)', '절단크랙'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTypeSelect(type)}
                  className={`py-2 px-2 rounded-lg border text-center font-bold text-xs transition-all cursor-pointer ${
                    defectType === type
                      ? 'bg-indigo-600 border-indigo-400 text-white shadow'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Title & Severity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-400 mb-1">메인 불량 패턴 명칭 (Title)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: [메인] 과대 편면취로 인한 자동화 콜렛 척킹 잼"
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-indigo-400 text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">심각도 등급</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-indigo-400 text-xs"
              >
                <option value="주의 (Minor)">주의 (Minor)</option>
                <option value="경고 (Major)">경고 (Major)</option>
                <option value="치명적 불량 (Critical)">치명적 불량 (Critical)</option>
              </select>
            </div>
          </div>

          {/* Steel Grade (Text input) and Diameter */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">적용 강종 (Text)</label>
              <input
                type="text"
                value={steelGrade}
                onChange={(e) => setSteelGrade(e.target.value)}
                placeholder="예: SCM440, S45C, 42CrMo4"
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-indigo-400 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">고객사 및 적용 공정</label>
              <input
                type="text"
                value={customerAndProcess}
                onChange={(e) => setCustomerAndProcess(e.target.value)}
                placeholder="예: 현대위아 / CNC 1차 가공"
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-indigo-400 text-xs"
              />
            </div>
          </div>

          {/* WHY IT IS A PROBLEM - Core Ground Truth */}
          <div className="bg-indigo-950/30 p-3.5 rounded-xl border border-indigo-800/50 space-y-2">
            <label className="block text-indigo-300 font-bold flex items-center gap-1.5 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              2. 이 형태가 왜 문제인가? (관리자 공식 검증 트러블 사유):
            </label>
            <textarea
              rows={3}
              value={whyProblem}
              onChange={(e) => setWhyProblem(e.target.value)}
              placeholder="예: 편면취 폭 편차가 심하여, 로봇 핑거가 환봉을 콜렛 척 내부로 밀어넣을 때 틸팅(Tilting)되어 콜렛 턱에 잼이 걸리고 라인 정지 클레임 발생."
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 outline-none focus:border-indigo-400 text-xs resize-none font-sans"
            />
          </div>

          {/* Boundary Rule & Precedent */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">한도 판정 기준 (Boundary Rule)</label>
              <input
                type="text"
                value={boundaryRule}
                onChange={(e) => setBoundaryRule(e.target.value)}
                placeholder="예: 원주 면취폭 편차 ΔC ≤ 0.8mm 이내 허용"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-indigo-400 text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">과거 실제 특채 판정 이력</label>
              <input
                type="text"
                value={concessionPrecedent}
                onChange={(e) => setConcessionPrecedent(e.target.value)}
                placeholder="예: [특채 불가 / 전량 긴급 재면취 후 납품]"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-indigo-400 text-xs"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-slate-400 mb-1">검색 태그</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="편면취, 로봇콜렛, 틸팅오차"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-indigo-400 text-xs"
            />
          </div>

          {/* Submit Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-indigo-950 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>메인 DB 등록 중...</span>
                </>
              ) : (
                <>
                  <Database className="w-4 h-4" />
                  <span>{isPromoteMode ? '서브 Data를 메인 DB로 승격 승인' : '관리자 메인 Data로 영구 축적'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
