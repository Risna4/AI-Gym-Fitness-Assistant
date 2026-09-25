import React from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

export default function ProgramDetailPage() {
  const { programId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const goal = (searchParams.get("goal") || "weight loss").toLowerCase();
  const isWeightGain = goal.includes("gain") || goal.includes("muscle") || goal.includes("bulk");

  // Adaptive data definition
  const programDetails = {
    title: isWeightGain ? "Full Body Mass Builder" : "Full Body Fitness Program",
    category: isWeightGain ? "Hypertrophy & Strength" : "Fat Loss & Conditioning",
    calorieFocus: isWeightGain ? "Surplus (+350 to +500 kcal)" : "Deficit (-400 to -500 kcal)",
    description: isWeightGain
      ? "A multi-day structured resistance program targeting myofibrillar hypertrophy with heavy compound movements and progressive overload."
      : "A high-metabolic functional training split combining multi-joint compound resistance with high-tempo sets to maximize daily active energy expenditure.",
    days: [
      {
        day: "Day 1 - Full Body Foundation",
        exercises: [
          { name: "Barbell / Bodyweight Squats", sets: 4, reps: isWeightGain ? "8-10 reps" : "15-20 reps", rest: isWeightGain ? "90s" : "45s" },
          { name: "Bicep Dumbbell Curls", sets: 3, reps: isWeightGain ? "10-12 reps" : "15 reps", rest: isWeightGain ? "75s" : "45s" },
          { name: "Push-ups / Chest Press", sets: 3, reps: isWeightGain ? "8-10 reps" : "12-15 reps", rest: isWeightGain ? "90s" : "45s" },
          { name: "Core Planks", sets: 3, reps: "45 sec hold", rest: "30s" }
        ]
      },
      {
        day: "Day 2 - Posterior Chain & Functional Movement",
        exercises: [
          { name: "Romanian Deadlifts", sets: 3, reps: isWeightGain ? "8-10 reps" : "12-15 reps", rest: isWeightGain ? "90s" : "45s" },
          { name: "Walking Lunges", sets: 3, reps: "12 reps/leg", rest: "60s" },
          { name: "Overhead Shoulder Press", sets: 3, reps: isWeightGain ? "10 reps" : "15 reps", rest: isWeightGain ? "75s" : "45s" }
        ]
      },
      {
        day: "Day 3 - Active Recovery & Mobility",
        exercises: [
          { name: "Hip Flexor & Hamstring Stretching", sets: 1, reps: "15 mins", rest: "None" },
          { name: isWeightGain ? "Protein & Calorie Surplus Check" : "Low Intensity Cardio (Zone 2)", sets: 1, reps: "30 mins", rest: "Steady" }
        ]
      },
      {
        day: "Day 4 - Full Body Density Circuit",
        exercises: [
          { name: "Squats (AI Pose Tracked)", sets: 4, reps: isWeightGain ? "10 reps" : "15-20 reps", rest: isWeightGain ? "75s" : "45s" },
          { name: "Alternating Hammer Curls", sets: 3, reps: "12 reps", rest: "60s" },
          { name: "Mountain Climbers / Burpees", sets: 3, reps: isWeightGain ? "30 sec" : "45 sec", rest: "30s" }
        ]
      }
    ]
  };

  return (
    <div style={{ padding: "2.5rem 1.5rem", maxWidth: "960px", margin: "0 auto" }}>
      {/* BACK BUTTON */}
      <button
        onClick={() => navigate("/planner")}
        style={{
          background: "#f1f5f9",
          border: "none",
          padding: "0.6rem 1.2rem",
          borderRadius: "8px",
          color: "#475569",
          fontWeight: 600,
          cursor: "pointer",
          marginBottom: "1.5rem"
        }}
      >
        ← Back to Planner
      </button>

      {/* HEADER CARD */}
      <div style={{ background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "2rem", marginBottom: "2rem", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <span style={{ background: "#ede9fe", color: "#6366f1", padding: "0.3rem 0.8rem", borderRadius: "20px", fontSize: "0.8rem", fontWeight: 700 }}>
            {programId ? programId.toUpperCase() : "PROGRAM"}
          </span>
          <span style={{ background: isWeightGain ? "#ecfdf5" : "#eff6ff", color: isWeightGain ? "#059669" : "#2563eb", padding: "0.3rem 0.8rem", borderRadius: "20px", fontSize: "0.8rem", fontWeight: 700 }}>
            Goal: {goal.toUpperCase()}
          </span>
        </div>

        <h1 style={{ fontSize: "2rem", color: "#0f172a", margin: "0 0 0.5rem 0", fontWeight: 700 }}>
          {programDetails.title}
        </h1>
        <p style={{ color: "#64748b", margin: "0 0 1.5rem 0", fontSize: "1rem", lineHeight: 1.5 }}>
          {programDetails.description}
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", padding: "1rem", background: "#f8fafc", borderRadius: "10px" }}>
          <div>
            <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 700 }}>FOCUS</span>
            <p style={{ margin: "0.2rem 0 0 0", color: "#1e293b", fontWeight: 600 }}>{programDetails.category}</p>
          </div>
          <div>
            <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 700 }}>NUTRITION TARGET</span>
            <p style={{ margin: "0.2rem 0 0 0", color: "#1e293b", fontWeight: 600 }}>{programDetails.calorieFocus}</p>
          </div>
        </div>
      </div>

      {/* SCHEDULE */}
      <h2 style={{ fontSize: "1.4rem", color: "#0f172a", margin: "0 0 1.25rem 0" }}>Weekly Training Schedule</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {programDetails.days.map((d, idx) => (
          <div key={idx} style={{ background: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", borderBottom: "1px solid #f1f5f9", paddingBottom: "0.75rem" }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#1e293b" }}>{d.day}</h3>
              <button
                onClick={() => navigate("/trainer")}
                style={{
                  background: "#4f46e5",
                  color: "#ffffff",
                  border: "none",
                  padding: "0.4rem 0.9rem",
                  borderRadius: "6px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Track in AI Trainer →
              </button>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ color: "#94a3b8", fontSize: "0.8rem" }}>
                  <th style={{ padding: "0.5rem 0" }}>EXERCISE</th>
                  <th style={{ padding: "0.5rem 0" }}>SETS</th>
                  <th style={{ padding: "0.5rem 0" }}>REPS</th>
                  <th style={{ padding: "0.5rem 0" }}>REST</th>
                </tr>
              </thead>
              <tbody>
                {d.exercises.map((ex, exIdx) => (
                  <tr key={exIdx} style={{ borderBottom: "1px solid #f8fafc" }}>
                    <td style={{ padding: "0.6rem 0", fontWeight: 600, color: "#334155" }}>{ex.name}</td>
                    <td style={{ padding: "0.6rem 0", color: "#64748b" }}>{ex.sets}</td>
                    <td style={{ padding: "0.6rem 0", color: "#0f172a", fontWeight: 700 }}>{ex.reps}</td>
                    <td style={{ padding: "0.6rem 0", color: "#94a3b8" }}>{ex.rest}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}