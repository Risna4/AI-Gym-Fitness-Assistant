import { useEffect, useState } from "react";

function SmartGymPage() {
  const [smartGym, setSmartGym] = useState(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [selectedMachine, setSelectedMachine] = useState("Treadmill");
  const [sessionSummary, setSessionSummary] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const token = localStorage.getItem("access_token");


  /*
   * LOAD SMART GYM DATA
   */

  const loadSmartGym = async () => {
    if (!token) {
      setError("You are not logged in.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/smart-gym/",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.detail ||
          "Unable to load Smart Gym."
        );
        return;
      }

      setSmartGym(data);
      setError("");

    } catch {
      setError(
        "Unable to connect to the backend."
      );
    } finally {
      setLoading(false);
    }
  };


  /*
   * INITIAL LOAD & AUTO POLLING (EVERY 3 SECONDS)
   */

  useEffect(() => {
    loadSmartGym();

    const pollInterval = setInterval(() => {
      loadSmartGym();
    }, 3000);

    return () => clearInterval(pollInterval);
  }, []);


  /*
   * SESSION TIMER
   *
   * The timer is calculated from the session
   * start time returned by the backend.
   */

  useEffect(() => {
    if (!smartGym?.session?.started_at) {
      setElapsedSeconds(0);
      return;
    }

    const updateTimer = () => {
      const startTime = new Date(
        smartGym.session.started_at
      ).getTime();

      const currentTime = Date.now();

      const seconds = Math.max(
        0,
        Math.floor(
          (currentTime - startTime) / 1000
        )
      );

      setElapsedSeconds(seconds);
    };

    updateTimer();

    const timer = setInterval(
      updateTimer,
      1000
    );

    return () => clearInterval(timer);

  }, [
    smartGym?.session?.started_at
  ]);


  /*
   * FORMAT SESSION TIME
   */

  const formatTime = (seconds) => {
    const hours = Math.floor(
      seconds / 3600
    );

    const minutes = Math.floor(
      (seconds % 3600) / 60
    );

    const remainingSeconds =
      seconds % 60;

    return [
      hours,
      minutes,
      remainingSeconds
    ]
      .map((value) =>
        String(value).padStart(2, "0")
      )
      .join(":");
  };


  /*
   * START SESSION (PASSES THE SELECTED MACHINE)
   */

  const handleStartSession = async (machineToStart) => {
    const targetMachine = typeof machineToStart === "string" ? machineToStart : selectedMachine;

    setActionLoading(true);
    setMessage("");
    setError("");
    setSessionSummary(null);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/smart-gym/start",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ machine: targetMachine })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.detail ||
          "Unable to start session."
        );
        return;
      }

      setMessage(
        data.message ||
        `Workout session started on ${targetMachine}.`
      );

      await loadSmartGym();

    } catch {
      setError(
        "Unable to connect to the backend."
      );
    } finally {
      setActionLoading(false);
    }
  };


  /*
   * END SESSION (STORES COMPLETED SUMMARY PAYLOAD)
   */

  const handleStopSession = async () => {
    setActionLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/smart-gym/stop",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.detail ||
          "Unable to end session."
        );
        return;
      }

      if (data.summary) {
        setSessionSummary(data.summary);
      }

      setMessage(
        data.message ||
        `Session ended. Duration: ${formatTime(
          elapsedSeconds
        )}`
      );

      await loadSmartGym();

    } catch {
      setError(
        "Unable to connect to the backend."
      );
    } finally {
      setActionLoading(false);
    }
  };


  /*
   * REFRESH DATA
   */

  const handleRefresh = async () => {
    setMessage("");
    setError("");
    setLoading(true);

    await loadSmartGym();
  };


  /*
   * LOADING SCREEN
   */

  if (loading && !smartGym) {
    return (
      <div className="smart-gym-status">

        <div className="smart-gym-status-icon">
          AI
        </div>

        <div>
          <strong>
            Loading Smart Gym Assistant
          </strong>

          <p>
            Connecting to the gym monitoring system...
          </p>
        </div>

      </div>
    );
  }


  /*
   * ERROR SCREEN
   */

  if (error && !smartGym) {
    return (
      <div className="smart-gym-status">

        <div className="smart-gym-error-icon">
          !
        </div>

        <div>
          <strong>
            Unable to load Smart Gym
          </strong>

          <p>
            {error}
          </p>
        </div>

      </div>
    );
  }


  const sessionActive =
    smartGym?.session?.status === "Active";


  return (
    <div className="smart-gym-page">

      {/* =====================================
          PAGE HEADER
          ===================================== */}

      <div className="smart-gym-header">

        <div>

          <span className="page-label">
            AI + IOT FITNESS
          </span>

          <h1>
            Smart Gym Assistant
          </h1>

          <p>
            Monitor gym equipment, manage your workout
            session, and receive intelligent activity
            recommendations.
          </p>

        </div>

        <div className="smart-gym-status-badge">

          <span className="status-dot"></span>

          System Connected

        </div>

      </div>


      {/* =====================================
          INTRO
          ===================================== */}

      <div className="smart-gym-intro">

        <div className="smart-gym-intro-icon">
          AI
        </div>

        <div>

          <span>
            INTELLIGENT GYM MONITORING
          </span>

          <h2>
            Connected fitness assistance
          </h2>

          <p>
            Monitor equipment and manage your current
            workout session through the Smart Gym system.
          </p>

        </div>

      </div>


      {/* =====================================
          SESSION CONTROL
          ===================================== */}

      <div className="smart-gym-control-card">

        <div>

          <span>
            WORKOUT SESSION
          </span>

          <h2>
            {sessionActive
              ? `Session active on ${smartGym?.session?.active_machine || "Equipment"}`
              : "Ready for your workout"}
          </h2>

          <p>
            {sessionActive
              ? "The Smart Gym Assistant is monitoring your real-time telemetry."
              : "Select a machine and start a session to begin Smart Gym monitoring."}
          </p>

        </div>


        <div className="smart-gym-controls" style={{ display: "flex", gap: "0.6rem", alignItems: "center", flexWrap: "wrap" }}>

          {!sessionActive && (
            <select
              value={selectedMachine}
              onChange={(e) => setSelectedMachine(e.target.value)}
              style={{
                padding: "0.6rem 0.8rem",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                background: "#ffffff",
                fontWeight: 600,
                fontSize: "0.9rem"
              }}
            >
              <option value="Treadmill">Treadmill</option>
              <option value="Exercise Bike">Exercise Bike</option>
              <option value="Cable Machine">Cable Machine</option>
              <option value="Leg Press">Leg Press</option>
            </select>
          )}

          {!sessionActive ? (

            <button
              className="smart-gym-start-button"
              onClick={() => handleStartSession(selectedMachine)}
              disabled={actionLoading}
            >
              {actionLoading
                ? "Starting..."
                : `Start on ${selectedMachine}`}
            </button>

          ) : (

            <button
              className="smart-gym-stop-button"
              onClick={handleStopSession}
              disabled={actionLoading}
            >
              {actionLoading
                ? "Ending..."
                : "End Session"}
            </button>

          )}


          <button
            className="smart-gym-refresh-button"
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading
              ? "Refreshing..."
              : "Refresh"}
          </button>

        </div>

      </div>


      {/* =====================================
          MESSAGE
          ===================================== */}

      {(message || error) && (

        <div
          className={
            error
              ? "smart-gym-message error"
              : "smart-gym-message success"
          }
        >
          {error || message}
        </div>

      )}


      {/* =====================================
          COMPLETED IOT SESSION SUMMARY REPORT
          ===================================== */}

      {sessionSummary && (
        <div style={{
          background: "#f0fdf4",
          border: "1px solid #86efac",
          borderRadius: "14px",
          padding: "1.5rem",
          marginBottom: "1.5rem"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <div>
              <span style={{ background: "#22c55e", color: "#ffffff", padding: "0.2rem 0.6rem", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 700 }}>
                SESSION REPORT
              </span>
              <h3 style={{ margin: "0.4rem 0 0 0", color: "#14532d", fontSize: "1.2rem" }}>
                Completed: {sessionSummary.equipment_name}
              </h3>
            </div>
            <button
              onClick={() => setSessionSummary(null)}
              style={{ background: "transparent", border: "1px solid #86efac", padding: "0.3rem 0.7rem", borderRadius: "6px", cursor: "pointer", color: "#15803d", fontWeight: 600 }}
            >
              Dismiss ✕
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "0.75rem", margin: "1rem 0" }}>
            <div style={{ background: "#ffffff", padding: "0.75rem", borderRadius: "8px", border: "1px solid #bbf7d0" }}>
              <span style={{ fontSize: "0.7rem", color: "#64748b" }}>DURATION</span>
              <strong style={{ display: "block", color: "#0f172a" }}>{formatTime(sessionSummary.duration_seconds)}</strong>
            </div>
            <div style={{ background: "#ffffff", padding: "0.75rem", borderRadius: "8px", border: "1px solid #bbf7d0" }}>
              <span style={{ fontSize: "0.7rem", color: "#64748b" }}>POWER OUTPUT</span>
              <strong style={{ display: "block", color: "#0f172a" }}>{sessionSummary.avg_power_watts} W</strong>
            </div>
            <div style={{ background: "#ffffff", padding: "0.75rem", borderRadius: "8px", border: "1px solid #bbf7d0" }}>
              <span style={{ fontSize: "0.7rem", color: "#64748b" }}>PEAK CADENCE</span>
              <strong style={{ display: "block", color: "#0f172a" }}>{sessionSummary.peak_cadence_rpm} RPM</strong>
            </div>
            <div style={{ background: "#ffffff", padding: "0.75rem", borderRadius: "8px", border: "1px solid #bbf7d0" }}>
              <span style={{ fontSize: "0.7rem", color: "#64748b" }}>HEART RATE</span>
              <strong style={{ display: "block", color: "#0f172a" }}>
                {sessionSummary.heart_rate_recorded ? `${sessionSummary.heart_rate_recorded} BPM` : "No Sensor"}
              </strong>
            </div>
          </div>

          <p style={{ margin: 0, fontSize: "0.85rem", color: "#166534" }}>
            <strong>MQTT Telemetry Channel:</strong> <code>{sessionSummary.mqtt_topic_synced}</code>
          </p>
        </div>
      )}


      {/* =====================================
          SESSION TIMER
          ===================================== */}

      <div className="smart-gym-timer-card">

        <div className="smart-gym-timer-left">

          <span>
            SESSION TIME
          </span>

          <strong>
            {sessionActive
              ? formatTime(elapsedSeconds)
              : "00:00:00"}
          </strong>

        </div>

        <div
          className={
            `smart-gym-timer-status ${
              sessionActive
                ? "active"
                : ""
            }`
          }
        >

          <span className="status-dot"></span>

          {sessionActive
            ? "Session Active"
            : "Session Ready"}

        </div>

      </div>


      {/* =====================================
          SESSION OVERVIEW
          ===================================== */}

      <div className="smart-gym-overview">

        <div className="smart-gym-overview-main">

          <span>
            CURRENT SESSION
          </span>

          <h2>
            {smartGym?.session?.activity ||
              (sessionActive ? `Active on ${smartGym?.session?.active_machine}` : "No active workout")}
          </h2>

          <p>
            System status:{" "}

            <strong>
              {smartGym?.session?.status ||
                "Ready"}
            </strong>
          </p>

        </div>


        <div className="smart-gym-overview-stat">

          <span>
            CONNECTED DEVICES
          </span>

          <strong>
            {smartGym?.equipment?.length || 4}
          </strong>

          <small>
            IoT Sensor fleet
          </small>

        </div>


        <div className="smart-gym-overview-stat">

          <span>
            PERFORMANCE
          </span>

          <strong>
            {sessionActive ? `${smartGym?.session?.live_metrics?.power_watts || 180}W` : "Waiting"}
          </strong>

          <small>
            current session
          </small>

        </div>

      </div>


      {/* =====================================
          EQUIPMENT (INTERACTIVE SELECTION & LIVE TELEMETRY)
          ===================================== */}

      <div className="smart-gym-section">

        <div className="smart-gym-section-header">

          <div>

            <span>
              IOT MONITORING
            </span>

            <h2>
              Gym Equipment
            </h2>

            <p>
              Equipment status from the Smart Gym
              monitoring system. Click any machine to start a session.
            </p>

          </div>

          <div className="smart-gym-section-icon">
            IOT
          </div>

        </div>


        <div className="smart-gym-equipment-list">

          {smartGym?.equipment?.length > 0 ? (

            smartGym.equipment.map(
              (equipment, index) => {
                const isThisInUse = equipment.status === "In Use";

                return (
                  <div
                    className="smart-gym-equipment-item"
                    key={index}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                      cursor: !sessionActive ? "pointer" : "default"
                    }}
                    onClick={() => {
                      if (!sessionActive) {
                        setSelectedMachine(equipment.name);
                        handleStartSession(equipment.name);
                      }
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div className="smart-gym-equipment-number">
                          {String(index + 1)
                            .padStart(2, "0")}
                        </div>

                        <div className="smart-gym-equipment-info">
                          <strong>
                            {equipment.name}
                          </strong>
                          <p>
                            {equipment.activity || "Fitness equipment"}
                          </p>
                        </div>
                      </div>

                      <span className={`smart-gym-equipment-status ${isThisInUse ? "active" : "available"}`}>
                        {equipment.status || "Available"}
                      </span>
                    </div>

                    {/* LIVE TELEMETRY READOUTS */}
                    {equipment.telemetry && (
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "0.4rem 0.8rem",
                        background: "#f8fafc",
                        borderRadius: "6px",
                        fontSize: "0.8rem",
                        color: "#475569"
                      }}>
                        <span>Cadence: <strong>{equipment.telemetry.cadence_rpm || 0} RPM</strong></span>
                        <span>Power: <strong>{equipment.telemetry.power_watts || 0} W</strong></span>
                        <span>Resistance: <strong>Lvl {equipment.telemetry.resistance_level || 1}</strong></span>
                        <span>
                          HR: <strong>{equipment.telemetry.heart_rate_bpm ? `${equipment.telemetry.heart_rate_bpm} BPM` : "No Sensor"}</strong>
                        </span>
                      </div>
                    )}
                  </div>
                );
              }
            )

          ) : (

            <div className="smart-gym-empty">
              No equipment information available.
            </div>

          )}

        </div>

      </div>


      {/* =====================================
          AI RECOMMENDATION
          ===================================== */}

      <div className="smart-gym-recommendation">

        <div className="smart-gym-recommendation-icon">
          AI
        </div>

        <div>

          <span>
            AI RECOMMENDATION
          </span>

          <h2>
            {smartGym?.ai_recommendation?.title ||
              "Stay consistent with your workout"}
          </h2>

          <p>
            {smartGym?.ai_recommendation?.description ||
              "Follow your planned activity and monitor your session regularly."}
          </p>

        </div>

      </div>


      {/* =====================================
          RECOVERY
          ===================================== */}

      <div className="smart-gym-rest-card">

        <div className="smart-gym-rest-icon">
          R
        </div>

        <div>

          <span>
            RECOVERY ASSISTANCE
          </span>

          <h2>
            {smartGym?.rest_recommendation?.title ||
              "Remember to take appropriate rest"}
          </h2>

          <p>
            {smartGym?.rest_recommendation?.description ||
              "Allow adequate recovery between workout activities."}
          </p>

        </div>

      </div>

    </div>
  );
}

export default SmartGymPage;