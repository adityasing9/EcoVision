import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { api } from "../services/api";
import { MapMarkerPoint, HabitatType } from "../types";
import { MapPin, Filter, Layers, Info, Shield, Loader2 } from "lucide-react";

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

const HABITAT_COLORS: Record<string, string> = {
  Forest: "#15803d",
  Wetland: "#0284c7",
  Grassland: "#65a30d",
  Agricultural: "#d97706",
  Urban: "#64748b",
  Coastal: "#0d9488",
  "River/Lake": "#2563eb",
  Mountain: "#78716c",
  Garden: "#16a34a",
  Other: "#475569",
};

export const MapPage: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [points, setPoints] = useState<MapMarkerPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHabitat, setSelectedHabitat] = useState<HabitatType | "All">("All");

  // Fetch points from backend
  const loadPoints = async () => {
    setLoading(true);
    try {
      const data = await api.getMapPoints(
        selectedHabitat === "All" ? undefined : selectedHabitat
      );
      setPoints(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPoints();
  }, [selectedHabitat]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Prevent duplicate maps

    // Default center over central Indian Subcontinent
    const map = L.map(mapContainerRef.current, {
      center: [22.5937, 78.9629],
      zoom: 5,
      zoomControl: true,
    });

    // OpenStreetMap CartoDB Positron / Standard tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers when points change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    if (points.length === 0) return;

    const bounds = L.latLngBounds([]);

    points.forEach((pt) => {
      const color = HABITAT_COLORS[pt.habitat] || "#15803d";

      // Custom SVG Leaflet Pin
      const customIcon = L.divIcon({
        className: "custom-marker-icon",
        html: `
          <div style="
            background-color: ${color};
            width: 32px;
            height: 32px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            border: 2px solid white;
          ">
            <span style="
              transform: rotate(45deg);
              color: white;
              font-size: 11px;
              font-family: monospace;
              font-weight: bold;
            ">${pt.bird_count}</span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([pt.latitude, pt.longitude], { icon: customIcon });

      const popupHtml = `
        <div style="font-family: sans-serif; max-width: 240px; padding: 4px;">
          <img src="${pt.image_url}" alt="${pt.species_name}" style="width: 100%; height: 110px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-size: 10px; font-weight: bold; background: ${color}20; color: ${color}; padding: 2px 6px; border-radius: 4px;">
              ${pt.habitat}
            </span>
            <span style="font-size: 10px; color: #64748b; font-family: monospace;">
              ${pt.confidence}% Conf
            </span>
          </div>
          <h4 style="font-weight: bold; font-size: 14px; margin: 0 0 2px 0; color: #0f172a;">${pt.species_name}</h4>
          <p style="font-size: 11px; color: #475569; margin: 0 0 4px 0;">📍 ${pt.location_name}</p>
          <div style="font-size: 10px; color: #64748b; display: flex; justify-content: space-between; border-top: 1px solid #e2e8f0; padding-top: 4px; margin-top: 4px;">
            <span>Count: <strong>${pt.bird_count}</strong></span>
            <span>${pt.behavior}</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      markersLayerRef.current?.addLayer(marker);
      bounds.extend([pt.latitude, pt.longitude]);
    });

    if (points.length > 0 && mapInstanceRef.current) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [points]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-mono uppercase tracking-widest text-nature-700 font-semibold">
            Geospatial Distribution
          </span>
          <h1 className="text-3xl font-serif font-bold text-slate-900">
            Interactive Biodiversity Map
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Geolocated observation markers filtered by ecological habitat classification.
          </p>
        </div>

        {/* Privacy Note */}
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200 px-3.5 py-2 rounded-xl self-start sm:self-auto">
          <Shield className="w-4 h-4 text-nature-700" />
          <span>Coordinates blurred to protect sensitive nesting sites</span>
        </div>
      </div>

      {/* Habitat Filter Bar */}
      <div className="bg-white rounded-2xl border border-nature-200/80 p-3 shadow-xs flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-slate-400 font-mono text-[11px] shrink-0 mr-1 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter Habitat:</span>
        </span>
        {HABITATS.map((h) => (
          <button
            key={h}
            onClick={() => setSelectedHabitat(h)}
            className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
              selectedHabitat === h
                ? "bg-nature-800 text-white font-semibold shadow-xs"
                : "bg-parchment-100 text-slate-600 hover:bg-parchment-200 border border-parchment-300"
            }`}
          >
            {h !== "All" && (
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: HABITAT_COLORS[h] || "#15803d" }}
              />
            )}
            <span>{h}</span>
          </button>
        ))}
      </div>

      {/* Map Card */}
      <div className="bg-white rounded-3xl border border-nature-200/80 p-2 shadow-md relative overflow-hidden">
        {loading && (
          <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-nature-200 text-xs text-nature-800 font-mono flex items-center gap-2 shadow-sm">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Updating markers...</span>
          </div>
        )}

        <div
          ref={mapContainerRef}
          className="w-full h-[580px] rounded-2xl overflow-hidden bg-parchment-100 z-10"
        />

        {/* Map Legend Overlay */}
        <div className="p-4 bg-parchment-50 border-t border-slate-100 rounded-b-2xl flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-mono text-slate-500 font-semibold">Habitat Legend:</span>
            {["Forest", "Wetland", "Coastal", "Urban", "Mountain", "Garden"].map((hab) => (
              <div key={hab} className="flex items-center gap-1.5 text-slate-600">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: HABITAT_COLORS[hab] }}
                />
                <span>{hab}</span>
              </div>
            ))}
          </div>

          <div className="text-[11px] text-slate-400 font-mono">
            Showing {points.length} verified observation locations
          </div>
        </div>
      </div>
    </div>
  );
};
