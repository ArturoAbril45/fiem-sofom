'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
  Search, User, ChevronDown, ChevronUp, AlertCircle, Loader,
  X, CheckCircle, Save, ShieldOff, ShieldCheck, Slash,
  FileText, DollarSign, Briefcase, MessageSquare, CreditCard,
  PiggyBank, MapPin, Phone, Heart, Users, Camera
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://fiem-backend-production.up.railway.app';

const ESTADOS_MX = ['Aguascalientes','Baja California','Baja California Sur','Campeche','Chiapas','Chihuahua','Ciudad de Mexico','Coahuila de Zaragoza','Colima','Distrito Federal','Durango','Guanajuato','Guerrero','Hidalgo','Jalisco','Mexico','Michoacan','Morelos','Nayarit','Nuevo Leon','Oaxaca','Puebla','Queretaro','Quintana Roo','San Luis Potosi','Sinaloa','Sonora','Tabasco','Tamaulipas','Tlaxcala','Veracruz','Yucatan','Zacatecas'];
const RUTAS_DEFAULT = ['Apaxco Sucursal-Apaxco','Tequix Sucursal-tequix','Huehue sucursal-Huehuetoca','Temas Sucursal-Temascalapa','Tizayuca 1 Sucursal-tizayuca1','OFC-CTRAL OFICINA CENTRAL','01-sucursa 01-sucursal-tula','01 Legal','01 Ajoloapan','01 APAXCO-2','02 TEOLOYUCAN'];

const fmtFecha = v => { if (!v) return '—'; try { return new Date(v).toLocaleDateString('es-MX',{day:'2-digit',month:'2-digit',year:'numeric'}); } catch { return v; } };
const fmtMoney = v => v ? `$${Number(v).toLocaleString('es-MX',{minimumFractionDigits:2})}` : '$0.00';

// ─── Estilos base ───────────────────────────────────────────────────────
const S = {
  card:     { background:'#fff', borderRadius:'16px', borderWidth:'1px', borderStyle:'solid', borderColor:'#dceaf8', boxShadow:'0 2px 14px rgba(14,80,160,0.07)', marginBottom:'18px', overflow:'hidden' },
  input:    { border:'1.5px solid #dceaf8', borderRadius:'8px', padding:'7px 11px', fontSize:'13px', fontFamily:'DM Sans, sans-serif', color:'#1a3d6e', outline:'none', background:'#fafcff', width:'100%', boxSizing:'border-box' },
  inputRO:  { border:'1.5px solid #f0f6ff', borderRadius:'8px', padding:'7px 11px', fontSize:'13px', fontFamily:'DM Sans, sans-serif', color:'#4a6a94', outline:'none', background:'#f8fbff', width:'100%', boxSizing:'border-box' },
  label:    { fontSize:'10px', fontWeight:'700', color:'#90aac8', textTransform:'uppercase', letterSpacing:'0.07em', display:'block', marginBottom:'4px' },
  secHead:  { padding:'14px 22px', background:'#f4f8fd', borderBottomWidth:'1px', borderBottomStyle:'solid', borderBottomColor:'#dceaf8', display:'flex', alignItems:'center', gap:'10px' },
  secBody:  { padding:'18px 22px' },
  btnPrim:  { background:'#0e50a0', color:'#fff', border:'none', borderRadius:'9px', padding:'9px 20px', fontSize:'13px', fontWeight:'600', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px', boxShadow:'0 4px 14px rgba(14,80,160,0.25)' },
  btnSec:   { background:'#e8f2fc', color:'#0e50a0', border:'none', borderRadius:'9px', padding:'9px 18px', fontSize:'13px', fontWeight:'600', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px' },
  btnDanger:{ background:'#fee2e2', color:'#dc2626', border:'none', borderRadius:'9px', padding:'9px 18px', fontSize:'13px', fontWeight:'600', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px' },
  btnOk:    { background:'#dcfce7', color:'#166534', border:'none', borderRadius:'9px', padding:'9px 18px', fontSize:'13px', fontWeight:'600', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px' },
};

// ─── Componentes auxiliares ──────────────────────────────────────────────
function Inp({ val, onChange, type='text', opts, placeholder='', readOnly=false, width }) {
  const s = { ...(readOnly ? S.inputRO : S.input), ...(width ? {width} : {}) };
  if (opts) return <select value={val||''} onChange={e=>onChange(e.target.value)} style={{...s,cursor:'pointer'}}><option value="">— Elige —</option>{opts.map(o=><option key={o} value={o}>{o}</option>)}</select>;
  return <input type={type} value={val||''} onChange={readOnly ? undefined : e=>onChange(e.target.value)} readOnly={readOnly} placeholder={placeholder} style={s}/>;
}

function Campo({ label, children }) {
  return (
    <div>
      <label style={S.label}>{label}</label>
      {children}
    </div>
  );
}

function Grid({ children, min='200px' }) {
  return <div style={{ display:'grid', gridTemplateColumns:`repeat(auto-fit, minmax(${min}, 1fr))`, gap:'14px' }}>{children}</div>;
}

function SeccionCard({ icon: Icon, title, iconBg='#e8f2fc', iconColor='#0e50a0', children, defaultOpen=true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ ...S.card, marginBottom:'14px' }}>
      <button onClick={()=>setOpen(o=>!o)} style={{ ...S.secHead, width:'100%', background:'none', cursor:'pointer', borderTopWidth:0, borderLeftWidth:0, borderRightWidth:0, borderBottomWidth: open?'1px':'0', borderBottomStyle:'solid', borderBottomColor:'#dceaf8' }}>
        <div style={{ width:'30px', height:'30px', background:iconBg, borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Icon size={15} color={iconColor}/></div>
        <span style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:'16px', fontWeight:'700', color:'#0a2d5e', flex:1, textAlign:'left' }}>{title}</span>
        {open ? <ChevronUp size={15} color="#90aac8"/> : <ChevronDown size={15} color="#90aac8"/>}
      </button>
      {open && <div style={S.secBody}>{children}</div>}
    </div>
  );
}

function Pill({ v }) {
  const map = { 'Activo':{ bg:'#dcfce7', c:'#166534' }, 'Lista negra':{ bg:'#fee2e2', c:'#dc2626' }, 'Inactivo':{ bg:'#f3f4f6', c:'#6b7280' } };
  const s = map[v] || map['Inactivo'];
  return <span style={{ background:s.bg, color:s.c, borderRadius:'999px', padding:'3px 12px', fontSize:'12px', fontWeight:'700' }}>{v||'Sin estatus'}</span>;
}

function DocRow({ label, value, onChange }) {
  const ref = useRef();
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'12px', padding:'11px 0', borderBottomWidth:'1px', borderBottomStyle:'solid', borderBottomColor:'#f0f6ff' }}>
      <div style={{ width:'34px', height:'34px', background: value?'#e8f2fc':'#f8fbff', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <FileText size={15} color={value?'#0e50a0':'#90aac8'}/>
      </div>
      <span style={{ fontSize:'13px', color:'#1a3d6e', flex:1, fontWeight: value?'500':'400' }}>{label}</span>
      <input ref={ref} type="file" accept="image/*,application/pdf" style={{display:'none'}}
        onChange={e=>{ const f=e.target.files[0]; if(!f) return; const r=new FileReader(); r.onload=ev=>onChange(ev.target.result); r.readAsDataURL(f); }}/>
      {value
        ? <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <span style={{ fontSize:'11px', color:'#0e50a0', fontWeight:'700', background:'#e8f2fc', padding:'3px 10px', borderRadius:'20px' }}>Cargado</span>
            <button onClick={()=>onChange('')} style={{ background:'none', border:'none', cursor:'pointer', color:'#ef4444', display:'flex' }}><X size={14}/></button>
          </div>
        : <>
            <button onClick={()=>ref.current?.click()} style={{ background:'#0e50a0', color:'#fff', border:'none', borderRadius:'7px', padding:'5px 16px', fontSize:'12px', fontWeight:'600', cursor:'pointer' }}>Seleccionar</button>
            <span style={{ fontSize:'11px', color:'#c0cfe0' }}>Sin archivo</span>
          </>
      }
    </div>
  );
}

function Lightbox({ src, label, onClose }) {
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', zIndex:2000, cursor:'zoom-out', padding:'20px' }}>
      <button onClick={onClose} style={{ position:'fixed', top:'20px', right:'24px', background:'rgba(255,255,255,0.15)', border:'none', borderRadius:'50%', width:'40px', height:'40px', cursor:'pointer', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}><X size={18}/></button>
      <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.7)', marginBottom:'12px', fontWeight:'600' }}>{label}</div>
      <img src={src} alt={label} onClick={e=>e.stopPropagation()} style={{ maxWidth:'90vw', maxHeight:'80vh', borderRadius:'12px', objectFit:'contain' }}/>
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────────────
export default function ConsultarCliente() {
  const [busqueda,    setBusqueda]    = useState('');
  const [numCliente,  setNumCliente]  = useState('');
  const [clientes,    setClientes]    = useState([]);
  const [totalGlobal, setTotalGlobal] = useState(0);
  const [selected,    setSelected]    = useState(null);
  const [form,        setForm]        = useState({});
  const [cargando,    setCargando]    = useState(false);
  const [guardando,   setGuardando]   = useState(false);
  const [msgOk,       setMsgOk]       = useState('');
  const [msgErr,      setMsgErr]      = useState('');
  const [tab,         setTab]         = useState(0);
  const [zoom,        setZoom]        = useState(null);
  const [modalBaja,   setModalBaja]   = useState(false);
  const [motivoBaja,  setMotivoBaja]  = useState('');
  const [montoBaja,   setMontoBaja]   = useState('');
  const [procesando,  setProcesando]  = useState(false);
  const [solicitudes, setSolicitudes] = useState([]);
  const [creditos,    setCreditos]    = useState([]);
  const [cuentas,     setCuentas]     = useState([]);

  useEffect(() => { fetchClientes(); }, []);

  const fetchClientes = async (q='') => {
    setCargando(true); setMsgErr('');
    try {
      const url = q ? `${API}/api/clientes?busqueda=${encodeURIComponent(q)}` : `${API}/api/clientes`;
      const res  = await fetch(url);
      const data = await res.json();
      if (data && data.clientes) {
        setTotalGlobal(data.total || 0);
        setClientes(data.clientes);
      } else {
        const arr = Array.isArray(data) ? data : [];
        setClientes(arr); setTotalGlobal(arr.length);
      }
    } catch { setMsgErr('Error al conectar con el servidor'); }
    finally { setCargando(false); }
  };

  const handleBuscar = () => fetchClientes(busqueda || numCliente);

  const seleccionar = async (id) => {
    setCargando(true); setTab(0);
    try {
      const res  = await fetch(`${API}/api/clientes/${id}`);
      const data = await res.json();
      setSelected(data);
      setForm({
        ...data,
        conyuge:               data.conyuge               || {},
        gastos:                data.gastos                || {},
        documentos:            data.documentos            || {},
        domicilioLaboral:      data.domicilioLaboral      || {},
        estudioSocioeconomico: data.estudioSocioeconomico || { electrodomesticos:{} },
        referencias:           data.referencias?.length ? data.referencias : [{nombre:'',telefono:'',domicilio:''},{nombre:'',telefono:'',domicilio:''}],
      });
      const [sR, cR, aR] = await Promise.all([
        fetch(`${API}/api/solicitudes?clienteId=${id}`),
        fetch(`${API}/api/creditos?clienteId=${id}`),
        fetch(`${API}/api/cuentas-ahorro?clienteId=${id}`),
      ]);
      setSolicitudes(await sR.json().catch(()=>[]));
      setCreditos(await cR.json().catch(()=>[]));
      setCuentas(await aR.json().catch(()=>[]));
    } catch { setMsgErr('Error al cargar cliente'); }
    finally { setCargando(false); }
  };

  const ch = (path, val) => {
    setForm(prev => {
      const p = path.split('.');
      if (p.length===1) return {...prev, [p[0]]: val};
      if (p.length===2) return {...prev, [p[0]]: {...(prev[p[0]]||{}), [p[1]]: val}};
      if (p.length===3) return {...prev, [p[0]]: {...(prev[p[0]]||{}), [p[1]]: {...((prev[p[0]]||{})[p[1]]||{}), [p[2]]: val}}};
      return prev;
    });
  };
  const chRef = (i, f, v) => setForm(prev => { const r=[...(prev.referencias||[])]; r[i]={...(r[i]||{}), [f]:v}; return {...prev, referencias:r}; });

  const guardar = async () => {
    setGuardando(true);
    try {
      const res  = await fetch(`${API}/api/clientes/${selected._id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error||'Error');
      setSelected({...data, numCliente: selected.numCliente});
      setMsgOk('Cliente actualizado correctamente.'); setTimeout(()=>setMsgOk(''),3000);
      fetchClientes(busqueda);
    } catch(e) { setMsgErr(e.message); setTimeout(()=>setMsgErr(''),4000); }
    finally { setGuardando(false); }
  };

  const confirmarBaja = async () => {
    if (!motivoBaja.trim()) return;
    setProcesando(true);
    try {
      const esLN = selected.estatus === 'Lista negra';
      const payload = { estatus:esLN?'Activo':'Lista negra', listaNegra:!esLN, motivoListaNegra:esLN?'':motivoBaja, montoAdeudado:esLN?0:(parseFloat(montoBaja)||0) };
      const res  = await fetch(`${API}/api/clientes/${selected._id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSelected({...data, numCliente: selected.numCliente});
      setForm(f=>({...f,...payload}));
      setModalBaja(false); setMotivoBaja(''); setMontoBaja('');
      setMsgOk(esLN ? 'Cliente reactivado.' : 'Cliente enviado a lista negra.'); setTimeout(()=>setMsgOk(''),3000);
      fetchClientes(busqueda);
    } catch(e) { setMsgErr(e.message); }
    finally { setProcesando(false); }
  };

  const nombreCompleto = selected ? `${selected.apellidoP||''} ${selected.apellidoM||''} ${selected.nombre||''}`.trim() : '';
  const ingresoTotal   = (parseFloat(form.ingresoMensual)||0) + (parseFloat(form.otrosIngresos)||0);
  const gastos         = form.gastos || {};
  const totalGasto     = ['alimento','luz','telefono','transporte','renta','inversion','creditos','otros'].reduce((a,k)=>a+(parseFloat(gastos[k])||0),0);
  const totalDisp      = ingresoTotal - totalGasto;

  const TABS = [
    { label:'Info. General',   icon:User        },
    { label:'Financiero',      icon:DollarSign  },
    { label:'Documentación',   icon:FileText    },
    { label:'Laboral',         icon:Briefcase   },
    { label:'Anotaciones',     icon:MessageSquare },
    { label:'Solicitudes',     icon:FileText    },
    { label:'Créditos',        icon:CreditCard  },
    { label:'Ctas. Ahorro',    icon:PiggyBank   },
  ];

  // ── Tabla helper ────────────────────────────────────────────────────────
  const TH = ({children}) => <th style={{ padding:'10px 14px', textAlign:'left', fontSize:'11px', fontWeight:'700', color:'#4a6a94', textTransform:'uppercase', letterSpacing:'0.06em', borderBottomWidth:'1px', borderBottomStyle:'solid', borderBottomColor:'#dceaf8', background:'#f4f8fd', whiteSpace:'nowrap' }}>{children}</th>;
  const TD = ({children, mono=false}) => <td style={{ padding:'10px 14px', fontSize:'13px', color:'#1a3d6e', borderBottomWidth:'1px', borderBottomStyle:'solid', borderBottomColor:'#f0f6ff', fontFamily: mono?'monospace':'DM Sans, sans-serif' }}>{children}</td>;

  return (
    <div style={{ maxWidth:'940px', margin:'0 auto', fontFamily:'DM Sans, sans-serif' }}>

      {/* Alertas */}
      {msgOk  && <div style={{ background:'#dcfce7', borderWidth:'1px', borderStyle:'solid', borderColor:'#86efac', borderRadius:'10px', padding:'11px 16px', marginBottom:'14px', color:'#166534', fontSize:'13px', fontWeight:'600', display:'flex', alignItems:'center', gap:'8px' }}><CheckCircle size={15}/>{msgOk}</div>}
      {msgErr && <div style={{ background:'#fee2e2', borderWidth:'1px', borderStyle:'solid', borderColor:'#fca5a5', borderRadius:'10px', padding:'11px 16px', marginBottom:'14px', color:'#dc2626', fontSize:'13px', fontWeight:'600', display:'flex', alignItems:'center', gap:'8px' }}><AlertCircle size={15}/>{msgErr}</div>}

      {/* ══════════════════════════════════════════════════════════════════
          LISTA DE CLIENTES
      ══════════════════════════════════════════════════════════════════ */}
      {!selected && (
        <div style={S.card}>
          {/* Encabezado */}
          <div style={{ background:'#0d1f5c', padding:'26px 28px', textAlign:'center' }}>
            <h2 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:'28px', fontWeight:'700', color:'#fff', margin:'0 0 4px' }}>Clientes activos</h2>
            <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.75)', margin:0 }}>Al tener puesto de Dirección General tienes acceso a toda la información</p>
          </div>

          {/* Buscador */}
          <div style={{ padding:'18px 22px', display:'flex', gap:'10px', alignItems:'center', flexWrap:'wrap', borderBottomWidth:'1px', borderBottomStyle:'solid', borderBottomColor:'#f0f6ff', background:'#fafcff' }}>
            <div style={{ position:'relative', flex:1, minWidth:'160px' }}>
              <Search size={14} color="#90aac8" style={{ position:'absolute', left:'11px', top:'50%', transform:'translateY(-50%)' }}/>
              <input value={busqueda} onChange={e=>setBusqueda(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleBuscar()}
                placeholder="Nombre o apellidos"
                style={{ ...S.input, paddingLeft:'34px' }}/>
            </div>
            <span style={{ fontSize:'13px', color:'#90aac8', flexShrink:0 }}>o intente con</span>
            <input value={numCliente} onChange={e=>setNumCliente(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleBuscar()}
              placeholder="Numero cliente"
              style={{ ...S.input, width:'150px' }}/>
            <button onClick={handleBuscar} style={{ ...S.btnPrim, flexShrink:0 }}>
              {cargando ? <Loader size={14} style={{ animation:'spin 1s linear infinite' }}/> : <Search size={14}/>}
              Realizar búsqueda
            </button>
          </div>

          {/* Tabla */}
          <div style={{ padding:'16px 22px' }}>
            {totalGlobal > 0 && (
              <p style={{ fontSize:'13px', color:'#4a6a94', marginBottom:'12px', background:'#f0f7ff', padding:'9px 14px', borderRadius:'8px', borderWidth:'1px', borderStyle:'solid', borderColor:'#dceaf8' }}>
                Existen <strong style={{ color:'#0e50a0' }}>{totalGlobal}</strong> clientes en tu cartera — se muestran los últimos 5 recientes para acelerar la carga
              </p>
            )}
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr>
                    <TH>Numero cliente (ID)</TH>
                    <TH>Clave cliente<br/><span style={{ fontWeight:'400', fontSize:'10px', textTransform:'none', letterSpacing:0 }}>Gerencia-ruta-#socio</span></TH>
                    <TH>Nombre</TH>
                    <TH>Estatus</TH>
                    <TH></TH>
                    <TH></TH>
                  </tr>
                </thead>
                <tbody>
                  {clientes.slice(0,5).map((cl,i) => (
                    <tr key={cl._id} style={{ background: i%2===0?'#fff':'#fafcff', transition:'background 0.1s' }}>
                      <TD mono>{cl.numCliente || clientes.length - i}</TD>
                      <TD mono>{cl.rutaVinculacion || '—'}</TD>
                      <TD><span style={{ fontWeight:'600', textTransform:'uppercase' }}>{cl.apellidoP} {cl.apellidoM} {cl.nombre}</span></TD>
                      <TD><Pill v={cl.estatus}/></TD>
                      <td style={{ padding:'8px 14px', borderBottomWidth:'1px', borderBottomStyle:'solid', borderBottomColor:'#f0f6ff' }}>
                        <button onClick={()=>seleccionar(cl._id)} style={{ background:'#0e50a0', color:'#fff', border:'none', borderRadius:'7px', padding:'6px 16px', fontSize:'12px', fontWeight:'600', cursor:'pointer' }}>Consultar</button>
                      </td>
                      <td style={{ padding:'8px 14px', borderBottomWidth:'1px', borderBottomStyle:'solid', borderBottomColor:'#f0f6ff' }}>
                        <button onClick={()=>seleccionar(cl._id)} style={{ background:'#e8f2fc', color:'#0e50a0', border:'none', borderRadius:'7px', padding:'6px 16px', fontSize:'12px', fontWeight:'600', cursor:'pointer' }}>Actualizar</button>
                      </td>
                    </tr>
                  ))}
                  {clientes.length===0 && !cargando && (
                    <tr><td colSpan={6} style={{ padding:'30px', textAlign:'center', color:'#90aac8', fontSize:'13px' }}>
                      {busqueda||numCliente ? 'No se encontraron resultados.' : 'No hay clientes registrados.'}
                    </td></tr>
                  )}
                  {cargando && <tr><td colSpan={6} style={{ padding:'30px', textAlign:'center' }}><Loader size={20} color="#0e50a0" style={{ animation:'spin 1s linear infinite' }}/></td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          DETALLE DEL CLIENTE
      ══════════════════════════════════════════════════════════════════ */}
      {selected && (
        <>
          {/* Header foto + nombre */}
          <div style={{ ...S.card, textAlign:'center', padding:'28px 22px' }}>
            <div style={{ position:'relative', width:'100px', height:'100px', margin:'0 auto 14px', cursor: (selected.documentos?.fotoPerfil||selected.fotos?.cliente)?'zoom-in':'default' }}
              onClick={()=>{ const s=selected.documentos?.fotoPerfil||selected.fotos?.cliente; if(s) setZoom({src:s,label:'Foto de perfil'}); }}>
              <div style={{ width:'100px', height:'100px', borderRadius:'50%', overflow:'hidden', borderWidth:'3px', borderStyle:'solid', borderColor:'#dceaf8', boxShadow:'0 4px 18px rgba(14,80,160,0.15)' }}>
                {(selected.documentos?.fotoPerfil||selected.fotos?.cliente)
                  ? <img src={selected.documentos?.fotoPerfil||selected.fotos?.cliente} alt="Foto" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                  : <div style={{ width:'100%', height:'100%', background:'#e8f2fc', display:'flex', alignItems:'center', justifyContent:'center' }}><User size={42} color="#90aac8"/></div>
                }
              </div>
            </div>

            <h2 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:'24px', fontWeight:'700', color:'#0a2d5e', margin:'0 0 4px', textTransform:'uppercase' }}>{nombreCompleto}</h2>
            <div style={{ display:'flex', gap:'10px', justifyContent:'center', alignItems:'center', marginBottom:'4px', flexWrap:'wrap' }}>
              <Pill v={selected.estatus}/>
              {selected.tipoCliente && <span style={{ fontSize:'12px', color:'#4a6a94', background:'#f0f6ff', padding:'2px 10px', borderRadius:'20px', borderWidth:'1px', borderStyle:'solid', borderColor:'#dceaf8' }}>{selected.tipoCliente}</span>}
            </div>
            <p style={{ fontSize:'13px', color:'#90aac8', margin:'0 0 4px' }}>ID: <strong style={{ color:'#0e50a0' }}>{selected.numCliente}</strong></p>
            <p style={{ fontSize:'13px', color:'#90aac8', margin:'0 0 18px' }}>Clave cliente: <strong style={{ color:'#0e50a0' }}>{selected.rutaVinculacion||'—'}</strong></p>

            {/* Botones acción */}
            <div style={{ display:'flex', gap:'10px', justifyContent:'center', flexWrap:'wrap' }}>
              <button onClick={()=>{ setSelected(null); setForm({}); }} style={S.btnSec}>← Volver a lista</button>
              <button onClick={guardar} disabled={guardando} style={S.btnPrim}>
                {guardando ? <><Loader size={13} style={{ animation:'spin 1s linear infinite' }}/> Guardando...</> : <><Save size={13}/> Guardar cambios</>}
              </button>
              <button onClick={()=>setModalBaja(true)} style={selected.estatus==='Lista negra' ? S.btnOk : S.btnDanger}>
                {selected.estatus==='Lista negra' ? <><ShieldCheck size={13}/> Reactivar</> : <><ShieldOff size={13}/> Lista negra</>}
              </button>
            </div>
          </div>

          {/* Alerta lista negra */}
          {selected.estatus==='Lista negra' && (
            <div style={{ background:'#fee2e2', borderWidth:'1px', borderStyle:'solid', borderColor:'#fca5a5', borderRadius:'12px', padding:'13px 18px', marginBottom:'16px', display:'flex', gap:'10px', alignItems:'flex-start' }}>
              <Slash size={16} color="#dc2626" style={{ flexShrink:0, marginTop:'1px' }}/>
              <div>
                <strong style={{ color:'#dc2626', fontSize:'13px', display:'block', marginBottom:'2px' }}>Cliente en lista negra</strong>
                {selected.motivoListaNegra && <p style={{ fontSize:'12px', color:'#ef4444', margin:'0 0 1px' }}>Motivo: {selected.motivoListaNegra}</p>}
                {selected.montoAdeudado>0  && <p style={{ fontSize:'12px', color:'#ef4444', margin:0 }}>Monto adeudado: {fmtMoney(selected.montoAdeudado)}</p>}
              </div>
            </div>
          )}

          {/* ── PESTAÑAS ── */}
          <div style={S.card}>
            {/* Barra de tabs */}
            <div style={{ display:'flex', overflowX:'auto', borderBottomWidth:'1px', borderBottomStyle:'solid', borderBottomColor:'#dceaf8', background:'#fafcff' }}>
              {TABS.map(({label, icon:Icon}, i) => (
                <button key={i} onClick={()=>setTab(i)} style={{ padding:'12px 18px', border:'none', borderBottomWidth:'3px', borderBottomStyle:'solid', borderBottomColor: tab===i?'#0e50a0':'transparent', cursor:'pointer', fontSize:'11px', fontWeight:'700', color: tab===i?'#0e50a0':'#90aac8', background: tab===i?'#f0f7ff':'transparent', fontFamily:'DM Sans, sans-serif', whiteSpace:'nowrap', letterSpacing:'0.05em', display:'flex', alignItems:'center', gap:'5px', transition:'all 0.15s' }}>
                  <Icon size={12}/> {label}
                </button>
              ))}
            </div>

            <div style={{ padding:'22px' }}>

              {/* ══ TAB 0: INFORMACIÓN GENERAL ══ */}
              {tab===0 && <>
                {/* Clasificación */}
                <SeccionCard icon={User} title="Clasificación">
                  <Grid min="220px">
                    <Campo label="Tipo cliente"><Inp val={form.tipoCliente} onChange={v=>ch('tipoCliente',v)} opts={['Titular Fisica (persona fisica)','Aval','Titular Moral']}/></Campo>
                    <Campo label="Número único del cliente"><Inp val={String(selected.numCliente||'')} onChange={()=>{}} readOnly/></Campo>
                    <Campo label="Ruta vinculación"><Inp val={form.rutaVinculacion} onChange={v=>ch('rutaVinculacion',v)} opts={RUTAS_DEFAULT}/></Campo>
                    <Campo label="Permitir acceso web de socios"><Inp val={form.accesoWeb} onChange={v=>ch('accesoWeb',v)} opts={['SI','NO']} width="100px"/></Campo>
                  </Grid>
                </SeccionCard>

                {/* Datos personales */}
                <SeccionCard icon={User} title="Datos personales" iconBg="#e8f2fc" iconColor="#0e50a0">
                  <Grid>
                    <Campo label="Apellido Paterno"><Inp val={form.apellidoP} onChange={v=>ch('apellidoP',v)}/></Campo>
                    <Campo label="Apellido Materno"><Inp val={form.apellidoM} onChange={v=>ch('apellidoM',v)}/></Campo>
                    <Campo label="Nombre(s)"><Inp val={form.nombre} onChange={v=>ch('nombre',v)}/></Campo>
                    <Campo label="Teléfono Particular"><Inp val={form.telefono} onChange={v=>ch('telefono',v)} type="tel"/></Campo>
                    <Campo label="Teléfono Oficina"><Inp val={form.telefonoOficina} onChange={v=>ch('telefonoOficina',v)} type="tel"/></Campo>
                    <Campo label="Teléfono Celular"><Inp val={form.celular} onChange={v=>ch('celular',v)} type="tel"/></Campo>
                    <Campo label="Fecha de Nacimiento"><Inp val={form.fechaNac?.toString().substring(0,10)||''} onChange={v=>ch('fechaNac',v)} type="date"/></Campo>
                    <Campo label="Lugar de Nacimiento"><Inp val={form.lugarNacimiento} onChange={v=>ch('lugarNacimiento',v)} opts={ESTADOS_MX}/></Campo>
                    <Campo label="Sexo"><Inp val={form.sexo} onChange={v=>ch('sexo',v)} opts={['HOMBRE','MUJER']}/></Campo>
                    <Campo label="Estado Civil"><Inp val={form.estadoCivil} onChange={v=>ch('estadoCivil',v)} opts={['Soltero(a)','Casado(a)','Union libre','Divorciado(a)','Viudo(a)']}/></Campo>
                    <Campo label="RFC"><Inp val={form.rfc} onChange={v=>ch('rfc',v.toUpperCase())} placeholder="Ingrese su RFC"/></Campo>
                    <Campo label="Correo Electrónico"><Inp val={form.correo} onChange={v=>ch('correo',v)} type="email"/></Campo>
                    <Campo label="No. Dependientes Económicos"><Inp val={form.numDependientes} onChange={v=>ch('numDependientes',v)} type="number"/></Campo>
                    <Campo label="CURP">
                      <div style={{ display:'flex', gap:'6px' }}>
                        <button style={{ background:'#17a2b8', color:'#fff', border:'none', borderRadius:'7px', padding:'7px 12px', fontSize:'12px', fontWeight:'600', cursor:'pointer', flexShrink:0 }}>Generar</button>
                        <Inp val={form.curp} onChange={v=>ch('curp',v.toUpperCase())}/>
                      </div>
                    </Campo>
                  </Grid>
                </SeccionCard>

                {/* Cónyuge */}
                <SeccionCard icon={Heart} title="Datos del cónyuge" iconBg="#fce8f0" iconColor="#be185d" defaultOpen={false}>
                  <Grid>
                    <Campo label="Nombre completo"><Inp val={form.conyuge?.nombre} onChange={v=>ch('conyuge.nombre',v)}/></Campo>
                    <Campo label="Teléfono"><Inp val={form.conyuge?.telefono} onChange={v=>ch('conyuge.telefono',v)} type="tel"/></Campo>
                    <Campo label="Nombre del trabajo"><Inp val={form.conyuge?.trabajo} onChange={v=>ch('conyuge.trabajo',v)}/></Campo>
                    <Campo label="Dirección del trabajo"><Inp val={form.conyuge?.direccionTrabajo} onChange={v=>ch('conyuge.direccionTrabajo',v)}/></Campo>
                  </Grid>
                </SeccionCard>

                {/* Referencias */}
                <SeccionCard icon={Users} title="Datos de referencia de contacto" iconBg="#f0e8fc" iconColor="#7c3aed" defaultOpen={false}>
                  {[0,1].map(i => (
                    <div key={i} style={{ marginBottom: i===0?'16px':0 }}>
                      <div style={{ fontSize:'11px', fontWeight:'700', color:'#7c3aed', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'10px' }}>Referencia {i+1}</div>
                      <Grid>
                        <Campo label="Nombre de la persona"><Inp val={form.referencias?.[i]?.nombre||''} onChange={v=>chRef(i,'nombre',v)}/></Campo>
                        <Campo label="Teléfono"><Inp val={form.referencias?.[i]?.telefono||''} onChange={v=>chRef(i,'telefono',v)} type="tel"/></Campo>
                        <Campo label="Domicilio"><Inp val={form.referencias?.[i]?.domicilio||''} onChange={v=>chRef(i,'domicilio',v)}/></Campo>
                      </Grid>
                    </div>
                  ))}
                </SeccionCard>

                {/* Domicilio */}
                <SeccionCard icon={MapPin} title="Domicilio" defaultOpen={false}>
                  {/* Historial */}
                  <div style={{ background:'#fafae8', borderWidth:'1px', borderStyle:'solid', borderColor:'#e5e080', borderRadius:'10px', padding:'14px', marginBottom:'18px' }}>
                    <div style={{ fontSize:'13px', fontWeight:'700', color:'#6b5a00', marginBottom:'10px' }}>Direcciones registradas del cliente</div>
                    <div style={{ overflowX:'auto' }}>
                      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'12px' }}>
                        <thead>
                          <tr style={{ background:'#d4d478' }}>
                            {['Fecha Agregada','CP','Estado','Municipio','Colonia','Calle','No. Ext'].map(h=>(
                              <th key={h} style={{ padding:'7px 10px', textAlign:'left', fontWeight:'700', borderBottomWidth:'1px', borderBottomStyle:'solid', borderBottomColor:'#b0b000', whiteSpace:'nowrap' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {selected.updatedAt && (
                            <tr>
                              {[fmtFecha(selected.updatedAt), selected.cp||'—', selected.estado||'—', selected.municipio||'—', selected.colonia||'—', selected.calle||'—', selected.numExt||'—'].map((v,j)=>(
                                <td key={j} style={{ padding:'8px 10px', borderBottomWidth:'1px', borderBottomStyle:'solid', borderBottomColor:'#eee', fontSize:'12px' }}>{v}</td>
                              ))}
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {/* Editar domicilio */}
                  <Grid>
                    <Campo label="Código postal">
                      <div style={{ display:'flex', gap:'6px' }}>
                        <Inp val={form.cp} onChange={v=>ch('cp',v)} width="110px"/>
                        <button style={{ background:'#17a2b8', color:'#fff', border:'none', borderRadius:'7px', padding:'7px 12px', fontSize:'12px', fontWeight:'600', cursor:'pointer', flexShrink:0 }}>BUSCAR</button>
                      </div>
                    </Campo>
                    <Campo label="Calle"><Inp val={form.calle} onChange={v=>ch('calle',v)}/></Campo>
                    <Campo label="No. Exterior"><Inp val={form.numExt} onChange={v=>ch('numExt',v)}/></Campo>
                    <Campo label="No. Interior"><Inp val={form.numInt} onChange={v=>ch('numInt',v)}/></Campo>
                    <Campo label="Entre las calles de"><Inp val={form.entreCalles1} onChange={v=>ch('entreCalles1',v)}/></Campo>
                    <Campo label="Y de"><Inp val={form.entreCalles2} onChange={v=>ch('entreCalles2',v)}/></Campo>
                    <Campo label="Colonia"><Inp val={form.colonia} onChange={v=>ch('colonia',v)}/></Campo>
                    <Campo label="Municipio"><Inp val={form.municipio} onChange={v=>ch('municipio',v)}/></Campo>
                    <Campo label="Estado"><Inp val={form.estado} onChange={v=>ch('estado',v)} opts={ESTADOS_MX}/></Campo>
                  </Grid>
                  <div style={{ marginTop:'12px' }}>
                    <Campo label="Referencia adicional"><Inp val={form.referenciaAdicional} onChange={v=>ch('referenciaAdicional',v)}/></Campo>
                  </div>
                  {/* Mapa placeholder */}
                  <div style={{ marginTop:'16px', background:'#e8f2fc', borderRadius:'10px', height:'160px', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'4px' }}>
                    <MapPin size={22} color="#90aac8"/>
                    <span style={{ fontSize:'12px', color:'#90aac8', fontWeight:'600' }}>Arrastra el marcador para ubicar el domicilio</span>
                  </div>
                </SeccionCard>
              </>}

              {/* ══ TAB 1: FINANCIERO ══ */}
              {tab===1 && <>
                <SeccionCard icon={DollarSign} title="Ingresos">
                  <Grid min="200px">
                    <Campo label="Ingreso mensual promedio">
                      <input type="number" value={form.ingresoMensual||''} onChange={e=>ch('ingresoMensual',e.target.value)} style={S.input}/>
                    </Campo>
                    <Campo label="Otros ingresos">
                      <input type="number" value={form.otrosIngresos||''} onChange={e=>ch('otrosIngresos',e.target.value)} style={S.input}/>
                    </Campo>
                    <Campo label="Ingreso total (calculado)">
                      <input readOnly value={ingresoTotal} style={{ ...S.inputRO, fontWeight:'700', color:'#0e50a0' }}/>
                    </Campo>
                  </Grid>
                </SeccionCard>

                <SeccionCard icon={DollarSign} title="Gasto promedio mensual" iconBg="#fef3c7" iconColor="#d97706">
                  <Grid min="160px">
                    {[['Alimento','alimento'],['Luz','luz'],['Teléfono','telefono'],['Transporte','transporte'],['Renta','renta'],['Inversión negocio','inversion'],['Créditos','creditos'],['Otros','otros']].map(([label,key])=>(
                      <Campo key={key} label={label}>
                        <input type="number" value={gastos[key]||''} onChange={e=>ch(`gastos.${key}`,e.target.value)} style={S.input}/>
                      </Campo>
                    ))}
                  </Grid>
                  <div style={{ display:'flex', gap:'20px', marginTop:'16px', flexWrap:'wrap' }}>
                    <Campo label="Total gasto">
                      <input readOnly value={fmtMoney(totalGasto)} style={{ ...S.inputRO, color:'#dc2626', fontWeight:'700', width:'160px' }}/>
                    </Campo>
                    <Campo label="Total disponible mensual">
                      <input readOnly value={fmtMoney(totalDisp)} style={{ ...S.inputRO, color: totalDisp>=0?'#166534':'#dc2626', fontWeight:'700', width:'160px' }}/>
                    </Campo>
                  </div>
                </SeccionCard>

                <SeccionCard icon={User} title="Estudio socioeconómico" iconBg="#f0e8fc" iconColor="#7c3aed" defaultOpen={false}>
                  <Grid min="200px">
                    <Campo label="Tipo de vivienda"><Inp val={form.estudioSocioeconomico?.tipoVivienda} onChange={v=>ch('estudioSocioeconomico.tipoVivienda',v)} opts={['Propia','Rentada','Familiar']}/></Campo>
                  </Grid>
                  <div style={{ marginTop:'16px' }}>
                    <div style={{ fontSize:'11px', fontWeight:'700', color:'#90aac8', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'12px' }}>Electrodomésticos</div>
                    <Grid min="170px">
                      {[['Refrigerador','refrigerador'],['Estufa','estufa'],['Lavadora','lavadora'],['Televisión','television'],['Licuadora','licuadora'],['Horno','horno'],['Computadora','computadora'],['Sala','sala'],['Celular','celular'],['Vehículo (marca, modelo)','vehiculo']].map(([label,key])=>(
                        <Campo key={key} label={label}>
                          <Inp val={form.estudioSocioeconomico?.electrodomesticos?.[key]||''} onChange={v=>ch(`estudioSocioeconomico.electrodomesticos.${key}`,v)}/>
                        </Campo>
                      ))}
                    </Grid>
                  </div>
                </SeccionCard>
              </>}

              {/* ══ TAB 2: DOCUMENTACIÓN ══ */}
              {tab===2 && <>
                <div style={{ background:'#f0f7ff', borderWidth:'1px', borderStyle:'solid', borderColor:'#dceaf8', borderRadius:'10px', padding:'11px 16px', marginBottom:'18px', fontSize:'13px', color:'#4a6a94' }}>
                  La documentación es opcional. Una vez cargado el cliente puedes actualizar los documentos en cualquier momento.
                </div>
                {[
                  ['Comprobante de domicilio',  'documentos.comprobanteDomicilio'],
                  ['Comprobante de ingresos',   'documentos.comprobanteIngresos'],
                  ['Identificación oficial',    'documentos.identificacion'],
                  ['Fotografía de perfil',      'documentos.fotoPerfil'],
                  ['Acta de nacimiento',        'documentos.actaNacimiento'],
                  ['CURP (documento)',          'documentos.curpDoc'],
                  ['Fachada de casa',           'documentos.fachadaCasa'],
                  ['Fachada de negocio',        'documentos.fachadaNegocio'],
                ].map(([label, path]) => {
                  const [obj, key] = path.split('.');
                  const val = form[obj]?.[key] || '';
                  return <DocRow key={label} label={label} value={val} onChange={v=>ch(path,v)}/>;
                })}
                {/* Miniaturas */}
                {[
                  ['Foto perfil',       form.documentos?.fotoPerfil     || form.fotos?.cliente],
                  ['Fachada casa',      form.documentos?.fachadaCasa    || form.fotos?.casa],
                  ['Fachada negocio',   form.documentos?.fachadaNegocio || form.fotos?.negocio],
                  ['Cónyuge',           form.conyuge?.foto],
                ].filter(([,src])=>src && src.length>10).length > 0 && (
                  <div style={{ marginTop:'20px' }}>
                    <div style={{ fontSize:'11px', fontWeight:'700', color:'#90aac8', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'12px' }}>Fotografías cargadas</div>
                    <div style={{ display:'flex', gap:'16px', flexWrap:'wrap' }}>
                      {[
                        ['Foto perfil',    form.documentos?.fotoPerfil     || form.fotos?.cliente],
                        ['Fachada casa',   form.documentos?.fachadaCasa    || form.fotos?.casa],
                        ['Fachada negocio',form.documentos?.fachadaNegocio || form.fotos?.negocio],
                        ['Cónyuge',        form.conyuge?.foto],
                      ].filter(([,src])=>src && src.length>10).map(([label,src])=>(
                        <div key={label} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'6px' }}>
                          <div onClick={()=>setZoom({src,label})} style={{ width:'80px', height:'80px', borderRadius:'10px', overflow:'hidden', cursor:'zoom-in', borderWidth:'2px', borderStyle:'solid', borderColor:'#dceaf8' }}>
                            <img src={src} alt={label} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                          </div>
                          <span style={{ fontSize:'10px', color:'#4a6a94', fontWeight:'600' }}>{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>}

              {/* ══ TAB 3: LABORAL ══ */}
              {tab===3 && <>
                <SeccionCard icon={Briefcase} title="Datos laborales">
                  <Grid>
                    <Campo label="Fuente de ingresos"><Inp val={form.fuenteIngresos} onChange={v=>ch('fuenteIngresos',v)} opts={['Empleo formal','Negocio propio','Pensionado','Honorarios','Otro']}/></Campo>
                    <Campo label="Nombre de la empresa"><Inp val={form.empresa} onChange={v=>ch('empresa',v)}/></Campo>
                    <Campo label="RFC de la empresa"><Inp val={form.rfcEmpresa} onChange={v=>ch('rfcEmpresa',v.toUpperCase())}/></Campo>
                    <Campo label="Ocupación"><Inp val={form.ocupacion} onChange={v=>ch('ocupacion',v)}/></Campo>
                  </Grid>
                </SeccionCard>
                <SeccionCard icon={MapPin} title="Domicilio laboral" defaultOpen={false}>
                  <Grid>
                    <Campo label="Código postal">
                      <div style={{ display:'flex', gap:'6px' }}>
                        <Inp val={form.domicilioLaboral?.cp} onChange={v=>ch('domicilioLaboral.cp',v)} width="110px"/>
                        <button style={{ background:'#17a2b8', color:'#fff', border:'none', borderRadius:'7px', padding:'7px 12px', fontSize:'12px', fontWeight:'600', cursor:'pointer' }}>BUSCAR</button>
                      </div>
                    </Campo>
                    <Campo label="Calle"><Inp val={form.domicilioLaboral?.calle} onChange={v=>ch('domicilioLaboral.calle',v)}/></Campo>
                    <Campo label="No. Exterior"><Inp val={form.domicilioLaboral?.numExt} onChange={v=>ch('domicilioLaboral.numExt',v)}/></Campo>
                    <Campo label="No. Interior"><Inp val={form.domicilioLaboral?.numInt} onChange={v=>ch('domicilioLaboral.numInt',v)}/></Campo>
                    <Campo label="Entre calles"><Inp val={form.domicilioLaboral?.entreCalles1} onChange={v=>ch('domicilioLaboral.entreCalles1',v)}/></Campo>
                    <Campo label="Y de"><Inp val={form.domicilioLaboral?.entreCalles2} onChange={v=>ch('domicilioLaboral.entreCalles2',v)}/></Campo>
                  </Grid>
                  <div style={{ marginTop:'12px' }}>
                    <Campo label="Referencia adicional"><Inp val={form.domicilioLaboral?.referenciaAdicional} onChange={v=>ch('domicilioLaboral.referenciaAdicional',v)}/></Campo>
                  </div>
                  <div style={{ marginTop:'14px', background:'#e8f2fc', borderRadius:'10px', height:'140px', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'4px' }}>
                    <MapPin size={20} color="#90aac8"/>
                    <span style={{ fontSize:'12px', color:'#90aac8' }}>Mapa — domicilio laboral</span>
                  </div>
                </SeccionCard>
              </>}

              {/* ══ TAB 4: ANOTACIONES ══ */}
              {tab===4 && (
                <div style={{ textAlign:'center', padding:'50px 20px', color:'#90aac8' }}>
                  <MessageSquare size={40} color="#dceaf8"/>
                  <p style={{ marginTop:'12px', fontSize:'14px' }}>Sin anotaciones registradas para este cliente.</p>
                </div>
              )}

              {/* ══ TAB 5: SOLICITUDES ══ */}
              {tab===5 && (
                Array.isArray(solicitudes) && solicitudes.length>0
                  ? <div style={{ overflowX:'auto' }}>
                      <table style={{ width:'100%', borderCollapse:'collapse' }}>
                        <thead><tr>{['Folio','Producto','Monto','Plazo','Frecuencia','Estatus','Fecha'].map(h=><TH key={h}>{h}</TH>)}</tr></thead>
                        <tbody>{solicitudes.map((s,i)=>(
                          <tr key={s._id} style={{ background:i%2===0?'#fff':'#fafcff' }}>
                            <TD mono>{s._id?.slice(-6)}</TD>
                            <TD>{s.producto||'—'}</TD>
                            <TD>{fmtMoney(s.monto)}</TD>
                            <TD>{s.plazo||'—'}</TD>
                            <TD>{s.frecuencia||'—'}</TD>
                            <TD><Pill v={s.estatus}/></TD>
                            <TD>{s.fecha||fmtFecha(s.createdAt)}</TD>
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>
                  : <div style={{ textAlign:'center', padding:'50px', color:'#90aac8' }}><FileText size={40} color="#dceaf8"/><p style={{ marginTop:'12px' }}>Sin solicitudes registradas.</p></div>
              )}

              {/* ══ TAB 6: CRÉDITOS ══ */}
              {tab===6 && (
                Array.isArray(creditos) && creditos.length>0
                  ? <div style={{ overflowX:'auto' }}>
                      <table style={{ width:'100%', borderCollapse:'collapse' }}>
                        <thead><tr>{['Folio','Producto','Monto','Saldo','Pagos','Estatus'].map(h=><TH key={h}>{h}</TH>)}</tr></thead>
                        <tbody>{creditos.map((c,i)=>(
                          <tr key={c._id} style={{ background:i%2===0?'#fff':'#fafcff' }}>
                            <TD mono>{c.folio||c._id?.slice(-6)}</TD>
                            <TD>{c.producto||'—'}</TD>
                            <TD>{fmtMoney(c.monto)}</TD>
                            <TD>{fmtMoney(c.saldo)}</TD>
                            <TD>{c.pagosRealizados||0}</TD>
                            <TD><Pill v={c.estatus}/></TD>
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>
                  : <div style={{ textAlign:'center', padding:'50px', color:'#90aac8' }}><CreditCard size={40} color="#dceaf8"/><p style={{ marginTop:'12px' }}>Sin créditos registrados.</p></div>
              )}

              {/* ══ TAB 7: CUENTAS AHORRO ══ */}
              {tab===7 && (
                Array.isArray(cuentas) && cuentas.length>0
                  ? <div style={{ overflowX:'auto' }}>
                      <table style={{ width:'100%', borderCollapse:'collapse' }}>
                        <thead><tr>{['Folio','Producto','Saldo','Estatus','Apertura'].map(h=><TH key={h}>{h}</TH>)}</tr></thead>
                        <tbody>{cuentas.map((c,i)=>(
                          <tr key={c._id} style={{ background:i%2===0?'#fff':'#fafcff' }}>
                            <TD mono>{c.folio||c._id?.slice(-6)}</TD>
                            <TD>{c.producto||'—'}</TD>
                            <TD>{fmtMoney(c.saldo)}</TD>
                            <TD><Pill v={c.estatus}/></TD>
                            <TD>{c.fechaApertura||fmtFecha(c.createdAt)}</TD>
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>
                  : <div style={{ textAlign:'center', padding:'50px', color:'#90aac8' }}><PiggyBank size={40} color="#dceaf8"/><p style={{ marginTop:'12px' }}>Sin cuentas de ahorro.</p></div>
              )}

            </div>
          </div>
        </>
      )}

      {/* ── Modal lista negra ── */}
      {modalBaja && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'20px' }}>
          <div style={{ background:'#fff', borderRadius:'16px', padding:'28px', maxWidth:'400px', width:'100%', boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:'20px', fontWeight:'700', color:'#0a2d5e', margin:'0 0 4px' }}>
              {selected?.estatus==='Lista negra' ? 'Reactivar cliente' : 'Enviar a lista negra'}
            </h3>
            <p style={{ fontSize:'13px', color:'#4a6a94', margin:'0 0 18px' }}>{nombreCompleto}</p>
            <label style={{ ...S.label, display:'block', marginBottom:'5px' }}>Motivo *</label>
            <textarea value={motivoBaja} onChange={e=>setMotivoBaja(e.target.value)} rows={3}
              style={{ ...S.input, resize:'vertical', marginBottom:'14px' }}/>
            {selected?.estatus!=='Lista negra' && <>
              <label style={{ ...S.label, display:'block', marginBottom:'5px' }}>Monto adeudado ($)</label>
              <input type="number" value={montoBaja} onChange={e=>setMontoBaja(e.target.value)} style={{ ...S.input, marginBottom:'20px' }}/>
            </>}
            <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end' }}>
              <button onClick={()=>{ setModalBaja(false); setMotivoBaja(''); setMontoBaja(''); }} style={S.btnSec}>Cancelar</button>
              <button onClick={confirmarBaja} disabled={!motivoBaja.trim()||procesando}
                style={{ ...(selected?.estatus==='Lista negra'?S.btnPrim:S.btnDanger), opacity:!motivoBaja.trim()?0.6:1, cursor:!motivoBaja.trim()?'not-allowed':'pointer' }}>
                {procesando && <Loader size={12} style={{ animation:'spin 1s linear infinite' }}/>}
                {selected?.estatus==='Lista negra' ? 'Reactivar' : 'Confirmar baja'}
              </button>
            </div>
          </div>
        </div>
      )}

      {zoom && <Lightbox src={zoom.src} label={zoom.label} onClose={()=>setZoom(null)}/>}
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}