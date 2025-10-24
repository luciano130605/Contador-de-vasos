// src/Login.jsx
import { useState } from "react";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "./firebase";
import { FaGoogle, FaEye, FaEyeSlash, FaCircleNotch } from "react-icons/fa";
import "./style.css";

export default function Login({ setCurrentScreen }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [logOk, setLogOk] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });

  const loginEmail = async () => {

    let valid = true;
    const newErrors = { email: "", password: "" };

    if (!email) {
      newErrors.email = "Completá tu email";
      valid = false;
    }
    if (!password) {
      newErrors.password = "Completá tu contraseña";
      valid = false;
    }
    setErrors(newErrors);
    if (!valid) return;

    setLoading(true)
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        setErrors({ email: "Tu correo no está verificado", password: "" });
        await auth.signOut();
        return;
      }

      setMsg("Login correcto...");
    } catch (e) {
      console.log(e.code);
      switch (e.code) {
        case "auth/invalid-email":
          setErrors({ email: "Correo inválido", password: "" });
          break;
        case "auth/user-not-found":
          setErrors({ email: "El correo no existe", password: "" });
          break;
        case "auth/wrong-password":
          setErrors({ email: "", password: "Contraseña incorrecta" });
          break;
        case "auth/too-many-requests":
          setErrors({ email: "Demasiados intentos fallidos", password: "" });
          break;
        case "auth/invalid-credential":
          setErrors({ password: "Contraseña incorrecta", email: "" });
          break;
        default:
          setMsg(e.message);
      }
    }
  }

  const loginGoogle = async () => {
    setLoading(true)
    try {
      const provider = new GoogleAuthProvider();
      const id = await signInWithPopup(auth, provider);
      alert(id)
      setLogOk(true);
      alert("Login correcto...");
    } catch (e) {
      setMsg(e.message);
    } finally { setLoading(false) }
  };

  const resetPassword = async () => {
    if (!email) {
      setMsg("Poné tu email primero.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Te mandamos un correo para restablecer tu contraseña");
    } catch (e) {
      setMsg("Error: " + e.message);
    }
  };

  return (
    <div className="login-page">
      <section className="card">
        <p className="text-center FZTitle">Bienvenido</p>
        <p className="text-center fz-14 colorMsj">Ingrese a su cuenta con correo y contraseña</p>

        <div className="name-group C1">

          <div>

            <input style={{ width: "88%" }} type="email" className="email fondoInput bordeInput MBInput paddingInput colorInput FSInput outline my-4" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            {errors.email && <div style={{ color: "#f76161", fontSize: "0.8em" }}>{errors.email}</div>}
          </div>

          <div style={{ position: "relative", width: "91%" }}>
            <input
              type={showPass ? "text" : "password"}
              style={{ paddingRight: "2.5rem", width: "88%" }}
              className="password fondoInput bordeInput MBInput paddingInput colorInput FSInput outline my-2"
              placeholder="Contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="paddingOjo topOjoL transparente bordeNo outline pointer blanco absolute"
              style={{
                position: "absolute",
                right: "-0.6rem",
                top: "52%",
                transform: "translateY(-50%)",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                color: "white"
              }}
              onClick={() => setShowPass(!showPass)}
            >
              {showPass ? <FaEyeSlash /> : <FaEye />}
            </button>

            {errors.password && <div style={{ color: "#f76161", fontSize: "0.8em" }}>{errors.password}</div>}

          </div>


        </div>
        <button onClick={resetPassword} className="resetpass ColorMsj">¿Olvidaste tu contraseña?</button>

        <div className="separator pt-4">
          <span className="line"></span>
          <span className="or">O</span>
          <span className="line"></span>
        </div>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <button onClick={loginGoogle} className="fondoGoogle bordeGoogle MBGoogle paddingGoogle colorGoogle FZGoogle  "><FaGoogle /></button>
          <div>{msg}</div>
        </div>

        <button onClick={loginEmail} className="btnLogin bordeBtn colorBtn paddingBtn btnHover transicionesBtn MPBtn transparente width100" disabled={loading}>{loading ? (<FaCircleNotch className="spin" /> // clase para animación
        ) : (
          "Login"
        )}</button>
        <p className="colorMsj FZMsj Text-decorationMsj text-center"> ¿No tenés cuenta?
          <span className="loginA pointer colorMsj ColorMsj MGTopMsj px-1 Text-decorationMsj" onClick={() => setCurrentScreen("registro")}>
            Registrate
          </span>
        </p>


      </section>

      {logOk && (
        <div >
          hola
        </div>

      )}
    </div>
  );
}
