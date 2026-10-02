import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Camera, X, RefreshCw, Check } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

export const CameraModal: React.FC<Props> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

  const startCamera = async () => {
    setCameraError(null);
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error("Camera access failed:", err);
      setCameraError(
        "Could not access camera device. Please grant camera permission or use the file upload option."
      );
    }
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
    setCapturedPhoto(null);
    setCapturedBlob(null);
  };

  const handleSnap = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setCapturedPhoto(url);
          setCapturedBlob(blob);
        }
      },
      "image/jpeg",
      0.92
    );
  };

  const handleConfirm = () => {
    if (capturedBlob) {
      const file = new File([capturedBlob], `bird-capture-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });
      onCapture(file);
      onClose();
    }
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    setCapturedBlob(null);
  };

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prev || "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] overflow-y-auto bg-black/85 backdrop-blur-md p-3 sm:p-6 animate-in fade-in"
      onClick={onClose}
    >
      <div className="min-h-full flex items-center justify-center py-6">
        <div
          className="bg-slate-900 border border-nature-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col text-white my-auto"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-nature-400" />
            <span className="font-semibold text-sm">EcoVision Field Camera</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport */}
        <div className="relative aspect-[4/3] bg-black flex items-center justify-center overflow-hidden">
          {cameraError ? (
            <div className="p-6 text-center text-sm text-rose-300 space-y-3">
              <p>{cameraError}</p>
              <button
                onClick={startCamera}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg"
              >
                Retry Camera
              </button>
            </div>
          ) : capturedPhoto ? (
            <img
              src={capturedPhoto}
              alt="Captured frame"
              className="w-full h-full object-cover"
            />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          )}

          <canvas ref={canvasRef} className="hidden" />

          {/* Guidelines Reticle */}
          {!capturedPhoto && !cameraError && (
            <div className="absolute inset-10 border-2 border-dashed border-nature-400/40 rounded-xl pointer-events-none flex items-center justify-center">
              <span className="text-nature-200/60 text-xs font-mono bg-black/40 px-2 py-1 rounded">
                Center bird in frame
              </span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={() =>
              setFacingMode((prev) => (prev === "environment" ? "user" : "environment"))
            }
            className="p-2.5 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
            title="Switch front/rear camera"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {capturedPhoto ? (
            <div className="flex items-center gap-3">
              <button
                onClick={handleRetake}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
              >
                Retake
              </button>
              <button
                onClick={handleConfirm}
                className="px-5 py-2.5 rounded-xl bg-nature-600 hover:bg-nature-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-nature-900/40 transition"
              >
                <Check className="w-4 h-4" />
                <span>Use Specimen Photo</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleSnap}
              disabled={!!cameraError}
              className="w-14 h-14 rounded-full border-4 border-white flex items-center justify-center bg-nature-500 hover:bg-nature-400 active:scale-95 transition shadow-lg"
            >
              <div className="w-10 h-10 rounded-full bg-white/20" />
            </button>
          )}

          <div className="w-9" />
        </div>
      </div>
    </div>
  </div>,
  document.body
);
};
