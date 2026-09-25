import AdminDashboard from "../AdminDashboard";

function AdminPage() {
  return (
    <div className="admin-page-new">

      {/* PAGE HEADER */}
      <div className="admin-header">

        <div>
          <span className="page-label">
            ADMINISTRATION
          </span>

          <h1>
            Admin Dashboard
          </h1>

          <p>
            Monitor users, workouts, and overall activity
            across the fitness platform.
          </p>
        </div>

        <div className="admin-status">
          <span className="status-dot"></span>
          Admin Access
        </div>

      </div>


      {/* INTRODUCTION */}
      <div className="admin-intro">

        <div className="admin-intro-icon">
          🛡️
        </div>

        <div>

          <span>
            SYSTEM OVERVIEW
          </span>

          <h2>
            Platform Administration
          </h2>

          <p>
            Review user activity and monitor the overall
            usage of the fitness assistant.
          </p>

        </div>

      </div>


      {/* MAIN ADMIN CARD */}
      <div className="admin-main-card">

        <div className="admin-card-header">

          <div>
            <span>
              ADMIN PANEL
            </span>

            <h2>
              System Activity
            </h2>
          </div>

          <div className="admin-card-icon">
            ADMIN
          </div>

        </div>


        <div className="admin-content">
          <AdminDashboard />
        </div>

      </div>

    </div>
  );
}

export default AdminPage;