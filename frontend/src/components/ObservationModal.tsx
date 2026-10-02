import React, { useState } from "react";
import {
  ObservationCreatePayload,
  PredictionResult,
  HabitatType,
  BirdBehavior,
} from "../types";
import { api } from "../services/api";
import {
  X,
  MapPin,
  Calendar,
  Compass,
  FileText,
  Loader2,
  CheckCircle,
  CloudSun,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  prediction: PredictionResult;
  imageFile?: File | null;
  uploadedImageUrl?: string;
  onSaved: () => void;
}

const HABITATS: HabitatType[] = [
  "Forest",
  "Wetland",
  "Grassland",
  "Agricultural",
  "Urban",
  "Coastal",
  "River/Lake",
  "Mountain",
  "Garden",
  "Other",
];

const BEHAVIORS: BirdBehavior[] = [
  "Foraging",
  "Perching",
  "Flying",
  "Calling / Vocalizing",
  "Nesting",
  "Flocking",
  "Swimming / Diving",
  "Courtship Display",
  "Resting",
  "Other",
];

export const ObservationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  prediction,
  imageFile,
  uploadedImageUrl,
  onSaved,
}) => {
  const [locationName, setLocationName] = useState("Local Habitat Area");
  const [latitude, setLatitude] = useState<number | undefined>(28.6139);
  const [longitude, setLongitude] = useState<number | undefined>(77.209);
  const [habitat, setHabitat] = useState<HabitatType>("Garden");
  const [birdCount, setBirdCount] = useState<number>(1);
  const [behavior, setBehavior] = useState<BirdBehavior>("Perching");
  const [environmentalNotes, setEnvironmentalNotes] = useState("");
  const [weatherConditions, setWeatherConditions] = useState("Clear, 25°C");
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFetchGps = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(parseFloat(pos.coords.latitude.toFixed(5)));
        setLongitude(parseFloat(pos.coords.longitude.toFixed(5)));
        setIsLocating(false);
      },
      (err) => {
        console.warn("GPS error:", err);
        setIsLocating(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      let finalImageUrl = uploadedImageUrl;

      // If an image file was supplied and hasn't been uploaded yet, upload to Supabase Storage
      if (!finalImageUrl && imageFile) {
        finalImageUrl = await api.uploadImage(imageFile);
      } else if (!finalImageUrl) {
        finalImageUrl =
          prediction.species_details?.image_url ||
          "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80";
      }

      const payload: ObservationCreatePayload = {
        species_id: prediction.top_prediction.species_id,
        predicted_species: prediction.top_prediction.common_name,
        prediction_confidence: prediction.top_prediction.confidence_percentage,
        top_predictions: [
          prediction.top_prediction,
          ...prediction.alternative_predictions,
        ],
        image_url: finalImageUrl,
        latitude,
        longitude,
        location_name: locationName,
        habitat,
        bird_count: birdCount,
        behavior,
        environmental_notes: environmentalNotes || undefined,
        weather_conditions: weatherConditions || undefined,
        is_demo: false,
      };

      await api.createObservation(payload);
      setIsSubmitting(false);
      onSaved();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to save observation");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white border border-nature-200 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-nature-900 text-white px-6 py-5 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-nature-300 font-mono">
              Biodiversity Field Record
            </span>
            <h3 className="text-lg font-serif font-bold text-white mt-0.5">
              Log Observation to Journal
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-nature-300 hover:text-white hover:bg-nature-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Species Summary Banner */}
        <div className="bg-nature-50 border-b border-nature-100 px-6 py-3 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-500">Species:</span>{" "}
            <span className="font-semibold text-nature-900">
              {prediction.top_prediction.common_name}
            </span>{" "}
            <span className="italic text-slate-500">
              ({prediction.top_prediction.scientific_name})
            </span>
          </div>
          <div className="font-mono bg-nature-200 text-nature-900 px-2 py-0.5 rounded font-medium">
            AI Conf: {prediction.top_prediction.confidence_percentage}%
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm text-slate-700">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Location & GPS */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Location Name / Landmark *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g. Keoladeo National Park, Wetland Zone 3"
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-nature-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Coordinates row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Latitude (approx.)
              </label>
              <input
                type="number"
                step="any"
                value={latitude ?? ""}
                onChange={(e) => setLatitude(e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-nature-500 focus:outline-none font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>Longitude (approx.)</span>
                <button
                  type="button"
                  onClick={handleFetchGps}
                  disabled={isLocating}
                  className="text-nature-700 hover:text-nature-900 flex items-center gap-1 font-mono text-[11px]"
                >
                  <Compass className={`w-3 h-3 ${isLocating ? "animate-spin" : ""}`} />
                  <span>{isLocating ? "Locating..." : "Use GPS"}</span>
                </button>
              </label>
              <input
                type="number"
                step="any"
                value={longitude ?? ""}
                onChange={(e) => setLongitude(e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-nature-500 focus:outline-none font-mono text-xs"
              />
            </div>
          </div>

          {/* Habitat & Bird Count */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Habitat Category *
              </label>
              <select
                value={habitat}
                onChange={(e) => setHabitat(e.target.value as HabitatType)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-nature-500 focus:outline-none bg-white text-xs"
              >
                {HABITATS.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Number of Birds Counted *
              </label>
              <input
                type="number"
                min="1"
                required
                value={birdCount}
                onChange={(e) => setBirdCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-nature-500 focus:outline-none text-xs"
              />
            </div>
          </div>

          {/* Behavior & Weather */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Observed Behavior *
              </label>
              <select
                value={behavior}
                onChange={(e) => setBehavior(e.target.value as BirdBehavior)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-nature-500 focus:outline-none bg-white text-xs"
              >
                {BEHAVIORS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Weather / Environmental Context
              </label>
              <div className="relative">
                <CloudSun className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={weatherConditions}
                  onChange={(e) => setWeatherConditions(e.target.value)}
                  placeholder="e.g. Overcast, 22°C"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-nature-500 focus:outline-none text-xs"
                />
              </div>
            </div>
          </div>

          {/* Environmental Field Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Field Observations & Ecological Notes
            </label>
            <textarea
              rows={3}
              value={environmentalNotes}
              onChange={(e) => setEnvironmentalNotes(e.target.value)}
              placeholder="e.g. Single specimen foraging along reed margin; interacted with a pair of pond herons. Plumage appears fresh."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-nature-500 focus:outline-none text-xs"
            />
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-nature-700 hover:bg-nature-800 text-white font-semibold text-xs flex items-center gap-2 shadow-md transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Recording Observation...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Save to Biodiversity Journal</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
