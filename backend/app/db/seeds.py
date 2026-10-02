"""
Database seeder for EcoVision species catalog and demonstration observation records.
"""

import logging
from typing import List, Dict, Any
from app.db.supabase import get_supabase_admin_client, get_supabase_client
from app.ml.species_map import SPECIES_CATALOG

logger = logging.getLogger("ecovision.seeds")

DEMO_OBSERVATIONS = [
    {
        "species_id": "indian-peafowl",
        "predicted_species": "Indian Peafowl",
        "prediction_confidence": 94.6,
        "image_url": "/species/indian-peafowl.jpg",
        "latitude": 28.5983,
        "longitude": 77.2189,
        "location_name": "Lodhi Gardens, New Delhi",
        "habitat": "Garden",
        "bird_count": 2,
        "behavior": "Courtship Display",
        "environmental_notes": "Two adult males observed fanning full trains near ancient monument garden foliage during overcast monsoon morning.",
        "weather_conditions": "Overcast, 28°C, 78% humidity",
        "is_demo": True,
    },
    {
        "species_id": "white-throated-kingfisher",
        "predicted_species": "White-throated Kingfisher",
        "prediction_confidence": 91.2,
        "image_url": "/species/white-throated-kingfisher.jpg",
        "latitude": 28.6139,
        "longitude": 77.3105,
        "location_name": "Yamuna Biodiversity Park, Delhi",
        "habitat": "Wetland",
        "bird_count": 1,
        "behavior": "Perching",
        "environmental_notes": "Perched on dead acacia branch scanning water margin; dove once successfully catching small freshwater prawn.",
        "weather_conditions": "Clear, 24°C, low wind",
        "is_demo": True,
    },
    {
        "species_id": "great-hornbill",
        "predicted_species": "Great Hornbill",
        "prediction_confidence": 88.5,
        "image_url": "/species/great-hornbill.jpg",
        "latitude": 10.3245,
        "longitude": 76.9532,
        "location_name": "Anamalai Tiger Reserve, Western Ghats",
        "habitat": "Forest",
        "bird_count": 2,
        "behavior": "Foraging",
        "environmental_notes": "Pair feeding on mature Ficus virens canopy figs. Heavy audible wingbeats echoing across primary evergreen valley.",
        "weather_conditions": "Mist/fog, 19°C, humid",
        "is_demo": True,
    },
    {
        "species_id": "indian-vulture",
        "predicted_species": "Indian Vulture",
        "prediction_confidence": 94.6,
        "image_url": "/species/indian-vulture.jpg",
        "latitude": 25.3524,
        "longitude": 78.6432,
        "location_name": "Orchha Heritage Cliffs & River Valley",
        "habitat": "Mountain",
        "bird_count": 3,
        "behavior": "Soaring",
        "environmental_notes": "Pair soaring in high midday thermals along sheer sandstone cliffs; roosting near historical temple chhatris.",
        "weather_conditions": "Warm, 32°C, clear thermals",
        "is_demo": True,
    },
    {
        "species_id": "spot-billed-pelican",
        "predicted_species": "Spot-billed Pelican",
        "prediction_confidence": 96.8,
        "image_url": "/species/spot-billed-pelican.jpg",
        "latitude": 12.8715,
        "longitude": 77.5946,
        "location_name": "Ranganathittu Bird Sanctuary, Karnataka",
        "habitat": "Wetland",
        "bird_count": 18,
        "behavior": "Foraging",
        "environmental_notes": "Group fishing cooperatively in a semi-circle, herding carp into shallow oxbow lake margins.",
        "weather_conditions": "Humid, 28°C, calm water",
        "is_demo": True,
    },
    {
        "species_id": "sarus-crane",
        "predicted_species": "Sarus Crane",
        "prediction_confidence": 89.4,
        "image_url": "/species/sarus-crane.jpg",
        "latitude": 27.1594,
        "longitude": 77.5201,
        "location_name": "Keoladeo National Park, Bharatpur",
        "habitat": "Wetland",
        "bird_count": 2,
        "behavior": "Calling / Vocalizing",
        "environmental_notes": "Monogamous pair calling in unison duet across marshland; standing tall amidst water lily pads.",
        "weather_conditions": "Hazy sunrise, 20°C, calm",
        "is_demo": True,
    },
    {
        "species_id": "black-rumped-flameback",
        "predicted_species": "Black-rumped Flameback",
        "prediction_confidence": 92.1,
        "image_url": "/species/black-rumped-flameback.jpg",
        "latitude": 12.9716,
        "longitude": 77.5946,
        "location_name": "Cubbon Park, Bengaluru",
        "habitat": "Urban",
        "bird_count": 1,
        "behavior": "Foraging",
        "environmental_notes": "Tapping rhythmic bursts on ancient silver oak trunk, extracting beetle grubs. Whinnying call heard every few minutes.",
        "weather_conditions": "Pleasant, 23°C",
        "is_demo": True,
    },
    {
        "species_id": "purple-sunbird",
        "predicted_species": "Purple Sunbird",
        "prediction_confidence": 95.0,
        "image_url": "/species/purple-sunbird.jpg",
        "latitude": 18.5204,
        "longitude": 73.8567,
        "location_name": "Pune University Botanical Garden",
        "habitat": "Garden",
        "bird_count": 3,
        "behavior": "Foraging",
        "environmental_notes": "Breeding plumage male actively probing coral tree (Erythrina) blooms alongside two females.",
        "weather_conditions": "Warm, 27°C, low wind",
        "is_demo": True,
    }
]


def seed_species():
    """Seeds or updates the species catalog in Supabase."""
    supabase = get_supabase_admin_client()
    records = list(SPECIES_CATALOG.values())
    try:
        res = supabase.table("species").upsert(records, on_conflict="id").execute()
        logger.info("Successfully seeded %d species records.", len(records))
        return len(records)
    except Exception as e:
        logger.error("Failed to seed species: %s", e)
        raise e


def seed_demo_observations():
    """Seeds standard demo observations if table is empty or sparsely populated."""
    supabase = get_supabase_admin_client()
    try:
        check = supabase.table("observations").select("id", count="exact").eq("is_demo", True).execute()
        if check.count and check.count >= len(DEMO_OBSERVATIONS):
            logger.info("Demo observations already exist (%d records). Skipping.", check.count)
            return check.count

        res = supabase.table("observations").insert(DEMO_OBSERVATIONS).execute()
        logger.info("Inserted %d demo observations.", len(DEMO_OBSERVATIONS))
        return len(DEMO_OBSERVATIONS)
    except Exception as e:
        logger.error("Failed to seed demo observations: %s", e)
        raise e


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    seed_species()
    seed_demo_observations()
