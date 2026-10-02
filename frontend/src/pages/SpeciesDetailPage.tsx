import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../services/api";
import { Species } from "../types";
import {
  ArrowLeft,
  Feather,
  Globe,
  Trees,
  Utensils,
  Activity,
  ShieldCheck,
  BookOpen,
  Camera,
  Loader2,
} from "lucide-react";

export const SpeciesDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [species, setSpecies] = useState<Species | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .getSpeciesById(id)
      .then(setSpecies)
      .catch((err) => setErrorMsg(err.message || "Could not load species profile"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-500 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-nature-700" />
        <p className="text-xs font-mono">Opening natural history monograph...</p>
      </div>
    );
  }

  if (errorMsg || !species) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-rose-600 text-sm">{errorMsg || "Species not found."}</p>
        <Link
          to="/species"
          className="inline-flex items-center gap-2 text-xs font-semibold text-nature-800 underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Species Explorer</span>
        </Link>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    if (status.includes("Vulnerable") || status.includes("Threatened")) {
      return "bg-amber-100 text-amber-900 border-amber-300";
    }
    if (status.includes("Endangered")) {
      return "bg-rose-100 text-rose-900 border-rose-300";
    }
    return "bg-nature-100 text-nature-900 border-nature-300";
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <Link
        to="/species"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-nature-900 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Species Explorer</span>
      </Link>

      {/* Main Specimen Hero Card */}
      <div className="bg-white rounded-3xl border border-nature-200/80 overflow-hidden shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 items-stretch">
          {/* Specimen Photograph */}
          <div className="md:col-span-5 relative aspect-square md:aspect-auto bg-slate-900 overflow-hidden">
            {species.image_url && (
              <img
                src={(!species.image_url || species.image_url.includes('unsplash') || species.image_url.includes('example.com')) ? `/species/${species.id}.jpg` : species.image_url}
                alt={species.common_name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.endsWith(`/species/${species.id}.jpg`)) {
                    target.src = `/species/${species.id}.jpg`;
                  }
                }}
              />
            )}
            <div className="absolute top-4 left-4">
              <span
                className={`text-xs font-mono font-semibold px-3 py-1 rounded-full border shadow-sm backdrop-blur-md ${getStatusColor(
                  species.conservation_status
                )}`}
              >
                IUCN: {species.conservation_status}
              </span>
            </div>
          </div>

          {/* Core Taxonomic Identity */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-nature-700 font-semibold mb-1">
                {species.order_name} • {species.family}
              </div>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 leading-tight">
                {species.common_name}
              </h1>
              <p className="text-base italic text-slate-500 font-serif mt-1">
                {species.scientific_name}
              </p>

              <p className="text-xs sm:text-sm text-slate-600 mt-4 leading-relaxed font-sans">
                {species.description}
              </p>
            </div>

            {/* Quick action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
              <Link
                to="/identify"
                className="px-4 py-2.5 rounded-xl bg-nature-800 hover:bg-nature-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition"
              >
                <Camera className="w-4 h-4 text-nature-300" />
                <span>Identify This Species</span>
              </Link>
              <Link
                to={`/journal?species_id=${species.id}`}
                className="px-4 py-2.5 rounded-xl bg-parchment-100 hover:bg-parchment-200 text-slate-800 font-semibold text-xs flex items-center gap-2 border border-parchment-300 transition"
              >
                <BookOpen className="w-4 h-4 text-nature-700" />
                <span>Journal Records</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Structured Ecological Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Plumage & Identification Characteristics */}
        <div className="bg-white rounded-2xl p-6 border border-nature-200/80 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-nature-800 font-serif font-bold text-sm">
            <Feather className="w-4 h-4 text-nature-600" />
            <span>Field Identification Features</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {species.identification_features}
          </p>
        </div>

        {/* Ecological Role & Services */}
        <div className="bg-white rounded-2xl p-6 border border-nature-200/80 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-nature-800 font-serif font-bold text-sm">
            <Trees className="w-4 h-4 text-nature-600" />
            <span>Ecological Role & Food Web</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {species.ecological_role}
          </p>
        </div>

        {/* Dietary Strategy */}
        <div className="bg-white rounded-2xl p-6 border border-nature-200/80 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-nature-800 font-serif font-bold text-sm">
            <Utensils className="w-4 h-4 text-nature-600" />
            <span>Diet & Foraging Strategy</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">{species.diet}</p>
        </div>

        {/* Behavior & Courtship */}
        <div className="bg-white rounded-2xl p-6 border border-nature-200/80 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-nature-800 font-serif font-bold text-sm">
            <Activity className="w-4 h-4 text-nature-600" />
            <span>Behavioral Dynamics</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">{species.behavior_notes}</p>
        </div>
      </div>

      {/* Habitat & Geographic Range Banner */}
      <div className="bg-parchment-100 border border-parchment-300 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-nature-900 font-serif font-bold text-sm">
          <Globe className="w-4 h-4 text-nature-700" />
          <span>Biogeographical Range & Habitat Typology</span>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed">
          {species.geographic_distribution}
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="text-xs text-slate-500 font-mono self-center mr-1">Habitats:</span>
          {species.habitat_types.map((h) => (
            <span
              key={h}
              className="text-xs bg-white text-slate-800 px-3 py-1 rounded-lg border border-slate-200 font-medium"
            >
              {h}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
