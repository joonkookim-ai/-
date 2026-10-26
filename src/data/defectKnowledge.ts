import { generateBarCutSvg } from './presets';

export interface DefectKnowledgeItem {
  id: string;
  title: string;
  defectType: '편면취' | '미면취' | '절단단차' | '버(Burr)' | '절단크랙' | '절단면조도';
  severity: '주의 (Minor)' | '경고 (Major)' | '치명적 불량 (Critical)';
  imageSrc: string;
  steelGrade: string; // Free text (e.g. SCM440, S45C, 42CrMo4)
  diameterMm: number;
  customerAndProcess: string;
  whyProblem: string; // "왜 이런 형태가 문제인가?"
  boundaryRule: string; // 한도 판정 기준
  concessionPrecedent: string; // 과거 실제 판정 결과
  tags: string[];
  createdAt: string;
  isMain: true;
  registeredBy?: string;
  promotedFromSubId?: string;
}

export interface SubDefectItem {
  id: string;
  title: string;
  defectType: string;
  imageSrc: string;
  steelGrade: string; // Free text
  diameterMm: number;
  customerName: string;
  processType: string;
  endUtilization: string;
  claimSensitivity: string;
  verdictGrade: string;
  verdictCode: string;
  confidenceScore: number;
  summaryVerdict: string;
  detectedDefectsSummary: string;
  operatorNotes: string;
  inspectedAt: string;
  status: 'PENDING' | 'PROMOTED' | 'DISMISSED';
  promotedToMainId?: string;
}

// Procedural realistic cut pattern SVGs focusing strictly on 편면취, 미면취, 절단면 상태 (단차, 버, 뜯김)
export function generateDefectPatternSvg(type: 'eccentric_chamfer' | 'no_chamfer' | 'saw_step_tear' | 'heavy_exit_burr' | 'periphery_crack'): string {
  let content = '';

  if (type === 'eccentric_chamfer') {
    // Heavy eccentric chamfer: C0.5 at 8 o'clock vs C3.2 at 2 o'clock
    content = `
      <circle cx="200" cy="200" r="145" fill="url(#metalGrad)" stroke="#334155" stroke-width="2.5"/>
      <path d="M 98,125 A 145,145 0 0,1 315,105 L 340,90 A 170,170 0 0,0 75,115 Z" fill="#94a3b8" opacity="0.9"/>
      <path d="M 85,250 A 145,145 0 0,1 125,310 L 120,318 A 155,155 0 0,0 80,255 Z" fill="#475569" opacity="0.6"/>
      <g stroke="#94a3b8" stroke-width="0.8" opacity="0.3">
        ${Array.from({ length: 22 }).map((_, i) => `<line x1="${80 + i * 11}" y1="80" x2="${70 + i * 11}" y2="320"/>`).join('')}
      </g>
      <circle cx="305" cy="92" r="14" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="3,2"/>
      <text x="210" y="70" fill="#fbbf24" font-size="11" font-family="sans-serif" font-weight="bold">과대 편면취: C 3.2mm</text>
      <circle cx="95" cy="290" r="10" fill="none" stroke="#ef4444" stroke-width="1.5"/>
      <text x="30" y="325" fill="#f87171" font-size="11" font-family="sans-serif" font-weight="bold">면취 부족: C 0.5mm</text>
    `;
  } else if (type === 'no_chamfer') {
    // Missing chamfer (미면취) - sharp edge with burr, no chamfer bevel at all
    content = `
      <circle cx="200" cy="200" r="160" fill="url(#metalGrad)" stroke="#1e293b" stroke-width="3"/>
      <circle cx="200" cy="200" r="160" fill="none" stroke="#ef4444" stroke-width="3.5" stroke-dasharray="8,4"/>
      <g stroke="#64748b" stroke-width="0.9" opacity="0.4">
        ${Array.from({ length: 26 }).map((_, i) => `<line x1="${60 + i * 11}" y1="60" x2="${50 + i * 11}" y2="340"/>`).join('')}
      </g>
      <rect x="70" y="180" width="260" height="40" rx="6" fill="#0f172a" fill-opacity="0.85" stroke="#ef4444" stroke-width="1.5"/>
      <text x="95" y="205" fill="#f87171" font-size="13" font-family="sans-serif" font-weight="bold">면취 가공 누락 (미면취 - Sharp Edge)</text>
    `;
  } else if (type === 'saw_step_tear') {
    // Saw step and surface tear (단차 & 뜯김)
    content = `
      <circle cx="200" cy="200" r="150" fill="url(#metalGrad)" stroke="#334155" stroke-width="3"/>
      <circle cx="200" cy="200" r="160" fill="none" stroke="#64748b" stroke-width="10" opacity="0.7"/>
      <path d="M 65,170 L 160,172 L 175,188 L 335,190" fill="none" stroke="#f97316" stroke-width="3.5"/>
      <polygon points="160,172 175,188 175,195 160,179" fill="#ea580c"/>
      <ellipse cx="230" cy="240" rx="35" ry="18" fill="#475569" stroke="#ea580c" stroke-width="1.5" stroke-dasharray="3,2"/>
      <text x="200" y="245" fill="#fdba74" font-size="11" font-family="sans-serif" font-weight="bold">표면 뜯김(Tear)</text>
      <circle cx="168" cy="180" r="18" fill="none" stroke="#f97316" stroke-width="2"/>
      <text x="75" y="150" fill="#fed7aa" font-size="12" font-family="sans-serif" font-weight="bold">절단 단차 0.85mm (규격 초과)</text>
    `;
  } else if (type === 'heavy_exit_burr') {
    // Heavy cutting exit burr (과대 버)
    content = `
      <circle cx="200" cy="200" r="150" fill="url(#metalGrad)" stroke="#334155" stroke-width="3"/>
      <circle cx="200" cy="200" r="160" fill="none" stroke="#64748b" stroke-width="10" opacity="0.7"/>
      <path d="M 140,345 Q 160,378 180,352 Q 200,385 220,350 Q 240,380 260,345 Z" fill="#e2e8f0" stroke="#dc2626" stroke-width="3"/>
      <rect x="135" y="275" width="130" height="28" rx="4" fill="#020617" fill-opacity="0.9" stroke="#ef4444" stroke-width="1.5"/>
      <text x="145" y="294" fill="#fca5a5" font-size="11" font-family="sans-serif" font-weight="bold">과대 버(Burr) 1.2mm</text>
    `;
  } else {
    // Periphery crack (외곽 전단 균열)
    content = `
      <circle cx="200" cy="200" r="150" fill="url(#metalGrad)" stroke="#1e293b" stroke-width="3"/>
      <circle cx="200" cy="200" r="158" fill="none" stroke="#64748b" stroke-width="8" opacity="0.8"/>
      <path d="M 345,190 L 310,195 L 290,185 L 265,200 L 240,192" fill="none" stroke="#dc2626" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="300" cy="192" r="28" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="4,2"/>
      <text x="210" y="160" fill="#f87171" font-size="12" font-family="sans-serif" font-weight="bold">전단 크랙 3.2mm (치명)</text>
    `;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
    <defs>
      <radialGradient id="metalGrad" cx="45%" cy="45%" r="65%">
        <stop offset="0%" stop-color="#cbd5e1"/>
        <stop offset="50%" stop-color="#94a3b8"/>
        <stop offset="90%" stop-color="#64748b"/>
        <stop offset="100%" stop-color="#475569"/>
      </radialGradient>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0b1120"/>
        <stop offset="100%" stop-color="#020617"/>
      </linearGradient>
    </defs>
    <rect width="400" height="400" fill="url(#bgGrad)"/>
    ${content}
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Master / Main Defect Knowledge Base (관리자 승인 메인 Data)
export const INITIAL_MAIN_DEFECTS: DefectKnowledgeItem[] = [
  {
    id: 'main-defect-eccentric-01',
    title: '[메인] 과대 편면취로 인한 자동화 콜렛 척킹 틸팅 및 잼(Jam)',
    defectType: '편면취',
    severity: '경고 (Major)',
    imageSrc: generateDefectPatternSvg('eccentric_chamfer'),
    steelGrade: 'SCM420H / S45C',
    diameterMm: 85,
    customerAndProcess: '현대트랜시스 / 로봇 자동 투입 CNC 선반 1차 가공 라인',
    whyProblem:
      '면취 폭이 C0.5mm ~ C3.2mm로 심한 편심이 발생한 상태. 로봇 핑거가 환봉을 콜렛 척 내부로 고속 진입시킬 때 편면취 경사면을 따라 소재가 0.4° 미세 틸팅(Tilting)되어 콜렛 턱에 걸림(Jam) 발생. 라인 정지 및 콜렛 파손 유발.',
    boundaryRule: '편면취 허용 한도: 원주상 최대-최소 면취폭 편차 ΔC ≤ 0.8mm 이내. 1.0mm 초과 시 콜렛 물림 불량 직결.',
    concessionPrecedent: '[특채 불가 / 조건부 전량 재면취(Re-chamfering) 후 납품 승인]. 무가공 반입 시 고객사 100% 반품 처리.',
    tags: ['편면취', '로봇콜렛잼', '틸팅불량', '면취불균일'],
    createdAt: '2026-03-15',
    isMain: true,
    registeredBy: '품질보증팀장 (관리자 승인)',
  },
  {
    id: 'main-defect-no-chamfer-02',
    title: '[메인] 미면취(가공 누락)로 인한 단조 이송 슈트 걸림 및 안전 사고',
    defectType: '미면취',
    severity: '치명적 불량 (Critical)',
    imageSrc: generateDefectPatternSvg('no_chamfer'),
    steelGrade: 'S45C / S20C',
    diameterMm: 110,
    customerAndProcess: '현대위아 단조사업부 / 인덕션 히터 자동 롤러 피딩 슈트',
    whyProblem:
      '면취 가공이 전주에 걸쳐 100% 누락되어 끝단이 날카로운 90° 직각 엣지(Sharp Edge) 및 미세 잔류 버가 남아있음. 1) 유도 가열로 롤러 슈트 통과 시 슈트 라이너 손상, 2) 단조 금형 투입 가이드에 턱 걸림, 3) 현장 작업자 안전사고 위험.',
    boundaryRule: '미면취는 IATF 16949 및 사내 품질 표준상 Zero Tolerance (허용치 C=0 불합격). 최소 C1.0 이상 모따기 필수.',
    concessionPrecedent: '[특채 불가 - 전량 라인 회수 후 긴급 재면취 조치].',
    tags: ['미면취', '가공누락', 'SharpEdge', '안전사고위험'],
    createdAt: '2026-04-10',
    isMain: true,
    registeredBy: '품질관리팀장 (관리자 승인)',
  },
  {
    id: 'main-defect-step-tear-03',
    title: '[메인] 톱날 결손에 의한 0.85mm 절단 단차 & 뜯김 (척킹 런아웃 오차)',
    defectType: '절단단차',
    severity: '경고 (Major)',
    imageSrc: generateDefectPatternSvg('saw_step_tear'),
    steelGrade: 'SNCM220 / SCM440',
    diameterMm: 130,
    customerAndProcess: '한화에어로스페이스 파워시스템 / 끝단 면 척킹 기준면 가공',
    whyProblem:
      '톱날 팁 파손으로 절단 단면 중앙부에 0.85mm의 급격한 계단형 단차(Step)와 표면 뜯김 발생. 고객사 CNC 선반에서 끝단을 바이스 스토퍼(Stopper)에 밀착시켜 가공 기준점으로 삼는데, 단차로 인해 축 방향 장착 평행도 런아웃(Runout)이 0.12mm 어긋나 동심도 불량 발생.',
    boundaryRule: '절단 단차 관리 기준: Max 0.30mm 이하. 0.50mm 초과 시 평면 척킹 기준면 사용 불가.',
    concessionPrecedent: '끝단 가공 여유가 5mm 이상이면 [특채 승인 권고], 척킹 기준면일 경우 [조건부 단면 사상(Face Grinding) 승인].',
    tags: ['절단단차', '톱날결손', '런아웃오차', '표면뜯김'],
    createdAt: '2026-05-22',
    isMain: true,
    registeredBy: '품질기술연구소 (관리자 승인)',
  },
  {
    id: 'main-defect-burr-04',
    title: '[메인] 절단 관통부 과대 버(1.2mm)로 인한 단조 금형 압흔 및 씹힘',
    defectType: '버(Burr)',
    severity: '경고 (Major)',
    imageSrc: generateDefectPatternSvg('heavy_exit_burr'),
    steelGrade: 'SCM440H',
    diameterMm: 95,
    customerAndProcess: '센트랄 / 자동차 조향너클 열간단조 라인',
    whyProblem:
      '절단 완료 지점(6시 방향)에 1.2mm 높이의 날카로운 금속 찌꺼기 버(Burr/Fin) 형성. 고온 단조 금형에 안착 시 버가 금형 상/하형 파팅 라인(Die Parting Line)에 끼여 금형 흠집(Die dent) 발생 및 제품 표면으로 접혀 들어가 단조 겹침(Forging Lap) 결함 유발.',
    boundaryRule: '버(Burr) 관리 기준: 일반 단조품 Max 0.3mm 이하, 정밀 가공품 Max 0.15mm 이하. 0.5mm 초과는 제거 필수.',
    concessionPrecedent: '[조건부 승인 - 핸드 에어그라인더 버 전량 사상(Deburring) 후 출하].',
    tags: ['버', 'Burr', '금형파손', '단조겹침', '사상필수'],
    createdAt: '2026-07-08',
    isMain: true,
    registeredBy: '품질보증팀장 (관리자 승인)',
  },
  {
    id: 'main-defect-crack-05',
    title: '[메인] 전단 응력에 의한 외주부 미세 크랙 (성형 중 폭발적 파단 위험)',
    defectType: '절단크랙',
    severity: '치명적 불량 (Critical)',
    imageSrc: generateDefectPatternSvg('periphery_crack'),
    steelGrade: 'SUJ2 (베어링강)',
    diameterMm: 65,
    customerAndProcess: '일진글로벌 / 휠베어링 냉간단조(Cold Heading)',
    whyProblem:
      '전단 칼날의 클리어런스 불량 및 모재 잔류 응력으로 외주부에 3.2mm 길이의 취성 전단 균열 발생. 600톤 고압 냉간단조 시 금형 내부에서 수십 톤의 충격 압력을 받는 순간 크랙 선단(Crack Tip)에 극단적 응력 집중이 발생하여 소재가 쪼개지며 금형 파손(Explosive Die Burst) 초래.',
    boundaryRule: '표면 및 절단면 크랙은 어떠한 경우에도 특채 불가. Zero Tolerance (허용치: 0.0mm 전무).',
    concessionPrecedent: '[특채 불가 - 즉시 폐기(Scrap) 또는 제강공장 재용해 전용].',
    tags: ['전단크랙', '냉간단조파단', '금형폭발', '특채절대불가'],
    createdAt: '2026-08-19',
    isMain: true,
    registeredBy: '품질경영실장 (관리자 승인)',
  },
];

// Initial sub defect inspection history logs from factory workers
export const INITIAL_SUB_DEFECTS: SubDefectItem[] = [
  {
    id: 'sub-log-101',
    title: '현장 작업자 판독: SCM440 크랭크샤프트 편면취 및 0.35mm 버',
    defectType: '편면취, 버',
    imageSrc: generateDefectPatternSvg('eccentric_chamfer'),
    steelGrade: 'SCM440H',
    diameterMm: 90,
    customerName: '현대위아 창원 1공장',
    processType: '열간단조 (1,220℃ 가열)',
    endUtilization: '끝단 전량 플래시 및 버링 scrap으로 가공 탈락 (여유 15mm 이상)',
    claimSensitivity: '보통',
    verdictGrade: '[특채 승인 권고]',
    verdictCode: 'APPROVED_CONCESSION',
    confidenceScore: 94,
    summaryVerdict: '끝단이 후공정 열간단조 및 플래시로 완전 소제되어 특채 승인 권고.',
    detectedDefectsSummary: '편면취 C1.2~2.8mm, 절단 출구 경미 버 0.35mm',
    operatorNotes: '오전 09:30 1조 작업분. 톱날 교체 1시간 전 절단품.',
    inspectedAt: '2026-10-25 09:35',
    status: 'PENDING',
  },
  {
    id: 'sub-log-102',
    title: '현장 작업자 판독: S45C 피니언 샤프트 6시 방향 0.9mm 과대 버',
    defectType: '버(Burr), 절단단차',
    imageSrc: generateDefectPatternSvg('heavy_exit_burr'),
    steelGrade: 'S45C',
    diameterMm: 110,
    customerName: '센트랄 정밀가공사업부',
    processType: '정밀 CNC 선반 및 로봇 자동 공급 척킹',
    endUtilization: '끝단이 로봇 자동 척킹 기준면으로 1차 물림',
    claimSensitivity: '높음',
    verdictGrade: '[조건부 승인 (재작업 필요)]',
    verdictCode: 'CONDITIONAL_REWORK',
    confidenceScore: 91,
    summaryVerdict: '버 방치 시 로봇 척킹 틸팅 및 런아웃 불량 초래. 핸드그라인더 100% 버 사상 후 납품 조건부 승인.',
    detectedDefectsSummary: '6시 방향 버 0.9mm, 단차 0.4mm',
    operatorNotes: '센트랄 공급 로트. 버가 다소 거칠어 작업장 사상조로 이관 조치함.',
    inspectedAt: '2026-10-25 14:10',
    status: 'PENDING',
  },
];
