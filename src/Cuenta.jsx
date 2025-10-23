// src/Cuenta.jsx
import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs } from "firebase/firestore";
import { deleteUser, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { db, auth } from "./firebase";


export default function Cuenta({ user }) {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [checkVisible, setCheckVisible] = useState(false);
  const [loading, setLoading] = useState(false);

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
      setMsg("Cambios guardados");
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
    if (!window.confirm("¿Eliminar cuenta y todos los datos?")) return;
    setLoading(true);

    try {
      const password = prompt("Para eliminar la cuenta, ingresá tu contraseña:");
      if (!password) throw new Error("Se requiere la contraseña para eliminar la cuenta.");
      const credential = EmailAuthProvider.credential(user.email);
      await reauthenticateWithCredential(user, credential);

      const vasosCol = collection(db, "vasos", user.uid, "dias");
      const docsSnap = await getDocs(vasosCol);
      for (const docSnap of docsSnap.docs)
        await deleteDoc(doc(db, "vasos", user.uid, "dias", docSnap.id));

      // Eliminar usuario
      await deleteDoc(doc(db, "usuarios", user.uid));
      await deleteUser(user);

      alert("Cuenta eliminada");
      window.location.href = "login.jsx";
    } catch (e) {
      console.error(e);
      alert("Error eliminando cuenta. Reingresá y probá de nuevo.");
    } finally {
      setLoading(false);
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

        <button onClick={guardarCambios} disabled={loading} className="btnGC">Guardar cambios</button>
        {checkVisible && <span style={{ color: "limegreen" }}>✔</span>}
        {msg && <div style={{ color: "green" }}>{msg}</div>}

        <button onClick={eliminarCuenta} disabled={loading} className="btnEC">Eliminar cuenta</button>

      </div>
    </section >

  );
}
