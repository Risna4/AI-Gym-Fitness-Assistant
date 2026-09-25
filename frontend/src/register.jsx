import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [fitnessGoal, setFitnessGoal] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  const handleRegister = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");


    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!password) {
      setError("Please enter a password.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    setLoading(true);


    try {
      const response = await fetch(
        "https://ai-gym-fitness-assistant-ajkp.onrender.com/auth/register",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password: password,

            age: age
              ? Number(age)
              : null,

            weight: weight
              ? Number(weight)
              : null,

            height: height
              ? Number(height)
              : null,

            fitness_goal:
              fitnessGoal || null
          })
        }
      );


      const data = await response.json();


      if (!response.ok) {
        setError(
          data.detail ||
          "Unable to create account."
        );
        return;
      }


      if (
        data.message ===
        "Email already registered"
      ) {
        setError(
          "This email is already registered. Please sign in."
        );
        return;
      }


      setSuccess(
        "Account created successfully. Redirecting to login..."
      );


      setTimeout(() => {
        navigate("/login");
      }, 1200);


    } catch {
      setError(
        "Unable to connect to the server. Make sure the backend is running."
      );

    } finally {
      setLoading(false);
    }
  };


  const styles = {

    page: {
      minHeight: "100vh",
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f4f6f8",
      padding: "30px 20px",
      boxSizing: "border-box",
      fontFamily:
        "Inter, Arial, Helvetica, sans-serif"
    },


    card: {
      width: "100%",
      maxWidth: "520px",
      background: "#ffffff",
      border: "1px solid #e4e7ec",
      borderRadius: "14px",
      padding: "34px 40px 28px",
      boxSizing: "border-box",
      boxShadow:
        "0 18px 45px rgba(16, 24, 40, 0.08)"
    },


    brand: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginBottom: "27px"
    },


    logo: {
      width: "44px",
      height: "44px",
      borderRadius: "9px",
      background: "#101827",
      color: "#ffffff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "14px",
      fontWeight: "800"
    },


    brandTitle: {
      margin: "0",
      color: "#101828",
      fontSize: "18px",
      fontWeight: "800",
      letterSpacing: "0.5px"
    },


    brandSubtitle: {
      display: "block",
      marginTop: "3px",
      color: "#667085",
      fontSize: "10px"
    },


    heading: {
      marginBottom: "22px"
    },


    label: {
      display: "block",
      marginBottom: "7px",
      color: "#667085",
      fontSize: "10px",
      fontWeight: "700",
      letterSpacing: "1.2px"
    },


    title: {
      margin: "0",
      color: "#101828",
      fontSize: "27px",
      lineHeight: "1.25",
      fontWeight: "700"
    },


    description: {
      margin: "8px 0 0",
      color: "#667085",
      fontSize: "13px",
      lineHeight: "1.6"
    },


    form: {
      display: "flex",
      flexDirection: "column",
      gap: "15px"
    },


    row: {
      display: "grid",
      gridTemplateColumns:
        "1fr 1fr",
      gap: "12px"
    },


    field: {
      display: "flex",
      flexDirection: "column"
    },


    fieldLabel: {
      marginBottom: "7px",
      color: "#344054",
      fontSize: "12px",
      fontWeight: "600"
    },


    input: {
      width: "100%",
      height: "43px",
      padding: "0 13px",
      boxSizing: "border-box",
      border: "1px solid #d0d5dd",
      borderRadius: "7px",
      outline: "none",
      background: "#ffffff",
      color: "#101828",
      fontSize: "13px"
    },


    select: {
      width: "100%",
      height: "43px",
      padding: "0 12px",
      boxSizing: "border-box",
      border: "1px solid #d0d5dd",
      borderRadius: "7px",
      outline: "none",
      background: "#ffffff",
      color: "#101828",
      fontSize: "13px"
    },


    error: {
      padding: "10px 12px",
      border: "1px solid #f0d5d5",
      borderRadius: "7px",
      background: "#fff8f8",
      color: "#b42318",
      fontSize: "11px",
      lineHeight: "1.5"
    },


    success: {
      padding: "10px 12px",
      border: "1px solid #cce8d5",
      borderRadius: "7px",
      background: "#f4fbf6",
      color: "#16733b",
      fontSize: "11px",
      lineHeight: "1.5"
    },


    button: {
      width: "100%",
      height: "45px",
      marginTop: "3px",
      border: "none",
      borderRadius: "7px",
      background: "#101827",
      color: "#ffffff",
      fontSize: "13px",
      fontWeight: "600",
      cursor: loading
        ? "wait"
        : "pointer"
    },


    footer: {
      marginTop: "25px",
      paddingTop: "18px",
      borderTop: "1px solid #eaecf0",
      textAlign: "center"
    },


    footerText: {
      color: "#667085",
      fontSize: "11px"
    },


    footerButton: {
      border: "none",
      background: "none",
      padding: "0",
      marginLeft: "5px",
      color: "#101827",
      fontSize: "11px",
      fontWeight: "700",
      cursor: "pointer"
    }

  };


  return (
    <div style={styles.page}>

      <div style={styles.card}>

        {/* BRAND */}

        <div style={styles.brand}>

          <div style={styles.logo}>
            AI
          </div>

          <div>

            <h1 style={styles.brandTitle}>
              AI GYM
            </h1>

            <span style={styles.brandSubtitle}>
              Fitness Assistant
            </span>

          </div>

        </div>


        {/* HEADING */}

        <div style={styles.heading}>

          <span style={styles.label}>
            GET STARTED
          </span>

          <h2 style={styles.title}>
            Create your account
          </h2>

          <p style={styles.description}>
            Set up your fitness profile to start
            using your AI fitness assistant.
          </p>

        </div>


        {/* FORM */}

        <form
          style={styles.form}
          onSubmit={handleRegister}
        >

          {/* NAME */}

          <div style={styles.field}>

            <label
              style={styles.fieldLabel}
            >
              Full Name
            </label>

            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              autoComplete="name"
              style={styles.input}
            />

          </div>


          {/* EMAIL */}

          <div style={styles.field}>

            <label
              style={styles.fieldLabel}
            >
              Email
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              autoComplete="email"
              style={styles.input}
            />

          </div>


          {/* PASSWORD */}

          <div style={styles.field}>

            <label
              style={styles.fieldLabel}
            >
              Password
            </label>

            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              autoComplete="new-password"
              style={styles.input}
            />

          </div>


          {/* AGE + WEIGHT */}

          <div style={styles.row}>

            <div style={styles.field}>

              <label
                style={styles.fieldLabel}
              >
                Age
              </label>

              <input
                type="number"
                min="1"
                placeholder="Age"
                value={age}
                onChange={(event) =>
                  setAge(event.target.value)
                }
                style={styles.input}
              />

            </div>


            <div style={styles.field}>

              <label
                style={styles.fieldLabel}
              >
                Weight (kg)
              </label>

              <input
                type="number"
                min="0"
                step="0.1"
                placeholder="Weight"
                value={weight}
                onChange={(event) =>
                  setWeight(event.target.value)
                }
                style={styles.input}
              />

            </div>

          </div>


          {/* HEIGHT + GOAL */}

          <div style={styles.row}>

            <div style={styles.field}>

              <label
                style={styles.fieldLabel}
              >
                Height (cm)
              </label>

              <input
                type="number"
                min="0"
                step="0.1"
                placeholder="Height"
                value={height}
                onChange={(event) =>
                  setHeight(event.target.value)
                }
                style={styles.input}
              />

            </div>


            <div style={styles.field}>

              <label
                style={styles.fieldLabel}
              >
                Fitness Goal
              </label>

              <select
                value={fitnessGoal}
                onChange={(event) =>
                  setFitnessGoal(
                    event.target.value
                  )
                }
                style={styles.select}
              >

                <option value="">
                  Select goal
                </option>

                <option value="weight loss">
                  Weight Loss
                </option>

                <option value="muscle gain">
                  Muscle Gain
                </option>

                <option value="general fitness">
                  General Fitness
                </option>

                <option value="strength">
                  Strength
                </option>

                <option value="endurance">
                  Endurance
                </option>

              </select>

            </div>

          </div>


          {/* MESSAGES */}

          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}


          {success && (
            <div style={styles.success}>
              {success}
            </div>
          )}


          {/* REGISTER */}

          <button
            type="submit"
            disabled={loading}
            style={styles.button}
          >
            {loading
              ? "Creating account..."
              : "Create Account"}
          </button>

        </form>


        {/* FOOTER */}

        <div style={styles.footer}>

          <span style={styles.footerText}>
            Already have an account?
          </span>

          <button
            type="button"
            style={styles.footerButton}
            onClick={() =>
              navigate("/login")
            }
          >
            Sign In
          </button>

        </div>

      </div>

    </div>
  );
}

export default Register;