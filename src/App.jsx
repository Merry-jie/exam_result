import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// ==================== CONFIG SUPABASE (sécurisée) ====================
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase = null;
let isSupabaseConfigured = false;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  isSupabaseConfigured = true;
} else {
  console.warn(
    "⚠️ Supabase non configuré. Créez un fichier .env avec VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY."
  );
}

function App() {
  const [isHome, setIsHome] = useState(true);
  const [iframe1Loaded, setIframe1Loaded] = useState(false);
  const [iframe2Loaded, setIframe2Loaded] = useState(false);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [supabaseError, setSupabaseError] = useState(!isSupabaseConfigured);

  const SPLINE_URL_1 = "https://my.spline.design/untitled-7UED11Rp7QpEDlkPuiz6jVVV/";
  const SPLINE_URL_2 = "https://my.spline.design/voiceinteractionanimation-KUnBH0bR7HXDhKw9IeradLoB/";

  // ==================== PROTECTION INTERFACE ====================
  useEffect(() => {
    // Désactiver le clic droit
    const handleContextMenu = (e) => e.preventDefault();
    // Bloquer certains raccourcis développeur
    const handleKeyDown = (e) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C")) ||
        (e.ctrlKey && e.key === "U")
      ) {
        e.preventDefault();
      }
    };
    // Empêcher le glisser-déposer
    const handleDragStart = (e) => e.preventDefault();

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("dragstart", handleDragStart);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("dragstart", handleDragStart);
    };
  }, []);

  // ==================== CHARGEMENT LISTE ====================
  useEffect(() => {
    if (!isHome && isSupabaseConfigured) {
      fetchResults();
      const channel = supabase
        .channel("table-db-changes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "resultats_officiels" },
          (payload) => {
            console.log("Changement reçu :", payload);
            fetchResults();
          }
        )
        .subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    }
    if (!isHome && !isSupabaseConfigured) {
      setSupabaseError(true);
    }
  }, [isHome]);

  const fetchResults = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("resultats_officiels")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setResults(data || []);
    } catch (err) {
      console.error("Erreur lors du chargement :", err);
      setError("Impossible de charger la liste. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  // ==================== STYLES CSS ====================
  const styles = `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      user-select: none; /* ⛔ Désactive la sélection de texte */
      -webkit-user-drag: none; /* ⛔ Empêche le drag d'images */
    }

    body, html {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      min-height: 100vh;
      width: 100%;
      font-family:times new roman;
    overflow-x: hidden;
      -webkit-tap-highlight-color: transparent; /* Évite le surlignage mobile */
    }

    .app-wrapper {
      min-height: 100vh;
      width: 100%;
      background: #ffffff;
      position: relative;
      overflow-x: hidden;
    }

    .bg-visual {
      position: fixed;
      inset: 0;
      z-index: 0;
      background: radial-gradient(circle at 20% 20%, rgba(0,114,255,0.15) 0%, transparent 40%),
                  radial-gradient(circle at 80% 80%, rgba(0,210,255,0.1) 0%, transparent 40%);
      animation: bgAnim 15s infinite alternate;
      pointer-events: none;
    }

    @keyframes bgAnim {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }

    .container {
      position: relative;
      z-index: 10;
      width: 100%;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    /* ========== PAGE ACCUEIL ========== */
    .hero {
      width: 100%;
      max-width: 1200px;
            font-family:times new roman;

      display: flex;
      justify-content: center;
      align-items: flex-start;
      min-height: 100vh;
      padding: 0 10px 2px 10px;
      position: relative;
      overflow: hidden;
      animation: fadeIn 1s ease-out;
    }

    .spline-container {
      width: 100%;
      background: #000000;
      border-radius: 0 0 40px 40px;
      padding: 2rem;
      position: relative;
      min-height: 99vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
      overflow: hidden;
    }

    .spline-animation-area {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 1;
      overflow: hidden;
      border-radius: 0 0 40px 40px;
      background: #000;
      will-change: transform;
      transform: translateZ(0);
      backface-visibility: hidden;
    }

    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.8rem 2rem;
      background: rgba(255,255,255,0.95);
      backdrop-filter: blur(10px);
      border-radius: 50px;
      margin-bottom: 0.5rem;
      border: 1px solid rgba(0,114,255,0.2);
      box-shadow: 0 5px 20px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 1100px;
      margin-left: auto;
      margin-right: auto;
      z-index: 20;
      position: relative;
      height: 50px;
    }

    .subtitle {
      position: relative;
      z-index: 20;
      text-align: center;
      width: 100%;
      margin-bottom: 1rem;
      color: white;
      font-family: 'Times New Roman', Times, serif;
      font-size: 0.9rem;
      font-weight: 400;
      letter-spacing: 1px;
      opacity: 0.9;
      text-shadow: 0 0 10px rgba(0,210,255,0.5);
    }

    .half-circle-container {
      position: absolute;
      bottom: -200px;
      left: 50%;
      transform: translateX(-50%);
      width: 380px;
      height: 380px;
      z-index: 5;
      overflow: hidden;
      pointer-events: auto;
    }

    .half-circle {
      width: 100%;
      height: 100%;
      background: #ffffff;
      border: 8px solid white;
      border-radius: 50%;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2), 0 0 0 2px rgba(0,114,255,0.2);
      position: relative;
      overflow: hidden;
      transition: transform 0.3s ease;
    }

    .spline-secondary-area {
      width: 100%;
      height: 100%;
      background: #f0f0f0;
      position: relative;
      will-change: transform;
      transform: translateZ(0);
      backface-visibility: hidden;
    }

    .hover-message {
      position: absolute;
      bottom: -30px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,114,255,0.9);
      color: white;
      padding: 5px 15px;
      border-radius: 20px;
      font-size: 0.8rem;
      white-space: nowrap;
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    }

    .half-circle-container:hover .hover-message {
      opacity: 1;
    }

    .btn-list-right {
      position: absolute;
      bottom: 1rem;
      right: 1rem;
      z-index: 20;
      cursor: pointer;
      border: none;
      border-radius: 15px;
      padding: 0.8rem 2.5rem;
      background: linear-gradient(90deg, #0072ff, #00d2ff);
      color: white;
      font-family:times new roman;
      font-weight: 800;
      font-size: 1rem;
      box-shadow: 0 5px 15px rgba(0,114,255,0.3);
      transition: all 0.3s ease;
      pointer-events: auto;
      min-width: 218px;
      height:69px;
      user-select: none;
    }

    .btn-list-right:hover {
      transform: scale(1.05);
      box-shadow: 0 10px 25px rgba(0,114,255,0.4);
    }

    .spline-animation-area iframe,
    .spline-secondary-area iframe {
      width: 100%;
      height: 100%;
      border: none;
      display: block;
      pointer-events: auto !important;
      will-change: transform;
      transform: translateZ(0);
      transition: opacity 0.2s ease;
    }

    .spline-loader {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      color: #00d2ff;
      font-size: 1.2rem;
      background: #000;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 2;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid rgba(0,210,255,0.3);
      border-top: 4px solid #00d2ff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* ========== NAVBAR PAGE LISTE ========== */
    .form-navbar-fixed {
      position: fixed;
            font-family:times new roman;

      top: 1rem;
      left: 0;
      right: 0;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.8rem 2rem;
      background: rgba(255,255,255,0.95);
      backdrop-filter: blur(10px);
      border-radius: 50px;
      border: 1px solid rgba(0,114,255,0.2);
      box-shadow: 0 5px 20px rgba(0,0,0,0.1);
      width: 90%;
      max-width: 1100px;
      z-index: 1000;
      height: 50px;
    }

    .logo-container {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .logo-image {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
      animation: logoPulse 3s infinite alternate;
      pointer-events: none; /* évite le téléchargement de l'image */
    }

    .logo-text {
      font-weight: 900;
      font-size: 1.2rem;
      background: linear-gradient(135deg, #00d2ff, #0072ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      white-space: nowrap;
    }

    @keyframes logoPulse {
      0% { transform: scale(1); opacity: 0.9; }
      100% { transform: scale(1.1); opacity: 1; }
    }

    .nav-btns {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .nav-btns button {
      padding: 0.5rem 1rem;
      cursor: pointer;
      background: none;
      border: none;
      font-weight: 600;
      color: #0072ff;
      border-radius: 20px;
      transition: all 0.3s ease;
      white-space: nowrap;
      font-size: 1rem;
      user-select: none;
    }

    .nav-btns button:hover {
      background: rgba(0,114,255,0.1);
    }

    .nav-btns button.active {
      color: #00d2ff;
      background: rgba(0,210,255,0.1);
    }

    /* ========== PAGE LISTE ========== */
    .list-page {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 80px 10px 30px 10px;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: flex-start;
    }

    .list-card {
      background: #ffffff;
      padding: 3rem;
      border-radius: 40px;
      max-width: 1000px;
      width: 100%;
      box-shadow: 0 20px 40px rgba(0,0,0,0.25);
      animation: fadeIn 1s ease-out;
      position: relative;
      z-index: 10;
    }

    .list-card h2 {
      margin-bottom: 2rem;
      text-align: center;
      color: #0072ff;
    }

    .table-wrapper {
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      min-width: 600px;
    }

    th, td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid rgba(0,210,255,0.2);
      user-select: none;
    }

    th {
      background: rgba(0,114,255,0.05);
      color: #0072ff;
      font-weight: 700;
    }

    td {
      color: #333;
    }

    .badge {
      display: inline-block;
      padding: 0.2rem 0.8rem;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.85rem;
    }

    .badge-admis {
      background: rgba(0, 200, 0, 0.15);
      color: #008000;
    }

    .badge-ajourne {
      background: rgba(255, 0, 0, 0.15);
      color: #cc0000;
    }

    .error-message {
      color: #ff4444;
      text-align: center;
      padding: 1rem;
      font-weight: 500;
    }

    .info-message {
      color: #0072ff;
      text-align: center;
      padding: 2rem;
      font-weight: 500;
      background: rgba(0,114,255,0.05);
      border-radius: 15px;
    }

    .reload-btn {
      background: none;
      border: none;
      color: #0072ff;
      cursor: pointer;
      text-decoration: underline;
      margin-left: 0.5rem;
      font-weight: 600;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* ========== RESPONSIVE ========== */
    @media (max-width: 768px) {
      .spline-container {
        padding: 1rem;
        min-height: 98vh;
      }

      .half-circle-container {
        width: 280px;
        height: 280px;
        bottom: -150px;
      }

      .btn-list-right {
        bottom: 1rem;
        right: 1rem;
        padding: 0.7rem 1.5rem;
        font-size: 0.9rem;
      }

      .navbar, .form-navbar-fixed {
        padding: 0.8rem 1rem;
        width: 95%;
      }

      .subtitle {
        font-size: 0.8rem;
      }

      .list-page {
        padding: 70px 5px 20px 5px;
      }

      .list-card {
        padding: 1.5rem;
      }

      .logo-image {
        width: 28px;
        height: 28px;
      }

      .logo-text {
        font-size: 1rem;
      }

      .nav-btns {
        gap: 0.5rem;
      }

      .nav-btns button {
        padding: 0.5rem;
        font-size: 0.9rem;
      }
    }

    @media (max-width: 480px) {
      .half-circle-container {
        width: 220px;
        height: 220px;
        bottom: -120px;
      }

      .btn-list-right {
        bottom: 0.5rem;
        right: 0.5rem;
        padding: 0.6rem 1.2rem;
        font-size: 0.8rem;
      }

      .logo-image {
        width: 24px;
        height: 24px;
      }

      .logo-text {
        font-size: 0.9rem;
      }

      .nav-btns button {
        font-size: 0.8rem;
        padding: 0.4rem;
      }
    }
  `;

  // ==================== RENDU ====================
  return (
    <>
      <style>{styles}</style>
      <div className="app-wrapper">
        <div className="bg-visual"></div>

        <main className="container">
          {isHome ? (
            <section className="hero">
              <div className="spline-container">
                <div className="spline-animation-area">
                  {!iframe1Loaded && (
                    <div className="spline-loader">
                      <div className="spinner"></div>
                    </div>
                  )}
                  <iframe
                    src={SPLINE_URL_1}
                    title="Animation Spline principale"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; pointer-lock; xr-spatial-tracking"
                    allowFullScreen
                    loading="eager"
                    importance="high"
                    onLoad={() => setIframe1Loaded(true)}
                    style={{ opacity: iframe1Loaded ? 1 : 0 }}
                  />
                </div>

                <nav className="navbar">
                  <div className="logo-container">
                    
                    <span className="logo-text">EXAMNEXT</span>
                  </div>
                  <div className="nav-btns">
                    <button className="active" onClick={() => setIsHome(true)}>
                      ACCUEIL
                    </button>
                    <button onClick={() => setIsHome(false)}>
                      LISTE
                    </button>
                  </div>
                </nav>

                <div className="subtitle">Liste officiel des examens</div>

                <div className="half-circle-container">
                  <div className="half-circle">
                    <div className="spline-secondary-area">
                      {!iframe2Loaded && (
                        <div className="spline-loader">
                          <div className="spinner"></div>
                        </div>
                      )}
                      <iframe
                        src={SPLINE_URL_2}
                        title="Animation Spline cercle"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; pointer-lock; xr-spatial-tracking"
                        allowFullScreen
                        loading="eager"
                        importance="high"
                        onLoad={() => setIframe2Loaded(true)}
                        style={{ opacity: iframe2Loaded ? 1 : 0 }}
                      />
                      <div className="hover-message">👆 Animation ici</div>
                    </div>
                  </div>
                </div>

                <button
                  className="btn-list-right"
                  onClick={() => setIsHome(false)}
                >
                  VOIR LA LISTE
                </button>
              </div>
            </section>
          ) : (
            <section className="list-page">
              <nav className="form-navbar-fixed">
                <div className="logo-container">
                  <img
                    src="https://via.placeholder.com/32/0072ff/ffffff?text=EN"
                    alt="Logo"
                    className="logo-image"
                  />
                  <span className="logo-text">EXAMNEXT</span>
                </div>
                <div className="nav-btns">
                  <button onClick={() => setIsHome(true)}>ACCUEIL</button>
                  <button className="active" onClick={() => setIsHome(false)}>
                    LISTE
                  </button>
                </div>
              </nav>

              <div className="list-card">
                <h2>RÉSULTATS OFFICIELS</h2>
                  <h4>Les admis</h4>
                {supabaseError && (
                  <div className="info-message">
                    ⚠️ Connexion à la base de données non configurée.<br/>
                    Veuillez créer un fichier <strong>.env</strong> avec vos identifiants Supabase.<br/>
                    <small style={{ opacity: 0.7 }}>
                      VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY
                    </small>
                  </div>
                )}

                {!supabaseError && loading && (
                  <div style={{ textAlign: "center", padding: "2rem" }}>
                    <div className="spinner" />
                    <p style={{ marginTop: "1rem", color: "#0072ff" }}>
                      Chargement en temps réel...
                    </p>
                  </div>
                )}

                {!supabaseError && !loading && error && (
                  <div className="error-message">
                    {error}{" "}
                    <button className="reload-btn" onClick={fetchResults}>
                      Réessayer
                    </button>
                  </div>
                )}

                {!supabaseError && !loading && !error && results.length === 0 && (
                  <p style={{ textAlign: "center", color: "#666" }}>
                    Aucun résultat disponible pour le moment.
                  </p>
                )}

                {!supabaseError && !loading && !error && results.length > 0 && (
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Candidat (Nom et Prénoms)</th>
                          <th>Établissement</th>
                          <th>Décision</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((item) => (
                          <tr key={item.id}>
                            <td>{item.nom}</td>
                            <td>{item.etablissement}</td>
                            <td>
                              <span
                                className={`badge ${
                                  item.statut?.toLowerCase() === "admis"
                                    ? "badge-admis"
                                    : "badge-ajourne"
                                }`}
                              >
                                {item.statut}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>
          )}
        </main>
      </div>
    </>
  );
}

export default App;
