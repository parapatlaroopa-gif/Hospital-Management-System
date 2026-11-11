import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();

        if (!email || !password) {
            alert("Please enter your email and password.");
            return;
        }

        localStorage.setItem("isLoggedIn", "true");

        if (rememberMe) {
            localStorage.setItem("rememberEmail", email);
        } else {
            localStorage.removeItem("rememberEmail");
        }

        navigate("/dashboard");
    };

    return (
        <div className="login-page">
            <div className="login-overlay"></div>

            <div className="login-container">

                {/* LEFT SIDE */}
                <div className="login-info">

                    <div className="hospital-logo">
                        <div className="logo-icon">✚</div>

                        <div>
                            <h1>AI Smart Hospital</h1>
                            <p>Hospital Management System</p>
                        </div>
                    </div>

                    <div className="welcome-section">
                        <span className="welcome-tag">
                            SMART HEALTHCARE
                        </span>

                        <h2>
                            Better Care.
                            <br />
                            Smarter Technology.
                        </h2>

                        <p>
                            Manage patients, doctors, appointments and
                            healthcare services through one secure platform.
                        </p>
                    </div>

                    <div className="features">

                        <div className="feature-item">
                            <div className="feature-icon">✓</div>
                            <div>
                                <h3>Quality Care</h3>
                                <p>Efficient and reliable healthcare management</p>
                            </div>
                        </div>

                        <div className="feature-item">
                            <div className="feature-icon">+</div>
                            <div>
                                <h3>Expert Healthcare</h3>
                                <p>Connect patients with professional medical staff</p>
                            </div>
                        </div>

                        <div className="feature-item">
                            <div className="feature-icon">◆</div>
                            <div>
                                <h3>Smart Technology</h3>
                                <p>Modern digital solutions for better healthcare</p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* RIGHT SIDE LOGIN CARD */}
                <div className="login-card">

                    <div className="login-card-header">

                        <div className="mobile-logo">
                            <div className="mobile-logo-icon">✚</div>
                        </div>

                        <h2>Welcome Back</h2>

                        <p>
                            Sign in to access your hospital account
                        </p>
                    </div>

                    <form onSubmit={handleLogin}>

                        {/* EMAIL */}
                        <div className="form-group">
                            <label>Email Address</label>

                            <div className="input-wrapper">
                                <span className="input-icon">✉</span>

                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* PASSWORD */}
                        <div className="form-group">
                            <label>Password</label>

                            <div className="input-wrapper">
                                <span className="input-icon">🔒</span>

                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                        </div>

                        {/* OPTIONS */}
                        <div className="login-options">

                            <label className="remember-me">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) =>
                                        setRememberMe(e.target.checked)
                                    }
                                />

                                <span>Remember me</span>
                            </label>

                            <button
                                type="button"
                                className="forgot-password"
                                onClick={() =>
                                    alert(
                                        "Please contact hospital administration to reset your password."
                                    )
                                }
                            >
                                Forgot password?
                            </button>

                        </div>

                        {/* LOGIN BUTTON */}
                        <button
                            type="submit"
                            className="login-button"
                        >
                            <span>Sign In</span>
                            <span className="arrow">→</span>
                        </button>

                    </form>

                    {/* REGISTER */}
                    <div className="register-section">

                        <p>
                            Don't have an account?
                        </p>

                        <Link
                            to="/register"
                            className="register-link"
                        >
                            Register Here
                        </Link>

                    </div>

                    {/* SECURITY */}
                    <div className="security-note">
                        <span>🔒</span>
                        <span>
                            Your information is protected and securely managed.
                        </span>
                    </div>

                    {/* BACK HOME */}
                    <Link
                        to="/"
                        className="back-home"
                    >
                        ← Back to Home
                    </Link>

                </div>
            </div>

            <div className="login-footer">
                © 2026 AI Smart Hospital • Secure Healthcare Management
            </div>
        </div>
    );
}

export default Login;