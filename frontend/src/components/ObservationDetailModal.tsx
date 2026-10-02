import React from "react";
import { Observation } from "../types";
import {
  X,
  MapPin,
  Calendar,
  Layers,
  Activity,
  CloudSun,
  ShieldCheck,
  Feather,
  Info,
} from "lucide-react";
import { ConfidenceBadge } from "./ConfidenceBadge";

interface Props {
  observation: Observation | null;
  onClose: () => void;
}

export const ObservationDetailModal: React.FC<Props> = ({ observation, onClose }) => {
  if (!observation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white border border-nature-200 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="relative aspect-video max-h-72 w-full bg-slate-900 overflow-hidden">
          <img
            src={(!observation.image_url || observation.image_url.includes('unsplash') || observation.image_url.includes('example.com'))
              ? (observation.species_id ? `/species/${observation.species_id}.jpg` : '/species/indian-peafowl.jpg')
              : observation.image_url}
            alt={observation.predicted_species}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.currentTarget;
              const fallback = observation.species_id ? `/species/${observation.species_id}.jpg` : '/species/indian-peafowl.jpg';
              if (!target.src.endsWith(fallback)) {
                target.src = fallback;
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-6 right-6 text-white">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-nature-700/90 text-nature-100 text-xs px-2.5 py-0.5 rounded-full font-mono">
                {observation.habitat} Habitat
              </span>
              {observation.is_demo && (
                <span className="bg-amber-500/80 text-white text-xs px-2.5 py-0.5 rounded-full font-mono">
                  Sample Demonstration
                </span>
              )}
            </div>
            <h2 className="text-2xl font-serif font-bold text-white leading-tight">
              {observation.predicted_species}
            </h2>
            {observation.species?.scientific_name && (
              <p className="text-nature-200 italic text-sm">
                {observation.species.scientific_name}
              </p>
            )}
          </div>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-6">
          {/* Key metadata grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-nature-50 p-4 rounded-2xl border border-nature-100 text-xs">
            <div>
              <span className="text-slate-500 block mb-0.5">Confidence</span>
              <div className="font-mono font-bold text-nature-900 text-sm">
                {observation.prediction_confidence}%
              </div>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Count</span>
              <div className="font-mono font-bold text-nature-900 text-sm">
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
          <div className="space-y-1.5 text-sm">
            <h4 className="text-xs uppercase tracking-wider font-mono text-slate-500 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-nature-700" />
              <span>Location Coordinates</span>
            </h4>
            <p className="font-medium text-slate-800">{observation.location_name}</p>
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
            <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
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
                <span className="bg-nature-100 text-nature-800 px-2 py-0.5 rounded font-mono">
                  Family: {observation.species.family}
                </span>
                <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-mono">
                  IUCN: {observation.species.conservation_status}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
