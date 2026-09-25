import GymPlanner from "../GymPlanner";

function PlannerPage() {
  return (
    <div className="planner-page">

      {/* PAGE HEADER */}
      <div className="planner-header">

        <div>
          <span className="page-label">
            FITNESS PLANNING
          </span>

          <h1>
            Gym Planner
          </h1>

          <p>
            Build a structured weekly routine and keep
            your training activities organized.
          </p>
        </div>

        <div className="planner-status">
          <span className="status-dot"></span>
          Plan Ready
        </div>

      </div>


      {/* PLANNER INTRO */}
      <div className="planner-intro">

        <div className="planner-intro-icon">
          📅
        </div>

        <div>
          <span>
            SMART WORKOUT PLANNING
          </span>

          <h2>
            Your week, organized around your goals.
          </h2>

          <p>
            Create and review your workout schedule
            so you can stay consistent with your training.
          </p>
        </div>

      </div>


      {/* MAIN PLANNER WORKSPACE */}
      <div className="planner-workspace">

        {/* MAIN PLANNER */}
        <div className="planner-main-card">

          <div className="planner-card-header">

            <div>
              <span>
                WEEKLY SCHEDULE
              </span>

              <h2>
                Your Fitness Plan
              </h2>
            </div>

            <div className="planner-card-icon">
              AI
            </div>

          </div>

          <div className="planner-content">
            <GymPlanner />
          </div>

        </div>


        {/* RIGHT INFORMATION PANEL */}
        <div className="planner-side-column">

          {/* PLANNING GUIDE */}
          <div className="planner-info-card">

            <div className="planner-info-header">

              <div className="planner-info-icon">
                ?
              </div>

              <div>
                <h3>
                  Planning Guide
                </h3>

                <p>
                  Keep your weekly routine organized
                </p>
              </div>

            </div>


            <div className="planner-guide-list">

              <div className="planner-guide-item">
                <span>01</span>

                <div>
                  <strong>
                    Set your activities
                  </strong>

                  <p>
                    Add the workouts you want to
                    include in your weekly routine.
                  </p>
                </div>
              </div>


              <div className="planner-guide-item">
                <span>02</span>

                <div>
                  <strong>
                    Organize your week
                  </strong>

                  <p>
                    Distribute your training activities
                    across the available days.
                  </p>
                </div>
              </div>


              <div className="planner-guide-item">
                <span>03</span>

                <div>
                  <strong>
                    Follow your schedule
                  </strong>

                  <p>
                    Use your plan as a simple guide
                    for your training routine.
                  </p>
                </div>
              </div>


              <div className="planner-guide-item">
                <span>04</span>

                <div>
                  <strong>
                    Stay consistent
                  </strong>

                  <p>
                    Review your plan regularly and
                    maintain your workout routine.
                  </p>
                </div>
              </div>

            </div>

          </div>


          {/* QUICK TIP */}
          <div className="planner-tip-card">

            <div className="planner-tip-icon">
              ✦
            </div>

            <div>
              <strong>
                Planning Tip
              </strong>

              <p>
                Keep your schedule realistic and
                leave enough time for rest and recovery.
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default PlannerPage;