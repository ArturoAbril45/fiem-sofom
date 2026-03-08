"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Home, FileText, Users, CreditCard, PiggyBank,
  UserCog, Map, Building2, BarChart2, Phone,
  Calendar, BookOpen, Settings, LogOut,
  ChevronDown, Bell, Search,
  TrendingUp, TrendingDown, DollarSign, Activity,
  User, Mail, Phone as PhoneIcon, Calendar as CalIcon, X, Check, Pencil
} from "lucide-react";

const NAV = [
  { icon: Home,       label: "Inicio",                        sub: [] },
  { icon: FileText,   label: "Resumen del dia",               sub: [] },
  { icon: Users,      label: "Administracion de clientes",    sub: ["Alta de clientes", "Consultar cliente", "Lista negra"] },
  { icon: CreditCard, label: "Administracion de creditos",    sub: ["Nueva solicitud", "Consultar solicitud", "Aperturar credito", "Consultar credito", "Abonar credito", "Movimientos abonos de credito"] },
  { icon: PiggyBank,  label: "Administracion de ahorro",      sub: [] },
  { icon: UserCog,    label: "Administracion de empleados",   sub: ["Alta empleado", "Consultar empleado"] },
  { icon: Map,        label: "Administracion de rutas",       sub: ["Asignacion de ruta a ejecutivo", "Agregar o consultar rutas"] },
  { icon: Building2,  label: "Administracion de Gerencias",   sub: ["Asignacion de Gerencia a Gerente", "Agregar o consultar Gerencias"] },
  { icon: BarChart2,  label: "Reportes",                      sub: ["Cartera clientes", "Cartera creditos", "Valor cartera actual", "Seguro de credito", "Comision por apertura de credito", "Promesas de pago", "Abonos vencidos por cobrar", "Cobros de credito realizados", "Desglose de abonos aplicados", "Cobranza del dia", "Movimientos de ahorro"] },
  { icon: Phone,      label: "Gestion de cobranza",           sub: ["Nueva Gestion", "Seguimiento de Gestion"] },
  { icon: Calendar,   label: "Agenda",                        sub: [] },
  { icon: BookOpen,   label: "Contabilidad",                  sub: [] },
  { icon: Settings,   label: "Configuracion",                 sub: [] },
];

const KPI = [
  { label: "Cartera Total",     value: "$1,513,425", delta: "+8.2%",      up: true,  icon: DollarSign,  color: "#0d1f5c" },
  { label: "Cobranza de Hoy",   value: "$35,505",    delta: "159 pagos",  up: null,  icon: Activity,    color: "#1565c0" },
  { label: "Creditos Vigentes", value: "396",        delta: "+12 nuevos", up: true,  icon: TrendingUp,  color: "#0891b2" },
  { label: "Pagos Vencidos",    value: "2,014",      delta: "$1,373,415", up: false, icon: TrendingDown,color: "#dc2626" },
];

export default function Dashboard() {
  const [activeNav,    setActiveNav]    = useState(0);
  const [openMenus,    setOpenMenus]    = useState({});
  const [activeSub,    setActiveSub]    = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal,    setShowModal]    = useState(false);
  const [saved,        setSaved]        = useState(false);

  const [profile, setProfile] = useState({
    nombre:     "Administrador",
    correo:     "admin@fiem.com.mx",
    celular:    "+52 55 1234 5678",
    nacimiento: "1985-06-15",
  });
  const [form, setForm] = useState({ ...profile });

  const openModal = () => {
    setForm({ ...profile });
    setShowDropdown(false);
    setShowModal(true);
    setSaved(false);
  };

  const saveProfile = () => {
    setProfile({ ...form });
    setSaved(true);
    setTimeout(() => { setShowModal(false); setSaved(false); }, 1200);
  };

  const [showBeta,    setShowBeta]    = useState(false);
  const [betaSection, setBetaSection] = useState("");
  const [loggingOut,  setLoggingOut]  = useState(false);

  const router = useRouter();

  const handleLogout = () => {
    setShowDropdown(false);
    setLoggingOut(true);
    setTimeout(() => { router.push("/login"); }, 3000);
  };

  const triggerBeta = (label) => { setBetaSection(label); setShowBeta(true); };

  const toggle = (i) => setOpenMenus(p => ({ ...p, [i]: !p[i] }));

  const handleNav = (i) => {
    if (NAV[i].sub.length > 0) { toggle(i); }
    else {
      setActiveNav(i); setActiveSub(null);
      if (i !== 0) triggerBeta(NAV[i].label);
    }
  };

  const handleSub = (i, s) => {
    setActiveNav(i); setActiveSub(s);
    triggerBeta(s);
  };

  return (
    <>
      {/* ── LOGOUT LOADER ── */}
      {loggingOut && (
        <div className="logout-screen">
          <div className="logout-letters">
            {["F","I","E","M"].map((l, i) => (
              <span key={i} className="logout-letter" style={{ animationDelay: `${i * 0.28}s` }}>{l}</span>
            ))}
          </div>
          <div className="logout-txt">Cerrando sesion</div>
          <div className="logout-dots">
            {[0,1,2].map(i => (
              <div key={i} className="logout-dot" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        </div>
      )}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .root { display: flex; min-height: 100vh; font-family: 'DM Sans', system-ui, sans-serif; background: #eef2f7; }

        /* ── SIDEBAR ── */
        .sb {
          width: 268px; flex-shrink: 0;
          background: linear-gradient(175deg, #040e2e 0%, #0d1f5c 55%, #112468 100%);
          display: flex; flex-direction: column;
          position: fixed; top: 0; left: 0; bottom: 0; z-index: 50;
          overflow-y: auto; overflow-x: hidden;
        }
        .sb::-webkit-scrollbar { width: 2px; }
        .sb::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); }

        .sb-brand {
          padding: 28px 18px 22px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          display: flex; flex-direction: column; align-items: center; gap: 10px;
        }
        .sb-logo {
          width: 70px; height: 70px;
          background: rgba(255,255,255,0.07);
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700;
          color: #fff; letter-spacing: 2px;
          border: 1.5px solid rgba(255,255,255,0.15);
          box-shadow: 0 0 40px rgba(21,101,192,0.25);
        }
        .sb-company { color: #fff; font-size: 11px; font-weight: 600; letter-spacing: 0.07em; text-align: center; text-transform: uppercase; line-height: 1.4; }
        .sb-office  { color: rgba(255,255,255,0.38); font-size: 10px; text-align: center; margin-top: 3px; }
        .sb-btn-out {
          background: transparent;
          color: rgba(255,255,255,0.55); border: 1px solid rgba(255,255,255,0.12); border-radius: 9px;
          padding: 9px 0; font-family: 'DM Sans', sans-serif;
          font-size: 12px; font-weight: 500; cursor: pointer;
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
          margin-top: 4px; letter-spacing: 0.04em;
          transition: all .18s;
        }
        .sb-btn-out:hover {
          background: rgba(220,38,38,0.12);
          border-color: rgba(220,38,38,0.35);
          color: #fca5a5;
        }

        /* NAV */
        .nav { flex: 1; padding: 10px 10px 0; }

        .ni-wrap { margin-bottom: 1px; }
        .ni {
          width: 100%; border: none; cursor: pointer; border-radius: 9px;
          background: transparent; display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; font-family: 'DM Sans', sans-serif;
          font-size: 13px; color: rgba(255,255,255,0.58); text-align: left;
          transition: background .14s, color .14s;
        }
        .ni:hover { background: rgba(255,255,255,0.07); color: #fff; }
        .ni.is-open { background: rgba(255,255,255,0.07); color: #fff; }
        .ni.is-active { background: rgba(96,165,250,0.14); color: #93c5fd; }
        .ni-lbl { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .ni-arr { transition: transform .22s; opacity: .45; flex-shrink: 0; }
        .ni-arr.open { transform: rotate(180deg); }

        /* SUBMENU */
        .sub-wrap { overflow: hidden; max-height: 0; transition: max-height .28s ease; padding-left: 34px; }
        .sub-wrap.open { max-height: 700px; }
        .sub-btn {
          display: block; width: 100%; border: none; cursor: pointer;
          background: transparent; text-align: left;
          font-family: 'DM Sans', sans-serif; font-size: 12px;
          color: rgba(255,255,255,0.45);
          padding: 8px 10px 8px 14px;
          border-left: 1.5px solid rgba(255,255,255,0.07);
          border-radius: 0 7px 7px 0; margin-bottom: 1px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          transition: all .13s;
        }
        .sub-btn:hover { color: #93c5fd; background: rgba(96,165,250,0.08); border-left-color: #60a5fa; }
        .sub-btn.active { color: #60a5fa; background: rgba(96,165,250,0.13); border-left-color: #60a5fa; font-weight: 600; }

        .sb-sep { height: 1px; background: rgba(255,255,255,0.06); margin: 7px 10px; }

        /* USER */
        .sb-user {
          padding: 14px 16px; border-top: 1px solid rgba(255,255,255,0.07);
          display: flex; align-items: center; gap: 10px;
        }
        .u-av { width: 34px; height: 34px; background: linear-gradient(135deg,#1565c0,#0891b2); border-radius: 50%; color: #fff; font-size: 14px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .u-nm { font-size: 13px; font-weight: 600; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .u-rl { font-size: 10px; color: rgba(255,255,255,0.38); }

        /* BODY */
        .body { flex: 1; margin-left: 268px; display: flex; flex-direction: column; min-height: 100vh; }

        /* TOPBAR */
        .topbar {
          position: sticky; top: 0; z-index: 40;
          background: rgba(238,242,247,0.96); backdrop-filter: blur(12px);
          border-bottom: 1px solid #d8e2ed;
          padding: 0 36px; height: 66px;
          display: flex; align-items: center; justify-content: space-between; gap: 16px;
        }
        .pg-tit { font-family: 'Playfair Display', serif; font-size: 21px; color: #0d1f5c; letter-spacing: -.3px; }
        .pg-sub { font-size: 11px; color: #94a3b8; margin-top: 2px; }
        .tb-r { display: flex; align-items: center; gap: 12px; }
        .sr-w { position: relative; }
        .sr-i { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; pointer-events: none; }
        .sr-inp {
          border: 1.5px solid #d8e2ed; border-radius: 10px;
          padding: 8px 14px 8px 36px; font-size: 13px; font-family: inherit;
          background: #fff; color: #0d1f5c; outline: none; width: 200px; transition: border-color .18s;
        }
        .sr-inp:focus { border-color: #1565c0; }
        .sr-inp::placeholder { color: #b0bec8; }
        .n-btn { width: 38px; height: 38px; border: 1.5px solid #d8e2ed; background: #fff; border-radius: 10px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #64748b; position: relative; }
        .n-dot { position: absolute; top: 8px; right: 8px; width: 7px; height: 7px; background: #ef4444; border-radius: 50%; border: 1.5px solid #eef2f7; }
        /* PROFILE DROPDOWN */
        .prof-wrap { position: relative; }
        .t-av { width: 34px; height: 34px; background: linear-gradient(135deg,#1565c0,#0891b2); border-radius: 50%; color: #fff; font-size: 13px; font-weight: 700; display: flex; align-items: center; justify-content: center; cursor: pointer; border: none; transition: box-shadow .18s; }
        .t-av:hover { box-shadow: 0 0 0 3px rgba(21,101,192,0.25); }

        .prof-dd {
          position: absolute; top: calc(100% + 10px); right: 0;
          background: #fff; border-radius: 14px;
          box-shadow: 0 12px 40px rgba(13,31,92,0.14); border: 1px solid #e4ecf5;
          width: 220px; z-index: 200; overflow: hidden;
          animation: ddIn .15s cubic-bezier(.22,1,.36,1);
        }
        @keyframes ddIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }

        .dd-head {
          padding: 16px 18px 14px;
          background: linear-gradient(135deg, #0d1f5c, #1565c0);
          display: flex; align-items: center; gap: 12px;
        }
        .dd-av { width: 40px; height: 40px; background: rgba(255,255,255,0.15); border-radius: 50%; color: #fff; font-size: 16px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 1.5px solid rgba(255,255,255,0.3); }
        .dd-nm { font-size: 13px; font-weight: 600; color: #fff; }
        .dd-role { font-size: 11px; color: rgba(255,255,255,0.6); margin-top: 1px; }

        .dd-body { padding: 8px; }
        .dd-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 9px; border: none;
          background: transparent; cursor: pointer; width: 100%;
          font-family: 'DM Sans', sans-serif; font-size: 13px; color: #334155;
          transition: background .12s;
        }
        .dd-item:hover { background: #f1f5f9; }
        .dd-item.danger { color: #dc2626; }
        .dd-item.danger:hover { background: #fee2e2; }
        .dd-sep { height: 1px; background: #f1f5f9; margin: 4px 0; }

        /* MODAL OVERLAY */
        .m-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(4,14,46,0.55); backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          animation: fadeIn .18s ease;
        }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }

        .m-box {
          background: #fff; border-radius: 22px; width: 100%; max-width: 460px;
          box-shadow: 0 24px 80px rgba(13,31,92,0.18);
          overflow: hidden;
          animation: slideUp2 .22s cubic-bezier(.22,1,.36,1);
        }
        @keyframes slideUp2 { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }

        .m-header {
          background: linear-gradient(135deg, #061340, #1565c0);
          padding: 26px 28px 22px;
          display: flex; align-items: flex-start; justify-content: space-between;
        }
        .m-av-big {
          width: 60px; height: 60px;
          background: rgba(255,255,255,0.15); border-radius: 50%;
          color: #fff; font-family: 'Playfair Display', serif;
          font-size: 24px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid rgba(255,255,255,0.25);
          margin-bottom: 10px;
        }
        .m-htit { font-family: 'Playfair Display', serif; font-size: 20px; color: #fff; letter-spacing: -.3px; }
        .m-hsub { font-size: 12px; color: rgba(255,255,255,0.55); margin-top: 3px; }
        .m-close {
          background: rgba(255,255,255,0.1); border: none; border-radius: 8px;
          width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: rgba(255,255,255,0.7); transition: background .15s;
        }
        .m-close:hover { background: rgba(255,255,255,0.2); color: #fff; }

        .m-body { padding: 28px; display: flex; flex-direction: column; gap: 18px; }

        .m-field { display: flex; flex-direction: column; gap: 6px; }
        .m-label {
          font-size: 11px; font-weight: 600; color: #64748b;
          text-transform: uppercase; letter-spacing: 0.07em;
          display: flex; align-items: center; gap: 6px;
        }
        .m-inp {
          border: 1.5px solid #e2e8f0; border-radius: 10px;
          padding: 11px 14px; font-size: 14px; font-family: 'DM Sans', sans-serif;
          color: #0d1f5c; outline: none; width: 100%;
          transition: border-color .18s, box-shadow .18s;
          background: #fafbfd;
        }
        .m-inp:focus { border-color: #1565c0; box-shadow: 0 0 0 3px rgba(21,101,192,0.1); background: #fff; }

        .m-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }

        .m-footer { padding: 0 28px 24px; display: flex; gap: 10px; }
        .m-btn-cancel {
          flex: 1; padding: 12px; border: 1.5px solid #e2e8f0;
          background: #fff; border-radius: 11px; font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 600; color: #64748b; cursor: pointer;
          transition: all .15s;
        }
        .m-btn-cancel:hover { border-color: #94a3b8; color: #334155; }
        .m-btn-save {
          flex: 2; padding: 12px; border: none;
          background: linear-gradient(135deg, #0d1f5c, #1565c0);
          border-radius: 11px; font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 600; color: #fff; cursor: pointer;
          transition: opacity .15s; display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .m-btn-save:hover { opacity: .88; }
        .m-btn-save.saved { background: linear-gradient(135deg, #166534, #16a34a); }

        /* MAIN */
        .main { flex: 1; padding: 30px 36px 48px; }

        /* KPI */
        .kpi-g { display: grid; grid-template-columns: repeat(4,1fr); gap: 20px; margin-bottom: 28px; }
        .kpi-c {
          background: #fff; border-radius: 18px; padding: 22px 20px;
          border: 1px solid #e4ecf5;
          box-shadow: 0 2px 16px rgba(13,31,92,0.05);
          animation: up .4s cubic-bezier(.22,1,.36,1) both;
        }
        @keyframes up { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .kpi-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
        .kpi-ico { width:42px; height:42px; border-radius:12px; display:flex; align-items:center; justify-content:center; }
        .kpi-v { font-family:'Playfair Display',serif; font-size:26px; color:#0d1f5c; letter-spacing:-.5px; }
        .kpi-l { font-size:13px; color:#64748b; margin-top:5px; }
        .kpi-d { display:inline-flex; align-items:center; gap:4px; font-size:12px; font-weight:600; margin-top:10px; padding:3px 10px; border-radius:99px; }
        .kpi-d.up   { background:#dcfce7; color:#16a34a; }
        .kpi-d.down { background:#fee2e2; color:#dc2626; }
        .kpi-d.neu  { background:#f1f5f9; color:#64748b; }

        /* EMPTY */
        .empty {
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          min-height:280px; background:#fff; border-radius:20px;
          border:1px solid #e4ecf5; color:#94a3b8;
          box-shadow:0 2px 16px rgba(13,31,92,0.04);
        }
        .e-ico { width:72px; height:72px; background:#f1f5f9; border-radius:18px; display:flex; align-items:center; justify-content:center; margin-bottom:18px; }
        .e-tit { font-family:'Playfair Display',serif; font-size:19px; color:#334155; margin-bottom:8px; }
        .e-sub { font-size:14px; }

        /* BETA MODAL */
        .beta-overlay {
          position: fixed; inset: 0; z-index: 2000;
          background: rgba(100,116,139,0.55);
          display: flex; align-items: center; justify-content: center;
          animation: fadeIn .15s ease;
        }
        .beta-box {
          background: #fff; border-radius: 14px; width: 100%; max-width: 480px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.14);
          overflow: hidden;
          animation: slideUp2 .18s cubic-bezier(.22,1,.36,1);
          padding: 28px 28px 22px;
        }
        .beta-top-row {
          display: flex; align-items: flex-start; gap: 16px; margin-bottom: 20px;
        }
        .beta-ico-circle {
          width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
          background: #eff6ff;
          display: flex; align-items: center; justify-content: center;
        }
        .beta-texts {}
        .beta-htit { font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 6px; font-family: 'DM Sans', sans-serif; }
        .beta-section-tag {
          display: inline-flex; align-items: center; gap: 5px;
          background: #eff6ff; border: 1px solid #bfdbfe;
          color: #1d4ed8; font-size: 11px; font-weight: 600;
          padding: 2px 9px; border-radius: 5px; margin-bottom: 8px;
        }
        .beta-msg { font-size: 13.5px; color: #64748b; line-height: 1.6; }
        .beta-footer {
          display: flex; justify-content: flex-end; gap: 10px;
          padding-top: 20px; border-top: 1px solid #f1f5f9; margin-top: 4px;
        }
        .beta-cancel {
          padding: 9px 20px; border: 1.5px solid #e2e8f0; border-radius: 8px;
          background: #fff; font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 600; color: #334155; cursor: pointer;
          transition: all .13s;
        }
        .beta-cancel:hover { border-color: #94a3b8; color: #0f172a; }
        .beta-confirm {
          padding: 9px 22px; border: none; border-radius: 8px;
          background: linear-gradient(135deg, #0d1f5c, #1565c0);
          font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
          color: #fff; cursor: pointer; transition: opacity .13s;
          display: flex; align-items: center; gap: 7px;
        }
        .beta-confirm:hover { opacity: .87; }

        /* LOGOUT LOADER */
        .logout-screen {
          position: fixed; inset: 0; z-index: 9999;
          background: #0d1f5c;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 28px;
          animation: fadeIn .3s ease;
        }
        .logout-letters {
          display: flex; gap: 6px;
        }
        .logout-letter {
          font-family: 'Playfair Display', serif;
          font-size: 48px; font-weight: 700; color: #fff;
          animation: letterBounce 1.4s ease-in-out infinite;
        }
        @keyframes letterBounce {
          0%, 100% { transform: translateY(0);    opacity: .25; }
          40%       { transform: translateY(-18px); opacity: 1;   }
          60%       { transform: translateY(-18px); opacity: 1;   }
        }
        .logout-txt {
          font-size: 13px; color: rgba(255,255,255,0.45);
          letter-spacing: .12em; text-transform: uppercase; font-weight: 500;
        }
        .logout-dots { display: flex; gap: 6px; }
        .logout-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: rgba(255,255,255,0.3);
          animation: pulse 1.2s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100%{opacity:.25;transform:scale(.8);} 50%{opacity:1;transform:scale(1.2);} }
        @media(max-width:768px){ .body{ margin-left:0; } .main{ padding:20px 16px; } }
      `}</style>

      <div className="root">
        {/* SIDEBAR */}
        <aside className="sb">
          <div className="sb-brand">
            <div className="sb-logo">FIEM</div>
            <div>
              <div className="sb-company">FIEM SA DE CV SOFOM ENR</div>
              <div className="sb-office">Oficina Central | Direccion General</div>
            </div>
            <button className="sb-btn-out" onClick={handleLogout}><LogOut size={13}/> Cerrar sesion</button>
          </div>

          <nav className="nav">
            {NAV.map((item, i) => (
              <div key={i} className="ni-wrap">
                <button
                  className={`ni ${openMenus[i] ? "is-open" : ""} ${activeNav === i && !activeSub && !openMenus[i] ? "is-active" : ""}`}
                  onClick={() => handleNav(i)}
                >
                  <item.icon size={16} style={{ flexShrink: 0 }} />
                  <span className="ni-lbl">{item.label}</span>
                  {item.sub.length > 0 && (
                    <ChevronDown size={13} className={`ni-arr ${openMenus[i] ? "open" : ""}`} />
                  )}
                </button>

                {item.sub.length > 0 && (
                  <div className={`sub-wrap ${openMenus[i] ? "open" : ""}`}>
                    {item.sub.map((s, j) => (
                      <button
                        key={j}
                        className={`sub-btn ${activeSub === s ? "active" : ""}`}
                        onClick={() => handleSub(i, s)}
                      >{s}</button>
                    ))}
                  </div>
                )}

                {(i === 1 || i === 4 || i === 9 || i === 10) && <div className="sb-sep" />}
              </div>
            ))}
          </nav>

          <div className="sb-user">
            <div className="u-av">A</div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div className="u-nm">Administrador</div>
              <div className="u-rl">FIEM S.A. de C.V.</div>
            </div>
            <LogOut size={14} onClick={handleLogout} style={{ color: "rgba(255,100,100,0.6)", cursor: "pointer", flexShrink: 0 }} />
          </div>
        </aside>

        {/* BODY */}
        <div className="body">
          <header className="topbar">
            <div>
              <h1 className="pg-tit">{activeSub || NAV[activeNav].label}</h1>
              <p className="pg-sub">{new Date().toLocaleDateString("es-MX", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
            </div>
            <div className="tb-r">
              <div className="sr-w">
                <Search size={14} className="sr-i" />
                <input type="text" placeholder="Buscar..." className="sr-inp" />
              </div>
              <button className="n-btn" onClick={() => triggerBeta("Notificaciones")}><Bell size={17}/><span className="n-dot"/></button>

              {/* AVATAR + DROPDOWN */}
              <div className="prof-wrap">
                <button className="t-av" onClick={() => setShowDropdown(p => !p)}>
                  {profile.nombre.charAt(0).toUpperCase()}
                </button>

                {showDropdown && (
                  <>
                    {/* click outside closes */}
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
                        <button className="dd-item" onClick={openModal}>
                          <Pencil size={14} color="#1565c0" /> Editar perfil
                        </button>
                        <div className="dd-sep" />
                        <button className="dd-item danger" onClick={handleLogout}>
                          <LogOut size={14} /> Cerrar sesion
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </header>

          {/* ── MODAL EDITAR PERFIL ── */}
          {showModal && (
            <div className="m-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
              <div className="m-box">
                <div className="m-header">
                  <div>
                    <div className="m-av-big">{profile.nombre.charAt(0).toUpperCase()}</div>
                    <div className="m-htit">Editar Perfil</div>
                    <div className="m-hsub">Actualiza tu informacion personal</div>
                  </div>
                  <button className="m-close" onClick={() => setShowModal(false)}><X size={16}/></button>
                </div>

                <div className="m-body">
                  <div className="m-field">
                    <label className="m-label"><User size={12}/> Nombre completo</label>
                    <input
                      className="m-inp"
                      value={form.nombre}
                      onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
                      placeholder="Tu nombre completo"
                    />
                  </div>

                  <div className="m-field">
                    <label className="m-label"><Mail size={12}/> Correo electronico</label>
                    <input
                      className="m-inp"
                      type="email"
                      value={form.correo}
                      onChange={e => setForm(p => ({ ...p, correo: e.target.value }))}
                      placeholder="correo@ejemplo.com"
                    />
                  </div>

                  <div className="m-grid">
                    <div className="m-field">
                      <label className="m-label"><PhoneIcon size={12}/> Celular</label>
                      <input
                        className="m-inp"
                        type="tel"
                        value={form.celular}
                        onChange={e => setForm(p => ({ ...p, celular: e.target.value }))}
                        placeholder="+52 55 0000 0000"
                      />
                    </div>
                    <div className="m-field">
                      <label className="m-label"><CalIcon size={12}/> Fecha de nacimiento</label>
                      <input
                        className="m-inp"
                        type="date"
                        value={form.nacimiento}
                        onChange={e => setForm(p => ({ ...p, nacimiento: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="m-footer">
                  <button className="m-btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button className={`m-btn-save ${saved ? "saved" : ""}`} onClick={saveProfile}>
                    {saved ? <><Check size={15}/> Guardado</> : <><Pencil size={14}/> Guardar cambios</>}
                  </button>
                </div>
              </div>
            </div>
          )}

          <main className="main">

            <div className="empty">
              <div className="e-ico">
                {(() => { const Icon = NAV[activeNav].icon; return <Icon size={32} color="#cbd5e1" />; })()}
              </div>
              <div className="e-tit">{activeSub || NAV[activeNav].label}</div>
              <div className="e-sub">Este modulo estara disponible proximamente.</div>
            </div>
          </main>
        </div>
      </div>

      {/* ── BETA MODAL ── */}
      {showBeta && (
        <div className="beta-overlay" onClick={e => e.target === e.currentTarget && setShowBeta(false)}>
          <div className="beta-box">
            <div className="beta-top-row">
              <div className="beta-ico-circle">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <div className="beta-texts">
                <div className="beta-htit">Modulo en desarrollo</div>
                <div className="beta-section-tag">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
                  </svg>
                  {betaSection}
                </div>
                <p className="beta-msg">
                  Esta funcion se encuentra actualmente en construccion. Nuestro equipo esta trabajando en ella y te avisaremos por correo en cuanto este disponible.
                </p>
              </div>
            </div>
            <div className="beta-footer">
              <button className="beta-cancel" onClick={() => setShowBeta(false)}>Cancelar</button>
              <button className="beta-confirm" onClick={() => setShowBeta(false)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}