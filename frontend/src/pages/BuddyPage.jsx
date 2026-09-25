import GymBuddy from "../GymBuddy";

function BuddyPage() {
  return (
    <div className="buddy-page">

      {/* PAGE HEADER */}
      <div className="buddy-header">
        <div>
          <span className="page-label">AI COMPANION</span>
          <h1>Virtual Gym Buddy</h1>
          <p>
            Your AI fitness companion for motivation, workouts, and consistency.
          </p>
        </div>

        <div className="buddy-status">
          <span className="status-dot"></span>
          AI Online
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="buddy-layout">

        {/* MAIN CHAT CARD */}
        <div className="buddy-main-card">

          {/* TOP BAR */}
          <div className="buddy-main-top">
            <div className="buddy-main-avatar">
              AI
            </div>

            <div>
              <h2>Gym Buddy</h2>
              <p>Your virtual fitness companion</p>
            </div>

            <div className="buddy-online">
              <span className="status-dot"></span>
              Online
            </div>
          </div>

          {/* CHAT CONTENT AREA */}
          <div className="buddy-main-content">
            <GymBuddy />
          </div>

        </div>

        {/* RIGHT COLUMN PANEL */}
        <div className="buddy-right-column">

          {/* HELP CARD */}
          <div className="buddy-help-card">

            <div className="buddy-help-header">
              <div className="buddy-help-icon">
                ✦
              </div>

              <div>
                <h3>What can I ask?</h3>
                <p>Try asking your AI buddy about</p>
              </div>
            </div>

            <div className="buddy-help-list">
              <div>
                <span>01</span>
                <strong>Workout ideas</strong>
              </div>

              <div>
                <span>02</span>
                <strong>Exercise guidance</strong>
              </div>

              <div>
                <span>03</span>
                <strong>Workout motivation</strong>
              </div>

              <div>
                <span>04</span>
                <strong>Recovery and rest</strong>
              </div>
            </div>

          </div>

          {/* QUICK TIP CARD */}
          <div className="buddy-tip-card">
            <div className="buddy-tip-icon">
              💡
            </div>

            <div>
              <strong>Quick Tip</strong>
              <p>
                Ask specific questions to get more useful responses from your AI buddy.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

export default BuddyPage;