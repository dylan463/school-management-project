import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();


  const togglePassword = () => {
    setShowPassword((current) => !current);
  };

  const forgotPassword = () => {
    alert(
      "🔑 Fonction de récupération de mot de passe en cours de développement.\nContactez l'administrateur système."
    );
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-badge">📡</div>
          <h1 className="login-title">Télécommunication</h1>
          <p className="login-subtitle">École Supérieure Polytechnique d’Antananarivo</p>
        </div>

        <div className="login-body">
          <form className="login-form">
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label htmlFor="username">Matricule</label>
              <input
                id="username"
                type="text"
                placeholder="Votre matricule"
                className="input-field"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <div className="password-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="input-field"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button
                  type="button"
                  onClick={togglePassword}
                  className="password-toggle"
                >
                  {showPassword ? "Masquer" : "Voir"}
                </button>
              </div>
            </div>

            <div className="form-footer">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  className="checkbox-input"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
                <span>Se souvenir de moi</span>
              </label>
              <button
                type="button"
                onClick={forgotPassword}
                className="forgot-password"
              >
                Mot de passe oublié ?
              </button>
            </div>

            <button type="submit" className="login-btn">
              Se connecter
            </button>

            <div className="status-text">Version 1.0 • Mention Télécommunication ESPA</div>
          </form>
        </div>

        <div className="login-footer">
          © 2026 École Supérieure Polytechnique d’Antananarivo
        </div>
      </div>
    </div>
  );
}

export default Login;
