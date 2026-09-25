import { useState } from "react";

import Workout from "./Workout";
import Camera from "./Camera";
import Performance from "./performance";
import Dietician from "./Dietician";
import HabitTracker from "./HabitTracker";
import GymBuddy from "./GymBuddy";
import GymPlanner from "./GymPlanner";
import AdminDashboard from "./AdminDashboard";


function Dashboard({ user, onLogout }) {
  const [workoutRefresh, setWorkoutRefresh] = useState(0);


  const handleWorkoutSaved = () => {
    setWorkoutRefresh((previous) => previous + 1);
  };


  return (
    <div className="dashboard-content">

      {/* Welcome Section */}
      <div className="welcome">
        <h2>
          Welcome, {user.name}!
        </h2>

        <p>
          Your AI fitness journey starts here.
        </p>
      </div>


      {/* Profile Section */}
      <div className="profile-card">
        <h2>Your Profile</h2>

        <div className="profile-info">

          <div>
            <strong>Name</strong>
            <p>{user.name}</p>
          </div>

          <div>
            <strong>Email</strong>
            <p>{user.email}</p>
          </div>

          <div>
            <strong>Age</strong>
            <p>
              {user.age ?? "Not provided"}
            </p>
          </div>

          <div>
            <strong>Weight</strong>
            <p>
              {user.weight
                ? `${user.weight} kg`
                : "Not provided"}
            </p>
          </div>

          <div>
            <strong>Height</strong>
            <p>
              {user.height
                ? `${user.height} cm`
                : "Not provided"}
            </p>
          </div>

          <div>
            <strong>Fitness Goal</strong>
            <p>
              {user.fitness_goal ??
                "Not provided"}
            </p>
          </div>

        </div>
      </div>


      {/* Main Feature Cards */}
      <div className="card-container">

        <div className="card">
          <h3>AI Gym Trainer</h3>
          <p>
            Analyze your exercise form and
            workout performance.
          </p>
        </div>

        <div className="card">
          <h3>AI Dietician</h3>
          <p>
            Get personalized general nutrition
            guidance.
          </p>
        </div>

        <div className="card">
          <h3>Habit Tracker</h3>
          <p>
            Track your fitness habits and
            consistency.
          </p>
        </div>

        <div className="card">
          <h3>Virtual Gym Buddy</h3>
          <p>
            Interact with your AI fitness
            companion.
          </p>
        </div>

        <div className="card">
          <h3>Performance Analyzer</h3>
          <p>
            View your workout performance
            and progress.
          </p>
        </div>

        <div className="card">
          <h3>Gym Planner</h3>
          <p>
            Plan your workouts and fitness
            activities.
          </p>
        </div>

      </div>


      {/* AI Gym Trainer / Camera */}
      <Camera
        onWorkoutSaved={handleWorkoutSaved}
      />


      {/* Workout History */}
      <Workout
        refreshKey={workoutRefresh}
      />


      {/* Performance Analyzer */}
      <Performance
        refreshKey={workoutRefresh}
      />


      {/* AI Dietician */}
      <Dietician />


      {/* Virtual Gym Buddy */}
      <GymBuddy />


      {/* Gym Planner */}
      <GymPlanner />


      {/* Habit Tracker */}
      <HabitTracker
        refreshKey={workoutRefresh}
      />


      {/* Admin Dashboard
          Only visible to admin users */}
      {user.is_admin && (
        <AdminDashboard />
      )}


      {/* Logout */}
      <button
        className="logout-button"
        onClick={onLogout}
      >
        Logout
      </button>

    </div>
  );
}


export default Dashboard;