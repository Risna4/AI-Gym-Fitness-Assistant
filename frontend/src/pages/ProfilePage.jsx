function ProfilePage({ user }) {
  const initials = user?.name
    ? user.name.charAt(0).toUpperCase()
    : "U";

  return (
    <div className="profile-page-new">

      {/* PAGE HEADER */}
      <div className="profile-header">
        <div>
          <span className="page-label">
            ACCOUNT
          </span>

          <h1>
            Your Profile
          </h1>

          <p>
            View your personal information and
            fitness profile details.
          </p>
        </div>

        <div className="profile-header-status">
          <span className="status-dot"></span>
          Account Active
        </div>
      </div>


      {/* PROFILE SUMMARY */}
      <div className="profile-summary">

        <div className="profile-avatar-large">
          {initials}
        </div>

        <div className="profile-summary-info">

          <span className="profile-summary-label">
            FITNESS MEMBER
          </span>

          <h2>
            {user?.name || "User"}
          </h2>

          <p>
            {user?.email || "No email available"}
          </p>

          <span className="profile-account-badge">
            {user?.is_admin
              ? "Administrator"
              : "Fitness Member"}
          </span>

        </div>

      </div>


      {/* ACCOUNT DETAILS */}
      <div className="profile-section">

        <div className="profile-section-header">

          <div>
            <span>
              PERSONAL INFORMATION
            </span>

            <h2>
              Account Details
            </h2>

            <p>
              Your registered personal and fitness
              information.
            </p>
          </div>

        </div>


        <div className="profile-details-grid">

          <div className="profile-detail">
            <span>
              FULL NAME
            </span>

            <strong>
              {user?.name || "Not provided"}
            </strong>
          </div>


          <div className="profile-detail">
            <span>
              EMAIL ADDRESS
            </span>

            <strong>
              {user?.email || "Not provided"}
            </strong>
          </div>


          <div className="profile-detail">
            <span>
              AGE
            </span>

            <strong>
              {user?.age ?? "Not provided"}
            </strong>
          </div>


          <div className="profile-detail">
            <span>
              WEIGHT
            </span>

            <strong>
              {user?.weight != null
                ? `${user.weight} kg`
                : "Not provided"}
            </strong>
          </div>


          <div className="profile-detail">
            <span>
              HEIGHT
            </span>

            <strong>
              {user?.height != null
                ? `${user.height} cm`
                : "Not provided"}
            </strong>
          </div>


          <div className="profile-detail">
            <span>
              FITNESS GOAL
            </span>

            <strong>
              {user?.fitness_goal || "Not provided"}
            </strong>
          </div>

        </div>

      </div>


      {/* FITNESS PROFILE */}
      <div className="profile-fitness-section">

        <div className="profile-fitness-main">

          <span>
            FITNESS PROFILE
          </span>

          <h2>
            Your Current Profile
          </h2>

          <p>
            These details help the fitness assistant
            provide more relevant features and guidance.
          </p>

        </div>


        <div className="profile-fitness-items">

          <div>
            <span>
              GOAL
            </span>

            <strong>
              {user?.fitness_goal || "Not provided"}
            </strong>
          </div>


          <div>
            <span>
              STATUS
            </span>

            <strong className="status-flex">
              <span className="status-dot"></span>
              Active Member
            </strong>
          </div>

        </div>

      </div>

    </div>
  );
}

export default ProfilePage;