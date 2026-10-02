import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import { SpeciesListItem, HabitatType } from "../types";
import { SpeciesCard } from "../components/SpeciesCard";
import { Search, Filter, Feather, Loader2 } from "lucide-react";

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

export const SpeciesExplorerPage: React.FC = () => {
  const [speciesList, setSpeciesList] = useState<SpeciesListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHabitat, setSelectedHabitat] = useState<HabitatType | "All">("All");

  useEffect(() => {
    setLoading(true);
    api
      .getSpeciesList(
        searchQuery || undefined,
        selectedHabitat === "All" ? undefined : selectedHabitat
      )
      .then(setSpeciesList)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [searchQuery, selectedHabitat]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="max-w-2xl space-y-2">
        <span className="text-xs font-mono uppercase tracking-widest text-nature-700 font-semibold">
          Natural History Compendium
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900">
          Avian Species Explorer
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Ornithological catalog of supported bird species, taxonomic hierarchies, ecological
          functions, and IUCN conservation statuses.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-nature-200/80 p-4 shadow-xs space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by common name, scientific name (e.g. Halcyon), or family..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-nature-500 focus:outline-none text-xs"
          />
        </div>

        {/* Habitat filter pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-mono text-[11px] shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>Biome / Habitat:</span>
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

      {/* Grid of Species */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-500 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-nature-700" />
          <p className="text-xs font-mono">Loading species monographs...</p>
        </div>
      ) : speciesList.length === 0 ? (
        <div className="bg-white rounded-3xl border border-nature-200/80 p-12 text-center space-y-3">
          <Feather className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-serif font-bold text-lg text-slate-800">
            No Species Matched Your Query
          </h3>
          <p className="text-xs text-slate-500">
            Try searching for a different keyword or reset the habitat filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {speciesList.map((species) => (
            <SpeciesCard key={species.id} species={species} />
          ))}
        </div>
      )}
    </div>
  );
};
