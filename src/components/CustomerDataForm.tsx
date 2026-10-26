import React from 'react';
import { 
  Building2, 
  Cpu, 
  AlertCircle, 
  Ruler, 
  ShieldCheck, 
  Sparkles,
  Database
} from 'lucide-react';
import { PRESET_CASES, CustomerPreset } from '../data/presets';

export interface CustomerFormData {
  customerName: string;
  steelGrade: string; // Free text input as requested
  diameterMm: number | string;
  processType: string;
  endUtilization: string;
  claimSensitivity: string;
  chamferSpec: string;
  maxAllowedBurr: string;
  maxAllowedStep: string;
  notes: string;
}

interface CustomerDataFormProps {
  formData: CustomerFormData;
  onChange: (data: CustomerFormData) => void;
  onSelectPreset: (preset: CustomerPreset) => void;
  selectedPresetId?: string;
  isLoading: boolean;
  onAnalyze: () => void;
  mainDefectCount?: number;
}

const COMMON_STEEL_GRADES = [
  'SCM440',
  'S45C',
  'SUJ2',
  'SNCM220',
  'SCR420',
  'S20C',
  '42CrMo4',
  'SAE4140',
  '20MnCr5',
  'SUP9',
];

export const CustomerDataForm: React.FC<CustomerDataFormProps> = ({
  formData,
  onChange,
  onSelectPreset,
  selectedPresetId,
  isLoading,
  onAnalyze,
  mainDefectCount = 5,
}) => {
  const updateField = (field: keyof CustomerFormData, value: any) => {
    onChange({
      ...formData,
      [field]: value,
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col">
      {/* Header */}
      <div className="px-5 py-3 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-200">고객사 납품 사양 & 품질 기준 데이터</h3>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-950 border border-indigo-800/60 text-indigo-300 flex items-center gap-1">
          <Database className="w-3 h-3 text-indigo-400" />
          관리자 메인 DB ({mainDefectCount}건) 대조 기준
        </span>
      </div>

      <div className="p-5 space-y-4 text-xs">
        {/* Preset Selector */}
        <div>
          <label className="text-slate-400 font-medium mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            실전 특수강 특채 심사 대표 사례 (빠른 불러오기):
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PRESET_CASES.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              const badgeColor =
                preset.expectedCode === 'APPROVED_CONCESSION'
                  ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300'
                  : preset.expectedCode === 'CONDITIONAL_REWORK'
                  ? 'border-amber-500/50 bg-amber-950/40 text-amber-300'
                  : preset.expectedCode === 'REJECTED_SCRAP_DIVERT'
                  ? 'border-rose-500/50 bg-rose-950/40 text-rose-300'
                  : 'border-cyan-500/50 bg-cyan-950/40 text-cyan-300';

              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onSelectPreset(preset)}
                  className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-cyan-400 bg-slate-800 ring-1 ring-cyan-400 shadow-md'
                      : 'border-slate-800 bg-slate-850 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="font-semibold text-slate-200 truncate">{preset.companyName}</div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">{preset.steelGrade} · Ø{preset.diameterMm}</div>
                  <div className={`mt-1 text-[9.5px] px-1 py-0.5 rounded border inline-block font-mono ${badgeColor}`}>
                    {preset.expectedVerdict}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 1: Customer Name & Steel Grade (Free text) & Diameter */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-slate-400 block mb-1">고객사명</label>
            <input
              type="text"
              value={formData.customerName}
              onChange={(e) => updateField('customerName', e.target.value)}
              placeholder="예: 현대위아, 센트랄, 일진"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          {/* 적용 강종: Text input as requested! */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-slate-400">적용 강종 (직접 Text 입력)</label>
            </div>
            <div className="relative">
              <input
                type="text"
                list="steel-grade-list"
                value={formData.steelGrade}
                onChange={(e) => updateField('steelGrade', e.target.value)}
                placeholder="예: SCM440, S45C, 42CrMo4"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-cyan-400 transition-colors font-mono font-semibold"
              />
              <datalist id="steel-grade-list">
                {COMMON_STEEL_GRADES.map((grade) => (
                  <option key={grade} value={grade} />
                ))}
              </datalist>
            </div>
            {/* Quick Chips */}
            <div className="flex flex-wrap gap-1 mt-1.5">
              {['SCM440', 'S45C', 'SUJ2', 'SNCM220', '42CrMo4'].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => updateField('steelGrade', g)}
                  className={`text-[9.5px] px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                    formData.steelGrade.includes(g)
                      ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">환봉 규격 직경 (Ø mm)</label>
            <div className="relative">
              <input
                type="number"
                value={formData.diameterMm}
                onChange={(e) => updateField('diameterMm', e.target.value)}
                placeholder="예: 90"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-cyan-400 transition-colors font-mono"
              />
              <span className="absolute right-3 top-2 text-slate-500 font-mono">mm</span>
            </div>
          </div>
        </div>

        {/* Row 2: Customer Downstream Process (당사 절단 방식 제거 완료) */}
        <div>
          <label className="text-slate-400 flex items-center gap-1 mb-1">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            고객사 후공정 특성 (핵심 검토 대상)
          </label>
          <select
            value={formData.processType}
            onChange={(e) => updateField('processType', e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-cyan-400 transition-colors"
          >
            <option value="열간단조 (1,220℃ 가열 후 프레스 형타 단조)">열간단조 (가열로 통과 시 결함 소멸/흡수 용이)</option>
            <option value="냉간단조 (Cold Heading / Forging, 상온 600톤 프레스)">냉간단조 (크랙/단차/버에 극도로 민감, 금형파손 위험)</option>
            <option value="정밀 CNC 선반 외경/단면 가공 (로봇 자동 공급 척킹 라인)">정밀 CNC 선반 가공 (로봇 콜렛 척 물림 기준면)</option>
            <option value="정밀 기어 치절 및 침탄 열처리 (Wind Turbine Gearbox)">정밀 기어 치절 및 열처리 (중심 편석 엄격 규제)</option>
            <option value="일반 절삭 가공 및 범용 선반 가공">일반 기계부품 절삭 가공 (마진 여유 충분)</option>
          </select>
        </div>

        {/* Row 3: End Utilization & Claim Sensitivity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-slate-400 flex items-center gap-1 mb-1">
              <Ruler className="w-3.5 h-3.5 text-emerald-400" />
              끝단 사용 여부 (소재 소모처)
            </label>
            <select
              value={formData.endUtilization}
              onChange={(e) => updateField('endUtilization', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-cyan-400 transition-colors"
            >
              <option value="끝단 전량 플래시(Flash) 및 버링 scrap으로 가공 탈락 (여유 10mm 이상)">
                끝단 전량 절삭/플래시 탈락 (여유 10mm 이상 - 특채 유리)
              </option>
              <option value="끝단 3~5mm 페이스 컷 후 전량 소제됨">끝단 3~5mm 페이스 컷 제거 (통상 가공여유)</option>
              <option value="끝단이 로봇 자동 척킹 기준면으로 1차 물림 (런아웃 오차 직결)">
                로봇 자동 척킹 기준면 (버/단차 시 척킹 오차 발생)
              </option>
              <option value="끝단이 완제품 부품 표면으로 그대로 유지됨">
                끝단 완제품 표면 유지 (면취 규격 절대 준수 필요)
              </option>
              <option value="끝단이 베어링 전동체 레이스웨이 가공 부위에 직접 포함됨">
                고응력 레이스웨이 부위 포함 (무결함 절대 요구)
              </option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 flex items-center gap-1 mb-1">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              고객사 클레임 민감도
            </label>
            <select
              value={formData.claimSensitivity}
              onChange={(e) => updateField('claimSensitivity', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-cyan-400 transition-colors"
            >
              <option value="최고 위험 (현대/기아 완성차 휠베어링/조향 보안부품, 무결점 Zero-Defect)">
                최고 (현대/기아 완성차 보안부품 Tier-1, Zero Defect)
              </option>
              <option value="높음 (로봇 자동화 라인 정지 위험 / 정밀 동력전달계)">
                높음 (자동화 라인 정지 유발 가능 부품)
              </option>
              <option value="보통 (일반 단조품 및 일반 산업기계 클레임 기준 준용)">
                보통 (일반 기계부품 / 조건부 사상 허용)
              </option>
              <option value="낮음 (건설 기초 구조재 및 후가공 마진 대폭 확보)">
                낮음 (일반 구조용 / 특채 수용성 높음)
              </option>
            </select>
          </div>
        </div>

        {/* Row 4: Specs tolerance limits */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
          <div>
            <label className="text-slate-400 block mb-1">고객 요구 면취 규격</label>
            <input
              type="text"
              value={formData.chamferSpec}
              onChange={(e) => updateField('chamferSpec', e.target.value)}
              placeholder="예: C1.5 ~ C2.5"
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 font-mono text-xs outline-none"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">버(Burr) 최대 허용한도</label>
            <input
              type="text"
              value={formData.maxAllowedBurr}
              onChange={(e) => updateField('maxAllowedBurr', e.target.value)}
              placeholder="예: Max 0.20mm"
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 font-mono text-xs outline-none"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">단차/직각도 최대 허용</label>
            <input
              type="text"
              value={formData.maxAllowedStep}
              onChange={(e) => updateField('maxAllowedStep', e.target.value)}
              placeholder="예: Max 0.30mm"
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 font-mono text-xs outline-none"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-slate-400 block mb-1">현장 검사원 특이사항 및 사전 관찰 메모</label>
          <textarea
            rows={2}
            value={formData.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            placeholder="예: 6시 방향 돌출 버와 단차 관찰됨. 편면취 폭 편차 확인 필요."
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-cyan-400 transition-colors resize-none"
          />
        </div>

        {/* Action Button: Evaluates against Master Main Data and automatically archives into Sub Data */}
        <div className="space-y-1.5">
          <button
            onClick={onAnalyze}
            disabled={isLoading}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 hover:from-cyan-500 hover:via-sky-500 hover:to-indigo-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-cyan-900/30 flex items-center justify-center gap-2.5 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>관리자 메인 DB 대조 판정 및 서브 Data 축적 진행 중...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5 text-cyan-200" />
                <span>심사 실행 (메인 DB 대조 판정 + 서브 Data 자동 축적)</span>
              </>
            )}
          </button>
          <div className="flex items-center justify-center gap-1.5 text-[10.5px] text-slate-400 text-center font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>판정 근거: 관리자가 승인한 메인 Data {mainDefectCount}건 절대 기준 대조</span>
            <span>·</span>
            <span className="text-cyan-400 font-semibold">심사 시 서브 Data 자동 저장</span>
          </div>
        </div>
      </div>
    </div>
  );
};
