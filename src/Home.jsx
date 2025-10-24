// src/Home.jsx
import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

import {
  FaCircleNotch,
  FaTrash,
  FaCalendarDay,
  FaAngleLeft,
  FaAngleRight,
} from "react-icons/fa";

export default function Home({ user }) {
  const [count, setCount] = useState(0);
  const [goal, setGoal] = useState(8);
  const [loading, setLoading] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);
  const getTodayInZone = (zone) => {
    const now = new Date();
    const options = {
      timeZone: zone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };
    const formatter = new Intl.DateTimeFormat("en-CA", options);
    return formatter.format(now);
  };

  const [date, setDate] = useState(getTodayInZone(Intl.DateTimeFormat().resolvedOptions().timeZone));
  const [nombre, setNombre] = useState("Usuario");
  const [zonaHoraria, setZonaHoraria] = useState("");
  const [resetPopup, setResetPopup] = useState(false);


  const currentKey = date;

  useEffect(() => {
    const fetchGoal = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const ref = doc(db, "usuarios", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setNombre(snap.data().name || "Usuario");
          setGoal(snap.data().preferencias?.metaDiaria || 8);
          setZonaHoraria(snap.data().zonaHoraria || zonaHoraria);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchGoal();
  }, [user.uid]);

  useEffect(() => {
    const fetchCount = async () => {
      setLoading(true);
      try {
        const ref = doc(db, "usuarios", user.uid, "dias", currentKey);
        const snap = await getDoc(ref);
        setCount(snap.exists() ? snap.data().count : 0);
      } finally {
        setLoading(false);
      }
    };
    fetchCount();
  }, [currentKey]);

  const changeCount = async (delta) => {
    const newVal = Math.max(count + delta, 0);
    setCount(newVal);
    setLoading(true);
    try {
      await setDoc(
        doc(db, "usuarios", user.uid, "dias", currentKey),
        { count: newVal },
        { merge: true }
      );
    } finally {
      setLoading(false);
    }
  };

  const resetDay = async () => {
    setResetPopup(true);
  };

  const confirmReset = async () => {
    setLoadingReset(true);
    try {

      await setDoc(doc(db, "usuarios", user.uid, "dias", currentKey), { count: 0 }, { merge: true });
      setCount(0);
    } finally {
      setLoadingReset(false);
      setResetPopup(false);
    }
  };


  const percent = Math.min((count / goal) * 100, 100);

  return (
    <div className="home-page">
      <section className="card">
        <h2 className="bienvenido">Hola, {nombre}</h2>

        <div className="C1 gp25">
          {/* Fecha */}
          <div className="date-row">
            <button
              onClick={() =>
                setDate(
                  new Date(
                    new Date(date).setDate(new Date(date).getDate() - 1)
                  )
                    .toISOString()
                    .slice(0, 10)
                )
              }
            >
              <FaAngleLeft className="IZQ" />
            </button>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            <button
              onClick={() =>
                setDate(
                  new Date(
                    new Date(date).setDate(new Date(date).getDate() + 1)
                  )
                    .toISOString()
                    .slice(0, 10)
                )
              }
            >
              <FaAngleRight className="DER" />
            </button>

            <button onClick={() => setDate(getTodayInZone(zonaHoraria))}>
              <FaCalendarDay className="HOY" />
            </button>
          </div>


          {loading && (
            <div className="spinner">
              <FaCircleNotch className="spin" />
            </div>
          )}
          {/* Contador */}
          <div className="count">{count}</div>

          {/* Controles */}
          <div className="controls">
            <button onClick={() => changeCount(-1)} className="btnMenos">-</button>
            <button onClick={() => changeCount(1)} className="btnMas">+</button>
            <button onClick={resetDay} className="btnTrash">
              <FaTrash />
            </button>
          </div>

          {/* Barra de progreso */}
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: percent + "%",
                background:
                  percent >= 100
                    ? "linear-gradient(90deg,#16a34a,#4ade80)"
                    : "linear-gradient(90deg,#06b6d4,#3b82f6)",
              }}
            ></div>
          </div>

          {/* Mensaje final */}
          <div className="Faltan">
            {percent >= 100
              ? "Meta alcanzada"
              : `Faltan ${goal - count} vasos`}
          </div>
        </div>
      </section>
      {/* Popup de reset */}
      {resetPopup && (
        <div className="fondoPopupEmail" style={{ left: "620px", top: "350px" }}>
          <div className="EstiloPopupEmail">

            <p className="MsjpopupEmail">¿Seguro que querés reiniciar el conteo de hoy?</p>

            <div style={{ display: "flex", justifyContent: "space-around", marginTop: 10 }}>

              <button onClick={confirmReset} disabled={loadingReset} className="btnS">
                {loadingReset ? <FaCircleNotch className="spin" /> : "Sí"}
              </button>
              <button onClick={() => setResetPopup(false)} disabled={loadingReset} className="btnN">No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
