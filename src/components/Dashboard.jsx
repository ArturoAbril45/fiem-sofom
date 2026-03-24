"use client";

import { useState, useEffect, useRef } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || 'https://fiem-backend-production.up.railway.app';
import { useRouter } from "next/navigation";
import {
  Home, FileText, Users, CreditCard, PiggyBank,
  UserCog, Map, Building2, BarChart2, Phone,
  Calendar, BookOpen, Settings, LogOut,
  ChevronRight, Bell, Search,
  User, Mail, Phone as PhoneIcon, Calendar as CalIcon,
  X, Check, Pencil, Menu, Shield
} from "lucide-react";
import Inicio                    from "./Inicio";
import ResumenDia                from "./ResumenDia";
import AltaCliente               from "./AltaCliente";
import ConsultarCliente          from "./ConsultarCliente";
import ListaNegra                from "./ListaNegra";
import NuevaSolicitud            from "./NuevaSolicitud";
import ConsultarSolicitud        from "./ConsultarSolicitud";
import AperturarCredito          from "./AperturarCredito";
import ConsultarCredito          from "./ConsultarCredito";
import AbonarCredito             from "./AbonarCredito";
import MovimientosAbonos         from "./MovimientosAbonos";
import ReporteCarteraClientes    from "./ReporteCarteraClientes";
import ReporteCarteraCreditos    from "./ReporteCarteraCreditos";
import ReporteValorCartera       from "./ReporteValorCartera";
import ReporteSeguroCredito      from "./ReporteSeguroCredito";
import ReporteComisionApertura   from "./ReporteComisionApertura";
import ReportePromesas           from "./ReportePromesas";
import ReporteAbonosVencidos     from "./ReporteAbonosVencidos";
import ReporteCobrosCredito      from "./ReporteCobrosCredito";
import ReporteDesglose           from "./ReporteDesglose";
import ReporteCobranzaDia        from "./ReporteCobranzaDia";
import ReporteMovimientosAhorro  from "./ReporteMovimientosAhorro";
import ConfigSucursal            from "./ConfigSucursal";
import ConfigProductosCredito    from "./ConfigProductosCredito";
import ConfigProductosAhorro     from "./ConfigProductosAhorro";
import ConfigCredito             from "./ConfigCredito";
import ConfigBiblioteca          from "./ConfigBiblioteca";
import ContabilidadIngresos      from "./ContabilidadIngresos";
import ContabilidadCaja          from "./ContabilidadCaja";
import ContabilidadBalance       from "./ContabilidadBalance";
import Agenda                    from "./Agenda";
import NuevaGestion              from "./NuevaGestion";
import SeguimientoGestion        from "./SeguimientoGestion";
import AltaEmpleado              from "./AltaEmpleado";
import ConsultarEmpleado         from "./ConsultarEmpleado";
import AsignacionRutas           from "./AsignacionRutas";
import GerenciasRutas            from "./GerenciasRutas";
import AsignacionGerencias       from "./AsignacionGerencias";
import GerenciasConsulta         from "./GerenciasConsulta";
import AperturarAhorro           from "./AperturarAhorro";
import ConsultaAhorro            from "./ConsultaAhorro";
import ConsultaMovimientosAhorro from "./ConsultaMovimientosAhorro";
import DepositarAhorro           from "./DepositarAhorro";
import RetirarAhorro             from "./RetirarAhorro";

const NAV = [
  { icon: Home,       label: "Inicio",                        sub: [] },
  { icon: FileText,   label: "Resumen del dia",               sub: [] },
  { icon: Users,      label: "Administracion de clientes",    sub: ["Alta de clientes", "Consultar cliente", "Lista negra"] },
  { icon: CreditCard, label: "Administracion de creditos",    sub: ["Nueva solicitud", "Consultar solicitud", "Aperturar credito", "Consultar credito", "Abonar credito", "Movimientos abonos de credito"] },
  { icon: PiggyBank,  label: "Administracion de ahorro",      sub: ["Aperturar cuenta", "Consulta cuenta ahorro", "Consulta movimientos", "Depositar", "Retirar"] },
  { icon: UserCog,    label: "Administracion de empleados",   sub: ["Alta empleado", "Consultar empleado"] },
  { icon: Map,        label: "Administracion de rutas",       sub: ["Asignacion de ruta a ejecutivo", "Agregar o consultar rutas"] },
  { icon: Building2,  label: "Administracion de Gerencias",   sub: ["Asignacion de Gerencia a Gerente", "Agregar o consultar Gerencias"] },
  { icon: BarChart2,  label: "Reportes",                      sub: ["Cartera de clientes", "Cartera de creditos", "Valor de cartera", "Seguro de credito", "Comision de apertura", "Promesas de pago", "Abonos vencidos", "Cobros de credito", "Desglose de credito", "Cobranza del dia", "Movimientos de ahorro"] },
  { icon: Phone,      label: "Gestion de cobranza",           sub: ["Nueva Gestion", "Seguimiento de Gestion"] },
  { icon: Calendar,   label: "Agenda",                        sub: [] },
  { icon: BookOpen,   label: "Contabilidad",                  sub: ["Ingresos y gastos", "Caja por ejecutivo", "Balance"] },
  { icon: Settings,   label: "Configuracion",                 sub: ["Configuracion de sucursal", "Productos de credito", "Productos de ahorro", "Parametros de credito", "Biblioteca de documentos"] },
];

const SEPS = new Set([1, 4, 9, 10]);

export default function Dashboard() {
  const [activeNav,     setActiveNav]     = useState(0);
  const [openMenus,     setOpenMenus]     = useState({});
  const [activeSub,     setActiveSub]     = useState(null);
  const [showDropdown,  setShowDropdown]  = useState(false);
  const [showModal,     setShowModal]     = useState(false);
  const [saved,         setSaved]         = useState(false);
  const [loggingOut,    setLoggingOut]    = useState(false);
  const [collapsed,     setCollapsed]     = useState(false);
  const [showBell,      setShowBell]      = useState(false);
  const [bellExpanded,  setBellExpanded]  = useState(false);
  const [flyout,        setFlyout]        = useState(null); // { index, y }
  const flyoutTimer = useRef(null);
  const [notifs,        setNotifs]        = useState([]);

  const [profile,    setProfile]    = useState({ nombre: "Administrador", correo: "admin@fiem.com.mx", celular: "", nacimiento: "" });
  const [form,       setForm]       = useState({ ...profile, passwordActual: "", password: "", password2: "" });
  const [profileErr, setProfileErr] = useState("");
  const [showPw,     setShowPw]     = useState(false);

  const router = useRouter();
  const USUARIO = 'admin';

  // Cargar perfil del backend
  useEffect(() => {
    fetch(`${API}/api/usuarios/${USUARIO}`)
      .then(r => r.json())
      .then(data => { if (data.nombre) { setProfile(data); setForm(f => ({ ...f, ...data, passwordActual: '', password: '', password2: '' })); } })
      .catch(() => {});
  }, []);

  // Cargar notificaciones del backend
  useEffect(() => {
    fetch(`${API}/api/notificaciones/${USUARIO}`)
      .then(r => r.json())
      .then(data => setNotifs(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // Registrar notificación de inicio de sesión al montar
  useEffect(() => {
    const key = 'fiem_login_notif_done';
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    fetch(`${API}/api/notificaciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuario: USUARIO,
        tipo: 'login',
        titulo: 'Inicio de sesión',
        mensaje: `Acceso registrado el ${new Date().toLocaleDateString('es-MX', { day:'2-digit', month:'long', year:'numeric' })} a las ${new Date().toLocaleTimeString('es-MX', { hour:'2-digit', minute:'2-digit' })}`,
      }),
    })
      .then(r => r.json())
      .then(nueva => setNotifs(prev => [nueva, ...prev]))
      .catch(() => {});
  }, []);

  const marcarLeidas = () => {
    fetch(`${API}/api/notificaciones/leer-todas/${USUARIO}`, { method: 'PUT' }).catch(() => {});
    setNotifs(prev => prev.map(n => ({ ...n, leida: true })));
  };

  const eliminarNotif = (id) => {
    fetch(`${API}/api/notificaciones/${id}`, { method: 'DELETE' }).catch(() => {});
    setNotifs(prev => prev.filter(n => n._id !== id));
  };

  const noLeidas = notifs.filter(n => !n.leida).length;

  const openModal   = () => { setForm({ ...profile, passwordActual: '', password: '', password2: '' }); setProfileErr(''); setShowDropdown(false); setShowModal(true); setSaved(false); };
  const saveProfile = async () => {
    if (form.password && form.password !== form.password2) { setProfileErr('Las contraseñas no coinciden'); return; }
    if (form.password && !form.passwordActual) { setProfileErr('Ingresa tu contraseña actual'); return; }
    setProfileErr('');
    try {
      const body = { nombre: form.nombre, correo: form.correo, celular: form.celular, nacimiento: form.nacimiento };
      if (form.password) { body.password = form.password; body.passwordActual = form.passwordActual; }
      const res  = await fetch(`${API}/api/usuarios/${USUARIO}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setProfileErr(data.error || 'Error al guardar'); return; }
      setProfile(data);
      setSaved(true);
      setTimeout(() => { setShowModal(false); setSaved(false); }, 1200);
    } catch { setProfileErr('Error de conexión'); }
  };
  const handleLogout = () => { setShowDropdown(false); setLoggingOut(true); sessionStorage.removeItem('fiem_login_notif_done'); setTimeout(() => router.push("/login"), 3000); };
  const toggle       = (i) => setOpenMenus(p => ({ ...p, [i]: !p[i] }));
  const handleNav    = (i) => { if (NAV[i].sub.length > 0) toggle(i); else { setActiveNav(i); setActiveSub(null); } };
  const handleSub    = (i, s) => { setActiveNav(i); setActiveSub(s); };
  const navTo        = (s) => { const idx = NAV.findIndex(n => n.sub.includes(s)); if (idx >= 0) { setActiveNav(idx); setActiveSub(s); } };

  const renderContent = () => {
    const s = activeSub || NAV[activeNav].label;
    if (s === "Inicio")                        return <Inicio onNavigate={navTo} />;
    if (s === "Resumen del dia")               return <ResumenDia onNavigate={navTo} />;
    if (s === "Alta de clientes")              return <AltaCliente />;
    if (s === "Consultar cliente")             return <ConsultarCliente />;
    if (s === "Lista negra")                   return <ListaNegra />;
    if (s === "Nueva solicitud")               return <NuevaSolicitud />;
    if (s === "Consultar solicitud")           return <ConsultarSolicitud />;
    if (s === "Aperturar credito")             return <AperturarCredito />;
    if (s === "Consultar credito")             return <ConsultarCredito />;
    if (s === "Abonar credito")                return <AbonarCredito />;
    if (s === "Movimientos abonos de credito") return <MovimientosAbonos />;
    if (s === "Aperturar cuenta")              return <AperturarAhorro />;
    if (s === "Consulta cuenta ahorro")        return <ConsultaAhorro />;
    if (s === "Consulta movimientos")          return <ConsultaMovimientosAhorro />;
    if (s === "Depositar")                     return <DepositarAhorro />;
    if (s === "Retirar")                       return <RetirarAhorro />;
    if (s === "Alta empleado")                 return <AltaEmpleado />;
    if (s === "Consultar empleado")            return <ConsultarEmpleado />;
    if (s === "Asignacion de ruta a ejecutivo") return <AsignacionRutas />;
    if (s === "Agregar o consultar rutas")      return <GerenciasRutas />;
    if (s === "Asignacion de Gerencia a Gerente")  return <AsignacionGerencias />;
    if (s === "Agregar o consultar Gerencias")     return <GerenciasConsulta />;
    if (s === "Nueva Gestion")                 return <NuevaGestion />;
    if (s === "Seguimiento de Gestion")        return <SeguimientoGestion />;
    if (s === "Agenda")                        return <Agenda />;
    if (s === "Ingresos y gastos")             return <ContabilidadIngresos />;
    if (s === "Caja por ejecutivo")            return <ContabilidadCaja />;
    if (s === "Balance")                       return <ContabilidadBalance />;
    if (s === "Configuracion de sucursal")     return <ConfigSucursal />;
    if (s === "Productos de credito")          return <ConfigProductosCredito />;
    if (s === "Productos de ahorro")           return <ConfigProductosAhorro />;
    if (s === "Parametros de credito")         return <ConfigCredito />;
    if (s === "Biblioteca de documentos")      return <ConfigBiblioteca />;
    if (s === "Cartera de clientes")           return <ReporteCarteraClientes />;
    if (s === "Cartera de creditos")           return <ReporteCarteraCreditos />;
    if (s === "Valor de cartera")              return <ReporteValorCartera />;
    if (s === "Seguro de credito")             return <ReporteSeguroCredito />;
    if (s === "Comision de apertura")          return <ReporteComisionApertura />;
    if (s === "Promesas de pago")              return <ReportePromesas />;
    if (s === "Abonos vencidos")               return <ReporteAbonosVencidos />;
    if (s === "Cobros de credito")             return <ReporteCobrosCredito />;
    if (s === "Desglose de credito")           return <ReporteDesglose />;
    if (s === "Cobranza del dia")              return <ReporteCobranzaDia />;
    if (s === "Movimientos de ahorro")         return <ReporteMovimientosAhorro />;
    return (
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"320px", background:"#fff", borderRadius:"20px", border:"1px solid #dceaf8", boxShadow:"0 2px 20px rgba(14,80,160,0.06)" }}>
        <div style={{ width:"64px", height:"64px", background:"#f0f6ff", borderRadius:"16px", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"20px" }}>
          {(() => { const Icon = NAV[activeNav].icon; return <Icon size={28} color="#90b4e0" />; })()}
        </div>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"20px", fontWeight:"600", color:"#0a2d5e", marginBottom:"8px" }}>{s}</div>
        <div style={{ fontSize:"13px", color:"#90aac8" }}>Modulo disponible proximamente</div>
      </div>
    );
  };

  const pageTitle = activeSub || NAV[activeNav].label;

  return (
    <>
      {/* ── LOGOUT SCREEN ── */}
      {loggingOut && (
        <div style={{ position:"fixed", inset:0, zIndex:9999, background:"#f0f6ff", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"28px" }}>
          <div style={{ display:"flex", gap:"6px" }}>
            {["F","I","E","M"].map((l,i) => (
              <span key={i} style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"52px", fontWeight:"700", color:"#0e50a0", display:"inline-block", animation:"lbounce 1.4s ease-in-out infinite", animationDelay:`${i*0.22}s` }}>{l}</span>
            ))}
          </div>
          <div style={{ fontSize:"11px", color:"#90aac8", letterSpacing:"0.18em", textTransform:"uppercase" }}>Cerrando sesion</div>
          <div style={{ display:"flex", gap:"6px" }}>
            {[0,1,2].map(i => <div key={i} style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#90b4e0", animation:"ldot 1.2s ease-in-out infinite", animationDelay:`${i*0.18}s` }} />)}
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'DM Sans',sans-serif;background:#f4f8fd;}
        @keyframes lbounce{0%,100%{transform:translateY(0);opacity:.2}45%{transform:translateY(-16px);opacity:1}}
        @keyframes ldot{0%,100%{opacity:.25;transform:scale(.8)}50%{opacity:1;transform:scale(1.2)}}
        @keyframes ddIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}

        /* ── ROOT ── */
        .fiem-root{display:flex;min-height:100vh;}

        /* ── SIDEBAR ── */
        .fiem-sb{
          position:fixed;top:0;left:0;bottom:0;z-index:60;
          width:260px;
          background:#fff;
          border-right:1px solid #dceaf8;
          box-shadow:4px 0 24px rgba(14,80,160,0.06);
          display:flex;flex-direction:column;
          transition:width .28s cubic-bezier(.4,0,.2,1);
          overflow:hidden;
        }
        .fiem-sb.collapsed{ width:68px; }

        /* brand */
        .sb-brand{
          height:72px;
          border-bottom:1px solid #dceaf8;
          display:flex;align-items:center;
          padding:0 16px;
          gap:0;
          flex-shrink:0;
          overflow:hidden;
        }
        .sb-wordmark{
          font-family:'Cormorant Garamond',serif;
          font-size:22px;font-weight:700;
          color:#0a2d5e;letter-spacing:.04em;
          white-space:nowrap;
          overflow:hidden;
          max-width:160px;
          transition:max-width .28s cubic-bezier(.4,0,.2,1), opacity .2s;
          opacity:1;
        }
        .fiem-sb.collapsed .sb-wordmark{max-width:0;opacity:0;}
        .sb-sub-text{
          font-size:10px;color:#90aac8;
          text-transform:uppercase;letter-spacing:.09em;
          white-space:nowrap;overflow:hidden;
          max-width:160px;
          transition:max-width .28s cubic-bezier(.4,0,.2,1), opacity .2s;
          opacity:1;
          display:block;margin-top:2px;
        }
        .fiem-sb.collapsed .sb-sub-text{max-width:0;opacity:0;}
        .sb-brand-texts{flex:1;overflow:hidden;}
        .sb-toggle{
          width:32px;height:32px;flex-shrink:0;
          border:none;background:#f0f6ff;border-radius:9px;
          cursor:pointer;display:flex;align-items:center;justify-content:center;
          color:#0e50a0;transition:background .15s;
          margin-left:8px;
        }
        .sb-toggle:hover{background:#dceaf8;}
        .fiem-sb.collapsed .sb-toggle{margin-left:0;}
        .fiem-sb.collapsed .sb-brand{justify-content:center;padding:0;}
        .fiem-sb.collapsed .sb-brand-texts{flex:0;width:0;overflow:hidden;}

        /* nav */
        .sb-nav{flex:1;padding:10px 8px;overflow-y:auto;overflow-x:hidden;}
        .fiem-sb.collapsed .sb-nav{display:flex;flex-direction:column;justify-content:center;}
        .sb-nav::-webkit-scrollbar{width:3px;}
        .sb-nav::-webkit-scrollbar-thumb{background:#dceaf8;border-radius:2px;}

        .nav-group-label{
          font-size:9.5px;font-weight:700;color:#90aac8;
          text-transform:uppercase;letter-spacing:.1em;
          padding:4px 10px;margin:12px 0 4px;
          white-space:nowrap;overflow:hidden;
          transition:opacity .2s, max-height .2s;
          max-height:30px;opacity:1;
        }
        .fiem-sb.collapsed .nav-group-label{opacity:0;max-height:0;margin:0;padding:0;}

        .ni{
          width:100%;border:none;cursor:pointer;
          border-radius:10px;background:transparent;
          display:flex;align-items:center;
          gap:10px;padding:9px 10px;
          font-family:'DM Sans',sans-serif;font-size:13px;
          color:#4a6a94;text-align:left;
          transition:background .15s,color .15s;
          margin-bottom:2px;
        }
        .fiem-sb.collapsed .sb-nav{padding:10px 0;}
        .fiem-sb.collapsed .ni{justify-content:center;padding:9px 0;width:48px;margin:1px 10px;gap:0;}
        .ni:hover{background:#e8f2fc;color:#0e50a0;}
        .ni.is-open{background:#e8f2fc;color:#0e50a0;}
        .ni.is-active{background:#0e50a0;color:#fff;box-shadow:0 4px 14px rgba(14,80,160,0.28);}
        .ni-icon{flex-shrink:0;display:flex;align-items:center;justify-content:center;width:18px;}
        .ni-lbl{
          flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:500;
          transition:opacity .2s, max-width .28s;
          max-width:180px;opacity:1;
        }
        .fiem-sb.collapsed .ni-lbl{max-width:0;opacity:0;}
        .ni-arr{transition:transform .22s,opacity .2s;flex-shrink:0;opacity:1;}
        .ni-arr.open{transform:rotate(90deg);}
        .fiem-sb.collapsed .ni-arr{opacity:0;width:0;overflow:hidden;}

        /* submenu */
        .sub-wrap{overflow:hidden;max-height:0;transition:max-height .28s ease;padding-left:38px;}
        .sub-wrap.open{max-height:800px;}
        .fiem-sb.collapsed .sub-wrap{display:none;}
        .sub-btn{
          display:block;width:100%;border:none;cursor:pointer;background:transparent;
          text-align:left;font-family:'DM Sans',sans-serif;font-size:12px;
          color:#90aac8;padding:7px 10px 7px 14px;
          border-left:2px solid #dceaf8;
          border-radius:0 8px 8px 0;margin-bottom:1px;
          white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
          transition:all .13s;
        }
        .sub-btn:hover{color:#0e50a0;background:#e8f2fc;border-left-color:#3b82f6;}
        .sub-btn.active{color:#0e50a0;font-weight:600;border-left-color:#0e50a0;background:#e8f2fc;}

        .sb-sep{height:1px;background:#dceaf8;margin:6px 10px;}

        /* user row */
        .sb-user{
          flex-shrink:0;
          padding:12px 14px;
          border-top:1px solid #dceaf8;
          background:#f4f8fd;
          display:flex;align-items:center;gap:0;
          overflow:hidden;
        }
        .fiem-sb.collapsed .sb-user{justify-content:center;padding:12px 0;}
        .u-av{
          width:36px;height:36px;flex-shrink:0;
          background:#0e50a0;border-radius:10px;
          color:#fff;font-size:14px;font-weight:700;
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 2px 8px rgba(14,80,160,0.22);
        }
        .u-info{
          overflow:hidden;
          transition:opacity .2s, max-width .28s;
          max-width:160px;opacity:1;white-space:nowrap;
        }
        .fiem-sb.collapsed .u-info{max-width:0;opacity:0;}
        .u-nm{font-size:13px;font-weight:600;color:#0a2d5e;overflow:hidden;text-overflow:ellipsis;}
        .u-rl{font-size:10px;color:#90aac8;margin-top:1px;}

        /* ── BODY ── */
        .fiem-body{
          flex:1;
          margin-left:260px;
          display:flex;flex-direction:column;min-height:100vh;
          transition:margin-left .28s cubic-bezier(.4,0,.2,1);
        }
        .fiem-body.collapsed{margin-left:68px;}

        /* topbar */
        .topbar{
          position:sticky;top:0;z-index:40;
          background:rgba(244,248,253,0.94);
          backdrop-filter:blur(16px);
          border-bottom:1px solid #dceaf8;
          padding:0 32px;height:68px;
          display:flex;align-items:center;justify-content:space-between;gap:16px;
        }
        .tb-left{display:flex;align-items:center;gap:8px;}
        .bc-root{font-size:12px;color:#90aac8;font-weight:500;}
        .bc-chevron{color:#90aac8;}
        .pg-tit{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:700;color:#0a2d5e;}
        .tb-r{display:flex;align-items:center;gap:10px;}
        .sr-w{position:relative;}
        .sr-i{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#90aac8;pointer-events:none;}
        .sr-inp{border:1.5px solid #dceaf8;border-radius:10px;padding:8px 14px 8px 36px;font-size:13px;font-family:'DM Sans',sans-serif;background:#fff;color:#1a3d6e;outline:none;width:210px;transition:border-color .18s,box-shadow .18s;}
        .sr-inp:focus{border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,0.12);}
        .sr-inp::placeholder{color:#90aac8;}
        .ib{width:38px;height:38px;border:1.5px solid #dceaf8;background:#fff;border-radius:10px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#4a6a94;position:relative;transition:all .15s;}
        .ib:hover{border-color:#3b82f6;color:#0e50a0;background:#e8f2fc;}
        .n-dot{position:absolute;top:7px;right:7px;width:7px;height:7px;background:#ef4444;border-radius:50%;border:2px solid #f4f8fd;}
        .t-av{width:38px;height:38px;background:#0e50a0;border-radius:10px;color:#fff;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center;cursor:pointer;border:none;box-shadow:0 2px 10px rgba(14,80,160,0.25);transition:box-shadow .18s;}
        .t-av:hover{box-shadow:0 4px 16px rgba(14,80,160,0.4);}

        /* dropdown */
        .prof-dd{position:absolute;top:calc(100% + 10px);right:0;background:#fff;border-radius:16px;box-shadow:0 16px 48px rgba(14,80,160,0.14);border:1px solid #dceaf8;width:228px;z-index:200;overflow:hidden;animation:ddIn .15s cubic-bezier(.22,1,.36,1);}
        .dd-head{padding:18px 20px 16px;background:#f4f8fd;border-bottom:1px solid #dceaf8;display:flex;align-items:center;gap:12px;}
        .dd-av{width:40px;height:40px;background:#e8f2fc;border-radius:10px;color:#0e50a0;font-size:16px;font-weight:700;display:flex;align-items:center;justify-content:center;border:1.5px solid #dceaf8;flex-shrink:0;}
        .dd-nm{font-size:13px;font-weight:600;color:#0a2d5e;}
        .dd-role{font-size:11px;color:#90aac8;margin-top:1px;}
        .dd-body{padding:8px;}
        .dd-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:9px;border:none;background:transparent;cursor:pointer;width:100%;font-family:'DM Sans',sans-serif;font-size:13px;color:#1a3d6e;transition:background .12s;}
        .dd-item:hover{background:#e8f2fc;}
        .dd-item.danger{color:#dc2626;}
        .dd-item.danger:hover{background:#fee2e2;}
        .dd-sep{height:1px;background:#dceaf8;margin:4px 0;}

        /* main */
        .fiem-main{flex:1;padding:28px 32px 52px;}
        .page-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:26px;padding-bottom:20px;border-bottom:1px solid #dceaf8;}
        .ph-title{font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:700;color:#0a2d5e;letter-spacing:-.2px;}
        .ph-meta{font-size:12px;color:#90aac8;margin-top:4px;}
        .ph-badge{display:inline-flex;align-items:center;gap:6px;background:#e8f2fc;border:1px solid #90b4e0;border-radius:20px;padding:5px 14px;font-size:12px;font-weight:600;color:#0e50a0;}

        /* modal */
        .m-overlay{position:fixed;inset:0;z-index:1000;background:rgba(10,45,94,0.42);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;animation:fadeIn .18s ease;}
        .m-box{background:#fff;border-radius:22px;width:100%;max-width:460px;box-shadow:0 32px 80px rgba(14,80,160,0.2);overflow:hidden;animation:slideUp .22s cubic-bezier(.22,1,.36,1);}
        .m-header{background:#f4f8fd;border-bottom:1px solid #dceaf8;padding:22px 28px;display:flex;align-items:center;justify-content:space-between;}
        .m-htit{font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:700;color:#0a2d5e;}
        .m-close{background:#f0f6ff;border:none;border-radius:8px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#4a6a94;}
        .m-close:hover{background:#dceaf8;}
        .m-body{padding:28px;display:flex;flex-direction:column;gap:18px;}
        .m-lbl{font-size:11px;font-weight:600;color:#90aac8;text-transform:uppercase;letter-spacing:.08em;display:flex;align-items:center;gap:6px;margin-bottom:6px;}
        .m-inp{border:1.5px solid #dceaf8;border-radius:10px;padding:11px 14px;font-size:14px;font-family:'DM Sans',sans-serif;color:#1a3d6e;outline:none;width:100%;background:#fafcff;transition:border-color .18s,box-shadow .18s;}
        .m-inp:focus{border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,0.12);background:#fff;}
        .m-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;}
        .m-footer{padding:0 28px 24px;display:flex;gap:10px;}
        .m-cancel{flex:1;padding:12px;border:1.5px solid #dceaf8;background:#fff;border-radius:11px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;color:#4a6a94;cursor:pointer;transition:all .15s;}
        .m-cancel:hover{background:#f0f6ff;}
        .m-save{flex:2;padding:12px;border:none;background:#0e50a0;border-radius:11px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 4px 14px rgba(14,80,160,0.28);transition:background .15s;}
        .m-save:hover{background:#1868c8;}
        .m-save.saved{background:#166534;}
      `}</style>

      <div className="fiem-root">

        {/* ── SIDEBAR ── */}
        <aside className={`fiem-sb${collapsed ? " collapsed" : ""}`}>

          {/* Brand — solo texto, sin logo */}
          <div className="sb-brand">
            <div className="sb-brand-texts">
              <div className="sb-wordmark">FIEM SOFOM</div>
              <span className="sb-sub-text">Sistema financiero</span>
            </div>
            <button className="sb-toggle" onClick={() => setCollapsed(p => !p)} title={collapsed ? "Expandir" : "Colapsar"}>
              <Menu size={15} />
            </button>
          </div>

          {/* Nav */}
          <nav className="sb-nav">
            {NAV.map((item, i) => (
              <div key={i}>
                {i === 2  && <div className="nav-group-label">Operaciones</div>}
                {i === 5  && <div className="nav-group-label">Administracion</div>}
                {i === 8  && <div className="nav-group-label">Reportes y gestion</div>}
                {i === 11 && <div className="nav-group-label">Finanzas</div>}

                <button
                  className={`ni${openMenus[i] ? " is-open" : ""}${activeNav === i && !activeSub && item.sub.length === 0 ? " is-active" : ""}`}
                  onClick={() => handleNav(i)}
                  title={collapsed ? item.label : ""}
                  onMouseEnter={e => { if (collapsed && item.sub.length > 0) { clearTimeout(flyoutTimer.current); setFlyout({ index: i, y: e.currentTarget.getBoundingClientRect().top }); } }}
                  onMouseLeave={() => { if (collapsed) flyoutTimer.current = setTimeout(() => setFlyout(null), 120); }}
                >
                  <span className="ni-icon"><item.icon size={16} /></span>
                  <span className="ni-lbl">{item.label}</span>
                  {item.sub.length > 0 && (
                    <ChevronRight size={13} className={`ni-arr${openMenus[i] ? " open" : ""}`} />
                  )}
                </button>

                {item.sub.length > 0 && (
                  <div className={`sub-wrap${openMenus[i] ? " open" : ""}`}>
                    {item.sub.map((s, j) => (
                      <button key={j} className={`sub-btn${activeSub === s ? " active" : ""}`} onClick={() => handleSub(i, s)}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}

                {SEPS.has(i) && <div className="sb-sep" />}
              </div>
            ))}
          </nav>

          {/* Flyout submenú colapsado */}
          {collapsed && flyout && NAV[flyout.index] && (
            <div
              onMouseEnter={() => clearTimeout(flyoutTimer.current)}
              onMouseLeave={() => { flyoutTimer.current = setTimeout(() => setFlyout(null), 120); }}
              style={{ position:'fixed', left:'68px', top: flyout.y, zIndex:200, background:'#fff', borderRadius:'12px', boxShadow:'0 8px 32px rgba(14,80,160,0.15)', border:'1px solid #dceaf8', minWidth:'190px', overflow:'hidden', animation:'ddIn .15s cubic-bezier(.22,1,.36,1)' }}
            >
              <div style={{ padding:'10px 14px 8px', borderBottom:'1px solid #f0f6ff' }}>
                <span style={{ fontSize:'11px', fontWeight:'700', color:'#90aac8', textTransform:'uppercase', letterSpacing:'.08em' }}>{NAV[flyout.index].label}</span>
              </div>
              {NAV[flyout.index].sub.map((s, j) => (
                <button key={j}
                  onClick={() => { handleSub(flyout.index, s); setFlyout(null); }}
                  style={{ display:'block', width:'100%', border:'none', background:'none', textAlign:'left', padding:'9px 16px', fontSize:'13px', fontFamily:'DM Sans,sans-serif', color: activeSub === s ? '#0e50a0' : '#1a3d6e', fontWeight: activeSub === s ? '600' : '400', cursor:'pointer', transition:'background .12s' }}
                  onMouseEnter={e => e.currentTarget.style.background='#e8f2fc'}
                  onMouseLeave={e => e.currentTarget.style.background='none'}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </aside>

        {/* ── BODY ── */}
        <div className={`fiem-body${collapsed ? " collapsed" : ""}`}>

          {/* Topbar */}
          <header className="topbar">
            <div className="tb-left">
              <span className="bc-root">FIEM</span>
              <ChevronRight size={12} className="bc-chevron" />
              <span className="pg-tit">{pageTitle}</span>
            </div>
            <div className="tb-r">
              <div className="sr-w">
                <Search size={14} className="sr-i" />
                <input type="text" placeholder="Buscar..." className="sr-inp" />
              </div>
              <div style={{ position:'relative' }}>
                <button className="ib" onClick={() => { setShowBell(p => !p); setShowDropdown(false); }}>
                  <Bell size={16} />
                  {noLeidas > 0 && <span className="n-dot" />}
                </button>
                {showBell && (
                  <>
                    <div style={{ position:'fixed', inset:0, zIndex:199 }} onClick={() => { setShowBell(false); setBellExpanded(false); }} />
                    <div style={{ position:'absolute', top:'calc(100% + 10px)', right:0, width:'320px', background:'#fff', borderRadius:'16px', boxShadow:'0 16px 48px rgba(14,80,160,0.14)', border:'1px solid #dceaf8', zIndex:200, overflow:'hidden' }}>
                      <div style={{ padding:'16px 18px 12px', borderBottom:'1px solid #dceaf8', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                        <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'17px', fontWeight:'700', color:'#0a2d5e' }}>
                          Notificaciones {notifs.length > 0 && <span style={{ fontSize:'13px', color:'#90aac8', fontFamily:'DM Sans,sans-serif', fontWeight:'400' }}>({notifs.length})</span>}
                        </span>
                        {noLeidas > 0 && <button onClick={marcarLeidas} style={{ background:'none', border:'none', fontSize:'12px', color:'#0e50a0', fontWeight:'600', cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>Marcar leídas</button>}
                      </div>
                      <div style={{ maxHeight: bellExpanded ? '480px' : '260px', overflowY:'auto', transition:'max-height .3s ease' }}>
                        {notifs.length === 0 && (
                          <div style={{ padding:'40px', textAlign:'center', color:'#90aac8', fontSize:'13px' }}>Sin notificaciones</div>
                        )}
                        {(bellExpanded ? notifs : notifs.slice(0, 4)).map(n => (
                          <div key={n._id} style={{ display:'flex', alignItems:'flex-start', gap:'10px', padding:'12px 18px', background: n.leida ? '#fff' : '#f0f7ff', borderBottom:'1px solid #f0f6ff' }}>
                            <div style={{ width:'8px', height:'8px', borderRadius:'50%', background: n.leida ? 'transparent' : '#0e50a0', marginTop:'5px', flexShrink:0 }} />
                            <div style={{ flex:1 }}>
                              <div style={{ fontSize:'13px', fontWeight:'600', color:'#0a2d5e', marginBottom:'2px' }}>{n.titulo}</div>
                              <div style={{ fontSize:'12px', color:'#4a6a94', lineHeight:1.5 }}>{n.mensaje}</div>
                            </div>
                            <button onClick={() => eliminarNotif(n._id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#90aac8', padding:'2px', flexShrink:0 }}><X size={13} /></button>
                          </div>
                        ))}
                      </div>
                      {notifs.length > 4 && (
                        <button onClick={() => setBellExpanded(p => !p)} style={{ width:'100%', border:'none', borderTop:'1px solid #dceaf8', background:'#f4f8fd', padding:'10px', fontSize:'12px', fontWeight:'600', color:'#0e50a0', cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>
                          {bellExpanded ? 'Ver menos ↑' : `Ver ${notifs.length - 4} más ↓`}
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
              <div style={{ position:"relative" }}>
                <button className="t-av" onClick={() => setShowDropdown(p => !p)}>
                  {profile.nombre.charAt(0).toUpperCase()}
                </button>
                {showDropdown && (
                  <>
                    <div style={{ position:"fixed", inset:0, zIndex:199 }} onClick={() => setShowDropdown(false)} />
                    <div className="prof-dd">
                      <div className="dd-head">
                        <div className="dd-av">{profile.nombre.charAt(0).toUpperCase()}</div>
                        <div>
                          <div className="dd-nm">{profile.nombre}</div>
                          <div className="dd-role">{profile.correo}</div>
                        </div>
                      </div>
                      <div className="dd-body">
                        <button className="dd-item" onClick={openModal}><Pencil size={14} color="#0e50a0" /> Editar perfil</button>
                        <div className="dd-sep" />
                        <button className="dd-item danger" onClick={handleLogout}><LogOut size={14} /> Cerrar sesion</button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="fiem-main">
            <div className="page-header">
              <div>
                <div className="ph-title">{pageTitle}</div>
                <div className="ph-meta">
                  {new Date().toLocaleDateString("es-MX", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}
                </div>
              </div>
              <div className="ph-badge"><Shield size={13} /> Oficina Central</div>
            </div>
            {renderContent()}
          </main>
        </div>
      </div>

      {/* ── MODAL PERFIL ── */}
      {showModal && (
        <div className="m-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="m-box">
            <div className="m-header">
              <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                <div style={{ width:"40px", height:"40px", background:"#e8f2fc", borderRadius:"10px", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <User size={20} color="#0e50a0" />
                </div>
                <div className="m-htit">Editar Perfil</div>
              </div>
              <button className="m-close" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <div className="m-body">
              <div>
                <div className="m-lbl"><User size={12} /> Nombre completo</div>
                <input className="m-inp" value={form.nombre||''} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} placeholder="Tu nombre" />
              </div>
              <div>
                <div className="m-lbl"><Mail size={12} /> Correo electrónico</div>
                <input className="m-inp" type="email" value={form.correo||''} onChange={e => setForm(p => ({ ...p, correo: e.target.value }))} placeholder="correo@ejemplo.com" />
              </div>
              <div className="m-grid">
                <div>
                  <div className="m-lbl"><PhoneIcon size={12} /> Celular</div>
                  <input className="m-inp" type="tel" value={form.celular||''} onChange={e => setForm(p => ({ ...p, celular: e.target.value }))} />
                </div>
                <div>
                  <div className="m-lbl"><CalIcon size={12} /> Nacimiento</div>
                  <input className="m-inp" type="date" value={form.nacimiento||''} onChange={e => setForm(p => ({ ...p, nacimiento: e.target.value }))} />
                </div>
              </div>
              {/* Sección cambio de contraseña */}
              <div style={{ borderTop:'1px solid #dceaf8', paddingTop:'16px' }}>
                <div style={{ fontSize:'11px', fontWeight:'700', color:'#90aac8', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:'12px' }}>Cambiar contraseña (opcional)</div>
                <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                  <div>
                    <div className="m-lbl">Contraseña actual</div>
                    <input className="m-inp" type={showPw ? 'text' : 'password'} value={form.passwordActual||''} onChange={e => setForm(p => ({ ...p, passwordActual: e.target.value }))} placeholder="••••••••" />
                  </div>
                  <div className="m-grid">
                    <div>
                      <div className="m-lbl">Nueva contraseña</div>
                      <input className="m-inp" type={showPw ? 'text' : 'password'} value={form.password||''} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="••••••••" />
                    </div>
                    <div>
                      <div className="m-lbl">Confirmar</div>
                      <input className="m-inp" type={showPw ? 'text' : 'password'} value={form.password2||''} onChange={e => setForm(p => ({ ...p, password2: e.target.value }))} placeholder="••••••••" />
                    </div>
                  </div>
                  <label style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'12px', color:'#4a6a94', cursor:'pointer' }}>
                    <input type="checkbox" checked={showPw} onChange={e => setShowPw(e.target.checked)} style={{ accentColor:'#0e50a0' }} />
                    Mostrar contraseñas
                  </label>
                </div>
              </div>
              {profileErr && <div style={{ background:'#fee2e2', border:'1px solid #fca5a5', borderRadius:'8px', padding:'9px 12px', fontSize:'13px', color:'#dc2626', fontWeight:'600' }}>{profileErr}</div>}
            </div>
            <div className="m-footer">
              <button className="m-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className={`m-save${saved ? " saved" : ""}`} onClick={saveProfile}>
                {saved ? <><Check size={15} /> Guardado</> : <><Pencil size={14} /> Guardar cambios</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}