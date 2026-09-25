import { useEffect, useState } from "react";

function Workout({ refreshKey }) {

  const [workouts, setWorkouts] =
    useState([]);

  const [formData, setFormData] =
    useState({
      exercise_name: "",
      sets: "",
      reps: "",
      duration: "",
      calories_burned: ""
    });

  const [message, setMessage] =
    useState("");


  // -----------------------------
  // Load workouts from backend
  // -----------------------------
  const loadWorkouts = async () => {

    const token =
      localStorage.getItem(
        "access_token"
      );

    if (!token) {
      return;
    }

    try {

      const response =
        await fetch(
          "https://ai-gym-fitness-assistant-ajkp.onrender.com/workouts/",
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

      const data =
        await response.json();

      if (response.ok) {

        setWorkouts(data);

      } else {

        console.error(
          "Failed to load workouts:",
          data
        );
      }

    } catch (error) {

      console.error(
        "Unable to load workouts:",
        error
      );
    }
  };


  // Load when component starts
  useEffect(() => {

    loadWorkouts();

  }, []);


  // Reload whenever a new AI workout
  // has been saved
  useEffect(() => {

    if (refreshKey > 0) {
      loadWorkouts();
    }

  }, [refreshKey]);


  // -----------------------------
  // Form change
  // -----------------------------
  const handleChange = (event) => {

    setFormData({
      ...formData,
      [event.target.name]:
        event.target.value
    });
  };


  // -----------------------------
  // Add manual workout
  // -----------------------------
  const handleSubmit = async (
    event
  ) => {

    event.preventDefault();

    const token =
      localStorage.getItem(
        "access_token"
      );

    if (!token) {

      setMessage(
        "You are not logged in."
      );

      return;
    }

    const params =
      new URLSearchParams();

    params.append(
      "exercise_name",
      formData.exercise_name
    );

    if (formData.sets) {

      params.append(
        "sets",
        formData.sets
      );
    }

    if (formData.reps) {

      params.append(
        "reps",
        formData.reps
      );
    }

    if (formData.duration) {

      params.append(
        "duration",
        formData.duration
      );
    }

    if (formData.calories_burned) {

      params.append(
        "calories_burned",
        formData.calories_burned
      );
    }


    try {

      const response =
        await fetch(
          `https://ai-gym-fitness-assistant-ajkp.onrender.com/workouts/?${params.toString()}`,
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

      const data =
        await response.json();

      if (response.ok) {

        setMessage(
          "Workout added successfully!"
        );

        setFormData({
          exercise_name: "",
          sets: "",
          reps: "",
          duration: "",
          calories_burned: ""
        });

        // Immediately reload history
        loadWorkouts();

      } else {

        setMessage(
          data.detail ||
          "Failed to add workout"
        );
      }

    } catch (error) {

      console.error(error);

      setMessage(
        "Unable to connect to backend"
      );
    }
  };


  return (
    <div className="workout-page">

      <h2>
        Workout Tracker
      </h2>


      {/* Manual workout form */}
      <form
        className="workout-form"
        onSubmit={handleSubmit}
      >

        <input
          type="text"
          name="exercise_name"
          placeholder="Exercise name"
          value={
            formData.exercise_name
          }
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="sets"
          placeholder="Sets"
          value={formData.sets}
          onChange={handleChange}
        />

        <input
          type="number"
          name="reps"
          placeholder="Reps"
          value={formData.reps}
          onChange={handleChange}
        />

        <input
          type="number"
          name="duration"
          placeholder="Duration (minutes)"
          value={formData.duration}
          onChange={handleChange}
        />

        <input
          type="number"
          name="calories_burned"
          placeholder="Calories burned"
          value={
            formData.calories_burned
          }
          onChange={handleChange}
        />

        <button type="submit">
          Add Workout
        </button>

      </form>


      {message && (
        <p className="workout-message">
          {message}
        </p>
      )}


      {/* Workout history */}
      <h2>
        Workout History
      </h2>


      <div className="workout-list">

        {workouts.length === 0 ? (

          <p>
            No workouts recorded yet.
          </p>

        ) : (

          workouts.map((workout) => (

            <div
              className="workout-item"
              key={workout.id}
            >

              <h3>
                {workout.exercise_name}
              </h3>

              <p>
                Sets:{" "}
                {workout.sets ?? "-"}
              </p>

              <p>
                Reps:{" "}
                {workout.reps ?? "-"}
              </p>

              <p>
                Duration:{" "}
                {workout.duration ?? "-"}{" "}
                minutes
              </p>

              <p>
                Calories:{" "}
                {workout.calories_burned ?? "-"}
              </p>

              <p>
                Date:{" "}
                {workout.workout_date}
              </p>

            </div>

          ))

        )}

      </div>

    </div>
  );
}

export default Workout;