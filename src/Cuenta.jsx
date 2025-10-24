// src/Cuenta.jsx
import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs } from "firebase/firestore";
import { deleteUser, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { db, auth } from "./firebase";
import { FaCircleNotch } from "react-icons/fa";



export default function Cuenta({ user }) {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [checkVisible, setCheckVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [showPopup, setShowPopup] = useState(false);


  useEffect(() => {
    const fetchUser = async () => {
      if (!user) return;
      const ref = doc(db, "usuarios", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setNombre(data.name || "");
        setApellido(data.apellido || "");
        setEmail(data.email || user.email);
      }
    };
    fetchUser();
  }, [user]);

  const guardarCambios = async () => {
    if (!nombre || !apellido || !email) {
      setMsg("Completá todos los campos");
      return;
    }
    setLoading(true);
    setMsg("");
    setCheckVisible(false);

    try {
      await setDoc(doc(db, "usuarios", user.uid), { name: nombre, apellido, email }, { merge: true });
      setCheckVisible(true);
      setTimeout(() => setCheckVisible(false), 2000);
    } catch (e) {
      console.error(e);
      setMsg("Error al guardar los cambios");
    } finally {
      setLoading(false);
    }
  };

  const eliminarCuenta = async () => {
    if (confirmText.trim().toLowerCase() !== "eliminar") {
      alert('Tenés que escribir "eliminar" para borrar tu cuenta.');
      return;
    }

    setLoading(true);
    try {
      const diasCol = collection(db, "usuarios", user.uid, "dias");
      const docsSnap = await getDocs(diasCol);
      for (const docSnap of docsSnap.docs) {
        await deleteDoc(doc(db, "usuarios", user.uid, "dias", docSnap.id));
      }

      await deleteDoc(doc(db, "usuarios", user.uid));
      await deleteUser(user);

      alert("Cuenta eliminada con éxito.");
      window.location.href = "login.html";
    } catch (e) {
      console.error(e);
      alert("Error eliminando cuenta. Reingresá y probá de nuevo.\n" + e.message);
    } finally {
      setLoading(false);
      setShowPopup(false);
    }
  };

  return (
    <section className="card">
      <h2 className="text-center">Cuenta</h2>

      <div className="form-group floating-label">
        <input id="nombre" placeholder=" " className=" form-group" type="text" value={nombre} onChange={e => setNombre(e.target.value)} />
        <label htmlFor="nombre" style={{ textAlign: 'center' }}> Nombre</label>
      </div>

      <div className="form-group floating-label my-4">
        <input id="apellido" placeholder=" " className=" form-group" type="text" value={apellido} onChange={e => setApellido(e.target.value)} />
        <label htmlFor="apellido" style={{ textAlign: 'center' }}> Apellido</label>
      </div>

      <div className="form-group floating-label my-4">
        <input id="email" placeholder=" " className=" form-group" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        <label htmlFor="email" style={{ textAlign: 'center' }}> Email</label>
      </div>


      <div className="name-group my-4" style={{ display: 'grid', gap: '10px', gridTemplateColumns: "repeat(2,minmax(0,1fr))" }}>
        <button onClick={guardarCambios} className="btnGC" disabled={loading}>
          {loading ? (
            <FaCircleNotch className="spin" />
          ) : checkVisible ? (
            <span style={{ display: "flex", alignItems: "center", gap: "5px", color: "#59ff59", textAlign: "center", position: "relative", left: "45px" }}>
              Guardado
            </span>
          ) : (
            "Guardar cambios"
          )}
        </button>
        {msg && <div style={{ color: "red" }}>{msg}</div>}
        <button onClick={() => setShowPopup(true)} disabled={loading} className="btnEC">Eliminar cuenta</button>
      </div>

      {/* 🔥 Popup de confirmación */}
      {showPopup && (
        <div className="CuentaPopup">
          <div>
            <h3 className="CuentaPopupH3">Confirmar eliminación</h3>
            <p className="CuentaPopupP">Escribí <strong>eliminar</strong> para borrar tu cuenta.</p>
            <input className="CuentaPopupInput fondoInput bordeInput MBInput paddingInput colorInput FSInput outline my-2"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="eliminar"
            />
            <div>
              <button className="CuentaPopupBtnEliminar"
                onClick={eliminarCuenta}
                disabled={loading}
              >
                {loading ? "Eliminando..." : "Eliminar"}
              </button>
              <button className="CuentaPopupBtnCancelar"
                onClick={() => setShowPopup(false)}

              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </section >
  );
};  
