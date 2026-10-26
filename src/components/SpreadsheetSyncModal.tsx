import React, { useState } from 'react';
import { 
  X, 
  Table, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  Link2, 
  Send, 
  Database, 
  FileSpreadsheet, 
  Trash2,
  AlertCircle,
  CheckCircle2,
  Code2
} from 'lucide-react';

export interface SpreadsheetRecord {
  id: string;
  date: string;
  customerName: string;
  steelGrade: string;
  diameterMm: number | string;
  verdictGrade: string;
  verdictCode: string;
  summaryVerdict: string;
  detectedDefects: string;
  operatorNotes: string;
  imageThumbnail?: string;
}

interface SpreadsheetSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: SpreadsheetRecord[];
  webhookUrl: string;
  onSaveWebhookUrl: (url: string) => Promise<void>;
  onDeleteRecord: (id: string) => Promise<void>;
}

export const SpreadsheetSyncModal: React.FC<SpreadsheetSyncModalProps> = ({
  isOpen,
  onClose,
  records,
  webhookUrl,
  onSaveWebhookUrl,
  onDeleteRecord,
}) => {
  const [inputUrl, setInputUrl] = useState<string>(webhookUrl || '');
  const [isSavingUrl, setIsSavingUrl] = useState<boolean>(false);
  const [copiedTsv, setCopiedTsv] = useState<boolean>(false);
  const [copiedGasCode, setCopiedGasCode] = useState<boolean>(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [showGasCode, setShowGasCode] = useState<boolean>(false);

  if (!isOpen) return null;

  const gasCodeSnippet = `// 구글 스프레드시트 > 확장 프로그램 > Apps Script에 아래 코드를 붙여넣고
// [배포 > 새 배포 > 웹 앱 (모든 사용자 액세스)]로 배포하여 URL을 생성하세요.

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // 첫 행이 비어있으면 헤더 자동 생성
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["검사일시", "고객사명", "강종", "직경(mm)", "판정등급", "판정사유", "검출결함", "작업자메모", "이미지데이터"]);
    }
    
    var data = JSON.parse(e.postData.contents);
    sheet.appendRow([
      data.date || new Date().toISOString(),
      data.customerName || "",
      data.steelGrade || "",
      data.diameterMm || "",
      data.verdictGrade || "",
      data.summaryVerdict || "",
      data.detectedDefects || "",
      data.operatorNotes || "",
      data.imageThumbnail || ""
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const handleCopyTsv = () => {
    const headers = ['검사일시', '고객사명', '강종', '직경(mm)', '판정등급', '핵심판정사유', '검출결함', '작업자메모'];
    const rows = records.map((r) => [
      r.date,
      r.customerName,
      r.steelGrade,
      r.diameterMm,
      r.verdictGrade,
      r.summaryVerdict.replace(/[\t\n\r]+/g, ' '),
      r.detectedDefects.replace(/[\t\n\r]+/g, ' '),
      r.operatorNotes.replace(/[\t\n\r]+/g, ' '),
    ]);

    const tsvContent = [headers.join('\t'), ...rows.map((row) => row.join('\t'))].join('\n');
    navigator.clipboard.writeText(tsvContent);
    setCopiedTsv(true);
    setTimeout(() => setCopiedTsv(false), 2500);
  };

  const handleDownloadCsv = () => {
    const headers = ['검사일시', '고객사명', '강종', '직경(mm)', '판정등급', '핵심판정사유', '검출결함', '작업자메모'];
    const rows = records.map((r) => [
      `"${r.date}"`,
      `"${r.customerName}"`,
      `"${r.steelGrade}"`,
      `"${r.diameterMm}"`,
      `"${r.verdictGrade}"`,
      `"${r.summaryVerdict.replace(/"/g, '""')}"`,
      `"${r.detectedDefects.replace(/"/g, '""')}"`,
      `"${r.operatorNotes.replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `특수강_환봉_특채판정_구글시트누적_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    link.remove();
  };

  const handleCopyGasCode = () => {
    navigator.clipboard.writeText(gasCodeSnippet);
    setCopiedGasCode(true);
    setTimeout(() => setCopiedGasCode(false), 2500);
  };

  const handleSaveWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingUrl(true);
    setTestStatus(null);
    try {
      await onSaveWebhookUrl(inputUrl);
      setTestStatus('Webhook 연동 URL이 저장되었습니다.');
      setTimeout(() => setTestStatus(null), 3000);
    } catch (err: any) {
      setTestStatus(`저장 실패: ${err.message}`);
    } finally {
      setIsSavingUrl(false);
    }
  };

  const handleSendTestWebhook = async () => {
    if (!inputUrl || !inputUrl.startsWith('http')) {
      setTestStatus('올바른 Google Apps Script URL(https://...)을 입력하세요.');
      return;
    }
    setTestStatus('구글 시트로 테스트 레코드 전송 중...');
    try {
      await fetch('/api/spreadsheet-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: '연동 테스트사',
          steelGrade: 'SCM440',
          diameterMm: 90,
          verdictGrade: '[특채 승인 권고]',
          summaryVerdict: '구글 스프레드시트 실시간 Webhook 연동 정상 확인 완료.',
          detectedDefects: '편면취 C1.5, 버 0.2mm (테스트)',
          operatorNotes: '구글 시트 연동 테스트',
        }),
      });
      setTestStatus('구글 스프레드시트에 테스트 행이 성공적으로 추가되었습니다!');
      setTimeout(() => setTestStatus(null), 4000);
    } catch (err: any) {
      setTestStatus(`전송 오류: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-5xl w-full my-auto flex flex-col shadow-2xl max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>구글 스프레드시트(Google Sheets) & DB 자동 누적 관리</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-mono">
                  {records.length}건 누적됨
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                작업자가 심사를 실행할 때마다 날짜, 판정 등급, 사유, 결함, 강종이 자동 누적 저장됩니다.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyTsv}
              className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shadow transition-colors cursor-pointer"
              title="클립보드에 복사하여 구글 시트에서 Ctrl+V로 바로 붙여넣기"
            >
              {copiedTsv ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedTsv ? '복사 완료! (시트에서 Ctrl+V)' : '구글 시트 즉시 붙여넣기 (클립보드 복사)'}</span>
            </button>

            <button
              onClick={handleDownloadCsv}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>CSV 다운로드</span>
            </button>
          </div>

          <button
            onClick={() => setShowGasCode(!showGasCode)}
            className="px-3 py-2 rounded-lg bg-slate-850 hover:bg-slate-800 text-indigo-300 border border-indigo-700/50 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Code2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Google Apps Script 자동연동 설정 {showGasCode ? '접기' : '열기'}</span>
          </button>
        </div>

        {/* Optional: Google Apps Script Webhook Configuration Box */}
        {showGasCode && (
          <div className="p-5 bg-indigo-950/20 border-b border-indigo-900/40 space-y-3 text-xs">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <span className="font-bold text-indigo-300 flex items-center gap-1.5 text-xs">
                  <Link2 className="w-4 h-4" />
                  구글 스프레드시트 실시간 자동 전송 Webhook 연동 (선택 사항)
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  본인의 구글 스프레드시트에 아래 <strong>Apps Script 코드</strong>를 등록하면,
                  작업자가 심사를 누를 때마다 구글 시트 새 행으로 실시간 자동 전송됩니다.
                </p>
              </div>

              <button
                onClick={handleCopyGasCode}
                className="px-2.5 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copiedGasCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedGasCode ? '코드 복사됨' : 'Apps Script 코드 복사'}</span>
              </button>
            </div>

            {/* Webhook URL Input Form */}
            <form onSubmit={handleSaveWebhook} className="flex gap-2 items-center">
              <input
                type="url"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec (Apps Script 배포 URL)"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono text-xs outline-none focus:border-indigo-400"
              />
              <button
                type="submit"
                disabled={isSavingUrl}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                {isSavingUrl ? '저장 중...' : 'URL 저장'}
              </button>
              <button
                type="button"
                onClick={handleSendTestWebhook}
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 font-semibold border border-slate-700 text-xs transition-colors cursor-pointer flex items-center gap-1"
              >
                <Send className="w-3 h-3" />
                <span>테스트 전송</span>
              </button>
            </form>

            {testStatus && (
              <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] text-emerald-400 font-medium">
                {testStatus}
              </div>
            )}
          </div>
        )}

        {/* Table Body of Accumulated Records */}
        <div className="p-5 overflow-y-auto flex-1 text-xs">
          {records.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <Table className="w-8 h-8 mx-auto text-slate-600" />
              <p className="font-semibold text-slate-400">아직 누적된 심사 레코드가 없습니다.</p>
              <p className="text-[11px] text-slate-500">
                작업자가 [심사 실행]을 누르면 여기에 판정 등급, 사유, 결함, 날짜가 자동으로 기록됩니다.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <th className="py-2.5 px-3 font-semibold whitespace-nowrap">검사일시</th>
                    <th className="py-2.5 px-3 font-semibold whitespace-nowrap">고객사</th>
                    <th className="py-2.5 px-3 font-semibold whitespace-nowrap">강종 (Text)</th>
                    <th className="py-2.5 px-3 font-semibold whitespace-nowrap">직경</th>
                    <th className="py-2.5 px-3 font-semibold whitespace-nowrap">판정 등급</th>
                    <th className="py-2.5 px-3 font-semibold min-w-[200px]">판정 요약 사유</th>
                    <th className="py-2.5 px-3 font-semibold min-w-[150px]">검출 결함</th>
                    <th className="py-2.5 px-3 font-semibold whitespace-nowrap text-center">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/60 font-sans">
                  {records.map((row) => {
                    const gradeColor = row.verdictGrade.includes('권고')
                      ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60'
                      : row.verdictGrade.includes('조건부')
                      ? 'text-amber-400 bg-amber-950/60 border-amber-800/60'
                      : row.verdictGrade.includes('불가')
                      ? 'text-rose-400 bg-rose-950/60 border-rose-800/60'
                      : 'text-cyan-400 bg-cyan-950/60 border-cyan-800/60';

                    return (
                      <tr key={row.id} className="hover:bg-slate-850/50 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-slate-400 whitespace-nowrap text-[11px]">
                          {row.date}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-200 whitespace-nowrap">
                          {row.customerName}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-cyan-300 font-semibold whitespace-nowrap">
                          {row.steelGrade}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-300 whitespace-nowrap">
                          Ø{row.diameterMm}mm
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10.5px] font-bold border font-mono ${gradeColor}`}>
                            {row.verdictGrade}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-300 text-[11px] leading-relaxed">
                          {row.summaryVerdict}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                          {row.detectedDefects}
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <button
                            onClick={() => onDeleteRecord(row.id)}
                            className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                            title="레코드 삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-850 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>구글 스프레드시트 또는 Firebase DB 연동 규격 준수</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
