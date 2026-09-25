from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database.connection import get_db
from models.user import User
from dependencies import get_current_user

from urllib.request import Request, urlopen
from urllib.parse import urlencode

import json
import math


router = APIRouter()


# =========================================
# DISTANCE CALCULATION
# =========================================

def calculate_distance(
    lat1,
    lon1,
    lat2,
    lon2
):
    earth_radius = 6371

    lat1 = math.radians(lat1)
    lat2 = math.radians(lat2)

    difference_lat = math.radians(
        lat2 - lat1
    )

    difference_lon = math.radians(
        lon2 - lon1
    )

    a = (
        math.sin(difference_lat / 2) ** 2
        +
        math.cos(lat1)
        * math.cos(lat2)
        * math.sin(difference_lon / 2) ** 2
    )

    c = 2 * math.atan2(
        math.sqrt(a),
        math.sqrt(1 - a)
    )

    return earth_radius * c


# =========================================
# FIND LOCATION
# =========================================

def find_location(location_text):

    url = (
        "https://nominatim.openstreetmap.org/search"
    )

    params = {
        "q": location_text,
        "format": "jsonv2",
        "limit": 1,
        "countrycodes": "in"
    }

    request_url = (
        f"{url}?{urlencode(params)}"
    )

    request = Request(
        request_url,
        headers={
            "User-Agent": (
                "AI-Gym-Fitness-Assistant/1.0 "
                "(fitness planner application)"
            ),
            "Accept-Language": "en"
        }
    )

    try:

        with urlopen(
            request,
            timeout=10
        ) as response:

            data = json.loads(
                response.read().decode(
                    "utf-8"
                )
            )

        if not data:
            return None

        result = data[0]

        return {
            "latitude": float(
                result["lat"]
            ),
            "longitude": float(
                result["lon"]
            ),
            "display_name": result.get(
                "display_name",
                location_text
            )
        }

    except Exception as error:

        print(
            "Location search error:",
            error
        )

        return None


# =========================================
# FIND NEARBY GYMS
# =========================================

def find_nearby_gyms(
    latitude,
    longitude,
    radius=5000
):

    query = f"""
    [out:json][timeout:15];

    (
      nwr["leisure"="fitness_centre"]
        (around:{radius},{latitude},{longitude});

      nwr["sport"="fitness"]
        (around:{radius},{latitude},{longitude});

      nwr["sport"="gym"]
        (around:{radius},{latitude},{longitude});

      nwr["amenity"="gym"]
        (around:{radius},{latitude},{longitude});
    );

    out center tags;
    """

    # -------------------------------------
    # Try more than one Overpass server
    # -------------------------------------

    overpass_servers = [
        "https://overpass-api.de/api/interpreter",
        "https://overpass.kumi.systems/api/interpreter"
    ]

    data = None

    for overpass_url in overpass_servers:

        request_data = urlencode(
            {
                "data": query
            }
        ).encode("utf-8")

        request = Request(
            overpass_url,
            data=request_data,
            headers={
                "User-Agent": (
                    "AI-Gym-Fitness-Assistant/1.0"
                ),
                "Content-Type": (
                    "application/x-www-form-urlencoded"
                )
            },
            method="POST"
        )

        try:

            print(
                "Searching gyms using:",
                overpass_url
            )

            with urlopen(
                request,
                timeout=25
            ) as response:

                data = json.loads(
                    response.read().decode(
                        "utf-8"
                    )
                )

            print(
                "Overpass request successful."
            )

            break

        except Exception as error:

            print(
                "Overpass server failed:",
                error
            )

            data = None

    if data is None:

        print(
            "All Overpass servers failed."
        )

        return []

    # =====================================
    # PROCESS RESULTS
    # =====================================

    gyms = []

    for element in data.get(
        "elements",
        []
    ):

        tags = element.get(
            "tags",
            {}
        )

        name = tags.get(
            "name"
        )

        if not name:
            continue

        # ---------------------------------
        # Coordinates
        # ---------------------------------

        if (
            "lat" in element
            and "lon" in element
        ):

            gym_lat = float(
                element["lat"]
            )

            gym_lon = float(
                element["lon"]
            )

        elif "center" in element:

            gym_lat = float(
                element["center"]["lat"]
            )

            gym_lon = float(
                element["center"]["lon"]
            )

        else:

            continue

        # ---------------------------------
        # Distance
        # ---------------------------------

        distance = calculate_distance(
            latitude,
            longitude,
            gym_lat,
            gym_lon
        )

        # ---------------------------------
        # Address
        # ---------------------------------

        address_parts = []

        for key in [
            "addr:street",
            "addr:suburb",
            "addr:neighbourhood",
            "addr:city",
            "addr:town"
        ]:

            if tags.get(key):

                address_parts.append(
                    tags[key]
                )

        location = ", ".join(
            address_parts
        )

        gyms.append(
            {
                "name": name,
                "location": (
                    location
                    if location
                    else "Location available"
                ),
                "distance": round(
                    distance,
                    1
                ),
                "latitude": gym_lat,
                "longitude": gym_lon
            }
        )

    # =====================================
    # REMOVE DUPLICATES
    # =====================================

    unique_gyms = {}

    for gym in gyms:

        key = (
            gym["name"].lower(),
            round(
                gym["latitude"],
                4
            ),
            round(
                gym["longitude"],
                4
            )
        )

        unique_gyms[key] = gym

    gyms = list(
        unique_gyms.values()
    )

    # =====================================
    # SORT
    # =====================================

    gyms.sort(
        key=lambda gym:
        gym["distance"]
    )

    # Maximum 10 gyms
    gyms = gyms[:10]

    for gym in gyms:

        gym["distance"] = (
            f'{gym["distance"]} km'
        )

    print(
        f"Found {len(gyms)} gyms"
    )

    return gyms


# =========================================
# PLANNER ENDPOINT
# =========================================

@router.get("/")
def get_planner(
    location: str | None = Query(
        default=None
    ),
    db: Session = Depends(
        get_db
    ),
    current_user: User = Depends(
        get_current_user
    )
):

    fitness_goal = (
        current_user.fitness_goal
        or "general fitness"
    )

    goal = fitness_goal.lower()

    # =====================================
    # WORKOUT PROGRAMS
    # =====================================

    if (
        "muscle" in goal
        or "strength" in goal
    ):

        workout_programs = [

            {
                "name": "Strength Training",
                "description": (
                    "A structured program focused on "
                    "building strength through resistance exercises."
                )
            },

            {
                "name": (
                    "Upper and Lower Body Training"
                ),
                "description": (
                    "A balanced program covering major "
                    "upper-body and lower-body movements."
                )
            }

        ]

        challenges = [

            {
                "name": (
                    "Strength Consistency Challenge"
                ),
                "description": (
                    "Maintain consistent strength-training "
                    "activity throughout the week."
                )
            },

            {
                "name": (
                    "Workout Consistency Challenge"
                ),
                "description": (
                    "Build a regular workout habit by "
                    "recording your training sessions."
                )
            }

        ]

    elif (
        "weight loss" in goal
        or "fat loss" in goal
    ):

        workout_programs = [

            {
                "name": (
                    "Full Body Fitness Program"
                ),
                "description": (
                    "A general fitness program combining "
                    "full-body movements and regular activity."
                )
            },

            {
                "name": (
                    "Active Movement Program"
                ),
                "description": (
                    "A program focused on maintaining "
                    "regular movement and fitness activity."
                )
            }

        ]

        challenges = [

            {
                "name": (
                    "Activity Consistency Challenge"
                ),
                "description": (
                    "Maintain regular physical activity "
                    "throughout the week."
                )
            },

            {
                "name": (
                    "Weekly Workout Challenge"
                ),
                "description": (
                    "Record your workouts consistently "
                    "and monitor your activity."
                )
            }

        ]

    else:

        workout_programs = [

            {
                "name": (
                    "General Fitness Program"
                ),
                "description": (
                    "A balanced program covering full-body "
                    "movement and general fitness activities."
                )
            },

            {
                "name": (
                    "Active Lifestyle Program"
                ),
                "description": (
                    "A simple program designed to support "
                    "regular physical activity."
                )
            }

        ]

        challenges = [

            {
                "name": (
                    "Fitness Consistency Challenge"
                ),
                "description": (
                    "Maintain a regular workout routine "
                    "and record your activities."
                )
            },

            {
                "name": (
                    "Weekly Activity Challenge"
                ),
                "description": (
                    "Stay active throughout the week "
                    "and monitor your workout history."
                )
            }

        ]

    # =====================================
    # LOCATION SEARCH
    # =====================================

    nearby_gyms = []

    location_message = (
        "Enter your area or city to find nearby gyms."
    )

    searched_location = None

    if location:

        location = location.strip()

        if len(location) >= 2:

            searched_location = find_location(
                location
            )

            if searched_location:

                nearby_gyms = find_nearby_gyms(
                    searched_location["latitude"],
                    searched_location["longitude"]
                )

                if nearby_gyms:

                    location_message = (
                        f"Gyms found near {location}."
                    )

                else:

                    location_message = (
                        f"No gyms were found near "
                        f"{location}. Try a nearby "
                        f"city or area."
                    )

            else:

                location_message = (
                    f'Could not find the location '
                    f'"{location}". Try entering '
                    f'a city or area name.'
                )

    # =====================================
    # RESPONSE
    # =====================================

    return {

        "message": (
            "Personalized gym recommendations, "
            "workout programs, and challenges generated."
        ),

        "user": current_user.name,

        "fitness_goal": fitness_goal,

        "searched_location": (
            searched_location["display_name"]
            if searched_location
            else None
        ),

        "nearby_gyms": nearby_gyms,

        "location_message": location_message,

        "workout_programs": workout_programs,

        "challenges": challenges

    }