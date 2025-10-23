// src/Registro.jsx
import { useState } from "react";
import {
  getAuth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
  signOut
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { FaEye, FaEyeSlash, FaCircleNotch } from "react-icons/fa";
import Flag from "react-world-flags";


const countries = {
  Argentina: { zone: "America/Argentina/Buenos_Aires", flag: "AR" },
  México: { zone: "America/Mexico_City", flag: "MX" },
  España: { zone: "Europe/Madrid", flag: "ES" },
  Chile: { zone: "America/Santiago", flag: "CL" },
  Perú: { zone: "America/Lima", flag: "PE" },
  Colombia: { zone: "America/Bogota", flag: "CO" }
};

export default function Registro({ setCurrentScreen }) {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");
  const [meta, setMeta] = useState(8);
  const [msg, setMsg] = useState({ text: "", color: "" });
  const [showPass, setShowPass] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [pais, setPais] = useState("");
  const [zonaHoraria, setZonaHoraria] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const registrar = async () => {
    if (!nombre || !apellido || !email || !pass || !pass2 || !pais) {
      setMsg({ text: "Completa todos los campos", color: "red" });
      return;
    }
    if (pass !== pass2) {
      setMsg({ text: "Las contraseñas no coinciden", color: "red" });
      return;
    }

    if (pass == nombre || pass == apellido) {
      alert({ text: "La contraseña no puede contener informacion personal." })
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const user = userCredential.user;

      await setDoc(doc(db, "usuarios", user.uid), {
        name: nombre,
        apellido,
        email,
        pais,
        zonaHoraria,
        preferencias: { metaDiaria: meta },
        verificado: false,
      });

      await sendEmailVerification(user);
      await signOut(auth);
      setCurrentScreen("login")


    } catch (e) {
      setMsg({ text: e.message, color: "red" });
    } finally { setLoading(false); }
  };

  const loginGoogle = async () => {

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      await setDoc(
        doc(db, "usuarios", user.uid),
        {
          name: user.displayName?.split(" ")[0] || user.email,
          apellido: user.displayName?.split(" ").slice(1).join("") || "",
          email: user.email,
          preferencias: { metaDiaria: 8 },
        },
        { merge: true }
      );
      setMsg({ text: `Bienvenido ${user.displayName || user.email}`, color: "green" });
    } catch (e) {
      setMsg({ text: e.message, color: "red" });
    }
  };

  return (
    <section className="card">
      <p className="text-center FZTitle">Registro</p>

      <div className="name-group C2 gp50">
        <input type="text" placeholder="Nombre" className="nombre fondoInput bordeInput MBInput paddingInput colorInput FSInput outline my-2" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        <input type="text" placeholder="Apellido" className="apellido fondoInput bordeInput MBInput paddingInput colorInput FSInput outline my-2" value={apellido} onChange={(e) => setApellido(e.target.value)} />
      </div>
      <div className="name-group C1" >
        <input type="email" placeholder="Email" className="email fondoInput bordeInput MBInput paddingInput colorInput FSInput outline my-2" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>

      <div className="name-group C2 gp50">
        <label>
          <input type={showPass ? "text" : "password"} className="password fondoInput width88 bordeInput MBInput paddingInput colorInput FSInput outline my-2" placeholder="Contraseña" value={pass} onChange={(e) => setPass(e.target.value)}
          />
          <button className="btnVer transparente outline bordeNo blanco topOjo MLOjo absolute" type="button" onClick={() => setShowPass(!showPass)}>
            {showPass ? <FaEyeSlash /> : <FaEye />}
          </button>
        </label>
        <div>
          <input type={showPass2 ? "text" : "password"} className="password2 fondoInput width88 bordeInput MBInput paddingInput colorInput FSInput outline my-2" placeholder="Repetir contraseña" value={pass2} onChange={(e) => setPass2(e.target.value)} />
          <button className="btnVer transparente outline bordeNo blanco topOjo MLOjo absolute" type="button" onClick={() => setShowPass2(!showPass2)}>
            {showPass2 ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
      </div>

      <div className="name-group C2 gp50">

        <input className="meta fondoInput bordeInput MBInput paddingInput colorInput FSInput outline my-2" placeholder="Meta diaria de vasos" type="number" min="1" max="20" onChange={(e) => setMeta(parseInt(e.target.value))} />


        <div className="dropdown-btn MTPaises ZIPaises fondoInput bordeInput MBInput paddingInput colorInput FSInput outline my-2" onClick={() => setOpen(!open)} >
          {pais ? (
            <>
              <Flag code={countries[pais].flag} style={{ width: 25, height: 15, marginRight: 8 }} />
              {pais}
            </>
          ) : (
            "Elegí tu país"
          )}
        </div>
        {open && (
          <div className="dropdown-content">
            {Object.keys(countries).map((c) => (
              <div
                key={c}
                className="dropdown-item"
                onClick={() => {
                  setPais(c);
                  setZonaHoraria(countries[c].zone);
                  setOpen(false);
                }}
              >
                <Flag code={countries[c].flag} style={{ width: 25, height: 15, marginRight: 8 }} />
                {c}
              </div>
            ))}
          </div>
        )}
      </div>

      <button className="registerBtn bordeBtn colorBtn paddingBtn transicionesBtn btnHover MPBtn transparente width100" onClick={registrar}>Registrarme</button>

      {msg.text && <div style={{ color: msg.color }}>{msg.text}</div>}
      <p className="loginMsj colorMsj FZMsj Text-decorationMsj text-center">¿Ya tenés cuenta? <a href="login.html" className="loginA loginA pointer colorMsj ColorMsj MGTopMsj px-1 Text-decorationMsj">Login</a></p>
    </section>
  );
}
