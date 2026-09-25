import React, { useEffect, useState } from "react";

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchWorkouts = async () => {
    setLoading(true);
    setError("");

    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("access_token") ||
      localStorage.getItem("jwt");

    if (!token) {
      setError("Please log in to view your workouts.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/workouts/", {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        setError("Your session has expired. Please log out and log in again.");
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      setWorkouts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching workouts:", err);
      setError("Failed to retrieve workouts from server. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  // Format: <60s -> "Xs", >=60s -> "Xm Ys" (or "Xm" if 0s)
  const formatDurationDynamic = (totalSec) => {
    const sec = Math.round(Number(totalSec) || 0);
    if (sec < 60) {
      return `${sec}s`;
    }
    const mins = Math.floor(sec / 60);
    const remainingSec = sec % 60;
    if (remainingSec === 0) {
      return `${mins}m`;
    }
    return `${mins}m ${remainingSec}s`;
  };

  // Optional: Function to clear past test history rows
  const handleClearHistory = async () => {
    if (!window.confirm("Are you sure you want to clear your workout history?")) return;

    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("access_token") ||
      localStorage.getItem("jwt");

    try {
      const response = await fetch("http://127.0.0.1:8000/workouts/clear-history", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        setWorkouts([]);
      } else {
        alert("Failed to clear history.");
      }
    } catch (err) {
      console.error("Error clearing history:", err);
    }
  };

  // Filter stats for TODAY only to avoid accumulating past test sessions
  const todayStr = new Date().toISOString().split("T")[0];
  const todayWorkouts = workouts.filter((w) => {
    if (!w.workout_date) return true;
    return String(w.workout_date).startsWith(todayStr);
  });

  const totalReps = todayWorkouts.reduce((sum, w) => sum + (Number(w.reps) || 0), 0);
  const totalSeconds = todayWorkouts.reduce((sum, w) => sum + (Number(w.duration) || 0), 0);
  const totalCalories = todayWorkouts.reduce((sum, w) => sum + (Number(w.calories_burned) || 0), 0).toFixed(1);

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      {/* PAGE HEADER */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "#0f172a", margin: "0 0 0.5rem 0" }}>
          Workouts
        </h1>
        <p style={{ color: "#64748b", margin: 0 }}>
          Track your training sessions and monitor your physical activity over time.
        </p>
      </div>

      {/* TOP DASHBOARD METRIC CARDS (TODAY'S STATS) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", marginBottom: "2rem" }}>
        <div style={{ background: "#ffffff", padding: "1.5rem", borderRadius: "12px", border: "1px solid #e2e8f0", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 600 }}>Total Repetitions (Today)</span>
          <h2 style={{ fontSize: "2.5rem", margin: "0.5rem 0 0", color: "#0f172a", fontWeight: 700 }}>{totalReps}</h2>
        </div>

        <div style={{ background: "#ffffff", padding: "1.5rem", borderRadius: "12px", border: "1px solid #e2e8f0", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 600 }}>Total Active Time (Today)</span>
          <h2 style={{ fontSize: "2.5rem", margin: "0.5rem 0 0", color: "#0f172a", fontWeight: 700 }}>
            {formatDurationDynamic(totalSeconds)}
          </h2>
        </div>

        <div style={{ background: "#ffffff", padding: "1.5rem", borderRadius: "12px", border: "1px solid #e2e8f0", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 600 }}>Calories Burned (Today)</span>
          <h2 style={{ fontSize: "2.5rem", margin: "0.5rem 0 0", color: "#0f172a", fontWeight: 700 }}>
            {totalCalories} <small style={{ fontSize: "1rem", color: "#64748b", fontWeight: 500 }}>kcal</small>
          </h2>
        </div>
      </div>

      {/* ERROR ALERT */}
      {error && (
        <div style={{ padding: "1rem", background: "#fee2e2", color: "#b91c1c", borderRadius: "8px", marginBottom: "1.5rem", border: "1px solid #f87171" }}>
          {error}
        </div>
      )}

      {/* WORKOUT HISTORY TABLE */}
      <div style={{ background: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div>
            <span style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Recent Logs
            </span>
            <h2 style={{ margin: "0.25rem 0 0", fontSize: "1.5rem", color: "#0f172a", fontWeight: 700 }}>
              Workout History
            </h2>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <span style={{ background: "#f1f5f9", padding: "0.4rem 0.85rem", borderRadius: "20px", fontSize: "0.85rem", fontWeight: 600, color: "#475569" }}>
              {workouts.length} total
            </span>
            {workouts.length > 0 && (
              <button
                onClick={handleClearHistory}
                style={{
                  background: "#fee2e2",
                  color: "#ef4444",
                  border: "none",
                  padding: "0.4rem 0.85rem",
                  borderRadius: "8px",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Clear History
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <p style={{ textAlign: "center", color: "#64748b", padding: "2rem" }}>Loading workout logs...</p>
        ) : workouts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
            <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>🏋️‍♂️</div>
            <p style={{ margin: 0, fontSize: "1rem" }}>No workouts recorded yet.</p>
            <small style={{ color: "#cbd5e1" }}>Go to the AI Trainer to start and save your workouts.</small>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #f1f5f9", color: "#64748b", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <th style={{ padding: "1rem" }}>EXERCISE</th>
                  <th style={{ padding: "1rem" }}>SETS</th>
                  <th style={{ padding: "1rem" }}>REPS</th>
                  <th style={{ padding: "1rem" }}>DURATION</th>
                  <th style={{ padding: "1rem" }}>CALORIES</th>
                  <th style={{ padding: "1rem" }}>DATE</th>
                </tr>
              </thead>
              <tbody>
                {workouts.map((w, idx) => (
                  <tr key={w.id || idx} style={{ borderBottom: "1px solid #f8fafc" }}>
                    <td style={{ padding: "1rem", fontWeight: 600, color: "#1e293b", display: "flex", alignItems: "center" }}>
                      <span style={{
                        display: "inline-block",
                        width: "32px",
                        height: "32px",
                        background: w.exercise_name?.toLowerCase().includes("squat") ? "#fce7f3" : "#ede9fe",
                        color: w.exercise_name?.toLowerCase().includes("squat") ? "#db2777" : "#7c3aed",
                        borderRadius: "8px",
                        textAlign: "center",
                        lineHeight: "32px",
                        fontWeight: 700,
                        marginRight: "12px"
                      }}>
                        {w.exercise_name?.charAt(0) || "W"}
                      </span>
                      {w.exercise_name}
                    </td>
                    <td style={{ padding: "1rem", color: "#475569" }}>{w.sets || 1}</td>
                    <td style={{ padding: "1rem", color: "#1e293b", fontWeight: 700 }}>{w.reps}</td>
                    <td style={{ padding: "1rem", color: "#475569", fontWeight: 600 }}>
                      {formatDurationDynamic(w.duration)}
                    </td>
                    <td style={{ padding: "1rem", color: "#475569" }}>
                      {w.calories_burned ? `${w.calories_burned} kcal` : "—"}
                    </td>
                    <td style={{ padding: "1rem", color: "#94a3b8", fontSize: "0.85rem" }}>
                      {w.workout_date || "Today"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}