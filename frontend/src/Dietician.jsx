import { useEffect, useState } from "react";

function Dietician({ refreshKey }) {
  const [dietInfo, setDietInfo] =
    useState(null);

  const [question, setQuestion] =
    useState("");

  const [answer, setAnswer] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [chatLoading, setChatLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const loadDietInfo = async () => {
    const token =
      localStorage.getItem("access_token");

    if (!token) {
      setError("You are not logged in.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "https://ai-gym-fitness-assistant-ajkp.onrender.com/diet/",
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
          "Failed to load diet information"
        );
        return;
      }

      setDietInfo(data);

    } catch (error) {
      setError(
        "Unable to connect to backend"
      );
    } finally {
      setLoading(false);
    }
  };

 useEffect(() => {
  loadDietInfo();
}, [refreshKey]);

  const askDietician = async (event) => {
    event.preventDefault();

    if (!question.trim()) {
      return;
    }

    const token =
      localStorage.getItem("access_token");

    setChatLoading(true);
    setAnswer("");

    try {
      const response = await fetch(
        "https://ai-gym-fitness-assistant-ajkp.onrender.com/diet/chat",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`
          },

          body: JSON.stringify({
            question: question
          })
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setAnswer(
          data.detail ||
          "Unable to get a response."
        );
        return;
      }

      setAnswer(data.answer);

    } catch (error) {
      setAnswer(
        "Unable to connect to the Dietician."
      );
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dietician-page">
        <h2>AI Dietician</h2>
        <p>
          Preparing your nutrition guidance...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dietician-page">
        <h2>AI Dietician</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="dietician-page">

      <h2>AI Dietician</h2>

      <p>
        Your personalized general nutrition
        assistant.
      </p>

      <div className="diet-profile-card">

        <h3>Your Fitness Profile</h3>

        <p>
          <strong>Name:</strong>{" "}
          {dietInfo.user}
        </p>

        <p>
          <strong>Fitness Goal:</strong>{" "}
          {dietInfo.fitness_goal}
        </p>

      </div>

      <div className="diet-message-card">

        <h3>Nutrition Recommendations</h3>

        <ul>
          {dietInfo.recommendations.map(
            (recommendation, index) => (
              <li key={index}>
                {recommendation}
              </li>
            )
          )}
        </ul>

      </div>

      <div className="diet-message-card">

        <h3>Ask AI Dietician</h3>

        <form onSubmit={askDietician}>

          <input
            type="text"
            placeholder="Ask a nutrition question..."
            value={question}
            onChange={(event) =>
              setQuestion(
                event.target.value
              )
            }
          />

          <button
            type="submit"
            disabled={chatLoading}
          >
            {chatLoading
              ? "Thinking..."
              : "Ask"}
          </button>

        </form>

        {answer && (
          <div className="diet-answer">

            <strong>
              AI Dietician:
            </strong>

            <p>
              {answer}
            </p>

          </div>
        )}

      </div>

      <div className="diet-message-card">

        <h3>Sample Meal Ideas</h3>

        {dietInfo.sample_meals.map(
          (meal, index) => (
            <div
              key={index}
              className="meal-item"
            >
              <h4>
                {meal.meal}
              </h4>

              <p>
                {meal.suggestion}
              </p>
            </div>
          )
        )}

      </div>

      <p className="diet-note">
        These are general nutrition ideas,
        not medical or individualized dietary
        treatment.
      </p>

    </div>
  );
}

export default Dietician;