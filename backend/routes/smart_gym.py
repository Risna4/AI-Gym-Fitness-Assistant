from fastapi import APIRouter, Depends, HTTPException, Body
from datetime import datetime
import time

from models.user import User
from dependencies import get_current_user

router = APIRouter()

# Active user sessions: user_id -> session details
active_sessions = {}

# Live IoT telemetry buffer: machine_name -> latest payload
# Incoming MQTT messages or IoT gateways update this dictionary
iot_device_streams = {
    "Treadmill": {
        "heart_rate_bpm": None,
        "cadence_rpm": 0,
        "power_watts": 0,
        "resistance_level": 1,
        "last_packet_timestamp": 0
    },
    "Exercise Bike": {
        "heart_rate_bpm": None,
        "cadence_rpm": 0,
        "power_watts": 0,
        "resistance_level": 1,
        "last_packet_timestamp": 0
    },
    "Cable Machine": {
        "heart_rate_bpm": None,
        "cadence_rpm": 0,
        "power_watts": 0,
        "resistance_level": 1,
        "last_packet_timestamp": 0
    },
    "Leg Press": {
        "heart_rate_bpm": None,
        "cadence_rpm": 0,
        "power_watts": 0,
        "resistance_level": 1,
        "last_packet_timestamp": 0
    }
}

MQTT_TOPICS = {
    "Treadmill": "gym/iot/treadmill/01/telemetry",
    "Exercise Bike": "gym/iot/bike/02/telemetry",
    "Cable Machine": "gym/iot/cable/03/telemetry",
    "Leg Press": "gym/iot/legpress/04/telemetry"
}


# =====================================================================
# INGESTION ENDPOINT: INTAKE REAL PHYSICAL OR TEST MQTT SENSOR PACKETS
# =====================================================================
@router.post("/telemetry")
def receive_iot_packet(payload: dict = Body(...)):
    """
    Receives raw sensor packets from an MQTT bridge (e.g., Node-RED, paho-mqtt daemon)
    or directly from a BLE heart rate / IoT microcontroller gateway.
    Expected schema:
    {
       "machine": "Treadmill",
       "heart_rate_bpm": 145,       # integer or null if no monitor attached
       "cadence_rpm": 82,
       "power_watts": 190,
       "resistance_level": 5
    }
    """
    machine = payload.get("machine")
    if machine not in iot_device_streams:
        raise HTTPException(status_code=400, detail="Unrecognized equipment ID.")

    iot_device_streams[machine] = {
        "heart_rate_bpm": payload.get("heart_rate_bpm"),
        "cadence_rpm": payload.get("cadence_rpm", 0),
        "power_watts": payload.get("power_watts", 0),
        "resistance_level": payload.get("resistance_level", 1),
        "last_packet_timestamp": time.time()
    }

    return {"status": "Telemetry packet received", "machine": machine}


# =====================================================================
# ADAPTIVE RECOVERY & RESISTANCE LOGIC
# =====================================================================
def evaluate_ai_adjustments(telemetry: dict, is_active: bool):
    if not is_active:
        return (
            {
                "title": "Standby Mode",
                "description": "Select a machine and connect your wearable or IoT sensor to start monitoring."
            },
            {
                "title": "Rest Interval",
                "description": "Baseline monitoring active. No recovery period required."
            }
        )

    hr = telemetry.get("heart_rate_bpm")
    cadence = telemetry.get("cadence_rpm", 0)
    current_res = telemetry.get("resistance_level", 1)

    # 1. Handling case where no heart rate monitor is physically synced
    if hr is None:
        return (
            {
                "title": "Mechanical Sensor Control",
                "description": (
                    f"Operating on cadence ({cadence} RPM) and strain gauge output ({telemetry.get('power_watts', 0)}W). "
                    "Connect a BLE heart rate sensor for cardiovascular auto-tuning."
                )
            },
            {
                "title": "Standard Rest: 60 Seconds",
                "description": "Heart rate sensor disconnected. Using default cadence-based interval recovery."
            }
        )

    # 2. Adaptive resistance and rest rules when physical HR data is streaming
    if hr > 160:
        return (
            {
                "title": "Elevated Exertion Warning",
                "description": (
                    f"Physical HR sensor reading {hr} BPM. Auto-adjusting equipment resistance "
                    f"from Level {current_res} down to Level {max(1, current_res - 2)} to prevent overtraining."
                )
            },
            {
                "title": "Optimal Rest: 90 Seconds",
                "description": "Elevated cardiovascular exertion. Extended cooldown recommended."
            }
        )
    elif cadence > 85:
        return (
            {
                "title": "High Cadence Efficiency",
                "description": (
                    f"Cadence reached {cadence} RPM at {hr} BPM. Recommending resistance increase "
                    f"to Level {min(20, current_res + 1)}."
                )
            },
            {
                "title": "Optimal Rest: 60 Seconds",
                "description": "Cadence steady in high aerobic zone. Standard 60-second rest recommended."
            }
        )
    else:
        return (
            {
                "title": "Workload Stabilized",
                "description": f"Aerobic metrics steady ({hr} BPM, {cadence} RPM). Resistance set at Level {current_res}."
            },
            {
                "title": "Optimal Rest: 45 Seconds",
                "description": "Controlled aerobic output. Standard interval recovery."
            }
        )


def build_response(current_user: User):
    user_id = current_user.id
    session = active_sessions.get(user_id)
    session_active = session is not None
    active_machine = session.get("machine") if session_active else None

    current_time = time.time()
    equipment_list = []

    for name in ["Treadmill", "Exercise Bike", "Cable Machine", "Leg Press"]:
        data = iot_device_streams[name]
        is_fresh = (current_time - data["last_packet_timestamp"]) < 15
        is_this_machine_active = session_active and (active_machine == name)

        equipment_list.append({
            "name": name,
            "status": "In Use" if is_this_machine_active else "Available",
            "sensor_active": is_fresh,
            "mqtt_topic": MQTT_TOPICS[name],
            "telemetry": {
                "heart_rate_bpm": data["heart_rate_bpm"] if is_fresh else None,
                "cadence_rpm": data["cadence_rpm"] if is_fresh else 0,
                "power_watts": data["power_watts"] if is_fresh else 0,
                "resistance_level": data["resistance_level"],
                "sensor_status": "Connected" if is_fresh else "No Active Stream"
            }
        })

    # Pick the telemetry of the active machine (or default to empty)
    active_telemetry = (
        iot_device_streams.get(active_machine, {})
        if session_active
        else {}
    )
    ai_rec, rest_rec = evaluate_ai_adjustments(active_telemetry, session_active)

    session_data = {
        "status": "Active" if session_active else "Ready",
        "active_machine": active_machine,
        "started_at": session["started_at"] if session_active else None,
        "elapsed_seconds": int(current_time - session["start_timestamp"]) if session_active else 0
    }

    return {
        "user": current_user.name,
        "fitness_goal": current_user.fitness_goal or "general fitness",
        "session": session_data,
        "equipment": equipment_list,
        "ai_recommendation": ai_rec,
        "rest_recommendation": rest_rec,
        "iot_broker": {
            "protocol": "MQTT v5.0",
            "host": "localhost:1883",
            "active_topic": MQTT_TOPICS.get(active_machine, "Standby")
        }
    }


@router.get("/")
def get_smart_gym(current_user: User = Depends(get_current_user)):
    return build_response(current_user)


@router.post("/start")
def start_session(
    machine: str = Body(default="Treadmill", embed=True),
    current_user: User = Depends(get_current_user)
):
    user_id = current_user.id
    if user_id in active_sessions:
        raise HTTPException(status_code=400, detail="A workout session is already active.")

    if machine not in iot_device_streams:
        raise HTTPException(status_code=400, detail="Invalid equipment selection.")

    started_at = datetime.now().isoformat()
    active_sessions[user_id] = {
        "machine": machine,
        "started_at": started_at,
        "start_timestamp": time.time()
    }

    return {"message": f"Session started on {machine}.", "started_at": started_at}


@router.post("/stop")
def stop_session(current_user: User = Depends(get_current_user)):
    user_id = current_user.id
    if user_id not in active_sessions:
        raise HTTPException(status_code=400, detail="No active workout session.")

    session = active_sessions.pop(user_id)
    duration_seconds = max(1, int(time.time() - session["start_timestamp"]))
    machine = session["machine"]
    latest_metrics = iot_device_streams.get(machine, {})

    return {
        "message": "Workout session completed.",
        "summary": {
            "equipment_name": machine,
            "duration_seconds": duration_seconds,
            "avg_power_watts": latest_metrics.get("power_watts", 0),
            "peak_cadence_rpm": latest_metrics.get("cadence_rpm", 0),
            "heart_rate_recorded": latest_metrics.get("heart_rate_bpm") or "No sensor attached",
            "resistance_level": latest_metrics.get("resistance_level", 1),
            "mqtt_topic_synced": MQTT_TOPICS[machine]
        }
    }