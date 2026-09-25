import { useState } from "react";
import { useNavigate } from "react-router-dom";


function Login({ onLogin }) {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  const handleLogin = async (event) => {

    event.preventDefault();

    setError("");


    if (!email.trim()) {

      setError("Please enter your email.");

      return;
    }


    if (!password) {

      setError("Please enter your password.");

      return;
    }


    setLoading(true);


    try {

      const response = await fetch(
        "http://127.0.0.1:8000/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            email: email.trim(),
            password: password
          })
        }
      );


      const data = await response.json();


      if (!response.ok) {

        setError(
          data.detail ||
          "Unable to login."
        );

        return;
      }


      if (!data.access_token) {

        setError(
          data.message ||
          "Invalid email or password."
        );

        return;
      }


      localStorage.setItem(
        "access_token",
        data.access_token
      );


      if (onLogin) {

        onLogin();

      }

    } catch (error) {

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
      maxWidth: "430px",
      background: "#ffffff",
      border: "1px solid #e4e7ec",
      borderRadius: "14px",
      padding: "38px 40px 28px",
      boxSizing: "border-box",
      boxShadow:
        "0 18px 45px rgba(16, 24, 40, 0.08)"
    },


    brand: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginBottom: "34px"
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
      marginBottom: "26px"
    },


    label: {
      display: "block",
      marginBottom: "8px",
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
      margin: "9px 0 0",
      color: "#667085",
      fontSize: "13px",
      lineHeight: "1.6"
    },


    form: {
      display: "flex",
      flexDirection: "column",
      gap: "17px"
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
      height: "45px",
      padding: "0 13px",
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
      marginTop: "27px",
      paddingTop: "18px",
      borderTop: "1px solid #eaecf0",
      textAlign: "center"
    },


    footerText: {
      color: "#98a2b3",
      fontSize: "10px"
    },


    registerText: {
      color: "#667085",
      fontSize: "11px"
    },


    registerButton: {
      border: "none",
      background: "transparent",
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
            WELCOME BACK
          </span>


          <h2 style={styles.title}>
            Sign in to your account
          </h2>


          <p style={styles.description}>
            Continue managing your workouts,
            performance, and fitness goals.
          </p>

        </div>


        {/* FORM */}

        <form
          style={styles.form}
          onSubmit={handleLogin}
        >


          {/* EMAIL */}

          <div style={styles.field}>

            <label
              htmlFor="login-email"
              style={styles.fieldLabel}
            >
              Email
            </label>


            <input
              id="login-email"
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
              htmlFor="login-password"
              style={styles.fieldLabel}
            >
              Password
            </label>


            <input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              autoComplete="current-password"
              style={styles.input}
            />

          </div>


          {/* ERROR */}

          {error && (

            <div style={styles.error}>
              {error}
            </div>

          )}


          {/* LOGIN BUTTON */}

          <button
            type="submit"
            disabled={loading}
            style={styles.button}
          >

            {loading
              ? "Signing in..."
              : "Sign In"}

          </button>


        </form>


        {/* FOOTER */}

        <div style={styles.footer}>

          <span style={styles.registerText}>
            Don't have an account?
          </span>


          <button
            type="button"
            style={styles.registerButton}
            onClick={() =>
              navigate("/register")
            }
          >
            Create an account
          </button>


          <div
            style={{
              marginTop: "14px"
            }}
          >

            <span style={styles.footerText}>
              AI-powered fitness management
            </span>

          </div>

        </div>


      </div>

    </div>

  );

}


export default Login;