import React from 'react';
import { 
  Camera, 
  Layers, 
  Scale, 
  FileCheck, 
  Wrench, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  HelpCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Cpu,
  Info,
  ChevronRight
} from 'lucide-react';
import { ConcessionAnalysisResult, DetectedDefect, SpecComparisonItem } from '../types';

interface AssessmentSectionsProps {
  result: ConcessionAnalysisResult;
  customerName: string;
  steelGrade: string;
  diameterMm: number | string;
}

export const AssessmentSections: React.FC<AssessmentSectionsProps> = ({
  result,
  customerName,
  steelGrade,
  diameterMm,
}) => {
  const { section1_imageAnalysis, section2_standardsCrossCheck, section3_comprehensiveJudgement, section4_followUpActions } = result;

  const getSeverityBadge = (sev: string) => {
    if (sev.includes('치명') || sev.includes('Critical')) {
      return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    }
    if (sev.includes('심각') || sev.includes('Severe')) {
      return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
    }
    if (sev.includes('보통') || sev.includes('Moderate')) {
      return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    }
    return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
  };

  const getComplianceBadge = (status: string) => {
    if (status.includes('만족') || status.includes('Pass')) {
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
    if (status.includes('흡수') || status.includes('가능')) {
      return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
    }
    if (status.includes('초과') || status.includes('사상')) {
      return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    }
    return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
  };

  return (
    <div className="space-y-6">
      {/* ========================================================
          1. 이미지 분석 (절단면 결함 종류 및 심각도)
      ======================================================== */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="px-5 py-3.5 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-md bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center justify-center font-mono">
              1
            </span>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Camera className="w-4 h-4 text-cyan-400" />
              이미지 정밀 분석 (결함 종류 및 심각도)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">절단 조도 품질 점수:</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-400 font-mono font-bold text-xs">
              {section1_imageAnalysis.cutQualityScore} / 100점
            </span>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-300 bg-slate-950/70 p-3.5 rounded-lg border border-slate-800 leading-relaxed font-sans">
            <strong className="text-cyan-400 font-semibold mr-1">절단면 총평:</strong>
            {section1_imageAnalysis.overview}
          </p>

          <div>
            <h4 className="text-xs font-semibold text-slate-400 mb-2.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              식별된 결함 세부 판독 목록 ({section1_imageAnalysis.detectedDefects.length}건):
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {section1_imageAnalysis.detectedDefects.map((defect, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 space-y-2 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                      {defect.type}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getSeverityBadge(defect.severity)}`}>
                      {defect.severity}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-900/60 p-2 rounded border border-slate-850">
                    <div>
                      <span className="text-slate-500 block text-[10px]">추정 치수/강도</span>
                      <span className="text-slate-300 font-mono font-medium">{defect.estimatedMetric}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">발생 위치</span>
                      <span className="text-slate-300 font-medium">{defect.location}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 bg-slate-900/40 p-2 rounded">
                    <span className="text-slate-500 text-[10px] block font-semibold mb-0.5">설비/공정 추정 원인:</span>
                    {defect.rootCauseHypothesis}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. 기준 대조 (고객사 공정 특성, 끝단 사용 여부, 클레임 민감도)
      ======================================================== */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="px-5 py-3.5 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-md bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-bold text-xs flex items-center justify-center font-mono">
              2
            </span>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Scale className="w-4 h-4 text-indigo-400" />
              기준 대조 (후공정 영향성 & 끝단 소모 여부 검증)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {customerName} · {steelGrade}
          </span>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
              <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" /> 고객사 공정 호환성
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {section2_standardsCrossCheck.processCompatibilityAnalysis}
              </p>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
              <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-emerald-400" /> 끝단 사용/탈락 여부
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {section2_standardsCrossCheck.endUtilizationImpact}
              </p>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
              <span className="text-xs font-semibold text-rose-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> 클레임 민감도 위험 평가
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {section2_standardsCrossCheck.claimRiskEvaluation}
              </p>
            </div>
          </div>

          {/* Standards Cross Check Table */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 mb-2.5">
              고객 요구 품질 스펙 대조표 (Spec vs Actual Cross-Check):
            </h4>
            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <th className="py-2.5 px-3 font-semibold">검사 항목</th>
                    <th className="py-2.5 px-3 font-semibold">고객사 관리 기준</th>
                    <th className="py-2.5 px-3 font-semibold">실제 판독치 (현물 상태)</th>
                    <th className="py-2.5 px-3 font-semibold text-center">적합성 판정</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/60 font-mono">
                  {section2_standardsCrossCheck.comparisonTable.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-850/50">
                      <td className="py-2.5 px-3 font-medium text-slate-200 font-sans">{row.item}</td>
                      <td className="py-2.5 px-3 text-slate-400">{row.customerStandard}</td>
                      <td className="py-2.5 px-3 text-slate-300">{row.actualState}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-sans font-semibold border ${getComplianceBadge(row.complianceStatus)}`}>
                          {row.complianceStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          3. 종합 판단 (20년 경력 전문가 관점의 명확한 사유)
      ======================================================== */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="px-5 py-3.5 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center font-mono">
              3
            </span>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-amber-400" />
              종합 판단 & 20년 경력 품질전문가 심사의견서
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-amber-400 bg-amber-950/60 px-2.5 py-0.5 rounded border border-amber-800/40">
            {result.verdictGrade}
          </span>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {/* Veteran Rationale */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-4 rounded-xl border border-slate-800/90 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
              <Info className="w-4 h-4" />
              <span>품질보증 총괄 전문가 종합 판단 근거 (Rationale):</span>
            </div>
            <p className="text-slate-200 leading-relaxed text-xs sm:text-[13px] font-sans whitespace-pre-line pl-6">
              {section3_comprehensiveJudgement.veteranRationale}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> 납기 및 경제성 영향 분석
              </span>
              <p className="text-slate-300 text-xs leading-relaxed">
                {section3_comprehensiveJudgement.economicAndDeliveryImpact}
              </p>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" /> 유사 특수강 특채 승인 선례
              </span>
              <p className="text-slate-300 text-xs leading-relaxed">
                {section3_comprehensiveJudgement.concessionPrecedent}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          4. 후속 조치 및 현장 작업 지시
      ======================================================== */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="px-5 py-3.5 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center font-mono">
              4
            </span>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-emerald-400" />
              후속 조치 & 현장 작업 지시서
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">현장 즉시 배포용</span>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Rework instructions */}
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
              <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                현장 사상 / 재작업 표준 지침 (Rework SOP)
              </span>
              <ul className="space-y-1.5 text-slate-300">
                {section4_followUpActions.reworkInstructions.map((inst, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold font-mono">[{i + 1}]</span>
                    <span>{inst}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Shop floor actions */}
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
              <span className="font-semibold text-cyan-400 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5" />
                절단 라인 설비 피드백 & 재발방지 대책
              </span>
              <ul className="space-y-1.5 text-slate-300">
                {section4_followUpActions.shopFloorPreventiveActions.map((act, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold font-mono">[{i + 1}]</span>
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Customer communication guide */}
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1">
            <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-indigo-400" />
              고객사 기술 협의 및 특채 신청서 작성 가이드
            </span>
            <p className="text-slate-300 leading-relaxed">
              {section4_followUpActions.customerCommunicationGuide}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
