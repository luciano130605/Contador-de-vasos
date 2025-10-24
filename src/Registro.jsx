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
import { collection, doc, setDoc } from "firebase/firestore";
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
  const [showPopup, setShowPopup] = useState(false);
  const [errors, setErrors] = useState({
    nombre: "",
    apellido: "",
    email: "",
    pass: "",
    pass2: "",
    pais: "",
    meta: ""
  });


  const getTodayInZone = (zone) => {
    const now = new Date();
    const options = {
      timeZone: zone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };
    const formatter = new Intl.DateTimeFormat("en-CA", options); // formato YYYY-MM-DD
    return formatter.format(now);
  };


  const validar = () => {
    let valid = true;
    const newErrors = { nombre: "", apellido: "", email: "", pass: "", pass2: "", pais: "" };

    if (!nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio";
      valid = false;
    }
    if (!apellido.trim()) {
      newErrors.apellido = "El apellido es obligatorio";
      valid = false;
    }
    if (!email.trim()) {
      newErrors.email = "El email es obligatorio";
      valid = false;
    }
    if (!pais) {
      newErrors.pais = "Elegí un país";
      valid = false;
    }
    if (!meta || meta < 1) {
      newErrors.meta = "La meta debe contener al menos 1 vaso";
      valid = false;
    }
    if (pass.length < 6) {
      newErrors.pass = "La contraseña debe tener al menos 6 caracteres";
      valid = false;
    }
    if (pass.toLowerCase() === nombre.toLowerCase() || pass.toLowerCase() === apellido.toLowerCase()) {
      newErrors.pass = "La contraseña no puede contener tu nombre o apellido";
      valid = false;
    }
    if (pass !== pass2) {
      newErrors.pass2 = "Las contraseñas no coinciden";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const registrar = async () => {
    if (!validar()) return;

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
      })

      const hoy = getTodayInZone(zonaHoraria || "UTC");

      await setDoc(doc(db, "usuarios", user.uid, "dias", hoy), {
        dia: hoy,
        count: 0,
        createdAt: new Date().toISOString(),
      });


      await sendEmailVerification(user);
      setShowPopup(true);


    } catch (e) {
      if (e.code === "auth/email-already-in-use") {
        setErrors(prev => ({ ...prev, email: "El correo ya está en uso" }));
      }
      else if (e.code === "auth/invalid-email") {
        setErrors(prev => ({ ...prev, email: "El correo no tiene formato válido (correo@ejemplo.com)" }));
      }
      else {
        setMsg({ text: e.message, color: "red" });
      }
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

        <div>
          <input type="text" style={{ width: "88%" }} placeholder="Nombre" className="nombre fondoInput bordeInput MBInput paddingInput colorInput FSInput outline my-2" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          {errors.nombre && <div style={{ color: "#f76161", fontSize: "0.8em" }}>{errors.nombre}</div>}
        </div>

        <div>
          <input style={{ width: "88%" }} type="text" placeholder="Apellido" className="apellido fondoInput bordeInput MBInput paddingInput colorInput FSInput outline my-2" value={apellido} onChange={(e) => setApellido(e.target.value)} />
          {errors.apellido && <div style={{ color: "#f76161", fontSize: "0.8em" }}>{errors.apellido}</div>}
        </div>

      </div>

      <div className="name-group C1" >
        <div>
          <input type="email" style={{ width: "95%" }} placeholder="Email" className="email fondoInput bordeInput MBInput paddingInput colorInput FSInput outline my-2" value={email} onChange={(e) => setEmail(e.target.value)} />
          {errors.email && <div style={{ color: "#f76161", fontSize: "0.8em" }}>{errors.email}</div>}
        </div>
      </div>

      <div className="name-group C2 gp50">
        <div>
          <div style={{ position: "relative", width: "88%" }}>
            <input
              type={showPass ? "text" : "password"}
              className="password fondoInput bordeInput MBInput paddingInput colorInput FSInput outline my-2"
              placeholder="Contraseña"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              style={{ paddingRight: "2.5rem", width: "88%" }}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              style={{
                position: "absolute",
                right: "-1.2rem",
                top: "52%",
                transform: "translateY(-50%)",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                color: "white"
              }}
            >
              {showPass ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {errors.pass && (
            <div style={{ color: "#f76161", fontSize: "0.8em", marginTop: "2px" }}>
              {errors.pass}
            </div>
          )}
        </div>

        <div>
          <div style={{ position: "relative", width: "88%" }}>
            <input
              type={showPass2 ? "text" : "password"}
              className="password fondoInput bordeInput MBInput paddingInput colorInput FSInput outline my-2"
              placeholder="Repite la contraseña"
              value={pass2}
              onChange={(e) => setPass2(e.target.value)}
              style={{ paddingRight: "2.5rem", width: "88%" }}
            />
            <button
              type="button"
              onClick={() => setShowPass2(!showPass2)}
              style={{
                position: "absolute",
                right: "-1.2rem",
                top: "52%",
                transform: "translateY(-50%)",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                color: "white"
              }}
            >
              {showPass2 ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {errors.pass2 && (
            <div style={{ color: "#f76161", fontSize: "0.8em", marginTop: "2px" }}>
              {errors.pass2}
            </div>
          )}
        </div>
      </div>

      <div className="name-group C2 gp50">

        <div>
          <input style={{ width: "88%" }} className="meta fondoInput bordeInput MBInput paddingInput colorInput FSInput outline my-2" placeholder="Meta diaria de vasos" type="number" min="1" max="20" onChange={(e) => setMeta(parseInt(e.target.value))} />
          {errors.meta && <div style={{ color: "#f76161", fontSize: "0.8em" }}>{errors.meta}</div>}
        </div>

        <div>
          <div style={{ width: "88%" }} className="dropdown-btn MTPaises ZIPaises fondoInput bordeInput MBInput paddingInput colorInput FSInput outline my-2" onClick={() => setOpen(!open)} >
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
          {errors.pais && <div style={{ color: "#f76161", fontSize: "0.8em" }}>{errors.pais}</div>}
        </div>
      </div>

      <button className="registerBtn bordeBtn colorBtn paddingBtn transicionesBtn btnHover MPBtn transparente width100" onClick={registrar} disabled={loading}>{loading ? (
        <FaCircleNotch className="spin" /> // clase para animación
      ) : (
        "Registrarme"
      )}</button>
      {showPopup && (
        <div style={{ /* estilos de fondo */ }} className="fondoPopupEmail">
          <div style={{ /* estilos de caja */ }} className="EstiloPopupEmail">
            <p className="MsjpopupEmail">¡Registro exitoso! Valida tu correo electrónico antes de iniciar sesión.</p>
            <button className="BtnPopupEmail"
              onClick={async () => {
                setShowPopup(false);
                await signOut(auth); // cerrar sesión ahora sí
                setCurrentScreen("login"); // ir al login
              }}
            >
              Ok
            </button>
          </div>
        </div>
      )}

      {msg.text && <div style={{ color: msg.color }}>{msg.text}</div>}
      <p className="loginMsj colorMsj FZMsj Text-decorationMsj text-center">¿Ya tenés cuenta? <a href="login.html" className="loginA loginA pointer colorMsj ColorMsj MGTopMsj px-1 Text-decorationMsj">Login</a></p>
    </section>
  );
}
