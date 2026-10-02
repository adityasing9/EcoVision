import React from "react";
import { ShieldCheck, AlertTriangle, Eye, Database, Cpu, Compass, BookOpen } from "lucide-react";

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Title */}
      <div className="space-y-2">
        <span className="text-xs font-mono uppercase tracking-widest text-nature-700 font-semibold">
          Scientific Transparency & Ethics
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900">
          Responsible AI & Ecological Standards
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
          The guiding scientific principles, operational boundaries, and conservation ethics behind
          the EcoVision biodiversity monitoring platform.
        </p>
      </div>

      {/* Core Mission Statement Box */}
      <div className="bg-nature-900 text-white rounded-3xl p-6 sm:p-8 space-y-4 shadow-md">
        <h3 className="font-serif font-bold text-xl text-white">Project Positioning</h3>
        <blockquote className="text-xs sm:text-sm text-parchment-200 leading-relaxed italic border-l-2 border-nature-400 pl-4">
          "EcoVision is an AI-assisted biodiversity monitoring platform that identifies bird species
          from images and transforms wildlife observations into structured ecological data for
          biodiversity awareness, environmental education, and preliminary environmental
          monitoring."
        </blockquote>
      </div>

      {/* Critical Scientific Boundary: Recorded Observation != Proof */}
      <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
        <div className="flex items-center gap-2 text-amber-800 font-serif font-bold text-base">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <span>Fundamental Ecological Principle</span>
        </div>
        <div className="font-mono text-xs font-bold text-amber-950 bg-amber-100/70 p-3 rounded-xl border border-amber-300">
          Recorded Observation ≠ Scientific Proof of Ecosystem Health
        </div>
        <p className="text-xs text-amber-900 leading-relaxed">
          The presence or absence of birds in field records indicates observed occurrence within
          specific survey parameters. Comprehensive ecological assessments require multi-year
          population censuses, reproductive success metrics, and peer-reviewed biological fieldwork.
        </p>
      </div>

      {/* Responsible AI Principles */}
      <div className="space-y-6">
        <h2 className="text-2xl font-serif font-bold text-slate-900">
          AI Model Limitations & Guidance
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600">
          <div className="bg-white p-5 rounded-2xl border border-nature-200 space-y-2">
            <h4 className="font-serif font-bold text-slate-900 text-sm flex items-center gap-2">
              <Eye className="w-4 h-4 text-nature-700" />
              <span>Optical & Distance Constraints</span>
            </h4>
            <p className="leading-relaxed">
              Poor illumination, motion blur, silhouettes against bright sky, and distant crops
              significantly reduce deep-learning feature extraction accuracy. Always review
              uncertainty guidance when confidence is below 80%.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-nature-200 space-y-2">
            <h4 className="font-serif font-bold text-slate-900 text-sm flex items-center gap-2">
              <Cpu className="w-4 h-4 text-nature-700" />
              <span>Morphological Similarity & Subspecies</span>
            </h4>
            <p className="leading-relaxed">
              Females, juveniles, and non-breeding eclipse plumages can visually diverge from adult
              males. The model may generate alternative candidates that must be verified against
              regional habitat and seasonality.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-nature-200 space-y-2">
            <h4 className="font-serif font-bold text-slate-900 text-sm flex items-center gap-2">
              <Database className="w-4 h-4 text-nature-700" />
              <span>Dataset & Geographic Bias</span>
            </h4>
            <p className="leading-relaxed">
              Image classifiers inherit training distribution characteristics. EcoVision provides
              Grad-CAM attention heatmaps so field naturalists can visually inspect which plumage or
              background features triggered the classifier.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-nature-200 space-y-2">
            <h4 className="font-serif font-bold text-slate-900 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-nature-700" />
              <span>Ethical Wildlife Observation</span>
            </h4>
            <p className="leading-relaxed">
              Never use recorded bird call playback to harass breeding birds. Keep a respectful
              distance from roosts and nests. EcoVision intentionally fuzzes exact coordinates on
              public maps to protect vulnerable nesting sites.
            </p>
          </div>
        </div>
      </div>

      {/* Architecture & Engineering Stack */}
      <div className="bg-white rounded-3xl border border-nature-200/80 p-6 sm:p-8 space-y-4">
        <h2 className="text-xl font-serif font-bold text-slate-900">
          Architecture & Technology Stack
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3 bg-nature-50 rounded-xl border border-nature-100">
            <span className="text-slate-400 block mb-1">Frontend</span>
            <span className="font-bold text-nature-900">React + Vite + TS</span>
          </div>
          <div className="p-3 bg-nature-50 rounded-xl border border-nature-100">
            <span className="text-slate-400 block mb-1">Backend API</span>
            <span className="font-bold text-nature-900">FastAPI + Uvicorn</span>
          </div>
          <div className="p-3 bg-nature-50 rounded-xl border border-nature-100">
            <span className="text-slate-400 block mb-1">Deep Learning</span>
            <span className="font-bold text-nature-900">PyTorch ResNet-50</span>
          </div>
          <div className="p-3 bg-nature-50 rounded-xl border border-nature-100">
            <span className="text-slate-400 block mb-1">Database & Storage</span>
            <span className="font-bold text-nature-900">Supabase PostgreSQL</span>
          </div>
        </div>
      </div>
    </div>
  );
};
