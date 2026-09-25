import { NavLink, Outlet, useNavigate } from "react-router-dom";

function Layout({ user }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
    window.location.reload();
  };

  const navigation = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: "⌂"
    },
    {
      path: "/trainer",
      label: "AI Trainer",
      icon: "🏋"
    },
    {
       path: "/smart-gym",
       label: "Smart Gym",
       icon: "◉"
   },
    {
      path: "/workouts",
      label: "Workouts",
      icon: "▣"
    },
    {
      path: "/performance",
      label: "Performance",
      icon: "◈"
    },
    {
      path: "/habits",
      label: "Habit Tracker",
      icon: "🔥"
    },
    {
      path: "/dietician",
      label: "AI Dietician",
      icon: "🥗"
    },
    {
      path: "/buddy",
      label: "Gym Buddy",
      icon: "💬"
    },
    {
      path: "/planner",
      label: "Gym Planner",
      icon: "📅"
    }
  ];

  return (
    <div className="app-layout">

      {/* Sidebar */}

      <aside className="sidebar">

        <div className="sidebar-logo">
          <div className="logo-icon">
            AI
          </div>

          <div>
            <h2>AI GYM</h2>
            <span>Fitness Assistant</span>
          </div>
        </div>


        <nav className="sidebar-navigation">

          <p className="navigation-title">
            MAIN MENU
          </p>

          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-item ${
                  isActive ? "active" : ""
                }`
              }
            >
              <span className="nav-icon">
                {item.icon}
              </span>

              <span>
                {item.label}
              </span>
            </NavLink>
          ))}


          <p className="navigation-title secondary-title">
            ACCOUNT
          </p>


          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `nav-item ${
                isActive ? "active" : ""
              }`
            }
          >
            <span className="nav-icon">
              👤
            </span>

            <span>
              Profile
            </span>
          </NavLink>


          {user?.is_admin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `nav-item admin-nav ${
                  isActive ? "active" : ""
                }`
              }
            >
              <span className="nav-icon">
                🛡️
              </span>

              <span>
                Admin
              </span>
            </NavLink>
          )}

        </nav>


        {/* Sidebar Bottom */}

        <div className="sidebar-bottom">

          <div className="sidebar-user">

            <div className="user-avatar">
              {user?.name
                ? user.name
                    .charAt(0)
                    .toUpperCase()
                : "U"}
            </div>

            <div className="sidebar-user-info">

              <strong>
                {user?.name || "User"}
              </strong>

              <span>
                {user?.fitness_goal ||
                  "Fitness"}
              </span>

            </div>

          </div>


          <button
            className="sidebar-logout"
            onClick={handleLogout}
          >
            <span>↪</span>
            Logout
          </button>

        </div>

      </aside>


      {/* Main Application */}

      <div className="main-area">

        {/* Top Header */}

        <header className="top-header">

          <div className="mobile-title">
            <strong>
              AI GYM
            </strong>
          </div>


          <div className="header-right">

            <button
              className="notification-button"
              title="Notifications"
            >
              🔔
            </button>


            <button
              className="header-profile"
              onClick={() =>
                navigate("/profile")
              }
            >

              <div className="header-avatar">
                {user?.name
                  ? user.name
                      .charAt(0)
                      .toUpperCase()
                  : "U"}
              </div>

              <div className="header-user-info">

                <strong>
                  {user?.name || "User"}
                </strong>

                <span>
                  {user?.fitness_goal ||
                    "Fitness"}
                </span>

              </div>

            </button>

          </div>

        </header>


        {/* Page Content */}

        <main className="page-content">

          <Outlet />

        </main>

      </div>

    </div>
  );
}

export default Layout;