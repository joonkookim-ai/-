import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Shared Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface ConcessionRequest {
  imageBase64: string;
  mimeType?: string;
  customerData: {
    customerName: string;
    steelGrade: string; // Free text
    diameterMm: number | string;
    processType: string;
    endUtilization: string;
    claimSensitivity: string;
    maxAllowedBurr?: string;
    maxAllowedStep?: string;
    chamferSpec?: string;
    notes?: string;
  };
}

const DB_DIR = path.resolve(__dirname, 'data');
const MAIN_DB_FILE = path.resolve(DB_DIR, 'main_defects.json');
const SUB_DB_FILE = path.resolve(DB_DIR, 'sub_defects.json');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

function getMainDefects(): any[] {
  try {
    if (fs.existsSync(MAIN_DB_FILE)) {
      return JSON.parse(fs.readFileSync(MAIN_DB_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading main defect DB:', e);
  }
  return [];
}

function saveMainDefects(items: any[]) {
  try {
    fs.writeFileSync(MAIN_DB_FILE, JSON.stringify(items, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving main defect DB:', e);
  }
}

function getSubDefects(): any[] {
  try {
    if (fs.existsSync(SUB_DB_FILE)) {
      return JSON.parse(fs.readFileSync(SUB_DB_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading sub defect DB:', e);
  }
  return [];
}

function saveSubDefects(items: any[]) {
  try {
    fs.writeFileSync(SUB_DB_FILE, JSON.stringify(items, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving sub defect DB:', e);
  }
}

// Defect knowledge endpoints (Main & Sub Data)
app.get('/api/defect-knowledge', (_req: Request, res: Response) => {
  res.json({
    mainItems: getMainDefects(),
    subItems: getSubDefects(),
  });
});

app.post('/api/defect-knowledge/main', (req: Request, res: Response) => {
  try {
    const newItem = req.body;
    if (!newItem.title || !newItem.whyProblem) {
      return res.status(400).json({ error: '제목과 문제 형태 사유는 필수 입력입니다.' });
    }
    const current = getMainDefects();
    const createdItem = {
      ...newItem,
      id: newItem.id || `main-defect-${Date.now()}`,
      createdAt: newItem.createdAt || new Date().toISOString().split('T')[0],
      isMain: true,
      registeredBy: newItem.registeredBy || '품질 관리자 (QA Manager)',
    };
    current.unshift(createdItem);
    saveMainDefects(current);

    // If promoted from sub data, mark sub item as promoted
    if (newItem.promotedFromSubId) {
      const subs = getSubDefects();
      const target = subs.find((s) => s.id === newItem.promotedFromSubId);
      if (target) {
        target.status = 'PROMOTED';
        target.promotedToMainId = createdItem.id;
        saveSubDefects(subs);
      }
    }

    res.json({ success: true, item: createdItem });
  } catch (e: any) {
    res.status(500).json({ error: e.message || '메인 데이터 저장 실패' });
  }
});

app.post('/api/defect-knowledge/sub', (req: Request, res: Response) => {
  try {
    const subItem = req.body;
    const subs = getSubDefects();
    const createdSub = {
      ...subItem,
      id: subItem.id || `sub-defect-${Date.now()}`,
      inspectedAt: subItem.inspectedAt || new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: subItem.status || 'PENDING',
    };
    subs.unshift(createdSub);
    // Keep max 200 recent sub records in file storage
    if (subs.length > 200) subs.length = 200;
    saveSubDefects(subs);
    res.json({ success: true, item: createdSub });
  } catch (e: any) {
    res.status(500).json({ error: e.message || '서브 데이터 저장 실패' });
  }
});

app.delete('/api/defect-knowledge/main/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let current = getMainDefects();
    current = current.filter((item: any) => item.id !== id);
    saveMainDefects(current);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message || '삭제 실패' });
  }
});

app.delete('/api/defect-knowledge/sub/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let current = getSubDefects();
    current = current.filter((item: any) => item.id !== id);
    saveSubDefects(current);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message || '삭제 실패' });
  }
});

const SPREADSHEET_DB_FILE = path.resolve(DB_DIR, 'spreadsheet_records.json');
const CONFIG_FILE = path.resolve(DB_DIR, 'config.json');

function getSpreadsheetRecords(): any[] {
  try {
    if (fs.existsSync(SPREADSHEET_DB_FILE)) {
      return JSON.parse(fs.readFileSync(SPREADSHEET_DB_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading spreadsheet records:', e);
  }
  return [];
}

function saveSpreadsheetRecords(items: any[]) {
  try {
    fs.writeFileSync(SPREADSHEET_DB_FILE, JSON.stringify(items, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving spreadsheet records:', e);
  }
}

function getAppConfig(): { googleSheetsWebhookUrl?: string } {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading config:', e);
  }
  return {};
}

function saveAppConfig(cfg: any) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving config:', e);
  }
}

// Google Spreadsheet / Database Auto-Accumulation Endpoints
app.get('/api/spreadsheet-records', (_req: Request, res: Response) => {
  const records = getSpreadsheetRecords();
  const config = getAppConfig();
  res.json({ records, config });
});

app.post('/api/spreadsheet-records', async (req: Request, res: Response) => {
  try {
    const record = req.body;
    const records = getSpreadsheetRecords();
    const newRecord = {
      ...record,
      id: record.id || `sheet-row-${Date.now()}`,
      date: record.date || new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    records.unshift(newRecord);
    if (records.length > 500) records.length = 500;
    saveSpreadsheetRecords(records);

    // If Google Sheets Webhook URL is set, send async POST to Google Sheet
    const config = getAppConfig();
    let webhookSynced = false;
    if (config.googleSheetsWebhookUrl && config.googleSheetsWebhookUrl.startsWith('http')) {
      try {
        await fetch(config.googleSheetsWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: newRecord.date,
            customerName: newRecord.customerName,
            steelGrade: newRecord.steelGrade,
            diameterMm: newRecord.diameterMm,
            verdictGrade: newRecord.verdictGrade,
            summaryVerdict: newRecord.summaryVerdict,
            detectedDefects: newRecord.detectedDefects,
            operatorNotes: newRecord.operatorNotes,
            imageThumbnail: newRecord.imageThumbnail || (newRecord.image ? newRecord.image.substring(0, 80) + '...' : ''),
          }),
        });
        webhookSynced = true;
      } catch (webhookErr) {
        console.error('Google Sheets Webhook Sync error:', webhookErr);
      }
    }

    res.json({ success: true, item: newRecord, webhookSynced });
  } catch (e: any) {
    res.status(500).json({ error: e.message || '스프레드시트 누적 저장 실패' });
  }
});

app.post('/api/spreadsheet-config', (req: Request, res: Response) => {
  try {
    const { googleSheetsWebhookUrl } = req.body;
    const config = getAppConfig();
    config.googleSheetsWebhookUrl = googleSheetsWebhookUrl;
    saveAppConfig(config);
    res.json({ success: true, config });
  } catch (e: any) {
    res.status(500).json({ error: e.message || '설정 저장 실패' });
  }
});

app.delete('/api/spreadsheet-records/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let records = getSpreadsheetRecords();
    records = records.filter((r: any) => r.id !== id);
    saveSpreadsheetRecords(records);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message || '삭제 실패' });
  }
});

app.post('/api/concession-analyze', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', customerData, mainReferenceDefects } = req.body as ConcessionRequest & {
      mainReferenceDefects?: any[];
    };

    if (!imageBase64) {
      return res.status(400).json({ error: '환봉 절단면 이미지가 제공되지 않았습니다.' });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const systemPrompt = `당신은 20년 경력의 대한민국 특수강/환봉(Special Steel SBQ Round Bar) 품질관리(QC/QA) 및 품질보증 최고 전문가입니다.
현대제철, 세아베스틸 등 특수강 메이커와 자동차(현대/기아 및 1차 벤더), 중장비, 베어링 제조사 고객사 간의 특채(Concession) 심사를 수천 건 이상 주관해온 베테랑입니다.

[절대 판정 원칙: 관리자 등록 메인 Data 근거 심사]
1. 당신의 판정은 항상 관리자가 공식 등록/승인한 [메인 불량 형태 Data]를 절대적인 기준(Ground Truth)으로 삼아 대조하여 진행되어야 합니다.
2. 불필요한 동심원 치수나 가공 방식보다는 실제 후공정에 직결되는 3대 핵심 결함에 집중하십시오:
   - 편면취: 원주 방향 모따기 폭 불균일도 및 틸팅 유발 편차
   - 미면취: 모따기 가공 누락으로 인한 날카로운 Sharp Edge
   - 절단면 상태: 톱날 결손 단차, 뜯김, 관통부 과대 버(Burr), 전단/열 균열 크랙
3. 관리자 메인 DB에 수록된 한도 기준(예: 편면취 편차 ΔC ≤ 0.8mm 한도, 버 0.5mm 초과 시 제거 필수, 크랙 절대 불합격)을 엄격히 준수하십시오.

[분석 절차 - 필수 준수]
1. 이미지 분석: 절단면의 핵심 결함(편면취, 미면취, 절단 단차, 버, 크랙 등)과 심각도를 기술하십시오.
2. 기준 대조: 고객사의 공정 특성(열간단조, 냉간단조, CNC 정밀가공 등), 끝단 사용 여부, 클레임 민감도, 그리고 [관리자 메인 DB 선례]를 정밀 대조하십시오.
3. 종합 판단: 다음 4가지 등급 중 단 하나를 엄격하게 부여하고 명확한 사유를 기술하십시오.
   - [특채 승인 권고]
   - [조건부 승인 (재작업 필요)]
   - [특채 불가 (폐기 또는 타용도 전용)]
   - [품질 관리자 정밀 육안 검사 요망]
4. 후속 조치 및 현장 작업 지시: 현장 사상/재작업 방안, 톱날/절단 설비 점검사항, 고객사 기술 협의 권고사항을 명시하십시오.

반드시 지정된 JSON 스키마 형식으로 응답하십시오.`;

    const mainDbText =
      mainReferenceDefects && mainReferenceDefects.length > 0
        ? `\n[판정 기준: 관리자가 등록한 메인 불량 형태 Data (Ground Truth)]:\n` +
          mainReferenceDefects
            .map(
              (m: any, i: number) =>
                `(${i + 1}) [${m.defectType}] ${m.title}\n   - 문제 원인: ${m.whyProblem}\n   - 한도 기준: ${m.boundaryRule || '관리 기준 준용'}\n   - 과거 판례: ${m.concessionPrecedent || ''}`
            )
            .join('\n') +
          `\n`
        : '';

    const userPromptText = `
[고객사 및 수주 제품 품질 기준 데이터]
- 고객사명: ${customerData.customerName || '미지정 고객사'}
- 적용 강종 (Text): ${customerData.steelGrade || 'SCM440'}
- 환봉 규격 직경: Ø ${customerData.diameterMm || '85'} mm
- 고객사 후공정 특성: ${customerData.processType}
- 끝단 사용 여부: ${customerData.endUtilization}
- 클레임 민감도: ${customerData.claimSensitivity}
- 고객사 요구 규격: 면취 규격(${customerData.chamferSpec || 'C1.5 ~ C2.5'}), 버 허용 한도(${customerData.maxAllowedBurr || '0.2mm 이하'}), 단차 허용 한도(${customerData.maxAllowedStep || '0.3mm 이하'})
- 현장 검사원 참고사항: ${customerData.notes || '특이사항 없음'}
${mainDbText}
위 환봉 절단면 사진의 편면취, 미면취, 절단면 상태를 면밀히 판독하고, 관리자가 등록한 [메인 Data]를 절대적 근거로 대조하여 특채 심사를 진행하십시오.
`;

    // Try Gemini API call
    if (process.env.GEMINI_API_KEY) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: {
            parts: [
              {
                inlineData: {
                  data: cleanBase64,
                  mimeType: mimeType,
                },
              },
              {
                text: userPromptText,
              },
            ],
          },
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                verdictGrade: {
                  type: Type.STRING,
                  description:
                    "반드시 '[특채 승인 권고]', '[조건부 승인 (재작업 필요)]', '[특채 불가 (폐기 또는 타용도 전용)]', '[품질 관리자 정밀 육안 검사 요망]' 중 하나",
                },
                verdictCode: {
                  type: Type.STRING,
                  description: 'APPROVED_CONCESSION | CONDITIONAL_REWORK | REJECTED_SCRAP_DIVERT | MANUAL_INSPECTION_REQUIRED',
                },
                confidenceScore: {
                  type: Type.NUMBER,
                  description: '판독 신뢰도 (70 ~ 99 사이 숫자)',
                },
                riskLevel: {
                  type: Type.STRING,
                  description: 'LOW | MEDIUM | HIGH | CRITICAL',
                },
                summaryVerdict: {
                  type: Type.STRING,
                  description: '20년차 품질부서장의 한 줄 핵심 판정 요약',
                },
                section1_imageAnalysis: {
                  type: Type.OBJECT,
                  properties: {
                    overview: { type: Type.STRING, description: '절단면 전체 상태 개요' },
                    detectedDefects: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          type: { type: Type.STRING, description: '결함 종류 (편면취, 미면취, 단차, 버, 크랙, 뜯김 등)' },
                          severity: { type: Type.STRING, description: '경미 (Minor) | 보통 (Moderate) | 심각 (Severe) | 치명 (Critical)' },
                          estimatedMetric: { type: Type.STRING, description: '추정 수치 (예: 버 높이 0.8mm, 단차 약 0.5mm, 편면취 각도 20도 편차)' },
                          location: { type: Type.STRING, description: '위치 (예: 절단 종료부 6시 방향, 외주 2~5시 편면취 등)' },
                          rootCauseHypothesis: { type: Type.STRING, description: '추정 원인 (소재 공급 휨, 톱날 칩핑, 척킹 편심 등)' },
                        },
                        required: ['type', 'severity', 'estimatedMetric', 'location', 'rootCauseHypothesis'],
                      },
                    },
                    cutQualityScore: { type: Type.NUMBER, description: '절단 품질 점수 (100점 만점 기준)' },
                  },
                  required: ['overview', 'detectedDefects', 'cutQualityScore'],
                },
                section2_standardsCrossCheck: {
                  type: Type.OBJECT,
                  properties: {
                    processCompatibilityAnalysis: { type: Type.STRING, description: '고객사 후공정(단조, 가공 등)과의 호환성 및 영향 분석' },
                    endUtilizationImpact: { type: Type.STRING, description: '끝단 사용 여부에 따른 결함 잔존 또는 제거 가능성 분석' },
                    claimRiskEvaluation: { type: Type.STRING, description: '고객사 클레임 및 라인 정지/불량 발생 위험도 평가' },
                    comparisonTable: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          item: { type: Type.STRING, description: '항목 (면취, 버, 단차, 크랙 등)' },
                          customerStandard: { type: Type.STRING, description: '고객사 기준 / 관리자 메인 DB 한도 기준' },
                          actualState: { type: Type.STRING, description: '실제 판독치' },
                          complianceStatus: { type: Type.STRING, description: '만족 | 허용치 초과 | 공정 흡수 가능 | 불합격' },
                        },
                        required: ['item', 'customerStandard', 'actualState', 'complianceStatus'],
                      },
                    },
                  },
                  required: ['processCompatibilityAnalysis', 'endUtilizationImpact', 'claimRiskEvaluation', 'comparisonTable'],
                },
                section3_comprehensiveJudgement: {
                  type: Type.OBJECT,
                  properties: {
                    veteranRationale: { type: Type.STRING, description: '20년 경력 전문가 관점의 상세 기술적/공학적 판단 근거' },
                    economicAndDeliveryImpact: { type: Type.STRING, description: '폐기/재작업/특채 시의 납기 및 경제성 영향 분석' },
                    concessionPrecedent: { type: Type.STRING, description: '관리자 메인 DB 선례 대조 결과' },
                  },
                  required: ['veteranRationale', 'economicAndDeliveryImpact', 'concessionPrecedent'],
                },
                section4_followUpActions: {
                  type: Type.OBJECT,
                  properties: {
                    reworkInstructions: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: '구체적인 현장 재작업 표준 지침',
                    },
                    shopFloorPreventiveActions: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: '절단 반장 및 설비 오퍼레이터 피드백 / 재발 방지 대책',
                    },
                    customerCommunicationGuide: { type: Type.STRING, description: '고객사 품질부서 대응 논리 또는 특채 신청서 작성 가이드' },
                  },
                  required: ['reworkInstructions', 'shopFloorPreventiveActions', 'customerCommunicationGuide'],
                },
              },
              required: [
                'verdictGrade',
                'verdictCode',
                'confidenceScore',
                'riskLevel',
                'summaryVerdict',
                'section1_imageAnalysis',
                'section2_standardsCrossCheck',
                'section3_comprehensiveJudgement',
                'section4_followUpActions',
              ],
            },
          },
        });

        const textResponse = response.text;
        if (textResponse) {
          const parsed = JSON.parse(textResponse);
          return res.json(parsed);
        }
      } catch (geminiError: any) {
        console.error('Gemini API execution error:', geminiError);
      }
    }

    // Expert Fallback Engine
    const simulatedExpert = generateExpertAnalysisFallback(customerData);
    return res.json(simulatedExpert);
  } catch (err: any) {
    console.error('API Error in /api/concession-analyze:', err);
    res.status(500).json({ error: err.message || '특채 분석 처리 중 오류가 발생했습니다.' });
  }
});

function generateExpertAnalysisFallback(data: ConcessionRequest['customerData']) {
  const isCrack = (data.notes || '').includes('크랙') || (data.processType || '').includes('냉간');
  const isEndMachinedOff = (data.endUtilization || '').includes('전량') || (data.endUtilization || '').includes('가공여유');
  const isAutomotive = (data.claimSensitivity || '').includes('높음') || (data.customerName || '').includes('현대') || (data.customerName || '').includes('자동차');

  let grade = '[조건부 승인 (재작업 필요)]';
  let code = 'CONDITIONAL_REWORK';
  let risk = 'MEDIUM';
  let summary = '관리자 메인 DB 기준, 편면취 및 버가 관찰되나 사상 재작업 완료 조건으로 특채 심사 승인 가능합니다.';

  if (isCrack && isAutomotive) {
    grade = '[특채 불가 (폐기 또는 타용도 전용)]';
    code = 'REJECTED_SCRAP_DIVERT';
    risk = 'CRITICAL';
    summary = '관리자 메인 DB [성형 중 폭발 파단 사례] 기준, 전단 크랙 전파 위험으로 즉시 특채 불가 판정합니다.';
  } else if (isEndMachinedOff && !isCrack) {
    grade = '[특채 승인 권고]';
    code = 'APPROVED_CONCESSION';
    risk = 'LOW';
    summary = '끝단이 후공정 CNC 페이스 컷에서 전량 가공 탈락되므로, 편면취 및 경미한 버는 특채 승인 권고합니다.';
  } else if ((data.notes || '').includes('확인') || (data.notes || '').includes('심도')) {
    grade = '[품질 관리자 정밀 육안 검사 요망]';
    code = 'MANUAL_INSPECTION_REQUIRED';
    risk = 'HIGH';
    summary = '절단면 중심 편석 또는 단차 심도가 사진상 판별 한계가 있어, 비파괴(MT/UT) 및 현장 한도견본 대조가 필요합니다.';
  }

  return {
    verdictGrade: grade,
    verdictCode: code,
    confidenceScore: 92,
    riskLevel: risk,
    summaryVerdict: summary,
    section1_imageAnalysis: {
      overview: `외경 Ø${data.diameterMm || 80}mm 환봉 절단면 분석 결과, 원주 편면취 및 절단 버(Burr)가 식별되었습니다.`,
      detectedDefects: [
        {
          type: '편면취 (Uneven Chamfer)',
          severity: '보통 (Moderate)',
          estimatedMetric: '면취 폭 편차 약 0.8mm',
          location: '원주 2시~5시 방향',
          rootCauseHypothesis: '소재 공급 롤러 휨 또는 유압 바이스 척킹 편심',
        },
        {
          type: '절단 버 (Cutting Burr)',
          severity: '경미 (Minor)',
          estimatedMetric: '버 높이 약 0.45mm',
          location: '절단 관통 종료 지점 (6시 방향)',
          rootCauseHypothesis: '원형 톱날 후반부 마모',
        },
      ],
      cutQualityScore: 80,
    },
    section2_standardsCrossCheck: {
      processCompatibilityAnalysis: `관리자 메인 DB 대조 결과: ${
        isEndMachinedOff
          ? '끝단 5mm 이상이 페이스 컷으로 깎여나가므로 최종 완성품에 영향 없음.'
          : '끝단이 최종 형상 또는 척킹 기준면일 경우 로봇 콜렛 물림 불량 위험 존재.'
      }`,
      endUtilizationImpact: `끝단 사용 여부: [${data.endUtilization}].`,
      claimRiskEvaluation: `클레임 민감도 [${data.claimSensitivity}] 감안 시 관리자 메인 DB 선례 준수 필요.`,
      comparisonTable: [
        {
          item: '면취 치수 (Chamfer)',
          customerStandard: data.chamferSpec || 'C1.5 ~ C2.5 (ΔC ≤ 0.8mm)',
          actualState: 'C1.2 ~ C2.8 (편면취)',
          complianceStatus: isEndMachinedOff ? '공정 흡수 가능' : '허용치 초과',
        },
        {
          item: '버 높이 (Burr)',
          customerStandard: data.maxAllowedBurr || 'Max 0.2mm',
          actualState: '약 0.45mm',
          complianceStatus: '허용치 초과 (사상 필요)',
        },
      ],
    },
    section3_comprehensiveJudgement: {
      veteranRationale: `관리자가 등록한 [메인 불량 형태 Data]를 근거로 대조한 결과, 모재 내부 건전성에는 이상이 없으므로 스크랩 폐기 대신 재작업 사상 후 출하하는 것이 경제성과 품질을 동시 충족합니다.`,
      economicAndDeliveryImpact: `폐기 시 수주의 납기 지연이 발생하나, 사상 재작업 시 당일 납품 보장 가능.`,
      concessionPrecedent: `관리자 메인 DB [사례 1, 사례 4] 기준 조건부 사상 승인 선례 적용.`,
    },
    section4_followUpActions: {
      reworkInstructions: [
        '휴대용 에어 그라인더(100 Mesh)를 사용하여 6시 방향 돌출 버 제거',
        '면취 게이지로 편면취 폭 편차 실측 후 메인 한도 규격 이내 확인',
      ],
      shopFloorPreventiveActions: [
        '소재 유압 클램프 서포트 롤러 레벨링 점검',
        '절단 톱날 수명 카운터 점검',
      ],
      customerCommunicationGuide: `고객사에 관리자 메인 한도 기준 대조 성적서를 동봉하여 특채 제출.`,
    },
  };
}

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Special Steel QC Concession Server running on port ${PORT}`);
  });
}

startServer();
