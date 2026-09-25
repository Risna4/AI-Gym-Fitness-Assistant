
import { useEffect, useState } from "react";

function GymBuddy() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [buddyInfo, setBuddyInfo] = useState(null);

  useEffect(() => {
    const loadBuddyInfo = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setError("You are not logged in.");
        return;
      }

      try {
        const response = await fetch(
          "http://127.0.0.1:8000/buddy/",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(
            data.detail || "Failed to load Gym Buddy."
          );
          return;
        }

        setBuddyInfo(data);
      } catch (error) {
        setError("Unable to connect to backend.");
      }
    };

    loadBuddyInfo();
  }, []);

  const sendMessage = async (event) => {
    event.preventDefault();

    if (!question.trim()) {
      return;
    }

    const token = localStorage.getItem("access_token");
    const userMessage = question.trim();

    setMessages((previous) => [
      ...previous,
      {
        sender: "user",
        text: userMessage
      }
    ]);

    setQuestion("");
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/buddy/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            message: userMessage
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.detail || "Unable to get a response."
        );
        return;
      }

      setMessages((previous) => [
        ...previous,
        {
          sender: "buddy",
          text: data.reply
        }
      ]);
    } catch (error) {
      setError("Unable to connect to Gym Buddy.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gym-buddy-page">
      <h2>Virtual Gym Buddy</h2>

      <p>
        Your AI fitness companion for motivation,
        workouts, and consistency.
      </p>

      {buddyInfo && (
        <div className="buddy-profile-card">
          <h3>Your Fitness Profile</h3>

          <p>
            <strong>Name:</strong>{" "}
            {buddyInfo.user}
          </p>

          <p>
            <strong>Fitness Goal:</strong>{" "}
            {buddyInfo.fitness_goal}
          </p>
        </div>
      )}

      <div className="buddy-chat-card">
        <h3>Chat with your Gym Buddy</h3>

        <div className="buddy-messages">
          {messages.length === 0 ? (
            <div className="buddy-welcome">
              <p>
                👋 Hi! I'm your Virtual Gym Buddy.
              </p>

              <p>
                You can ask me about motivation,
                workouts, recovery, progress, or
                your fitness goal.
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`chat-message ${
                  message.sender === "user"
                    ? "user-message"
                    : "buddy-message"
                }`}
              >
                <strong>
                  {message.sender === "user"
                    ? "You"
                    : "Gym Buddy"}
                </strong>

                <p>{message.text}</p>
              </div>
            ))
          )}

          {loading && (
            <div className="chat-message buddy-message">
              <strong>Gym Buddy</strong>
              <p>Thinking...</p>
            </div>
          )}
        </div>

        <form
          className="buddy-chat-form"
          onSubmit={sendMessage}
        >
          <input
            type="text"
            placeholder="Talk to your Gym Buddy..."
            value={question}
            onChange={(event) =>
              setQuestion(event.target.value)
            }
          />

          <button
            type="submit"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </form>

        {error && (
          <p className="buddy-error">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

export default GymBuddy;