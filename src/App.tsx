import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageInspector } from './components/ImageInspector';
import { CustomerDataForm, CustomerFormData } from './components/CustomerDataForm';
import { VerdictStamp } from './components/VerdictStamp';
import { AssessmentSections } from './components/AssessmentSections';
import { ReportModal } from './components/ReportModal';
import { DefectArchiveModal } from './components/DefectArchiveModal';
import { DefectKnowledgeBaseView } from './components/DefectKnowledgeBaseView';
import { SpreadsheetSyncModal, SpreadsheetRecord } from './components/SpreadsheetSyncModal';
import { PRESET_CASES, CustomerPreset } from './data/presets';
import { 
  INITIAL_MAIN_DEFECTS, 
  INITIAL_SUB_DEFECTS, 
  DefectKnowledgeItem, 
  SubDefectItem 
} from './data/defectKnowledge';
import { ConcessionAnalysisResult, InspectionPin } from './types';
import { 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  AlertCircle, 
  ArrowRight,
  Database,
  Layers,
  CheckCircle2,
  Clock,
  ArrowUpRight
} from 'lucide-react';

export default function App() {
  const initialPreset = PRESET_CASES[0];

  const [activeTab, setActiveTab] = useState<'assess' | 'knowledge'>('assess');
  const [imageSrc, setImageSrc] = useState<string | null>(initialPreset.sampleImageDataUrl);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(initialPreset.id);
  const [customerData, setCustomerData] = useState<CustomerFormData>({
    customerName: initialPreset.companyName,
    steelGrade: initialPreset.steelGrade, // Free text
    diameterMm: initialPreset.diameterMm,
    processType: initialPreset.processType,
    endUtilization: initialPreset.endUtilization,
    claimSensitivity: initialPreset.claimSensitivity,
    chamferSpec: initialPreset.chamferSpec,
    maxAllowedBurr: initialPreset.maxAllowedBurr,
    maxAllowedStep: initialPreset.maxAllowedStep,
    notes: initialPreset.notes,
  });

  const [pins, setPins] = useState<InspectionPin[]>([
    {
      id: 'pin-default-1',
      x: 73,
      y: 25,
      type: 'chamfer',
      label: '편면취 C1.2~2.8mm',
    },
    {
      id: 'pin-default-2',
      x: 52,
      y: 88,
      type: 'burr',
      label: '절단 출구 버 0.35mm',
    },
  ]);

  // Two-tier Data Pools: Main Data (Manager Approved) & Sub Data (Worker Logs)
  const [mainDefects, setMainDefects] = useState<DefectKnowledgeItem[]>(INITIAL_MAIN_DEFECTS);
  const [subDefects, setSubDefects] = useState<SubDefectItem[]>(INITIAL_SUB_DEFECTS);

  // Modal control
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState<boolean>(false);
  const [subItemToPromote, setSubItemToPromote] = useState<SubDefectItem | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ConcessionAnalysisResult | null>(null);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [subDataNotification, setSubDataNotification] = useState<string | null>(null);

  // Google Spreadsheet / DB Auto-Accumulation records
  const [spreadsheetRecords, setSpreadsheetRecords] = useState<SpreadsheetRecord[]>([]);
  const [googleSheetsWebhookUrl, setGoogleSheetsWebhookUrl] = useState<string>('');
  const [isSpreadsheetModalOpen, setIsSpreadsheetModalOpen] = useState<boolean>(false);

  // Load Main & Sub defects + Spreadsheet records from backend
  useEffect(() => {
    fetch('/api/defect-knowledge')
      .then((res) => res.json())
      .then((data) => {
        if (data.mainItems && Array.isArray(data.mainItems) && data.mainItems.length > 0) {
          setMainDefects([...data.mainItems, ...INITIAL_MAIN_DEFECTS]);
        }
        if (data.subItems && Array.isArray(data.subItems) && data.subItems.length > 0) {
          setSubDefects([...data.subItems, ...INITIAL_SUB_DEFECTS]);
        }
      })
      .catch((e) => console.log('Load error fallback:', e));

    fetch('/api/spreadsheet-records')
      .then((res) => res.json())
      .then((data) => {
        if (data.records && Array.isArray(data.records)) {
          setSpreadsheetRecords(data.records);
        }
        if (data.config && data.config.googleSheetsWebhookUrl) {
          setGoogleSheetsWebhookUrl(data.config.googleSheetsWebhookUrl);
        }
      })
      .catch((e) => console.log('Load spreadsheet records fallback:', e));

    handleAnalyze();
  }, []);

  const handleSelectPreset = (preset: CustomerPreset) => {
    setSelectedPresetId(preset.id);
    setImageSrc(preset.sampleImageDataUrl);
    setCustomerData({
      customerName: preset.companyName,
      steelGrade: preset.steelGrade,
      diameterMm: preset.diameterMm,
      processType: preset.processType,
      endUtilization: preset.endUtilization,
      claimSensitivity: preset.claimSensitivity,
      chamferSpec: preset.chamferSpec,
      maxAllowedBurr: preset.maxAllowedBurr,
      maxAllowedStep: preset.maxAllowedStep,
      notes: preset.notes,
    });

    if (preset.id === 'case-concession-approved') {
      setPins([
        { id: 'p1', x: 74, y: 25, type: 'chamfer', label: '편면취 C1.2~2.8' },
        { id: 'p2', x: 52, y: 88, type: 'burr', label: '미세 버 0.35mm' },
      ]);
    } else if (preset.id === 'case-conditional-rework') {
      setPins([
        { id: 'p3', x: 50, y: 47, type: 'step', label: '톱날 단차 0.4mm' },
        { id: 'p4', x: 52, y: 92, type: 'burr', label: '과대 버 0.9mm' },
      ]);
    } else if (preset.id === 'case-rejected-scrap') {
      setPins([
        { id: 'p5', x: 77, y: 52, type: 'crack', label: '전단 크랙 2.5mm' },
        { id: 'p6', x: 50, y: 50, type: 'other', label: '중심 편석 노출' },
      ]);
    } else {
      setPins([{ id: 'p7', x: 50, y: 50, type: 'other', label: '중심 암색 변색부' }]);
    }

    setResult(null);
  };

  const handleImageChange = (dataUrl: string, _mimeType?: string) => {
    setImageSrc(dataUrl);
    setSelectedPresetId('');
    setPins([]);
  };

  const handleAddPin = (pin: InspectionPin) => {
    setPins((prev) => [...prev, pin]);
  };

  const handleRemovePin = (id: string) => {
    setPins((prev) => prev.filter((p) => p.id !== id));
  };

  const handleReset = () => {
    handleSelectPreset(PRESET_CASES[0]);
    setResult(null);
    setErrorMessage(null);
  };

  // Save or promote item to Main Data
  const handleSaveMainDefect = async (item: Partial<DefectKnowledgeItem>) => {
    try {
      const response = await fetch('/api/defect-knowledge/main', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });

      let createdItem = item as DefectKnowledgeItem;
      if (response.ok) {
        const data = await response.json();
        createdItem = data.item;
      } else {
        createdItem.id = `main-${Date.now()}`;
        createdItem.isMain = true;
      }

      setMainDefects((prev) => [createdItem, ...prev]);

      // If promoted from sub data, update subDefects status
      if (item.promotedFromSubId) {
        setSubDefects((prev) =>
          prev.map((s) =>
            s.id === item.promotedFromSubId
              ? { ...s, status: 'PROMOTED', promotedToMainId: createdItem.id }
              : s
          )
        );
      }
    } catch (err) {
      console.error('Save main defect error:', err);
      const fallback = {
        ...item,
        id: `main-${Date.now()}`,
        isMain: true,
      } as DefectKnowledgeItem;
      setMainDefects((prev) => [fallback, ...prev]);
    }
  };

  const handleDeleteMainDefect = async (id: string) => {
    try {
      await fetch(`/api/defect-knowledge/main/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.log('Delete error:', e);
    }
    setMainDefects((prev) => prev.filter((item) => item.id !== id));
  };

  const handleDeleteSubDefect = async (id: string) => {
    try {
      await fetch(`/api/defect-knowledge/sub/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.log('Delete error:', e);
    }
    setSubDefects((prev) => prev.filter((item) => item.id !== id));
  };

  // Open modal in promotion mode for a sub defect item
  const handlePromoteSubItem = (subItem: SubDefectItem) => {
    setSubItemToPromote(subItem);
    setIsArchiveModalOpen(true);
  };

  // Load a defect pattern into inspector
  const handleSelectPatternForTest = (item: DefectKnowledgeItem | SubDefectItem) => {
    setImageSrc(item.imageSrc);
    setSelectedPresetId('');
    setCustomerData((prev) => ({
      ...prev,
      steelGrade: item.steelGrade || prev.steelGrade,
      diameterMm: item.diameterMm || prev.diameterMm,
      customerName:
        'customerName' in item
          ? item.customerName
          : item.customerAndProcess.split('/')[0]?.trim() || prev.customerName,
      processType:
        'processType' in item
          ? item.processType
          : item.customerAndProcess.split('/')[1]?.trim() || prev.processType,
      notes: `[참조 패턴 대조] ${item.title}`,
    }));
    setActiveTab('assess');
    setResult(null);
  };

  const handleExportJson = () => {
    const fullDataset = {
      exportedAt: new Date().toISOString(),
      mainDefectsCount: mainDefects.length,
      subDefectsCount: subDefects.length,
      mainDefects,
      subDefects,
    };
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullDataset, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `특수강_환봉_불량DB_메인_서브_통합_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Worker executes assessment: Evaluates against Manager's Main Data + Automatically accumulates into Sub Data!
  const handleAnalyze = async () => {
    if (!imageSrc) {
      setErrorMessage('환봉 절단면 사진을 먼저 업로드하거나 샘플을 선택하세요.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSubDataNotification(null);

    try {
      // 1. Pass Manager's Main Data as Ground Truth to the AI
      const mainReferences = mainDefects.map((m) => ({
        title: m.title,
        defectType: m.defectType,
        whyProblem: m.whyProblem,
        boundaryRule: m.boundaryRule,
        concessionPrecedent: m.concessionPrecedent,
      }));

      const response = await fetch('/api/concession-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageSrc,
          customerData,
          mainReferenceDefects: mainReferences,
        }),
      });

      if (!response.ok) {
        throw new Error(`분석 서버 오류: ${response.statusText}`);
      }

      const data: ConcessionAnalysisResult = await response.json();
      setResult(data);

      // 2. Automatically accumulate this inspection as SUB DATA (현장 작업자 판독 이력 자동 축적)
      const detectedSummary = data.section1_imageAnalysis.detectedDefects
        .map((d) => `${d.type}(${d.estimatedMetric || d.severity})`)
        .join(', ');

      const newSubItem: SubDefectItem = {
        id: `sub-${Date.now()}`,
        title: `작업자 판독: ${customerData.steelGrade} ${customerData.customerName || '고객사'} (Ø${customerData.diameterMm}mm)`,
        defectType:
          data.section1_imageAnalysis.detectedDefects.map((d) => d.type).join(', ') || '절단면 결함',
        imageSrc,
        steelGrade: customerData.steelGrade,
        diameterMm: Number(customerData.diameterMm) || 90,
        customerName: customerData.customerName || '미지정 고객사',
        processType: customerData.processType,
        endUtilization: customerData.endUtilization,
        claimSensitivity: customerData.claimSensitivity,
        verdictGrade: data.verdictGrade,
        verdictCode: data.verdictCode,
        confidenceScore: data.confidenceScore,
        summaryVerdict: data.summaryVerdict,
        detectedDefectsSummary: detectedSummary || '편면취 및 버 관찰',
        operatorNotes: customerData.notes || '작업자 일상 검사 완료',
        inspectedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: 'PENDING',
      };

      // Save sub data to server & state
      fetch('/api/defect-knowledge/sub', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSubItem),
      }).catch((e) => console.log('Sub save fallback:', e));

      setSubDefects((prev) => [newSubItem, ...prev]);

      // 3. Automatically record to Google Spreadsheet / Cloud Database (판정 등급, 사유, 결함, 날짜)
      const newSheetRecord: SpreadsheetRecord = {
        id: `sheet-${Date.now()}`,
        date: new Date().toISOString().replace('T', ' ').substring(0, 19),
        customerName: customerData.customerName || '미지정',
        steelGrade: customerData.steelGrade,
        diameterMm: customerData.diameterMm,
        verdictGrade: data.verdictGrade,
        verdictCode: data.verdictCode,
        summaryVerdict: data.summaryVerdict,
        detectedDefects: detectedSummary || '편면취/단차/버',
        operatorNotes: customerData.notes || '현장 일상 심사',
        imageThumbnail: imageSrc ? imageSrc.substring(0, 80) + '...' : '',
      };

      fetch('/api/spreadsheet-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSheetRecord),
      })
        .then((res) => res.json())
        .then((resp) => {
          if (resp.item) {
            setSpreadsheetRecords((prev) => [resp.item, ...prev]);
          } else {
            setSpreadsheetRecords((prev) => [newSheetRecord, ...prev]);
          }
        })
        .catch((e) => {
          console.log('Spreadsheet record fallback:', e);
          setSpreadsheetRecords((prev) => [newSheetRecord, ...prev]);
        });

      setSubDataNotification('판정 완료! [서브 Data] 및 [구글 스프레드시트 DB]에 자동 누적 저장되었습니다.');
      setTimeout(() => setSubDataNotification(null), 5000);
    } catch (err: any) {
      console.error('Analysis failed:', err);
      setErrorMessage(err.message || '특채 분석 요청 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveWebhookUrl = async (url: string) => {
    setGoogleSheetsWebhookUrl(url);
    await fetch('/api/spreadsheet-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ googleSheetsWebhookUrl: url }),
    });
  };

  const handleDeleteSpreadsheetRecord = async (id: string) => {
    try {
      await fetch(`/api/spreadsheet-records/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.log('Delete spreadsheet record error:', e);
    }
    setSpreadsheetRecords((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onReset={handleReset}
        onOpenReport={() => setShowReportModal(true)}
        hasResult={!!result}
        knowledgeCount={mainDefects.length + subDefects.length}
        onOpenArchiveModal={() => {
          setSubItemToPromote(null);
          setIsArchiveModalOpen(true);
        }}
        onOpenSpreadsheetModal={() => setIsSpreadsheetModalOpen(true)}
        spreadsheetCount={spreadsheetRecords.length}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Error notification */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* Sub data automatic accumulation notice */}
        {subDataNotification && (
          <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-200 text-xs flex items-center justify-between gap-3 shadow-lg animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold">{subDataNotification}</span>
              <span className="text-slate-400 text-[11px] hidden sm:inline">
                (상단 '불량 패턴 축적 DB' 탭의 [서브 Data]에서 관리자가 메인으로 승격 가능)
              </span>
            </div>
            <button
              onClick={() => setActiveTab('knowledge')}
              className="px-2 py-1 rounded bg-cyan-800 hover:bg-cyan-700 text-white font-bold text-[10.5px] transition-colors cursor-pointer"
            >
              서브 Data 확인
            </button>
          </div>
        )}

        {/* TAB 1: Concession Assessor */}
        {activeTab === 'assess' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Input Panel */}
            <div className="lg:col-span-5 space-y-6">
              {/* Image Inspector (Focus on 편면취, 미면취, 절단면 상태) */}
              <ImageInspector
                imageSrc={imageSrc}
                onImageChange={handleImageChange}
                pins={pins}
                onAddPin={handleAddPin}
                onRemovePin={handleRemovePin}
                diameterMm={customerData.diameterMm}
                onOpenArchiveModal={() => {
                  setSubItemToPromote(null);
                  setIsArchiveModalOpen(true);
                }}
              />

              {/* Customer Data Form (No cutting method, text steel grade, main defect count indicator) */}
              <CustomerDataForm
                formData={customerData}
                onChange={setCustomerData}
                onSelectPreset={handleSelectPreset}
                selectedPresetId={selectedPresetId}
                isLoading={isLoading}
                onAnalyze={handleAnalyze}
                mainDefectCount={mainDefects.length}
              />
            </div>

            {/* Right Column: Assessment Results */}
            <div className="lg:col-span-7 space-y-6">
              {isLoading ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-6 shadow-2xl min-h-[500px]">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full border-4 border-indigo-500/20 border-t-indigo-400 animate-spin flex items-center justify-center" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ShieldCheck className="w-8 h-8 text-cyan-400 animate-pulse" />
                    </div>
                  </div>

                  <div className="space-y-2 max-w-md">
                    <h3 className="text-lg font-bold text-white">
                      관리자 메인 Data ({mainDefects.length}건) 근거 심사 중...
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      강종 <strong className="text-cyan-300">[{customerData.steelGrade}]</strong> 환봉 절단면의 편면취, 미면취, 단차/버 상태를
                      <br />
                      관리자가 등록한 메인 불량 DB의 엄격한 한도 기준과 1:1 대조 중입니다.
                    </p>
                  </div>

                  {/* Progress Indicators */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full max-w-lg text-[11px] font-mono text-slate-400">
                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-cyan-400 flex flex-col items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                      <span>1. 편면취/단차 판독</span>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-indigo-400 flex flex-col items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
                      <span>2. 메인 DB 대조</span>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-amber-400 flex flex-col items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                      <span>3. 4대 등급 판정</span>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-emerald-400 flex flex-col items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      <span>4. 서브 Data 축적</span>
                    </div>
                  </div>
                </div>
              ) : result ? (
                <div className="space-y-6">
                  {/* Official Concession Verdict Stamp Banner */}
                  <VerdictStamp result={result} />

                  {/* 4-Step Comprehensive Assessment */}
                  <AssessmentSections
                    result={result}
                    customerName={customerData.customerName}
                    steelGrade={customerData.steelGrade}
                    diameterMm={customerData.diameterMm}
                  />
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-6 shadow-2xl min-h-[460px]">
                  <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg">
                    <ShieldCheck className="w-8 h-8" />
                  </div>

                  <div className="space-y-2 max-w-md">
                    <h3 className="text-lg font-bold text-white">
                      특수강 환봉 특채 심사 대기 중
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      좌측에서 환봉 절단면 사진을 확인하고 하단의
                      <br />
                      <strong className="text-cyan-400 font-semibold">[심사 실행 (메인 DB 대조 + 서브 Data 축적)]</strong>을 클릭하십시오.
                    </p>
                  </div>

                  <button
                    onClick={handleAnalyze}
                    className="px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs tracking-wider uppercase flex items-center gap-2 shadow-lg shadow-cyan-900/40 transition-all cursor-pointer"
                  >
                    <span>심사 실행 및 서브 Data 축적</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Main vs Sub Defect Knowledge Base View */}
        {activeTab === 'knowledge' && (
          <DefectKnowledgeBaseView
            mainItems={mainDefects}
            subItems={subDefects}
            onSelectPatternForTest={handleSelectPatternForTest}
            onOpenCreateMainModal={() => {
              setSubItemToPromote(null);
              setIsArchiveModalOpen(true);
            }}
            onPromoteSubItem={handlePromoteSubItem}
            onDeleteMainItem={handleDeleteMainDefect}
            onDeleteSubItem={handleDeleteSubDefect}
            onExportJson={handleExportJson}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-4 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            SEAH SPECIAL STEEL QUALITY ASSURANCE SYSTEM | 2-TIER DATA ACCUMULATION
          </span>
          <span className="text-[11px] text-slate-400">
            관리자 메인 DB ({mainDefects.length}건 근거) · 작업자 서브 Data ({subDefects.length}건 누적)
          </span>
        </div>
      </footer>

      {/* Official Report Modal */}
      {result && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          result={result}
          customerData={customerData}
          imageSrc={imageSrc}
        />
      )}

      {/* Defect Pattern Archiving / Promotion Modal */}
      <DefectArchiveModal
        isOpen={isArchiveModalOpen}
        onClose={() => {
          setIsArchiveModalOpen(false);
          setSubItemToPromote(null);
        }}
        imageSrc={imageSrc}
        customerData={customerData}
        subItemToPromote={subItemToPromote}
        onSaveMainDefect={handleSaveMainDefect}
      />

      {/* Google Spreadsheet / DB Auto-Accumulation Management Modal */}
      <SpreadsheetSyncModal
        isOpen={isSpreadsheetModalOpen}
        onClose={() => setIsSpreadsheetModalOpen(false)}
        records={spreadsheetRecords}
        webhookUrl={googleSheetsWebhookUrl}
        onSaveWebhookUrl={handleSaveWebhookUrl}
        onDeleteRecord={handleDeleteSpreadsheetRecord}
      />
    </div>
  );
}
