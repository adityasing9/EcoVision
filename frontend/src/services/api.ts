import {
  PredictionResult,
  SpeciesListItem,
  Species,
  Observation,
  ObservationCreatePayload,
  ObservationStats,
  MapMarkerPoint,
  BirdBehavior,
  HabitatType,
} from "../types";
import { supabase } from "./supabase";
import { LOCAL_SPECIES_CATALOG } from "./catalogData";
import { runClientInference } from "./clientInference";

// Intelligent backend detection:
// In production without an active custom backend or if pointing to an unhosted domain, default to direct Supabase / Web ML architecture
const rawApiUrl = (import.meta.env.VITE_API_URL || "").trim();
const isProd = import.meta.env.PROD;
const isRenderDeadUrl = rawApiUrl.includes("ecovision-backend.onrender.com");

const API_BASE = (isProd && (isRenderDeadUrl || !rawApiUrl))
  ? ""
  : rawApiUrl || (isProd ? "" : "http://localhost:8000");

// Track backend availability to prevent spamming unreachable hosts
let backendOnline: boolean = Boolean(API_BASE);

// Fallback demo observations matching the database seeds
const FALLBACK_DEMO_OBSERVATIONS: Observation[] = [
  {
    id: "demo-peafowl-1",
    species_id: "indian-peafowl",
    predicted_species: "Indian Peafowl",
    prediction_confidence: 94.6,
    image_url: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80",
    latitude: 28.5983,
    longitude: 77.2189,
    location_name: "Lodhi Gardens, New Delhi",
    habitat: "Garden",
    observed_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    bird_count: 2,
    behavior: "Courtship Display",
    environmental_notes: "Two adult males observed fanning full trains near ancient monument garden foliage during overcast monsoon morning.",
    weather_conditions: "Overcast, 28°C, 78% humidity",
    is_demo: true,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    species: LOCAL_SPECIES_CATALOG["indian-peafowl"],
  },
  {
    id: "demo-kingfisher-1",
    species_id: "white-throated-kingfisher",
    predicted_species: "White-throated Kingfisher",
    prediction_confidence: 91.2,
    image_url: "https://images.unsplash.com/photo-1520808663317-647b476a81b9?auto=format&fit=crop&w=1200&q=80",
    latitude: 28.6139,
    longitude: 77.3105,
    location_name: "Yamuna Biodiversity Park, Delhi",
    habitat: "Wetland",
    observed_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    bird_count: 1,
    behavior: "Perching",
    environmental_notes: "Perched on dead acacia branch scanning water margin; dove once successfully catching small freshwater prawn.",
    weather_conditions: "Clear, 24°C, low wind",
    is_demo: true,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    species: LOCAL_SPECIES_CATALOG["white-throated-kingfisher"],
  },
  {
    id: "demo-hornbill-1",
    species_id: "great-hornbill",
    predicted_species: "Great Hornbill",
    prediction_confidence: 88.5,
    image_url: "https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=1200&q=80",
    latitude: 10.3245,
    longitude: 76.9532,
    location_name: "Anamalai Tiger Reserve, Western Ghats",
    habitat: "Forest",
    observed_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    bird_count: 2,
    behavior: "Foraging",
    environmental_notes: "Pair feeding on mature Ficus virens canopy figs. Heavy audible wingbeats echoing across primary evergreen valley.",
    weather_conditions: "Mist/fog, 19°C, humid",
    is_demo: true,
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    species: LOCAL_SPECIES_CATALOG["great-hornbill"],
  },
  {
    id: "demo-falcon-1",
    species_id: "peregrine-falcon",
    predicted_species: "Peregrine Falcon",
    prediction_confidence: 93.8,
    image_url: "https://images.unsplash.com/photo-1606567595334-d39972c85dbe?auto=format&fit=crop&w=1200&q=80",
    latitude: 30.3165,
    longitude: 78.0322,
    location_name: "Mussoorie Ridge Cliffs",
    habitat: "Mountain",
    observed_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    bird_count: 1,
    behavior: "Flying",
    environmental_notes: "High-altitude hunting patrol over mountain gorge; stooped dramatically towards flock of rock pigeons.",
    weather_conditions: "Breezy, 16°C, clear skies",
    is_demo: true,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    species: LOCAL_SPECIES_CATALOG["peregrine-falcon"],
  },
  {
    id: "demo-flamingo-1",
    species_id: "greater-flamingo",
    predicted_species: "Greater Flamingo",
    prediction_confidence: 96.2,
    image_url: "https://images.unsplash.com/photo-1539664030485-a936c7d29c6e?auto=format&fit=crop&w=1200&q=80",
    latitude: 19.0178,
    longitude: 72.8478,
    location_name: "Thane Creek Flamingo Sanctuary, Mumbai",
    habitat: "Coastal",
    observed_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    bird_count: 140,
    behavior: "Foraging",
    environmental_notes: "Dense congregation filter-feeding in shallow hypersaline mudflat at low tide. Vibrant pink wash visible across the bay.",
    weather_conditions: "Sunny, 31°C, light sea breeze",
    is_demo: true,
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    species: LOCAL_SPECIES_CATALOG["greater-flamingo"],
  },
  {
    id: "demo-crane-1",
    species_id: "sarus-crane",
    predicted_species: "Sarus Crane",
    prediction_confidence: 89.4,
    image_url: "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&w=1200&q=80",
    latitude: 27.1594,
    longitude: 77.5201,
    location_name: "Keoladeo National Park, Bharatpur",
    habitat: "Wetland",
    observed_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    bird_count: 2,
    behavior: "Calling / Vocalizing",
    environmental_notes: "Monogamous pair calling in unison duet across marshland; standing tall amidst water lily pads.",
    weather_conditions: "Hazy sunrise, 20°C, calm",
    is_demo: true,
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    species: LOCAL_SPECIES_CATALOG["sarus-crane"],
  },
  {
    id: "demo-flameback-1",
    species_id: "black-rumped-flameback",
    predicted_species: "Black-rumped Flameback",
    prediction_confidence: 92.1,
    image_url: "https://images.unsplash.com/photo-1590691566903-692bf52c5888?auto=format&fit=crop&w=1200&q=80",
    latitude: 12.9716,
    longitude: 77.5946,
    location_name: "Cubbon Park, Bengaluru",
    habitat: "Urban",
    observed_at: new Date(Date.now() - 86400000 * 8).toISOString(),
    bird_count: 1,
    behavior: "Foraging",
    environmental_notes: "Tapping rhythmic bursts on ancient silver oak trunk, extracting beetle grubs. Whinnying call heard every few minutes.",
    weather_conditions: "Pleasant, 23°C",
    is_demo: true,
    created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
    species: LOCAL_SPECIES_CATALOG["black-rumped-flameback"],
  },
  {
    id: "demo-sunbird-1",
    species_id: "purple-sunbird",
    predicted_species: "Purple Sunbird",
    prediction_confidence: 95.0,
    image_url: "https://images.unsplash.com/photo-1591824438708-ce405f36ba3d?auto=format&fit=crop&w=1200&q=80",
    latitude: 18.5204,
    longitude: 73.8567,
    location_name: "Pune University Botanical Garden",
    habitat: "Garden",
    observed_at: new Date(Date.now() - 86400000 * 9).toISOString(),
    bird_count: 3,
    behavior: "Foraging",
    environmental_notes: "Breeding plumage male actively probing coral tree (Erythrina) blooms alongside two females.",
    weather_conditions: "Warm, 27°C, low wind",
    is_demo: true,
    created_at: new Date(Date.now() - 86400000 * 9).toISOString(),
    species: LOCAL_SPECIES_CATALOG["purple-sunbird"],
  },
];

async function getAuthHeader(): Promise<Record<string, string>> {
  try {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
  } catch {
    // Ignore auth lookup errors
  }
  return {};
}

/** Helper to race fetch with a timeout */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs: number = 3000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return res;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

function getStoredLocalObservations(): Observation[] {
  try {
    const raw = localStorage.getItem("ecovision_local_observations");
    if (raw) return JSON.parse(raw);
  } catch {
    // Ignore localStorage parse errors
  }
  return [];
}

function saveLocalObservation(obs: Observation): void {
  try {
    const list = getStoredLocalObservations();
    list.unshift(obs);
    localStorage.setItem("ecovision_local_observations", JSON.stringify(list));
  } catch {
    // Ignore localStorage write errors
  }
}

export const api = {
  // 1. AI Inference
  async predictBird(file: File, includeGradcam: boolean = true): Promise<PredictionResult> {
    if (backendOnline && API_BASE) {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetchWithTimeout(
          `${API_BASE}/api/predict?include_gradcam=${includeGradcam}`,
          {
            method: "POST",
            body: formData,
          },
          4000
        );

        if (res.ok) {
          return await res.json();
        } else {
          backendOnline = false;
        }
      } catch {
        backendOnline = false;
      }
    }

    // High fidelity browser inference fallback with Grad-CAM and calibrated confidence
    return await runClientInference(file, includeGradcam);
  },

  // 2. Image Upload
  async uploadImage(file: File): Promise<string> {
    if (backendOnline && API_BASE) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const headers = await getAuthHeader();

        const res = await fetchWithTimeout(
          `${API_BASE}/api/observations/upload-image`,
          {
            method: "POST",
            headers,
            body: formData,
          },
          3000
        );

        if (res.ok) {
          const data = await res.json();
          return data.image_url;
        } else {
          backendOnline = false;
        }
      } catch {
        backendOnline = false;
      }
    }

    // Direct Supabase storage upload
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9]/g, "_");
      const filePath = `uploads/${Date.now()}_${cleanFileName}.${ext}`;

      const { data, error } = await supabase.storage
        .from("bird-observations")
        .upload(filePath, file, {
          contentType: file.type || "image/jpeg",
          upsert: true,
        });

      if (!error && data) {
        const { data: pubData } = supabase.storage
          .from("bird-observations")
          .getPublicUrl(filePath);
        if (pubData?.publicUrl) {
          return pubData.publicUrl;
        }
      }
    } catch {
      // Supabase storage unreachable
    }

    // Direct data URL fallback (ensures offline and mobile users never experience image upload failure)
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  },

  // 3. Observations CRUD
  async createObservation(payload: ObservationCreatePayload): Promise<Observation> {
    if (backendOnline && API_BASE) {
      try {
        const headers = {
          "Content-Type": "application/json",
          ...(await getAuthHeader()),
        };

        const res = await fetchWithTimeout(
          `${API_BASE}/api/observations`,
          {
            method: "POST",
            headers,
            body: JSON.stringify(payload),
          },
          3500
        );

        if (res.ok) {
          return await res.json();
        } else {
          backendOnline = false;
        }
      } catch {
        backendOnline = false;
      }
    }

    // Direct Supabase database insert
    try {
      const { data: authData } = await supabase.auth.getSession();
      const user = authData.session?.user;

      const recordToInsert = {
        species_id: payload.species_id || null,
        predicted_species: payload.predicted_species,
        prediction_confidence: payload.prediction_confidence,
        top_predictions: payload.top_predictions || null,
        image_url: payload.image_url,
        latitude: payload.latitude ?? null,
        longitude: payload.longitude ?? null,
        location_name: payload.location_name,
        habitat: payload.habitat,
        observed_at: payload.observed_at || new Date().toISOString(),
        bird_count: payload.bird_count,
        behavior: payload.behavior,
        environmental_notes: payload.environmental_notes || null,
        weather_conditions: payload.weather_conditions || null,
        is_demo: payload.is_demo ?? false,
        user_id: user?.id || null,
        user_email: user?.email || null,
      };

      const { data, error } = await supabase
        .from("observations")
        .insert([recordToInsert])
        .select()
        .single();

      if (!error && data) {
        const obs: Observation = {
          ...data,
          species: data.species_id ? LOCAL_SPECIES_CATALOG[data.species_id] : undefined,
        };
        saveLocalObservation(obs);
        return obs;
      }
    } catch {
      // Direct Supabase insert failed
    }

    // Local in-memory / localStorage fallback
    const localId = `local-${Date.now()}`;
    const localObs: Observation = {
      id: localId,
      species_id: payload.species_id,
      predicted_species: payload.predicted_species,
      prediction_confidence: payload.prediction_confidence,
      top_predictions: payload.top_predictions,
      image_url: payload.image_url,
      latitude: payload.latitude,
      longitude: payload.longitude,
      location_name: payload.location_name,
      habitat: payload.habitat,
      observed_at: payload.observed_at || new Date().toISOString(),
      bird_count: payload.bird_count,
      behavior: payload.behavior,
      environmental_notes: payload.environmental_notes,
      weather_conditions: payload.weather_conditions,
      is_demo: payload.is_demo ?? false,
      created_at: new Date().toISOString(),
      species: payload.species_id ? LOCAL_SPECIES_CATALOG[payload.species_id] : undefined,
    };
    saveLocalObservation(localObs);
    return localObs;
  },

  async getObservations(params?: {
    habitat?: string;
    species_id?: string;
    user_only?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Observation[]> {
    if (backendOnline && API_BASE) {
      try {
        const query = new URLSearchParams();
        if (params?.habitat) query.append("habitat", params.habitat);
        if (params?.species_id) query.append("species_id", params.species_id);
        if (params?.user_only) query.append("user_only", "true");
        if (params?.limit) query.append("limit", params.limit.toString());
        if (params?.offset) query.append("offset", params.offset.toString());

        const headers = await getAuthHeader();
        const res = await fetchWithTimeout(`${API_BASE}/api/observations?${query.toString()}`, {
          headers,
        }, 3000);

        if (res.ok) {
          return await res.json();
        } else {
          backendOnline = false;
        }
      } catch {
        backendOnline = false;
      }
    }

    // Query Supabase directly
    try {
      let query = supabase
        .from("observations")
        .select("*")
        .order("observed_at", { ascending: false });

      if (params?.species_id) {
        query = query.eq("species_id", params.species_id);
      }
      if (params?.habitat) {
        query = query.eq("habitat", params.habitat);
      }
      if (params?.limit) {
        query = query.limit(params.limit);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        const mapped = data.map((item) => ({
          ...item,
          species: item.species_id ? LOCAL_SPECIES_CATALOG[item.species_id] : undefined,
        }));

        // Merge any locally logged observations
        const localList = getStoredLocalObservations();
        const merged = [...localList.filter(l => !mapped.some(m => m.id === l.id)), ...mapped];
        return merged;
      }
    } catch {
      // Supabase query failed
    }

    // Return combined local storage + seeded demo observations
    let fallback = [...getStoredLocalObservations(), ...FALLBACK_DEMO_OBSERVATIONS];
    if (params?.species_id) {
      fallback = fallback.filter((o) => o.species_id === params.species_id);
    }
    if (params?.habitat) {
      fallback = fallback.filter((o) => o.habitat === params.habitat);
    }
    return fallback;
  },

  async getObservationById(id: string): Promise<Observation> {
    if (backendOnline && API_BASE) {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/api/observations/${id}`, {}, 2500);
        if (res.ok) {
          return await res.json();
        } else {
          backendOnline = false;
        }
      } catch {
        backendOnline = false;
      }
    }

    try {
      const { data, error } = await supabase
        .from("observations")
        .select("*")
        .eq("id", id)
        .single();
      if (!error && data) {
        return {
          ...data,
          species: data.species_id ? LOCAL_SPECIES_CATALOG[data.species_id] : undefined,
        };
      }
    } catch {
      // Fallback
    }

    const localMatch = getStoredLocalObservations().find((o) => o.id === id);
    if (localMatch) return localMatch;

    const demoMatch = FALLBACK_DEMO_OBSERVATIONS.find((o) => o.id === id);
    if (demoMatch) return demoMatch;

    throw new Error("Observation record not found");
  },

  async deleteObservation(id: string): Promise<void> {
    if (backendOnline && API_BASE) {
      try {
        const headers = await getAuthHeader();
        await fetchWithTimeout(`${API_BASE}/api/observations/${id}`, {
          method: "DELETE",
          headers,
        }, 2500);
      } catch {
        backendOnline = false;
      }
    }

    try {
      await supabase.from("observations").delete().eq("id", id);
    } catch {
      // Ignore
    }

    const local = getStoredLocalObservations().filter((o) => o.id !== id);
    localStorage.setItem("ecovision_local_observations", JSON.stringify(local));
  },

  // 4. Species Explorer
  async getSpeciesList(query?: string, habitat?: string): Promise<SpeciesListItem[]> {
    if (backendOnline && API_BASE) {
      try {
        const q = new URLSearchParams();
        if (query) q.append("query", query);
        if (habitat) q.append("habitat", habitat);

        const res = await fetchWithTimeout(`${API_BASE}/api/species?${q.toString()}`, {}, 2500);
        if (res.ok) {
          return await res.json();
        } else {
          backendOnline = false;
        }
      } catch {
        backendOnline = false;
      }
    }

    let items = Object.values(LOCAL_SPECIES_CATALOG).map((s) => ({
      id: s.id,
      common_name: s.common_name,
      scientific_name: s.scientific_name,
      family: s.family,
      order_name: s.order_name,
      habitat_types: s.habitat_types,
      conservation_status: s.conservation_status,
      image_url: s.image_url,
    }));

    if (query) {
      const qLower = query.toLowerCase();
      items = items.filter(
        (s) =>
          s.common_name.toLowerCase().includes(qLower) ||
          s.scientific_name.toLowerCase().includes(qLower) ||
          s.family.toLowerCase().includes(qLower)
      );
    }

    if (habitat) {
      items = items.filter((s) => s.habitat_types.includes(habitat));
    }

    return items;
  },

  async getSpeciesById(id: string): Promise<Species> {
    if (backendOnline && API_BASE) {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/api/species/${id}`, {}, 2500);
        if (res.ok) {
          return await res.json();
        } else {
          backendOnline = false;
        }
      } catch {
        backendOnline = false;
      }
    }

    const sp = LOCAL_SPECIES_CATALOG[id];
    if (sp) return sp;

    throw new Error(`Species profile '${id}' not found`);
  },

  // 5. Dashboard Analytics
  async getDashboardStats(userOnly?: boolean): Promise<ObservationStats> {
    if (backendOnline && API_BASE) {
      try {
        const headers = await getAuthHeader();
        const q = userOnly ? "?user_only=true" : "";
        const res = await fetchWithTimeout(`${API_BASE}/api/dashboard${q}`, { headers }, 2500);
        if (res.ok) {
          return await res.json();
        } else {
          backendOnline = false;
        }
      } catch {
        backendOnline = false;
      }
    }

    // Direct computation from Supabase & verified observations
    const observations = await this.getObservations({ limit: 150 });

    const totalObs = observations.length;
    const uniqueSpeciesSet = new Set<string>();
    const speciesCountMap: Record<string, number> = {};
    const habitatCountMap: Record<string, number> = {};
    const dateCountMap: Record<string, number> = {};
    const confidenceDist: Record<string, number> = { High: 0, Medium: 0, Low: 0 };
    let totalBirds = 0;

    for (const obs of observations) {
      const name = obs.predicted_species;
      uniqueSpeciesSet.add(name);
      speciesCountMap[name] = (speciesCountMap[name] || 0) + obs.bird_count;
      habitatCountMap[obs.habitat] = (habitatCountMap[obs.habitat] || 0) + 1;
      totalBirds += obs.bird_count;

      const conf = obs.prediction_confidence;
      if (conf >= 80) confidenceDist["High"]++;
      else if (conf >= 50) confidenceDist["Medium"]++;
      else confidenceDist["Low"]++;

      const dateStr = obs.observed_at ? obs.observed_at.substring(0, 10) : "Recent";
      dateCountMap[dateStr] = (dateCountMap[dateStr] || 0) + obs.bird_count;
    }

    const mostObserved = Object.entries(speciesCountMap)
      .map(([species, count]) => ({ species, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const timelineTrends = Object.entries(dateCountMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      total_observations: totalObs,
      unique_species: uniqueSpeciesSet.size,
      total_bird_count: totalBirds,
      most_observed_species: mostObserved,
      habitat_distribution: habitatCountMap,
      timeline_trends: timelineTrends,
      confidence_distribution: confidenceDist,
      recent_observations: observations.slice(0, 6),
    };
  },

  // 6. Geospatial Map
  async getMapPoints(habitat?: string): Promise<MapMarkerPoint[]> {
    if (backendOnline && API_BASE) {
      try {
        const q = habitat ? `?habitat=${encodeURIComponent(habitat)}` : "";
        const res = await fetchWithTimeout(`${API_BASE}/api/map${q}`, {}, 2500);
        if (res.ok) {
          return await res.json();
        } else {
          backendOnline = false;
        }
      } catch {
        backendOnline = false;
      }
    }

    const observations = await this.getObservations({ habitat, limit: 100 });
    const points: MapMarkerPoint[] = [];

    for (const obs of observations) {
      if (obs.latitude !== undefined && obs.longitude !== undefined) {
        points.push({
          id: obs.id,
          species_id: obs.species_id,
          species_name: obs.predicted_species,
          latitude: Number(obs.latitude.toFixed(4)),
          longitude: Number(obs.longitude.toFixed(4)),
          location_name: obs.location_name,
          habitat: obs.habitat,
          bird_count: obs.bird_count,
          behavior: obs.behavior,
          confidence: obs.prediction_confidence,
          observed_at: obs.observed_at,
          image_url: obs.image_url,
          is_demo: obs.is_demo,
        });
      }
    }

    return points;
  },

  // 7. System Health
  async getSystemHealth(): Promise<{ status: string; mode: string }> {
    if (backendOnline && API_BASE) {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/api/health`, {}, 2000);
        if (res.ok) {
          return await res.json();
        }
      } catch {
        // Fallback
      }
    }
    return {
      status: "online",
      mode: "client-resilient (Supabase + Web ML)",
    };
  },
};
