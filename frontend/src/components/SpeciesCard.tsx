import React from "react";
import { SpeciesListItem } from "../types";
import { Link } from "react-router-dom";
import { ArrowRight, Trees } from "lucide-react";

interface Props {
  species: SpeciesListItem;
}

export const SpeciesCard: React.FC<Props> = ({ species }) => {
  const getStatusColor = (status: string) => {
    if (status.includes("Vulnerable") || status.includes("Threatened")) {
      return "bg-amber-100 text-amber-800 border-amber-200";
    }
    if (status.includes("Endangered")) {
      return "bg-rose-100 text-rose-800 border-rose-200";
    }
    return "bg-nature-100 text-nature-800 border-nature-200";
  };

  return (
    <div className="bg-white rounded-2xl border border-nature-200/80 overflow-hidden shadow-sm hover:shadow-md transition group flex flex-col">
      {/* Image container */}
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        {species.image_url ? (
          <img
            src={(!species.image_url || species.image_url.includes('unsplash') || species.image_url.includes('example.com')) ? `/species/${species.id}.jpg` : species.image_url}
            alt={species.common_name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            loading="lazy"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.src.endsWith(`/species/${species.id}.jpg`)) {
                target.src = `/species/${species.id}.jpg`;
              }
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-nature-50 text-nature-300">
            <Trees className="w-12 h-12" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span
            className={`text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full border backdrop-blur-md ${getStatusColor(
              species.conservation_status
            )}`}
          >
            {species.conservation_status.split(" ")[0]}
          </span>
        </div>
      </div>

      {/* Info Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
            {species.family}
          </div>
          <h3 className="font-serif font-bold text-lg text-slate-900 group-hover:text-nature-800 transition">
            {species.common_name}
          </h3>
          <p className="text-xs italic text-slate-500 mb-3">{species.scientific_name}</p>

          {/* Habitats */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {species.habitat_types.slice(0, 3).map((h) => (
              <span
                key={h}
                className="text-[11px] bg-parchment-100 text-slate-600 px-2 py-0.5 rounded-md font-sans border border-parchment-300"
              >
                {h}
              </span>
            ))}
            {species.habitat_types.length > 3 && (
              <span className="text-[11px] text-slate-400 px-1 py-0.5">
                +{species.habitat_types.length - 3}
              </span>
            )}
          </div>
        </div>

        <Link
          to={`/species/${species.id}`}
          className="inline-flex items-center justify-between text-xs font-semibold text-nature-700 hover:text-nature-900 pt-3 border-t border-slate-100 group-hover:translate-x-0.5 transition"
        >
          <span>Examine Natural History Profile</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Link>
      </div>
    </div>
  );
};
