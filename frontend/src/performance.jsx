import { useEffect, useState } from "react";

function Performance({ refreshKey }) {
  const [performance, setPerformance] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadPerformance = async () => {
    const token =
      localStorage.getItem("access_token");

    if (!token) {
      setError("You are not logged in.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "https://ai-gym-fitness-assistant-ajkp.onrender.com/performance/",
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.detail ||
          "Failed to load performance"
        );
        return;
      }

      setPerformance(data);
    } catch (error) {
      setError(
        "Unable to connect to backend"
      );
    } finally {
      setLoading(false);
    }
  };

 useEffect(() => {
  loadPerformance();
}, [refreshKey]);
  if (loading) {
    return (
      <div className="performance-page">
        <h2>Performance Analyzer</h2>
        <p>Loading performance data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="performance-page">
        <h2>Performance Analyzer</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="performance-page">

      <h2>Performance Analyzer</h2>

      <p>
        Track your workout activity and
        performance progress.
      </p>

      <div className="performance-cards">

        <div className="performance-card">
          <h3>Total Workouts</h3>
          <strong>
            {performance.total_workouts}
          </strong>
          <p>Workouts completed</p>
        </div>

        <div className="performance-card">
          <h3>Total Reps</h3>
          <strong>
            {performance.total_reps}
          </strong>
          <p>Total repetitions</p>
        </div>

        <div className="performance-card">
          <h3>Total Duration</h3>
          <strong>
            {performance.total_duration}
          </strong>
          <p>Minutes</p>
        </div>

        <div className="performance-card">
          <h3>Average Reps</h3>
          <strong>
            {performance.average_reps}
          </strong>
          <p>Reps per workout</p>
        </div>

      </div>

      <div className="score-card">

        <h3>Performance Score</h3>

        <div className="score">
          {performance.performance_score}
          <span>/100</span>
        </div>

        <p>
          Based on your recorded workout
          activity.
        </p>

      </div>

      <div className="recent-workouts">

        <h3>Recent Workouts</h3>

        {performance.recent_workouts.length === 0 ? (

          <p>
            No workouts recorded yet.
          </p>

        ) : (

          performance.recent_workouts.map(
            (workout) => (

              <div
                className="recent-workout"
                key={workout.id}
              >

                <div>
                  <strong>
                    {workout.exercise_name}
                  </strong>

                  <p>
                    {workout.workout_date}
                  </p>
                </div>

                <div>
                  <span>
                    Sets:{" "}
                    {workout.sets ?? "-"}
                  </span>

                  <span>
                    Reps:{" "}
                    {workout.reps ?? "-"}
                  </span>

                  <span>
                    Duration:{" "}
                    {workout.duration ?? "-"} min
                  </span>
                </div>

              </div>

            )
          )

        )}

      </div>

    </div>
  );
}

export default Performance;