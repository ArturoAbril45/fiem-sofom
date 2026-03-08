"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle, Lock, ShieldOff } from "lucide-react";
import Loader from "./Loader";

function getPasswordStrength(pw) {
  if (!pw) return { level: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { level: 1, label: "Muy debil",   color: "#e53e3e" };
  if (score === 2) return { level: 2, label: "Debil",      color: "#dd6b20" };
  if (score === 3) return { level: 3, label: "Media",      color: "#d69e2e" };
  if (score === 4) return { level: 4, label: "Fuerte",     color: "#38a169" };
  return             { level: 5, label: "Muy fuerte", color: "#2b6cb0" };
}

const MAX_ATTEMPTS  = 3;
const BLOCK_SECONDS = 30;

export default function Login() {
  const [view,          setView]          = useState("login");
  const [showPassword,  setShowPassword]  = useState(false);
  const [isLoading,     setIsLoading]     = useState(false);
  const [recovered,     setRecovered]     = useState(false);
  const [attempts,      setAttempts]      = useState(0);
  const [blockTimer,    setBlockTimer]    = useState(0);
  const [rememberMe,    setRememberMe]    = useState(false);
  const [form,          setForm]          = useState({ usuario: "", password: "" });
  const [touched,       setTouched]       = useState({ usuario: false, password: false });
  const [recoverForm,   setRecoverForm]   = useState({ email: "", dni: "" });
  const [recoverTouched,setRecoverTouched]= useState({ email: false, dni: false });

  useEffect(() => {
    const saved = localStorage.getItem("fiem_remember");
    if (saved) { setForm(f => ({ ...f, usuario: saved })); setRememberMe(true); }
  }, []);

  useEffect(() => {
    if (blockTimer <= 0) return;
    const t = setTimeout(() => {
      setBlockTimer(b => { if (b <= 1) { setView("login"); setAttempts(0); return 0; } return b - 1; });
    }, 1000);
    return () => clearTimeout(t);
  }, [blockTimer]);

  const getLoginErrors = () => {
    const e = {};
    if (touched.usuario  && !form.usuario.trim()) e.usuario  = "Campo obligatorio";
    if (touched.password && !form.password)       e.password = "Campo obligatorio";
    return e;
  };

  const getRecoverErrors = () => {
    const e = {};
    if (recoverTouched.email) {
      if (!recoverForm.email.trim())                     e.email = "Campo obligatorio";
      else if (!/\S+@\S+\.\S+/.test(recoverForm.email)) e.email = "Correo no valido";
    }
    if (recoverTouched.dni && !recoverForm.dni.trim()) e.dni = "Campo obligatorio";
    return e;
  };

  const loginErrors   = getLoginErrors();
  const recoverErrors = getRecoverErrors();
  const pwStrength    = getPasswordStrength(form.password);
  const remaining     = MAX_ATTEMPTS - attempts;

  const handleLogin = async (ev) => {
    ev.preventDefault();
    setTouched({ usuario: true, password: true });
    if (!form.usuario.trim() || !form.password) return;
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1600));
    setIsLoading(false);
    const success = form.usuario === "admin" && form.password === "Admin1234!";
    if (!success) {
      const n = attempts + 1;
      setAttempts(n);
      if (n >= MAX_ATTEMPTS) { setView("blocked"); setBlockTimer(BLOCK_SECONDS); }
      return;
    }
    if (rememberMe) localStorage.setItem("fiem_remember", form.usuario);
    else            localStorage.removeItem("fiem_remember");
    setView("loading");
  };

  const handleRecover = async (ev) => {
    ev.preventDefault();
    setRecoverTouched({ email: true, dni: true });
    if (!recoverForm.email.trim() || !/\S+@\S+\.\S+/.test(recoverForm.email) || !recoverForm.dni.trim()) return;
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1600));
    setIsLoading(false);
    setRecovered(true);
  };

  const goBack = () => {
    setView("login"); setRecovered(false);
    setRecoverForm({ email: "", dni: "" });
    setRecoverTouched({ email: false, dni: false });
  };

  if (view === "loading") return <Loader />;

  return (
    <div className="root">
      <div className="bg">
        <div className="ring ring-a" />
        <div className="ring ring-b" />
        <div className="ring ring-c" />
        <div className="glow" />
      </div>

      <div className="stage">
        <header className="top-bar">
          <div className="wordmark">
            <span className="wm-b">FIEM</span><span className="wm-w"> SOFOM</span>
          </div>
        </header>

        <div className="card">
          {/* LOGIN */}
          {view === "login" && (
            <div className="pane">
              <p className="eyebrow">Bienvenido de nuevo</p>
              <h1 className="heading">Accede a<br />tu cuenta</h1>

              {attempts > 0 && attempts < MAX_ATTEMPTS && (
                <div className="alert-warn">
                  <ShieldOff size={14} />
                  <span>Credenciales incorrectas. Te quedan <strong>{remaining}</strong> intento{remaining !== 1 ? "s" : ""}.</span>
                </div>
              )}

              <form onSubmit={handleLogin} noValidate className="form">
                <div className="field">
                  <label htmlFor="usuario">Usuario o cedula</label>
                  <input
                    id="usuario" type="text" placeholder="Ingresa tu usuario"
                    value={form.usuario}
                    onChange={e => { setForm({ ...form, usuario: e.target.value }); setTouched(t => ({ ...t, usuario: true })); }}
                    onBlur={() => setTouched(t => ({ ...t, usuario: true }))}
                    className={loginErrors.usuario ? "inp err-inp" : form.usuario && !loginErrors.usuario ? "inp ok-inp" : "inp"}
                    autoComplete="username"
                  />
                  {loginErrors.usuario && <span className="err-msg">{loginErrors.usuario}</span>}
                </div>

                <div className="field">
                  <label htmlFor="password">Contrasena</label>
                  <div className={loginErrors.password ? "pw-box err-inp" : form.password && !loginErrors.password ? "pw-box ok-inp" : "pw-box"}>
                    <input
                      id="password" type={showPassword ? "text" : "password"} placeholder="••••••••"
                      value={form.password}
                      onChange={e => { setForm({ ...form, password: e.target.value }); setTouched(t => ({ ...t, password: true })); }}
                      onBlur={() => setTouched(t => ({ ...t, password: true }))}
                      className="pw-inp" autoComplete="current-password"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="eye-btn">
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {loginErrors.password && <span className="err-msg">{loginErrors.password}</span>}
                  {form.password && (
                    <div className="strength-wrap">
                      <div className="strength-bars">
                        {[1,2,3,4,5].map(i => (
                          <div key={i} className="strength-bar" style={{ background: i <= pwStrength.level ? pwStrength.color : "#e2e8f0" }} />
                        ))}
                      </div>
                      <span className="strength-label" style={{ color: pwStrength.color }}>{pwStrength.label}</span>
                    </div>
                  )}
                </div>

                <label className="remember">
                  <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="remember-chk" />
                  <span>Recordar mi usuario</span>
                </label>

                <button type="submit" className="cta" disabled={isLoading}>
                  {isLoading ? <span className="spin" /> : <><span>Ingresar</span><ArrowRight size={16} /></>}
                </button>
              </form>

              <div className="aux-links">
                <button className="txt-link" onClick={() => setView("recover")}>Olvide mi contrasena</button>
                <span className="pipe" />
                <a href="#" className="txt-link">Contactar soporte</a>
              </div>
            </div>
          )}

          {/* BLOQUEADO */}
          {view === "blocked" && (
            <div className="pane confirm-pane">
              <ShieldOff size={44} strokeWidth={1.5} className="block-ico" />
              <h2 className="heading" style={{ fontSize: "22px" }}>Acceso bloqueado</h2>
              <p className="body-txt">Superaste el numero de intentos. Podras intentarlo de nuevo en:</p>
              <div className="timer-box">
                <span className="timer-num">{blockTimer}</span>
                <span className="timer-unit">segundos</span>
              </div>
              <div className="aux-links" style={{ marginTop: "20px" }}>
                <a href="#" className="txt-link">Contactar soporte</a>
              </div>
            </div>
          )}

          {/* RECUPERAR */}
          {view === "recover" && !recovered && (
            <div className="pane">
              <button className="back" onClick={goBack}><ArrowLeft size={14} /> Volver</button>
              <p className="eyebrow">Recuperacion de acceso</p>
              <h1 className="heading">Restablecer<br />contrasena</h1>
              <p className="body-txt">Verificaremos tu identidad con tu correo y cedula registrados.</p>
              <form onSubmit={handleRecover} noValidate className="form">
                <div className="field">
                  <label htmlFor="email">Correo electronico</label>
                  <input
                    id="email" type="email" placeholder="correo@ejemplo.com"
                    value={recoverForm.email}
                    onChange={e => { setRecoverForm({ ...recoverForm, email: e.target.value }); setRecoverTouched(t => ({ ...t, email: true })); }}
                    onBlur={() => setRecoverTouched(t => ({ ...t, email: true }))}
                    className={recoverErrors.email ? "inp err-inp" : recoverForm.email && !recoverErrors.email ? "inp ok-inp" : "inp"}
                    autoComplete="email"
                  />
                  {recoverErrors.email && <span className="err-msg">{recoverErrors.email}</span>}
                </div>
                <div className="field">
                  <label htmlFor="dni">Numero de cedula</label>
                  <input
                    id="dni" type="text" placeholder="0912345678"
                    value={recoverForm.dni}
                    onChange={e => { setRecoverForm({ ...recoverForm, dni: e.target.value }); setRecoverTouched(t => ({ ...t, dni: true })); }}
                    onBlur={() => setRecoverTouched(t => ({ ...t, dni: true }))}
                    className={recoverErrors.dni ? "inp err-inp" : recoverForm.dni && !recoverErrors.dni ? "inp ok-inp" : "inp"}
                    autoComplete="off"
                  />
                  {recoverErrors.dni && <span className="err-msg">{recoverErrors.dni}</span>}
                </div>
                <button type="submit" className="cta" disabled={isLoading}>
                  {isLoading ? <span className="spin" /> : <><span>Enviar instrucciones</span><ArrowRight size={16} /></>}
                </button>
              </form>
              <div className="aux-links">
                <a href="#" className="txt-link">Contactar soporte</a>
              </div>
            </div>
          )}

          {/* CONFIRMACION */}
          {view === "recover" && recovered && (
            <div className="pane confirm-pane">
              <CheckCircle size={44} strokeWidth={1.5} className="check-ico" />
              <h2 className="heading" style={{ fontSize: "22px" }}>Solicitud enviada</h2>
              <p className="body-txt">Si los datos coinciden recibiras un correo con las instrucciones.</p>
              <button className="cta" onClick={goBack}><span>Volver al inicio</span><ArrowRight size={16} /></button>
            </div>
          )}
        </div>

        <footer className="foot">
          <div className="foot-left"><Lock size={11} /><span>Sesion segura · Cifrado SSL 256 bits</span></div>
          <div className="foot-right">
            <a href="#">Privacidad</a><span className="pipe" />
            <a href="#">Terminos</a><span className="pipe" />
            <span>FIEM S.A. de C.V. SOFOM E.N.R. &copy; {new Date().getFullYear()}</span>
          </div>
        </footer>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        .root{min-height:100vh;display:flex;align-items:stretch;font-family:'DM Sans',system-ui,sans-serif;position:relative;overflow:hidden;}
        .bg{position:fixed;inset:0;background:#1a3a7a;z-index:0;}
        .ring{position:absolute;border-radius:50%;border:1.5px solid rgba(255,255,255,0.18);}
        .ring-a{width:600px;height:600px;top:-200px;right:-200px;}
        .ring-b{width:420px;height:420px;bottom:-140px;left:-140px;}
        .ring-c{width:240px;height:240px;bottom:80px;right:120px;border-color:rgba(255,255,255,0.10);}
        .glow{position:absolute;width:500px;height:500px;top:-100px;right:-100px;background:radial-gradient(circle,rgba(21,101,192,0.3) 0%,transparent 70%);border-radius:50%;}
        .stage{position:relative;z-index:1;width:100%;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 16px;}
        .top-bar{position:fixed;top:0;left:0;right:0;padding:20px 40px;display:flex;align-items:center;z-index:10;}
        .wordmark{font-family:'DM Serif Display',serif;font-size:22px;letter-spacing:-0.3px;}
        .wm-b{color:#fff;}.wm-w{color:rgba(255,255,255,0.45);}
        .card{width:100%;max-width:440px;background:rgba(255,255,255,0.97);border-radius:24px;box-shadow:0 24px 64px rgba(0,0,0,0.35);overflow:hidden;animation:rise 0.5s cubic-bezier(0.22,1,0.36,1) both;}
        @keyframes rise{from{opacity:0;transform:translateY(24px) scale(0.98);}to{opacity:1;transform:translateY(0) scale(1);}}
        .pane{padding:44px 40px 36px;}
        .eyebrow{font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#1565c0;margin-bottom:10px;}
        .heading{font-family:'DM Serif Display',serif;font-size:32px;line-height:1.15;color:#0d1f5c;letter-spacing:-0.5px;margin-bottom:28px;}
        .body-txt{font-size:14px;color:#5a6a78;line-height:1.65;margin-bottom:28px;margin-top:-12px;}
        .alert-warn{display:flex;align-items:center;gap:8px;background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:10px 14px;font-size:13px;color:#9a3412;margin-bottom:20px;}
        .alert-warn strong{font-weight:700;}
        .form{display:flex;flex-direction:column;gap:18px;}
        .field{display:flex;flex-direction:column;gap:7px;}
        .field label{font-size:12px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;color:#3a4a57;}
        .inp{border:1.5px solid #dde3ea;border-radius:10px;padding:13px 16px;font-size:15px;font-family:inherit;color:#0d1f5c;background:#f8fafc;outline:none;width:100%;transition:border-color .18s,box-shadow .18s,background .18s;}
        .inp::placeholder{color:#b0bec8;}
        .inp:focus{border-color:#1565c0;box-shadow:0 0 0 3px rgba(21,101,192,0.1);background:#fff;}
        .inp.err-inp{border-color:#e53e3e;}.inp.ok-inp{border-color:#38a169;}
        .pw-box{display:flex;align-items:center;border:1.5px solid #dde3ea;border-radius:10px;background:#f8fafc;transition:border-color .18s,box-shadow .18s,background .18s;}
        .pw-box:focus-within{border-color:#1565c0;box-shadow:0 0 0 3px rgba(21,101,192,0.1);background:#fff;}
        .pw-box.err-inp{border-color:#e53e3e;}.pw-box.ok-inp{border-color:#38a169;}
        .pw-inp{flex:1;border:none;background:transparent;padding:13px 16px;font-size:15px;font-family:inherit;color:#0d1f5c;outline:none;}
        .pw-inp::placeholder{color:#b0bec8;}
        .eye-btn{background:none;border:none;cursor:pointer;color:#94a3b0;padding:0 16px;display:flex;align-items:center;transition:color .15s;flex-shrink:0;}
        .eye-btn:hover{color:#1565c0;}
        .err-msg{font-size:12px;color:#e53e3e;}
        .strength-wrap{display:flex;align-items:center;gap:10px;margin-top:6px;}
        .strength-bars{display:flex;gap:4px;flex:1;}
        .strength-bar{height:4px;flex:1;border-radius:2px;transition:background .3s;}
        .strength-label{font-size:11px;font-weight:600;white-space:nowrap;}
        .remember{display:flex;align-items:center;gap:9px;font-size:13px;color:#4a5568;cursor:pointer;user-select:none;margin-top:-4px;}
        .remember-chk{width:16px;height:16px;accent-color:#1565c0;cursor:pointer;flex-shrink:0;}
        .cta{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;background:#0d1f5c;color:#fff;border:none;border-radius:10px;padding:14px 20px;font-size:15px;font-weight:600;font-family:inherit;cursor:pointer;margin-top:4px;transition:background .18s,transform .12s;}
        .cta:hover:not(:disabled){background:#0a1a4e;transform:translateY(-1px);}
        .cta:disabled{opacity:0.55;cursor:not-allowed;}
        .spin{width:18px;height:18px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:sp .7s linear infinite;}
        @keyframes sp{to{transform:rotate(360deg);}}
        .block-ico{color:#e53e3e;margin-bottom:20px;}
        .timer-box{display:flex;flex-direction:column;align-items:center;background:#fff5f5;border:1px solid #fed7d7;border-radius:14px;padding:18px 32px;margin:8px auto 0;}
        .timer-num{font-family:'DM Serif Display',serif;font-size:48px;color:#e53e3e;line-height:1;}
        .timer-unit{font-size:13px;color:#9b2c2c;margin-top:4px;}
        .confirm-pane{text-align:center;display:flex;flex-direction:column;align-items:center;padding:44px 40px 36px;}
        .check-ico{color:#1565c0;margin-bottom:20px;}
        .block-ico{color:#e53e3e;margin-bottom:20px;}
        .aux-links{display:flex;align-items:center;justify-content:center;gap:10px;margin-top:20px;font-size:13px;}
        .txt-link{background:none;border:none;padding:0;font-family:inherit;font-size:13px;color:#1565c0;cursor:pointer;text-decoration:none;}
        .txt-link:hover{text-decoration:underline;}
        .pipe{width:1px;height:12px;background:#d0d7de;display:inline-block;}
        .back{background:none;border:none;font-family:inherit;font-size:13px;font-weight:600;color:#1565c0;cursor:pointer;padding:0;margin-bottom:20px;display:inline-flex;align-items:center;gap:5px;}
        .back:hover{text-decoration:underline;}
        .foot{position:fixed;bottom:0;left:0;right:0;padding:14px 40px;display:flex;align-items:center;justify-content:space-between;font-size:11px;color:rgba(255,255,255,0.3);border-top:1px solid rgba(255,255,255,0.05);backdrop-filter:blur(8px);background:rgba(13,31,92,0.5);}
        .foot-left{display:flex;align-items:center;gap:6px;}
        .foot-right{display:flex;align-items:center;gap:8px;}
        .foot a{color:rgba(255,255,255,0.35);text-decoration:none;}
        .foot a:hover{color:rgba(255,255,255,0.65);}
        .foot .pipe{width:1px;height:10px;background:rgba(255,255,255,0.12);display:inline-block;}
        @media(max-width:480px){.pane{padding:36px 28px 28px;}.heading{font-size:26px;}.foot-right{display:none;}.top-bar{padding:18px 24px;}}
      `}</style>
    </div>
  );
}