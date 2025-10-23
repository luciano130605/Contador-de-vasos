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

  const loginEmail = async () => {
    if (!email || !password) return alert("Completá todos los campos.");
    setLoading(true)
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        alert("Tu correo no está verificado. Revisá tu bandeja y confirmá el mail antes de entrar.");
        await auth.signOut();
        return;
      }

      setMsg("Login correcto...");
    } catch (e) {
      setMsg(e.message);
    } finally {
      setLoading(false)
    }
  };

  const loginGoogle = async () => {
    setLoading(true)
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setMsg("Login correcto...");
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
          <input type="email" className="email fondoInput bordeInput MBInput paddingInput colorInput FSInput outline my-4" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />

            <input
              type={showPass ? "text" : "password"}
              className="password fondoInput bordeInput MBInput paddingInput colorInput FSInput outline my-2"
              placeholder="Contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="paddingOjo topOjoL MLOjoL transparente bordeNo outline pointer blanco absolute"
              onClick={() => setShowPass(!showPass)}
            >
              {showPass ? <FaEyeSlash /> : <FaEye />}
            </button>

            

          

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

        <button onClick={loginEmail} className="btnLogin bordeBtn colorBtn paddingBtn btnHover transicionesBtn MPBtn transparente width100">Login</button>
        <p className="colorMsj FZMsj Text-decorationMsj text-center"> ¿No tenés cuenta?
          <span className="loginA pointer colorMsj ColorMsj MGTopMsj px-1 Text-decorationMsj" onClick={() => setCurrentScreen("registro")}>
            Registrate
          </span>
        </p>


      </section>
    </div>
  );
}
