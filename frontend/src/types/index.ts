export interface Species {
  id: string;
  common_name: string;
  scientific_name: string;
  family: string;
  order_name: string;
  habitat_types: string[];
  diet: string;
  geographic_distribution: string;
  ecological_role: string;
  behavior_notes: string;
  identification_features: string;
  conservation_status: string;
  description: string;
  image_url?: string;
  created_at?: string;
}

export interface SpeciesListItem {
  id: string;
  common_name: string;
  scientific_name: string;
  family: string;
  order_name: string;
  habitat_types: string[];
  conservation_status: string;
  image_url?: string;
}

export interface PredictionCandidate {
  species_id: string;
  common_name: string;
  scientific_name: string;
  confidence: number;
  confidence_percentage: number;
}

export type ConfidenceLevel =
  | "Likely identified"
  | "Possible identification"
  | "Identification uncertain";

export interface PredictionResult {
  top_prediction: PredictionCandidate;
  alternative_predictions: PredictionCandidate[];
  confidence_level: ConfidenceLevel;
  threshold_applied: number;
  is_uncertain: boolean;
  guidance_message: string;
  species_details?: Species;
  gradcam_heatmap?: string;
  model_architecture: string;
  disclaimer: string;
}

export type HabitatType =
  | "Forest"
  | "Wetland"
  | "Grassland"
  | "Agricultural"
  | "Urban"
  | "Coastal"
  | "River/Lake"
  | "Mountain"
  | "Garden"
  | "Other";

export type BirdBehavior =
  | "Foraging"
  | "Perching"
  | "Flying"
  | "Calling / Vocalizing"
  | "Nesting"
  | "Flocking"
  | "Swimming / Diving"
  | "Courtship Display"
  | "Resting"
  | "Other";

export interface Observation {
  id: string;
  user_id?: string;
  user_email?: string;
  species_id?: string;
  predicted_species: string;
  prediction_confidence: number;
  top_predictions?: PredictionCandidate[];
  image_url: string;
  latitude?: number;
  longitude?: number;
  location_name: string;
  habitat: HabitatType;
  observed_at: string;
  bird_count: number;
  behavior: BirdBehavior;
  environmental_notes?: string;
  weather_conditions?: string;
  is_demo: boolean;
  created_at: string;
  species?: Species;
}

export interface ObservationCreatePayload {
  species_id?: string;
  predicted_species: string;
  prediction_confidence: number;
  top_predictions?: PredictionCandidate[];
  image_url: string;
  latitude?: number;
  longitude?: number;
  location_name: string;
  habitat: HabitatType;
  observed_at?: string;
  bird_count: number;
  behavior: BirdBehavior;
  environmental_notes?: string;
  weather_conditions?: string;
  is_demo?: boolean;
}

export interface ObservationStats {
  total_observations: number;
  unique_species: number;
  total_bird_count: number;
  most_observed_species: Array<{ species: string; count: number }>;
  habitat_distribution: Record<string, number>;
  timeline_trends: Array<{ date: string; count: number }>;
  confidence_distribution: Record<string, number>;
  recent_observations: Observation[];
}

export interface MapMarkerPoint {
  id: string;
  species_id?: string;
  species_name: string;
  latitude: number;
  longitude: number;
  location_name: string;
  habitat: string;
  bird_count: number;
  behavior: string;
  confidence: number;
  observed_at: string;
  image_url: string;
  is_demo: boolean;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
}
