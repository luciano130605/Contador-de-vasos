import { useState, useEffect } from "react";
import { collection, getDocs, getDoc, doc } from "firebase/firestore";
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
  LabelList
} from "recharts";
import { motion } from "framer-motion";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function Historial({ user }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [data, setData] = useState([]);
  const [viewMode, setViewMode] = useState("month");
  const [meta, setMeta] = useState(8);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

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
    setLoading(true);
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
    setLoading(false);
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

  // Solo mostrar ticks cada 5 días en mes
  const tickFormatter = (tick) => (viewMode === "month" && tick % 5 !== 0 ? "" : tick);

  const yTickFormatter = (tick) => {
    if (tick === meta) {
      return <tspan fill="#0084ff" fontWeight="600">{tick}</tspan>;
    }
    return tick;
  };

  const renderTilde = (props) => {
    const { x, y, width, height, value } = props;
    if (value >= meta) {
      return (
        <text
          x={x + width / 2}
          y={y - (-15)}
          textAnchor="middle"
          fill="#001020ff"
          fontWeight={"600"}
          fontSize={12}
        >
          ✓
        </text>
      );
    }
    return null;
  };

  return (
    <section className="card">
      <h2 className="text-center">Historial</h2>

      {/* 🔘 Controles */}
      <div className="date-row">
        {viewMode === "month" ? (
          <>
            <button onClick={() => changeMonth(-1)}>
              <FaChevronLeft className="IZQ" />
            </button>
            <span style={{ fontWeight: "600" }}>
              {selectedDate.toLocaleString("default", { month: "long" })}{" "}
              {selectedDate.getFullYear()}
            </span>
            <button onClick={() => changeMonth(1)}>
              <FaChevronRight className="DER" />
            </button>
          </>
        ) : (
          <>
            <button onClick={() => changeWeek(-1)}>
              <FaChevronLeft className="IZQ" />
            </button>
            <span style={{ fontWeight: "600" }}>
              Semana de {selectedDate.getDate()}{" "}
              {selectedDate.toLocaleString("default", { month: "short" })}
            </span>
            <button onClick={() => changeWeek(1)}>
              <FaChevronRight className="DER" />
            </button>
          </>
        )}
      </div>

      {/* 🔄 Cambiar entre mes y semana */}
      <div style={{ textAlign: "center", marginBottom: "15px" }}>
        <button
          onClick={() => setViewMode(viewMode === "month" ? "week" : "month")}
          className="BTNVerSem"
        >
          Ver por {viewMode === "month" ? "semana" : "mes"}
        </button>
      </div>

      {/* 📊 Gráfico */}
      <div
        style={{
          width: "100%",
          maxWidth: "600px",
          height: "300px",
          margin: "0 auto",
        }}
      >
        {loading ? (
          <div className="spinner"></div> // acá va tu spinner CSS
        ) : (

          <motion.div
            key={viewMode + selectedDate}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={{ width: "100%", height: "100%" }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 10 }} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="none" />
                <XAxis
                  dataKey="day"
                  tickFormatter={tickFormatter}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  tickLine={false}
                />
              // 1️⃣ YAxis: pintar la meta en azul
                <YAxis
                  tick={({ x, y, payload }) => (
                    <text
                      x={x}
                      y={y}
                      fill={payload.value === meta ? "#0084ff" : "#94a3b8"}
                      fontSize={12}
                      textAnchor="end"
                      dominantBaseline="middle"
                    >
                      {payload.value}
                    </text>
                  )}
                  tickLine={false}
                  allowDecimals={false}
                /><YAxis tickFormatter={yTickFormatter} tick={{ fill: "#94a3b8", fontSize: 12 }} tickLine={false} allowDecimals={false} />

                <Tooltip
                  contentStyle={{ backgroundColor: "rgba(30, 41, 59, 0.7)", backdropFilter: "blur(6px)", border: "none", borderRadius: "8px", color: "#fff" }}
                  labelFormatter={(label) => `Día ${label}`}
                />
                <ReferenceLine y={meta} stroke="#0084ffff" />
                <Bar dataKey="vasos" fill="#38bdf8" radius={[6, 6, 0, 0]} barSize={10}>
                  <LabelList dataKey="vasos" content={renderTilde} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>

          </motion.div>
        )
        }
      </div>
    </section>
  )
}