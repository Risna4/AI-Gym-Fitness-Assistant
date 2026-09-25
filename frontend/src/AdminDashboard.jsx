import { useEffect, useState } from "react";

function AdminDashboard() {
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAdminData = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setError("You are not logged in.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          "http://127.0.0.1:8000/admin/",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(
            data.detail || "Unable to load admin dashboard."
          );
          return;
        }

        setAdminData(data);
      } catch (error) {
        setError("Unable to connect to backend.");
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, []);

  if (loading) {
    return (
      <div className="admin-dashboard">
        <h2>Admin Dashboard</h2>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <h2>Admin Dashboard</h2>
        <p className="admin-error">{error}</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h2>Admin Dashboard</h2>
        <p>
          Monitor users and overall workout activity.
        </p>
      </div>

      <div className="admin-stat-cards">
        <div className="admin-stat-card">
          <h3>Total Users</h3>
          <strong>{adminData.total_users}</strong>
          <p>Registered users</p>
        </div>

        <div className="admin-stat-card">
          <h3>Total Workouts</h3>
          <strong>{adminData.total_workouts}</strong>
          <p>Recorded workouts</p>
        </div>
      </div>

      <div className="admin-users-section">
        <h3>Registered Users</h3>

        {adminData.users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <div className="admin-user-list">
            {adminData.users.map((user) => (
              <div
                className="admin-user-card"
                key={user.id}
              >
                <div>
                  <h4>{user.name}</h4>

                  <p>
                    <strong>Email:</strong>{" "}
                    {user.email}
                  </p>

                  <p>
                    <strong>Age:</strong>{" "}
                    {user.age ?? "Not provided"}
                  </p>

                  <p>
                    <strong>Fitness Goal:</strong>{" "}
                    {user.fitness_goal}
                  </p>
                </div>

                <div className="admin-workout-count">
                  <strong>
                    {user.workout_count}
                  </strong>
                  <span>Workouts</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;