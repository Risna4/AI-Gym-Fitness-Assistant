import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import {
  useEffect,
  useState
} from "react";

import Login from "./login";
import Register from "./register";

import Layout from "./components/Layout";

import DashboardPage from "./pages/DashboardPage";
import TrainerPage from "./pages/TrainerPage";
import WorkoutsPage from "./pages/WorkoutsPage";
import PerformancePage from "./pages/PerformancePage";
import HabitPage from "./pages/HabitPage";
import DieticianPage from "./pages/DieticianPage";
import BuddyPage from "./pages/BuddyPage";
import PlannerPage from "./pages/PlannerPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";
import SmartGymPage from "./pages/SmartGymPage";
import ProgramDetailPage from "./pages/ProgramDetailPage";
import "./App.css";


function App() {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {

    const token =
      localStorage.getItem("access_token");


    if (!token) {

      setLoading(false);

      return;
    }


    fetch(
      "https://ai-gym-fitness-assistant-ajkp.onrender.com/auth/me",
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    )
      .then((response) => {

        if (!response.ok) {

          throw new Error(
            "Invalid token"
          );

        }

        return response.json();

      })
      .then((data) => {

        setUser(data);

      })
      .catch(() => {

        localStorage.removeItem(
          "access_token"
        );

        setUser(null);

      })
      .finally(() => {

        setLoading(false);

      });

  }, []);


  /*
    Loading screen
  */

  if (loading) {

    return (
      <div className="app-loading">

        <div className="loading-logo">
          AI
        </div>

        <h2>
          AI GYM
        </h2>

        <p>
          Loading your fitness assistant...
        </p>

      </div>
    );

  }


  return (

    <BrowserRouter>

      <Routes>


        {/* =====================================
            LOGIN PAGE
        ====================================== */}

        <Route
          path="/login"
          element={

            user ? (

              <Navigate
                to="/dashboard"
                replace
              />

            ) : (

              <Login
                onLogin={() => {

                  window.location.reload();

                }}
              />

            )

          }
        />


        {/* =====================================
            REGISTER PAGE
        ====================================== */}

        <Route
          path="/register"
          element={

            user ? (

              <Navigate
                to="/dashboard"
                replace
              />

            ) : (

              <Register />

            )

          }
        />


        {/* =====================================
            PROTECTED APPLICATION
        ====================================== */}

        {user && (

          <Route
            element={
              <Layout user={user} />
            }
          >


            {/* Dashboard */}

            <Route
              path="/dashboard"
              element={
                <DashboardPage
                  user={user}
                />
              }
            />


            {/* AI Trainer */}

            <Route
              path="/trainer"
              element={
                <TrainerPage />
              }
            />


            {/* Smart Gym */}

            <Route
              path="/smart-gym"
              element={
                <SmartGymPage />
              }
            />


            {/* Workouts */}

            <Route
              path="/workouts"
              element={
                <WorkoutsPage />
              }
            />


            {/* Performance */}

            <Route
              path="/performance"
              element={
                <PerformancePage />
              }
            />


            {/* Habit Tracker */}

            <Route
              path="/habits"
              element={
                <HabitPage />
              }
            />


            {/* AI Dietician */}

            <Route
              path="/dietician"
              element={
                <DieticianPage />
              }
            />


            {/* Virtual Gym Buddy */}

            <Route
              path="/buddy"
              element={
                <BuddyPage />
              }
            />


            {/* Gym Planner */}

            <Route
              path="/planner"
              element={
                <PlannerPage />
              }
            />


            {/* Program Detail Page (ADDED HERE) */}

            <Route
              path="/planner/program/:programId"
              element={
                <ProgramDetailPage />
              }
            />


            {/* Profile */}

            <Route
              path="/profile"
              element={
                <ProfilePage
                  user={user}
                />
              }
            />


            {/* Admin */}

            {user.is_admin && (

              <Route
                path="/admin"
                element={
                  <AdminPage />
                }
              />

            )}

          </Route>

        )}


        {/* =====================================
            DEFAULT / UNKNOWN ROUTES
        ====================================== */}

        <Route
          path="*"
          element={

            <Navigate
              to={
                user
                  ? "/dashboard"
                  : "/login"
              }
              replace
            />

          }
        />


      </Routes>

    </BrowserRouter>

  );
}


export default App;