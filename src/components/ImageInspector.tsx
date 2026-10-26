import React, { useState, useRef } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Camera, 
  Upload, 
  Trash2, 
  MapPin,
  BookmarkPlus,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  SplitSquareVertical,
  Focus
} from 'lucide-react';
import { InspectionPin } from '../types';

interface ImageInspectorProps {
  imageSrc: string | null;
  onImageChange: (dataUrl: string, mimeType?: string) => void;
  pins: InspectionPin[];
  onAddPin: (pin: InspectionPin) => void;
  onRemovePin: (id: string) => void;
  diameterMm: number | string;
  onOpenArchiveModal: () => void;
}

export const ImageInspector: React.FC<ImageInspectorProps> = ({
  imageSrc,
  onImageChange,
  pins,
  onAddPin,
  onRemovePin,
  diameterMm,
  onOpenArchiveModal,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [focusMode, setFocusMode] = useState<'normal' | 'chamfer' | 'cut_surface' | 'edge'>('normal');
  const [pinMode, setPinMode] = useState<boolean>(false);
  const [selectedPinType, setSelectedPinType] = useState<InspectionPin['type']>('chamfer');
  const [showCamera, setShowCamera] = useState<boolean>(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      onImageChange(result, file.type || 'image/jpeg');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      onImageChange(result, file.type || 'image/jpeg');
    };
    reader.readAsDataURL(file);
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!pinMode || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const labels: Record<InspectionPin['type'], string> = {
      chamfer: '편면취 / 미면취',
      step: '절단 단차 / 뜯김',
      burr: '돌출 버 (Burr)',
      crack: '크랙 / 전단 균열',
      other: '관찰점',
    };

    onAddPin({
      id: `pin-${Date.now()}`,
      x,
      y,
      type: selectedPinType,
      label: labels[selectedPinType],
    });
  };

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      onImageChange(dataUrl, 'image/jpeg');
    }
    stopCamera();
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setShowCamera(false);
  };

  const getFilterStyle = () => {
    switch (focusMode) {
      case 'chamfer':
        // High contrast along edges to clearly reveal chamfer width variations (편면취/미면취 밴드 윤곽)
        return 'contrast(160%) saturate(120%) brightness(105%)';
      case 'cut_surface':
        // High gamma & grayscale to expose saw step marks, burrs, and chatter
        return 'grayscale(100%) contrast(185%) brightness(115%)';
      case 'edge':
        // Sobel-like edge highlight
        return 'contrast(220%) brightness(125%) saturate(0%) drop-shadow(0 0 1px #000)';
      default:
        return 'none';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col">
      {/* Top Toolbar */}
      <div className="px-4 py-2.5 bg-slate-850 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
          <span className="text-xs font-bold text-slate-200 tracking-wider flex items-center gap-1.5">
            절단면 정밀 판독기
            {diameterMm && <span className="text-cyan-400 font-mono text-[11px]">(외경 Ø{diameterMm}mm)</span>}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 text-xs">
          {/* Standard File Upload */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          {/* Mobile Native Rear Camera Capture (capture="environment") */}
          <input
            type="file"
            ref={cameraInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            capture="environment"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="환봉 절단면 사진 파일 업로드"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>사진 업로드</span>
          </button>

          {/* Dedicated Native Rear Camera Button */}
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            title="모바일 후면 카메라 즉시 실행 촬영 (capture=environment)"
          >
            <Camera className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold">후면 카메라 촬영</span>
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1"></div>

          {/* Zoom & Rotate */}
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="확대 (+)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.25, 0.75))}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="축소 (-)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setZoom(1);
              setRotation(0);
            }}
            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-400 font-mono transition-colors"
            title="배율 초기화"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={() => setRotation((r) => (r + 90) % 360)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="90도 회전"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Focus Mode Bar (편면취 / 미면취 / 절단면 상태 집중 모드) */}
      <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between text-xs gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 text-[11px] font-semibold flex items-center gap-1">
            <Focus className="w-3.5 h-3.5 text-cyan-400" /> 결함 집중 모드:
          </span>
          <button
            onClick={() => setFocusMode('normal')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
              focusMode === 'normal'
                ? 'bg-slate-700 text-white font-semibold'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            기본
          </button>
          <button
            onClick={() => setFocusMode('chamfer')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
              focusMode === 'chamfer'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'bg-slate-800/60 text-slate-300 hover:text-white'
            }`}
            title="편면취/미면취 엣지 대조 강조"
          >
            편면취/미면취 강조
          </button>
          <button
            onClick={() => setFocusMode('cut_surface')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
              focusMode === 'cut_surface'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800/60 text-slate-300 hover:text-white'
            }`}
            title="절단 단차, 뜯김, 찌꺼기 버 강조"
          >
            절단단차/버 강조
          </button>
        </div>

        {/* Defect Data Archiving & Pinning Trigger */}
        <div className="flex items-center gap-2">
          {/* Data Archive Button: 핵심 기능 */}
          <button
            onClick={onOpenArchiveModal}
            className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            title="이런 형태는 문제이다 DB에 이 사진과 판정 사유를 영구 축적"
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
            <span>이 형태 불량DB 축적</span>
          </button>

          {/* Pin Marker */}
          <div className="flex items-center gap-1 bg-slate-850 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setPinMode(!pinMode)}
              className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-colors ${
                pinMode ? 'bg-rose-500 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MapPin className="w-3 h-3" />
              마킹 {pinMode ? 'ON' : 'OFF'}
            </button>
            {pinMode && (
              <select
                value={selectedPinType}
                onChange={(e) => setSelectedPinType(e.target.value as InspectionPin['type'])}
                className="bg-slate-900 text-slate-200 text-[11px] rounded px-1.5 py-0.5 border border-slate-700 outline-none"
              >
                <option value="chamfer">편면취/미면취</option>
                <option value="step">절단 단차/뜯김</option>
                <option value="burr">돌출 버(Burr)</option>
                <option value="crack">크랙/균열</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Main Viewport */}
      <div
        ref={containerRef}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={handleImageClick}
        className={`relative w-full h-[380px] sm:h-[430px] bg-slate-950 flex items-center justify-center overflow-hidden select-none ${
          pinMode ? 'cursor-crosshair' : 'cursor-grab'
        }`}
      >
        {imageSrc ? (
          <div
            className="relative transition-transform duration-100 ease-out flex items-center justify-center w-full h-full"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
            }}
          >
            <img
              src={imageSrc}
              alt="환봉 절단면"
              className="max-h-[88%] max-w-[88%] object-contain rounded-full shadow-2xl transition-all"
              style={{
                filter: getFilterStyle(),
              }}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-500 p-8 text-center max-w-sm">
            <div className="w-14 h-14 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-3 text-cyan-400">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-slate-300 mb-1">
              환봉 절단면 사진을 업로드하거나 샘플을 선택하십시오
            </p>
            <p className="text-[11px] text-slate-500">
              편면취, 미면취, 절단면 단차/버 상태를 정밀 분석합니다
            </p>
          </div>
        )}

        {/* Render Defect Pins */}
        {pins.map((pin) => (
          <div
            key={pin.id}
            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <span className="flex h-5 w-5 items-center justify-center">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  pin.type === 'crack' ? 'bg-rose-500' : pin.type === 'burr' ? 'bg-amber-500' : 'bg-cyan-500'
                }`} />
                <span className={`relative inline-flex rounded-full h-3.5 w-3.5 border-2 border-white ${
                  pin.type === 'crack' ? 'bg-rose-600' : pin.type === 'burr' ? 'bg-amber-600' : 'bg-cyan-600'
                }`} />
              </span>

              {/* Tooltip Label */}
              <div className="absolute left-1/2 -top-8 -translate-x-1/2 bg-slate-900 border border-slate-700 text-slate-200 text-[10px] font-mono px-2 py-0.5 rounded shadow-lg whitespace-nowrap flex items-center gap-1.5 opacity-90 group-hover:opacity-100">
                <span>{pin.label}</span>
                <button
                  onClick={() => onRemovePin(pin.id)}
                  className="text-slate-400 hover:text-rose-400"
                  title="삭제"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pins Summary Badge Bar */}
      {pins.length > 0 && (
        <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px]">지정 결함 포인트 ({pins.length}):</span>
            <div className="flex flex-wrap gap-1">
              {pins.map((p) => (
                <span
                  key={p.id}
                  className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-300 font-mono flex items-center gap-1"
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      p.type === 'crack' ? 'bg-rose-500' : p.type === 'burr' ? 'bg-amber-500' : 'bg-cyan-500'
                    }`}
                  />
                  {p.label}
                  <button onClick={() => onRemovePin(p.id)} className="text-slate-500 hover:text-rose-400 ml-0.5">
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={() => pins.forEach((p) => onRemovePin(p.id))}
            className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors"
          >
            초기화
          </button>
        </div>
      )}

      {/* Webcam Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 max-w-lg w-full flex flex-col items-center gap-3">
            <div className="w-full flex justify-between items-center text-sm font-semibold text-slate-200">
              <span className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-400" /> 현장 절단면 카메라 촬영
              </span>
              <button onClick={stopCamera} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>
            <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            </div>
            <div className="flex gap-2 w-full">
              <button
                onClick={capturePhoto}
                className="flex-1 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold transition-colors cursor-pointer"
              >
                촬영 및 적용
              </button>
              <button
                onClick={stopCamera}
                className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors cursor-pointer"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
