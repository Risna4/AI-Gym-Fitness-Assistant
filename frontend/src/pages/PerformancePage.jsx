import { useEffect, useState } from "react";

function PerformancePage() {
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("access_token");

  const fetchPerformance = async () => {
    if (!token) return;

    try {
      const response = await fetch(
        "https://ai-gym-fitness-assistant-ajkp.onrender.com/performance/",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPerformance(data);
      }
    } catch {
      console.log("Unable to load performance.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformance();
  }, []);

  const score = performance?.performance_score ?? 0;

  return (
    <div className="performance-page-new">

      {/* HEADER */}

      <div className="performance-top">
        <div>
          <span className="performance-label">
            PERFORMANCE ANALYTICS
          </span>

          <h1>My Performance</h1>

          <p>
            Understand your workout activity and track
            your progress over time.
          </p>
        </div>

        <div className="performance-score-mini">
          <strong>{score}</strong>
          <span>/100 score</span>
        </div>
      </div>

      {/* MAIN SCORE */}

      <div className="performance-overview">

        <div className="performance-score-section">
          <div className="score-circle">
            <div>
              <strong>{score}</strong>
              <span>Score</span>
            </div>
          </div>

          <div className="score-content">
            <span>OVERALL PERFORMANCE</span>

            <h2>
              Your current activity score
            </h2>

            <p>
              This score is calculated from your recorded
              workout activity, repetitions, and duration.
            </p>
          </div>
        </div>

        <div className="performance-overview-stat">
          <span>Total Workouts</span>
          <strong>
            {performance?.total_workouts ?? 0}
          </strong>
        </div>

        <div className="performance-overview-stat">
          <span>Total Reps</span>
          <strong>
            {performance?.total_reps ?? 0}
          </strong>
        </div>

      </div>

      {/* STATISTICS */}

      <div className="performance-stat-grid">

        <div className="performance-stat-card">
          <span>Total Workouts</span>
          <strong>
            {performance?.total_workouts ?? 0}
          </strong>
          <small>recorded sessions</small>
        </div>

        <div className="performance-stat-card">
          <span>Total Repetitions</span>
          <strong>
            {performance?.total_reps ?? 0}
          </strong>
          <small>repetitions recorded</small>
        </div>

        <div className="performance-stat-card">
          <span>Average Reps</span>
          <strong>
            {performance?.average_reps ?? 0}
          </strong>
          <small>per workout</small>
        </div>

        <div className="performance-stat-card">
          <span>Total Duration</span>
          <strong>
            {performance?.total_duration ?? 0}
            <small> min</small>
          </strong>
          <small>training time</small>
        </div>

      </div>

      {/* RECENT ACTIVITY */}

      <div className="performance-history">

        <div className="performance-history-title">
          <div>
            <span>RECENT ACTIVITY</span>
            <h2>Workout Performance</h2>
          </div>

          <span className="performance-count">
            {performance?.recent_workouts?.length ?? 0} recent
          </span>
        </div>

        <div className="performance-table">

          <div className="performance-table-header">
            <span>EXERCISE</span>
            <span>SETS</span>
            <span>REPS</span>
            <span>DURATION</span>
            <span>CALORIES</span>
            <span>DATE</span>
          </div>

          {loading ? (
            <div className="performance-empty">
              Loading performance...
            </div>
          ) : !performance?.recent_workouts?.length ? (
            <div className="performance-empty">
              No workout activity recorded yet.
            </div>
          ) : (
            performance.recent_workouts.map((workout) => (
              <div
                className="performance-row"
                key={workout.id}
              >

                <div className="performance-exercise">
                  <div className="performance-exercise-mark">
                    {workout.exercise_name
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <strong>
                    {workout.exercise_name}
                  </strong>
                </div>

                <span>
                  {workout.sets ?? "—"}
                </span>

                <span>
                  {workout.reps ?? "—"}
                </span>

                <span>
                  {workout.duration != null
                    ? `${workout.duration} min`
                    : "—"}
                </span>

                <span>
                  {workout.calories_burned != null
                    ? workout.calories_burned
                    : "—"}
                </span>

                <span className="performance-date">
                  {workout.workout_date}
                </span>

              </div>
            ))
          )}

        </div>

      </div>

    </div>
  );
}

export default PerformancePage;