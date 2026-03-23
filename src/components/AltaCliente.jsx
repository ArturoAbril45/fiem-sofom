'use client';
import { useState, useRef, useEffect } from 'react';
import {
  User, FileText, MapPin, Save, RotateCcw, CheckCircle, AlertCircle,
  Loader, Camera, Heart, Users, X, Briefcase, DollarSign, Home,
  ChevronRight, ChevronLeft, Phone, Mail, Shield
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://fiem-backend-production.up.railway.app';

const ESTADOS_MX = [
  'Aguascalientes','Baja California','Baja California Sur','Campeche','Chiapas','Chihuahua',
  'Ciudad de Mexico','Coahuila de Zaragoza','Colima','Distrito Federal','Durango','Guanajuato',
  'Guerrero','Hidalgo','Jalisco','Mexico','Michoacan','Morelos','Nayarit','Nuevo Leon',
  'Oaxaca','Puebla','Queretaro','Quintana Roo','San Luis Potosi','Sinaloa','Sonora',
  'Tabasco','Tamaulipas','Tlaxcala','Veracruz','Yucatan','Zacatecas'
];

const RUTAS_DEFAULT = [
  'Apaxco Sucursal-Apaxco','Tequix Sucursal-tequix','Huehue sucursal-Huehuetoca',
  'Temas Sucursal-Temascalapa','Tizayuca 1 Sucursal-tizayuca1','OFC-CTRAL OFICINA CENTRAL',
  '01-sucursa 01-sucursal-tula','01 Legal','01 Ajoloapan','01 APAXCO-2','02 TEOLOYUCAN',
];

const REQUERIDOS = ['nombre', 'apellidoPaterno', 'fechaNacimiento', 'curp', 'celular'];

const INITIAL = {
  tipoCliente:'', rutaVinculacion:'', accesoWeb:'',
  apellidoPaterno:'', apellidoMaterno:'', nombre:'',
  telefonoParticular:'', telefonoOficina:'', celular:'',
  fechaNacimiento:'', lugarNacimiento:'', genero:'', estadoCivil:'',
  rfc:'', correo:'', numDependientes:'', curp:'', ine:'',
  conyuge_nombre:'', conyuge_telefono:'', conyuge_trabajo:'', conyuge_direccionTrabajo:'',
  ref1_nombre:'', ref1_telefono:'', ref1_domicilio:'',
  ref2_nombre:'', ref2_telefono:'', ref2_domicilio:'',
  cp:'', calle:'', numExt:'', numInt:'',
  entreCalles1:'', entreCalles2:'', referenciaUbicacion:'', referenciaAdicional:'',
  colonia:'', municipio:'', estado:'',
  ingresoMensual:'0', otrosIngresos:'0',
  gastoAlimento:'', gastoLuz:'', gastoTelefono:'', gastoTransporte:'',
  gastoRenta:'', gastoInversion:'', gastoCreditos:'', gastoOtros:'',
  tipoVivienda:'',
  elecRefrigerador:'', elecEstufa:'', elecLavadora:'', elecTelevision:'',
  elecLicuadora:'', elecHorno:'', elecComputadora:'', elecSala:'',
  elecCelular:'', elecVehiculo:'',
  fuenteIngresos:'', empresa:'', rfcEmpresa:'',
  cpLaboral:'', calleLaboral:'', numExtLaboral:'', numIntLaboral:'',
  entreCalles1Laboral:'', entreCalles2Laboral:'', referenciaAdicionalLaboral:'',
  confirmar: false,
};

// ── Componente etiqueta + input ──────────────────────────────────────────
function Campo({ label, required, error, children }) {
  return (
    <div>
      <label style={{ display:'block', fontSize:'11px', fontWeight:'600', color: error ? '#ef4444' : '#7a9cc4', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'5px' }}>
        {label}{required && <span style={{ color:'#ef4444' }}> *</span>}
      </label>
      {children}
      {error && <span style={{ color:'#ef4444', fontSize:'10px' }}>Campo requerido</span>}
    </div>
  );
}

// ── Estilos de input reutilizables ───────────────────────────────────────
const makeInp = (err) => ({
  border: `1.5px solid ${err ? '#ef4444' : '#dceaf8'}`,
  borderRadius:'8px', padding:'9px 12px', fontSize:'13px',
  fontFamily:'DM Sans, sans-serif', color:'#1a3d6e', outline:'none',
  width:'100%', background:'#fafcff', boxSizing:'border-box',
  transition:'border-color 0.15s',
});
const makeSel = (err) => ({ ...makeInp(err), cursor:'pointer' });

// ── Card con encabezado ──────────────────────────────────────────────────
function Card({ title, icon: Icon, iconBg='#e8f2fc', iconColor='#0e50a0', badge, children }) {
  return (
    <div style={{ background:'#fff', borderRadius:'14px', border:'1px solid #dceaf8', boxShadow:'0 2px 12px rgba(14,80,160,0.06)', marginBottom:'18px' }}>
      <div style={{ padding:'14px 22px', borderBottom:'1px solid #f0f6ff', display:'flex', alignItems:'center', gap:'10px' }}>
        <div style={{ width:'32px', height:'32px', background:iconBg, borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <Icon size={16} color={iconColor} />
        </div>
        <span style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:'17px', fontWeight:'700', color:'#0a2d5e', flex:1 }}>{title}</span>
        {badge && <span style={{ fontSize:'11px', color:'#90aac8', fontWeight:'600' }}>{badge}</span>}
      </div>
      <div style={{ padding:'18px 22px' }}>{children}</div>
    </div>
  );
}

// ── Grid responsive ──────────────────────────────────────────────────────
function Grid({ min='200px', children }) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:`repeat(auto-fit, minmax(${min}, 1fr))`, gap:'14px' }}>
      {children}
    </div>
  );
}

// ── Fila de documento ────────────────────────────────────────────────────
function DocRow({ DocIcon, label, value, onChange }) {
  const ref = useRef();
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'16px', padding:'14px 0', borderBottom:'1px solid #f5f8ff' }}>
      <div style={{ width:'56px', height:'56px', display:'flex', alignItems:'center', justifyContent:'center', background:'#f0f6ff', borderRadius:'10px', flexShrink:0 }}>
        <DocIcon size={30} color="#3a6ea8" strokeWidth={1.3} />
      </div>
      <span style={{ fontSize:'14px', color:'#1a3d6e', fontWeight:'500', flex:1 }}>{label}</span>
      <input ref={ref} type="file" accept="image/*,application/pdf" style={{ display:'none' }}
        onChange={e => { const f=e.target.files[0]; if(!f) return; const r=new FileReader(); r.onload=ev=>onChange(ev.target.result); r.readAsDataURL(f); }} />
      {value
        ? <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <span style={{ fontSize:'12px', color:'#0e50a0', fontWeight:'600', background:'#e8f2fc', padding:'4px 10px', borderRadius:'20px' }}>Cargado</span>
            <button onClick={() => onChange('')} style={{ background:'none', border:'none', cursor:'pointer', color:'#ef4444', display:'flex' }}><X size={14}/></button>
          </div>
        : <button onClick={() => ref.current.click()} style={{ background:'#0e50a0', color:'#fff', border:'none', borderRadius:'8px', padding:'7px 16px', fontSize:'12px', fontWeight:'600', cursor:'pointer', fontFamily:'DM Sans, sans-serif', whiteSpace:'nowrap' }}>
            Seleccionar archivo
          </button>
      }
    </div>
  );
}

// ── Foto upload (cónyuge) ────────────────────────────────────────────────
function FotoUpload({ label, value, onChange }) {
  const ref = useRef();
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'6px' }}>
      <div onClick={() => ref.current.click()} style={{ width:'90px', height:'90px', borderRadius:'10px', border:`2px dashed ${value ? '#0e50a0' : '#dceaf8'}`, background: value ? 'transparent' : '#f4f9ff', cursor:'pointer', overflow:'hidden', position:'relative', display:'flex', alignItems:'center', justifyContent:'center' }}>
        {value
          ? <img src={value} alt={label} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          : <div style={{ textAlign:'center', color:'#90aac8' }}><Camera size={20}/><div style={{ fontSize:'10px', marginTop:'3px', fontWeight:'600' }}>Subir foto</div></div>
        }
        {value && <button onClick={e=>{ e.stopPropagation(); onChange(''); }} style={{ position:'absolute', top:'3px', right:'3px', background:'rgba(0,0,0,0.5)', border:'none', borderRadius:'50%', width:'18px', height:'18px', cursor:'pointer', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}><X size={10}/></button>}
      </div>
      <input ref={ref} type="file" accept="image/*" style={{ display:'none' }}
        onChange={e => { const f=e.target.files[0]; if(!f) return; const r=new FileReader(); r.onload=ev=>onChange(ev.target.result); r.readAsDataURL(f); }} />
      <span style={{ fontSize:'10px', fontWeight:'600', color:'#4a6a94' }}>{label}</span>
    </div>
  );
}

// ── Bloque de domicilio reutilizable ─────────────────────────────────────
function DomicilioBlock({ form, ch, errors={}, prefijo='' }) {
  const f = n => prefijo ? `${n}${prefijo}` : n;
  const inp = makeInp;
  const sel = makeSel;
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
      <Grid min="160px">
        <Campo label="Código postal">
          <div style={{ display:'flex', gap:'8px' }}>
            <input value={form[f('cp')]||''} onChange={e=>ch(f('cp'),e.target.value)} style={{ ...inp(false), width:'100%' }} />
            <button style={{ background:'#0e50a0', color:'#fff', border:'none', borderRadius:'8px', padding:'0 14px', fontSize:'12px', fontWeight:'600', cursor:'pointer', whiteSpace:'nowrap' }}>BUSCAR</button>
          </div>
        </Campo>
        <Campo label="Calle"><input value={form[f('calle')]||''} onChange={e=>ch(f('calle'),e.target.value)} style={inp(false)} /></Campo>
        <Campo label="No. exterior"><input value={form[f('numExt')]||''} onChange={e=>ch(f('numExt'),e.target.value)} style={inp(false)} /></Campo>
        <Campo label="No. interior"><input value={form[f('numInt')]||''} onChange={e=>ch(f('numInt'),e.target.value)} style={inp(false)} /></Campo>
        <Campo label="Entre la calle de"><input value={form[f('entreCalles1')]||''} onChange={e=>ch(f('entreCalles1'),e.target.value)} style={inp(false)} /></Campo>
        <Campo label="Y de"><input value={form[f('entreCalles2')]||''} onChange={e=>ch(f('entreCalles2'),e.target.value)} style={inp(false)} /></Campo>
      </Grid>
      <Campo label="Referencia adicional">
        <input value={form[f('referenciaAdicional')]||''} onChange={e=>ch(f('referenciaAdicional'),e.target.value)} style={inp(false)} placeholder="Descripción para localizar el domicilio" />
      </Campo>
      {/* Mapa placeholder */}
      <div style={{ borderRadius:'12px', border:'1px solid #dceaf8', height:'180px', background:'#f4f8fd', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'8px', color:'#90aac8' }}>
        <MapPin size={28} color="#0e50a0" strokeWidth={1.5} />
        <span style={{ fontSize:'13px', fontWeight:'600', color:'#4a6a94' }}>Arrastra el marcador para ubicar el domicilio</span>
        <span style={{ fontSize:'11px' }}>Mapa de Google Maps</span>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
export default function AltaCliente() {
  const [tab,         setTab]         = useState(0);
  const [form,        setForm]        = useState(INITIAL);
  const [docs,        setDocs]        = useState({ comprobanteDomicilio:'', comprobanteIngresos:'', identificacion:'', fotoPerfil:'', actaNacimiento:'', curpDoc:'', fachadaCasa:'', fachadaNegocio:'' });
  const [fotoConyuge, setFotoConyuge] = useState('');
  const [errors,      setErrors]      = useState({});
  const [estado,      setEstado]      = useState(null); // null | 'loading' | 'ok' | 'error'
  const [msg,         setMsg]         = useState('');
  const [rutas,       setRutas]       = useState([]);

  useEffect(() => {
    fetch(`${API}/api/rutas`).then(r=>r.json()).then(d=>{ if(Array.isArray(d)&&d.length>0) setRutas(d); }).catch(()=>{});
  }, []);

  const ch = (n, v) => { setForm(p=>({...p,[n]:v})); if(errors[n]) setErrors(p=>({...p,[n]:false})); };
  const num = v => parseFloat(v)||0;

  const ingresoTotal   = num(form.ingresoMensual) + num(form.otrosIngresos);
  const totalGasto     = ['gastoAlimento','gastoLuz','gastoTelefono','gastoTransporte','gastoRenta','gastoInversion','gastoCreditos','gastoOtros'].reduce((a,k)=>a+num(form[k]),0);
  const totalDisponible = ingresoTotal - totalGasto;

  const validate = () => {
    const errs = {};
    REQUERIDOS.forEach(k => { if(!form[k]) errs[k]=true; });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) { setTab(0); return; }
    if (!form.confirmar) {
      setTab(3); setEstado('error'); setMsg('Marca "Confirmar datos" antes de guardar.');
      setTimeout(()=>setEstado(null),3000); return;
    }
    setEstado('loading');
    try {
      const esCasado = form.estadoCivil==='Casado(a)' || form.estadoCivil==='Union libre';
      const payload = {
        tipoCliente:form.tipoCliente, rutaVinculacion:form.rutaVinculacion, accesoWeb:form.accesoWeb,
        nombre:form.nombre, apellidoP:form.apellidoPaterno, apellidoM:form.apellidoMaterno,
        curp:form.curp.toUpperCase(), rfc:form.rfc.toUpperCase(), ine:form.ine,
        fechaNac:form.fechaNacimiento, sexo:form.genero, estadoCivil:form.estadoCivil,
        lugarNacimiento:form.lugarNacimiento, numDependientes:form.numDependientes,
        telefono:form.telefonoParticular, telefonoOficina:form.telefonoOficina,
        celular:form.celular, correo:form.correo,
        calle:form.calle, colonia:form.colonia, municipio:form.municipio,
        estado:form.estado, cp:form.cp, numExt:form.numExt, numInt:form.numInt,
        entreCalles1:form.entreCalles1, entreCalles2:form.entreCalles2,
        referenciaAdicional:form.referenciaAdicional,
        ingresoMensual:form.ingresoMensual, otrosIngresos:form.otrosIngresos,
        ingresoTotal, totalGasto, totalDisponible,
        gastos:{ alimento:form.gastoAlimento, luz:form.gastoLuz, telefono:form.gastoTelefono, transporte:form.gastoTransporte, renta:form.gastoRenta, inversion:form.gastoInversion, creditos:form.gastoCreditos, otros:form.gastoOtros },
        estudioSocioeconomico:{ tipoVivienda:form.tipoVivienda, electrodomesticos:{ refrigerador:form.elecRefrigerador, estufa:form.elecEstufa, lavadora:form.elecLavadora, television:form.elecTelevision, licuadora:form.elecLicuadora, horno:form.elecHorno, computadora:form.elecComputadora, sala:form.elecSala, celular:form.elecCelular, vehiculo:form.elecVehiculo } },
        fuenteIngresos:form.fuenteIngresos, empresa:form.empresa, rfcEmpresa:form.rfcEmpresa,
        domicilioLaboral:{ cp:form.cpLaboral, calle:form.calleLaboral, numExt:form.numExtLaboral, numInt:form.numIntLaboral, entreCalles1:form.entreCalles1Laboral, entreCalles2:form.entreCalles2Laboral, referenciaAdicional:form.referenciaAdicionalLaboral },
        estatus:'Activo',
        conyuge: esCasado ? { nombre:form.conyuge_nombre, telefono:form.conyuge_telefono, trabajo:form.conyuge_trabajo, direccionTrabajo:form.conyuge_direccionTrabajo, foto:fotoConyuge } : null,
        referencias:[
          { nombre:form.ref1_nombre, telefono:form.ref1_telefono, domicilio:form.ref1_domicilio },
          { nombre:form.ref2_nombre, telefono:form.ref2_telefono, domicilio:form.ref2_domicilio },
        ].filter(r=>r.nombre),
        documentos:docs,
      };
      const res  = await fetch(`${API}/api/clientes`,{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error||'Error al guardar');
      setEstado('ok'); setMsg(`Cliente ${form.nombre} ${form.apellidoPaterno} registrado correctamente.`);
      setTimeout(()=>{ setForm(INITIAL); setDocs({comprobanteDomicilio:'',comprobanteIngresos:'',identificacion:'',fotoPerfil:'',actaNacimiento:'',curpDoc:'',fachadaCasa:'',fachadaNegocio:''}); setFotoConyuge(''); setEstado(null); setMsg(''); setTab(0); },3500);
    } catch(e) {
      setEstado('error'); setMsg(e.message.includes('duplicate')?'Ya existe un cliente con ese CURP.':e.message);
      setTimeout(()=>setEstado(null),4000);
    }
  };

  const reset = () => { setForm(INITIAL); setDocs({comprobanteDomicilio:'',comprobanteIngresos:'',identificacion:'',fotoPerfil:'',actaNacimiento:'',curpDoc:'',fachadaCasa:'',fachadaNegocio:''}); setFotoConyuge(''); setErrors({}); setEstado(null); setMsg(''); setTab(0); };

  const inp = makeInp;
  const sel = makeSel;
  const esCasado = form.estadoCivil==='Casado(a)' || form.estadoCivil==='Union libre';

  const TABS = [
    { label:'Información general',    icon:User },
    { label:'Documentación digital',  icon:FileText },
    { label:'Información financiera', icon:DollarSign },
    { label:'Información laboral',    icon:Briefcase },
  ];

  // ── Número de input financiero ──
  const NumInp = ({ name, readOnly=false, value, color }) => (
    <input
      type="number" readOnly={readOnly}
      value={value !== undefined ? value : form[name]||''}
      onChange={readOnly ? undefined : e=>ch(name,e.target.value)}
      style={{ border:'1.5px solid #dceaf8', borderRadius:'8px', padding:'8px 10px', fontSize:'13px', fontFamily:'DM Sans, sans-serif', color: color||'#1a3d6e', outline:'none', width:'130px', background: readOnly?'#f0f6ff':'#fafcff', fontWeight: readOnly?'700':'400' }}
    />
  );

  return (
    <div style={{ maxWidth:'860px', margin:'0 auto', fontFamily:'DM Sans, sans-serif' }}>

      {/* Notificaciones */}
      {estado==='ok' && (
        <div style={{ background:'#dcfce7', border:'1px solid #86efac', borderRadius:'12px', padding:'13px 18px', marginBottom:'18px', color:'#166534', fontSize:'13px', fontWeight:'600', display:'flex', alignItems:'center', gap:'10px' }}>
          <CheckCircle size={16}/> {msg}
        </div>
      )}
      {estado==='error' && (
        <div style={{ background:'#fee2e2', border:'1px solid #fca5a5', borderRadius:'12px', padding:'13px 18px', marginBottom:'18px', color:'#dc2626', fontSize:'13px', fontWeight:'600', display:'flex', alignItems:'center', gap:'10px' }}>
          <AlertCircle size={16}/> {msg}
        </div>
      )}

      {/* ── Pestañas ── */}
      <div style={{ background:'#fff', borderRadius:'14px', border:'1px solid #dceaf8', boxShadow:'0 2px 12px rgba(14,80,160,0.06)', marginBottom:'20px', overflow:'hidden' }}>
        <div style={{ display:'flex', overflowX:'auto' }}>
          {TABS.map(({ label, icon: Icon }, i) => (
            <button key={i} onClick={()=>setTab(i)} style={{ flex:1, minWidth:'140px', padding:'14px 10px', border:'none', borderBottom: tab===i ? '3px solid #0e50a0' : '3px solid transparent', cursor:'pointer', fontSize:'12px', fontWeight: tab===i?'700':'500', color: tab===i?'#0e50a0':'#90aac8', background: tab===i?'#f0f7ff':'transparent', fontFamily:'DM Sans, sans-serif', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', transition:'all 0.15s' }}>
              <Icon size={14}/> {label}
            </button>
          ))}
        </div>
        <div style={{ padding:'10px 22px 8px', background:'#f8fbff', borderTop:'1px solid #f0f6ff' }}>
          <p style={{ margin:0, fontSize:'12px', color:'#90aac8' }}>
            Rellena la información en cada pestaña. Al finalizar pulsa <strong style={{ color:'#0e50a0' }}>Agregar cliente</strong> en la última pestaña.
          </p>
        </div>
      </div>

      {/* ══════════════════════ TAB 0 — INFORMACIÓN GENERAL ══════════════════════ */}
      {tab===0 && <>

        {/* Clasificación */}
        <Card title="Clasificación del cliente" icon={Shield}>
          <Grid min="220px">
            <Campo label="Tipo de cliente">
              <select value={form.tipoCliente} onChange={e=>ch('tipoCliente',e.target.value)} style={sel(false)}>
                <option value="">Selecciona una opción</option>
                <option value="Titular Fisica">Titular Física (Persona física)</option>
                <option value="Aval">Aval</option>
                <option value="Titular Moral">Titular Moral (Persona moral)</option>
              </select>
            </Campo>
            <Campo label="Ruta vinculación">
              <select value={form.rutaVinculacion} onChange={e=>ch('rutaVinculacion',e.target.value)} style={sel(false)}>
                <option value="">-Elige-</option>
                {(rutas.length>0 ? rutas.map(r=>r.nombre||r.clave) : RUTAS_DEFAULT).map(n=><option key={n} value={n}>{n}</option>)}
              </select>
            </Campo>
            <Campo label="Permitir acceso web de socios">
              <select value={form.accesoWeb} onChange={e=>ch('accesoWeb',e.target.value)} style={sel(false)}>
                <option value="">-Elige-</option>
                <option value="SI">Sí</option>
                <option value="NO">No</option>
              </select>
            </Campo>
          </Grid>
        </Card>

        {/* Datos personales */}
        <Card title="Datos personales" icon={User}>
          <Grid>
            <Campo label="Apellido paterno" required error={errors.apellidoPaterno}>
              <input value={form.apellidoPaterno} onChange={e=>ch('apellidoPaterno',e.target.value)} style={inp(errors.apellidoPaterno)} placeholder="Apellido paterno"/>
            </Campo>
            <Campo label="Apellido materno">
              <input value={form.apellidoMaterno} onChange={e=>ch('apellidoMaterno',e.target.value)} style={inp(false)} placeholder="Apellido materno"/>
            </Campo>
            <Campo label="Nombre(s)" required error={errors.nombre}>
              <input value={form.nombre} onChange={e=>ch('nombre',e.target.value)} style={inp(errors.nombre)} placeholder="Nombre(s)"/>
            </Campo>
            <Campo label="Teléfono particular">
              <input type="tel" value={form.telefonoParticular} onChange={e=>ch('telefonoParticular',e.target.value)} style={inp(false)}/>
            </Campo>
            <Campo label="Teléfono oficina">
              <input type="tel" value={form.telefonoOficina} onChange={e=>ch('telefonoOficina',e.target.value)} style={inp(false)}/>
            </Campo>
            <Campo label="Teléfono celular" required error={errors.celular}>
              <input type="tel" value={form.celular} onChange={e=>ch('celular',e.target.value)} style={inp(errors.celular)}/>
            </Campo>
            <Campo label="Fecha de nacimiento" required error={errors.fechaNacimiento}>
              <input type="date" value={form.fechaNacimiento} onChange={e=>ch('fechaNacimiento',e.target.value)} style={inp(errors.fechaNacimiento)}/>
            </Campo>
            <Campo label="Lugar de nacimiento">
              <select value={form.lugarNacimiento} onChange={e=>ch('lugarNacimiento',e.target.value)} style={sel(false)}>
                <option value="">-Elige-</option>
                {ESTADOS_MX.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </Campo>
            <Campo label="Sexo">
              <select value={form.genero} onChange={e=>ch('genero',e.target.value)} style={sel(false)}>
                <option value="">-Elige-</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
            </Campo>
            <Campo label="Estado civil">
              <select value={form.estadoCivil} onChange={e=>ch('estadoCivil',e.target.value)} style={sel(false)}>
                <option value="">-Elige-</option>
                <option value="Soltero(a)">Soltero(a)</option>
                <option value="Casado(a)">Casado(a)</option>
                <option value="Union libre">Unión libre</option>
                <option value="Divorciado(a)">Divorciado(a)</option>
                <option value="Viudo(a)">Viudo(a)</option>
              </select>
            </Campo>
            <Campo label="RFC">
              <input value={form.rfc} onChange={e=>ch('rfc',e.target.value.toUpperCase())} style={inp(false)} placeholder="Ingrese su RFC"/>
            </Campo>
            <Campo label="Correo electrónico">
              <input type="email" value={form.correo} onChange={e=>ch('correo',e.target.value)} style={inp(false)}/>
            </Campo>
            <Campo label="No. dependientes económicos">
              <input type="number" value={form.numDependientes} onChange={e=>ch('numDependientes',e.target.value)} style={inp(false)} min="0"/>
            </Campo>
            <Campo label="CURP" required error={errors.curp}>
              <div style={{ display:'flex', gap:'8px' }}>
                <button style={{ background:'#0e50a0', color:'#fff', border:'none', borderRadius:'8px', padding:'0 12px', fontSize:'12px', fontWeight:'600', cursor:'pointer', whiteSpace:'nowrap' }}>Generar</button>
                <input value={form.curp} onChange={e=>ch('curp',e.target.value.toUpperCase())} style={{ ...inp(errors.curp), flex:1 }} placeholder="CURP"/>
              </div>
            </Campo>
            <Campo label="No. INE/IFE">
              <input value={form.ine} onChange={e=>ch('ine',e.target.value)} style={inp(false)}/>
            </Campo>
          </Grid>
        </Card>

        {/* Cónyuge */}
        {esCasado && (
          <Card title="Datos del cónyuge" icon={Heart} iconBg="#fce8f0" iconColor="#be185d">
            <div style={{ display:'flex', gap:'24px', flexWrap:'wrap', alignItems:'flex-start' }}>
              <div style={{ flex:1, minWidth:'280px' }}>
                <Grid>
                  <Campo label="Nombre"><input value={form.conyuge_nombre} onChange={e=>ch('conyuge_nombre',e.target.value)} style={inp(false)}/></Campo>
                  <Campo label="Teléfono"><input type="tel" value={form.conyuge_telefono} onChange={e=>ch('conyuge_telefono',e.target.value)} style={inp(false)}/></Campo>
                  <Campo label="Nombre del trabajo"><input value={form.conyuge_trabajo} onChange={e=>ch('conyuge_trabajo',e.target.value)} style={inp(false)}/></Campo>
                  <Campo label="Dirección del trabajo"><input value={form.conyuge_direccionTrabajo} onChange={e=>ch('conyuge_direccionTrabajo',e.target.value)} style={inp(false)}/></Campo>
                </Grid>
              </div>
              <FotoUpload label="Foto cónyuge" value={fotoConyuge} onChange={setFotoConyuge}/>
            </div>
          </Card>
        )}

        {/* Referencias */}
        <Card title="Datos de contacto de referencia" icon={Users} badge="2 referencias">
          {[1,2].map(n => (
            <div key={n} style={{ marginBottom: n<2?'14px':0, paddingBottom: n<2?'14px':0, borderBottom: n<2?'1px solid #f0f6ff':'none' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 2fr', gap:'12px' }}>
                <Campo label={`Nombre ${n}`}><input value={form[`ref${n}_nombre`]} onChange={e=>ch(`ref${n}_nombre`,e.target.value)} style={inp(false)}/></Campo>
                <Campo label="Teléfono"><input type="tel" value={form[`ref${n}_telefono`]} onChange={e=>ch(`ref${n}_telefono`,e.target.value)} style={inp(false)}/></Campo>
                <Campo label="Domicilio"><input value={form[`ref${n}_domicilio`]} onChange={e=>ch(`ref${n}_domicilio`,e.target.value)} style={inp(false)} placeholder="Calle, colonia, municipio"/></Campo>
              </div>
            </div>
          ))}
        </Card>

        {/* Domicilio */}
        <Card title="Domicilio" icon={MapPin}>
          <DomicilioBlock form={form} ch={ch} prefijo=""/>
        </Card>
      </>}

      {/* ══════════════════════ TAB 1 — DOCUMENTACIÓN DIGITAL ══════════════════════ */}
      {tab===1 && (
        <Card title="Documentación digital" icon={FileText}>
          <p style={{ fontSize:'13px', color:'#4a6a94', background:'#f0f7ff', padding:'10px 14px', borderRadius:'8px', margin:'0 0 16px', border:'1px solid #dceaf8' }}>
            La documentación es opcional. Una vez cargado el cliente puedes actualizar los documentos posteriormente.
          </p>
          <DocRow DocIcon={DocIcon1} label="Comprobante domicilio"    value={docs.comprobanteDomicilio}  onChange={v=>setDocs(p=>({...p,comprobanteDomicilio:v}))}/>
          <DocRow DocIcon={DocIcon2} label="Comprobante de ingresos"  value={docs.comprobanteIngresos}   onChange={v=>setDocs(p=>({...p,comprobanteIngresos:v}))}/>
          <DocRow DocIcon={DocIcon3} label="Identificacion oficial"   value={docs.identificacion}        onChange={v=>setDocs(p=>({...p,identificacion:v}))}/>
          <DocRow DocIcon={DocIcon4} label="Fotografia para perfil"   value={docs.fotoPerfil}            onChange={v=>setDocs(p=>({...p,fotoPerfil:v}))}/>
          <DocRow DocIcon={DocIcon5} label="Acta Nacimiento"          value={docs.actaNacimiento}        onChange={v=>setDocs(p=>({...p,actaNacimiento:v}))}/>
          <DocRow DocIcon={DocIcon6} label="CURP"                     value={docs.curpDoc}               onChange={v=>setDocs(p=>({...p,curpDoc:v}))}/>
          <DocRow DocIcon={DocIcon7} label="Fachada de casa"          value={docs.fachadaCasa}           onChange={v=>setDocs(p=>({...p,fachadaCasa:v}))}/>
          <DocRow DocIcon={DocIcon8} label="Fachada de Negocio"       value={docs.fachadaNegocio}        onChange={v=>setDocs(p=>({...p,fachadaNegocio:v}))}/>
        </Card>
      )}

      {/* ══════════════════════ TAB 2 — INFORMACIÓN FINANCIERA ══════════════════════ */}
      {tab===2 && <>
        {/* Ingresos */}
        <Card title="Ingresos" icon={DollarSign}>
          <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'16px', flexWrap:'wrap' }}>
              <Campo label="Ingreso mensual promedio"><NumInp name="ingresoMensual"/></Campo>
              <Campo label="Otros ingresos"><NumInp name="otrosIngresos"/></Campo>
              <Campo label="Ingreso promedio total">
                <NumInp readOnly value={ingresoTotal} color={ingresoTotal>0?'#166534':'#1a3d6e'}/>
              </Campo>
            </div>
          </div>
        </Card>

        {/* Gastos */}
        <Card title="Gasto promedio mensual" icon={DollarSign} iconBg="#fff3e0" iconColor="#e65100">
          <Grid min="160px">
            {[
              ['Alimento','gastoAlimento'],['Luz','gastoLuz'],
              ['Teléfono','gastoTelefono'],['Transporte','gastoTransporte'],
              ['Renta','gastoRenta'],['Inversión negocio','gastoInversion'],
              ['Créditos','gastoCreditos'],['Otros','gastoOtros'],
            ].map(([label,name]) => (
              <Campo key={name} label={label}><NumInp name={name}/></Campo>
            ))}
          </Grid>
          <div style={{ marginTop:'16px', padding:'12px 16px', background:'#f0f7ff', borderRadius:'10px', display:'flex', gap:'32px', flexWrap:'wrap' }}>
            <span style={{ fontSize:'13px', color:'#4a6a94' }}>Total gasto: <strong style={{ color:'#dc2626' }}>${totalGasto.toLocaleString()}</strong></span>
            <span style={{ fontSize:'13px', color:'#4a6a94' }}>Total disponible mensual: <strong style={{ color: totalDisponible>=0?'#166534':'#dc2626' }}>${totalDisponible.toLocaleString()}</strong></span>
          </div>
        </Card>

        {/* Estudio socioeconómico */}
        <Card title="Estudio socioeconómico" icon={Home}>
          <div style={{ marginBottom:'16px' }}>
            <Campo label="Tipo de vivienda">
              <select value={form.tipoVivienda} onChange={e=>ch('tipoVivienda',e.target.value)} style={{ ...sel(false), maxWidth:'240px' }}>
                <option value="">Propia, Rentada o Familiar</option>
                <option value="Propia">Propia</option>
                <option value="Rentada">Rentada</option>
                <option value="Familiar">Familiar</option>
              </select>
            </Campo>
          </div>
          <p style={{ fontSize:'12px', fontWeight:'700', color:'#4a6a94', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'12px' }}>Cuenta con estos electrodomésticos</p>
          <Grid min="180px">
            {[
              ['Refrigerador','elecRefrigerador'],['Estufa','elecEstufa'],
              ['Lavadora','elecLavadora'],['Televisión','elecTelevision'],
              ['Licuadora','elecLicuadora'],['Horno','elecHorno'],
              ['Computadora','elecComputadora'],['Sala','elecSala'],
              ['Celular','elecCelular'],['Vehículo (Marca, modelo)','elecVehiculo'],
            ].map(([label,name]) => (
              <Campo key={name} label={label}>
                <input value={form[name]} onChange={e=>ch(name,e.target.value)} style={{ ...inp(false), maxWidth:'160px' }}/>
              </Campo>
            ))}
          </Grid>
        </Card>
      </>}

      {/* ══════════════════════ TAB 3 — INFORMACIÓN LABORAL ══════════════════════ */}
      {tab===3 && <>
        <Card title="Información laboral" icon={Briefcase}>
          <Grid>
            <Campo label="Fuente de ingresos">
              <select value={form.fuenteIngresos} onChange={e=>ch('fuenteIngresos',e.target.value)} style={sel(false)}>
                <option value="">En espera de selección...</option>
                <option value="Empleo formal">Empleo formal</option>
                <option value="Negocio propio">Negocio propio</option>
                <option value="Pensionado">Pensionado</option>
                <option value="Honorarios">Honorarios</option>
                <option value="Otro">Otro</option>
              </select>
            </Campo>
            <Campo label="Nombre de la empresa">
              <input value={form.empresa} onChange={e=>ch('empresa',e.target.value)} style={inp(false)}/>
            </Campo>
            <Campo label="RFC de la empresa">
              <input value={form.rfcEmpresa} onChange={e=>ch('rfcEmpresa',e.target.value.toUpperCase())} style={inp(false)}/>
            </Campo>
          </Grid>
        </Card>

        <Card title="Domicilio laboral" icon={MapPin}>
          <DomicilioBlock form={form} ch={ch} prefijo="Laboral"/>
        </Card>

        {/* Confirmar + Agregar */}
        <div style={{ background:'#fff', borderRadius:'14px', border:'1px solid #dceaf8', boxShadow:'0 2px 12px rgba(14,80,160,0.06)', padding:'22px', marginBottom:'18px' }}>
          <label style={{ display:'flex', alignItems:'center', gap:'10px', fontSize:'14px', color:'#1a3d6e', fontWeight:'600', cursor:'pointer', marginBottom:'18px' }}>
            <input type="checkbox" checked={form.confirmar} onChange={e=>ch('confirmar',e.target.checked)}
              style={{ width:'16px', height:'16px', accentColor:'#0e50a0', cursor:'pointer' }}/>
            Confirmar datos — toda la información capturada es correcta
          </label>
          <button onClick={handleSave} disabled={estado==='loading'}
            style={{ width:'100%', background: estado==='loading'?'#90aac8':'#0e50a0', color:'#fff', border:'none', borderRadius:'10px', padding:'15px', fontSize:'16px', fontWeight:'700', cursor: estado==='loading'?'not-allowed':'pointer', fontFamily:'DM Sans, sans-serif', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', boxShadow:'0 6px 20px rgba(14,80,160,0.3)', transition:'background 0.2s' }}>
            {estado==='loading' ? <><Loader size={18} style={{ animation:'spin 1s linear infinite' }}/> Guardando...</> : <><Save size={18}/> Agregar cliente</>}
          </button>
        </div>
      </>}

      {/* Botones de navegación y limpiar */}
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'32px' }}>
        <button onClick={reset} style={{ background:'#fff', border:'1.5px solid #dceaf8', borderRadius:'10px', padding:'9px 20px', fontSize:'13px', fontWeight:'600', color:'#4a6a94', cursor:'pointer', fontFamily:'DM Sans, sans-serif', display:'flex', alignItems:'center', gap:'6px' }}>
          <RotateCcw size={13}/> Limpiar
        </button>
        <div style={{ display:'flex', gap:'8px' }}>
          {tab>0 && <button onClick={()=>setTab(t=>t-1)} style={{ background:'#e8f2fc', border:'none', borderRadius:'10px', padding:'9px 18px', fontSize:'13px', fontWeight:'600', color:'#0e50a0', cursor:'pointer', fontFamily:'DM Sans, sans-serif', display:'flex', alignItems:'center', gap:'6px' }}><ChevronLeft size={14}/> Anterior</button>}
          {tab<3 && <button onClick={()=>setTab(t=>t+1)} style={{ background:'#0e50a0', border:'none', borderRadius:'10px', padding:'9px 18px', fontSize:'13px', fontWeight:'600', color:'#fff', cursor:'pointer', fontFamily:'DM Sans, sans-serif', display:'flex', alignItems:'center', gap:'6px' }}>Siguiente <ChevronRight size={14}/></button>}
        </div>
      </div>

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ── Íconos SVG para documentos ──────────────────────────────────────────
const SvgBase = ({ size, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round">{children}</svg>
);
const DocIcon1 = ({size}) => <SvgBase size={size}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M15 8h2M15 12h2M7 16h10"/></SvgBase>;
const DocIcon2 = ({size}) => <SvgBase size={size}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M12 9v6M9 12h6"/><line x1="2" y1="9" x2="22" y2="9"/></SvgBase>;
const DocIcon3 = ({size}) => <SvgBase size={size}><rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="8" cy="12" r="2"/><line x1="13" y1="10" x2="19" y2="10"/><line x1="13" y1="14" x2="17" y2="14"/></SvgBase>;
const DocIcon4 = ({size}) => <SvgBase size={size}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M6 21c0-3.3 2.7-6 6-6s6 2.7 6 6"/></SvgBase>;
const DocIcon5 = ({size}) => <SvgBase size={size}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="9 15 11 17 15 13"/></SvgBase>;
const DocIcon6 = ({size}) => <SvgBase size={size}><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="12" cy="11" r="2"/><line x1="6" y1="17" x2="18" y2="17"/><line x1="6" y1="8" x2="9" y2="8"/></SvgBase>;
const DocIcon7 = ({size}) => <SvgBase size={size}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></SvgBase>;
const DocIcon8 = ({size}) => <SvgBase size={size}><path d="M3 9h18v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9z"/><path d="M3 9l2.5-5h13L21 9"/><line x1="9" y1="9" x2="9" y2="20"/><line x1="15" y1="9" x2="15" y2="20"/><rect x="10" y="14" width="4" height="6"/></SvgBase>;