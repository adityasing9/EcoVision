import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { Observation } from "../types";
import {
  X,
  MapPin,
  Calendar,
  CloudSun,
  Feather,
} from "lucide-react";

interface Props {
  observation: Observation | null;
  onClose: () => void;
}

export const ObservationDetailModal: React.FC<Props> = ({ observation, onClose }) => {
  // Lock body scroll and listen for Escape key to ensure smooth interaction
  useEffect(() => {
    if (!observation) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow || "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [observation, onClose]);

  if (!observation) return null;

  const displayImageUrl =
    !observation.image_url ||
    observation.image_url.includes("unsplash") ||
    observation.image_url.includes("example.com")
      ? observation.species_id
        ? `/species/${observation.species_id}.jpg`
        : "/species/indian-peafowl.jpg"
      : observation.image_url;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] overflow-y-auto bg-black/75 backdrop-blur-md transition-opacity duration-200 p-3 sm:p-6 animate-in fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div className="min-h-full flex items-center justify-center py-6 sm:py-10">
        <div
          className="relative bg-white border border-nature-200 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto text-left transform transition-all duration-200 scale-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Image Specimen Banner */}
          <div className="relative aspect-[16/9] max-h-72 w-full bg-slate-900 overflow-hidden">
            <img
              src={displayImageUrl}
              alt={observation.predicted_species}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.currentTarget;
                const fallback = observation.species_id
                  ? `/species/${observation.species_id}.jpg`
                  : "/species/indian-peafowl.jpg";
                if (!target.src.endsWith(fallback)) {
                  target.src = fallback;
                }
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20" />

            {/* Prominent High-Contrast Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md shadow-lg border border-white/20 transition-transform active:scale-95"
              title="Close (Esc)"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Specimen Header Metadata */}
            <div className="absolute bottom-4 left-5 right-5 text-white">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="bg-nature-700/90 text-nature-100 text-xs px-2.5 py-0.5 rounded-full font-mono border border-nature-500/30">
                  {observation.habitat} Habitat
                </span>
                {observation.is_demo && (
                  <span className="bg-amber-600/90 text-white text-xs px-2.5 py-0.5 rounded-full font-mono border border-amber-400/30">
                    Sample Demonstration
                  </span>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white leading-tight drop-shadow-sm">
                {observation.predicted_species}
              </h2>
              {observation.species?.scientific_name && (
                <p className="text-nature-200 italic text-sm font-sans drop-shadow-sm">
                  {observation.species.scientific_name}
                </p>
              )}
            </div>
          </div>

          {/* Content body */}
          <div className="p-6 space-y-6">
            {/* Key metadata grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-nature-50/80 p-4 rounded-2xl border border-nature-100 text-xs">
              <div>
                <span className="text-slate-500 block mb-0.5">Confidence</span>
                <div className="font-mono font-bold text-nature-900 text-base">
                  {observation.prediction_confidence}%
                </div>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Count</span>
                <div className="font-mono font-bold text-nature-900 text-base">
                  {observation.bird_count} specimen{observation.bird_count > 1 ? "s" : ""}
                </div>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Behavior</span>
                <div className="font-semibold text-slate-800 text-sm">
                  {observation.behavior}
                </div>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Recorded Date</span>
                <div className="font-mono text-slate-800 text-sm">
                  {new Date(observation.observed_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Location details */}
            <div className="space-y-1 text-sm">
              <h4 className="text-xs uppercase tracking-wider font-mono text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-nature-700" />
                <span>Location Coordinates</span>
              </h4>
              <p className="font-semibold text-slate-900">{observation.location_name}</p>
              {observation.latitude !== undefined && observation.longitude !== undefined && (
                <p className="font-mono text-xs text-slate-500">
                  GPS: {observation.latitude.toFixed(4)}° N, {observation.longitude.toFixed(4)}° E
                </p>
              )}
            </div>

            {/* Environmental Field Notes */}
            {observation.environmental_notes && (
              <div className="space-y-1.5 text-sm">
                <h4 className="text-xs uppercase tracking-wider font-mono text-slate-500 flex items-center gap-1.5">
                  <Feather className="w-3.5 h-3.5 text-nature-700" />
                  <span>Observer Field Notes</span>
                </h4>
                <div className="p-3.5 bg-parchment-100 rounded-xl border border-parchment-300 text-slate-700 italic text-xs leading-relaxed">
                  "{observation.environmental_notes}"
                </div>
              </div>
            )}

            {/* Weather & Ecological Traits */}
            {observation.weather_conditions && (
              <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <CloudSun className="w-4 h-4 text-amber-500 shrink-0" />
                <span>
                  <strong>Conditions:</strong> {observation.weather_conditions}
                </span>
              </div>
            )}

            {/* Species Natural History Excerpt */}
            {observation.species && (
              <div className="pt-4 border-t border-slate-200 space-y-2">
                <h4 className="text-xs uppercase tracking-wider font-mono text-slate-500">
                  Ecological Context ({observation.species.common_name})
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {observation.species.description}
                </p>
                <div className="flex flex-wrap gap-2 text-xs pt-1">
                  <span className="bg-nature-100 text-nature-800 px-2.5 py-0.5 rounded-full font-mono">
                    Family: {observation.species.family}
                  </span>
                  <span className="bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full font-mono">
                    IUCN: {observation.species.conservation_status}
                  </span>
                </div>
              </div>
            )}

            {/* Footer Action Bar */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">
                Record ID: {observation.id.slice(0, 16)}...
              </span>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-nature-800 hover:bg-nature-700 text-white text-xs font-semibold shadow-xs transition"
              >
                Close Specimen
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
