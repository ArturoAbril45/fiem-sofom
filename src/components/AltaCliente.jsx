'use client';
import { useState, useRef, useEffect } from 'react';
import {
  User, FileText, MapPin, Phone, Save, RotateCcw,
  CheckCircle, AlertCircle, Loader, Camera, Heart, Users, Upload, X,
  Briefcase, DollarSign, ChevronRight
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://fiem-backend-production.up.railway.app';

const ESTADOS_MX = [
  'Aguascalientes','Baja California','Baja California Sur','Campeche','Chiapas','Chihuahua',
  'Ciudad de Mexico','Coahuila de Zaragoza','Colima','Distrito Federal','Durango','Guanajuato',
  'Guerrero','Hidalgo','Jalisco','Mexico','Michoacan','Morelos','Nayarit','Nuevo Leon',
  'Oaxaca','Puebla','Queretaro','Quintana Roo','San Luis Potosi','Sinaloa','Sonora',
  'Tabasco','Tamaulipas','Tlaxcala','Veracruz','Yucatan','Zacatecas'
];

const REQUERIDOS = ['nombre', 'apellidoPaterno', 'fechaNacimiento', 'curp', 'celular'];

const INITIAL = {
  tipoCliente: '', rutaVinculacion: '', accesoWeb: '',
  nombre: '', apellidoPaterno: '', apellidoMaterno: '',
  fechaNacimiento: '', genero: '', estadoCivil: '',
  lugarNacimiento: '', numDependientes: '',
  curp: '', rfc: '', ine: '',
  telefonoOficina: '', telefonoParticular: '', celular: '', correo: '',
  conyuge_nombre: '', conyuge_telefono: '', conyuge_trabajo: '', conyuge_direccionTrabajo: '',
  conyuge_apellidoP: '', conyuge_apellidoM: '', conyuge_curp: '', conyuge_ocupacion: '', conyuge_ingreso: '',
  ref1_nombre: '', ref1_telefono: '', ref1_domicilio: '',
  ref2_nombre: '', ref2_telefono: '', ref2_domicilio: '',
  ref3_nombre: '', ref3_telefono: '', ref3_domicilio: '',
  cp: '', calle: '', numExt: '', numInt: '',
  colonia: '', municipio: '', estado: '',
  entreCalles1: '', entreCalles2: '', referenciaUbicacion: '', referenciaAdicional: '',
  ingresoMensual: '', egresos: '', otrosIngresos: '', patrimonio: '',
  empresa: '', ocupacion: '', direccionLaboral: '', telefonoLaboral: '', antiguedad: '', tipoContrato: '',
};

function FotoUpload({ label, value, onChange, size = 110 }) {
  const ref = useRef();
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target.result);
    reader.readAsDataURL(file);
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      <div onClick={() => ref.current.click()} style={{ width: size, height: size, borderRadius: '10px', border: `2px dashed ${value ? '#0e50a0' : '#dceaf8'}`, background: value ? 'transparent' : '#f4f9ff', cursor: 'pointer', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {value
          ? <img src={value} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ textAlign: 'center', color: '#90aac8' }}><Camera size={22} /><div style={{ fontSize: '10px', marginTop: '4px', fontWeight: '600' }}>Subir foto</div></div>
        }
        {value && (
          <button onClick={e => { e.stopPropagation(); onChange(''); }} style={{ position: 'absolute', top: '3px', right: '3px', background: 'rgba(0,0,0,0.55)', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={11} />
          </button>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
      <span style={{ fontSize: '10px', fontWeight: '600', color: '#4a6a94', textAlign: 'center', maxWidth: size }}>{label}</span>
    </div>
  );
}

function Campo({ label, children, required, error }) {
  return (
    <div>
      <label style={{ fontSize: '11px', fontWeight: '600', color: error ? '#ef4444' : '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '5px' }}>
        {label}{required && <span style={{ color: '#ef4444' }}> *</span>}
      </label>
      {children}
      {error && <span style={{ color: '#ef4444', fontSize: '10px' }}>Campo requerido</span>}
    </div>
  );
}

export default function AltaCliente() {
  const [tab,    setTab]    = useState(0);
  const [form,   setForm]   = useState(INITIAL);
  const [fotos,  setFotos]  = useState({ cliente: '', casa: '', negocio: '', conyuge: '', ine: '', comprobante: '' });
  const [errors, setErrors] = useState({});
  const [estado, setEstado] = useState(null);
  const [msg,    setMsg]    = useState('');
  const [rutas,  setRutas]  = useState([]);

  // Rutas predefinidas + las que vengan del backend
  const RUTAS_DEFAULT = [
    'Apaxco Sucursal-Apaxco',
    'Tequix Sucursal-tequix',
    'Huehue sucursal-Huehuetoca',
    'Temas Sucursal-Temascalapa',
    'Tizayuca 1 Sucursal-tizayuca1',
    'OFC-CTRAL OFICINA CENTRAL',
    '01-sucursa 01-sucursal-tula',
    '01 Legal',
    '01 Ajoloapan',
    '01 APAXCO-2',
    '02 TEOLOYUCAN',
  ];

  useEffect(() => {
    fetch(`${API}/api/rutas`)
      .then(r => r.json())
      .then(d => { if (Array.isArray(d) && d.length > 0) setRutas(d); })
      .catch(() => {});
  }, []);

  const ch = (n, v) => { setForm(p => ({ ...p, [n]: v })); if (errors[n]) setErrors(p => ({ ...p, [n]: false })); };

  const validate = () => {
    const errs = {};
    REQUERIDOS.forEach(k => { if (!form[k]) errs[k] = true; });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) { setTab(0); return; }
    setEstado('loading');
    try {
      const esCasado = form.estadoCivil === 'Casado(a)' || form.estadoCivil === 'Union libre';
      const payload = {
        tipoCliente: form.tipoCliente, rutaVinculacion: form.rutaVinculacion, accesoWeb: form.accesoWeb,
        nombre: form.nombre, apellidoP: form.apellidoPaterno, apellidoM: form.apellidoMaterno,
        curp: form.curp.toUpperCase(), rfc: form.rfc.toUpperCase(), ine: form.ine,
        fechaNac: form.fechaNacimiento, sexo: form.genero, estadoCivil: form.estadoCivil,
        lugarNacimiento: form.lugarNacimiento, numDependientes: form.numDependientes,
        telefono: form.telefonoParticular, telefonoOficina: form.telefonoOficina,
        celular: form.celular, correo: form.correo,
        calle: form.calle, colonia: form.colonia, municipio: form.municipio,
        estado: form.estado, cp: form.cp, numExt: form.numExt, numInt: form.numInt,
        entreCalles1: form.entreCalles1, entreCalles2: form.entreCalles2,
        referenciaUbicacion: form.referenciaUbicacion, referenciaAdicional: form.referenciaAdicional,
        ocupacion: form.ocupacion, empresa: form.empresa,
        ingresoMensual: form.ingresoMensual, egresos: form.egresos,
        otrosIngresos: form.otrosIngresos, patrimonio: form.patrimonio,
        direccionLaboral: form.direccionLaboral, telefonoLaboral: form.telefonoLaboral,
        antiguedad: form.antiguedad, tipoContrato: form.tipoContrato,
        estatus: 'Activo',
        conyuge: esCasado ? {
          nombre: form.conyuge_nombre, apellidoP: form.conyuge_apellidoP, apellidoM: form.conyuge_apellidoM,
          curp: form.conyuge_curp, telefono: form.conyuge_telefono,
          trabajo: form.conyuge_trabajo, direccionTrabajo: form.conyuge_direccionTrabajo,
          ocupacion: form.conyuge_ocupacion, ingreso: form.conyuge_ingreso,
        } : null,
        referencias: [
          { nombre: form.ref1_nombre, telefono: form.ref1_telefono, domicilio: form.ref1_domicilio },
          { nombre: form.ref2_nombre, telefono: form.ref2_telefono, domicilio: form.ref2_domicilio },
          { nombre: form.ref3_nombre, telefono: form.ref3_telefono, domicilio: form.ref3_domicilio },
        ].filter(r => r.nombre),
        fotos,
      };
      const res = await fetch(`${API}/api/clientes`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar');
      setEstado('ok'); setMsg(`Cliente ${form.nombre} ${form.apellidoPaterno} registrado correctamente.`);
      setTimeout(() => { setForm(INITIAL); setFotos({ cliente: '', casa: '', negocio: '', conyuge: '', ine: '', comprobante: '' }); setEstado(null); setMsg(''); setTab(0); }, 3500);
    } catch (e) {
      setEstado('error'); setMsg(e.message.includes('duplicate') ? 'Ya existe un cliente con ese CURP.' : e.message);
      setTimeout(() => setEstado(null), 4000);
    }
  };

  const reset = () => { setForm(INITIAL); setFotos({ cliente: '', casa: '', negocio: '', conyuge: '', ine: '', comprobante: '' }); setErrors({}); setEstado(null); setMsg(''); setTab(0); };

  const inp = (err) => ({ border: `1.5px solid ${err ? '#ef4444' : '#dceaf8'}`, borderRadius: '9px', padding: '9px 12px', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', color: '#1a3d6e', outline: 'none', width: '100%', background: '#fafcff', boxSizing: 'border-box' });
  const sel = (err) => ({ ...inp(err), cursor: 'pointer' });
  const esCasado = form.estadoCivil === 'Casado(a)' || form.estadoCivil === 'Union libre';

  const Card = ({ titulo, icon: Icon, iconBg = '#e8f2fc', iconColor = '#0e50a0', children }) => (
    <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #dceaf8', boxShadow: '0 2px 10px rgba(14,80,160,0.05)', marginBottom: '18px' }}>
      <div style={{ padding: '14px 22px', borderBottom: '1px solid #f0f6ff', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '30px', height: '30px', background: iconBg, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={15} color={iconColor} /></div>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '16px', fontWeight: '700', color: '#0a2d5e' }}>{titulo}</span>
      </div>
      <div style={{ padding: '18px 22px' }}>{children}</div>
    </div>
  );

  const Grid = ({ children }) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>{children}</div>
  );

  const TABS = ['Información general', 'Documentación digital', 'Información financiera', 'Información laboral'];

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto' }}>

      {estado === 'ok' && <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: '12px', padding: '13px 18px', marginBottom: '18px', color: '#166534', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle size={16} />{msg}</div>}
      {estado === 'error' && <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '12px', padding: '13px 18px', marginBottom: '18px', color: '#dc2626', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}><AlertCircle size={16} />{msg}</div>}

      {/* PESTAÑAS */}
      <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #dceaf8', boxShadow: '0 2px 10px rgba(14,80,160,0.05)', marginBottom: '20px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '2px solid #f0f6ff', overflowX: 'auto' }}>
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)} style={{ padding: '13px 20px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '13px', fontWeight: tab === i ? '700' : '500', color: tab === i ? '#0e50a0' : '#90aac8', background: tab === i ? '#f0f7ff' : 'transparent', borderBottom: tab === i ? '2px solid #0e50a0' : '2px solid transparent', marginBottom: '-2px', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s' }}>
              {t}
            </button>
          ))}
        </div>
        <div style={{ padding: '8px 22px', background: '#f8fbff' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#90aac8' }}>Rellena la información en cada pestaña. Al finalizar pulsa <strong style={{ color: '#0e50a0' }}>Guardar cliente</strong>.</p>
        </div>
      </div>

      {/* ── TAB 0: INFORMACIÓN GENERAL ── */}
      {tab === 0 && <>
        <Card titulo="Clasificación del cliente" icon={User}>
          <Grid>
            <Campo label="Tipo de cliente">
              <select value={form.tipoCliente} onChange={e => ch('tipoCliente', e.target.value)} style={sel(false)}>
                <option value="">Selecciona una opción</option>
                <option value="Titular Fisica">Titular Física (Persona física)</option>
                <option value="Aval">Aval</option>
                <option value="Titular Moral">Titular Moral (Persona moral)</option>
              </select>
            </Campo>
            <Campo label="Ruta vinculación">
              <select value={form.rutaVinculacion} onChange={e => ch('rutaVinculacion', e.target.value)} style={sel(false)}>
                <option value="">-Elige-</option>
                {(rutas.length > 0 ? rutas.map(r => r.nombre || r.clave) : RUTAS_DEFAULT).map(nombre => (
                  <option key={nombre} value={nombre}>{nombre}</option>
                ))}
              </select>
            </Campo>
            <Campo label="Permitir acceso web de socios">
              <select value={form.accesoWeb} onChange={e => ch('accesoWeb', e.target.value)} style={sel(false)}>
                <option value="">-Elige-</option>
                <option value="SI">Sí</option>
                <option value="NO">No</option>
              </select>
            </Campo>
          </Grid>
        </Card>

        <Card titulo="Datos personales" icon={User}>
          <Grid>
            <Campo label="Apellido paterno" required error={errors.apellidoPaterno}><input value={form.apellidoPaterno} onChange={e => ch('apellidoPaterno', e.target.value)} style={inp(errors.apellidoPaterno)} placeholder="Apellido paterno" /></Campo>
            <Campo label="Apellido materno"><input value={form.apellidoMaterno} onChange={e => ch('apellidoMaterno', e.target.value)} style={inp(false)} placeholder="Apellido materno" /></Campo>
            <Campo label="Nombre(s)" required error={errors.nombre}><input value={form.nombre} onChange={e => ch('nombre', e.target.value)} style={inp(errors.nombre)} placeholder="Nombre(s)" /></Campo>
            <Campo label="Teléfono particular"><input type="tel" value={form.telefonoParticular} onChange={e => ch('telefonoParticular', e.target.value)} style={inp(false)} /></Campo>
            <Campo label="Teléfono oficina"><input type="tel" value={form.telefonoOficina} onChange={e => ch('telefonoOficina', e.target.value)} style={inp(false)} /></Campo>
            <Campo label="Teléfono celular" required error={errors.celular}><input type="tel" value={form.celular} onChange={e => ch('celular', e.target.value)} style={inp(errors.celular)} /></Campo>
            <Campo label="Fecha de nacimiento" required error={errors.fechaNacimiento}><input type="date" value={form.fechaNacimiento} onChange={e => ch('fechaNacimiento', e.target.value)} style={inp(errors.fechaNacimiento)} /></Campo>
            <Campo label="Lugar de nacimiento">
              <select value={form.lugarNacimiento} onChange={e => ch('lugarNacimiento', e.target.value)} style={sel(false)}>
                <option value="">-Elige-</option>
                {ESTADOS_MX.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Campo>
            <Campo label="Sexo">
              <select value={form.genero} onChange={e => ch('genero', e.target.value)} style={sel(false)}>
                <option value="">-Elige-</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
            </Campo>
            <Campo label="Estado civil">
              <select value={form.estadoCivil} onChange={e => ch('estadoCivil', e.target.value)} style={sel(false)}>
                <option value="">-Elige-</option>
                <option value="Soltero(a)">Soltero(a)</option>
                <option value="Casado(a)">Casado(a)</option>
                <option value="Union libre">Unión libre</option>
                <option value="Divorciado(a)">Divorciado(a)</option>
                <option value="Viudo(a)">Viudo(a)</option>
              </select>
            </Campo>
            <Campo label="RFC"><input value={form.rfc} onChange={e => ch('rfc', e.target.value.toUpperCase())} style={inp(false)} placeholder="Ingrese su RFC" /></Campo>
            <Campo label="Correo electrónico"><input type="email" value={form.correo} onChange={e => ch('correo', e.target.value)} style={inp(false)} /></Campo>
            <Campo label="No. dependientes económicos"><input type="number" value={form.numDependientes} onChange={e => ch('numDependientes', e.target.value)} style={inp(false)} min="0" /></Campo>
            <Campo label="CURP" required error={errors.curp}><input value={form.curp} onChange={e => ch('curp', e.target.value.toUpperCase())} style={inp(errors.curp)} placeholder="Ingrese su CURP" /></Campo>
            <Campo label="No. INE/IFE"><input value={form.ine} onChange={e => ch('ine', e.target.value)} style={inp(false)} /></Campo>
          </Grid>
        </Card>

        {esCasado && (
          <Card titulo="Datos del cónyuge" icon={Heart} iconBg="#fce8f0" iconColor="#be185d">
            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '280px' }}>
                <Grid>
                  <Campo label="Nombre"><input value={form.conyuge_nombre} onChange={e => ch('conyuge_nombre', e.target.value)} style={inp(false)} /></Campo>
                  <Campo label="Teléfono"><input type="tel" value={form.conyuge_telefono} onChange={e => ch('conyuge_telefono', e.target.value)} style={inp(false)} /></Campo>
                  <Campo label="Nombre del trabajo"><input value={form.conyuge_trabajo} onChange={e => ch('conyuge_trabajo', e.target.value)} style={inp(false)} /></Campo>
                  <Campo label="Dirección del trabajo"><input value={form.conyuge_direccionTrabajo} onChange={e => ch('conyuge_direccionTrabajo', e.target.value)} style={inp(false)} /></Campo>
                  <Campo label="Ocupación"><input value={form.conyuge_ocupacion} onChange={e => ch('conyuge_ocupacion', e.target.value)} style={inp(false)} /></Campo>
                  <Campo label="Ingreso mensual"><input type="number" value={form.conyuge_ingreso} onChange={e => ch('conyuge_ingreso', e.target.value)} style={inp(false)} /></Campo>
                </Grid>
              </div>
              <FotoUpload label="Foto cónyuge" value={fotos.conyuge} onChange={v => setFotos(p => ({ ...p, conyuge: v }))} size={100} />
            </div>
          </Card>
        )}

        <Card titulo="Datos de contacto de referencia" icon={Users}>
          {[1, 2, 3].map(n => (
            <div key={n} style={{ marginBottom: n < 3 ? '14px' : 0, paddingBottom: n < 3 ? '14px' : 0, borderBottom: n < 3 ? '1px solid #f0f6ff' : 'none' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '12px' }}>
                <Campo label={`Nombre ${n}`}><input value={form[`ref${n}_nombre`]} onChange={e => ch(`ref${n}_nombre`, e.target.value)} style={inp(false)} /></Campo>
                <Campo label="Teléfono"><input type="tel" value={form[`ref${n}_telefono`]} onChange={e => ch(`ref${n}_telefono`, e.target.value)} style={inp(false)} /></Campo>
                <Campo label="Domicilio"><input value={form[`ref${n}_domicilio`]} onChange={e => ch(`ref${n}_domicilio`, e.target.value)} style={inp(false)} placeholder="Calle, colonia, municipio" /></Campo>
              </div>
            </div>
          ))}
        </Card>

        <Card titulo="Domicilio" icon={MapPin}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '14px' }}>
            <Campo label="Código postal"><input value={form.cp} onChange={e => ch('cp', e.target.value)} style={inp(false)} /></Campo>
            <Campo label="Calle"><input value={form.calle} onChange={e => ch('calle', e.target.value)} style={inp(false)} /></Campo>
            <Campo label="No. exterior"><input value={form.numExt} onChange={e => ch('numExt', e.target.value)} style={inp(false)} /></Campo>
            <Campo label="No. interior"><input value={form.numInt} onChange={e => ch('numInt', e.target.value)} style={inp(false)} /></Campo>
            <Campo label="Entre la calle de"><input value={form.entreCalles1} onChange={e => ch('entreCalles1', e.target.value)} style={inp(false)} /></Campo>
            <Campo label="Y de"><input value={form.entreCalles2} onChange={e => ch('entreCalles2', e.target.value)} style={inp(false)} /></Campo>
            <Campo label="Colonia"><input value={form.colonia} onChange={e => ch('colonia', e.target.value)} style={inp(false)} /></Campo>
            <Campo label="Municipio / Alcaldía"><input value={form.municipio} onChange={e => ch('municipio', e.target.value)} style={inp(false)} /></Campo>
            <Campo label="Estado">
              <select value={form.estado} onChange={e => ch('estado', e.target.value)} style={sel(false)}>
                <option value="">-Elige-</option>
                {ESTADOS_MX.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Campo>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Campo label="Referencia de ubicación"><input value={form.referenciaUbicacion} onChange={e => ch('referenciaUbicacion', e.target.value)} style={inp(false)} placeholder="Ej. Casa azul con portón negro" /></Campo>
            <Campo label="Referencia adicional"><input value={form.referenciaAdicional} onChange={e => ch('referenciaAdicional', e.target.value)} style={inp(false)} /></Campo>
          </div>
          <div style={{ marginTop: '16px', borderRadius: '12px', border: '1px solid #dceaf8', height: '180px', background: '#f0f6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#90aac8', flexDirection: 'column', gap: '8px' }}>
            <MapPin size={28} />
            <div style={{ fontSize: '12px', fontWeight: '600' }}>Mapa de ubicación — arrastra el marcador para ubicar la casa del cliente</div>
          </div>
        </Card>
      </>}

      {/* ── TAB 1: DOCUMENTACIÓN DIGITAL ── */}
      {tab === 1 && (
        <Card titulo="Documentación digital" icon={FileText}>
          <p style={{ fontSize: '13px', color: '#4a6a94', marginBottom: '20px', margin: '0 0 20px' }}>Sube los documentos y fotografías del cliente.</p>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <FotoUpload label="Foto del cliente"      value={fotos.cliente}     onChange={v => setFotos(p => ({ ...p, cliente: v }))}     size={120} />
            <FotoUpload label="Foto de la casa"       value={fotos.casa}        onChange={v => setFotos(p => ({ ...p, casa: v }))}        size={120} />
            <FotoUpload label="Foto del negocio"      value={fotos.negocio}     onChange={v => setFotos(p => ({ ...p, negocio: v }))}     size={120} />
            <FotoUpload label="INE / IFE"             value={fotos.ine}         onChange={v => setFotos(p => ({ ...p, ine: v }))}         size={120} />
            <FotoUpload label="Comprobante domicilio" value={fotos.comprobante} onChange={v => setFotos(p => ({ ...p, comprobante: v }))} size={120} />
          </div>
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Upload size={12} color="#90aac8" />
            <span style={{ fontSize: '11px', color: '#90aac8' }}>Formatos: JPG, PNG. Máximo 5 MB por imagen.</span>
          </div>
        </Card>
      )}

      {/* ── TAB 2: INFORMACIÓN FINANCIERA ── */}
      {tab === 2 && (
        <Card titulo="Información financiera" icon={DollarSign}>
          <Grid>
            <Campo label="Ingreso mensual"><input type="number" value={form.ingresoMensual} onChange={e => ch('ingresoMensual', e.target.value)} style={inp(false)} placeholder="$0.00" /></Campo>
            <Campo label="Egresos mensuales"><input type="number" value={form.egresos} onChange={e => ch('egresos', e.target.value)} style={inp(false)} placeholder="$0.00" /></Campo>
            <Campo label="Otros ingresos"><input type="number" value={form.otrosIngresos} onChange={e => ch('otrosIngresos', e.target.value)} style={inp(false)} placeholder="$0.00" /></Campo>
            <Campo label="Patrimonio"><input type="number" value={form.patrimonio} onChange={e => ch('patrimonio', e.target.value)} style={inp(false)} placeholder="$0.00" /></Campo>
          </Grid>
        </Card>
      )}

      {/* ── TAB 3: INFORMACIÓN LABORAL ── */}
      {tab === 3 && (
        <Card titulo="Información laboral" icon={Briefcase}>
          <Grid>
            <Campo label="Empresa / Negocio"><input value={form.empresa} onChange={e => ch('empresa', e.target.value)} style={inp(false)} /></Campo>
            <Campo label="Ocupación / Puesto"><input value={form.ocupacion} onChange={e => ch('ocupacion', e.target.value)} style={inp(false)} /></Campo>
            <Campo label="Dirección laboral"><input value={form.direccionLaboral} onChange={e => ch('direccionLaboral', e.target.value)} style={inp(false)} /></Campo>
            <Campo label="Teléfono laboral"><input type="tel" value={form.telefonoLaboral} onChange={e => ch('telefonoLaboral', e.target.value)} style={inp(false)} /></Campo>
            <Campo label="Antigüedad"><input value={form.antiguedad} onChange={e => ch('antiguedad', e.target.value)} style={inp(false)} placeholder="Ej. 2 años" /></Campo>
            <Campo label="Tipo de contrato">
              <select value={form.tipoContrato} onChange={e => ch('tipoContrato', e.target.value)} style={sel(false)}>
                <option value="">-Elige-</option>
                <option value="Indefinido">Indefinido</option>
                <option value="Temporal">Temporal</option>
                <option value="Por obra">Por obra</option>
                <option value="Honorarios">Honorarios</option>
                <option value="Negocio propio">Negocio propio</option>
              </select>
            </Campo>
          </Grid>
        </Card>
      )}

      {/* BOTONES */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginTop: '4px', marginBottom: '32px' }}>
        <button onClick={reset} style={{ background: '#fff', border: '1.5px solid #dceaf8', borderRadius: '10px', padding: '10px 20px', fontSize: '13px', fontWeight: '600', color: '#4a6a94', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <RotateCcw size={13} /> Limpiar
        </button>
        <div style={{ display: 'flex', gap: '8px' }}>
          {tab < 3 && (
            <button onClick={() => setTab(t => t + 1)} style={{ background: '#e8f2fc', border: 'none', borderRadius: '10px', padding: '10px 20px', fontSize: '13px', fontWeight: '600', color: '#0e50a0', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Siguiente <ChevronRight size={14} />
            </button>
          )}
          <button onClick={handleSave} disabled={estado === 'loading'} style={{ background: estado === 'loading' ? '#90aac8' : '#0e50a0', border: 'none', borderRadius: '10px', padding: '10px 24px', fontSize: '13px', fontWeight: '600', color: '#fff', cursor: estado === 'loading' ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '7px', boxShadow: '0 4px 14px rgba(14,80,160,0.28)' }}>
            {estado === 'loading' ? <><Loader size={13} style={{ animation: 'spin 1s linear infinite' }} />Guardando...</> : <><Save size={13} />Guardar cliente</>}
          </button>
        </div>
      </div>

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}