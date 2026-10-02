"""
Species Service for EcoVision.
Handles catalog retrieval, search queries, habitat filtering, and ecological profiles.
"""

import logging
from typing import List, Optional, Dict, Any
from app.db.supabase import get_supabase_client
from app.ml.species_map import SPECIES_CATALOG, get_all_species_list
from app.schemas.species import SpeciesResponse, SpeciesListItem

logger = logging.getLogger("ecovision.species_service")


class SpeciesService:
    def get_species_list(
        self,
        query: Optional[str] = None,
        habitat: Optional[str] = None,
        order_name: Optional[str] = None,
        limit: int = 50,
    ) -> List[SpeciesListItem]:
        """Fetches bird species with search and filter capabilities."""
        supabase = get_supabase_client()
        try:
            req = supabase.table("species").select("*")
            if habitat:
                req = req.contains("habitat_types", [habitat])
            if order_name:
                req = req.eq("order_name", order_name)

            res = req.limit(limit).execute()
            data = res.data or []

            # If empty or not yet seeded from remote, fallback to in-memory catalog
            if not data:
                data = get_all_species_list()

            results = []
            for item in data:
                # Text search filtering if requested
                if query:
                    q = query.lower()
                    c_name = item.get("common_name", "").lower()
                    s_name = item.get("scientific_name", "").lower()
                    f_name = item.get("family", "").lower()
                    if q not in c_name and q not in s_name and q not in f_name:
                        continue

                results.append(
                    SpeciesListItem(
                        id=item["id"],
                        common_name=item["common_name"],
                        scientific_name=item["scientific_name"],
                        family=item["family"],
                        order_name=item["order_name"],
                        habitat_types=item.get("habitat_types", []),
                        conservation_status=item["conservation_status"],
                        image_url=item.get("image_url"),
                    )
                )
            return results

        except Exception as e:
            logger.error(f"Error fetching species list from Supabase: {e}; falling back to local catalog.")
            all_local = get_all_species_list()
            return [
                SpeciesListItem(
                    id=item["id"],
                    common_name=item["common_name"],
                    scientific_name=item["scientific_name"],
                    family=item["family"],
                    order_name=item["order_name"],
                    habitat_types=item.get("habitat_types", []),
                    conservation_status=item["conservation_status"],
                    image_url=item.get("image_url"),
                )
                for item in all_local
            ]

    def get_species_by_id(self, species_id: str) -> Optional[SpeciesResponse]:
        """Fetches full species record by identifier."""
        supabase = get_supabase_client()
        try:
            res = supabase.table("species").select("*").eq("id", species_id).single().execute()
            if res.data:
                return SpeciesResponse(**res.data)
        except Exception as e:
            logger.warning(f"Could not retrieve species {species_id} from Supabase: {e}")

        # Fallback to local catalog
        if species_id in SPECIES_CATALOG:
            return SpeciesResponse(**SPECIES_CATALOG[species_id])
        return None


species_service = SpeciesService()
