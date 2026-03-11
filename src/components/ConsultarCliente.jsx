'use client';
import React, { useState, useEffect } from 'react';
import {
  Search, User, ChevronDown, ChevronUp, AlertCircle, Loader,
  X, CheckCircle, Save, ShieldOff, ShieldCheck, Slash, Eye,
  FileText, DollarSign, Briefcase, MessageSquare, CreditCard, PiggyBank
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://fiem-backend-production.up.railway.app';

const ESTADOS_MX = ['Aguascalientes','Baja California','Baja California Sur','Campeche','Chiapas','Chihuahua','Ciudad de Mexico','Coahuila de Zaragoza','Colima','Distrito Federal','Durango','Guanajuato','Guerrero','Hidalgo','Jalisco','Mexico','Michoacan','Morelos','Nayarit','Nuevo Leon','Oaxaca','Puebla','Queretaro','Quintana Roo','San Luis Potosi','Sinaloa','Sonora','Tabasco','Tamaulipas','Tlaxcala','Veracruz','Yucatan','Zacatecas'];
const RUTAS_DEFAULT = ['Apaxco Sucursal-Apaxco','Tequix Sucursal-tequix','Huehue sucursal-Huehuetoca','Temas Sucursal-Temascalapa','Tizayuca 1 Sucursal-tizayuca1','OFC-CTRAL OFICINA CENTRAL','01-sucursa 01-sucursal-tula','01 Legal','01 Ajoloapan','01 APAXCO-2','02 TEOLOYUCAN'];

const fmtFecha = v => { if (!v) return '—'; try { return new Date(v).toLocaleDateString('es-MX',{day:'2-digit',month:'2-digit',year:'numeric'}); } catch { return v; } };
const fmtMoney = v => v ? `$${Number(v).toLocaleString('es-MX',{minimumFractionDigits:2})}` : '$0.00';

// ── Input simple ──
const Inp = ({val, onChange, type='text', opts, placeholder='', readOnly=false, width='100%'}) => {
  const s = { border:'1px solid #ccc', borderRadius:'3px', padding:'4px 8px', fontSize:'13px', fontFamily:'DM Sans, sans-serif', color:'#222', outline:'none', background: readOnly?'#f5f5f5':'#fff', width, boxSizing:'border-box' };
  if (opts) return <select value={val||''} onChange={e=>onChange(e.target.value)} style={{...s,cursor:'pointer'}}><option value="">-Elige-</option>{opts.map(o=><option key={o} value={o}>{o}</option>)}</select>;
  return <input type={type} value={val||''} onChange={readOnly?undefined:e=>onChange(e.target.value)} readOnly={readOnly} placeholder={placeholder} style={s}/>;
};

// ── Fila label + input ──
const Row = ({label, children, width='160px'}) => (
  <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px'}}>
    <span style={{fontSize:'13px', color:'#333', minWidth:width, flexShrink:0}}>{label}:</span>
    {children}
  </div>
);

// ── Documento fila ──
function DocRow({label, value, onChange}) {
  const ref = typeof window !== 'undefined' ? require('react').useRef() : {current:null};
  return (
    <div style={{display:'flex', alignItems:'center', gap:'12px', padding:'10px 0', borderBottomWidth:'1px', borderBottomStyle:'solid', borderBottomColor:'#f0f6ff'}}>
      <span style={{fontSize:'13px', color:'#1a3d6e', flex:1}}>{label}</span>
      <input ref={ref} type="file" accept="image/*,application/pdf" style={{display:'none'}}
        onChange={e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>onChange(ev.target.result);r.readAsDataURL(f);}}/>
      {value
        ? <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
            <span style={{fontSize:'12px',color:'#0e50a0',fontWeight:'600',background:'#e8f2fc',padding:'3px 10px',borderRadius:'20px'}}>Cargado</span>
            <button onClick={()=>onChange('')} style={{background:'none',border:'none',cursor:'pointer',color:'#ef4444',display:'flex'}}><X size={14}/></button>
          </div>
        : <button onClick={()=>ref.current?.click()} style={{background:'#17a2b8',color:'#fff',border:'none',borderRadius:'4px',padding:'5px 14px',fontSize:'12px',cursor:'pointer'}}>Seleccionar archivo</button>
      }
      {!value && <span style={{fontSize:'12px',color:'#999'}}>Ningún archivo seleccionado</span>}
    </div>
  );
}

// ── Foto zoom lightbox ──
function Lightbox({src, label, onClose}) {
  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',zIndex:2000,cursor:'zoom-out',padding:'20px'}}>
      <button onClick={onClose} style={{position:'fixed',top:'20px',right:'24px',background:'rgba(255,255,255,0.15)',border:'none',borderRadius:'50%',width:'40px',height:'40px',cursor:'pointer',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center'}}><X size={18}/></button>
      <div style={{fontSize:'13px',color:'rgba(255,255,255,0.7)',marginBottom:'12px',fontWeight:'600'}}>{label}</div>
      <img src={src} alt={label} onClick={e=>e.stopPropagation()} style={{maxWidth:'90vw',maxHeight:'80vh',borderRadius:'12px',objectFit:'contain'}}/>
    </div>
  );
}

export default function ConsultarCliente() {
  const [busqueda,   setBusqueda]   = useState('');
  const [numCliente, setNumCliente] = useState('');
  const [clientes,   setClientes]   = useState([]);
  const [selected,   setSelected]   = useState(null);
  const [form,       setForm]       = useState({});
  const [cargando,   setCargando]   = useState(false);
  const [guardando,  setGuardando]  = useState(false);
  const [msgOk,      setMsgOk]      = useState('');
  const [msgErr,     setMsgErr]     = useState('');
  const [tab,        setTab]        = useState(0);
  const [zoom,       setZoom]       = useState(null);
  const [modalBaja,  setModalBaja]  = useState(false);
  const [motivoBaja, setMotivoBaja] = useState('');
  const [montoBaja,  setMontoBaja]  = useState('');
  const [procesando, setProcesando] = useState(false);
  const [solicitudes,setSolicitudes]= useState([]);
  const [creditos,   setCreditos]   = useState([]);
  const [cuentas,    setCuentas]    = useState([]);
  const [totalGlobal,setTotalGlobal]= useState(0);

  useEffect(() => { fetchClientes(); }, []);

  const fetchClientes = async (q='', num='') => {
    setCargando(true);
    try {
      let url = `${API}/api/clientes`;
      const termino = q || num;
      if (termino) url += `?busqueda=${encodeURIComponent(termino)}`;
      const res  = await fetch(url);
      const data = await res.json();
      // Nuevo formato: { total, clientes } o array legacy
      if (data && data.clientes) {
        setTotalGlobal(data.total || 0);
        setClientes(data.clientes);
      } else {
        setClientes(Array.isArray(data) ? data : []);
        setTotalGlobal(Array.isArray(data) ? data.length : 0);
      }
    } catch(e) { setMsgErr('Error al cargar clientes'); }
    finally { setCargando(false); }
  };

  const handleBuscar = () => fetchClientes(busqueda, numCliente);

  const seleccionar = async (id) => {
    setCargando(true); setTab(0);
    try {
      const res  = await fetch(`${API}/api/clientes/${id}`);
      const data = await res.json();
      setSelected(data);
      // Normalizar subobjetos
      setForm({
        ...data,
        conyuge:             data.conyuge             || {},
        gastos:              data.gastos              || {},
        documentos:          data.documentos          || {},
        domicilioLaboral:    data.domicilioLaboral    || {},
        estudioSocioeconomico: data.estudioSocioeconomico || { electrodomesticos:{} },
        referencias:         data.referencias         || [],
      });
      // Cargar datos relacionados
      const [solRes, credRes, cuentasRes] = await Promise.all([
        fetch(`${API}/api/solicitudes?clienteId=${id}`),
        fetch(`${API}/api/creditos?clienteId=${id}`),
        fetch(`${API}/api/cuentas-ahorro?clienteId=${id}`),
      ]);
      setSolicitudes(await solRes.json().catch(()=>[]));
      setCreditos(await credRes.json().catch(()=>[]));
      setCuentas(await cuentasRes.json().catch(()=>[]));
    } catch(e) { setMsgErr('Error al cargar cliente'); }
    finally { setCargando(false); }
  };

  const ch = (path, val) => {
    setForm(prev => {
      const parts = path.split('.');
      if (parts.length === 1) return {...prev, [path]: val};
      if (parts.length === 2) return {...prev, [parts[0]]: {...(prev[parts[0]]||{}), [parts[1]]: val}};
      if (parts.length === 3) return {...prev, [parts[0]]: {...(prev[parts[0]]||{}), [parts[1]]: {...((prev[parts[0]]||{})[parts[1]]||{}), [parts[2]]: val}}};
      return prev;
    });
  };

  const chRef = (i, field, val) => {
    setForm(prev => {
      const refs = [...(prev.referencias||[])];
      refs[i] = {...(refs[i]||{}), [field]: val};
      return {...prev, referencias: refs};
    });
  };

  const guardar = async () => {
    setGuardando(true);
    try {
      const res  = await fetch(`${API}/api/clientes/${selected._id}`, {
        method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error||'Error');
      setSelected(data);
      setMsgOk('Cliente actualizado correctamente.');
      setTimeout(()=>setMsgOk(''), 3000);
      fetchClientes(busqueda);
    } catch(e) { setMsgErr(e.message); setTimeout(()=>setMsgErr(''), 4000); }
    finally { setGuardando(false); }
  };

  const confirmarBaja = async () => {
    if (!motivoBaja.trim()) return;
    setProcesando(true);
    try {
      const esLN = selected.estatus === 'Lista negra';
      const payload = { estatus: esLN?'Activo':'Lista negra', listaNegra:!esLN, motivoListaNegra: esLN?'':motivoBaja, montoAdeudado: esLN?0:(parseFloat(montoBaja)||0) };
      const res  = await fetch(`${API}/api/clientes/${selected._id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSelected(data); setForm(f=>({...f,...payload}));
      setModalBaja(false); setMotivoBaja(''); setMontoBaja('');
      setMsgOk(esLN ? 'Cliente reactivado.' : 'Cliente enviado a lista negra.');
      setTimeout(()=>setMsgOk(''), 3000);
      fetchClientes(busqueda);
    } catch(e) { setMsgErr(e.message); }
    finally { setProcesando(false); }
  };

  const numTotal = totalGlobal || clientes.length;
  const nombreCompleto = selected ? `${selected.apellidoP||''} ${selected.apellidoM||''} ${selected.nombre||''}`.trim() : '';

  // Cálculos financieros
  const ingresoTotal    = (parseFloat(form.ingresoMensual)||0) + (parseFloat(form.otrosIngresos)||0);
  const gastos          = form.gastos || {};
  const totalGasto      = ['alimento','luz','telefono','transporte','renta','inversion','creditos','otros'].reduce((a,k)=>a+(parseFloat(gastos[k])||0),0);
  const totalDisponible = ingresoTotal - totalGasto;

  const TABS = [
    {label:'INFORMACION GENERAL',    icon:User},
    {label:'INFORMACION FINANCIERA', icon:DollarSign},
    {label:'DOCUMENTACION DIGITAL',  icon:FileText},
    {label:'INFORMACION LABORAL',    icon:Briefcase},
    {label:'ANOTACIONES',            icon:MessageSquare},
    {label:'SOLICITUDES',            icon:FileText},
    {label:'CREDITOS',               icon:CreditCard},
    {label:'CUENTAS AHORRO',         icon:PiggyBank},
  ];

  // ── Estilos comunes ──
  const card = {background:'#fff', borderRadius:'14px', borderWidth:'1px', borderStyle:'solid', borderColor:'#dceaf8', boxShadow:'0 2px 10px rgba(14,80,160,0.05)', marginBottom:'16px', overflow:'hidden'};
  const secHead = {padding:'12px 20px', borderBottomWidth:'1px', borderBottomStyle:'solid', borderBottomColor:'#f0f6ff', fontFamily:"'Cormorant Garamond', serif", fontSize:'15px', fontWeight:'700', color:'#0a2d5e', background:'#f8fbff'};
  const secBody = {padding:'16px 20px'};
  const tblHead = {background:'#c8dfc8', padding:'8px 12px', fontSize:'13px', fontWeight:'700', color:'#333', textAlign:'left', borderBottomWidth:'1px', borderBottomStyle:'solid', borderBottomColor:'#aaa'};
  const tblCell = {padding:'9px 12px', fontSize:'13px', color:'#222', borderBottomWidth:'1px', borderBottomStyle:'solid', borderBottomColor:'#eee'};

  return (
    <div style={{maxWidth:'960px', margin:'0 auto', fontFamily:'DM Sans, sans-serif'}}>

      {/* Alertas */}
      {msgOk  && <div style={{background:'#dcfce7',border:'1px solid #86efac',borderRadius:'10px',padding:'11px 16px',marginBottom:'14px',color:'#166534',fontSize:'13px',fontWeight:'600',display:'flex',alignItems:'center',gap:'8px'}}><CheckCircle size={15}/>{msgOk}</div>}
      {msgErr && <div style={{background:'#fee2e2',border:'1px solid #fca5a5',borderRadius:'10px',padding:'11px 16px',marginBottom:'14px',color:'#dc2626',fontSize:'13px',fontWeight:'600',display:'flex',alignItems:'center',gap:'8px'}}><AlertCircle size={15}/>{msgErr}</div>}

      {/* ── LISTA DE CLIENTES ── */}
      {!selected && (
        <div style={card}>
          <div style={{padding:'20px', textAlign:'center', borderBottomWidth:'1px', borderBottomStyle:'solid', borderBottomColor:'#f0f6ff'}}>
            <h2 style={{fontFamily:"'Cormorant Garamond', serif", fontSize:'26px', fontWeight:'700', color:'#0a2d5e', margin:'0 0 4px'}}>Clientes activos</h2>
            <p style={{fontSize:'13px', color:'#4a6a94', margin:0}}>Al tener puesto de Dirección General tienes acceso a toda la información</p>
          </div>

          {/* Buscador */}
          <div style={{padding:'16px 20px', display:'flex', gap:'10px', alignItems:'center', flexWrap:'wrap', borderBottomWidth:'1px', borderBottomStyle:'solid', borderBottomColor:'#f0f6ff'}}>
            <input value={busqueda} onChange={e=>setBusqueda(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleBuscar()}
              placeholder="Nombre o apellidos"
              style={{border:'1px solid #ccc',borderRadius:'4px',padding:'6px 12px',fontSize:'13px',fontFamily:'DM Sans, sans-serif',outline:'none',width:'180px'}}/>
            <span style={{fontSize:'13px',color:'#666'}}>o intente con</span>
            <input value={numCliente} onChange={e=>setNumCliente(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleBuscar()}
              placeholder="Numero cliente"
              style={{border:'1px solid #ccc',borderRadius:'4px',padding:'6px 12px',fontSize:'13px',fontFamily:'DM Sans, sans-serif',outline:'none',width:'160px'}}/>
            <button onClick={handleBuscar} style={{background:'#0e50a0',color:'#fff',border:'none',borderRadius:'6px',padding:'7px 20px',fontSize:'13px',fontWeight:'600',cursor:'pointer',display:'flex',alignItems:'center',gap:'6px'}}>
              {cargando ? <Loader size={14} style={{animation:'spin 1s linear infinite'}}/> : <Search size={14}/>} Realizar búsqueda
            </button>
          </div>

          {/* Tabla */}
          <div style={{padding:'16px 20px'}}>
            {numTotal > 0 && (
              <p style={{fontSize:'13px',color:'#555',marginBottom:'12px'}}>
                Existen <strong>{numTotal}</strong> clientes en tu cartera, solo se muestran los últimos 5 recientes para acelerar la carga
              </p>
            )}
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead>
                  <tr>
                    <th style={tblHead}>Numero cliente (ID)</th>
                    <th style={tblHead}>Clave cliente<br/><span style={{fontWeight:'400',fontSize:'11px'}}>Gerencia-ruta-#socio</span></th>
                    <th style={tblHead}>Nombre</th>
                    <th style={tblHead}></th>
                    <th style={tblHead}></th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.slice(0,5).map((cl,i) => (
                    <tr key={cl._id} style={{background:i%2===0?'#fff':'#f9f9f9'}}>
                      <td style={tblCell}>{cl.numCliente || clientes.length - i}</td>
                      <td style={tblCell}>{cl.rutaVinculacion||'—'}</td>
                      <td style={{...tblCell,fontWeight:'500',textTransform:'uppercase'}}>{cl.apellidoP} {cl.apellidoM} {cl.nombre}</td>
                      <td style={{...tblCell,width:'100px'}}>
                        <button onClick={()=>seleccionar(cl._id)} style={{background:'#17a2b8',color:'#fff',border:'none',borderRadius:'4px',padding:'5px 14px',fontSize:'12px',cursor:'pointer',fontWeight:'600'}}>Consultar</button>
                      </td>
                      <td style={{...tblCell,width:'100px'}}>
                        <button onClick={()=>seleccionar(cl._id)} style={{background:'#6c757d',color:'#fff',border:'none',borderRadius:'4px',padding:'5px 14px',fontSize:'12px',cursor:'pointer',fontWeight:'600'}}>Actualizar</button>
                      </td>
                    </tr>
                  ))}
                  {clientes.length === 0 && !cargando && (
                    <tr><td colSpan={5} style={{...tblCell,textAlign:'center',color:'#999'}}>No se encontraron clientes</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── DETALLE DEL CLIENTE ── */}
      {selected && (
        <div>
          {/* Header con foto */}
          <div style={{...card, textAlign:'center', padding:'24px'}}>
            <div style={{width:'100px',height:'100px',borderRadius:'50%',overflow:'hidden',margin:'0 auto 12px',border:'3px solid #dceaf8',cursor: (selected.documentos?.fotoPerfil||selected.fotos?.cliente)?'zoom-in':'default'}}
              onClick={()=>{ const s=selected.documentos?.fotoPerfil||selected.fotos?.cliente; if(s) setZoom({src:s,label:'Foto de perfil'}); }}>
              {(selected.documentos?.fotoPerfil||selected.fotos?.cliente)
                ? <img src={selected.documentos?.fotoPerfil||selected.fotos?.cliente} alt="Foto" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                : <div style={{width:'100%',height:'100%',background:'#e8f2fc',display:'flex',alignItems:'center',justifyContent:'center'}}><User size={40} color="#90aac8"/></div>
              }
            </div>
            <h2 style={{fontFamily:"'Cormorant Garamond', serif",fontSize:'22px',fontWeight:'700',color:'#0a2d5e',margin:'0 0 2px',textTransform:'uppercase'}}>{nombreCompleto}</h2>
            <p style={{fontSize:'13px',color:'#4a6a94',margin:'0 0 2px'}}>{selected.numCliente || ''}</p>
            <p style={{fontSize:'13px',color:'#4a6a94',margin:'0 0 14px'}}>Clave cliente: {selected.rutaVinculacion||'—'}</p>
            {/* Botones acción */}
            <div style={{display:'flex',gap:'8px',justifyContent:'center',flexWrap:'wrap'}}>
              <button onClick={()=>{setSelected(null);setForm({});}} style={{background:'#e8f2fc',color:'#0e50a0',border:'none',borderRadius:'8px',padding:'8px 18px',fontSize:'13px',fontWeight:'600',cursor:'pointer'}}>← Volver a lista</button>
              <button onClick={guardar} disabled={guardando} style={{background:'#0e50a0',color:'#fff',border:'none',borderRadius:'8px',padding:'8px 20px',fontSize:'13px',fontWeight:'600',cursor:'pointer',display:'flex',alignItems:'center',gap:'6px',boxShadow:'0 4px 14px rgba(14,80,160,0.25)'}}>
                {guardando ? <><Loader size={13} style={{animation:'spin 1s linear infinite'}}/> Guardando...</> : <><Save size={13}/> Guardar cambios</>}
              </button>
              <button onClick={()=>setModalBaja(true)} style={{background:selected.estatus==='Lista negra'?'#dcfce7':'#fee2e2',color:selected.estatus==='Lista negra'?'#166534':'#dc2626',border:'none',borderRadius:'8px',padding:'8px 18px',fontSize:'13px',fontWeight:'600',cursor:'pointer',display:'flex',alignItems:'center',gap:'6px'}}>
                {selected.estatus==='Lista negra' ? <><ShieldCheck size={13}/> Reactivar</> : <><ShieldOff size={13}/> Lista negra</>}
              </button>
            </div>
          </div>

          {/* Alerta lista negra */}
          {selected.estatus==='Lista negra' && (
            <div style={{background:'#fee2e2',borderWidth:'1px',borderStyle:'solid',borderColor:'#fca5a5',borderRadius:'10px',padding:'12px 16px',marginBottom:'14px',display:'flex',gap:'10px',alignItems:'flex-start'}}>
              <Slash size={15} color="#dc2626" style={{flexShrink:0,marginTop:'2px'}}/>
              <div><strong style={{color:'#dc2626',fontSize:'13px'}}>Cliente en lista negra</strong>
                {selected.motivoListaNegra && <div style={{fontSize:'12px',color:'#ef4444'}}>Motivo: {selected.motivoListaNegra}</div>}
                {selected.montoAdeudado>0 && <div style={{fontSize:'12px',color:'#ef4444'}}>Adeudo: {fmtMoney(selected.montoAdeudado)}</div>}
              </div>
            </div>
          )}

          {/* ── PESTAÑAS ── */}
          <div style={{...card, overflow:'hidden'}}>
            <div style={{display:'flex', overflowX:'auto', borderBottomWidth:'1px', borderBottomStyle:'solid', borderBottomColor:'#ddd'}}>
              {TABS.map(({label},i) => (
                <button key={i} onClick={()=>setTab(i)} style={{padding:'10px 16px',border:'none',borderBottomWidth:'3px',borderBottomStyle:'solid',borderBottomColor:tab===i?'#0e50a0':'transparent',cursor:'pointer',fontSize:'11px',fontWeight:'700',color:tab===i?'#0e50a0':'#666',background:tab===i?'#f0f7ff':'transparent',fontFamily:'DM Sans, sans-serif',whiteSpace:'nowrap',letterSpacing:'0.04em'}}>
                  {label}
                </button>
              ))}
            </div>

            <div style={{padding:'20px'}}>

              {/* ══ TAB 0: INFORMACION GENERAL ══ */}
              {tab===0 && <>
                {/* Clasificación */}
                <div style={{marginBottom:'16px'}}>
                  <Row label="Tipo cliente" width="180px">
                    <Inp val={form.tipoCliente} onChange={v=>ch('tipoCliente',v)} opts={['Titular Fisica','Aval','Titular Moral']}/>
                  </Row>
                  <Row label="Numero único del cliente" width="180px">
                    <Inp val={String(selected.numCliente || '')} onChange={()=>{}} readOnly width="120px"/>
                  </Row>
                  <Row label="Ruta vinculacion" width="180px">
                    <Inp val={form.rutaVinculacion} onChange={v=>ch('rutaVinculacion',v)} opts={RUTAS_DEFAULT}/>
                  </Row>
                  <Row label="Permitir acceso cliente en la web de socios" width="300px">
                    <Inp val={form.accesoWeb} onChange={v=>ch('accesoWeb',v)} opts={['SI','NO']} width="80px"/>
                  </Row>
                </div>
                <hr style={{border:'none',borderTopWidth:'1px',borderTopStyle:'solid',borderTopColor:'#eee',margin:'14px 0'}}/>

                {/* Datos personales 2 columnas */}
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'2px 40px'}}>
                  <Row label="Apellido Paterno"><Inp val={form.apellidoP} onChange={v=>ch('apellidoP',v)}/></Row>
                  <Row label="Apellido Materno"><Inp val={form.apellidoM} onChange={v=>ch('apellidoM',v)}/></Row>
                  <Row label="Nombre"><Inp val={form.nombre} onChange={v=>ch('nombre',v)}/></Row>
                  <Row label="Telefono Particular"><Inp val={form.telefono} onChange={v=>ch('telefono',v)} type="tel"/></Row>
                  <Row label="Telefono Oficina"><Inp val={form.telefonoOficina} onChange={v=>ch('telefonoOficina',v)} type="tel"/></Row>
                  <Row label="Telefono Celular"><Inp val={form.celular} onChange={v=>ch('celular',v)} type="tel"/></Row>
                  <Row label="Fecha Nacimiento"><Inp val={form.fechaNac?.toString().substring(0,10)||''} onChange={v=>ch('fechaNac',v)} type="date"/></Row>
                  <Row label="Lugar Nacimiento"><Inp val={form.lugarNacimiento} onChange={v=>ch('lugarNacimiento',v)} opts={ESTADOS_MX}/></Row>
                  <Row label="Sexo"><Inp val={form.sexo} onChange={v=>ch('sexo',v)} opts={['HOMBRE','MUJER']} width="120px"/></Row>
                  <Row label="Estado Civil"><Inp val={form.estadoCivil} onChange={v=>ch('estadoCivil',v)} opts={['Soltero(a)','Casado(a)','Union libre','Divorciado(a)','Viudo(a)']}/></Row>
                  <Row label="RFC"><Inp val={form.rfc} onChange={v=>ch('rfc',v.toUpperCase())} placeholder="Ingrese su RFC"/></Row>
                  <Row label="Correo Electronico"><Inp val={form.correo} onChange={v=>ch('correo',v)} type="email"/></Row>
                  <Row label="No Dependientes Economicos"><Inp val={form.numDependientes} onChange={v=>ch('numDependientes',v)} type="number" width="80px"/></Row>
                  <Row label="CURP">
                    <div style={{display:'flex',gap:'6px',width:'100%'}}>
                      <button style={{background:'#17a2b8',color:'#fff',border:'none',borderRadius:'3px',padding:'3px 10px',fontSize:'12px',cursor:'pointer'}}>Generar</button>
                      <Inp val={form.curp} onChange={v=>ch('curp',v.toUpperCase())}/>
                    </div>
                  </Row>
                </div>

                {/* Cónyuge */}
                <h3 style={{fontSize:'17px',fontWeight:'700',color:'#222',margin:'18px 0 10px',borderBottomWidth:'2px',borderBottomStyle:'solid',borderBottomColor:'#0e50a0',paddingBottom:'4px',display:'inline-block'}}>Datos de conyugue</h3>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'2px 40px',marginBottom:'10px'}}>
                  <Row label="Nombre"><Inp val={form.conyuge?.nombre} onChange={v=>ch('conyuge.nombre',v)}/></Row>
                  <Row label="Telefono"><Inp val={form.conyuge?.telefono} onChange={v=>ch('conyuge.telefono',v)} type="tel"/></Row>
                  <Row label="Nombre Trabajo"><Inp val={form.conyuge?.trabajo} onChange={v=>ch('conyuge.trabajo',v)}/></Row>
                  <Row label="Direccion trabajo"><Inp val={form.conyuge?.direccionTrabajo} onChange={v=>ch('conyuge.direccionTrabajo',v)}/></Row>
                </div>

                {/* Referencias */}
                <h3 style={{fontSize:'17px',fontWeight:'700',color:'#222',margin:'18px 0 10px',borderBottomWidth:'2px',borderBottomStyle:'solid',borderBottomColor:'#0e50a0',paddingBottom:'4px',display:'inline-block'}}>Datos de referencia de contacto</h3>
                {[0,1].map(i => (
                  <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 1fr 2fr',gap:'6px',marginBottom:'6px'}}>
                    <Row label="Nombre de la persona"><Inp val={form.referencias?.[i]?.nombre||''} onChange={v=>chRef(i,'nombre',v)}/></Row>
                    <Row label="Telefono"><Inp val={form.referencias?.[i]?.telefono||''} onChange={v=>chRef(i,'telefono',v)} type="tel"/></Row>
                    <Row label="Domicilio"><Inp val={form.referencias?.[i]?.domicilio||''} onChange={v=>chRef(i,'domicilio',v)}/></Row>
                  </div>
                ))}

                {/* Domicilio */}
                <h3 style={{fontSize:'17px',fontWeight:'700',color:'#222',margin:'18px 0 10px',borderBottomWidth:'2px',borderBottomStyle:'solid',borderBottomColor:'#0e50a0',paddingBottom:'4px',display:'inline-block'}}>Domicilio</h3>
                {/* Historial de direcciones */}
                <div style={{background:'#fafae8',border:'1px solid #ddd',borderRadius:'8px',padding:'14px',marginBottom:'14px'}}>
                  <h4 style={{margin:'0 0 10px',fontSize:'14px',color:'#333',fontWeight:'700'}}>Direcciones registradas del cliente</h4>
                  <table style={{width:'100%',borderCollapse:'collapse',fontSize:'13px'}}>
                    <thead>
                      <tr style={{background:'#c8dfc8'}}>
                        {['Fecha Agregada','CP','Estado','Municipio','Colonia','Calle','Numero exterior'].map(h=>(
                          <th key={h} style={{padding:'7px 10px',textAlign:'left',fontWeight:'700',borderBottomWidth:'1px',borderBottomStyle:'solid',borderBottomColor:'#aaa'}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {selected.updatedAt && (
                        <tr>
                          <td style={tblCell}>{fmtFecha(selected.updatedAt)}</td>
                          <td style={tblCell}>{selected.cp||'—'}</td>
                          <td style={tblCell}>{selected.estado||'—'}</td>
                          <td style={tblCell}>{selected.municipio||'—'}</td>
                          <td style={tblCell}>{selected.colonia||'—'}</td>
                          <td style={tblCell}>{selected.calle||'—'}</td>
                          <td style={tblCell}>{selected.numExt||'—'}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {/* Campos editables de domicilio */}
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'2px 40px'}}>
                  <Row label="Codigo postal">
                    <div style={{display:'flex',gap:'6px',width:'100%'}}>
                      <Inp val={form.cp} onChange={v=>ch('cp',v)} width="120px"/>
                      <button style={{background:'#17a2b8',color:'#fff',border:'none',borderRadius:'3px',padding:'3px 12px',fontSize:'12px',cursor:'pointer'}}>BUSCAR</button>
                    </div>
                  </Row>
                  <Row label="Calle"><Inp val={form.calle} onChange={v=>ch('calle',v)}/></Row>
                  <Row label="Numero exterior"><Inp val={form.numExt} onChange={v=>ch('numExt',v)}/></Row>
                  <Row label="Numero interior"><Inp val={form.numInt} onChange={v=>ch('numInt',v)}/></Row>
                  <Row label="Entre las calles de"><Inp val={form.entreCalles1} onChange={v=>ch('entreCalles1',v)}/></Row>
                  <Row label="Y de"><Inp val={form.entreCalles2} onChange={v=>ch('entreCalles2',v)}/></Row>
                  <Row label="Colonia"><Inp val={form.colonia} onChange={v=>ch('colonia',v)}/></Row>
                  <Row label="Municipio"><Inp val={form.municipio} onChange={v=>ch('municipio',v)}/></Row>
                  <Row label="Estado"><Inp val={form.estado} onChange={v=>ch('estado',v)} opts={ESTADOS_MX}/></Row>
                </div>
                <div style={{marginTop:'6px'}}>
                  <Row label="Referencia Adicional" width="180px">
                    <Inp val={form.referenciaAdicional} onChange={v=>ch('referenciaAdicional',v)}/>
                  </Row>
                </div>
                {/* Mapa placeholder */}
                <div style={{marginTop:'16px',background:'#e8f2fc',borderRadius:'10px',height:'180px',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:'6px',color:'#90aac8'}}>
                  <span style={{fontSize:'13px',fontWeight:'600'}}>-Arrastra la flecha en el mapa para ubicar la casa del cliente</span>
                  <span style={{fontSize:'11px'}}>Mapa de Google Maps</span>
                </div>
              </>}

              {/* ══ TAB 1: INFORMACION FINANCIERA ══ */}
              {tab===1 && <>
                <div style={{background:'#fafae8',border:'1px solid #ddd',borderRadius:'8px',padding:'16px',marginBottom:'16px'}}>
                  <div style={{background:'#c8dfc8',padding:'6px 10px',marginBottom:'10px',fontWeight:'700',fontSize:'13px'}}>Ingresos</div>
                  <Row label="Ingreso mensual promedio" width="220px">
                    <input type="number" value={form.ingresoMensual||'0'} onChange={e=>ch('ingresoMensual',e.target.value)} style={{border:'1px solid #ccc',borderRadius:'3px',padding:'4px 8px',fontSize:'13px',width:'130px'}}/>
                  </Row>
                  <Row label="Otros Ingresos" width="220px">
                    <input type="number" value={form.otrosIngresos||'0'} onChange={e=>ch('otrosIngresos',e.target.value)} style={{border:'1px solid #ccc',borderRadius:'3px',padding:'4px 8px',fontSize:'13px',width:'130px'}}/>
                  </Row>
                  <Row label="Ingreso promedio total" width="220px">
                    <input readOnly value={ingresoTotal} style={{border:'1px solid #ccc',borderRadius:'3px',padding:'4px 8px',fontSize:'13px',width:'130px',background:'#f0f0f0',fontWeight:'700'}}/>
                  </Row>
                  <div style={{background:'#c8dfc8',padding:'6px 10px',margin:'14px 0 10px',fontWeight:'700',fontSize:'13px'}}>Gasto promedio mensual</div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:'4px 16px'}}>
                    {[['Alimento','alimento'],['Luz','luz'],['Telefono','telefono'],['Transporte','transporte'],['Renta','renta'],['Inversion negocio','inversion'],['Creditos','creditos'],['Otros','otros']].map(([label,key])=>(
                      <span key={key} style={{fontSize:'13px',display:'inline-flex',alignItems:'center',gap:'4px',marginBottom:'4px'}}>
                        {label}:&nbsp;
                        <input type="number" value={gastos[key]||''} onChange={e=>ch(`gastos.${key}`,e.target.value)} style={{border:'1px solid #ccc',borderRadius:'3px',padding:'3px 6px',fontSize:'13px',width:'90px'}}/>
                      </span>
                    ))}
                  </div>
                  <Row label="Total gasto" width="120px"><input readOnly value={totalGasto} style={{border:'1px solid #ccc',borderRadius:'3px',padding:'4px 8px',fontSize:'13px',width:'130px',background:'#f0f0f0',fontWeight:'700',color:'#dc2626'}}/></Row>
                  <div style={{marginTop:'10px'}}>
                    <span style={{fontSize:'13px'}}>Total Disponible mensual:&nbsp;<input readOnly value={totalDisponible} style={{border:'1px solid #ccc',borderRadius:'3px',padding:'4px 8px',fontSize:'13px',width:'130px',background:'#f0f0f0',fontWeight:'700',color:totalDisponible>=0?'#166534':'#dc2626'}}/></span>
                  </div>
                </div>

                <div style={{textAlign:'center',fontWeight:'700',fontSize:'15px',margin:'10px 0'}}>Estudio socioeconómico</div>
                <Row label="Tipo de Vivienda" width="160px">
                  <Inp val={form.estudioSocioeconomico?.tipoVivienda} onChange={v=>ch('estudioSocioeconomico.tipoVivienda',v)} opts={['Propia','Rentada','Familiar']}/>
                </Row>
                <div style={{fontWeight:'700',fontSize:'13px',margin:'12px 0 8px',textAlign:'center'}}>Cuenta con estos electrodomésticos</div>
                <div style={{display:'grid',gridTemplateColumns:'200px 1fr',gap:'6px',maxWidth:'420px'}}>
                  {[['Refrigerador','refrigerador'],['Estufa','estufa'],['Lavadora','lavadora'],['Television','television'],['Licuadora','licuadora'],['Horno','horno'],['Computadora','computadora'],['Sala','sala'],['Celular','celular'],['Vehiculo (Marca,modelo)','vehiculo']].map(([label,key])=>(
                    <React.Fragment key={key}>
                      <span style={{fontSize:'13px'}}>{label}</span>
                      <input value={form.estudioSocioeconomico?.electrodomesticos?.[key]||''} onChange={e=>ch(`estudioSocioeconomico.electrodomesticos.${key}`,e.target.value)} style={{border:'1px solid #ccc',borderRadius:'3px',padding:'3px 6px',fontSize:'13px',width:'120px'}}/>
                    </React.Fragment>
                  ))}
                </div>
              </>}

              {/* ══ TAB 2: DOCUMENTACION DIGITAL ══ */}
              {tab===2 && <>
                <p style={{fontSize:'13px',color:'#4a6a94',background:'#f0f7ff',padding:'10px 14px',borderRadius:'8px',marginBottom:'16px',borderWidth:'1px',borderStyle:'solid',borderColor:'#dceaf8'}}>
                  La documentación es opcional. Una vez cargado el cliente puedes actualizar los documentos posteriormente.
                </p>
                {[
                  ['Comprobante domicilio',   'documentos.comprobanteDomicilio'],
                  ['Comprobante de ingresos', 'documentos.comprobanteIngresos'],
                  ['Identificacion oficial',  'documentos.identificacion'],
                  ['Fotografia para perfil',  'documentos.fotoPerfil'],
                  ['Acta Nacimiento',         'documentos.actaNacimiento'],
                  ['CURP',                    'documentos.curpDoc'],
                  ['Fachada de casa',         'documentos.fachadaCasa'],
                  ['Fachada de Negocio',      'documentos.fachadaNegocio'],
                ].map(([label, path]) => {
                  const keys = path.split('.');
                  const val  = keys.length===2 ? form[keys[0]]?.[keys[1]] : form[keys[0]];
                  return <DocRow key={label} label={label} value={val||''} onChange={v=>ch(path,v)}/>;
                })}
                {/* Miniaturas de fotos cargadas */}
                <div style={{marginTop:'20px',display:'flex',gap:'16px',flexWrap:'wrap'}}>
                  {[
                    ['Foto perfil',      form.documentos?.fotoPerfil||form.fotos?.cliente],
                    ['Fachada casa',     form.documentos?.fachadaCasa||form.fotos?.casa],
                    ['Fachada negocio',  form.documentos?.fachadaNegocio||form.fotos?.negocio],
                    ['Cónyuge',          form.conyuge?.foto],
                  ].filter(([,src])=>src&&src.length>10).map(([label,src])=>(
                    <div key={label} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'4px'}}>
                      <div onClick={()=>setZoom({src,label})} style={{width:'80px',height:'80px',borderRadius:'8px',overflow:'hidden',cursor:'zoom-in',borderWidth:'2px',borderStyle:'solid',borderColor:'#dceaf8'}}>
                        <img src={src} alt={label} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                      </div>
                      <span style={{fontSize:'10px',color:'#4a6a94',fontWeight:'600'}}>{label}</span>
                    </div>
                  ))}
                </div>
              </>}

              {/* ══ TAB 3: INFORMACION LABORAL ══ */}
              {tab===3 && <>
                <div style={{display:'flex',gap:'12px',alignItems:'center',flexWrap:'wrap',marginBottom:'12px'}}>
                  <span style={{fontSize:'13px'}}>Fuente de ingresos:</span>
                  <Inp val={form.fuenteIngresos} onChange={v=>ch('fuenteIngresos',v)} opts={['Empleo formal','Negocio propio','Pensionado','Honorarios','Otro']}/>
                  <span style={{fontSize:'13px'}}>Nombre de la empresa:</span>
                  <Inp val={form.empresa} onChange={v=>ch('empresa',v)} width="160px"/>
                  <span style={{fontSize:'13px'}}>RFC:</span>
                  <Inp val={form.rfcEmpresa} onChange={v=>ch('rfcEmpresa',v.toUpperCase())} width="130px"/>
                </div>
                <div style={{background:'#e8e8e8',padding:'5px 10px',fontWeight:'700',fontSize:'13px',marginBottom:'10px'}}>Domicilio laboral</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'2px 40px'}}>
                  <Row label="Codigo postal">
                    <div style={{display:'flex',gap:'6px'}}>
                      <Inp val={form.domicilioLaboral?.cp} onChange={v=>ch('domicilioLaboral.cp',v)} width="100px"/>
                      <button style={{background:'#17a2b8',color:'#fff',border:'none',borderRadius:'3px',padding:'3px 10px',fontSize:'12px',cursor:'pointer'}}>BUSCAR</button>
                    </div>
                  </Row>
                  <Row label="Calle"><Inp val={form.domicilioLaboral?.calle} onChange={v=>ch('domicilioLaboral.calle',v)}/></Row>
                  <Row label="Numero exterior"><Inp val={form.domicilioLaboral?.numExt} onChange={v=>ch('domicilioLaboral.numExt',v)}/></Row>
                  <Row label="Numero interior"><Inp val={form.domicilioLaboral?.numInt} onChange={v=>ch('domicilioLaboral.numInt',v)}/></Row>
                  <Row label="Entre las calles de"><Inp val={form.domicilioLaboral?.entreCalles1} onChange={v=>ch('domicilioLaboral.entreCalles1',v)}/></Row>
                  <Row label="Y de"><Inp val={form.domicilioLaboral?.entreCalles2} onChange={v=>ch('domicilioLaboral.entreCalles2',v)}/></Row>
                </div>
                <div style={{marginTop:'6px'}}>
                  <Row label="Referencia Adicional" width="180px"><Inp val={form.domicilioLaboral?.referenciaAdicional} onChange={v=>ch('domicilioLaboral.referenciaAdicional',v)}/></Row>
                </div>
                <div style={{marginTop:'14px',background:'#e8f2fc',borderRadius:'8px',height:'160px',display:'flex',alignItems:'center',justifyContent:'center',color:'#90aac8',fontSize:'13px'}}>Mapa de Google Maps — arrastra el marcador</div>
              </>}

              {/* ══ TAB 4: ANOTACIONES ══ */}
              {tab===4 && (
                <div style={{color:'#90aac8',textAlign:'center',padding:'40px',fontSize:'14px'}}>
                  Sin anotaciones registradas para este cliente.
                </div>
              )}

              {/* ══ TAB 5: SOLICITUDES ══ */}
              {tab===5 && (
                <div style={{overflowX:'auto'}}>
                  {Array.isArray(solicitudes) && solicitudes.length>0 ? (
                    <table style={{width:'100%',borderCollapse:'collapse',fontSize:'13px'}}>
                      <thead><tr style={{background:'#c8dfc8'}}>
                        {['Folio','Producto','Monto','Plazo','Estatus','Fecha'].map(h=><th key={h} style={tblHead}>{h}</th>)}
                      </tr></thead>
                      <tbody>
                        {solicitudes.map((s,i)=>(
                          <tr key={s._id} style={{background:i%2===0?'#fff':'#f9f9f9'}}>
                            <td style={tblCell}>{s._id?.slice(-6)}</td>
                            <td style={tblCell}>{s.producto||'—'}</td>
                            <td style={tblCell}>{fmtMoney(s.monto)}</td>
                            <td style={tblCell}>{s.plazo} {s.frecuencia}</td>
                            <td style={tblCell}><span style={{background:s.estatus==='Aprobada'?'#dcfce7':s.estatus==='Rechazada'?'#fee2e2':'#fef3c7',color:s.estatus==='Aprobada'?'#166534':s.estatus==='Rechazada'?'#dc2626':'#92400e',padding:'2px 10px',borderRadius:'20px',fontSize:'11px',fontWeight:'700'}}>{s.estatus}</span></td>
                            <td style={tblCell}>{s.fecha||fmtFecha(s.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : <div style={{color:'#90aac8',textAlign:'center',padding:'40px',fontSize:'14px'}}>Sin solicitudes registradas.</div>}
                </div>
              )}

              {/* ══ TAB 6: CREDITOS ══ */}
              {tab===6 && (
                <div style={{overflowX:'auto'}}>
                  {Array.isArray(creditos) && creditos.length>0 ? (
                    <table style={{width:'100%',borderCollapse:'collapse',fontSize:'13px'}}>
                      <thead><tr style={{background:'#c8dfc8'}}>
                        {['Folio','Producto','Monto','Saldo','Pagos','Estatus'].map(h=><th key={h} style={tblHead}>{h}</th>)}
                      </tr></thead>
                      <tbody>
                        {creditos.map((c,i)=>(
                          <tr key={c._id} style={{background:i%2===0?'#fff':'#f9f9f9'}}>
                            <td style={tblCell}>{c.folio||c._id?.slice(-6)}</td>
                            <td style={tblCell}>{c.producto||'—'}</td>
                            <td style={tblCell}>{fmtMoney(c.monto)}</td>
                            <td style={tblCell}>{fmtMoney(c.saldo)}</td>
                            <td style={tblCell}>{c.pagosRealizados||0}</td>
                            <td style={tblCell}><span style={{background:c.estatus==='Vigente'?'#dcfce7':'#f3f4f6',color:c.estatus==='Vigente'?'#166534':'#6b7280',padding:'2px 10px',borderRadius:'20px',fontSize:'11px',fontWeight:'700'}}>{c.estatus}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : <div style={{color:'#90aac8',textAlign:'center',padding:'40px',fontSize:'14px'}}>Sin créditos registrados.</div>}
                </div>
              )}

              {/* ══ TAB 7: CUENTAS AHORRO ══ */}
              {tab===7 && (
                <div style={{overflowX:'auto'}}>
                  {Array.isArray(cuentas) && cuentas.length>0 ? (
                    <table style={{width:'100%',borderCollapse:'collapse',fontSize:'13px'}}>
                      <thead><tr style={{background:'#c8dfc8'}}>
                        {['Folio','Producto','Saldo','Estatus','Apertura'].map(h=><th key={h} style={tblHead}>{h}</th>)}
                      </tr></thead>
                      <tbody>
                        {cuentas.map((c,i)=>(
                          <tr key={c._id} style={{background:i%2===0?'#fff':'#f9f9f9'}}>
                            <td style={tblCell}>{c.folio||c._id?.slice(-6)}</td>
                            <td style={tblCell}>{c.producto||'—'}</td>
                            <td style={tblCell}>{fmtMoney(c.saldo)}</td>
                            <td style={tblCell}><span style={{background:c.estatus==='Activa'?'#dcfce7':'#f3f4f6',color:c.estatus==='Activa'?'#166534':'#6b7280',padding:'2px 10px',borderRadius:'20px',fontSize:'11px',fontWeight:'700'}}>{c.estatus}</span></td>
                            <td style={tblCell}>{c.fechaApertura||fmtFecha(c.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : <div style={{color:'#90aac8',textAlign:'center',padding:'40px',fontSize:'14px'}}>Sin cuentas de ahorro registradas.</div>}
                </div>
              )}

            </div>{/* /padding */}
          </div>{/* /card pestañas */}
        </div>
      )}

      {/* ── Modal lista negra ── */}
      {modalBaja && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:'20px'}}>
          <div style={{background:'#fff',borderRadius:'14px',padding:'26px',maxWidth:'400px',width:'100%',boxShadow:'0 20px 60px rgba(0,0,0,0.2)'}}>
            <h3 style={{fontFamily:"'Cormorant Garamond', serif",fontSize:'18px',fontWeight:'700',color:'#0a2d5e',margin:'0 0 6px'}}>
              {selected?.estatus==='Lista negra' ? 'Reactivar cliente' : 'Enviar a lista negra'}
            </h3>
            <p style={{fontSize:'13px',color:'#4a6a94',margin:'0 0 16px'}}>{nombreCompleto}</p>
            <label style={{fontSize:'12px',fontWeight:'600',color:'#4a6a94',display:'block',marginBottom:'5px'}}>MOTIVO *</label>
            <textarea value={motivoBaja} onChange={e=>setMotivoBaja(e.target.value)} rows={3}
              style={{width:'100%',border:'1px solid #ddd',borderRadius:'8px',padding:'9px',fontSize:'13px',fontFamily:'DM Sans, sans-serif',outline:'none',resize:'vertical',boxSizing:'border-box',marginBottom:'12px'}}/>
            {selected?.estatus!=='Lista negra' && <>
              <label style={{fontSize:'12px',fontWeight:'600',color:'#4a6a94',display:'block',marginBottom:'5px'}}>MONTO ADEUDADO ($)</label>
              <input type="number" value={montoBaja} onChange={e=>setMontoBaja(e.target.value)}
                style={{width:'100%',border:'1px solid #ddd',borderRadius:'8px',padding:'9px',fontSize:'13px',outline:'none',boxSizing:'border-box',marginBottom:'16px'}}/>
            </>}
            <div style={{display:'flex',gap:'8px',justifyContent:'flex-end'}}>
              <button onClick={()=>{setModalBaja(false);setMotivoBaja('');setMontoBaja('');}} style={{background:'#fff',border:'1px solid #ddd',borderRadius:'8px',padding:'8px 18px',fontSize:'13px',fontWeight:'600',color:'#4a6a94',cursor:'pointer'}}>Cancelar</button>
              <button onClick={confirmarBaja} disabled={!motivoBaja.trim()||procesando}
                style={{background:selected?.estatus==='Lista negra'?'#0e50a0':'#dc2626',color:'#fff',border:'none',borderRadius:'8px',padding:'8px 18px',fontSize:'13px',fontWeight:'600',cursor:!motivoBaja.trim()?'not-allowed':'pointer',opacity:!motivoBaja.trim()?0.6:1,display:'flex',alignItems:'center',gap:'6px'}}>
                {procesando && <Loader size={12} style={{animation:'spin 1s linear infinite'}}/>}
                {selected?.estatus==='Lista negra' ? 'Reactivar' : 'Confirmar baja'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {zoom && <Lightbox src={zoom.src} label={zoom.label} onClose={()=>setZoom(null)}/>}

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}