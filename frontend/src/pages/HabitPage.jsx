import { useEffect, useState } from "react";

function HabitPage() {
  const [habit, setHabit] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchHabit = async () => {
      if (!token) return;

      try {
        const response = await fetch(
          "https://ai-gym-fitness-assistant-ajkp.onrender.com/habit/",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          setHabit(data);
        }
      } catch {
        console.log("Unable to load habit data.");
      } finally {
        setLoading(false);
      }
    };

    fetchHabit();
  }, []);

  const consistency = habit?.consistency_percentage ?? 0;
  const streak = habit?.current_streak ?? 0;
  const activeDays = habit?.active_days ?? 0;
  const weeklyWorkouts = habit?.weekly_workouts ?? 0;

  return (
    <div className="habit-page-new">

      {/* HEADER */}

      <div className="habit-top">
        <div>
          <span className="habit-label">
            CONSISTENCY TRACKER
          </span>

          <h1>My Habits</h1>

          <p>
            Keep track of your workout consistency,
            active days, and current streak.
          </p>
        </div>

        <div className="habit-streak-mini">
          <strong>{streak}</strong>
          <span>day streak</span>
        </div>
      </div>

      {/* MAIN OVERVIEW */}

      <div className="habit-overview">

        <div className="habit-main-score">

          <div className="habit-circle">
            <div>
              <strong>{consistency}%</strong>
              <span>Consistency</span>
            </div>
          </div>

          <div className="habit-score-content">
            <span>WEEKLY CONSISTENCY</span>

            <h2>
              Your activity this week
            </h2>

            <p>
              Your consistency is based on the number
              of active workout days during the last 7 days.
            </p>
          </div>

        </div>

        <div className="habit-overview-stat">
          <span>Active Days</span>
          <strong>{activeDays}</strong>
          <small>out of 7 days</small>
        </div>

        <div className="habit-overview-stat">
          <span>Weekly Workouts</span>
          <strong>{weeklyWorkouts}</strong>
          <small>recorded this week</small>
        </div>

      </div>

      {/* STATISTICS */}

      <div className="habit-stat-grid">

        <div className="habit-stat-card">
          <span>Current Streak</span>

          <strong>{streak}</strong>

          <small>
            consecutive active days
          </small>
        </div>

        <div className="habit-stat-card">
          <span>Active Days</span>

          <strong>{activeDays}</strong>

          <small>
            active days in the last 7
          </small>
        </div>

        <div className="habit-stat-card">
          <span>Weekly Workouts</span>

          <strong>{weeklyWorkouts}</strong>

          <small>
            workouts this week
          </small>
        </div>

        <div className="habit-stat-card">
          <span>Consistency</span>

          <strong>{consistency}%</strong>

          <small>
            weekly activity rate
          </small>
        </div>

      </div>

      {/* WEEKLY ACTIVITY */}

      <div className="habit-activity-section">

        <div className="habit-section-title">
          <div>
            <span>LAST 7 DAYS</span>

            <h2>Weekly Activity</h2>

            <p>
              Your recent workout consistency.
            </p>
          </div>
        </div>

        <div className="habit-week-grid">

          {loading ? (
            <div className="habit-loading">
              Loading activity...
            </div>
          ) : (
            Array.from({ length: 7 }).map((_, index) => (
              <div
                className={`habit-day ${
                  index < activeDays
                    ? "active"
                    : ""
                }`}
                key={index}
              >
                <span>
                  {index + 1}
                </span>

                <div className="habit-day-bar">
                  <div />
                </div>

                <small>
                  {index < activeDays
                    ? "Active"
                    : "Rest"}
                </small>
              </div>
            ))
          )}

        </div>

      </div>

      {/* INSIGHT */}

      <div className="habit-insight">

        <div className="habit-insight-mark">
          i
        </div>

        <div>
          <span>ACTIVITY INSIGHT</span>

          <p>
            {habit?.insight ||
              "Start recording workouts to track your consistency."}
          </p>
        </div>

      </div>

      {/* LAST WORKOUT */}

      {habit?.last_workout && (
        <div className="habit-last-workout">

          <div>
            <span>LAST RECORDED WORKOUT</span>

            <h2>
              {habit.last_workout.exercise_name}
            </h2>
          </div>

          <strong>
            {habit.last_workout.date}
          </strong>

        </div>
      )}

    </div>
  );
}

export default HabitPage;