"""
Observation Service for EcoVision.
Handles persistence, filtering, geospatial mapping, and biodiversity aggregation.
"""

from collections import Counter
from datetime import datetime, timedelta
import logging
from typing import List, Optional, Dict, Any
from app.db.supabase import get_supabase_client
from app.ml.species_map import SPECIES_CATALOG
from app.schemas.observation import (
    ObservationCreate,
    ObservationUpdate,
    ObservationResponse,
    ObservationStats,
)
from app.schemas.species import SpeciesResponse

logger = logging.getLogger("ecovision.observation_service")


class ObservationService:
    def create_observation(
        self,
        data: ObservationCreate,
        user_id: Optional[str] = None,
        user_email: Optional[str] = None,
    ) -> ObservationResponse:
        """Stores a new biodiversity observation."""
        supabase = get_supabase_client()
        obs_dict = data.model_dump()
        obs_dict["user_id"] = user_id
        obs_dict["user_email"] = user_email
        obs_dict["observed_at"] = obs_dict["observed_at"].isoformat()

        try:
            res = supabase.table("observations").insert(obs_dict).execute()
            if not res.data:
                raise ValueError("No record returned after observation insert.")
            created = res.data[0]
            # Attach species info if species_id exists
            species_info = None
            if created.get("species_id") and created["species_id"] in SPECIES_CATALOG:
                species_info = SpeciesResponse(**SPECIES_CATALOG[created["species_id"]])

            return ObservationResponse(**created, species=species_info)
        except Exception as e:
            logger.error(f"Failed to create observation: {e}")
            raise e

    def get_observations(
        self,
        user_id: Optional[str] = None,
        species_id: Optional[str] = None,
        habitat: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
        include_demo: bool = True,
    ) -> List[ObservationResponse]:
        """Queries observations with filters and pagination."""
        supabase = get_supabase_client()
        try:
            query = supabase.table("observations").select("*")
            if user_id:
                if include_demo:
                    query = query.or_(f"user_id.eq.{user_id},is_demo.eq.true")
                else:
                    query = query.eq("user_id", user_id)
            elif not include_demo:
                query = query.eq("is_demo", False)

            if species_id:
                query = query.eq("species_id", species_id)
            if habitat:
                query = query.eq("habitat", habitat)

            res = query.order("observed_at", desc=True).range(offset, offset + limit - 1).execute()
            data = res.data or []

            results = []
            for item in data:
                spec = None
                s_id = item.get("species_id")
                if s_id and s_id in SPECIES_CATALOG:
                    spec = SpeciesResponse(**SPECIES_CATALOG[s_id])
                results.append(ObservationResponse(**item, species=spec))
            return results
        except Exception as e:
            logger.error(f"Failed to fetch observations: {e}")
            return []

    def get_observation_by_id(self, obs_id: str) -> Optional[ObservationResponse]:
        """Retrieves a single observation by ID."""
        supabase = get_supabase_client()
        try:
            res = supabase.table("observations").select("*").eq("id", obs_id).single().execute()
            if res.data:
                item = res.data
                spec = None
                s_id = item.get("species_id")
                if s_id and s_id in SPECIES_CATALOG:
                    spec = SpeciesResponse(**SPECIES_CATALOG[s_id])
                return ObservationResponse(**item, species=spec)
        except Exception as e:
            logger.warning(f"Observation {obs_id} not found: {e}")
        return None

    def update_observation(
        self,
        obs_id: str,
        data: ObservationUpdate,
        user_id: Optional[str] = None,
    ) -> Optional[ObservationResponse]:
        """Updates editable fields of an observation."""
        supabase = get_supabase_client()
        update_data = {k: v for k, v in data.model_dump().items() if v is not None}
        if not update_data:
            return self.get_observation_by_id(obs_id)

        try:
            query = supabase.table("observations").update(update_data).eq("id", obs_id)
            if user_id:
                query = query.eq("user_id", user_id)
            res = query.execute()
            if res.data:
                return self.get_observation_by_id(obs_id)
        except Exception as e:
            logger.error(f"Failed to update observation {obs_id}: {e}")
        return None

    def delete_observation(self, obs_id: str, user_id: Optional[str] = None) -> bool:
        """Deletes an observation."""
        supabase = get_supabase_client()
        try:
            query = supabase.table("observations").delete().eq("id", obs_id)
            if user_id:
                query = query.eq("user_id", user_id)
            res = query.execute()
            return bool(res.data)
        except Exception as e:
            logger.error(f"Failed to delete observation {obs_id}: {e}")
            return False

    def get_dashboard_stats(self, user_id: Optional[str] = None) -> ObservationStats:
        """Aggregates environmental observation analytics and patterns."""
        observations = self.get_observations(user_id=user_id, limit=200, include_demo=True)

        total_obs = len(observations)
        if total_obs == 0:
            return ObservationStats(
                total_observations=0,
                unique_species=0,
                total_bird_count=0,
                most_observed_species=[],
                habitat_distribution={},
                timeline_trends=[],
                confidence_distribution={"High": 0, "Medium": 0, "Low": 0},
                recent_observations=[],
            )

        unique_species_set = set()
        species_counter = Counter()
        habitat_counter = Counter()
        confidence_levels = Counter({"High": 0, "Medium": 0, "Low": 0})
        total_birds = 0
        date_counter = Counter()

        for obs in observations:
            species_name = obs.predicted_species
            species_counter[species_name] += obs.bird_count
            unique_species_set.add(species_name)
            habitat_counter[obs.habitat] += 1
            total_birds += obs.bird_count

            # Confidence binning
            conf = obs.prediction_confidence
            if conf >= 80.0:
                confidence_levels["High"] += 1
            elif conf >= 50.0:
                confidence_levels["Medium"] += 1
            else:
                confidence_levels["Low"] += 1

            # Date grouping
            d_str = obs.observed_at.strftime("%Y-%m-%d")
            date_counter[d_str] += obs.bird_count

        most_observed = [
            {"species": sp, "count": cnt}
            for sp, cnt in species_counter.most_common(5)
        ]

        # Sort timeline
        sorted_dates = sorted(date_counter.keys())
        timeline = [{"date": d, "count": date_counter[d]} for d in sorted_dates]

        return ObservationStats(
            total_observations=total_obs,
            unique_species=len(unique_species_set),
            total_bird_count=total_birds,
            most_observed_species=most_observed,
            habitat_distribution=dict(habitat_counter),
            timeline_trends=timeline,
            confidence_distribution=dict(confidence_levels),
            recent_observations=observations[:6],
        )

    def get_map_points(self, habitat: Optional[str] = None) -> List[Dict[str, Any]]:
        """Returns geospatial points for Leaflet map markers with coordinate safety."""
        observations = self.get_observations(habitat=habitat, limit=100, include_demo=True)
        points = []
        for obs in observations:
            if obs.latitude is not None and obs.longitude is not None:
                points.append({
                    "id": obs.id,
                    "species_id": obs.species_id,
                    "species_name": obs.predicted_species,
                    "latitude": round(obs.latitude, 4),
                    "longitude": round(obs.longitude, 4),
                    "location_name": obs.location_name,
                    "habitat": obs.habitat,
                    "bird_count": obs.bird_count,
                    "behavior": obs.behavior,
                    "confidence": obs.prediction_confidence,
                    "observed_at": obs.observed_at.isoformat(),
                    "image_url": obs.image_url,
                    "is_demo": obs.is_demo,
                })
        return points


observation_service = ObservationService()
