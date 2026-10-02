import React from "react";
import { Link } from "react-router-dom";
import { Compass, ShieldCheck, Feather, Globe, BookOpen } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-nature-950 text-parchment-200 border-t border-nature-900 pt-14 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-nature-900/60">
          {/* Brand */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-nature-700 text-nature-100 flex items-center justify-center">
                <Compass className="w-4 h-4 text-nature-300" />
              </div>
              <span className="font-serif font-black text-xl text-white">EcoVision</span>
            </div>
            <p className="text-xs text-parchment-400 leading-relaxed font-sans">
              AI-assisted bird identification that transforms wildlife photographs into structured
              biodiversity observations for environmental monitoring and ecological education.
            </p>
            <div className="pt-2">
              <span className="text-[11px] font-mono bg-nature-900 text-nature-300 px-2.5 py-1 rounded border border-nature-800">
                ResNet-50 + PyTorch
              </span>
            </div>
          </div>

          {/* Core Modules */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-nature-400 mb-4 font-semibold">
              Platform Modules
            </h4>
            <ul className="space-y-2.5 text-xs text-parchment-300">
              <li>
                <Link to="/identify" className="hover:text-white transition flex items-center gap-2">
                  <Feather className="w-3.5 h-3.5 text-nature-500" />
                  <span>AI Bird Identification</span>
                </Link>
              </li>
              <li>
                <Link to="/journal" className="hover:text-white transition flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-nature-500" />
                  <span>Biodiversity Field Journal</span>
                </Link>
              </li>
              <li>
                <Link to="/map" className="hover:text-white transition flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-nature-500" />
                  <span>Geospatial Habitat Map</span>
                </Link>
              </li>
              <li>
                <Link to="/species" className="hover:text-white transition flex items-center gap-2">
                  <Compass className="w-3.5 h-3.5 text-nature-500" />
                  <span>Avian Species Explorer</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Scientific Context */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-nature-400 mb-4 font-semibold">
              Taxonomy & Standards
            </h4>
            <ul className="space-y-2.5 text-xs text-parchment-400 leading-relaxed">
              <li>
                Taxonomic classification adheres to International Ornithological Committee (IOC) &
                Clements standards.
              </li>
              <li>
                Conservation threat statuses benchmarked against the{" "}
                <strong className="text-parchment-200">IUCN Red List of Threatened Species</strong>.
              </li>
              <li>
                Geospatial coordinates rendered using open-source OpenStreetMap and Leaflet mapping layers.
              </li>
            </ul>
          </div>

          {/* Responsible AI Disclaimer */}
          <div>
            <div className="bg-nature-900/60 border border-nature-800 p-4 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Responsible AI Note</span>
              </div>
              <p className="text-[11px] text-parchment-400 leading-relaxed">
                EcoVision is a decision-support and biodiversity recording tool. AI predictions should
                be cross-referenced with plumage traits, vocalizations, and local seasonal ranges.
                Recorded observation ≠ certified proof of ecosystem health.
              </p>
              <Link
                to="/about"
                className="text-[11px] text-nature-300 hover:text-white underline inline-block pt-1 font-medium"
              >
                Read AI Transparency Statement →
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-parchment-500">
          <div>
            © {new Date().getFullYear()} EcoVision Environmental Monitoring Platform. Open scientific architecture.
          </div>
          <div className="font-mono text-[11px] text-nature-400">
            PostgreSQL • Supabase • PyTorch • Leaflet
          </div>
        </div>
      </div>
    </footer>
  );
};
