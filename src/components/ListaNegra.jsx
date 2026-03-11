'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
  Search, User, ChevronDown, ChevronUp, Loader, X,
  CheckCircle, AlertCircle, Save, ShieldCheck, ShieldOff,
  FileText, DollarSign, Briefcase, MessageSquare, CreditCard,
  PiggyBank, MapPin, Heart, Users, Slash
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://fiem-backend-production.up.railway.app';

const ESTADOS_MX = ['Aguascalientes','Baja California','Baja California Sur','Campeche','Chiapas','Chihuahua','Ciudad de Mexico','Coahuila de Zaragoza','Colima','Distrito Federal','Durango','Guanajuato','Guerrero','Hidalgo','Jalisco','Mexico','Michoacan','Morelos','Nayarit','Nuevo Leon','Oaxaca','Puebla','Queretaro','Quintana Roo','San Luis Potosi','Sinaloa','Sonora','Tabasco','Tamaulipas','Tlaxcala','Veracruz','Yucatan','Zacatecas'];
const RUTAS_DEFAULT = ['Apaxco Sucursal-Apaxco','Tequix Sucursal-tequix','Huehue sucursal-Huehuetoca','Temas Sucursal-Temascalapa','Tizayuca 1 Sucursal-tizayuca1','OFC-CTRAL OFICINA CENTRAL','01-sucursa 01-sucursal-tula','01 Legal','01 Ajoloapan','01 APAXCO-2','02 TEOLOYUCAN'];

const fmtFecha = v => { if (!v) return '—'; try { return new Date(v).toLocaleString('es-MX',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}); } catch { return v; } };
const fmtMoney = v => v ? `$${Number(v).toLocaleString('es-MX',{minimumFractionDigits:2})}` : '$0.00';

// ─── Estilos base ──────────────────────────────────────────────
const S = {
  card:    { background:'#fff', borderRadius:'16px', borderWidth:'1px', borderStyle:'solid', borderColor:'#dceaf8', boxShadow:'0 2px 14px rgba(14,80,160,0.07)', marginBottom:'18px', overflow:'hidden' },
  input:   { border:'1.5px solid #dceaf8', borderRadius:'8px', padding:'7px 11px', fontSize:'13px', fontFamily:'DM Sans, sans-serif', color:'#1a3d6e', outline:'none', background:'#fafcff', width:'100%', boxSizing:'border-box' },
  inputRO: { border:'1.5px solid #f0f6ff', borderRadius:'8px', padding:'7px 11px', fontSize:'13px', fontFamily:'DM Sans, sans-serif', color:'#4a6a94', outline:'none', background:'#f8fbff', width:'100%', boxSizing:'border-box' },
  label:   { fontSize:'10px', fontWeight:'700', color:'#90aac8', textTransform:'uppercase', letterSpacing:'0.07em', display:'block', marginBottom:'4px' },
  btnPrim: { background:'#0e50a0', color:'#fff', border:'none', borderRadius:'9px', padding:'9px 20px', fontSize:'13px', fontWeight:'600', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px', boxShadow:'0 4px 14px rgba(14,80,160,0.25)' },
  btnSec:  { background:'#e8f2fc', color:'#0e50a0', border:'none', borderRadius:'9px', padding:'9px 18px', fontSize:'13px', fontWeight:'600', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px' },
  btnOk:   { background:'#dcfce7', color:'#166534', border:'none', borderRadius:'9px', padding:'9px 18px', fontSize:'13px', fontWeight:'600', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px' },
};

function Inp({ val, onChange, type='text', opts, placeholder='', readOnly=false, width }) {
  const s = { ...(readOnly ? S.inputRO : S.input), ...(width ? {width} : {}) };
  if (opts) return <select value={val||''} onChange={e=>onChange(e.target.value)} style={{...s,cursor:'pointer'}}><option value="">— Elige —</option>{opts.map(o=><option key={o} value={o}>{o}</option>)}</select>;
  return <input type={type} value={val||''} onChange={readOnly ? undefined : e=>onChange(e.target.value)} readOnly={readOnly} placeholder={placeholder} style={s}/>;
}

function Campo({ label, children }) {
  return <div><label style={S.label}>{label}</label>{children}</div>;
}

function Grid({ children, min='200px' }) {
  return <div style={{ display:'grid', gridTemplateColumns:`repeat(auto-fit, minmax(${min}, 1fr))`, gap:'14px' }}>{children}</div>;
}

function SecCard({ icon:Icon, title, iconBg='#e8f2fc', iconColor='#0e50a0', children, defaultOpen=true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ ...S.card, marginBottom:'14px' }}>
      <button onClick={()=>setOpen(o=>!o)} style={{ width:'100%', padding:'13px 20px', background:'none', cursor:'pointer', borderTopWidth:0, borderLeftWidth:0, borderRightWidth:0, borderBottomWidth:open?'1px':'0', borderBottomStyle:'solid', borderBottomColor:'#dceaf8', display:'flex', alignItems:'center', gap:'10px' }}>
        <div style={{ width:'30px', height:'30px', background:iconBg, borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Icon size={15} color={iconColor}/></div>
        <span style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:'16px', fontWeight:'700', color:'#0a2d5e', flex:1, textAlign:'left' }}>{title}</span>
        {open ? <ChevronUp size={15} color="#90aac8"/> : <ChevronDown size={15} color="#90aac8"/>}
      </button>
      {open && <div style={{ padding:'18px 20px' }}>{children}</div>}
    </div>
  );
}

function DocRow({ label, value, onChange }) {
  const ref = useRef();
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'12px', padding:'11px 0', borderBottomWidth:'1px', borderBottomStyle:'solid', borderBottomColor:'#f0f6ff' }}>
      <div style={{ width:'34px', height:'34px', background:value?'#e8f2fc':'#f8fbff', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <FileText size={15} color={value?'#0e50a0':'#90aac8'}/>
      </div>
      <span style={{ fontSize:'13px', color:'#1a3d6e', flex:1, fontWeight:value?'500':'400' }}>{label}</span>
      <input ref={ref} type="file" accept="image/*,application/pdf" style={{display:'none'}}
        onChange={e=>{ const f=e.target.files[0]; if(!f) return; const r=new FileReader(); r.onload=ev=>onChange(ev.target.result); r.readAsDataURL(f); }}/>
      {value
        ? <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
            <span style={{fontSize:'11px',color:'#0e50a0',fontWeight:'700',background:'#e8f2fc',padding:'3px 10px',borderRadius:'20px'}}>Cargado</span>
            <button onClick={()=>onChange('')} style={{background:'none',border:'none',cursor:'pointer',color:'#ef4444',display:'flex'}}><X size={14}/></button>
          </div>
        : <>
            <button onClick={()=>ref.current?.click()} style={{background:'#0e50a0',color:'#fff',border:'none',borderRadius:'7px',padding:'5px 16px',fontSize:'12px',fontWeight:'600',cursor:'pointer'}}>Seleccionar</button>
            <span style={{fontSize:'11px',color:'#c0cfe0'}}>Sin archivo</span>
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

// ─── Componente principal ──────────────────────────────────────
export default function ListaNegra() {
  const [busqueda,   setBusqueda]   = useState('');
  const [clientes,   setClientes]   = useState([]);
  const [cargando,   setCargando]   = useState(false);
  const [selected,   setSelected]   = useState(null);
  const [form,       setForm]       = useState({});
  const [guardando,  setGuardando]  = useState(false);
  const [msgOk,      setMsgOk]      = useState('');
  const [msgErr,     setMsgErr]     = useState('');
  const [tab,        setTab]        = useState(0);
  const [zoom,       setZoom]       = useState(null);
  const [modal,      setModal]      = useState(false);  // reactivar
  const [motivo,     setMotivo]     = useState('');
  const [procesando, setProcesando] = useState(false);
  const [solicitudes,setSolicitudes]= useState([]);
  const [creditos,   setCreditos]   = useState([]);
  const [cuentas,    setCuentas]    = useState([]);

  useEffect(() => { fetchLN(); }, []);

  const fetchLN = async (q='') => {
    setCargando(true); setMsgErr('');
    try {
      const url = q
        ? `${API}/api/clientes?busqueda=${encodeURIComponent(q)}&estatus=Lista negra`
        : `${API}/api/lista-negra`;
      const res  = await fetch(url);
      const data = await res.json();
      // Soportar array directo o {clientes:[]}
      const arr = Array.isArray(data) ? data : (data.clientes || []);
      // Asignar numCliente por índice si no viene del backend
      setClientes(arr.map((c,i) => ({ ...c, numCliente: c.numCliente || arr.length - i })));
    } catch { setMsgErr('Error al conectar con el servidor'); }
    finally { setCargando(false); }
  };

  const handleBuscar = () => fetchLN(busqueda);

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
        referencias:           data.referencias?.length   ? data.referencias : [{nombre:'',telefono:'',domicilio:''},{nombre:'',telefono:'',domicilio:''}],
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
      if (p.length===1) return {...prev,[p[0]]:val};
      if (p.length===2) return {...prev,[p[0]]:{...(prev[p[0]]||{}),[p[1]]:val}};
      if (p.length===3) return {...prev,[p[0]]:{...(prev[p[0]]||{}),[p[1]]:{...((prev[p[0]]||{})[p[1]]||{}),[p[2]]:val}}};
      return prev;
    });
  };
  const chRef = (i,f,v) => setForm(prev => { const r=[...(prev.referencias||[])]; r[i]={...(r[i]||{}),[f]:v}; return {...prev,referencias:r}; });

  const guardar = async () => {
    setGuardando(true);
    try {
      const res  = await fetch(`${API}/api/clientes/${selected._id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error||'Error');
      setSelected({...data, numCliente:selected.numCliente});
      setMsgOk('Cliente actualizado.'); setTimeout(()=>setMsgOk(''),3000);
    } catch(e) { setMsgErr(e.message); setTimeout(()=>setMsgErr(''),4000); }
    finally { setGuardando(false); }
  };

  const reactivar = async () => {
    if (!motivo.trim()) return;
    setProcesando(true);
    try {
      const payload = { estatus:'Activo', listaNegra:false, motivoListaNegra:'', montoAdeudado:0 };
      const res  = await fetch(`${API}/api/clientes/${selected._id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMsgOk('Cliente reactivado correctamente.'); setTimeout(()=>setMsgOk(''),3000);
      setModal(false); setMotivo('');
      setSelected(null); fetchLN(busqueda);
    } catch(e) { setMsgErr(e.message); }
    finally { setProcesando(false); }
  };

  const nombreCompleto = selected ? `${selected.apellidoP||''} ${selected.apellidoM||''} ${selected.nombre||''}`.trim() : '';
  const ingresoTotal   = (parseFloat(form.ingresoMensual)||0) + (parseFloat(form.otrosIngresos)||0);
  const gastos         = form.gastos || {};
  const totalGasto     = ['alimento','luz','telefono','transporte','renta','inversion','creditos','otros'].reduce((a,k)=>a+(parseFloat(gastos[k])||0),0);
  const totalDisp      = ingresoTotal - totalGasto;

  const TABS = [
    { label:'Info. General',  icon:User         },
    { label:'Financiero',     icon:DollarSign   },
    { label:'Documentación',  icon:FileText     },
    { label:'Laboral',        icon:Briefcase    },
    { label:'Anotaciones',    icon:MessageSquare},
    { label:'Solicitudes',    icon:FileText     },
    { label:'Créditos',       icon:CreditCard   },
    { label:'Ctas. Ahorro',   icon:PiggyBank    },
  ];

  const TH = ({children}) => <th style={{ padding:'10px 14px', textAlign:'left', fontSize:'11px', fontWeight:'700', color:'#4a6a94', textTransform:'uppercase', letterSpacing:'0.06em', borderBottomWidth:'1px', borderBottomStyle:'solid', borderBottomColor:'#dceaf8', background:'#f4f8fd', whiteSpace:'nowrap' }}>{children}</th>;
  const TD = ({children, mono=false}) => <td style={{ padding:'10px 14px', fontSize:'13px', color:'#1a3d6e', borderBottomWidth:'1px', borderBottomStyle:'solid', borderBottomColor:'#f0f6ff', fontFamily:mono?'monospace':'DM Sans, sans-serif' }}>{children}</td>;

  return (
    <div style={{ maxWidth:'940px', margin:'0 auto', fontFamily:'DM Sans, sans-serif' }}>

      {msgOk  && <div style={{ background:'#dcfce7', borderWidth:'1px', borderStyle:'solid', borderColor:'#86efac', borderRadius:'10px', padding:'11px 16px', marginBottom:'14px', color:'#166534', fontSize:'13px', fontWeight:'600', display:'flex', alignItems:'center', gap:'8px' }}><CheckCircle size={15}/>{msgOk}</div>}
      {msgErr && <div style={{ background:'#fee2e2', borderWidth:'1px', borderStyle:'solid', borderColor:'#fca5a5', borderRadius:'10px', padding:'11px 16px', marginBottom:'14px', color:'#dc2626', fontSize:'13px', fontWeight:'600', display:'flex', alignItems:'center', gap:'8px' }}><AlertCircle size={15}/>{msgErr}</div>}

      {/* ══ LISTA ══ */}
      {!selected && (
        <div style={S.card}>
          {/* Encabezado rojo oscuro */}
          <div style={{ background:'linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)', padding:'26px 28px', textAlign:'center' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', marginBottom:'4px' }}>
              <Slash size={28} color="#fff"/>
              <h2 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:'28px', fontWeight:'700', color:'#fff', margin:0 }}>Lista negra</h2>
            </div>
            <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.75)', margin:0 }}>Clientes bloqueados del sistema</p>
          </div>

          {/* Buscador */}
          <div style={{ padding:'16px 22px', borderBottomWidth:'1px', borderBottomStyle:'solid', borderBottomColor:'#f0f6ff', background:'#fafcff' }}>
            <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
              <div style={{ position:'relative', flex:1 }}>
                <Search size={14} color="#90aac8" style={{ position:'absolute', left:'11px', top:'50%', transform:'translateY(-50%)' }}/>
                <input value={busqueda} onChange={e=>setBusqueda(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleBuscar()}
                  placeholder="Buscar cliente por nombre o numero de cliente"
                  style={{ ...S.input, paddingLeft:'34px' }}/>
              </div>
              <button onClick={handleBuscar} style={{ ...S.btnPrim, background:'#dc2626', boxShadow:'0 4px 14px rgba(220,38,38,0.25)', flexShrink:0 }}>
                {cargando ? <Loader size={14} style={{ animation:'spin 1s linear infinite' }}/> : <Search size={14}/>}
                Buscar
              </button>
            </div>
          </div>

          {/* Tabla */}
          <div style={{ padding:'16px 22px' }}>
            {clientes.length > 0 && (
              <p style={{ fontSize:'13px', color:'#dc2626', marginBottom:'12px', background:'#fff5f5', padding:'9px 14px', borderRadius:'8px', borderWidth:'1px', borderStyle:'solid', borderColor:'#fca5a5', fontWeight:'600' }}>
                <Slash size={13} style={{ display:'inline', marginRight:'6px', verticalAlign:'middle' }}/>
                {clientes.length} cliente{clientes.length!==1?'s':''} en lista negra
              </p>
            )}
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr>
                    <TH>Numero cliente (ID)</TH>
                    <TH>Nombre</TH>
                    <TH>Motivo</TH>
                    <TH></TH>
                    <TH></TH>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((cl, i) => (
                    <tr key={cl._id} style={{ background:i%2===0?'#fff':'#fafcff' }}>
                      <TD mono>{cl.numCliente || i+1}</TD>
                      <TD>
                        <span style={{ fontWeight:'600', textTransform:'uppercase' }}>
                          {cl.apellidoP} {cl.apellidoM} {cl.nombre}
                        </span>
                      </TD>
                      <TD>
                        <span style={{ fontSize:'12px', color:'#dc2626', fontStyle: cl.motivoListaNegra?'normal':'italic' }}>
                          {cl.motivoListaNegra || 'Sin motivo registrado'}
                        </span>
                      </TD>
                      <td style={{ padding:'8px 14px', borderBottomWidth:'1px', borderBottomStyle:'solid', borderBottomColor:'#f0f6ff' }}>
                        <button onClick={()=>seleccionar(cl._id)} style={{ background:'#0e50a0', color:'#fff', border:'none', borderRadius:'7px', padding:'6px 16px', fontSize:'12px', fontWeight:'600', cursor:'pointer' }}>Consultar</button>
                      </td>
                      <td style={{ padding:'8px 14px', borderBottomWidth:'1px', borderBottomStyle:'solid', borderBottomColor:'#f0f6ff' }}>
                        <button onClick={()=>seleccionar(cl._id)} style={{ background:'#e8f2fc', color:'#0e50a0', border:'none', borderRadius:'7px', padding:'6px 16px', fontSize:'12px', fontWeight:'600', cursor:'pointer' }}>Actualizar</button>
                      </td>
                    </tr>
                  ))}
                  {clientes.length===0 && !cargando && (
                    <tr><td colSpan={5} style={{ padding:'40px', textAlign:'center', color:'#90aac8', fontSize:'13px' }}>
                      {busqueda ? 'No se encontraron resultados.' : 'No hay clientes en lista negra.'}
                    </td></tr>
                  )}
                  {cargando && <tr><td colSpan={5} style={{ padding:'30px', textAlign:'center' }}><Loader size={20} color="#dc2626" style={{ animation:'spin 1s linear infinite' }}/></td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══ DETALLE ══ */}
      {selected && (
        <>
          {/* Header */}
          <div style={{ ...S.card, textAlign:'center', padding:'28px 22px' }}>
            <div style={{ width:'100px', height:'100px', borderRadius:'50%', overflow:'hidden', margin:'0 auto 14px', borderWidth:'3px', borderStyle:'solid', borderColor:'#fca5a5', boxShadow:'0 4px 18px rgba(220,38,38,0.15)', cursor:(selected.documentos?.fotoPerfil||selected.fotos?.cliente)?'zoom-in':'default' }}
              onClick={()=>{ const s=selected.documentos?.fotoPerfil||selected.fotos?.cliente; if(s) setZoom({src:s,label:'Foto perfil'}); }}>
              {(selected.documentos?.fotoPerfil||selected.fotos?.cliente)
                ? <img src={selected.documentos?.fotoPerfil||selected.fotos?.cliente} alt="Foto" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                : <div style={{ width:'100%', height:'100%', background:'linear-gradient(135deg,#fee2e2,#fca5a5)', display:'flex', alignItems:'center', justifyContent:'center' }}><User size={42} color="#dc2626"/></div>
              }
            </div>
            <h2 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:'24px', fontWeight:'700', color:'#0a2d5e', margin:'0 0 4px', textTransform:'uppercase' }}>{nombreCompleto}</h2>
            <p style={{ fontSize:'13px', color:'#90aac8', margin:'0 0 2px' }}>ID: <strong style={{ color:'#0e50a0' }}>{selected.numCliente}</strong></p>
            <p style={{ fontSize:'13px', color:'#90aac8', margin:'0 0 14px' }}>Clave cliente: <strong style={{ color:'#0e50a0' }}>{selected.rutaVinculacion||'—'}</strong></p>

            {/* Banner lista negra — igual al sistema original */}
            <div style={{ background:'#dc2626', borderRadius:'8px', padding:'14px 20px', margin:'0 0 18px', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px' }}>
              <Slash size={18} color="#fff"/>
              <span style={{ fontSize:'15px', fontWeight:'700', color:'#fff' }}>Actualmente el cliente se encuentra en la lista negra del sistema</span>
            </div>
            {selected.motivoListaNegra && (
              <p style={{ fontSize:'13px', color:'#dc2626', margin:'0 0 6px', fontWeight:'500' }}>Motivo: {selected.motivoListaNegra}</p>
            )}
            {selected.montoAdeudado>0 && (
              <p style={{ fontSize:'13px', color:'#dc2626', margin:'0 0 14px', fontWeight:'500' }}>Monto adeudado: {fmtMoney(selected.montoAdeudado)}</p>
            )}

            {/* Botones */}
            <div style={{ display:'flex', gap:'10px', justifyContent:'center', flexWrap:'wrap' }}>
              <button onClick={()=>{ setSelected(null); setForm({}); }} style={S.btnSec}>← Volver a lista</button>
              <button onClick={guardar} disabled={guardando} style={S.btnPrim}>
                {guardando ? <><Loader size={13} style={{ animation:'spin 1s linear infinite' }}/> Guardando...</> : <><Save size={13}/> Guardar cambios</>}
              </button>
              <button onClick={()=>setModal(true)} style={S.btnOk}>
                <ShieldCheck size={13}/> Reactivar cliente
              </button>
            </div>
          </div>

          {/* ── PESTAÑAS ── */}
          <div style={S.card}>
            <div style={{ display:'flex', overflowX:'auto', borderBottomWidth:'1px', borderBottomStyle:'solid', borderBottomColor:'#dceaf8', background:'#fafcff' }}>
              {TABS.map(({label,icon:Icon},i) => (
                <button key={i} onClick={()=>setTab(i)} style={{ padding:'12px 16px', border:'none', borderBottomWidth:'3px', borderBottomStyle:'solid', borderBottomColor:tab===i?'#dc2626':'transparent', cursor:'pointer', fontSize:'11px', fontWeight:'700', color:tab===i?'#dc2626':'#90aac8', background:tab===i?'#fff5f5':'transparent', fontFamily:'DM Sans, sans-serif', whiteSpace:'nowrap', letterSpacing:'0.05em', display:'flex', alignItems:'center', gap:'5px', transition:'all 0.15s' }}>
                  <Icon size={12}/> {label}
                </button>
              ))}
            </div>

            <div style={{ padding:'22px' }}>

              {/* TAB 0: INFO GENERAL */}
              {tab===0 && <>
                <SecCard icon={User} title="Clasificación">
                  <Grid min="220px">
                    <Campo label="Tipo cliente"><Inp val={form.tipoCliente} onChange={v=>ch('tipoCliente',v)} opts={['Titular Fisica (persona fisica)','Aval','Titular Moral']}/></Campo>
                    <Campo label="Número único del cliente"><Inp val={String(selected.numCliente||'')} onChange={()=>{}} readOnly/></Campo>
                    <Campo label="Ruta vinculación"><Inp val={form.rutaVinculacion} onChange={v=>ch('rutaVinculacion',v)} opts={RUTAS_DEFAULT}/></Campo>
                    <Campo label="Acceso web socios"><Inp val={form.accesoWeb} onChange={v=>ch('accesoWeb',v)} opts={['SI','NO']} width="100px"/></Campo>
                  </Grid>
                </SecCard>

                <SecCard icon={User} title="Datos personales">
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
                    <Campo label="No. Dependientes"><Inp val={form.numDependientes} onChange={v=>ch('numDependientes',v)} type="number"/></Campo>
                    <Campo label="CURP">
                      <div style={{ display:'flex', gap:'6px' }}>
                        <button style={{ background:'#17a2b8', color:'#fff', border:'none', borderRadius:'7px', padding:'7px 12px', fontSize:'12px', fontWeight:'600', cursor:'pointer', flexShrink:0 }}>Generar</button>
                        <Inp val={form.curp} onChange={v=>ch('curp',v.toUpperCase())}/>
                      </div>
                    </Campo>
                  </Grid>
                </SecCard>

                <SecCard icon={Heart} title="Datos del cónyuge" iconBg="#fce8f0" iconColor="#be185d" defaultOpen={false}>
                  <Grid>
                    <Campo label="Nombre completo"><Inp val={form.conyuge?.nombre} onChange={v=>ch('conyuge.nombre',v)}/></Campo>
                    <Campo label="Teléfono"><Inp val={form.conyuge?.telefono} onChange={v=>ch('conyuge.telefono',v)} type="tel"/></Campo>
                    <Campo label="Nombre del trabajo"><Inp val={form.conyuge?.trabajo} onChange={v=>ch('conyuge.trabajo',v)}/></Campo>
                    <Campo label="Dirección del trabajo"><Inp val={form.conyuge?.direccionTrabajo} onChange={v=>ch('conyuge.direccionTrabajo',v)}/></Campo>
                  </Grid>
                </SecCard>

                <SecCard icon={Users} title="Referencias de contacto" iconBg="#f0e8fc" iconColor="#7c3aed" defaultOpen={false}>
                  {[0,1].map(i=>(
                    <div key={i} style={{ marginBottom:i===0?'16px':0 }}>
                      <div style={{ fontSize:'11px', fontWeight:'700', color:'#7c3aed', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'10px' }}>Referencia {i+1}</div>
                      <Grid>
                        <Campo label="Nombre"><Inp val={form.referencias?.[i]?.nombre||''} onChange={v=>chRef(i,'nombre',v)}/></Campo>
                        <Campo label="Teléfono"><Inp val={form.referencias?.[i]?.telefono||''} onChange={v=>chRef(i,'telefono',v)} type="tel"/></Campo>
                        <Campo label="Domicilio"><Inp val={form.referencias?.[i]?.domicilio||''} onChange={v=>chRef(i,'domicilio',v)}/></Campo>
                      </Grid>
                    </div>
                  ))}
                </SecCard>

                <SecCard icon={MapPin} title="Domicilio" defaultOpen={false}>
                  {/* Historial con botón Ver */}
                  <div style={{ background:'#fafae8', borderWidth:'1px', borderStyle:'solid', borderColor:'#e5e080', borderRadius:'10px', padding:'14px', marginBottom:'18px' }}>
                    <div style={{ fontSize:'13px', fontWeight:'700', color:'#6b5a00', marginBottom:'10px' }}>Direcciones registradas del cliente</div>
                    <div style={{ overflowX:'auto' }}>
                      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'12px' }}>
                        <thead>
                          <tr style={{ background:'#0e50a0' }}>
                            {['Fecha Agregada','CP','Estado','Municipio','Colonia','Calle','No. Ext',''].map(h=>(
                              <th key={h} style={{ padding:'8px 10px', textAlign:'left', fontWeight:'700', color:'#fff', borderBottomWidth:'1px', borderBottomStyle:'solid', borderBottomColor:'#0a3d7a', whiteSpace:'nowrap' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {selected.updatedAt && (
                            <tr>
                              {[fmtFecha(selected.updatedAt), selected.cp||'—', selected.estado||'—', selected.municipio||'—', selected.colonia||'—', selected.calle||'—', selected.numExt||'—'].map((v,j)=>(
                                <td key={j} style={{ padding:'8px 10px', borderBottomWidth:'1px', borderBottomStyle:'solid', borderBottomColor:'#eee', fontSize:'12px' }}>{v}</td>
                              ))}
                              <td style={{ padding:'8px 10px', borderBottomWidth:'1px', borderBottomStyle:'solid', borderBottomColor:'#eee' }}>
                                <button style={{ background:'#17a2b8', color:'#fff', border:'none', borderRadius:'5px', padding:'4px 14px', fontSize:'12px', fontWeight:'600', cursor:'pointer' }}>Ver</button>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <Grid>
                    <Campo label="Código postal">
                      <div style={{ display:'flex', gap:'6px' }}>
                        <Inp val={form.cp} onChange={v=>ch('cp',v)} width="110px"/>
                        <button style={{ background:'#17a2b8', color:'#fff', border:'none', borderRadius:'7px', padding:'7px 12px', fontSize:'12px', fontWeight:'600', cursor:'pointer' }}>BUSCAR</button>
                      </div>
                    </Campo>
                    <Campo label="Calle"><Inp val={form.calle} onChange={v=>ch('calle',v)}/></Campo>
                    <Campo label="No. Exterior"><Inp val={form.numExt} onChange={v=>ch('numExt',v)}/></Campo>
                    <Campo label="No. Interior"><Inp val={form.numInt} onChange={v=>ch('numInt',v)}/></Campo>
                    <Campo label="Entre calles"><Inp val={form.entreCalles1} onChange={v=>ch('entreCalles1',v)}/></Campo>
                    <Campo label="Y de"><Inp val={form.entreCalles2} onChange={v=>ch('entreCalles2',v)}/></Campo>
                    <Campo label="Colonia"><Inp val={form.colonia} onChange={v=>ch('colonia',v)}/></Campo>
                    <Campo label="Municipio"><Inp val={form.municipio} onChange={v=>ch('municipio',v)}/></Campo>
                    <Campo label="Estado"><Inp val={form.estado} onChange={v=>ch('estado',v)} opts={ESTADOS_MX}/></Campo>
                  </Grid>
                </SecCard>
              </>}

              {/* TAB 1: FINANCIERO */}
              {tab===1 && <>
                <SecCard icon={DollarSign} title="Ingresos">
                  <Grid min="200px">
                    <Campo label="Ingreso mensual"><input type="number" value={form.ingresoMensual||''} onChange={e=>ch('ingresoMensual',e.target.value)} style={S.input}/></Campo>
                    <Campo label="Otros ingresos"><input type="number" value={form.otrosIngresos||''} onChange={e=>ch('otrosIngresos',e.target.value)} style={S.input}/></Campo>
                    <Campo label="Ingreso total"><input readOnly value={ingresoTotal} style={{...S.inputRO,fontWeight:'700',color:'#0e50a0'}}/></Campo>
                  </Grid>
                </SecCard>
                <SecCard icon={DollarSign} title="Gastos mensuales" iconBg="#fef3c7" iconColor="#d97706">
                  <Grid min="160px">
                    {[['Alimento','alimento'],['Luz','luz'],['Teléfono','telefono'],['Transporte','transporte'],['Renta','renta'],['Inversión','inversion'],['Créditos','creditos'],['Otros','otros']].map(([l,k])=>(
                      <Campo key={k} label={l}><input type="number" value={gastos[k]||''} onChange={e=>ch(`gastos.${k}`,e.target.value)} style={S.input}/></Campo>
                    ))}
                  </Grid>
                  <div style={{ display:'flex', gap:'20px', marginTop:'14px', flexWrap:'wrap' }}>
                    <Campo label="Total gasto"><input readOnly value={fmtMoney(totalGasto)} style={{...S.inputRO,color:'#dc2626',fontWeight:'700',width:'160px'}}/></Campo>
                    <Campo label="Disponible mensual"><input readOnly value={fmtMoney(totalDisp)} style={{...S.inputRO,color:totalDisp>=0?'#166534':'#dc2626',fontWeight:'700',width:'160px'}}/></Campo>
                  </div>
                </SecCard>
              </>}

              {/* TAB 2: DOCUMENTACIÓN */}
              {tab===2 && <>
                {[
                  ['Comprobante de domicilio', 'documentos.comprobanteDomicilio'],
                  ['Comprobante de ingresos',  'documentos.comprobanteIngresos'],
                  ['Identificación oficial',   'documentos.identificacion'],
                  ['Fotografía de perfil',     'documentos.fotoPerfil'],
                  ['Acta de nacimiento',       'documentos.actaNacimiento'],
                  ['CURP (documento)',         'documentos.curpDoc'],
                  ['Fachada de casa',          'documentos.fachadaCasa'],
                  ['Fachada de negocio',       'documentos.fachadaNegocio'],
                ].map(([label, path]) => {
                  const [obj, key] = path.split('.');
                  return <DocRow key={label} label={label} value={form[obj]?.[key]||''} onChange={v=>ch(path,v)}/>;
                })}
                {[['Foto perfil',form.documentos?.fotoPerfil||form.fotos?.cliente],['Fachada casa',form.documentos?.fachadaCasa||form.fotos?.casa],['Fachada negocio',form.documentos?.fachadaNegocio||form.fotos?.negocio]].filter(([,s])=>s&&s.length>10).length>0 && (
                  <div style={{ marginTop:'20px', display:'flex', gap:'16px', flexWrap:'wrap' }}>
                    {[['Foto perfil',form.documentos?.fotoPerfil||form.fotos?.cliente],['Fachada casa',form.documentos?.fachadaCasa||form.fotos?.casa],['Fachada negocio',form.documentos?.fachadaNegocio||form.fotos?.negocio]].filter(([,src])=>src&&src.length>10).map(([label,src])=>(
                      <div key={label} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'6px' }}>
                        <div onClick={()=>setZoom({src,label})} style={{ width:'80px', height:'80px', borderRadius:'10px', overflow:'hidden', cursor:'zoom-in', borderWidth:'2px', borderStyle:'solid', borderColor:'#fca5a5' }}>
                          <img src={src} alt={label} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                        </div>
                        <span style={{ fontSize:'10px', color:'#4a6a94', fontWeight:'600' }}>{label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>}

              {/* TAB 3: LABORAL */}
              {tab===3 && (
                <SecCard icon={Briefcase} title="Datos laborales">
                  <Grid>
                    <Campo label="Fuente de ingresos"><Inp val={form.fuenteIngresos} onChange={v=>ch('fuenteIngresos',v)} opts={['Empleo formal','Negocio propio','Pensionado','Honorarios','Otro']}/></Campo>
                    <Campo label="Empresa"><Inp val={form.empresa} onChange={v=>ch('empresa',v)}/></Campo>
                    <Campo label="RFC empresa"><Inp val={form.rfcEmpresa} onChange={v=>ch('rfcEmpresa',v.toUpperCase())}/></Campo>
                    <Campo label="Ocupación"><Inp val={form.ocupacion} onChange={v=>ch('ocupacion',v)}/></Campo>
                  </Grid>
                </SecCard>
              )}

              {/* TAB 4: ANOTACIONES */}
              {tab===4 && <div style={{ textAlign:'center', padding:'50px', color:'#90aac8' }}><MessageSquare size={40} color="#dceaf8"/><p style={{ marginTop:'12px' }}>Sin anotaciones.</p></div>}

              {/* TAB 5: SOLICITUDES */}
              {tab===5 && (
                Array.isArray(solicitudes)&&solicitudes.length>0
                  ? <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse'}}>
                      <thead><tr>{['Folio','Producto','Monto','Estatus','Fecha'].map(h=><TH key={h}>{h}</TH>)}</tr></thead>
                      <tbody>{solicitudes.map((s,i)=><tr key={s._id} style={{background:i%2===0?'#fff':'#fafcff'}}>
                        <TD mono>{s._id?.slice(-6)}</TD><TD>{s.producto||'—'}</TD><TD>{fmtMoney(s.monto)}</TD>
                        <TD><span style={{background:'#fef3c7',color:'#92400e',padding:'2px 10px',borderRadius:'20px',fontSize:'11px',fontWeight:'700'}}>{s.estatus}</span></TD>
                        <TD>{s.fecha||fmtFecha(s.createdAt)}</TD>
                      </tr>)}</tbody>
                    </table></div>
                  : <div style={{textAlign:'center',padding:'50px',color:'#90aac8'}}><FileText size={40} color="#dceaf8"/><p style={{marginTop:'12px'}}>Sin solicitudes.</p></div>
              )}

              {/* TAB 6: CRÉDITOS */}
              {tab===6 && (
                Array.isArray(creditos)&&creditos.length>0
                  ? <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse'}}>
                      <thead><tr>{['Folio','Producto','Monto','Saldo','Estatus'].map(h=><TH key={h}>{h}</TH>)}</tr></thead>
                      <tbody>{creditos.map((c,i)=><tr key={c._id} style={{background:i%2===0?'#fff':'#fafcff'}}>
                        <TD mono>{c.folio||c._id?.slice(-6)}</TD><TD>{c.producto||'—'}</TD>
                        <TD>{fmtMoney(c.monto)}</TD><TD>{fmtMoney(c.saldo)}</TD>
                        <TD><span style={{background:'#fee2e2',color:'#dc2626',padding:'2px 10px',borderRadius:'20px',fontSize:'11px',fontWeight:'700'}}>{c.estatus}</span></TD>
                      </tr>)}</tbody>
                    </table></div>
                  : <div style={{textAlign:'center',padding:'50px',color:'#90aac8'}}><CreditCard size={40} color="#dceaf8"/><p style={{marginTop:'12px'}}>Sin créditos.</p></div>
              )}

              {/* TAB 7: CUENTAS */}
              {tab===7 && (
                Array.isArray(cuentas)&&cuentas.length>0
                  ? <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse'}}>
                      <thead><tr>{['Folio','Producto','Saldo','Estatus'].map(h=><TH key={h}>{h}</TH>)}</tr></thead>
                      <tbody>{cuentas.map((c,i)=><tr key={c._id} style={{background:i%2===0?'#fff':'#fafcff'}}>
                        <TD mono>{c.folio||c._id?.slice(-6)}</TD><TD>{c.producto||'—'}</TD>
                        <TD>{fmtMoney(c.saldo)}</TD>
                        <TD><span style={{background:'#f3f4f6',color:'#6b7280',padding:'2px 10px',borderRadius:'20px',fontSize:'11px',fontWeight:'700'}}>{c.estatus}</span></TD>
                      </tr>)}</tbody>
                    </table></div>
                  : <div style={{textAlign:'center',padding:'50px',color:'#90aac8'}}><PiggyBank size={40} color="#dceaf8"/><p style={{marginTop:'12px'}}>Sin cuentas.</p></div>
              )}

            </div>
          </div>
        </>
      )}

      {/* Modal reactivar */}
      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'20px' }}>
          <div style={{ background:'#fff', borderRadius:'16px', padding:'28px', maxWidth:'400px', width:'100%', boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px' }}>
              <ShieldCheck size={22} color="#166534"/>
              <h3 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:'20px', fontWeight:'700', color:'#0a2d5e', margin:0 }}>Reactivar cliente</h3>
            </div>
            <p style={{ fontSize:'13px', color:'#4a6a94', margin:'0 0 18px' }}>{nombreCompleto}</p>
            <label style={{ ...S.label, display:'block', marginBottom:'5px' }}>Motivo de reactivación *</label>
            <textarea value={motivo} onChange={e=>setMotivo(e.target.value)} rows={3}
              style={{ ...S.input, resize:'vertical', marginBottom:'20px' }}
              placeholder="Describe el motivo de reactivación..."/>
            <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end' }}>
              <button onClick={()=>{ setModal(false); setMotivo(''); }} style={S.btnSec}>Cancelar</button>
              <button onClick={reactivar} disabled={!motivo.trim()||procesando}
                style={{ ...S.btnOk, opacity:!motivo.trim()?0.6:1, cursor:!motivo.trim()?'not-allowed':'pointer' }}>
                {procesando && <Loader size={12} style={{ animation:'spin 1s linear infinite' }}/>}
                Confirmar reactivación
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