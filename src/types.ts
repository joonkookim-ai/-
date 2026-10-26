export interface DetectedDefect {
  type: string; // 미면취, 편면취, 단차, 버, 크랙, 톱자국, 찢김 등
  severity: '경미 (Minor)' | '보통 (Moderate)' | '심각 (Severe)' | '치명 (Critical)' | string;
  estimatedMetric: string; // 버 높이 0.8mm, 단차 약 0.5mm 등
  location: string; // 6시 방향, 외주 전반 등
  rootCauseHypothesis: string; // 톱날 마모, 바이스 유격 등
}

export interface SpecComparisonItem {
  item: string;
  customerStandard: string;
  actualState: string;
  complianceStatus: '만족' | '허용치 초과' | '공정 흡수 가능' | '불합격' | string;
}

export interface ConcessionAnalysisResult {
  verdictGrade: '[특채 승인 권고]' | '[조건부 승인 (재작업 필요)]' | '[특채 불가 (폐기 또는 타용도 전용)]' | '[품질 관리자 정밀 육안 검사 요망]' | string;
  verdictCode: 'APPROVED_CONCESSION' | 'CONDITIONAL_REWORK' | 'REJECTED_SCRAP_DIVERT' | 'MANUAL_INSPECTION_REQUIRED' | string;
  confidenceScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string;
  summaryVerdict: string;
  section1_imageAnalysis: {
    overview: string;
    detectedDefects: DetectedDefect[];
    cutQualityScore: number;
  };
  section2_standardsCrossCheck: {
    processCompatibilityAnalysis: string;
    endUtilizationImpact: string;
    claimRiskEvaluation: string;
    comparisonTable: SpecComparisonItem[];
  };
  section3_comprehensiveJudgement: {
    veteranRationale: string;
    economicAndDeliveryImpact: string;
    concessionPrecedent: string;
  };
  section4_followUpActions: {
    reworkInstructions: string[];
    shopFloorPreventiveActions: string[];
    customerCommunicationGuide: string;
  };
}

export interface InspectionPin {
  id: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  label: string;
  type: 'burr' | 'step' | 'chamfer' | 'crack' | 'other';
  note?: string;
}
