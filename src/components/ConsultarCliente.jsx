'use client';
import { useState, useEffect, useRef } from 'react';
import {
  Search, User, FileText, MapPin, Phone, Heart, Users,
  ChevronDown, ChevronUp, AlertCircle, Loader, X, CheckCircle,
  Edit2, Save, RotateCcw, Slash, ShieldOff, ShieldCheck,
  DollarSign, Briefcase, Camera, Home, Eye
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://fiem-backend-production.up.railway.app';

const fmt      = v => v || '—';
const fmtMoney = v => v ? `$${Number(v).toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : '—';
const fmtFecha = v => { if (!v) return '—'; try { return new Date(v).toLocaleDateString('es-MX', { day:'2-digit', month:'long', year:'numeric' }); } catch { return v; } };

const ESTADOS_MX = ['Aguascalientes','Baja California','Baja California Sur','Campeche','Chiapas','Chihuahua','Ciudad de Mexico','Coahuila de Zaragoza','Colima','Distrito Federal','Durango','Guanajuato','Guerrero','Hidalgo','Jalisco','Mexico','Michoacan','Morelos','Nayarit','Nuevo Leon','Oaxaca','Puebla','Queretaro','Quintana Roo','San Luis Potosi','Sinaloa','Sonora','Tabasco','Tamaulipas','Tlaxcala','Veracruz','Yucatan','Zacatecas'];

// ── Pill estatus ──
function Pill({ v }) {
  const map = { 'Activo':{ bg:'#dcfce7', c:'#166534' }, 'Lista negra':{ bg:'#fee2e2', c:'#dc2626' }, 'Inactivo':{ bg:'#f3f4f6', c:'#6b7280' } };
  const s = map[v] || map['Inactivo'];
  return <span style={{ background:s.bg, color:s.c, borderRadius:'999px', padding:'3px 12px', fontSize:'12px', fontWeight:'700' }}>{v||'Sin estatus'}</span>;
}

// ── Campo de solo lectura ──
function Dato({ label, value }) {
  return (
    <div>
      <div style={{ fontSize:'10px', fontWeight:'700', color:'#90aac8', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'3px' }}>{label}</div>
      <div style={{ fontSize:'13px', color:'#1a3d6e', fontWeight:'500' }}>{value || '—'}</div>
    </div>
  );
}

// ── Input edición ──
function Inp({ val, onChange, type='text', opts }) {
  const s = { border:'1.5px solid #dceaf8', borderRadius:'8px', padding:'8px 11px', fontSize:'13px', fontFamily:'DM Sans, sans-serif', color:'#1a3d6e', outline:'none', width:'100%', background:'#fafcff', boxSizing:'border-box' };
  if (opts) return <select value={val||''} onChange={e=>onChange(e.target.value)} style={{ ...s, cursor:'pointer' }}><option value="">—</option>{opts.map(o=><option key={o} value={o}>{o}</option>)}</select>;
  return <input type={type} value={val||''} onChange={e=>onChange(e.target.value)} style={s}/>;
}

// ── Sección colapsable ──
function Sec({ icon:Icon, title, iconBg='#e8f2fc', iconColor='#0e50a0', children, open:initOpen=true }) {
  const [open, setOpen] = useState(initOpen);
  return (
    <div style={{ background:'#fff', borderRadius:'14px', border:'1px solid #dceaf8', boxShadow:'0 2px 10px rgba(14,80,160,0.05)', marginBottom:'16px', overflow:'hidden' }}>
      <button onClick={()=>setOpen(o=>!o)} style={{ width:'100%', padding:'14px 22px', borderBottom: open?'1px solid #f0f6ff':'none', display:'flex', alignItems:'center', gap:'10px', background:'none', border:'none', cursor:'pointer' }}>
        <div style={{ width:'30px', height:'30px', background:iconBg, borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Icon size={15} color={iconColor}/></div>
        <span style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:'16px', fontWeight:'700', color:'#0a2d5e', flex:1, textAlign:'left' }}>{title}</span>
        {open ? <ChevronUp size={15} color="#90aac8"/> : <ChevronDown size={15} color="#90aac8"/>}
      </button>
      {open && <div style={{ padding:'18px 22px' }}>{children}</div>}
    </div>
  );
}

// ── Grid ──
const Grid = ({ children, min='200px' }) => (
  <div style={{ display:'grid', gridTemplateColumns:`repeat(auto-fit, minmax(${min}, 1fr))`, gap:'14px' }}>{children}</div>
);

// ── Miniatura foto con zoom ──
function Foto({ src, label, onZoom }) {
  if (!src || src.length < 10) return null;
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'6px' }}>
      <div onClick={()=>onZoom(src, label)} style={{ width:'90px', height:'90px', borderRadius:'10px', overflow:'hidden', cursor:'zoom-in', border:'2px solid #dceaf8' }}>
        <img src={src} alt={label} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
      </div>
      <span style={{ fontSize:'10px', color:'#4a6a94', fontWeight:'600', textAlign:'center' }}>{label}</span>
    </div>
  );
}

// ── Documento con botón ver ──
function DocItem({ label, value, onZoom }) {
  if (!value) return (
    <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 0', borderBottom:'1px solid #f5f8ff' }}>
      <div style={{ width:'36px', height:'36px', background:'#f0f6ff', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center' }}><FileText size={16} color="#90aac8"/></div>
      <span style={{ fontSize:'13px', color:'#90aac8', flex:1 }}>{label}</span>
      <span style={{ fontSize:'11px', color:'#cbd5e1', fontStyle:'italic' }}>No cargado</span>
    </div>
  );
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 0', borderBottom:'1px solid #f5f8ff' }}>
      <div style={{ width:'36px', height:'36px', background:'#e8f2fc', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center' }}><FileText size={16} color="#0e50a0"/></div>
      <span style={{ fontSize:'13px', color:'#1a3d6e', fontWeight:'500', flex:1 }}>{label}</span>
      <button onClick={()=>onZoom(value, label)} style={{ background:'#0e50a0', color:'#fff', border:'none', borderRadius:'7px', padding:'5px 14px', fontSize:'12px', fontWeight:'600', cursor:'pointer', display:'flex', alignItems:'center', gap:'5px' }}><Eye size={13}/> Ver</button>
    </div>
  );
}

export default function ConsultarCliente() {
  const [busqueda,    setBusqueda]    = useState('');
  const [clientes,    setClientes]    = useState([]);
  const [selected,    setSelected]    = useState(null);
  const [cargando,    setCargando]    = useState(false);
  const [error,       setError]       = useState('');
  const [editando,    setEditando]    = useState(false);
  const [formEdit,    setFormEdit]    = useState({});
  const [guardando,   setGuardando]   = useState(false);
  const [msgOk,       setMsgOk]       = useState('');
  const [zoom,        setZoom]        = useState(null); // { src, label }
  const [modalBaja,   setModalBaja]   = useState(false);
  const [motivoBaja,  setMotivoBaja]  = useState('');
  const [montoBaja,   setMontoBaja]   = useState('');
  const [procesando,  setProcesando]  = useState(false);

  // Cargar todos al iniciar
  useEffect(() => { fetchClientes(); }, []);

  const fetchClientes = async (q='') => {
    setCargando(true); setError('');
    try {
      const url = q ? `${API}/api/clientes?busqueda=${encodeURIComponent(q)}` : `${API}/api/clientes`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Error al cargar');
      const data = await res.json();
      setClientes(Array.isArray(data) ? data : []);
    } catch(e) { setError(e.message); }
    finally { setCargando(false); }
  };

  const handleBuscar = () => fetchClientes(busqueda);
  const handleKeyDown = e => { if(e.key==='Enter') handleBuscar(); };

  const seleccionar = async (id) => {
    setCargando(true);
    try {
      const res = await fetch(`${API}/api/clientes/${id}`);
      const data = await res.json();
      setSelected(data); setEditando(false); setFormEdit({});
    } catch(e) { setError(e.message); }
    finally { setCargando(false); }
  };

  const iniciarEdicion = () => {
    const base = { ...selected };
    // Garantizar subobjetos para evitar errores en edición
    base.conyuge        = base.conyuge        || {};
    base.gastos         = base.gastos         || {};
    base.documentos     = base.documentos     || {};
    base.domicilioLaboral = base.domicilioLaboral || {};
    base.estudioSocioeconomico = base.estudioSocioeconomico || {};
    setFormEdit(base);
    setEditando(true);
  };
  const cancelarEdicion = () => { setEditando(false); setFormEdit({}); };

  const ch = (path, val) => {
    // Soporta paths anidados como "conyuge.nombre"
    setFormEdit(prev => {
      const parts = path.split('.');
      if (parts.length === 1) return { ...prev, [path]: val };
      const copy = { ...prev };
      if (!copy[parts[0]]) copy[parts[0]] = {};
      copy[parts[0]] = { ...copy[parts[0]], [parts[1]]: val };
      return copy;
    });
  };

  const guardarEdicion = async () => {
    setGuardando(true);
    try {
      const res = await fetch(`${API}/api/clientes/${selected._id}`, {
        method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(formEdit)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error||'Error');
      setSelected(data); setEditando(false); setFormEdit({});
      setMsgOk('Cliente actualizado correctamente.');
      setTimeout(()=>setMsgOk(''), 3000);
      fetchClientes(busqueda);
    } catch(e) { setError(e.message); setTimeout(()=>setError(''), 4000); }
    finally { setGuardando(false); }
  };

  const confirmarBaja = async () => {
    if (!motivoBaja.trim()) return;
    setProcesando(true);
    try {
      const esListaNegra = selected.estatus === 'Lista negra';
      const nuevoEstatus = esListaNegra ? 'Activo' : 'Lista negra';
      const payload = {
        estatus: nuevoEstatus,
        listaNegra: !esListaNegra,
        motivoListaNegra: esListaNegra ? '' : motivoBaja,
        montoAdeudado: esListaNegra ? 0 : (parseFloat(montoBaja)||0),
      };
      const res = await fetch(`${API}/api/clientes/${selected._id}`, {
        method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error||'Error');
      setSelected(data); setModalBaja(false); setMotivoBaja(''); setMontoBaja('');
      setMsgOk(esListaNegra ? 'Cliente reactivado correctamente.' : 'Cliente enviado a lista negra.');
      setTimeout(()=>setMsgOk(''), 3000);
      fetchClientes(busqueda);
    } catch(e) { setError(e.message); }
    finally { setProcesando(false); }
  };

  const c = editando ? formEdit : (selected || {});
  const nombreCompleto = selected ? `${selected.apellidoP||''} ${selected.apellidoM||''} ${selected.nombre||''}`.trim() : '';

  return (
    <div style={{ maxWidth:'900px', margin:'0 auto', fontFamily:'DM Sans, sans-serif' }}>

      {/* Alertas globales */}
      {msgOk  && <div style={{ background:'#dcfce7', border:'1px solid #86efac', borderRadius:'12px', padding:'12px 18px', marginBottom:'16px', color:'#166534', fontSize:'13px', fontWeight:'600', display:'flex', alignItems:'center', gap:'8px' }}><CheckCircle size={15}/> {msgOk}</div>}
      {error  && <div style={{ background:'#fee2e2', border:'1px solid #fca5a5', borderRadius:'12px', padding:'12px 18px', marginBottom:'16px', color:'#dc2626', fontSize:'13px', fontWeight:'600', display:'flex', alignItems:'center', gap:'8px' }}><AlertCircle size={15}/> {error}</div>}

      {/* ── Buscador ── */}
      <div style={{ background:'#fff', borderRadius:'14px', border:'1px solid #dceaf8', boxShadow:'0 2px 10px rgba(14,80,160,0.05)', padding:'18px 22px', marginBottom:'20px' }}>
        <div style={{ display:'flex', gap:'10px', marginBottom:'14px' }}>
          <div style={{ flex:1, position:'relative' }}>
            <Search size={16} color="#90aac8" style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)' }}/>
            <input
              value={busqueda} onChange={e=>setBusqueda(e.target.value)} onKeyDown={handleKeyDown}
              placeholder="Buscar por nombre, apellido o CURP..."
              style={{ width:'100%', paddingLeft:'38px', paddingRight:'12px', paddingTop:'10px', paddingBottom:'10px', border:'1.5px solid #dceaf8', borderRadius:'10px', fontSize:'13px', fontFamily:'DM Sans, sans-serif', color:'#1a3d6e', outline:'none', background:'#fafcff', boxSizing:'border-box' }}
            />
          </div>
          <button onClick={handleBuscar} style={{ background:'#0e50a0', color:'#fff', border:'none', borderRadius:'10px', padding:'0 22px', fontSize:'13px', fontWeight:'600', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px' }}>
            {cargando ? <Loader size={14} style={{ animation:'spin 1s linear infinite' }}/> : <Search size={14}/>} Buscar
          </button>
        </div>

        {/* Tabla de resultados */}
        {clientes.length > 0 ? (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
              <thead>
                <tr style={{ background:'#f0f7ff' }}>
                  {['Nombre completo','CURP','Celular','Ruta','Estatus',''].map(h => (
                    <th key={h} style={{ padding:'10px 12px', textAlign:'left', fontSize:'11px', fontWeight:'700', color:'#4a6a94', textTransform:'uppercase', letterSpacing:'0.06em', borderBottom:'1px solid #dceaf8', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clientes.map((cl, i) => (
                  <tr key={cl._id} style={{ background: selected?._id===cl._id ? '#f0f7ff' : (i%2===0?'#fff':'#fafcff'), cursor:'pointer', transition:'background 0.1s' }}
                    onClick={() => seleccionar(cl._id)}>
                    <td style={{ padding:'10px 12px', borderBottom:'1px solid #f0f6ff', color:'#1a3d6e', fontWeight: selected?._id===cl._id?'700':'400' }}>
                      {cl.apellidoP} {cl.apellidoM} {cl.nombre}
                    </td>
                    <td style={{ padding:'10px 12px', borderBottom:'1px solid #f0f6ff', color:'#4a6a94', fontFamily:'monospace', fontSize:'12px' }}>{cl.curp||'—'}</td>
                    <td style={{ padding:'10px 12px', borderBottom:'1px solid #f0f6ff', color:'#4a6a94' }}>{cl.celular||'—'}</td>
                    <td style={{ padding:'10px 12px', borderBottom:'1px solid #f0f6ff', color:'#4a6a94' }}>{cl.rutaVinculacion||'—'}</td>
                    <td style={{ padding:'10px 12px', borderBottom:'1px solid #f0f6ff' }}><Pill v={cl.estatus}/></td>
                    <td style={{ padding:'10px 12px', borderBottom:'1px solid #f0f6ff' }}>
                      <button onClick={e=>{e.stopPropagation();seleccionar(cl._id);}} style={{ background:'#e8f2fc', color:'#0e50a0', border:'none', borderRadius:'7px', padding:'4px 12px', fontSize:'12px', fontWeight:'600', cursor:'pointer' }}>Ver</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding:'8px 12px', fontSize:'11px', color:'#90aac8' }}>{clientes.length} cliente{clientes.length!==1?'s':''} encontrado{clientes.length!==1?'s':''}</div>
          </div>
        ) : (
          !cargando && <div style={{ textAlign:'center', padding:'20px', color:'#90aac8', fontSize:'13px' }}>
            {busqueda ? 'No se encontraron clientes con esa búsqueda.' : 'No hay clientes registrados.'}
          </div>
        )}
        {cargando && !selected && <div style={{ textAlign:'center', padding:'20px', color:'#90aac8' }}><Loader size={20} style={{ animation:'spin 1s linear infinite' }}/></div>}
      </div>

      {/* ── Detalle del cliente seleccionado ── */}
      {selected && (
        <div>
          {/* Header cliente */}
          <div style={{ background:'#fff', borderRadius:'14px', border:'1px solid #dceaf8', boxShadow:'0 2px 10px rgba(14,80,160,0.05)', padding:'20px 22px', marginBottom:'16px', display:'flex', alignItems:'center', gap:'16px', flexWrap:'wrap' }}>
            <div style={{ width:'52px', height:'52px', background:'#e8f2fc', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              {(selected.documentos?.fotoPerfil || selected.fotos?.cliente)
                ? <img src={selected.documentos?.fotoPerfil || selected.fotos?.cliente} alt="Foto" style={{ width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover' }}/>
                : <User size={24} color="#0e50a0"/>
              }
            </div>
            <div style={{ flex:1, minWidth:'200px' }}>
              <div style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:'22px', fontWeight:'700', color:'#0a2d5e' }}>{nombreCompleto}</div>
              <div style={{ display:'flex', gap:'12px', marginTop:'4px', flexWrap:'wrap', alignItems:'center' }}>
                <Pill v={selected.estatus}/>
                {selected.tipoCliente && <span style={{ fontSize:'12px', color:'#4a6a94', background:'#f0f6ff', padding:'2px 10px', borderRadius:'20px' }}>{selected.tipoCliente}</span>}
                {selected.rutaVinculacion && <span style={{ fontSize:'12px', color:'#4a6a94' }}>{selected.rutaVinculacion}</span>}
              </div>
            </div>
            {/* Botones de acción */}
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
              {!editando
                ? <>
                    <button onClick={iniciarEdicion} style={{ background:'#e8f2fc', color:'#0e50a0', border:'none', borderRadius:'9px', padding:'9px 18px', fontSize:'13px', fontWeight:'600', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px' }}>
                      <Edit2 size={14}/> Editar
                    </button>
                    <button onClick={()=>setModalBaja(true)} style={{ background: selected.estatus==='Lista negra'?'#dcfce7':'#fee2e2', color: selected.estatus==='Lista negra'?'#166534':'#dc2626', border:'none', borderRadius:'9px', padding:'9px 18px', fontSize:'13px', fontWeight:'600', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px' }}>
                      {selected.estatus==='Lista negra' ? <><ShieldCheck size={14}/> Reactivar</> : <><ShieldOff size={14}/> Lista negra</>}
                    </button>
                  </>
                : <>
                    <button onClick={guardarEdicion} disabled={guardando} style={{ background:'#0e50a0', color:'#fff', border:'none', borderRadius:'9px', padding:'9px 18px', fontSize:'13px', fontWeight:'600', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px', boxShadow:'0 4px 14px rgba(14,80,160,0.28)' }}>
                      {guardando ? <><Loader size={13} style={{ animation:'spin 1s linear infinite' }}/> Guardando</> : <><Save size={14}/> Guardar</>}
                    </button>
                    <button onClick={cancelarEdicion} style={{ background:'#fff', border:'1.5px solid #dceaf8', borderRadius:'9px', padding:'9px 18px', fontSize:'13px', fontWeight:'600', color:'#4a6a94', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px' }}>
                      <RotateCcw size={13}/> Cancelar
                    </button>
                  </>
              }
            </div>
          </div>

          {/* Lista negra alerta */}
          {selected.estatus==='Lista negra' && (
            <div style={{ background:'#fee2e2', border:'1px solid #fca5a5', borderRadius:'12px', padding:'12px 18px', marginBottom:'16px', display:'flex', gap:'12px', alignItems:'flex-start' }}>
              <Slash size={16} color="#dc2626" style={{ flexShrink:0, marginTop:'1px' }}/>
              <div>
                <div style={{ fontSize:'13px', fontWeight:'700', color:'#dc2626', marginBottom:'2px' }}>Cliente en lista negra</div>
                {selected.motivoListaNegra && <div style={{ fontSize:'12px', color:'#ef4444' }}>Motivo: {selected.motivoListaNegra}</div>}
                {selected.montoAdeudado>0 && <div style={{ fontSize:'12px', color:'#ef4444' }}>Monto adeudado: {fmtMoney(selected.montoAdeudado)}</div>}
              </div>
            </div>
          )}

          {/* ── Datos personales ── */}
          <Sec icon={User} title="Datos personales">
            <Grid>
              {editando ? <>
                <div><label style={lbl}>Nombre(s)</label><Inp val={c.nombre} onChange={v=>ch('nombre',v)}/></div>
                <div><label style={lbl}>Apellido paterno</label><Inp val={c.apellidoP} onChange={v=>ch('apellidoP',v)}/></div>
                <div><label style={lbl}>Apellido materno</label><Inp val={c.apellidoM} onChange={v=>ch('apellidoM',v)}/></div>
                <div><label style={lbl}>Fecha nacimiento</label><Inp val={c.fechaNac?.substring?.(0,10)||''} onChange={v=>ch('fechaNac',v)} type="date"/></div>
                <div><label style={lbl}>Lugar nacimiento</label><Inp val={c.lugarNacimiento} onChange={v=>ch('lugarNacimiento',v)} opts={ESTADOS_MX}/></div>
                <div><label style={lbl}>Sexo</label><Inp val={c.sexo} onChange={v=>ch('sexo',v)} opts={['Masculino','Femenino']}/></div>
                <div><label style={lbl}>Estado civil</label><Inp val={c.estadoCivil} onChange={v=>ch('estadoCivil',v)} opts={['Soltero(a)','Casado(a)','Union libre','Divorciado(a)','Viudo(a)']}/></div>
                <div><label style={lbl}>CURP</label><Inp val={c.curp} onChange={v=>ch('curp',v.toUpperCase())}/></div>
                <div><label style={lbl}>RFC</label><Inp val={c.rfc} onChange={v=>ch('rfc',v.toUpperCase())}/></div>
                <div><label style={lbl}>INE/IFE</label><Inp val={c.ine} onChange={v=>ch('ine',v)}/></div>
                <div><label style={lbl}>No. dependientes</label><Inp val={c.numDependientes} onChange={v=>ch('numDependientes',v)} type="number"/></div>
              </> : <>
                <Dato label="Nombre(s)" value={selected.nombre}/>
                <Dato label="Apellido paterno" value={selected.apellidoP}/>
                <Dato label="Apellido materno" value={selected.apellidoM}/>
                <Dato label="Fecha de nacimiento" value={fmtFecha(selected.fechaNac)}/>
                <Dato label="Lugar de nacimiento" value={selected.lugarNacimiento}/>
                <Dato label="Sexo" value={selected.sexo}/>
                <Dato label="Estado civil" value={selected.estadoCivil}/>
                <Dato label="CURP" value={selected.curp}/>
                <Dato label="RFC" value={selected.rfc}/>
                <Dato label="No. INE/IFE" value={selected.ine}/>
                <Dato label="No. dependientes económicos" value={selected.numDependientes}/>
              </>}
            </Grid>
          </Sec>

          {/* ── Contacto ── */}
          <Sec icon={Phone} title="Contacto">
            <Grid>
              {editando ? <>
                <div><label style={lbl}>Teléfono particular</label><Inp val={c.telefono} onChange={v=>ch('telefono',v)} type="tel"/></div>
                <div><label style={lbl}>Teléfono oficina</label><Inp val={c.telefonoOficina} onChange={v=>ch('telefonoOficina',v)} type="tel"/></div>
                <div><label style={lbl}>Celular</label><Inp val={c.celular} onChange={v=>ch('celular',v)} type="tel"/></div>
                <div><label style={lbl}>Correo electrónico</label><Inp val={c.correo} onChange={v=>ch('correo',v)} type="email"/></div>
              </> : <>
                <Dato label="Teléfono particular" value={selected.telefono}/>
                <Dato label="Teléfono oficina" value={selected.telefonoOficina}/>
                <Dato label="Celular" value={selected.celular}/>
                <Dato label="Correo electrónico" value={selected.correo}/>
              </>}
            </Grid>
          </Sec>

          {/* ── Domicilio ── */}
          <Sec icon={MapPin} title="Domicilio">
            <Grid>
              {editando ? <>
                <div><label style={lbl}>Calle</label><Inp val={c.calle} onChange={v=>ch('calle',v)}/></div>
                <div><label style={lbl}>No. exterior</label><Inp val={c.numExt} onChange={v=>ch('numExt',v)}/></div>
                <div><label style={lbl}>No. interior</label><Inp val={c.numInt} onChange={v=>ch('numInt',v)}/></div>
                <div><label style={lbl}>Colonia</label><Inp val={c.colonia} onChange={v=>ch('colonia',v)}/></div>
                <div><label style={lbl}>Municipio</label><Inp val={c.municipio} onChange={v=>ch('municipio',v)}/></div>
                <div><label style={lbl}>Estado</label><Inp val={c.estado} onChange={v=>ch('estado',v)} opts={ESTADOS_MX}/></div>
                <div><label style={lbl}>Código postal</label><Inp val={c.cp} onChange={v=>ch('cp',v)}/></div>
                <div><label style={lbl}>Entre calles</label><Inp val={c.entreCalles1} onChange={v=>ch('entreCalles1',v)}/></div>
                <div><label style={lbl}>Y de</label><Inp val={c.entreCalles2} onChange={v=>ch('entreCalles2',v)}/></div>
                <div style={{ gridColumn:'1/-1' }}><label style={lbl}>Referencia adicional</label><Inp val={c.referenciaAdicional} onChange={v=>ch('referenciaAdicional',v)}/></div>
              </> : <>
                <Dato label="Calle" value={`${selected.calle||''} ${selected.numExt?`#${selected.numExt}`:''}${selected.numInt?` Int.${selected.numInt}`:''}`}/>
                <Dato label="Colonia" value={selected.colonia}/>
                <Dato label="Municipio" value={selected.municipio}/>
                <Dato label="Estado" value={selected.estado}/>
                <Dato label="Código postal" value={selected.cp}/>
                {selected.entreCalles1 && <Dato label="Entre calles" value={`${selected.entreCalles1} y ${selected.entreCalles2||''}`}/>}
                {selected.referenciaAdicional && <Dato label="Referencia" value={selected.referenciaAdicional}/>}
              </>}
            </Grid>
          </Sec>

          {/* ── Financiero ── */}
          <Sec icon={DollarSign} title="Información financiera" open={false}>
            <Grid>
              <Dato label="Ingreso mensual" value={fmtMoney(selected.ingresoMensual)}/>
              <Dato label="Otros ingresos" value={fmtMoney(selected.otrosIngresos)}/>
              <Dato label="Ingreso total" value={fmtMoney(selected.ingresoTotal)}/>
              <Dato label="Total gastos" value={fmtMoney(selected.totalGasto)}/>
              <Dato label="Disponible mensual" value={fmtMoney(selected.totalDisponible)}/>
              {selected.estudioSocioeconomico?.tipoVivienda && <Dato label="Tipo de vivienda" value={selected.estudioSocioeconomico.tipoVivienda}/>}
            </Grid>
            {selected.gastos && Object.values(selected.gastos).some(v=>Number(v)>0) && (
              <div style={{ marginTop:'14px' }}>
                <div style={{ fontSize:'11px', fontWeight:'700', color:'#90aac8', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'10px' }}>Desglose de gastos</div>
                <Grid min="140px">
                  {[['Alimento','alimento'],['Luz','luz'],['Teléfono','telefono'],['Transporte','transporte'],['Renta','renta'],['Inversión','inversion'],['Créditos','creditos'],['Otros','otros']].map(([l,k])=>
                    Number(selected.gastos[k])>0 ? <Dato key={k} label={l} value={fmtMoney(selected.gastos[k])}/> : null
                  )}
                </Grid>
              </div>
            )}
          </Sec>

          {/* ── Laboral ── */}
          <Sec icon={Briefcase} title="Información laboral" open={false}>
            <Grid>
              {editando ? <>
                <div><label style={lbl}>Fuente de ingresos</label><Inp val={c.fuenteIngresos} onChange={v=>ch('fuenteIngresos',v)} opts={['Empleo formal','Negocio propio','Pensionado','Honorarios','Otro']}/></div>
                <div><label style={lbl}>Empresa</label><Inp val={c.empresa} onChange={v=>ch('empresa',v)}/></div>
                <div><label style={lbl}>RFC empresa</label><Inp val={c.rfcEmpresa} onChange={v=>ch('rfcEmpresa',v.toUpperCase())}/></div>
                <div><label style={lbl}>Ocupación</label><Inp val={c.ocupacion} onChange={v=>ch('ocupacion',v)}/></div>
              </> : <>
                <Dato label="Fuente de ingresos" value={selected.fuenteIngresos}/>
                <Dato label="Empresa" value={selected.empresa}/>
                <Dato label="RFC empresa" value={selected.rfcEmpresa}/>
                <Dato label="Ocupación" value={selected.ocupacion}/>
              </>}
            </Grid>
          </Sec>

          {/* ── Cónyuge ── */}
          {(selected.conyuge?.nombre || selected.estadoCivil==='Casado(a)' || selected.estadoCivil==='Union libre') && (
            <Sec icon={Heart} title="Cónyuge" iconBg="#fce8f0" iconColor="#be185d" open={false}>
              <div style={{ display:'flex', gap:'20px', alignItems:'flex-start', flexWrap:'wrap' }}>
                <Grid>
                  {editando ? <>
                    <div><label style={lbl}>Nombre</label><Inp val={c.conyuge?.nombre} onChange={v=>ch('conyuge.nombre',v)}/></div>
                    <div><label style={lbl}>Teléfono</label><Inp val={c.conyuge?.telefono} onChange={v=>ch('conyuge.telefono',v)}/></div>
                    <div><label style={lbl}>Trabajo</label><Inp val={c.conyuge?.trabajo} onChange={v=>ch('conyuge.trabajo',v)}/></div>
                    <div><label style={lbl}>Dirección trabajo</label><Inp val={c.conyuge?.direccionTrabajo} onChange={v=>ch('conyuge.direccionTrabajo',v)}/></div>
                  </> : <>
                    <Dato label="Nombre" value={selected.conyuge?.nombre}/>
                    <Dato label="Teléfono" value={selected.conyuge?.telefono}/>
                    <Dato label="Trabajo" value={selected.conyuge?.trabajo}/>
                    <Dato label="Dirección trabajo" value={selected.conyuge?.direccionTrabajo}/>
                  </>}
                </Grid>
                {selected.conyuge?.foto && <Foto src={selected.conyuge.foto} label="Foto cónyuge" onZoom={(s,l)=>setZoom({src:s,label:l})}/>}
              </div>
            </Sec>
          )}

          {/* ── Referencias ── */}
          {selected.referencias?.filter(r => r.nombre)?.length > 0 && (
            <Sec icon={Users} title="Referencias personales" open={false}>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                {selected.referencias.filter(r => r.nombre).map((r,i) => (
                  <div key={i} style={{ padding:'12px 16px', background:'#f8fbff', borderRadius:'10px', border:'1px solid #dceaf8' }}>
                    <div style={{ fontSize:'11px', fontWeight:'700', color:'#0e50a0', textTransform:'uppercase', marginBottom:'8px' }}>Referencia {i+1}</div>
                    <Grid min="180px">
                      <Dato label="Nombre" value={r.nombre}/>
                      <Dato label="Teléfono" value={r.telefono}/>
                      <Dato label="Domicilio" value={r.domicilio || [r.calle, r.colonia, r.municipio].filter(Boolean).join(', ')}/>
                      {r.parentesco && <Dato label="Parentesco" value={r.parentesco}/>}
                    </Grid>
                  </div>
                ))}
              </div>
            </Sec>
          )}

          {/* ── Documentos / Fotos ── */}
          <Sec icon={Camera} title="Documentos y fotografías" open={false}>
            <div style={{ marginBottom:'16px' }}>
              <div style={{ fontSize:'11px', fontWeight:'700', color:'#90aac8', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'12px' }}>Fotografías</div>
              <div style={{ display:'flex', gap:'20px', flexWrap:'wrap' }}>
                <Foto src={selected.documentos?.fotoPerfil || selected.fotos?.cliente} label="Foto perfil / cliente" onZoom={(s,l)=>setZoom({src:s,label:l})}/>
                <Foto src={selected.documentos?.fachadaCasa || selected.fotos?.casa} label="Fachada de casa" onZoom={(s,l)=>setZoom({src:s,label:l})}/>
                <Foto src={selected.documentos?.fachadaNegocio || selected.fotos?.negocio} label="Fachada de negocio" onZoom={(s,l)=>setZoom({src:s,label:l})}/>
              </div>
            </div>
            <div>
              <div style={{ fontSize:'11px', fontWeight:'700', color:'#90aac8', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'4px' }}>Documentos digitales</div>
              {[
                ['Comprobante domicilio',  selected.documentos?.comprobanteDomicilio],
                ['Comprobante de ingresos',selected.documentos?.comprobanteIngresos],
                ['Identificación oficial', selected.documentos?.identificacion],
                ['Acta de nacimiento',     selected.documentos?.actaNacimiento],
                ['CURP',                   selected.documentos?.curpDoc],
              ].map(([label, val]) => (
                <DocItem key={label} label={label} value={val} onZoom={(s,l)=>setZoom({src:s,label:l})}/>
              ))}
            </div>
          </Sec>

        </div>
      )}

      {/* ── Modal lista negra / reactivar ── */}
      {modalBaja && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'20px' }}>
          <div style={{ background:'#fff', borderRadius:'16px', padding:'28px', maxWidth:'420px', width:'100%', boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:'20px', fontWeight:'700', color:'#0a2d5e', marginBottom:'6px' }}>
              {selected?.estatus==='Lista negra' ? 'Reactivar cliente' : 'Enviar a lista negra'}
            </div>
            <div style={{ fontSize:'13px', color:'#4a6a94', marginBottom:'20px' }}>
              {selected?.estatus==='Lista negra'
                ? `¿Confirmas reactivar a ${nombreCompleto}?`
                : `Esto bloqueará a ${nombreCompleto} del sistema.`}
            </div>
            <div style={{ marginBottom:'14px' }}>
              <label style={{ ...lbl, display:'block', marginBottom:'6px' }}>
                {selected?.estatus==='Lista negra' ? 'Motivo de reactivación' : 'Motivo de la baja'} *
              </label>
              <textarea value={motivoBaja} onChange={e=>setMotivoBaja(e.target.value)} rows={3}
                style={{ width:'100%', border:'1.5px solid #dceaf8', borderRadius:'9px', padding:'10px 12px', fontSize:'13px', fontFamily:'DM Sans, sans-serif', color:'#1a3d6e', outline:'none', resize:'vertical', boxSizing:'border-box' }}
                placeholder="Describe el motivo..."
              />
            </div>
            {selected?.estatus !== 'Lista negra' && (
              <div style={{ marginBottom:'20px' }}>
                <label style={{ ...lbl, display:'block', marginBottom:'6px' }}>Monto adeudado ($)</label>
                <input type="number" value={montoBaja} onChange={e=>setMontoBaja(e.target.value)}
                  style={{ border:'1.5px solid #dceaf8', borderRadius:'9px', padding:'9px 12px', fontSize:'13px', fontFamily:'DM Sans, sans-serif', color:'#1a3d6e', outline:'none', width:'100%', background:'#fafcff', boxSizing:'border-box' }}
                  placeholder="0.00"
                />
              </div>
            )}
            <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end' }}>
              <button onClick={()=>{ setModalBaja(false); setMotivoBaja(''); setMontoBaja(''); }} style={{ background:'#fff', border:'1.5px solid #dceaf8', borderRadius:'9px', padding:'9px 20px', fontSize:'13px', fontWeight:'600', color:'#4a6a94', cursor:'pointer' }}>Cancelar</button>
              <button onClick={confirmarBaja} disabled={!motivoBaja.trim()||procesando}
                style={{ background: selected?.estatus==='Lista negra'?'#0e50a0':'#dc2626', color:'#fff', border:'none', borderRadius:'9px', padding:'9px 20px', fontSize:'13px', fontWeight:'600', cursor: !motivoBaja.trim()?'not-allowed':'pointer', opacity: !motivoBaja.trim()?0.6:1, display:'flex', alignItems:'center', gap:'6px' }}>
                {procesando ? <Loader size={13} style={{ animation:'spin 1s linear infinite' }}/> : null}
                {selected?.estatus==='Lista negra' ? 'Reactivar' : 'Confirmar baja'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Lightbox zoom foto / documento ── */}
      {zoom && (
        <div onClick={()=>setZoom(null)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', zIndex:2000, cursor:'zoom-out', padding:'20px' }}>
          <button onClick={()=>setZoom(null)} style={{ position:'fixed', top:'20px', right:'24px', background:'rgba(255,255,255,0.15)', border:'none', borderRadius:'50%', width:'40px', height:'40px', cursor:'pointer', color:'#fff', fontSize:'20px', display:'flex', alignItems:'center', justifyContent:'center' }}><X size={18}/></button>
          <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.7)', marginBottom:'12px', fontWeight:'600' }}>{zoom.label}</div>
          <img src={zoom.src} alt={zoom.label} onClick={e=>e.stopPropagation()} style={{ maxWidth:'90vw', maxHeight:'80vh', borderRadius:'12px', boxShadow:'0 20px 60px rgba(0,0,0,0.5)', objectFit:'contain' }}/>
        </div>
      )}

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

const lbl = { fontSize:'11px', fontWeight:'600', color:'#90aac8', textTransform:'uppercase', letterSpacing:'0.06em', display:'block', marginBottom:'5px' };