import React, { useState, useRef, useEffect, useMemo } from "react";

function App() {
  const [isHome, setIsHome] = useState(true);
  const [file, setFile] = useState(null);
  const [popup, setPopup] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const fileInputRef = useRef(null);
  const submitButtonRef = useRef(null);

  // ==================== CONFIG ====================
  const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
  const maxSize = 5 * 1024 * 1024;
  const BACKEND_URL = "https://back-examnext-3.onrender.com";

  // URL de la scène Spline (mémorisée)
  const splineUrl = useMemo(
    () => "https://my.spline.design/untitled-7UED11Rp7QpEDlkPuiz6jVVV/",
    []
  );

  // ==================== VALIDATION ====================
  const validateFile = (file) => {
    if (!allowedTypes.includes(file.type))
      return { valid: false, message: "❌ Type non autorisé (PDF/JPEG/PNG)" };
    if (file.size > maxSize)
      return { valid: false, message: "❌ Fichier trop lourd (>5 Mo)" };
    if (file.size === 0)
      return { valid: false, message: "❌ Fichier vide (0 octet)" };
    return { valid: true };
  };

  // ==================== UPLOAD ====================
  const handleUploadClick = () => fileInputRef.current.click();

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    const validation = validateFile(selected);
    if (validation.valid) setFile(selected);
    else showPopup(validation.message);
  };

  // ==================== POPUP ====================
  const showPopup = (message, duration = 4000) => {
    setPopup(message);

    if (submitButtonRef.current && !isHome) {
      const rect = submitButtonRef.current.getBoundingClientRect();
      const popupEl = document.querySelector(".popup");
      if (popupEl) {
        popupEl.style.position = "fixed";
        popupEl.style.top = `${rect.top - 60}px`;
        popupEl.style.left = `${rect.left + rect.width / 2}px`;
        popupEl.style.transform = "translateX(-50%)";
      }
    }

    setTimeout(() => setPopup(null), duration);
  };

  // ==================== SOUMISSION ====================
  const handleSubmit = async () => {
    const nom = document.getElementById("nom")?.value.trim() || "";
    const email = document.getElementById("email")?.value.trim() || "";
    const telephone = document.getElementById("telephone")?.value.trim() || "";
    const date_naissance = document.getElementById("date_naissance")?.value || "";
    const lieu_naissance = document.getElementById("lieu_naissance")?.value.trim() || "";
    const cisco_zap = document.getElementById("cisco_zap")?.value.trim() || "";
    const examen = document.getElementById("examen")?.value || "";
    const lieu_de_service = document.getElementById("lieu_de_service_et_etablissement")?.value.trim() || "";

    if (
      !nom || !email || !telephone || !date_naissance || !lieu_naissance ||
      !cisco_zap || !examen || !lieu_de_service
    ) {
      showPopup("Remplissez tous les champs obligatoires", 3000);
      return;
    }

    if (!file) {
      showPopup("Veuillez sélectionner un fichier", 3000);
      return;
    }

    setIsSubmitting(true);
    showPopup("⏳ Envoi en cours...", 2000);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const fileBase64 = reader.result.split(",")[1];
        const payload = {
          nom, email, telephone, date_naissance, lieu_naissance,
          cisco_zap, examen,
          lieu_de_service_et_etablissement: lieu_de_service,
          document: { name: file.name, content: fileBase64 },
        };

        const res = await fetch(BACKEND_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const result = await res.json();

        showPopup(
          result.success
            ? "✅ Votre dossier est bien reçu"
            : result.message || "❌ Erreur inconnue"
        );
      } catch (err) {
        showPopup("❌ Échec de l'envoi, réessayez");
      } finally {
        setIsSubmitting(false);
      }
    };

    reader.onerror = () => {
      showPopup("❌ Erreur de lecture du fichier");
      setIsSubmitting(false);
    };

    reader.readAsDataURL(file);
  };

  // ==================== BOUTON VALIDER ====================
  const isSubmitDisabled = () => {
    if (isHome) return false;
    const nom = document.getElementById("nom")?.value.trim() || "";
    const email = document.getElementById("email")?.value.trim() || "";
    const telephone = document.getElementById("telephone")?.value.trim() || "";
    const date_naissance = document.getElementById("date_naissance")?.value || "";
    const lieu_naissance = document.getElementById("lieu_naissance")?.value.trim() || "";
    const cisco_zap = document.getElementById("cisco_zap")?.value.trim() || "";
    const examen = document.getElementById("examen")?.value || "";
    const lieu_de_service = document.getElementById("lieu_de_service_et_etablissement")?.value.trim() || "";

    const fieldsFilled =
      nom && email && telephone && date_naissance && lieu_naissance &&
      cisco_zap && examen && lieu_de_service;
    return !(fieldsFilled && file) || isSubmitting;
  };

  // ==================== SCROLL & POPUP ====================
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [isHome]);

  useEffect(() => {
    const handleScroll = () => {
      if (popup && submitButtonRef.current && !isHome) {
        const rect = submitButtonRef.current.getBoundingClientRect();
        const popupEl = document.querySelector(".popup");
        if (popupEl) popupEl.style.top = `${rect.top - 60}px`;
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [popup, isHome]);

  // ==================== STYLES CSS complets ====================
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
    }

    /* Loader pour l'animation */
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

    /* Optimisations pour l'iframe */
    .spline-animation-area iframe {
      will-change: transform;
      transform: translateZ(0);
      transition: opacity 0.3s ease;
    }

    /* ========== CONTENU TEXTE ========== */
    .spline-content {
      position: relative;
      z-index: 10;
      text-align: center;
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      flex: 1;
      padding: 1rem 0;
    }

    .spline-content h1 {
      font-size: clamp(1.5rem, 4vw, 2.5rem);
      font-weight: 900;
      margin: 2rem 0;
      background: linear-gradient(to bottom, #00d2ff, #0072ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 0 30px rgba(0,210,255,0.3);
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

    /* ========== BOUTON ========== */
    .btn-submit {
      cursor: pointer;
      border: none;
      border-radius: 15px;
      padding: 1rem 2rem;
      background: linear-gradient(90deg, #0072ff, #00d2ff);
      color: white;
      font-weight: 800;
      transition: all 0.3s ease;
      font-size: 1rem;
      display: inline-block;
      box-shadow: 0 5px 15px rgba(0,114,255,0.3);
      z-index: 15;
      position: relative;
    }

    .btn-submit:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    }

    .btn-submit:hover:not(:disabled) {
      transform: scale(1.05);
      box-shadow: 0 10px 25px rgba(0,114,255,0.4);
    }

    /* ========== PAGE FORMULAIRE ========== */
    .form-page {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 80px 10px 30px 10px;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: flex-start;
    }

    .form-card {
      background: #ffffff;
      padding: 3rem;
      border-radius: 40px;
      max-width: 850px;
      width: 100%;
      box-shadow: 0 20px 40px rgba(0,0,0,0.25);
      animation: fadeIn 1s ease-out;
      position: relative;
      z-index: 10;
    }

    .form-card h2 {
      margin-bottom: 2rem;
      text-align: center;
      color: #0072ff;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    input, select {
      width: 100%;
      padding: 1rem;
      border-radius: 10px;
      border: 1px solid #00d2ff;
      outline: none;
      font-size: 1rem;
      background: white;
      transition: all 0.3s ease;
    }

    input:focus, select:focus {
      border-color: #0072ff;
      box-shadow: 0 0 0 3px rgba(0,114,255,0.2);
    }

    .upload-zone {
      border: 2px dashed #00d2ff;
      padding: 2rem;
      border-radius: 15px;
      text-align: center;
      cursor: pointer;
      margin: 1rem 0;
      transition: all 0.3s ease;
      background: white;
    }

    .upload-zone:hover {
      background: rgba(0,210,255,0.1);
      border-color: #0072ff;
    }

    .file-list {
      margin: 1rem 0;
    }

    .file-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background: rgba(0,210,255,0.1);
      border-radius: 8px;
    }

    .file-name {
      color: #0072ff;
      font-weight: 500;
    }

    .file-remove {
      cursor: pointer;
      color: #ff4444;
      font-weight: bold;
      padding: 0 0.5rem;
    }

    /* ========== POPUP ========== */
    .popup {
      position: fixed;
      background: #00d2ff;
      color: white;
      padding: 0.8rem 1.5rem;
      border-radius: 30px;
      z-index: 2000;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      animation: popupAppear 0.3s ease;
      white-space: nowrap;
      font-size: 0.9rem;
      font-weight: 500;
      pointer-events: none;
      border: 2px solid white;
    }

    .popup::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 10px solid transparent;
      border-right: 10px solid transparent;
      border-top: 10px solid #00d2ff;
    }

    @keyframes popupAppear {
      from {
        opacity: 0;
        transform: translateX(-50%) translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
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

      .navbar, .form-navbar-fixed {
        padding: 0.8rem 1rem;
        width: 95%;
      }

      .form-page {
        padding: 70px 5px 20px 5px;
      }

      .form-card {
        padding: 1.5rem;
      }

      .popup {
        font-size: 0.8rem;
        padding: 0.6rem 1rem;
        white-space: normal;
        max-width: 200px;
        text-align: center;
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
            // ===== PAGE ACCUEIL =====
            <section className="hero">
              <div className="spline-container">
                <div className="spline-animation-area">
                  {!iframeLoaded && (
                    <div className="spline-loader">
                      <div className="spinner"></div>
                    </div>
                  )}
                  <iframe
                    src={splineUrl}
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      display: 'block',
                      opacity: iframeLoaded ? 1 : 0,
                    }}
                    title="Animation Spline"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="eager"
                    importance="high"
                    onLoad={() => setIframeLoaded(true)}
                  />
                </div>

                <nav className="navbar">
                  <div className="logo-container">
                    <img
                      src="https://ibb.co/j9kFJyrS"
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
                      INSCRIPTION
                    </button>
                  </div>
                </nav>

                <div className="spline-content">
                  <h1>PASSER VOS EXAMEN EN TOUTE SECURITE</h1>
                  <button className="btn-submit" onClick={() => setIsHome(false)}>
                    S'INSCRIRE MAINTENANT
                  </button>
                </div>
              </div>
            </section>
          ) : (
            // ===== PAGE FORMULAIRE =====
            <section className="form-page">
              <nav className="form-navbar-fixed">
                <div className="logo-container">
                  <img
                    src="https://ibb.co/j9kFJyrS"
                    alt="Logo"
                    className="logo-image"
                  />
                  <span className="logo-text">EXAMNEXT</span>
                </div>
                <div className="nav-btns">
                  <button onClick={() => setIsHome(true)}>ACCUEIL</button>
                  <button className="active" onClick={() => setIsHome(false)}>
                    INSCRIPTION
                  </button>
                </div>
              </nav>

              <div className="form-card">
                <h2>DOSSIER D'INSCRIPTION</h2>

                <div className="form-grid">
                  <input id="nom" placeholder="Nom complet" />
                  <input id="email" placeholder="Email" />
                  <input id="telephone" placeholder="Téléphone" />
                </div>

                <div className="form-grid">
                  <input id="date_naissance" type="date" />
                  <input id="lieu_naissance" placeholder="Lieu de naissance" />
                  <input id="cisco_zap" placeholder="Cisco :___ - Zap:___" />
                </div>

                <div className="form-grid">
                  <select id="examen">
                    <option value="">Choisir examen</option>
                    <option value="CAP">CAP.</option>
                    <option value="CAE">CAE</option>
                  </select>
                  <input
                    id="lieu_de_service_et_etablissement"
                    placeholder="Lieu de service et établissement"
                  />
                </div>

                <div className="upload-zone" onClick={handleUploadClick}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    hidden
                  />
                  Cliquez pour ajouter un document (obligatoire)
                </div>

                {file && (
                  <div className="file-list">
                    <div className="file-item">
                      <span className="file-name">{file.name}</span>
                      <span
                        className="file-remove"
                        onClick={() => setFile(null)}
                      >
                        ✖
                      </span>
                    </div>
                  </div>
                )}

                <br />
                <button
                  ref={submitButtonRef}
                  className="btn-submit"
                  onClick={handleSubmit}
                  disabled={isSubmitDisabled()}
                >
                  {isSubmitting ? "ENVOI EN COURS..." : "VALIDER LE DOSSIER"}
                </button>
              </div>
            </section>
          )}

          {popup && <div className="popup">{popup}</div>}
        </main>
      </div>
    </>
  );
}

export default App;