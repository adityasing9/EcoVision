import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import { Observation, HabitatType } from "../types";
import { ObservationDetailModal } from "../components/ObservationDetailModal";
import {
  BookOpen,
  Search,
  Filter,
  Calendar,
  MapPin,
  LayoutGrid,
  List as ListIcon,
  Trash2,
  Eye,
  Loader2,
  Leaf,
  Plus,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const HABITATS: (HabitatType | "All")[] = [
  "All",
  "Forest",
  "Wetland",
  "Grassland",
  "Agricultural",
  "Urban",
  "Coastal",
  "River/Lake",
  "Mountain",
  "Garden",
];

const REMOVED_SPECIES_NAMES = [
  "Peregrine Falcon",
  "Greater Flamingo",
  "Rose-ringed Parakeet",
  "Common Kingfisher",
];

const getObservationImageSrc = (obs: Observation): string => {
  const url = (obs.image_url || "").trim();
  const isObsolete =
    !url ||
    url.includes("unsplash.com") ||
    url.includes("example.com") ||
    url.includes("peregrine-falcon") ||
    url.includes("greater-flamingo") ||
    url.includes("rose-ringed-parakeet") ||
    url.includes("common-kingfisher");

  if (isObsolete) {
    return obs.species_id ? `/species/${obs.species_id}.jpg` : "/species/indian-peafowl.jpg";
  }
  return url;
};

export const JournalPage: React.FC = () => {
  const { user } = useAuth();
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHabitat, setSelectedHabitat] = useState<HabitatType | "All">("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeModalObs, setActiveModalObs] = useState<Observation | null>(null);
  const [filterUserOnly, setFilterUserOnly] = useState(false);

  const fetchObservations = async () => {
    setLoading(true);
    try {
      const data = await api.getObservations({
        habitat: selectedHabitat === "All" ? undefined : selectedHabitat,
        user_only: filterUserOnly,
      });
      setObservations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchObservations();
  }, [selectedHabitat, filterUserOnly]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to remove this observation record?")) return;
    try {
      await api.deleteObservation(id);
      setObservations((prev) => prev.filter((o) => o.id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete record");
    }
  };

  const filteredObservations = observations.filter((obs) => {
    if (REMOVED_SPECIES_NAMES.includes(obs.predicted_species)) {
      return false;
    }
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      obs.predicted_species.toLowerCase().includes(q) ||
      obs.location_name.toLowerCase().includes(q) ||
      (obs.environmental_notes && obs.environmental_notes.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-mono uppercase tracking-widest text-nature-700 font-semibold">
            Digital Field Notebook
          </span>
          <h1 className="text-3xl font-serif font-bold text-slate-900">
            Biodiversity Field Journal
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Archived avian sightings, behavioral data, and environmental notes.
          </p>
        </div>

        <Link
          to="/identify"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-nature-800 hover:bg-nature-700 text-white font-semibold text-xs shadow-sm transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-nature-300" />
          <span>New Bird Observation</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-nature-200/80 p-4 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by species name, location, or field notes..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-nature-500 focus:outline-none text-xs"
            />
          </div>

          {/* Controls: User Toggle & View Mode */}
          <div className="flex items-center gap-3">
            {user && (
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterUserOnly}
                  onChange={(e) => setFilterUserOnly(e.target.checked)}
                  className="rounded text-nature-700 focus:ring-nature-500"
                />
                <span>My Observations Only</span>
              </label>
            )}

            <div className="border-l border-slate-200 pl-3 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === "grid"
                    ? "bg-nature-100 text-nature-800"
                    : "text-slate-400 hover:text-slate-600"
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === "list"
                    ? "bg-nature-100 text-nature-800"
                    : "text-slate-400 hover:text-slate-600"
                }`}
                title="List View"
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Habitat filter pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-mono text-[11px] shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>Habitat:</span>
          </span>
          {HABITATS.map((h) => (
            <button
              key={h}
              onClick={() => setSelectedHabitat(h)}
              className={`px-3 py-1 rounded-full font-medium whitespace-nowrap transition ${
                selectedHabitat === h
                  ? "bg-nature-800 text-white font-semibold shadow-xs"
                  : "bg-parchment-100 text-slate-600 hover:bg-parchment-200 border border-parchment-300"
              }`}
            >
              {h}
            </button>
          ))}
        </div>
      </div>

      {/* Observation Feed */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-500 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-nature-700" />
          <p className="text-xs font-mono">Loading field journal records...</p>
        </div>
      ) : filteredObservations.length === 0 ? (
        <div className="bg-white rounded-3xl border border-nature-200/80 p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-nature-50 border border-nature-200 flex items-center justify-center text-nature-700 mx-auto">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="font-serif font-bold text-lg text-slate-900">
            No Observation Records Found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search filters, or upload a bird photograph to record the first
            observation.
          </p>
          <Link
            to="/identify"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-nature-800 text-white text-xs font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Add Observation</span>
          </Link>
        </div>
      ) : viewMode === "grid" ? (
        /* Grid Layout */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredObservations.map((obs) => (
            <div
              key={obs.id}
              onClick={() => setActiveModalObs(obs)}
              className="bg-white rounded-2xl border border-nature-200/80 overflow-hidden shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="relative aspect-[16/10] bg-slate-900 overflow-hidden">
                  <img
                    src={getObservationImageSrc(obs)}
                    alt={obs.predicted_species}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.currentTarget;
                      const fallback = obs.species_id ? `/species/${obs.species_id}.jpg` : '/species/indian-peafowl.jpg';
                      if (!target.src.endsWith(fallback)) {
                        target.src = fallback;
                      }
                    }}
                  />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className="text-[11px] font-mono bg-nature-900/80 backdrop-blur-md text-white px-2 py-0.5 rounded-full">
                      {obs.habitat}
                    </span>
                    {obs.is_demo && (
                      <span className="text-[11px] font-mono bg-amber-600/80 backdrop-blur-md text-white px-2 py-0.5 rounded-full">
                        Demo
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-3 right-3 text-[11px] font-mono bg-black/60 backdrop-blur-md text-nature-300 px-2 py-0.5 rounded-md">
                    {obs.prediction_confidence}% Conf
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-nature-600" />
                      {new Date(obs.observed_at).toLocaleDateString()}
                    </span>
                    <span>
                      {obs.bird_count} bird{obs.bird_count > 1 ? "s" : ""} • {obs.behavior}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-lg text-slate-900 group-hover:text-nature-800 transition">
                    {obs.predicted_species}
                  </h3>

                  <div className="flex items-center gap-1 text-xs text-slate-500 truncate">
                    <MapPin className="w-3.5 h-3.5 text-nature-700 shrink-0" />
                    <span className="truncate">{obs.location_name}</span>
                  </div>

                  {obs.environmental_notes && (
                    <p className="text-xs text-slate-600 line-clamp-2 italic pt-1 border-t border-slate-100">
                      "{obs.environmental_notes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-nature-700 font-semibold group-hover:underline flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Specimen</span>
                </span>

                {user && obs.user_id === user.id && (
                  <button
                    type="button"
                    onClick={(e) => handleDelete(obs.id, e)}
                    className="text-slate-400 hover:text-rose-600 p-1 transition"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List Layout */
        <div className="bg-white rounded-2xl border border-nature-200/80 divide-y divide-slate-100 overflow-hidden shadow-xs">
          {filteredObservations.map((obs) => (
            <div
              key={obs.id}
              onClick={() => setActiveModalObs(obs)}
              className="p-4 hover:bg-nature-50/50 transition flex items-center gap-4 cursor-pointer"
            >
              <img
                src={getObservationImageSrc(obs)}
                alt={obs.predicted_species}
                className="w-16 h-16 rounded-xl object-cover shrink-0"
                onError={(e) => {
                  const target = e.currentTarget;
                  const fallback = obs.species_id ? `/species/${obs.species_id}.jpg` : '/species/indian-peafowl.jpg';
                  if (!target.src.endsWith(fallback)) {
                    target.src = fallback;
                  }
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className="font-serif font-bold text-base text-slate-900 truncate">
                    {obs.predicted_species}
                  </h4>
                  <span className="text-[11px] font-mono bg-nature-100 text-nature-800 px-2 py-0.2 rounded">
                    {obs.habitat}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-nature-700" />
                    <span>{obs.location_name}</span>
                  </span>
                  <span>
                    Count: {obs.bird_count} • {obs.behavior}
                  </span>
                  <span>{new Date(obs.observed_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="font-mono text-xs font-bold text-nature-800 block">
                  {obs.prediction_confidence}%
                </span>
                <span className="text-[11px] text-slate-400">Confidence</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Observation Detail Modal */}
      <ObservationDetailModal
        observation={activeModalObs}
        onClose={() => setActiveModalObs(null)}
      />
    </div>
  );
};
