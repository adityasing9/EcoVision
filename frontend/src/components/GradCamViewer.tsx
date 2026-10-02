import React, { useState } from "react";
import { Eye, Layers, Info, Sparkles } from "lucide-react";

interface Props {
  originalImage: string;
  gradcamImage?: string;
  speciesName: string;
}

export const GradCamViewer: React.FC<Props> = ({
  originalImage,
  gradcamImage,
  speciesName,
}) => {
  const [showGradCam, setShowGradCam] = useState(false);
  const [opacity, setOpacity] = useState(0.85);

  if (!gradcamImage) {
    return (
      <div className="relative rounded-xl overflow-hidden border border-parchment-200 bg-black/5 aspect-square flex items-center justify-center">
        <img
          src={originalImage}
          alt={speciesName}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative rounded-2xl overflow-hidden border border-nature-200 bg-slate-900 shadow-md aspect-square">
        {/* Original Image */}
        <img
          src={originalImage}
          alt={speciesName}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Grad-CAM Heatmap Overlay */}
        {showGradCam && (
          <img
            src={gradcamImage}
            alt={`${speciesName} Grad-CAM heatmap`}
            style={{ opacity }}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-200"
          />
        )}

        {/* Status Pill on Image */}
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white flex items-center gap-1.5 border border-white/20">
          <Sparkles className="w-3.5 h-3.5 text-nature-300" />
          <span>{showGradCam ? "Attention Heatmap (Grad-CAM)" : "Specimen Photograph"}</span>
        </div>
      </div>

      {/* Control bar */}
      <div className="bg-nature-50 border border-nature-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowGradCam(!showGradCam)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              showGradCam
                ? "bg-nature-700 text-white shadow-sm"
                : "bg-white text-nature-800 border border-nature-300 hover:bg-nature-100"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{showGradCam ? "Hide Attention Map" : "Show AI Attention (Grad-CAM)"}</span>
          </button>

          {showGradCam && (
            <div className="flex items-center gap-2 text-xs text-nature-800 ml-2">
              <span className="font-mono">Blend:</span>
              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.05"
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                className="w-20 accent-nature-700 cursor-pointer"
              />
            </div>
          )}
        </div>

        <div className="flex items-center text-xs text-slate-500 gap-1 italic">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Highlights model visual feature focus</span>
        </div>
      </div>
    </div>
  );
};
