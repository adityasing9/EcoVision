import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import { ObservationStats } from "../types";
import {
  BarChart3,
  Trees,
  Feather,
  Compass,
  Calendar,
  Layers,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<ObservationStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getDashboardStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-500 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-nature-700" />
        <p className="text-xs font-mono">Aggregating biodiversity analytics...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500">
        Could not retrieve dashboard statistics.
      </div>
    );
  }

  const habitatEntries = Object.entries(stats.habitat_distribution);
  const maxHabitatCount = Math.max(...habitatEntries.map(([_, v]) => v), 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Title Header */}
      <div className="space-y-1">
        <span className="text-xs font-mono uppercase tracking-widest text-nature-700 font-semibold">
          Ecological Data & Observation Trends
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900">
          Biodiversity Analytics Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Descriptive patterns across recorded sightings, habitat associations, and confidence metrics.
        </p>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl p-6 border border-nature-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Sightings</span>
            <div className="p-2 rounded-xl bg-nature-50 text-nature-700">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-mono text-3xl font-bold text-nature-950">
              {stats.total_observations}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Archived field records</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-nature-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Distinct Species</span>
            <div className="p-2 rounded-xl bg-nature-50 text-nature-700">
              <Feather className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-mono text-3xl font-bold text-nature-950">
              {stats.unique_species}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Avian taxa observed</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-nature-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Specimen Individuals</span>
            <div className="p-2 rounded-xl bg-nature-50 text-nature-700">
              <Trees className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-mono text-3xl font-bold text-nature-950">
              {stats.total_bird_count}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Total birds tallied</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-nature-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Habitats Surveyed</span>
            <div className="p-2 rounded-xl bg-nature-50 text-nature-700">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-mono text-3xl font-bold text-nature-950">
              {habitatEntries.length}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Ecological zones</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Habitat Distribution & Most Observed Species */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Habitat Breakdown Chart */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-nature-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-lg text-slate-900">
                Habitat Distribution
              </h3>
              <p className="text-xs text-slate-500">
                Observation frequency across distinct environmental biomes
              </p>
            </div>
            <span className="text-xs font-mono bg-nature-100 text-nature-800 px-2.5 py-1 rounded-full">
              Field Counts
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {habitatEntries.map(([hab, count]) => {
              const pct = Math.round((count / stats.total_observations) * 100);
              const barWidth = Math.round((count / maxHabitatCount) * 100);
              return (
                <div key={hab} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-700">{hab}</span>
                    <span className="font-mono text-slate-500">
                      {count} records ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-nature-700 h-full rounded-full transition-all duration-700"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Top Species Recorded */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-nature-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h3 className="font-serif font-bold text-lg text-slate-900">
              Most Recorded Species
            </h3>
            <p className="text-xs text-slate-500">
              Species with highest individual specimen counts in dataset
            </p>
          </div>

          <div className="space-y-3">
            {stats.most_observed_species.map((sp, idx) => (
              <div
                key={sp.species}
                className="p-3.5 rounded-2xl bg-parchment-50 border border-parchment-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-nature-600 w-5">
                    0{idx + 1}
                  </span>
                  <div>
                    <h4 className="font-semibold text-xs text-slate-900">{sp.species}</h4>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs font-bold text-nature-900 block">
                    {sp.count}
                  </span>
                  <span className="text-[10px] text-slate-400">specimens</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Model Confidence & Timeline Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Model Confidence Calibration */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-nature-200/80 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-nature-700" />
            <h3 className="font-serif font-bold text-base text-slate-900">
              AI Confidence Distribution
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Categorization of model predictions into standardized certainty tiers.
          </p>

          <div className="space-y-3 pt-2">
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-emerald-950">Likely identified (≥80%)</span>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-800">
                {stats.confidence_distribution["High"] || 0}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="font-semibold text-amber-950">Possible identification (50-79%)</span>
              </div>
              <span className="font-mono text-xs font-bold text-amber-800">
                {stats.confidence_distribution["Medium"] || 0}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <HelpCircle className="w-4 h-4 text-rose-600" />
                <span className="font-semibold text-rose-950">Identification uncertain (&lt;50%)</span>
              </div>
              <span className="font-mono text-xs font-bold text-rose-800">
                {stats.confidence_distribution["Low"] || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Environmental Insights Section (Section 26 requirement) */}
        <div className="lg:col-span-7 bg-nature-900 text-white rounded-3xl p-6 sm:p-8 shadow-md space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-nature-300" />
            <h3 className="font-serif font-bold text-lg text-white">
              Recorded Observation Patterns
            </h3>
          </div>

          <div className="space-y-3 text-xs text-parchment-300 leading-relaxed font-sans">
            <p>
              • <strong>Dominant Habitat Correlation:</strong> Observations within this dataset are
              concentrated most heavily in{" "}
              <strong className="text-white">
                {habitatEntries[0] ? habitatEntries[0][0] : "Wetland"}
              </strong>{" "}
              habitats, reflecting field observer survey bias towards riparian and coastal zones.
            </p>
            <p>
              • <strong>Species Frequency Pattern:</strong>{" "}
              <strong className="text-white">
                {stats.most_observed_species[0]?.species || "Indian Peafowl"}
              </strong>{" "}
              constitutes the most documented species record, consistent with high visual
              distinctiveness and suburban habitat adaptability.
            </p>
            <p>
              • <strong>Ecological Methodological Notice:</strong> Recorded observation patterns
              reflect observer access and sampling intensity rather than comprehensive biological
              censuses of actual regional avian populations.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/journal"
              className="text-xs text-nature-300 hover:text-white underline inline-block"
            >
              Review all raw specimen notes in Field Journal →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
