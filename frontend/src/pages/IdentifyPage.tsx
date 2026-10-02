import React, { useState, useRef } from "react";
import { api } from "../services/api";
import { PredictionResult } from "../types";
import { ConfidenceBadge } from "../components/ConfidenceBadge";
import { GradCamViewer } from "../components/GradCamViewer";
import { CameraModal } from "../components/CameraModal";
import { ObservationModal } from "../components/ObservationModal";
import {
  UploadCloud,
  Camera,
  X,
  Sparkles,
  Loader2,
  BookOpen,
  Info,
  CheckCircle,
  HelpCircle,
  Layers,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

const SAMPLE_SPECIMENS = [
  {
    name: "Indian Peafowl",
    url: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
    desc: "National bird of India, iridescent plumage",
  },
  {
    name: "White-throated Kingfisher",
    url: "https://images.unsplash.com/photo-1520808663317-647b476a81b9?auto=format&fit=crop&w=800&q=80",
    desc: "Wetland & tree percher, dagger beak",
  },
  {
    name: "Great Hornbill",
    url: "https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=800&q=80",
    desc: "Canopy seed disperser with casque",
  },
  {
    name: "Peregrine Falcon",
    url: "https://images.unsplash.com/photo-1606567595334-d39972c85dbe?auto=format&fit=crop&w=800&q=80",
    desc: "High-speed pursuit predator",
  },
  {
    name: "Greater Flamingo",
    url: "https://images.unsplash.com/photo-1539664030485-a936c7d29c6e?auto=format&fit=crop&w=800&q=80",
    desc: "Hypersaline coastal filter-feeder",
  },
];

const LOADING_STEPS = [
  "Normalizing specimen resolution & aspect ratio...",
  "Passing through ResNet-50 deep convolutional backbone...",
  "Evaluating bill morphology, wing structure & plumage...",
  "Generating Grad-CAM visual attention gradients...",
  "Fetching ornithological taxonomy and IUCN data...",
];

export const IdentifyPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStepIdx, setLoadingStepIdx] = useState(0);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setPrediction(null);
    setErrorMsg(null);
    setSaveSuccessMsg(null);
  };

  const handleSelectSample = async (sample: typeof SAMPLE_SPECIMENS[0]) => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      setPrediction(null);
      setPreviewUrl(sample.url);

      // Fetch sample image as Blob then File
      const response = await fetch(sample.url);
      const blob = await response.blob();
      const file = new File([blob], `${sample.name.toLowerCase().replace(/\s+/g, "-")}.jpg`, {
        type: "image/jpeg",
      });
      setSelectedFile(file);
      setIsLoading(false);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg("Failed to load sample image. Please try uploading a file.");
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile && !previewUrl) return;

    setIsLoading(true);
    setErrorMsg(null);
    setPrediction(null);
    setSaveSuccessMsg(null);

    // Multi-stage loading stepper simulation
    setLoadingStepIdx(0);
    const interval = setInterval(() => {
      setLoadingStepIdx((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
    }, 600);

    try {
      let fileToSend = selectedFile;
      if (!fileToSend && previewUrl) {
        const response = await fetch(previewUrl);
        const blob = await response.blob();
        fileToSend = new File([blob], "specimen.jpg", { type: "image/jpeg" });
      }

      if (!fileToSend) throw new Error("No image file available.");

      const result = await api.predictBird(fileToSend, true);
      clearInterval(interval);
      setPrediction(result);
      setIsLoading(false);
    } catch (err: any) {
      clearInterval(interval);
      setIsLoading(false);
      setErrorMsg(err.message || "Identification analysis failed.");
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setPrediction(null);
    setErrorMsg(null);
    setSaveSuccessMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Title Header */}
      <div className="max-w-2xl space-y-2">
        <span className="text-xs font-mono uppercase tracking-widest text-nature-700 font-semibold">
          AI-Assisted Field Tool
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900">
          Avian Species Identification
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed">
          Provide a clear photograph of a bird. EcoVision evaluates morphological features using a
          deep learning vision model, exposes alternative possibilities, and visualizes model
          attention via Grad-CAM.
        </p>
      </div>

      {/* Main Grid: Upload / Preview on Left, Analysis Result on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image Input & Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-nature-200/80 p-6 shadow-sm space-y-5">
            <h3 className="font-serif font-bold text-base text-slate-900 flex items-center justify-between">
              <span>Specimen Photograph</span>
              {previewUrl && (
                <button
                  onClick={handleClear}
                  className="text-xs text-rose-600 hover:underline flex items-center gap-1 font-sans"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Remove Photo</span>
                </button>
              )}
            </h3>

            {/* Upload Area / Preview */}
            {previewUrl ? (
              <div className="relative rounded-2xl overflow-hidden aspect-square border border-slate-200 bg-black/5 shadow-inner">
                <img
                  src={previewUrl}
                  alt="Specimen preview"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileChange(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-nature-300 hover:border-nature-500 rounded-2xl aspect-square flex flex-col items-center justify-center p-6 text-center cursor-pointer bg-nature-50/50 hover:bg-nature-50 transition group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileChange(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
                <div className="w-14 h-14 rounded-2xl bg-white text-nature-700 flex items-center justify-center shadow-xs border border-nature-200 group-hover:scale-105 transition mb-3">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <p className="text-sm font-semibold text-slate-800">
                  Drop bird photograph here
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
                  JPEG, PNG, or WebP up to 10MB
                </p>
                <span className="mt-4 px-3 py-1.5 rounded-lg bg-nature-100 text-nature-800 text-xs font-semibold">
                  Browse Files
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsCameraOpen(true)}
                className="py-3 px-4 rounded-xl border border-nature-300 text-nature-800 hover:bg-nature-50 text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <Camera className="w-4 h-4 text-nature-700" />
                <span>Field Camera</span>
              </button>

              <button
                type="button"
                onClick={handleAnalyze}
                disabled={!previewUrl || isLoading}
                className="py-3 px-4 rounded-xl bg-nature-800 hover:bg-nature-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-nature-300" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-nature-300" />
                    <span>Identify Species</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Sample Specimen Selector */}
          <div className="bg-parchment-100/80 border border-parchment-300 rounded-2xl p-4 space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold block">
              Quick Test: Pre-verified Field Specimens
            </span>
            <div className="grid grid-cols-5 gap-2">
              {SAMPLE_SPECIMENS.map((specimen) => (
                <button
                  key={specimen.name}
                  onClick={() => handleSelectSample(specimen)}
                  className="group relative rounded-xl overflow-hidden aspect-square border border-nature-200/80 hover:border-nature-600 transition focus:outline-none"
                  title={specimen.name}
                >
                  <img
                    src={specimen.url}
                    alt={specimen.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Prediction Results or Prompt */}
        <div className="lg:col-span-7">
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3 mb-6">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Inference Error</strong>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {saveSuccessMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-3 mb-6">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {isLoading ? (
            /* Multi-step loading state */
            <div className="bg-white rounded-3xl border border-nature-200/80 p-10 shadow-sm flex flex-col items-center justify-center text-center space-y-6 min-h-[440px]">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-nature-100 border-t-nature-700 animate-spin" />
                <Sparkles className="w-6 h-6 text-nature-700 absolute inset-0 m-auto" />
              </div>
              <div className="space-y-2 max-w-md">
                <span className="text-xs font-mono uppercase tracking-wider text-nature-700 font-semibold">
                  Executing PyTorch Vision Pipeline
                </span>
                <h3 className="font-serif font-bold text-lg text-slate-900 transition-all">
                  {LOADING_STEPS[loadingStepIdx]}
                </h3>
                <p className="text-xs text-slate-500 font-sans">
                  Deep features are extracted from the final convolutional bottleneck layer.
                </p>
              </div>

              {/* Progress Stepper Pills */}
              <div className="flex gap-2">
                {LOADING_STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i <= loadingStepIdx ? "w-8 bg-nature-700" : "w-3 bg-nature-100"
                    }`}
                  />
                ))}
              </div>
            </div>
          ) : prediction ? (
            /* Complete Prediction Result */
            <div className="bg-white rounded-3xl border border-nature-200/80 p-6 sm:p-8 shadow-sm space-y-8">
              {/* Top Prediction Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <ConfidenceBadge
                      level={prediction.confidence_level}
                      percentage={prediction.top_prediction.confidence_percentage}
                      size="md"
                    />
                    <span className="text-xs font-mono text-slate-400">
                      {prediction.model_architecture.toUpperCase()}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
                    {prediction.top_prediction.common_name}
                  </h2>
                  <p className="text-sm italic text-slate-500 mt-0.5">
                    {prediction.top_prediction.scientific_name}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(true)}
                  className="px-5 py-3 rounded-2xl bg-nature-800 hover:bg-nature-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition shrink-0"
                >
                  <BookOpen className="w-4 h-4 text-nature-300" />
                  <span>Log to Field Journal</span>
                </button>
              </div>

              {/* Guidance Message Note */}
              <div className="p-3.5 rounded-2xl bg-parchment-100 border border-parchment-300 text-xs text-slate-700 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-nature-700 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{prediction.guidance_message}</span>
              </div>

              {/* Grad-CAM Heatmap Viewer */}
              {previewUrl && (
                <div className="space-y-2">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                    Explainability & AI Visual Focus
                  </h4>
                  <GradCamViewer
                    originalImage={previewUrl}
                    gradcamImage={prediction.gradcam_heatmap}
                    speciesName={prediction.top_prediction.common_name}
                  />
                </div>
              )}

              {/* Top 3 Alternative Predictions */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Candidate Probability Distribution (Top-3)
                </h4>
                <div className="space-y-2">
                  {/* Top 1 Bar */}
                  <div className="bg-nature-50 border border-nature-200 rounded-xl p-3">
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="font-semibold text-nature-950">
                        1. {prediction.top_prediction.common_name}{" "}
                        <span className="italic text-slate-500 font-normal">
                          ({prediction.top_prediction.scientific_name})
                        </span>
                      </span>
                      <span className="font-mono font-bold text-nature-900">
                        {prediction.top_prediction.confidence_percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-nature-200/80 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-nature-700 h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${prediction.top_prediction.confidence_percentage}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Alternatives */}
                  {prediction.alternative_predictions.map((alt, i) => (
                    <div
                      key={alt.species_id}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-3"
                    >
                      <div className="flex justify-between items-center text-xs mb-1.5">
                        <span className="text-slate-700">
                          {i + 2}. {alt.common_name}{" "}
                          <span className="italic text-slate-400 font-normal">
                            ({alt.scientific_name})
                          </span>
                        </span>
                        <span className="font-mono text-slate-600">
                          {alt.confidence_percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-slate-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${alt.confidence_percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Species Ecological Monograph Preview */}
              {prediction.species_details && (
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                    Natural History & Ecological Role
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-nature-50/60 rounded-xl border border-nature-100">
                      <span className="text-slate-500 block mb-0.5 font-medium">Habitat Types</span>
                      <span className="font-semibold text-slate-800">
                        {prediction.species_details.habitat_types.join(", ")}
                      </span>
                    </div>
                    <div className="p-3 bg-nature-50/60 rounded-xl border border-nature-100">
                      <span className="text-slate-500 block mb-0.5 font-medium">
                        Conservation Status
                      </span>
                      <span className="font-semibold text-nature-900">
                        {prediction.species_details.conservation_status}
                      </span>
                    </div>
                    <div className="p-3 bg-nature-50/60 rounded-xl border border-nature-100">
                      <span className="text-slate-500 block mb-0.5 font-medium">Dietary Niche</span>
                      <span className="text-slate-800">
                        {prediction.species_details.diet}
                      </span>
                    </div>
                    <div className="p-3 bg-nature-50/60 rounded-xl border border-nature-100">
                      <span className="text-slate-500 block mb-0.5 font-medium">
                        Taxonomy (Family / Order)
                      </span>
                      <span className="text-slate-800 font-mono">
                        {prediction.species_details.family} • {prediction.species_details.order_name}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed italic">
                    "{prediction.species_details.description}"
                  </p>
                </div>
              )}

              {/* Responsible AI Disclaimer Footer */}
              <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 leading-relaxed font-sans">
                <strong>Responsible AI Notice:</strong> {prediction.disclaimer}
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-3xl border border-nature-200/80 p-10 shadow-sm flex flex-col items-center justify-center text-center space-y-4 min-h-[440px]">
              <div className="w-16 h-16 rounded-2xl bg-nature-50 border border-nature-200 flex items-center justify-center text-nature-600 shadow-xs">
                <HelpCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="font-serif font-bold text-lg text-slate-800">
                  Ready for Identification
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-sans">
                  Upload an image or pick one of the sample specimens on the left to begin
                  morphological analysis with ResNet-50.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(file) => handleFileChange(file)}
      />

      {prediction && (
        <ObservationModal
          isOpen={isLogModalOpen}
          onClose={() => setIsLogModalOpen(false)}
          prediction={prediction}
          imageFile={selectedFile}
          uploadedImageUrl={previewUrl || undefined}
          onSaved={() => {
            setSaveSuccessMsg(
              `Observation of ${prediction.top_prediction.common_name} successfully recorded to your field journal!`
            );
          }}
        />
      )}
    </div>
  );
};
