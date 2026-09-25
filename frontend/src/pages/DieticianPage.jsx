import { useState } from "react";

function DieticianPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedRecipe, setExpandedRecipe] = useState(null);

  const toggleRecipe = (recipeId) => {
    setExpandedRecipe(
      expandedRecipe === recipeId ? null : recipeId
    );
  };

  const askDietician = async () => {
    if (!question.trim()) {
      return;
    }

    setLoading(true);
    setAnswer("");

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setAnswer("You are not logged in.");
        return;
      }

      const response = await fetch(
        "https://ai-gym-fitness-assistant-ajkp.onrender.com/diet/chat",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },

          body: JSON.stringify({
            question: question.trim()
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setAnswer(
          data.detail ||
            "Unable to get a response from the AI Dietician."
        );
        return;
      }

      setAnswer(
        data.answer ||
          "I could not generate an answer."
      );

    } catch (error) {
      setAnswer(
        "Unable to connect to the AI Dietician. Make sure the backend and Ollama are running."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    askDietician();
  };

  const meals = [
    {
      id: "breakfast",
      type: "BREAKFAST",
      title: "Oats with Fruit & Nuts",
      icon: "☀",
      placeholder: "🥣",
      cardClass: "breakfast-card",
      iconClass: "breakfast-icon",
      placeholderClass: "breakfast-placeholder",
      desc: "Warm oatmeal topped with fresh berries, almonds, and a touch of honey.",
      prepTime: "10 mins",
      tags: ["High Fiber", "Balanced"],
      ingredients: [
        "1/2 cup rolled oats",
        "1 cup almond milk or regular milk",
        "1/4 cup fresh blueberries or sliced banana",
        "1 tbsp chopped almonds or walnuts",
        "1 tsp chia seeds",
        "1 tsp honey (optional)"
      ],
      instructions: [
        "In a small pot, combine oats and milk over medium heat.",
        "Bring to a gentle simmer and cook for 5 minutes, stirring occasionally.",
        "Transfer cooked oats into a bowl.",
        "Top with fresh fruit, chopped nuts, and chia seeds.",
        "Add honey if desired and serve warm."
      ]
    },

    {
      id: "lunch",
      type: "LUNCH",
      title: "Rice & Veggie Power Bowl",
      icon: "🍴",
      placeholder: "🍛",
      cardClass: "lunch-card",
      iconClass: "lunch-icon",
      placeholderClass: "lunch-placeholder",
      desc: "Rice bowl with vegetables and a protein-rich food such as tofu or chicken.",
      prepTime: "20 mins",
      tags: ["Whole Foods", "Balanced"],
      ingredients: [
        "1 cup cooked brown rice or quinoa",
        "1/2 cup grilled chicken breast or cubed tofu",
        "1/2 cup roasted broccoli and bell peppers",
        "1/2 cup steamed edamame or chickpeas",
        "1 tbsp olive oil and lemon juice",
        "Salt and pepper to taste"
      ],
      instructions: [
        "Prepare the rice according to package directions.",
        "Cook the vegetables and protein with suitable seasoning.",
        "Place the rice in a bowl.",
        "Add the protein and vegetables.",
        "Finish with lemon juice and olive oil."
      ]
    }
  ];

  return (
    <div className="dietician-content">

      {/* INTRO */}

      <div className="dietician-welcome">

        <div className="dietician-welcome-icon">
          🥗
        </div>

        <div>

          <h2>
            Eat well. Train better.
          </h2>

          <p>
            Get general nutrition guidance and meal
            ideas to support your fitness journey.
          </p>

        </div>

      </div>


      {/* AI QUESTION */}

      <div className="dietician-question-section">

        <div className="dietician-question-heading">

          <div className="dietician-question-icon">
            ✦
          </div>

          <div>

            <h2>
              Ask AI Dietician
            </h2>

            <p>
              Ask a question about nutrition or healthy meals.
            </p>

          </div>

        </div>


        <form
          className="dietician-question-form"
          onSubmit={handleSubmit}
        >

          <input
            type="text"
            value={question}
            onChange={(event) =>
              setQuestion(event.target.value)
            }
            placeholder="Ask a nutrition question..."
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading || !question.trim()}
          >
            {loading
              ? "Thinking..."
              : "Ask"}
          </button>

        </form>


        {/* AI ANSWER */}

        {answer && (

          <div className="dietician-answer">

            <div className="dietician-answer-icon">
              AI
            </div>

            <div>

              <span>
                AI DIETICIAN
              </span>

              <p>
                {answer}
              </p>

            </div>

          </div>

        )}

      </div>


      {/* MEAL IDEAS */}

      <div className="meal-section">

        <div className="meal-section-heading">

          <span className="meal-line"></span>

          <h2>
            🍽 Sample Meals & Recipes
          </h2>

          <span className="meal-line"></span>

        </div>


        <p className="meal-section-subtitle">
          Simple, balanced recipes designed for easy daily prep.
        </p>


        <div className="meal-grid">

          {meals.map((meal) => (

            <div
              key={meal.id}
              className={`meal-card ${meal.cardClass}`}
            >

              <div className="meal-card-top">

                <div
                  className={`meal-icon ${meal.iconClass}`}
                >
                  {meal.icon}
                </div>

                <div>

                  <span>
                    {meal.type}
                  </span>

                  <h3>
                    {meal.title}
                  </h3>

                </div>

              </div>


              <div
                className={`meal-placeholder ${meal.placeholderClass}`}
              >
                <span>
                  {meal.placeholder}
                </span>
              </div>


              <p>
                {meal.desc}
              </p>


              <div className="meal-meta">

                <span className="meal-time">
                  ⏱ {meal.prepTime}
                </span>

              </div>


              <div className="meal-tags">

                {meal.tags.map((tag, index) => (

                  <span key={index}>
                    {tag}
                  </span>

                ))}

              </div>


              <button
                className="toggle-recipe-btn"
                onClick={() =>
                  toggleRecipe(meal.id)
                }
              >

                {expandedRecipe === meal.id
                  ? "Hide Recipe ▲"
                  : "View Recipe ▼"}

              </button>


              {expandedRecipe === meal.id && (

                <div className="recipe-details">

                  <h4>
                    Ingredients
                  </h4>

                  <ul>

                    {meal.ingredients.map(
                      (item, index) => (

                        <li key={index}>
                          {item}
                        </li>

                      )
                    )}

                  </ul>


                  <h4>
                    Instructions
                  </h4>

                  <ol>

                    {meal.instructions.map(
                      (step, index) => (

                        <li key={index}>
                          {step}
                        </li>

                      )
                    )}

                  </ol>

                </div>

              )}

            </div>

          ))}

        </div>

      </div>


      {/* TIP */}

      <div className="dietician-tip">

        <div className="tip-icon">
          💡
        </div>

        <div>

          <strong>
            Nutrition Tip
          </strong>

          <p>
            Keep meals varied and balanced rather
            than unnecessarily restricting foods.
          </p>

        </div>

      </div>

    </div>
  );
}

export default DieticianPage;