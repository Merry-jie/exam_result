import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// ==================== CONFIG SUPABASE (via variables d'environnement Vite) ====================
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function App() {
  const [isHome, setIsHome] = useState(true);
  const [iframe1Loaded, setIframe1Loaded] = useState(false);
  const [iframe2Loaded, setIframe2Loaded] = useState(false);

  // États pour la liste des résultats
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // URLs des scènes Spline
  const SPLINE_URL_1 = "https://my.spline.design/untitled-7UED11Rp7QpEDlkPuiz6jVVV/";
  const SPLINE_URL_2 = "https://my.spline.design/voiceinteractionanimation-KUnBH0bR7HXDhKw9IeradLoB/";

  // ==================== RÉCUPÉRATION ET ABONNEMENT TEMPS RÉEL ====================
  useEffect(() => {
    if (!isHome) {
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
    }

    body, html {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      min-height: 100vh;
      width: 100%;
      overflow-x: hidden;
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

    .spline-content {
      position: absolute;
      bottom: 1.5rem;
      left: 0;
      right: 0;
      z-index: 10;
      text-align: center;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 0.5rem 0;
      pointer-events: none;
    }

    .spline-content h1 {
      font-size: clamp(1.2rem, 3vw, 2rem);
      font-weight: 900;
      margin: 0.5rem 0;
      background: linear-gradient(to bottom, #00d2ff, #0072ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 0 30px rgba(0,210,255,0.3);
      pointer-events: none;
    }

    .btn-submit {
      cursor: pointer;
      border: none;
      border-radius: 15px;
      padding: 0.8rem 1.8rem;
      background: linear-gradient(90deg, #0072ff, #00d2ff);
      color: white;
      font-weight: 800;
      transition: all 0.3s ease;
      font-size: 0.95rem;
      display: inline-block;
      box-shadow: 0 5px 15px rgba(0,114,255,0.3);
      z-index: 15;
      position: relative;
      margin-top: 0.25rem;
      pointer-events: auto;
    }

    .btn-submit:hover {
      transform: scale(1.05);
      box-shadow: 0 10px 25px rgba(0,114,255,0.4);
    }

    /* ========== IFRAMES ========== */
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

    /* ========== NAVBAR ========== */
    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.8rem 2rem;
      background: rgba(255,255,255,0.95);
      backdrop-filter: blur(10px);
      border-radius: 50px;
      margin-bottom: 2rem;
      border: 1px solid rgba(0,114,255,0.2);
      box-shadow: 0 5px 20px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 1100px;
      margin-left: auto;
      margin-right: auto;
      position: relative;
      z-index: 20;
      height:50px;
    }

    .form-navbar-fixed {
      position: fixed;
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
      height:50px;
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

      .navbar, .form-navbar-fixed {
        padding: 0.8rem 1rem;
        width: 95%;
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

      .btn-submit {
        margin-top: 20px;
      }
    }

    @media (max-width: 480px) {
      .half-circle-container {
        width: 220px;
        height: 220px;
        bottom: -120px;
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

      .btn-submit {
        margin-top: 15px;
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
            // ===== PAGE ACCUEIL =====
            <section className="hero">
              <div className="spline-container">
                {/* Iframe principale */}
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

                {/* Iframe dans le demi-cercle agrandi */}
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

                <nav className="navbar">
                  <div className="logo-container">
                    <img
                      src="https://via.placeholder.com/32/0072ff/ffffff?text=EN"
                      alt="Logo"
                      className="logo-image"
                    />
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

                <div className="spline-content">
                  <h1>PASSER VOS EXAMEN EN TOUTE SECURITE</h1>
                  <button className="btn-submit" onClick={() => setIsHome(false)}>
                    VOIR LA LISTE
                  </button>
                </div>
              </div>
            </section>
          ) : (
            // ===== PAGE LISTE (RÉSULTATS OFFICIELS) =====
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

                {loading && (
                  <div style={{ textAlign: "center", padding: "2rem" }}>
                    <div className="spinner" />
                    <p style={{ marginTop: "1rem", color: "#0072ff" }}>
                      Chargement en temps réel...
                    </p>
                  </div>
                )}

                {!loading && error && (
                  <div className="error-message">
                    {error}{" "}
                    <button className="reload-btn" onClick={fetchResults}>
                      Réessayer
                    </button>
                  </div>
                )}

                {!loading && !error && results.length === 0 && (
                  <p style={{ textAlign: "center", color: "#666" }}>
                    Aucun résultat disponible pour le moment.
                  </p>
                )}

                {!loading && !error && results.length > 0 && (
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
                            {/* La colonne `nom` contient le nom complet */}
                            <td>{item.nom}</td>
                            <td>{item.etablissement}</td>
                            <td>
                              <span
                                className={`badge ${
                                  item.decision?.toLowerCase() === "admis"
                                    ? "badge-admis"
                                    : "badge-ajourne"
                                }`}
                              >
                                {item.decision}
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