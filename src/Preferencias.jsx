import { FaSun, FaMoon, FaCheck, FaCircleNotch } from "react-icons/fa";
import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import "./App.css";


export default function Preferencias({ user }) {
  const [metaDiaria, setMetaDiaria] = useState(8);
  const [tema, setTema] = useState("claro");
  const [msg, setMsg] = useState("");
  const [checkVisible, setCheckVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("light-theme", tema === "claro");
  }, [tema]);

  useEffect(() => {
    const fetchPrefs = async () => {
      if (!user) return;
      const snap = await getDoc(doc(db, "usuarios", user.uid));
      if (snap.exists()) {
        const data = snap.data();
        const prefs = data.preferencias || {};
        setMetaDiaria(prefs.metaDiaria || 8);
        setTema(prefs.tema || "claro");
      }
    };
    fetchPrefs();
  }, [user]);

  const guardarPreferencias = async () => {
    setLoading(true);
    setMsg("");
    setCheckVisible(false);
    try {
      await setDoc(
        doc(db, "usuarios", user.uid),
        { preferencias: { metaDiaria, tema } },
        { merge: true }
      );
      setCheckVisible(true);
      setTimeout(() => setCheckVisible(false), 2000);
    } catch (e) {
      console.error(e);
      setMsg("Error al guardar preferencias");
    } finally {
      setLoading(false);
    }
  };

  const toggleTema = () => {
    setTema((prev) => (prev === "claro" ? "oscuro" : "claro"));
  };

  return (
    <section className="card">
      <h2 className="text-center">Preferencias</h2>

      <div className="form-group floating-label">
        <input id="meta" placeholder=" " className=" form-group meta fondoInput bordeInput MBInput colorInput FSInput outline my-2 width88" type="number" value={metaDiaria} onChange={e => setMetaDiaria(parseInt(e.target.value))} />
        <label htmlFor="meta" style={{ left: '10px' }}> Meta diaria de vasos</label>
      </div>



      <div className="theme-switch-container">
        <div
          className={`theme-switch ${tema === "oscuro" ? "dark" : ""}`}
          onClick={toggleTema}
        >
          <FaSun className="icon sun" />
          <FaMoon className="icon moon" />
          <div className="slider" />
        </div>
      </div>



      <button onClick={guardarPreferencias} disabled={loading} className="btnGC" disabled={loading}>
        {loading ? (
          <FaCircleNotch className="spin" />
        ) : checkVisible ? (
          <span style={{ display: "flex", alignItems: "center", gap: "5px", color: "#59ff59", textAlign: "center", position: "relative", left: "140px" }}>
            Guardado
          </span>
        ) : (
          " Guardar preferencias"
        )}
      </button>
      {msg && <div style={{ color: msg.includes("Error") ? "red" : "green" }}>{msg}</div>}
    </section>
  );
}
