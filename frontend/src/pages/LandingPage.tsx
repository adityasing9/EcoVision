import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { ObservationStats } from "../types";
import {
  Camera,
  Feather,
  MapPin,
  BarChart3,
  BookOpen,
  ShieldCheck,
  ArrowRight,
  Compass,
  Sparkles,
  Layers,
  Leaf,
  CheckCircle2,
} from "lucide-react";

export const LandingPage: React.FC = () => {
  const [stats, setStats] = useState<ObservationStats | null>(null);

  useEffect(() => {
    api.getDashboardStats().then(setStats).catch(console.error);
  }, []);

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 bg-gradient-to-b from-parchment-100/80 via-parchment-50 to-white border-b border-nature-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-nature-100 text-nature-800 text-xs font-mono font-semibold border border-nature-200 shadow-xs">
                <Leaf className="w-3.5 h-3.5 text-nature-600" />
                <span>Environmental & Avian Biodiversity Monitoring</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-serif font-bold text-slate-900 leading-[1.15] tracking-tight">
                See. Identify. <br />
                <span className="text-nature-800 underline decoration-nature-300 decoration-wavy decoration-2">
                  Understand
                </span>{" "}
                Biodiversity.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl font-sans leading-relaxed">
                AI-assisted bird identification that transforms wildlife photographs into structured
                ecological data. Connect species sightings to habitats, population counts, and
                environmental context.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/identify"
                  className="px-6 py-3.5 rounded-2xl bg-nature-800 hover:bg-nature-700 text-white font-semibold text-sm flex items-center gap-2.5 shadow-lg shadow-nature-950/20 hover:shadow-xl transition transform active:scale-98"
                >
                  <Camera className="w-4 h-4 text-nature-300" />
                  <span>Identify a Bird Photo</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>

                <Link
                  to="/species"
                  className="px-6 py-3.5 rounded-2xl bg-white hover:bg-parchment-100 text-nature-900 border border-nature-300 font-semibold text-sm flex items-center gap-2 shadow-xs transition"
                >
                  <Compass className="w-4 h-4 text-nature-700" />
                  <span>Explore Species Catalog</span>
                </Link>
              </div>

              {/* Live Biodiversity Ticker */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200/80">
                <div>
                  <div className="font-mono text-2xl sm:text-3xl font-bold text-nature-900">
                    {stats?.total_observations ?? 28}+
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">
                    Logged Observations
                  </div>
                </div>
                <div>
                  <div className="font-mono text-2xl sm:text-3xl font-bold text-nature-900">
                    {stats?.unique_species ?? 20}
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">
                    Cataloged Species
                  </div>
                </div>
                <div>
                  <div className="font-mono text-2xl sm:text-3xl font-bold text-nature-900">
                    {stats?.total_bird_count ?? 184}
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">
                    Specimens Counted
                  </div>
                </div>
              </div>
            </div>

            {/* Right Hero Image Collage */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-900 aspect-[4/5] group">
                <img
                  src="/species/indian-peafowl.jpg"
                  alt="Indian Peafowl Specimen"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Floating Prediction Overlay Box */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/50 text-slate-800">
                  <div className="flex items-center justify-between text-xs font-mono text-nature-800 mb-1">
                    <span className="flex items-center gap-1 font-semibold">
                      <Sparkles className="w-3.5 h-3.5 text-nature-600" />
                      ResNet-50 Inference
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      94.6% Confidence
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-lg text-slate-900">
                    Indian Peafowl
                  </h3>
                  <p className="text-xs italic text-slate-500">Pavo cristatus • Galliformes</p>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-sans">
                    <span>Habitat: Forest Edge / Cultivated</span>
                    <span className="font-mono text-nature-700 font-medium">Grad-CAM Active</span>
                  </div>
                </div>
              </div>

              {/* Decorative stamp badge */}
              <div className="hidden sm:block absolute -top-4 -right-4 bg-nature-800 text-white p-3 rounded-2xl shadow-lg border-2 border-nature-600 transform rotate-6">
                <Feather className="w-6 h-6 text-nature-300" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Scientific Workflow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-nature-700 font-semibold">
            Methodology & Pipeline
          </span>
          <h2 className="text-3xl font-serif font-bold text-slate-900">
            From Bird Photograph to Ecological Intelligence
          </h2>
          <p className="text-sm text-slate-600">
            EcoVision transforms a simple photograph into a verified field observation tied to
            scientific taxonomy, habitat types, and temporal monitoring.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {[
            {
              step: "01",
              title: "Capture / Upload",
              desc: "Upload a field photo or capture directly using your mobile browser camera.",
              icon: Camera,
            },
            {
              step: "02",
              title: "PyTorch Inference",
              desc: "Pretrained ResNet-50 evaluates visual features, returning top-3 species probabilities.",
              icon: Layers,
            },
            {
              step: "03",
              title: "Scientific Enrichment",
              desc: "View IUCN threat status, ecological roles, diet, foraging habits, and Grad-CAM attention.",
              icon: Feather,
            },
            {
              step: "04",
              title: "Structured Record",
              desc: "Log coordinates, bird counts, behaviors, and environmental notes to the journal and map.",
              icon: BookOpen,
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="bg-white rounded-2xl p-6 border border-nature-200/80 shadow-xs hover:shadow-md transition relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-2xl font-black text-nature-200">
                      {item.step}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-nature-50 border border-nature-200 flex items-center justify-center text-nature-700">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="font-serif font-bold text-base text-slate-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-nature-900 text-white rounded-3xl p-8 sm:p-14 overflow-hidden relative shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-mono uppercase tracking-wider text-nature-300">
                Beyond Standard Classification
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white leading-tight">
                A Modern Field Observation Journal & Geospatial Platform
              </h2>
              <p className="text-sm text-parchment-300 leading-relaxed font-sans">
                Most ML projects stop at displaying a label. EcoVision connects classification
                to ecological context: logging habitat types, behavioral patterns (foraging,
                nesting, courtship), and GPS coordinates to build an ongoing biodiversity record.
              </p>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-nature-400 shrink-0 mt-0.5" />
                  <span>Interactive Leaflet habitat map with custom markers</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-nature-400 shrink-0 mt-0.5" />
                  <span>Real-time environmental statistics dashboard</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-nature-400 shrink-0 mt-0.5" />
                  <span>Grad-CAM visual attention explainability</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-nature-400 shrink-0 mt-0.5" />
                  <span>IUCN Red List natural-history compendium</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/map"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-nature-700 hover:bg-nature-600 text-white font-semibold text-xs transition"
                >
                  <MapPin className="w-4 h-4 text-nature-300" />
                  <span>Explore Observation Map</span>
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-nature-800/80 border border-nature-700/80 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-nature-400" />
                  <h4 className="font-serif font-bold text-sm text-white">
                    Ecological Trend Analysis
                  </h4>
                </div>
                <p className="text-xs text-parchment-300 leading-relaxed">
                  Track observation distributions across 10 distinct habitat categories — Forest,
                  Wetlands, Grasslands, Coastal, Urban, and Mountain habitats.
                </p>
              </div>

              <div className="bg-nature-800/80 border border-nature-700/80 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-nature-400" />
                  <h4 className="font-serif font-bold text-sm text-white">
                    Digital Naturalist Notebook
                  </h4>
                </div>
                <p className="text-xs text-parchment-300 leading-relaxed">
                  Filter observations by date, habitat, and observer notes. Authenticated users can
                  curate and manage their personal wildlife journals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Responsible AI Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto shadow-xs">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
          Responsible AI & Scientific Integrity
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans max-w-2xl mx-auto">
          EcoVision is designed as an assistance tool for educators, students, and amateur
          naturalists. Machine-learning models may encounter optical challenges, juvenile plumage
          variations, and dataset bias. Recorded observations represent individual recorded sightings
          and do not constitute certified ecological health proof.
        </p>
        <div>
          <Link
            to="/about"
            className="text-xs font-semibold text-nature-800 hover:text-nature-950 underline underline-offset-4"
          >
            Learn about model explainability, evaluation benchmarks, and ethical guidelines →
          </Link>
        </div>
      </section>
    </div>
  );
};
