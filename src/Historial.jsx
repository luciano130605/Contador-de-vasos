// src/Historial.jsx
import { useState, useEffect } from "react";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import "./App.css";

export default function Historial({ user }) {
  const [registros, setRegistros] = useState([]);
  const [msg, setMsg] = useState("");

  const formatFecha = (id) => {
    const [y, m, d] = id.split("-").map(Number);
    const fecha = new Date(y, m - 1, d);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const ayer = new Date(hoy);
    ayer.setDate(hoy.getDate() - 1);
    const manana = new Date(hoy);
    manana.setDate(hoy.getDate() + 1);

    if (fecha.getTime() === hoy.getTime()) return "Hoy";
    if (fecha.getTime() === ayer.getTime()) return "Ayer";
    if (fecha.getTime() === manana.getTime()) return "Mañana";

    return `${String(fecha.getDate()).padStart(2, "0")}/${String(
      fecha.getMonth() + 1
    ).padStart(2, "0")}/${fecha.getFullYear()}`;
  };

  useEffect(() => {
    const fetchHistorial = async () => {
      if (!user) return;

      try {
        const userSnap = await getDoc(doc(db, "usuarios", user.uid));
        const metaDiaria = userSnap.exists()
          ? userSnap.data().preferencias?.metaDiaria || 8
          : 8;

        const diasSnap = await getDocs(collection(db, "vasos", user.uid, "dias"));
        if (diasSnap.empty) {
          setMsg("No hay registros todavía.");
          setRegistros([]);
          return;
        }

        const docs = diasSnap.docs
          .map((d) => {
            const data = d.data();
            return { id: d.id, vasos: data.count ?? 0, meta: metaDiaria };
          })
          .sort((a, b) => b.id.localeCompare(a.id));

        setRegistros(docs);
        setMsg("");
      } catch (err) {
        console.error(err);
        setMsg("Error cargando historial.");
      }
    };

    fetchHistorial();
  }, [user]);

  return (
    <section className="card">
      <h2 className="text-center">Historial de Consumo</h2>
      {msg && <div style={{ color: msg.includes("Error") ? "red" : "#555" }}>{msg}</div>}
      <div className="historial-lista">
        {registros.map((r) => {
          const progreso = Math.min((r.vasos / r.meta) * 100, 100);
          return (
            <div key={r.id} className="historial-item">
              <div className="fecha">{formatFecha(r.id)}</div>
              <div className="info">
                <div className="vasos">{r.vasos}/{r.meta} vasos</div>
                <div className="barra" style={{ background: "#eee", height: "10px", borderRadius: "5px" }}>
                  <div
                    className="relleno"
                    style={{
                      width: `${progreso}%`,
                      background: progreso >= 100 ? "limegreen" : "#629cffff",
                      height: "100%",
                      borderRadius: "5px",
                    }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
