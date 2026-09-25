import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function DashboardPage({ user }) {
  const navigate = useNavigate();

  const [performance, setPerformance] = useState(null);
  const [habit, setHabit] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [smartGym, setSmartGym] = useState(null);

  const [loading, setLoading] = useState(true);


  /*
   * LOAD DASHBOARD DATA
   */

  useEffect(() => {
    const token =
      localStorage.getItem("access_token");

    if (!token) {
      setLoading(false);
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`
    };

    const loadDashboard = async () => {
      try {
        const [
          performanceResponse,
          habitResponse,
          workoutResponse,
          smartGymResponse
        ] = await Promise.all([
          fetch(
            "https://ai-gym-fitness-assistant-ajkp.onrender.com/performance/",
            { headers }
          ),

          fetch(
            "https://ai-gym-fitness-assistant-ajkp.onrender.com/habit/",
            { headers }
          ),

          fetch(
            "https://ai-gym-fitness-assistant-ajkp.onrender.com/workouts/",
            { headers }
          ),

          fetch(
            "https://ai-gym-fitness-assistant-ajkp.onrender.com/smart-gym/",
            { headers }
          )
        ]);

        if (performanceResponse.ok) {
          setPerformance(
            await performanceResponse.json()
          );
        }

        if (habitResponse.ok) {
          setHabit(
            await habitResponse.json()
          );
        }

        if (workoutResponse.ok) {
          setWorkouts(
            await workoutResponse.json()
          );
        }

        if (smartGymResponse.ok) {
          setSmartGym(
            await smartGymResponse.json()
          );
        }

      } catch {
        console.log(
          "Unable to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();

  }, []);


  /*
   * QUICK ACTIONS
   */

  const quickActions = [
    {
      title: "AI Gym Trainer",
      description:
        "Analyze your exercise form with AI.",
      icon: "🏋️",
      path: "/trainer"
    },

    {
      title: "AI Dietician",
      description:
        "Get general nutrition guidance.",
      icon: "🥗",
      path: "/dietician"
    },

    {
      title: "Virtual Gym Buddy",
      description:
        "Chat with your fitness companion.",
      icon: "💬",
      path: "/buddy"
    },

    {
      title: "Gym Planner",
      description:
        "Explore gyms and fitness plans.",
      icon: "📅",
      path: "/planner"
    }
  ];


  /*
   * SMART GYM STATUS
   */

  const smartGymActive =
    smartGym?.session?.status === "Active";


  /*
   * LOADING
   */

  if (loading) {
    return (
      <div className="dashboard-loading">

        <div className="dashboard-loading-mark">
          AI
        </div>

        <h2>
          Preparing your dashboard
        </h2>

        <p>
          Loading your fitness activity...
        </p>

      </div>
    );
  }


  return (
    <div className="dashboard-page">

      {/* =====================================
          HERO
          ===================================== */}

      <section className="dashboard-hero">

        <div>

          <p className="dashboard-eyebrow">
            YOUR FITNESS SPACE
          </p>

          <h1>
            Welcome back,{" "}
            <span>
              {user?.name || "User"}
            </span>{" "}
            👋
          </h1>

          <p className="dashboard-subtitle">
            Keep building healthy and consistent
            fitness habits with your AI assistant.
          </p>

          <button
            className="primary-action"
            onClick={() =>
              navigate("/trainer")
            }
          >
            <span>
              Start Workout
            </span>

            <span>
              →
            </span>

          </button>

        </div>


        <div className="hero-visual">

          <div className="hero-circle">

            <div className="hero-icon">
              🏋️
            </div>

          </div>

        </div>

      </section>


      {/* =====================================
          OVERVIEW
          ===================================== */}

      <section className="dashboard-section">

        <div className="section-heading">

          <div>

            <h2>
              Your Overview
            </h2>

            <p>
              A quick look at your recent
              fitness activity.
            </p>

          </div>

        </div>


        <div className="stats-grid">

          {/* WORKOUTS */}

          <div className="stat-card">

            <div className="stat-icon workout-stat">
              🏋️
            </div>

            <div>

              <span>
                Total Workouts
              </span>

              <strong>
                {performance?.total_workouts ??
                  workouts.length}
              </strong>

            </div>

          </div>


          {/* PERFORMANCE */}

          <div className="stat-card">

            <div className="stat-icon score-stat">
              📈
            </div>

            <div>

              <span>
                Performance Score
              </span>

              <strong>
                {performance?.performance_score ??
                  0}

                <small>
                  /100
                </small>

              </strong>

            </div>

          </div>


          {/* STREAK */}

          <div className="stat-card">

            <div className="stat-icon streak-stat">
              🔥
            </div>

            <div>

              <span>
                Current Streak
              </span>

              <strong>
                {habit?.current_streak ??
                  0}

                <small>
                  {" "}days
                </small>

              </strong>

            </div>

          </div>


          {/* ACTIVE DAYS */}

          <div className="stat-card">

            <div className="stat-icon activity-stat">
              ⚡
            </div>

            <div>

              <span>
                Active Days
              </span>

              <strong>
                {habit?.active_days ??
                  0}

                <small>
                  /7
                </small>

              </strong>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================
          SMART GYM STATUS
          ===================================== */}

      <section className="dashboard-section">

        <div className="dashboard-smart-gym">

          <div className="dashboard-smart-gym-main">

            <div className="dashboard-smart-gym-icon">
              AI
            </div>

            <div>

              <span>
                SMART GYM ASSISTANT
              </span>

              <h2>
                {smartGymActive
                  ? "Workout session is active"
                  : "Smart Gym is ready"}
              </h2>

              <p>
                {smartGymActive
                  ? "Your current gym session is being monitored."
                  : "Start a session to monitor your workout and gym activity."}
              </p>

            </div>

          </div>


          <div className="dashboard-smart-gym-right">

            <div className="dashboard-smart-gym-status">

              <span className="status-dot"></span>

              {smartGymActive
                ? "Session Active"
                : "System Ready"}

            </div>

            <button
              className="secondary-action"
              onClick={() =>
                navigate("/smart-gym")
              }
            >
              Open Smart Gym →
            </button>

          </div>

        </div>

      </section>


      {/* =====================================
          QUICK ACTIONS
          ===================================== */}

      <section className="dashboard-section">

        <div className="section-heading">

          <div>

            <h2>
              Quick Actions
            </h2>

            <p>
              Access your AI fitness tools.
            </p>

          </div>

        </div>


        <div className="quick-action-grid">

          {quickActions.map(
            (action) => (

              <button
                key={action.path}
                className="quick-action-card"
                onClick={() =>
                  navigate(action.path)
                }
              >

                <div className="quick-action-icon">
                  {action.icon}
                </div>

                <div className="quick-action-content">

                  <h3>
                    {action.title}
                  </h3>

                  <p>
                    {action.description}
                  </p>

                  <span className="action-link">
                    Open →
                  </span>

                </div>

              </button>

            )
          )}

        </div>

      </section>


      {/* =====================================
          BOTTOM GRID
          ===================================== */}

      <section className="dashboard-bottom-grid">


        {/* =====================================
            RECENT WORKOUTS
            ===================================== */}

        <div className="dashboard-panel">

          <div className="panel-header">

            <div>

              <h2>
                Recent Workouts
              </h2>

              <p>
                Your latest activity
              </p>

            </div>

            <button
              onClick={() =>
                navigate("/workouts")
              }
            >
              View all →
            </button>

          </div>


          {workouts.length === 0 ? (

            <div className="empty-state">

              <div>
                🏋️
              </div>

              <p>
                No workouts recorded yet.
              </p>

              <button
                onClick={() =>
                  navigate("/trainer")
                }
              >
                Start your first workout
              </button>

            </div>

          ) : (

            <div className="recent-workout-list">

              {workouts
                .slice(0, 4)
                .map((workout) => (

                  <div
                    className="recent-workout-item"
                    key={workout.id}
                  >

                    <div className="workout-mini-icon">
                      🏋️
                    </div>

                    <div className="workout-mini-info">

                      <strong>
                        {workout.exercise_name}
                      </strong>

                      <span>
                        {workout.workout_date}
                      </span>

                    </div>

                    <div className="workout-mini-value">

                      {workout.reps != null && (

                        <strong>
                          {workout.reps}
                        </strong>

                      )}

                      <span>
                        {workout.reps != null
                          ? "reps"
                          : "Workout"}
                      </span>

                    </div>

                  </div>

                ))}

            </div>

          )}

        </div>


        {/* =====================================
            CONSISTENCY
            ===================================== */}

        <div className="dashboard-panel consistency-panel">

          <div className="panel-header">

            <div>

              <h2>
                Weekly Consistency
              </h2>

              <p>
                Last 7 days
              </p>

            </div>

            <span className="consistency-icon">
              🔥
            </span>

          </div>


          <div className="consistency-score">

            <strong>
              {habit?.consistency_percentage ??
                0}%
            </strong>

            <span>
              consistency
            </span>

          </div>


          <div className="consistency-bar">

            <div
              style={{
                width: `${
                  habit?.consistency_percentage ??
                  0
                }%`
              }}
            />

          </div>


          <p className="consistency-message">

            {habit?.insight ||
              "Start recording workouts to track your consistency."}

          </p>


          <button
            className="secondary-action"
            onClick={() =>
              navigate("/habits")
            }
          >
            View Habit Tracker
          </button>

        </div>

      </section>


      {/* =====================================
          PROFILE SUMMARY
          ===================================== */}

      <section className="dashboard-profile-summary">

        <div>

          <span>
            FITNESS PROFILE
          </span>

          <h2>
            {user?.name || "User"}
          </h2>

          <p>
            Goal:{" "}
            <strong>
              {user?.fitness_goal ||
                "General Fitness"}
            </strong>
          </p>

        </div>


        <button
          className="secondary-action"
          onClick={() =>
            navigate("/profile")
          }
        >
          View Profile →
        </button>

      </section>

    </div>
  );
}

export default DashboardPage;