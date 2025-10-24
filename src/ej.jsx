import { useState, useEffect } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function Historial({ user }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [data, setData] = useState([]);
  const [viewMode, setViewMode] = useState("month");
  const [meta, setMeta] = useState(8); // default en caso de que no haya preferencias

  useEffect(() => {
    if (!user) return;
    // primero buscamos la meta del usuario
    const fetchMeta = async () => {
      const userDoc = await getDoc(doc(db, "usuarios", user.uid));
      if (userDoc.exists()) {
        setMeta(userDoc.data()?.preferencias?.metaDiaria || 8);
      }
    };
    fetchMeta();
    fetchData();
  }, [user, selectedDate, viewMode]);

  const fetchData = async () => {
    const diasCol = collection(db, "usuarios", user.uid, "dias");
    const snap = await getDocs(diasCol);

    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let tempData = [];
    for (let d = 1; d <= daysInMonth; d++) {
      tempData.push({ day: d, vasos: 0 });
    }

    snap.forEach((docSnap) => {
      const date = new Date(docSnap.id);
      if (date.getMonth() === month && date.getFullYear() === year) {
        tempData[date.getDate() - 1].vasos = docSnap.data().count || 0;
      }
    });

    if (viewMode === "week") {
      const currentDay = selectedDate.getDate();
      const start = Math.max(currentDay - 3, 1);
      const end = Math.min(currentDay + 3, daysInMonth);
      tempData = tempData.slice(start - 1, end);
    }

    setData(tempData);
  };

  const changeMonth = (inc) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(selectedDate.getMonth() + inc);
    setSelectedDate(newDate);
  };

  const changeWeek = (inc) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + inc * 7);
    setSelectedDate(newDate);
  };

  const tickFormatter = (tick) => (viewMode === "month" && tick % 5 !== 0 ? "" : tick);

  const yTickFormatter = (tick) => {
    if (tick === meta) {
      return <tspan fill="#0084ff" fontWeight="600">{tick}</tspan>;
    }
    return tick;
  };

  return (
    <section style={{ padding: "1rem" }}>
      <h2 style={{ textAlign: "center" }}>Historial</h2>

      {/* Controles */}
      <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        {viewMode === "month" ? (
          <>
            <button onClick={() => changeMonth(-1)} style={{ background: "transparent", border: "none", cursor: "pointer" }}>
              <FaChevronLeft style={{ color: "#38bdf8", fontSize: "1.2rem" }} />
            </button>
            <span style={{ fontWeight: 600 }}>
              {selectedDate.toLocaleString("default", { month: "long" })} {selectedDate.getFullYear()}
            </span>
            <button onClick={() => changeMonth(1)} style={{ background: "transparent", border: "none", cursor: "pointer" }}>
              <FaChevronRight style={{ color: "#38bdf8", fontSize: "1.2rem" }} />
            </button>
          </>
        ) : (
          <>
            <button onClick={() => changeWeek(-1)} style={{ background: "transparent", border: "none", cursor: "pointer" }}>
              <FaChevronLeft style={{ color: "#38bdf8", fontSize: "1.2rem" }} />
            </button>
            <span style={{ fontWeight: 600 }}>
              Semana de {selectedDate.getDate()}{" "}
              {selectedDate.toLocaleString("default", { month: "short" })}
            </span>
            <button onClick={() => changeWeek(1)} style={{ background: "transparent", border: "none", cursor: "pointer" }}>
              <FaChevronRight style={{ color: "#38bdf8", fontSize: "1.2rem" }} />
            </button>
          </>
        )}
      </div>

      {/* Cambiar vista */}
      <div style={{ textAlign: "center", marginBottom: "15px" }}>
        <button
          onClick={() => setViewMode(viewMode === "month" ? "week" : "month")}
          style={{ background: "#111827", color: "#e6eef6", border: "1px solid #334155", padding: "6px 12px", borderRadius: "8px", cursor: "pointer" }}
        >
          Ver por {viewMode === "month" ? "semana" : "mes"}
        </button>
      </div>

      {/* Gráfico */}
      <div style={{ width: "100%", maxWidth: "600px", height: "300px", margin: "0 auto" }}>
        <motion.div key={viewMode + selectedDate} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} style={{ width: "100%", height: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 10 }} barCategoryGap="30%">
              <CartesianGrid stroke="#334155" strokeWidth={0.5} strokeDasharray="3 3" />
              <XAxis dataKey="day" tickFormatter={tickFormatter} tick={{ fill: "#94a3b8", fontSize: 12 }} tickLine={false} />
              <YAxis
                tickFormatter={yTickFormatter}
                tick={{ fontSize: 12 }}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{ backgroundColor: "rgba(30, 41, 59, 0.7)", backdropFilter: "blur(6px)", border: "none", borderRadius: "8px", color: "#fff" }}
              />
              <ReferenceLine y={meta} stroke="#0084ff" strokeWidth={1} />
              <Bar
                dataKey="vasos"
                radius={[6, 6, 0, 0]}
                barSize={12}
                fill="#38bdf8"
                isAnimationActive={false}
                shape={(props) => {
                  const { x, y, width, height, value } = props;
                  const color = value >= meta ? "#f87171" : "#38bdf8";
                  return <rect x={x} y={y} width={width} height={height} fill={color} rx={6} />;
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </section>
  );
}
