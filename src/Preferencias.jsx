import { FaSun, FaMoon, FaCheck } from "react-icons/fa";
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
      setMsg("Preferencias guardadas");
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
        <input id="meta" placeholder=" " className=" form-group meta fondoInput bordeInput MBInput paddingInput colorInput FSInput outline my-2 width88" type="number" value={metaDiaria} onChange={e => setMetaDiaria(parseInt(e.target.value))} />
        <label htmlFor="meta" style={{left:'10px'}}> Meta diaria de vasos</label>
      </div>



      <div style={{ marginTop: 18, marginBottom: 24 }}>
        <button
          onClick={toggleTema}
          className="theme-toggle-btn transparente bordeNo blanco L-23 T-1 absolute"
          title={`Cambiar a modo ${tema === "claro" ? "oscuro" : "claro"}`}
        >
          {tema === "claro" ? (
            <FaSun className="icon-sol" />
          ) : (
            <FaMoon className="icon-luna" />
          )}
        </button>
      </div>



      <button onClick={guardarPreferencias} disabled={loading} className="btnGC">
        Guardar preferencias
      </button>
      {checkVisible && <span style={{ color: "limegreen" }}>✔</span>}
      {msg && <div style={{ color: msg.includes("Error") ? "red" : "green" }}>{msg}</div>}
    </section>
  );
}
