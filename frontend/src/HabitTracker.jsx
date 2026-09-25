import { useEffect, useState } from "react";

function HabitTracker({ refreshKey }) {
  const [habit, setHabit] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadHabitData = async () => {
    const token =
      localStorage.getItem("access_token");

    if (!token) {
      setError("You are not logged in.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/habit/",
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
          "Failed to load habit data"
        );
        return;
      }

      setHabit(data);

    } catch (error) {
      setError(
        "Unable to connect to backend"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  loadHabitData();
}, [refreshKey]);

  if (loading) {
    return (
      <div className="habit-page">
        <h2>AI Fitness Habit Tracker</h2>
        <p>
          Loading your activity data...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="habit-page">
        <h2>AI Fitness Habit Tracker</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="habit-page">

      <h2>AI Fitness Habit Tracker</h2>

      <p>
        Track your workout consistency
        and fitness habits.
      </p>

      <div className="habit-cards">

        <div className="habit-card">
          <h3>Weekly Workouts</h3>

          <strong>
            {habit.weekly_workouts}
          </strong>

          <p>
            Workouts in the last 7 days
          </p>
        </div>

        <div className="habit-card">
          <h3>Active Days</h3>

          <strong>
            {habit.active_days}
          </strong>

          <p>
            Active days this week
          </p>
        </div>

        <div className="habit-card">
          <h3>Consistency</h3>

          <strong>
            {habit.consistency_percentage}%
          </strong>

          <p>
            Weekly activity consistency
          </p>
        </div>

        <div className="habit-card">
          <h3>Current Streak</h3>

          <strong>
            {habit.current_streak}
          </strong>

          <p>
            Consecutive active days
          </p>
        </div>

      </div>

      <div className="habit-insight">

        <h3>Activity Insight</h3>

        <p>
          {habit.insight}
        </p>

      </div>

      <div className="last-workout">

        <h3>Last Workout</h3>

        {habit.last_workout ? (

          <>
            <p>
              <strong>Exercise:</strong>{" "}
              {habit.last_workout.exercise_name}
            </p>

            <p>
              <strong>Date:</strong>{" "}
              {habit.last_workout.date}
            </p>
          </>

        ) : (

          <p>
            No workouts have been recorded yet.
          </p>

        )}

      </div>

    </div>
  );
}

export default HabitTracker;