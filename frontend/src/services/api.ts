import {
  PredictionResult,
  SpeciesListItem,
  Species,
  Observation,
  ObservationCreatePayload,
  ObservationStats,
  MapMarkerPoint,
} from "../types";
import { supabase } from "./supabase";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

export const api = {
  // AI Inference
  async predictBird(file: File, includeGradcam: boolean = true): Promise<PredictionResult> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE}/api/predict?include_gradcam=${includeGradcam}`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Identification request failed" }));
      throw new Error(err.detail || "Prediction request failed");
    }

    return res.json();
  },

  // Image Upload
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE}/api/observations/upload-image`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Image upload failed" }));
      throw new Error(err.detail || "Image upload failed");
    }

    const data = await res.json();
    return data.image_url;
  },

  // Observations
  async createObservation(payload: ObservationCreatePayload): Promise<Observation> {
    const headers = {
      "Content-Type": "application/json",
      ...(await getAuthHeader()),
    };

    const res = await fetch(`${API_BASE}/api/observations`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Failed to save observation" }));
      throw new Error(err.detail || "Failed to record observation");
    }

    return res.json();
  },

  async getObservations(params?: {
    habitat?: string;
    species_id?: string;
    user_only?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Observation[]> {
    const query = new URLSearchParams();
    if (params?.habitat) query.append("habitat", params.habitat);
    if (params?.species_id) query.append("species_id", params.species_id);
    if (params?.user_only) query.append("user_only", "true");
    if (params?.limit) query.append("limit", params.limit.toString());
    if (params?.offset) query.append("offset", params.offset.toString());

    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE}/api/observations?${query.toString()}`, {
      headers,
    });

    if (!res.ok) {
      throw new Error("Failed to load observations");
    }

    return res.json();
  },

  async getObservationById(id: string): Promise<Observation> {
    const res = await fetch(`${API_BASE}/api/observations/${id}`);
    if (!res.ok) {
      throw new Error("Observation not found");
    }
    return res.json();
  },

  async deleteObservation(id: string): Promise<void> {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE}/api/observations/${id}`, {
      method: "DELETE",
      headers,
    });
    if (!res.ok) {
      throw new Error("Failed to delete observation");
    }
  },

  // Species Explorer
  async getSpeciesList(query?: string, habitat?: string): Promise<SpeciesListItem[]> {
    const q = new URLSearchParams();
    if (query) q.append("query", query);
    if (habitat) q.append("habitat", habitat);

    const res = await fetch(`${API_BASE}/api/species?${q.toString()}`);
    if (!res.ok) {
      throw new Error("Failed to load species catalog");
    }
    return res.json();
  },

  async getSpeciesById(id: string): Promise<Species> {
    const res = await fetch(`${API_BASE}/api/species/${id}`);
    if (!res.ok) {
      throw new Error("Species profile not found");
    }
    return res.json();
  },

  // Dashboard & Geospatial Map
  async getDashboardStats(userOnly?: boolean): Promise<ObservationStats> {
    const headers = await getAuthHeader();
    const q = userOnly ? "?user_only=true" : "";
    const res = await fetch(`${API_BASE}/api/dashboard${q}`, { headers });
    if (!res.ok) {
      throw new Error("Failed to retrieve dashboard analytics");
    }
    return res.json();
  },

  async getMapPoints(habitat?: string): Promise<MapMarkerPoint[]> {
    const q = habitat ? `?habitat=${encodeURIComponent(habitat)}` : "";
    const res = await fetch(`${API_BASE}/api/map${q}`);
    if (!res.ok) {
      throw new Error("Failed to retrieve map markers");
    }
    return res.json();
  },

  // Health check
  async getSystemHealth(): Promise<any> {
    const res = await fetch(`${API_BASE}/api/health`);
    return res.json();
  },
};
