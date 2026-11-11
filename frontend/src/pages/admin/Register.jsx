import "./Register.css";

function Register() {
    return (
        <div className="register-page">

            <div className="register-overlay"></div>

            <div className="register-container">

                {/* LEFT SIDE */}
                <div className="register-left">

                    <div className="register-brand">
                        <div className="register-brand-logo">
                            🏥
                        </div>

                        <div>
                            <h1>AI Smart Hospital</h1>
                            <p>
                                Better Care | Smarter Technology | Healthier Tomorrow
                            </p>
                        </div>
                    </div>

                    <div className="register-welcome">
                        <h2>
                            Join Our
                            <br />
                            <span>Healthcare Community</span>
                        </h2>

                        <p>
                            Create your patient account and easily manage
                            appointments, medical records and healthcare services.
                        </p>
                    </div>

                    <div className="register-features">

                        <div className="register-feature">
                            <div>👨‍⚕️</div>
                            <span>Expert Doctors</span>
                        </div>

                        <div className="register-feature">
                            <div>🏥</div>
                            <span>Quality Healthcare</span>
                        </div>

                        <div className="register-feature">
                            <div>🔒</div>
                            <span>Secure Records</span>
                        </div>

                    </div>

                </div>


                {/* RIGHT SIDE */}
                <div className="register-right">

                    <div className="register-card">

                        <div className="register-logo">
                            🏥
                        </div>

                        <h2>AI Smart Hospital</h2>

                        <h3>Create Account</h3>

                        <p className="register-subtitle">
                            Register as a patient
                        </p>

                        {/* 
                           KEEP YOUR EXISTING REGISTRATION FORM
                           HERE.
                           
                           Example:
                        */}

                        <form>

                            <div className="register-input-group">
                                <label>Full Name</label>

                                <div className="register-input">
                                    <span>👤</span>

                                    <input
                                        type="text"
                                        placeholder="Enter your full name"
                                    />
                                </div>
                            </div>


                            <div className="register-input-group">
                                <label>Email Address</label>

                                <div className="register-input">
                                    <span>✉️</span>

                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                    />
                                </div>
                            </div>


                            <div className="register-input-group">
                                <label>Password</label>

                                <div className="register-input">
                                    <span>🔒</span>

                                    <input
                                        type="password"
                                        placeholder="Create a password"
                                    />
                                </div>
                            </div>


                            <div className="register-input-group">
                                <label>Confirm Password</label>

                                <div className="register-input">
                                    <span>🔒</span>

                                    <input
                                        type="password"
                                        placeholder="Confirm your password"
                                    />
                                </div>
                            </div>


                            <button
                                type="submit"
                                className="register-button"
                            >
                                Create Account
                            </button>

                        </form>


                        <p className="already-account">
                            Already have an account?{" "}
                            <a href="/login">
                                Login
                            </a>
                        </p>


                        <a
                            href="/"
                            className="register-back-home"
                        >
                            ← Back to Home
                        </a>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Register;