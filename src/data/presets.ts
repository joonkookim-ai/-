export interface CustomerPreset {
  id: string;
  name: string;
  companyName: string;
  steelGrade: string;
  diameterMm: number;
  cuttingMethod?: string;
  processType: string;
  endUtilization: string;
  claimSensitivity: string;
  chamferSpec: string;
  maxAllowedBurr: string;
  maxAllowedStep: string;
  notes: string;
  imageTitle: string;
  imageDescription: string;
  expectedVerdict: string;
  expectedCode: 'APPROVED_CONCESSION' | 'CONDITIONAL_REWORK' | 'REJECTED_SCRAP_DIVERT' | 'MANUAL_INSPECTION_REQUIRED';
  sampleImageDataUrl: string;
}

// Generate high quality procedural SVG data URLs for realistic cut bar faces
export function generateBarCutSvg(type: 'uneven_chamfer' | 'heavy_burr_step' | 'shear_crack' | 'center_pipe_segregation', diameter = 90): string {
  let defectSvgElements = '';

  if (type === 'uneven_chamfer') {
    // Eccentric chamfer: wider at top-right, thin at bottom-left, minor tiny burr at 6 o'clock
    defectSvgElements = `
      <!-- Chamfer Ring (Uneven/Eccentric) -->
      <circle cx="210" cy="195" r="176" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="4,3" opacity="0.6"/>
      <path d="M 50,200 A 150,150 0 1,1 350,200 A 150,150 0 1,1 50,200" fill="url(#metalGrad)" stroke="#475569" stroke-width="3"/>
      <!-- Eccentric chamfer highlight area -->
      <path d="M 230,58 A 150,150 0 0,1 346,160 L 360,155 A 165,165 0 0,0 238,45 Z" fill="#94a3b8" opacity="0.85"/>
      <path d="M 75,260 A 150,150 0 0,0 120,320 L 115,325 A 158,158 0 0,1 70,265 Z" fill="#475569" opacity="0.6"/>
      <!-- Saw cutting lines -->
      <g stroke="#94a3b8" stroke-width="0.75" opacity="0.35">
        ${Array.from({ length: 28 }).map((_, i) => `<line x1="${70 + i * 9}" y1="80" x2="${60 + i * 9}" y2="320"/>`).join('')}
      </g>
      <!-- Tiny cut exit burr at 6 o'clock -->
      <path d="M 195,350 Q 200,360 206,350 Q 212,358 218,349" fill="#cbd5e1" stroke="#f59e0b" stroke-width="2"/>
      <circle cx="206" cy="355" r="14" fill="none" stroke="#eab308" stroke-width="1.5" stroke-dasharray="3,2"/>
      <text x="228" y="365" fill="#fef08a" font-size="11" font-family="sans-serif" font-weight="bold">Burr ~0.35mm</text>
      <!-- Callout for Uneven Chamfer -->
      <circle cx="295" cy="100" r="18" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="3,2"/>
      <text x="320" y="95" fill="#38bdf8" font-size="11" font-family="sans-serif" font-weight="bold">편면취 편차 C1.2~2.8</text>
    `;
  } else if (type === 'heavy_burr_step') {
    // Heavy cutting burr with noticeable saw step mark across face
    defectSvgElements = `
      <!-- Circular Bar Cut -->
      <circle cx="200" cy="200" r="150" fill="url(#metalGrad)" stroke="#334155" stroke-width="3"/>
      <!-- Circular chamfer band -->
      <circle cx="200" cy="200" r="160" fill="none" stroke="#64748b" stroke-width="12" opacity="0.7"/>
      <!-- Saw teeth step mark across center -->
      <path d="M 70,180 L 190,182 L 200,192 L 330,194" fill="none" stroke="#f97316" stroke-width="2.5"/>
      <path d="M 190,182 L 200,192" stroke="#ea580c" stroke-width="4"/>
      <!-- Heavy ragged burr at exit (bottom) -->
      <path d="M 160,350 Q 175,372 190,358 Q 205,378 220,356 Q 235,370 250,348" fill="#e2e8f0" stroke="#ef4444" stroke-width="2.5"/>
      <!-- Saw chatter marks -->
      <g stroke="#94a3b8" stroke-width="1" opacity="0.4">
        ${Array.from({ length: 24 }).map((_, i) => `<path d="M ${90 + i * 9},90 Q ${95 + i * 9},200 ${90 + i * 9},310" fill="none"/>`).join('')}
      </g>
      <!-- Callouts -->
      <circle cx="205" cy="365" r="22" fill="none" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="3,2"/>
      <text x="235" y="380" fill="#fca5a5" font-size="11" font-family="sans-serif" font-weight="bold">과대 버(Burr) ~0.9mm</text>
      <circle cx="195" cy="187" r="16" fill="none" stroke="#f97316" stroke-width="1.5" stroke-dasharray="3,2"/>
      <text x="215" y="175" fill="#fdba74" font-size="11" font-family="sans-serif" font-weight="bold">톱날 단차 0.4mm</text>
    `;
  } else if (type === 'shear_crack') {
    // Sharp crack at periphery propagating inward + shear tears
    defectSvgElements = `
      <!-- Circular Bar Cut -->
      <circle cx="200" cy="200" r="150" fill="url(#metalGrad)" stroke="#1e293b" stroke-width="3"/>
      <!-- Regular chamfer ring -->
      <circle cx="200" cy="200" r="158" fill="none" stroke="#64748b" stroke-width="10" opacity="0.8"/>
      <!-- Dangerous peripheral shear crack at 3 o'clock -->
      <path d="M 350,200 L 325,198 L 310,208 L 290,202 L 275,212 L 260,206" fill="none" stroke="#dc2626" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M 310,208 L 305,218 L 295,224" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/>
      <!-- Center porosity/segregation warning -->
      <circle cx="200" cy="200" r="18" fill="#1e293b" opacity="0.6"/>
      <circle cx="197" cy="198" r="4" fill="#0f172a"/>
      <!-- Shear marks -->
      <g stroke="#64748b" stroke-width="1.2" opacity="0.5">
        ${Array.from({ length: 18 }).map((_, i) => `<line x1="${80 + i * 14}" y1="120" x2="${70 + i * 14}" y2="280"/>`).join('')}
      </g>
      <!-- Crack Callout -->
      <circle cx="310" cy="208" r="26" fill="none" stroke="#dc2626" stroke-width="2" stroke-dasharray="4,2"/>
      <text x="270" y="255" fill="#f87171" font-size="11" font-family="sans-serif" font-weight="bold">전단 균열 (Crack) 2.5mm</text>
      <text x="140" y="170" fill="#f87171" font-size="10" font-family="sans-serif">중심부 편석 노출</text>
    `;
  } else {
    // Center pipe / macro segregation ambiguity
    defectSvgElements = `
      <!-- Circular Bar Cut -->
      <circle cx="200" cy="200" r="150" fill="url(#metalGrad)" stroke="#334155" stroke-width="3"/>
      <circle cx="200" cy="200" r="158" fill="none" stroke="#64748b" stroke-width="10" opacity="0.8"/>
      <!-- Discoloration & micro pores in center -->
      <ellipse cx="202" cy="198" rx="35" ry="32" fill="#334155" opacity="0.45"/>
      <circle cx="195" cy="192" r="5" fill="#0f172a" opacity="0.8"/>
      <circle cx="208" cy="205" r="4" fill="#0f172a" opacity="0.8"/>
      <circle cx="201" cy="198" r="3" fill="#020617"/>
      <!-- Faint radial segregation lines -->
      <path d="M 200,170 L 200,150 M 200,230 L 200,250 M 170,200 L 150,200 M 230,200 L 250,200" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="2,2"/>
      <!-- Callout -->
      <circle cx="200" cy="200" r="40" fill="none" stroke="#38bdf8" stroke-width="1.8" stroke-dasharray="3,3"/>
      <text x="130" y="260" fill="#7dd3fc" font-size="11" font-family="sans-serif" font-weight="bold">중심 편석 / 공동 의심구역</text>
      <text x="135" y="275" fill="#94a3b8" font-size="9.5" font-family="sans-serif">UT/산세 정밀 확인 필요</text>
    `;
  }

  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="800" height="800">
    <defs>
      <radialGradient id="metalGrad" cx="45%" cy="45%" r="65%">
        <stop offset="0%" stop-color="#cbd5e1"/>
        <stop offset="45%" stop-color="#94a3b8"/>
        <stop offset="85%" stop-color="#64748b"/>
        <stop offset="100%" stop-color="#475569"/>
      </radialGradient>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#090d16"/>
        <stop offset="100%" stop-color="#020617"/>
      </linearGradient>
    </defs>
    <!-- Background grid -->
    <rect width="400" height="400" fill="url(#bgGrad)"/>
    <g stroke="#1e293b" stroke-width="0.8">
      ${Array.from({ length: 8 }).map((_, i) => `<line x1="0" y1="${(i + 1) * 50}" x2="400" y2="${(i + 1) * 50}"/>`).join('')}
      ${Array.from({ length: 8 }).map((_, i) => `<line x1="${(i + 1) * 50}" y1="0" x2="${(i + 1) * 50}" y2="400"/>`).join('')}
    </g>
    <!-- Measurement Scale -->
    <text x="15" y="25" fill="#64748b" font-family="monospace" font-size="10">SEAH SPECIAL STEEL QC LAB | Ø${diameter}mm REF</text>
    ${defectSvgElements}
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
}

export const PRESET_CASES: CustomerPreset[] = [
  {
    id: 'case-concession-approved',
    name: '사례 1: 자동차 크랭크샤프트용 열간단조 환봉',
    companyName: '현대위아 (창원 1공장)',
    steelGrade: 'SCM440H (크롬몰리브덴강)',
    diameterMm: 90,
    cuttingMethod: '원형 초경톱 절단 (Carbide Sawing)',
    processType: '열간단조 (1,220℃ 가열 후 프레스 형타 단조)',
    endUtilization: '끝단 전량 플래시(Flash) 및 버링 scrap으로 가공 탈락 (여유 15mm 이상)',
    claimSensitivity: '보통 (일반 단조품 클레임 기준 준용)',
    chamferSpec: 'C1.5 ~ C2.5 (30°~45°)',
    maxAllowedBurr: 'Max 0.20mm',
    maxAllowedStep: 'Max 0.30mm',
    notes: '절단 종료부 미세 버(0.35mm) 및 편면취(C1.2~2.8mm) 관찰. 단조 가열로 통과 시 결함 소멸 예상.',
    imageTitle: 'SCM440 Ø90mm 절단면 - 편면취 및 경미한 버',
    imageDescription: '원주 2~5시 방향에 편면취가 관찰되고 6시 방향에 경미한 절단 버가 있으나 모재 크랙 없음.',
    expectedVerdict: '[특채 승인 권고]',
    expectedCode: 'APPROVED_CONCESSION',
    sampleImageDataUrl: generateBarCutSvg('uneven_chamfer', 90),
  },
  {
    id: 'case-conditional-rework',
    name: '사례 2: 감속기 피니언 샤프트 CNC 가공용 환봉',
    companyName: '센트랄 (정밀가공 사업부)',
    steelGrade: 'S45C (기계구조용 탄소강)',
    diameterMm: 110,
    cuttingMethod: '고속 밴드쏘 절단 (Band Sawing)',
    processType: '정밀 CNC 선반 외경/단면 가공 (로봇 자동 공급 척킹 라인)',
    endUtilization: '끝단이 로봇 자동 척킹 기준면으로 1차 물림 (런아웃 오차 직결)',
    claimSensitivity: '높음 (로봇 콜렛 척 걸림 시 라인 정지)',
    chamferSpec: 'C2.0 ± 0.5',
    maxAllowedBurr: 'Max 0.15mm',
    maxAllowedStep: 'Max 0.25mm',
    notes: '톱날 수명 말기 절단으로 6시 방향에 0.9mm 과대 버 및 0.4mm 단차 발생. 그대로 투입 시 척킹 불량 유발.',
    imageTitle: 'S45C Ø110mm 절단면 - 과대 버 및 절단 단차',
    imageDescription: '절단 관통부에 0.9mm 날카로운 버와 0.4mm 톱자국 단차가 육안으로 명확히 식별됨.',
    expectedVerdict: '[조건부 승인 (재작업 필요)]',
    expectedCode: 'CONDITIONAL_REWORK',
    sampleImageDataUrl: generateBarCutSvg('heavy_burr_step', 110),
  },
  {
    id: 'case-rejected-scrap',
    name: '사례 3: 베어링 이너링 냉간단조용 고탄소크롬 환봉',
    companyName: '일진글로벌 (베어링 2공장)',
    steelGrade: 'SUJ2 (고탄소 크롬 베어링강)',
    diameterMm: 65,
    cuttingMethod: '고속 전단 절단 (Billet Shear Cutting)',
    processType: '냉간단조 (Cold Heading / Forging, 상온 600톤 프레스)',
    endUtilization: '끝단이 베어링 전동체 레이스웨이 가공 부위에 직접 포함됨',
    claimSensitivity: '최고 위험 (현대/기아 완성차 휠베어링 보안부품, 무결점 Zero-Defect)',
    chamferSpec: 'C1.0 ~ C1.5 전주 균일',
    maxAllowedBurr: 'Max 0.10mm',
    maxAllowedStep: 'Max 0.15mm',
    notes: '전단 응력에 의한 3시 방향 2.5mm 전단 크랙 및 중심부 수축공 노출 의심. 냉간 가압 시 금형 파손 위험.',
    imageTitle: 'SUJ2 Ø65mm 절단면 - 외곽 전단 크랙 및 편석 의심',
    imageDescription: '외주부에서 중심 방향으로 2.5mm 길이의 미세 크랙이 진행되어 전단 취성 파단 징후 보임.',
    expectedVerdict: '[특채 불가 (폐기 또는 타용도 전용)]',
    expectedCode: 'REJECTED_SCRAP_DIVERT',
    sampleImageDataUrl: generateBarCutSvg('shear_crack', 65),
  },
  {
    id: 'case-manual-inspection',
    name: '사례 4: 풍력/산업용 기어박스용 침탄합금강 환봉',
    companyName: '한화에어로스페이스 (파워시스템)',
    steelGrade: 'SNCM220 (니켈크롬몰리브덴강)',
    diameterMm: 130,
    cuttingMethod: '초경 원형톱날 절단',
    processType: '정밀 기어 치절 및 침탄 열처리 (Wind Turbine Gearbox)',
    endUtilization: '끝단 3mm 페이스 컷 후 기준 홀 가공',
    claimSensitivity: '높음 (풍력발전기 해상 가동 시 보수 불가 부품)',
    chamferSpec: 'C2.5 ~ C3.5',
    maxAllowedBurr: 'Max 0.20mm',
    maxAllowedStep: 'Max 0.30mm',
    notes: '절단면 중심부에 미세 변색 및 마크가 포착됨. 톱날 오일 오염인지 모재 중심 편석(Segregation)/파이프인지 불명확.',
    imageTitle: 'SNCM220 Ø130mm 절단면 - 중심부 불명확 흑색 변색부',
    imageDescription: '중심부에 직경 약 15mm의 불규칙한 암색 영역이 관찰되나 사진 음영만으로는 깊이와 결함 유무 판독 불가.',
    expectedVerdict: '[품질 관리자 정밀 육안 검사 요망]',
    expectedCode: 'MANUAL_INSPECTION_REQUIRED',
    sampleImageDataUrl: generateBarCutSvg('center_pipe_segregation', 130),
  },
];
