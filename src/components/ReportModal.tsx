import React, { useRef } from 'react';
import { 
  X, 
  Printer, 
  Copy, 
  Download, 
  Check, 
  ShieldCheck, 
  Award,
  FileText
} from 'lucide-react';
import { ConcessionAnalysisResult } from '../types';
import { CustomerFormData } from './CustomerDataForm';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ConcessionAnalysisResult;
  customerData: CustomerFormData;
  imageSrc: string | null;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  result,
  customerData,
  imageSrc,
}) => {
  const [copied, setCopied] = React.useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const docNo = `QMS-CON-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const todayStr = new Date().toISOString().split('T')[0];

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const text = `
[특수강 환봉 절단면 품질 판독 및 특채(Concession) 심사의견서]
문서번호: ${docNo}
발행일자: ${todayStr}

1. 대상 품목 정보
- 고객사: ${customerData.customerName}
- 적용 강종: ${customerData.steelGrade}
- 환봉 규격: Ø${customerData.diameterMm} mm
- 고객사 후공정: ${customerData.processType}
- 끝단 사용 여부: ${customerData.endUtilization}
- 클레임 민감도: ${customerData.claimSensitivity}

2. 종합 판정 결과
- 최종 등급: ${result.verdictGrade}
- 판정 코드: ${result.verdictCode}
- 신뢰도: ${result.confidenceScore}% (위험도: ${result.riskLevel})
- 핵심 요약: ${result.summaryVerdict}

3. [절차 1] 이미지 정밀 분석
- 절단면 개요: ${result.section1_imageAnalysis.overview}
- 식별 결함:
${result.section1_imageAnalysis.detectedDefects
  .map(
    (d, i) =>
      `  [${i + 1}] ${d.type} | 심각도: ${d.severity} | 치수: ${d.estimatedMetric} | 위치: ${d.location}\n     원인 가설: ${d.rootCauseHypothesis}`
  )
  .join('\n')}

4. [절차 2] 기준 대조
- 공정 호환성: ${result.section2_standardsCrossCheck.processCompatibilityAnalysis}
- 끝단 영향: ${result.section2_standardsCrossCheck.endUtilizationImpact}
- 클레임 리스크: ${result.section2_standardsCrossCheck.claimRiskEvaluation}

5. [절차 3] 종합 판단 사유
${result.section3_comprehensiveJudgement.veteranRationale}
- 경제성/납기 분석: ${result.section3_comprehensiveJudgement.economicAndDeliveryImpact}
- 유사 특채 선례: ${result.section3_comprehensiveJudgement.concessionPrecedent}

6. [절차 4] 후속 조치 및 현장 작업 지침
- 재작업 지침:
${result.section4_followUpActions.reworkInstructions.map((r, i) => `  [${i + 1}] ${r}`).join('\n')}
- 설비 재발방지:
${result.section4_followUpActions.shopFloorPreventiveActions.map((s, i) => `  [${i + 1}] ${s}`).join('\n')}
- 고객 협의 가이드: ${result.section4_followUpActions.customerCommunicationGuide}

(주)세아베스틸 / 현대제철 품질보증시스템 기준 준용
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ docNo, date: todayStr, customerData, result }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${docNo}_특채심사의견서.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full my-auto flex flex-col max-h-[92vh] overflow-hidden shadow-2xl">
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-base font-bold text-slate-100">
                특수강 환봉 절단면 품질 판독 및 특채(Concession) 공식 심사의견서
              </h2>
              <span className="text-xs text-slate-400 font-mono">문서번호: {docNo}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '복사 완료' : '텍스트 복사'}</span>
            </button>
            <button
              onClick={handleDownloadJson}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON 저장</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>인쇄 / PDF 출력</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet Body */}
        <div ref={reportRef} className="p-6 sm:p-8 overflow-y-auto space-y-6 bg-slate-950 text-slate-200 font-sans text-xs print:bg-white print:text-black">
          {/* Document Header Table */}
          <div className="border border-slate-800 p-4 rounded-xl bg-slate-900/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                <span>SEAH SPECIAL STEEL QUALITY CONCESSION REPORT</span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">
                특수강 환봉 절단면 품질 판독 및 특채(Concession) 기술 심사의견서
              </p>
            </div>
            <div className="text-right font-mono text-xs text-slate-400">
              <div>발행일자: {todayStr}</div>
              <div>발행부서: 특수강 품질보증팀 (QA)</div>
              <div>심사규격: IATF 16949 / ISO 9001</div>
            </div>
          </div>

          {/* Verdict Banner Stamp */}
          <div className="border-2 border-cyan-500/50 bg-cyan-950/30 p-4 rounded-xl flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase block">
                FINAL CONCESSION VERDICT
              </span>
              <div className="text-2xl font-black text-white mt-0.5">{result.verdictGrade}</div>
              <p className="text-slate-300 text-xs mt-1">"{result.summaryVerdict}"</p>
            </div>
            <div className="border-4 border-cyan-500 text-cyan-400 px-4 py-2 rounded-lg font-black text-center rotate-[-3deg]">
              <div className="text-[9px] font-mono">SEAH QA SEAL</div>
              <div className="text-sm whitespace-nowrap">{result.verdictCode}</div>
            </div>
          </div>

          {/* Section 1: Item Specs */}
          <div className="border border-slate-800 rounded-lg overflow-hidden">
            <div className="bg-slate-900 px-4 py-2 font-bold text-slate-300 border-b border-slate-800">
              1. 심사 대상 소재 및 고객사 공정 사양
            </div>
            <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/80">
              <div>
                <span className="text-slate-500 block text-[11px]">고객사명</span>
                <span className="font-semibold text-slate-200">{customerData.customerName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">적용 강종</span>
                <span className="font-mono font-semibold text-slate-200">{customerData.steelGrade}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">외경 치수</span>
                <span className="font-mono font-semibold text-slate-200">Ø{customerData.diameterMm} mm</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">클레임 민감도</span>
                <span className="text-slate-200 font-semibold">{customerData.claimSensitivity}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block text-[11px]">고객사 후공정</span>
                <span className="text-slate-200">{customerData.processType}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block text-[11px]">끝단 사용 여부</span>
                <span className="text-slate-200">{customerData.endUtilization}</span>
              </div>
            </div>
          </div>

          {/* Image & Defects */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {imageSrc && (
              <div className="border border-slate-800 rounded-lg p-2 bg-slate-900 flex flex-col items-center justify-center">
                <span className="text-[10px] text-slate-400 mb-1 font-mono">절단면 판독 사진</span>
                <img src={imageSrc} alt="절단면" className="max-h-44 object-contain rounded-md" />
              </div>
            )}
            <div className={`space-y-2 ${imageSrc ? 'sm:col-span-2' : 'sm:col-span-3'}`}>
              <div className="font-bold text-slate-300">식별된 결함 항목:</div>
              <div className="space-y-1.5">
                {result.section1_imageAnalysis.detectedDefects.map((d, i) => (
                  <div key={i} className="p-2 rounded bg-slate-900/60 border border-slate-800">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-200">
                        [{i + 1}] {d.type}
                      </span>
                      <span className="text-cyan-400 font-mono text-[11px]">{d.severity}</span>
                    </div>
                    <div className="text-slate-400 text-[11px] mt-0.5">
                      치수: {d.estimatedMetric} | 위치: {d.location}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Standards Cross Check */}
          <div className="border border-slate-800 rounded-lg overflow-hidden">
            <div className="bg-slate-900 px-4 py-2 font-bold text-slate-300 border-b border-slate-800">
              2. 고객사 품질 기준 대조 및 공정 적합성
            </div>
            <div className="p-4 space-y-2 bg-slate-950/80">
              <p>
                <strong className="text-slate-300">공정 호환성:</strong>{' '}
                {result.section2_standardsCrossCheck.processCompatibilityAnalysis}
              </p>
              <p>
                <strong className="text-slate-300">끝단 소모 영향:</strong>{' '}
                {result.section2_standardsCrossCheck.endUtilizationImpact}
              </p>
              <p>
                <strong className="text-slate-300">클레임 민감도 위험성:</strong>{' '}
                {result.section2_standardsCrossCheck.claimRiskEvaluation}
              </p>
            </div>
          </div>

          {/* Section 3: Veteran Rationale */}
          <div className="border border-slate-800 rounded-lg overflow-hidden">
            <div className="bg-slate-900 px-4 py-2 font-bold text-slate-300 border-b border-slate-800">
              3. 20년 경력 특수강 전문가 기술 심사의견 (종합 사유)
            </div>
            <div className="p-4 space-y-2 bg-slate-950/80 leading-relaxed text-slate-200">
              <p className="whitespace-pre-line">{result.section3_comprehensiveJudgement.veteranRationale}</p>
              <div className="pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-400 text-[11px]">
                <div>
                  <strong className="text-slate-300 block">경제성 및 납기 보호:</strong>
                  {result.section3_comprehensiveJudgement.economicAndDeliveryImpact}
                </div>
                <div>
                  <strong className="text-slate-300 block">유사 특채 선례:</strong>
                  {result.section3_comprehensiveJudgement.concessionPrecedent}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Follow up instructions */}
          <div className="border border-slate-800 rounded-lg overflow-hidden">
            <div className="bg-slate-900 px-4 py-2 font-bold text-slate-300 border-b border-slate-800">
              4. 현장 작업 지시 및 설비 재발방지 가이드
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/80">
              <div>
                <span className="font-semibold text-emerald-400 block mb-1">현장 사상 재작업 지침:</span>
                <ul className="space-y-1 list-disc list-inside text-slate-300 text-[11px]">
                  {result.section4_followUpActions.reworkInstructions.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="font-semibold text-cyan-400 block mb-1">절단 설비 피드백:</span>
                <ul className="space-y-1 list-disc list-inside text-slate-300 text-[11px]">
                  {result.section4_followUpActions.shopFloorPreventiveActions.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Signoff block */}
          <div className="border border-slate-800 rounded-lg p-4 bg-slate-900/40 grid grid-cols-3 text-center divide-x divide-slate-800">
            <div>
              <span className="text-slate-500 text-[10px] block">담당 검사원</span>
              <span className="text-slate-200 font-semibold mt-1 block">김준구 책임연구원 (인)</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">품질보증팀장</span>
              <span className="text-slate-200 font-semibold mt-1 block">이진호 팀장 (인)</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">품질부서장 (상무)</span>
              <span className="text-emerald-400 font-bold mt-1 block">[전자 승인 완료]</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
