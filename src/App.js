// src/App.js
import { useState, useEffect } from "react";
import { FaBars, FaHome, FaUser, FaSlidersH, FaClock, FaSignOutAlt, FaChartLine } from "react-icons/fa";
import Home from "./Home";
import Cuenta from "./Cuenta";
import Preferencias from "./Preferencias";
import Historial from "./Historial";
import Login from "./Login";
import Registro from "./Registro";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import "./App.css";
import "./style.css";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);


  // Escucha cambios de auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u && u.emailVerified) {
        setUser(u); // usuario confirmado → Home
      } else {
        setUser(null); // usuario no confirmado o no logueado → Login/Registro
      }
    });
    return () => unsubscribe();
  }, []);

  const renderScreen = () => {
    if (!user) {
      // Login y Registro para usuarios no logueados
      return currentScreen === "registro" && <Registro setCurrentScreen={setCurrentScreen} />
        ? <Registro setCurrentScreen={setCurrentScreen} />
        : <Login setCurrentScreen={setCurrentScreen} />;
    }

    // Pantallas para usuarios logueados
    switch (currentScreen) {
      case "home": return <Home user={user} />;
      case "cuenta": return <Cuenta user={user} />;
      case "preferencias": return <Preferencias user={user} />;
      case "historial": return <Historial user={user} />;
      default: return <Home user={user} />;
    }
  };

  return (
    <main>
      {user && (
        <>
          <header className="topbar">
            <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
              <FaBars />
            </button>
          </header>

          <aside className={`menu-lateral ${menuOpen ? "show" : ""}`}>
            <ul>
              <li><button onClick={() => setCurrentScreen("home")}><FaHome /> Inicio</button></li>
              <li><button onClick={() => setCurrentScreen("cuenta")}><FaUser /> Cuenta</button></li>
              <li><button onClick={() => setCurrentScreen("preferencias")}><FaSlidersH /> Preferencias</button></li>
              <li><button onClick={() => setCurrentScreen("historial")}><FaChartLine /> Metricas</button></li>
              <li><button onClick={() => signOut(auth)}><FaSignOutAlt /> Cerrar sesión</button></li>
            </ul>
          </aside>
        </>
      )}

      <section className="screen-container">
        {renderScreen()}
      </section>
    </main>
  );
}
