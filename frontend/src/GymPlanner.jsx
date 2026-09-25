import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function GymPlanner() {
  const navigate = useNavigate();

  const [planner, setPlanner] = useState(null);
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [locationError, setLocationError] = useState("");

  const token = localStorage.getItem("access_token");

  // =========================================
  // LOAD NORMAL PLANNER DATA
  // =========================================
  useEffect(() => {
    const loadPlanner = async () => {
      if (!token) {
        setError("You are not logged in.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("http://127.0.0.1:8000/planner/", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.detail || "Failed to load planner.");
          return;
        }

        setPlanner(data);
      } catch (err) {
        setError("Unable to connect to backend.");
      } finally {
        setLoading(false);
      }
    };

    loadPlanner();
  }, [token]);

  // =========================================
  // SEARCH BY CITY / AREA
  // =========================================
  const searchLocation = async (event) => {
    event.preventDefault();
    setLocationError("");

    const enteredLocation = location.trim();

    if (!enteredLocation) {
      setLocationError("Please enter a city or area.");
      return;
    }

    if (enteredLocation.length < 2) {
      setLocationError("Please enter a valid city or area.");
      return;
    }

    setSearching(true);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/planner/?location=${encodeURIComponent(enteredLocation)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setLocationError(data.detail || "Unable to search this location.");
        return;
      }

      setPlanner(data);
    } catch (err) {
      setLocationError("Unable to connect to the backend.");
    } finally {
      setSearching(false);
    }
  };

  if (loading) {
    return (
      <div className="gym-planner-status">
        <div className="planner-loading-mark">AI</div>
        <div>
          <strong>Preparing your recommendations</strong>
          <p>Creating recommendations based on your fitness profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gym-planner-status planner-error">
        <div className="planner-error-mark">!</div>
        <div>
          <strong>Unable to load recommendations</strong>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gym-planner-page">
      {/* =====================================
          HEADER
          ===================================== */}
      <div className="gym-planner-heading">
        <div>
          <span>PERSONALIZED RECOMMENDATIONS</span>
          <h2>Gym Recommender & Planner</h2>
          <p>
            Explore gyms, workout programs, and fitness challenges based on your
            profile and goals.
          </p>
        </div>
        <div className="planner-goal-badge">
          {planner?.fitness_goal || "General Fitness"}
        </div>
      </div>

      {/* =====================================
          USER PROFILE
          ===================================== */}
      <div className="planner-profile-card">
        <div className="planner-profile-main">
          <div className="planner-profile-avatar">
            {planner?.user ? planner.user.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <span>FITNESS PROFILE</span>
            <h3>{planner?.user || "User"}</h3>
          </div>
        </div>

        <div className="planner-profile-goal">
          <span>FITNESS GOAL</span>
          <strong>{planner?.fitness_goal || "General Fitness"}</strong>
        </div>
      </div>

      {/* =====================================
          NEARBY GYMS
          ===================================== */}
      <div className="planner-recommendation-section">
        <div className="planner-section-header">
          <div>
            <span>LOCATION BASED</span>
            <h2>Nearby Gyms</h2>
            <p>Enter a city or area to find nearby gyms.</p>
          </div>
          <div className="planner-section-icon">LOC</div>
        </div>

        {/* LOCATION SEARCH */}
        <form className="planner-location-search" onSubmit={searchLocation}>
          <div className="planner-location-input">
            <label>City or Area</label>
            <input
              type="text"
              placeholder="Example: Kochi, Kakkanad"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            />
          </div>

          <button
            type="submit"
            className="planner-location-button"
            disabled={searching}
          >
            {searching ? "Searching..." : "Find Gyms"}
          </button>
        </form>

        {locationError && (
          <div className="planner-location-error">{locationError}</div>
        )}

        {/* SEARCH RESULT MESSAGE */}
        {planner?.searched_location && (
          <div className="planner-search-result">
            <strong>Location searched</strong>
            <span>{planner.searched_location}</span>
          </div>
        )}

        {/* GYM RESULTS */}
        {planner?.nearby_gyms?.length > 0 ? (
          <div className="planner-gym-list">
            {planner.nearby_gyms.map((gym, index) => (
              <div className="planner-gym-item" key={index}>
                <div className="planner-item-number">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div className="planner-item-content">
                  <strong>{gym.name}</strong>
                  <p>{gym.location || "Location available"}</p>
                </div>
                {gym.distance && (
                  <span className="planner-distance">{gym.distance}</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="planner-empty-state">
            <div className="planner-empty-icon">+</div>
            <div>
              <strong>
                {planner?.searched_location
                  ? "No gyms found"
                  : "Search for a location"}
              </strong>
              <p>
                {planner?.location_message ||
                  "Enter your city or area above to find nearby gyms."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* =====================================
          WORKOUT PROGRAMS (NOW CLICKABLE)
          ===================================== */}
      <div className="planner-recommendation-section">
        <div className="planner-section-header">
          <div>
            <span>GOAL BASED</span>
            <h2>Workout Programs</h2>
            <p>Programs selected according to your fitness goal.</p>
          </div>
          <div className="planner-section-icon">FIT</div>
        </div>

        <div className="planner-program-grid">
          {planner?.workout_programs?.map((program, index) => (
            <div
              className="planner-program-card"
              key={index}
              role="button"
              tabIndex={0}
              style={{
                cursor: "pointer",
                transition: "transform 0.15s ease, box-shadow 0.15s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "none";
              }}
              onClick={() => {
                const programSlug = (program.id || program.name || "full-body")
                  .toLowerCase()
                  .replace(/\s+/g, "-");
                const userGoal = planner?.fitness_goal || "weight loss";
                navigate(`/planner/program/${programSlug}?goal=${encodeURIComponent(userGoal)}`);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const programSlug = (program.id || program.name || "full-body")
                    .toLowerCase()
                    .replace(/\s+/g, "-");
                  const userGoal = planner?.fitness_goal || "weight loss";
                  navigate(`/planner/program/${programSlug}?goal=${encodeURIComponent(userGoal)}`);
                }
              }}
            >
              <div className="planner-program-top">
                <div className="planner-program-number">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <span className="planner-program-badge">PROGRAM</span>
              </div>

              <h3>{program.name}</h3>
              <p>{program.description}</p>
              <div style={{ marginTop: "0.75rem", fontSize: "0.85rem", color: "#4f46e5", fontWeight: 600 }}>
                View Full Workout Schedule →
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =====================================
          FITNESS CHALLENGES (NOW CLICKABLE)
          ===================================== */}
      <div className="planner-recommendation-section">
        <div className="planner-section-header">
          <div>
            <span>ACTIVITY</span>
            <h2>Fitness Challenges</h2>
            <p>Challenges designed around your fitness activity and goals.</p>
          </div>
          <div className="planner-section-icon">GO</div>
        </div>

        <div className="planner-challenge-list">
          {planner?.challenges?.map((challenge, index) => (
            <div
              className="planner-challenge-item"
              key={index}
              role="button"
              tabIndex={0}
              style={{
                cursor: "pointer",
                transition: "transform 0.15s ease, background-color 0.15s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateX(4px)";
                e.currentTarget.style.backgroundColor = "#f8fafc";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.backgroundColor = "";
              }}
              onClick={() => navigate("/trainer")}
              onKeyDown={(e) => e.key === "Enter" && navigate("/trainer")}
            >
              <div className="planner-challenge-number">
                {String(index + 1).padStart(2, "0")}
              </div>

              <div className="planner-challenge-content">
                <strong>{challenge.name}</strong>
                <p>{challenge.description}</p>
              </div>

              <span className="planner-challenge-arrow">→</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GymPlanner;