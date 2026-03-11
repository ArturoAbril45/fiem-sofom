'use client';
import { useState, useRef, useEffect } from 'react';
import {
  User, FileText, MapPin, Save, RotateCcw,
  CheckCircle, AlertCircle, Loader, Camera, Heart, Users, X
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
  // Clasificación
  tipoCliente: '', rutaVinculacion: '', accesoWeb: '',
  // Personal
  apellidoPaterno: '', apellidoMaterno: '', nombre: '',
  telefonoParticular: '', telefonoOficina: '', celular: '',
  fechaNacimiento: '', lugarNacimiento: '', genero: '', estadoCivil: '',
  rfc: '', correo: '', numDependientes: '', curp: '', ine: '',
  // Cónyuge
  conyuge_nombre: '', conyuge_telefono: '', conyuge_trabajo: '', conyuge_direccionTrabajo: '',
  // Referencias (2 en el sistema original)
  ref1_nombre: '', ref1_telefono: '', ref1_domicilio: '',
  ref2_nombre: '', ref2_telefono: '', ref2_domicilio: '',
  // Domicilio personal
  cp: '', calle: '', numExt: '', numInt: '',
  referenciaUbicacion: '', entreCalles1: '', entreCalles2: '', referenciaAdicional: '',
  colonia: '', municipio: '', estado: '',
  // Financiera — Ingresos
  ingresoMensual: '0', otrosIngresos: '0',
  // Financiera — Gastos
  gastoAlimento: '', gastoLuz: '', gastoTelefono: '', gastoTransporte: '',
  gastoRenta: '', gastoInversion: '', gastoCreditos: '', gastoOtros: '',
  // Estudio socioeconómico
  tipoVivienda: '',
  elecRefrigerador: '', elecEstufa: '', elecLavadora: '', elecTelevision: '',
  elecLicuadora: '', elecHorno: '', elecComputadora: '', elecSala: '',
  elecCelular: '', elecVehiculo: '',
  // Laboral
  fuenteIngresos: '', empresa: '', rfcEmpresa: '',
  cpLaboral: '', calleLaboral: '', numExtLaboral: '', numIntLaboral: '',
  refUbicacionLaboral: '', entreCalles1Laboral: '', entreCalles2Laboral: '', refAdicionalLaboral: '',
  // Confirmar
  confirmar: false,
};

// ── Foto upload (para cónyuge) ──────────────────────
function FotoUpload({ label, value, onChange }) {
  const ref = useRef();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span style={{ fontSize: '13px', color: '#1a3d6e', minWidth: '100px' }}>{label}:</span>
      <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={e => {
          const file = e.target.files[0]; if (!file) return;
          const r = new FileReader(); r.onload = ev => onChange(ev.target.result); r.readAsDataURL(file);
        }} />
      {value
        ? <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <img src={value} alt={label} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
            <button onClick={() => onChange('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><X size={14} /></button>
          </div>
        : <button onClick={() => ref.current.click()} style={{ background: '#17a2b8', color: '#fff', border: 'none', borderRadius: '4px', padding: '5px 12px', fontSize: '12px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
            Seleccionar archivo
          </button>
      }
      {!value && <span style={{ fontSize: '12px', color: '#666' }}>Ningún archivo seleccionado</span>}
    </div>
  );
}

// ── Fila de documento digital ────────────────────────
function DocRow({ icon: Icon, label, value, onChange }) {
  const ref = useRef();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 0', borderBottom: '1px solid #f0f6ff' }}>
      <div style={{ width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={48} color="#555" strokeWidth={1.2} />
      </div>
      <span style={{ fontSize: '14px', color: '#1a3d6e', minWidth: '200px' }}>{label}</span>
      <input ref={ref} type="file" accept="image/*,application/pdf" style={{ display: 'none' }}
        onChange={e => {
          const file = e.target.files[0]; if (!file) return;
          const r = new FileReader(); r.onload = ev => onChange(ev.target.result); r.readAsDataURL(file);
        }} />
      {value
        ? <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#0e50a0', fontWeight: '600' }}>Archivo cargado</span>
            <button onClick={() => onChange('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><X size={14} /></button>
          </div>
        : <>
            <button onClick={() => ref.current.click()} style={{ background: '#17a2b8', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 14px', fontSize: '13px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              Seleccionar archivo
            </button>
            <span style={{ fontSize: '12px', color: '#666' }}>Ningún archivo seleccionado</span>
          </>
      }
    </div>
  );
}

export default function AltaCliente() {
  const [tab,    setTab]    = useState(0);
  const [form,   setForm]   = useState(INITIAL);
  const [docs,   setDocs]   = useState({ comprobanteDomicilio: '', comprobanteIngresos: '', identificacion: '', fotoPerfil: '', actaNacimiento: '', curpDoc: '', fachadaCasa: '', fachadaNegocio: '' });
  const [fotoConyuge, setFotoConyuge] = useState('');
  const [errors, setErrors] = useState({});
  const [estado, setEstado] = useState(null);
  const [msg,    setMsg]    = useState('');
  const [rutas,  setRutas]  = useState([]);

  useEffect(() => {
    fetch(`${API}/api/rutas`).then(r => r.json()).then(d => { if (Array.isArray(d) && d.length > 0) setRutas(d); }).catch(() => {});
  }, []);

  const ch = (n, v) => { setForm(p => ({ ...p, [n]: v })); if (errors[n]) setErrors(p => ({ ...p, [n]: false })); };
  const num = (v) => parseFloat(v) || 0;

  // Cálculos automáticos
  const ingresoTotal = num(form.ingresoMensual) + num(form.otrosIngresos);
  const totalGasto = num(form.gastoAlimento) + num(form.gastoLuz) + num(form.gastoTelefono) +
    num(form.gastoTransporte) + num(form.gastoRenta) + num(form.gastoInversion) +
    num(form.gastoCreditos) + num(form.gastoOtros);
  const totalDisponible = ingresoTotal - totalGasto;

  const validate = () => {
    const errs = {};
    REQUERIDOS.forEach(k => { if (!form[k]) errs[k] = true; });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) { setTab(0); return; }
    if (!form.confirmar) { setTab(3); setEstado('error'); setMsg('Debes marcar "Confirmar datos" antes de guardar.'); setTimeout(() => setEstado(null), 3000); return; }
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
        ingresoMensual: form.ingresoMensual, otrosIngresos: form.otrosIngresos,
        ingresoTotal, totalGasto, totalDisponible,
        gastos: { alimento: form.gastoAlimento, luz: form.gastoLuz, telefono: form.gastoTelefono, transporte: form.gastoTransporte, renta: form.gastoRenta, inversion: form.gastoInversion, creditos: form.gastoCreditos, otros: form.gastoOtros },
        estudioSocioeconomico: {
          tipoVivienda: form.tipoVivienda,
          electrodomesticos: { refrigerador: form.elecRefrigerador, estufa: form.elecEstufa, lavadora: form.elecLavadora, television: form.elecTelevision, licuadora: form.elecLicuadora, horno: form.elecHorno, computadora: form.elecComputadora, sala: form.elecSala, celular: form.elecCelular, vehiculo: form.elecVehiculo }
        },
        fuenteIngresos: form.fuenteIngresos, empresa: form.empresa, rfcEmpresa: form.rfcEmpresa,
        domicilioLaboral: { cp: form.cpLaboral, calle: form.calleLaboral, numExt: form.numExtLaboral, numInt: form.numIntLaboral, referenciaUbicacion: form.refUbicacionLaboral, entreCalles1: form.entreCalles1Laboral, entreCalles2: form.entreCalles2Laboral, referenciaAdicional: form.refAdicionalLaboral },
        estatus: 'Activo',
        conyuge: esCasado ? { nombre: form.conyuge_nombre, telefono: form.conyuge_telefono, trabajo: form.conyuge_trabajo, direccionTrabajo: form.conyuge_direccionTrabajo, foto: fotoConyuge } : null,
        referencias: [
          { nombre: form.ref1_nombre, telefono: form.ref1_telefono, domicilio: form.ref1_domicilio },
          { nombre: form.ref2_nombre, telefono: form.ref2_telefono, domicilio: form.ref2_domicilio },
        ].filter(r => r.nombre),
        documentos: docs,
      };
      const res = await fetch(`${API}/api/clientes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar');
      setEstado('ok'); setMsg(`Cliente ${form.nombre} ${form.apellidoPaterno} registrado correctamente.`);
      setTimeout(() => { setForm(INITIAL); setDocs({ comprobanteDomicilio: '', comprobanteIngresos: '', identificacion: '', fotoPerfil: '', actaNacimiento: '', curpDoc: '', fachadaCasa: '', fachadaNegocio: '' }); setFotoConyuge(''); setEstado(null); setMsg(''); setTab(0); }, 3500);
    } catch (e) {
      setEstado('error'); setMsg(e.message.includes('duplicate') ? 'Ya existe un cliente con ese CURP.' : e.message);
      setTimeout(() => setEstado(null), 4000);
    }
  };

  const reset = () => { setForm(INITIAL); setDocs({ comprobanteDomicilio: '', comprobanteIngresos: '', identificacion: '', fotoPerfil: '', actaNacimiento: '', curpDoc: '', fachadaCasa: '', fachadaNegocio: '' }); setFotoConyuge(''); setErrors({}); setEstado(null); setMsg(''); setTab(0); };

  // ── Estilos base ──
  const inp = (err) => ({ border: `1px solid ${err ? '#ef4444' : '#ccc'}`, borderRadius: '3px', padding: '4px 7px', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', color: '#222', outline: 'none', background: '#fff', boxSizing: 'border-box', width: '100%' });
  const sel = (err) => ({ ...inp(err), cursor: 'pointer' });
  const inpNum = { border: '1px solid #ccc', borderRadius: '3px', padding: '3px 6px', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', color: '#222', outline: 'none', background: '#fff', width: '120px' };
  const inpNumSm = { ...inpNum, width: '100px' };
  const esCasado = form.estadoCivil === 'Casado(a)' || form.estadoCivil === 'Union libre';

  // ── Bloque de subsección financiera ──
  const SubHead = ({ children }) => (
    <div style={{ background: '#e8e0c4', padding: '5px 10px', marginBottom: '10px', fontWeight: '600', fontSize: '13px', color: '#333' }}>{children}</div>
  );

  // ── Tabla de campos en línea ──
  const InlineField = ({ label, name, width = '100px', disabled = false, value, onChange }) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginRight: '14px', marginBottom: '6px' }}>
      <span style={{ fontSize: '13px', color: '#333' }}>{label}:</span>
      <input value={value !== undefined ? value : form[name] || ''} onChange={onChange || (e => ch(name, e.target.value))} disabled={disabled} style={{ ...inpNumSm, width, background: disabled ? '#f0f0f0' : '#fff' }} />
    </span>
  );

  const TABS = ['INFORMACION GENERAL', 'DOCUMENTACION DIGITAL', 'INFORMACION FINANCIERA', 'INFORMACION LABORAL'];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', fontFamily: 'DM Sans, sans-serif' }}>

      {/* Notificaciones */}
      {estado === 'ok' && <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', color: '#166534', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={16} />{msg}</div>}
      {estado === 'error' && <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', color: '#dc2626', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}><AlertCircle size={16} />{msg}</div>}

      {/* ── PESTAÑAS ── */}
      <div style={{ background: '#fff', border: '1px solid #ccc', marginBottom: '0' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #ccc' }}>
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)} style={{ padding: '8px 16px', border: 'none', borderRight: '1px solid #ccc', cursor: 'pointer', fontSize: '12px', fontWeight: '700', color: tab === i ? '#fff' : '#333', background: tab === i ? '#0d47a1' : '#e8e8e8', fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.04em' }}>
              {t}
            </button>
          ))}
        </div>

        <div style={{ padding: '16px 20px', minHeight: '400px' }}>

          {/* ══════════════ TAB 0: INFORMACIÓN GENERAL ══════════════ */}
          {tab === 0 && <>
            {/* Clasificación */}
            <div style={{ marginBottom: '16px' }}>
              <InlineField label="Tipo cliente" name="tipoCliente" width="160px"
                value={undefined}
                onChange={undefined}
              />
              {/* usamos select manual para estos tres */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', color: '#333', minWidth: '260px' }}>Tipo cliente:</span>
                  <select value={form.tipoCliente} onChange={e => ch('tipoCliente', e.target.value)} style={{ ...sel(false), width: '180px' }}>
                    <option value="">Selecciona una opcion</option>
                    <option value="Titular Fisica">Titular Física (Persona física)</option>
                    <option value="Aval">Aval</option>
                    <option value="Titular Moral">Titular Moral (Persona moral)</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', color: '#333', minWidth: '260px' }}>Ruta vinculacion:</span>
                  <select value={form.rutaVinculacion} onChange={e => ch('rutaVinculacion', e.target.value)} style={{ ...sel(false), width: '220px' }}>
                    <option value="">-Elige-</option>
                    {(rutas.length > 0 ? rutas.map(r => r.nombre || r.clave) : RUTAS_DEFAULT).map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', color: '#333', minWidth: '260px' }}>Permitir acceso a cliente en la web de socios:</span>
                  <select value={form.accesoWeb} onChange={e => ch('accesoWeb', e.target.value)} style={{ ...sel(false), width: '80px' }}>
                    <option value="">-Elige-</option>
                    <option value="SI">SI</option>
                    <option value="NO">NO</option>
                  </select>
                </div>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '12px 0' }} />
            </div>

            {/* Datos personales — 2 columnas */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 40px', marginBottom: '16px' }}>
              {[
                { label: 'Apellido Paterno', name: 'apellidoPaterno', req: true },
                { label: 'Apellido Materno', name: 'apellidoMaterno' },
                { label: 'Nombre', name: 'nombre', req: true },
                { label: 'Telefono Particular', name: 'telefonoParticular', type: 'tel' },
                { label: 'Telefono Oficina', name: 'telefonoOficina', type: 'tel' },
                { label: 'Telefono Celular', name: 'celular', type: 'tel', req: true },
              ].map(({ label, name, type = 'text', req }) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', color: '#333', minWidth: '160px' }}>{label}{req && <span style={{ color: 'red' }}> *</span>}:</span>
                  <input type={type} value={form[name]} onChange={e => ch(name, e.target.value)} style={{ ...inp(errors[name]), width: '180px' }} />
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: '#333', minWidth: '160px' }}>Fecha Nacimiento<span style={{ color: 'red' }}> *</span>:</span>
                <input type="date" value={form.fechaNacimiento} onChange={e => ch('fechaNacimiento', e.target.value)} style={{ ...inp(errors.fechaNacimiento), width: '180px' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: '#333', minWidth: '160px' }}>Lugar Nacimiento:</span>
                <select value={form.lugarNacimiento} onChange={e => ch('lugarNacimiento', e.target.value)} style={{ ...sel(false), width: '180px' }}>
                  <option value="">-Elige-</option>
                  {ESTADOS_MX.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: '#333', minWidth: '160px' }}>Sexo:</span>
                <select value={form.genero} onChange={e => ch('genero', e.target.value)} style={{ ...sel(false), width: '120px' }}>
                  <option value="">-Elige-</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: '#333', minWidth: '160px' }}>Estado Civil:</span>
                <select value={form.estadoCivil} onChange={e => ch('estadoCivil', e.target.value)} style={{ ...sel(false), width: '140px' }}>
                  <option value="">-Elige-</option>
                  <option value="Soltero(a)">Soltero(a)</option>
                  <option value="Casado(a)">Casado(a)</option>
                  <option value="Union libre">Union libre</option>
                  <option value="Divorciado(a)">Divorciado(a)</option>
                  <option value="Viudo(a)">Viudo(a)</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: '#333', minWidth: '160px' }}>RFC:</span>
                <input value={form.rfc} onChange={e => ch('rfc', e.target.value.toUpperCase())} style={{ ...inp(false), width: '180px' }} placeholder="Ingrese su RFC" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: '#333', minWidth: '160px' }}>Correo Electronico:</span>
                <input type="email" value={form.correo} onChange={e => ch('correo', e.target.value)} style={{ ...inp(false), width: '180px' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: '#333', minWidth: '160px' }}>No Dependientes Economicos:</span>
                <input type="number" value={form.numDependientes} onChange={e => ch('numDependientes', e.target.value)} style={{ ...inp(false), width: '80px' }} min="0" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: '#333', minWidth: '160px' }}>CURP<span style={{ color: 'red' }}> *</span>:</span>
                <button style={{ background: '#17a2b8', color: '#fff', border: 'none', borderRadius: '3px', padding: '3px 10px', fontSize: '12px', cursor: 'pointer', marginRight: '6px' }}>Generar</button>
                <input value={form.curp} onChange={e => ch('curp', e.target.value.toUpperCase())} style={{ ...inp(errors.curp), width: '200px' }} placeholder="Ingrese su CURP" />
              </div>
            </div>

            {/* Cónyuge */}
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#222', margin: '16px 0 10px', borderBottom: '1px solid #ddd', paddingBottom: '4px' }}>Datos de conyugue</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 40px', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: '#333', minWidth: '140px' }}>Nombre:</span>
                <input value={form.conyuge_nombre} onChange={e => ch('conyuge_nombre', e.target.value)} style={{ ...inp(false), width: '200px' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: '#333', minWidth: '140px' }}>Telefono:</span>
                <input type="tel" value={form.conyuge_telefono} onChange={e => ch('conyuge_telefono', e.target.value)} style={{ ...inp(false), width: '180px' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: '#333', minWidth: '140px' }}>Nombre Trabajo:</span>
                <input value={form.conyuge_trabajo} onChange={e => ch('conyuge_trabajo', e.target.value)} style={{ ...inp(false), width: '200px' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: '#333', minWidth: '140px' }}>Direccion trabajo:</span>
                <input value={form.conyuge_direccionTrabajo} onChange={e => ch('conyuge_direccionTrabajo', e.target.value)} style={{ ...inp(false), width: '200px' }} />
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <FotoUpload label="Foto conyugue" value={fotoConyuge} onChange={setFotoConyuge} />
            </div>

            {/* Referencias */}
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#222', margin: '16px 0 10px', borderBottom: '1px solid #ddd', paddingBottom: '4px' }}>Datos de contacto de referencia</h3>
            {[1, 2].map(n => (
              <div key={n} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '6px', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '13px', color: '#333', minWidth: '60px' }}>Nombre:</span>
                  <input value={form[`ref${n}_nombre`]} onChange={e => ch(`ref${n}_nombre`, e.target.value)} style={inp(false)} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '13px', color: '#333', minWidth: '60px' }}>Telefono:</span>
                  <input type="tel" value={form[`ref${n}_telefono`]} onChange={e => ch(`ref${n}_telefono`, e.target.value)} style={inp(false)} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '13px', color: '#333', minWidth: '70px' }}>Domicilio:</span>
                  <input value={form[`ref${n}_domicilio`]} onChange={e => ch(`ref${n}_domicilio`, e.target.value)} style={inp(false)} />
                </div>
              </div>
            ))}

            {/* Domicilio */}
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#222', margin: '16px 0 8px', borderBottom: '1px solid #ddd', paddingBottom: '4px' }}>Domicilio</h3>
            <DomicilioFields form={form} ch={ch} inp={inp} prefijo="" />
          </>}

          {/* ══════════════ TAB 1: DOCUMENTACIÓN DIGITAL ══════════════ */}
          {tab === 1 && <>
            <p style={{ fontSize: '13px', color: '#555', background: '#f5f5f5', padding: '8px 12px', marginBottom: '16px', border: '1px solid #ddd' }}>
              La documentacion es opcional, al igual una vez cargado el cliente puedes actualizar la documentacion posteriormente.
            </p>
            <DocRow icon={FileTextIcon} label="Comprobante domicilio"   value={docs.comprobanteDomicilio}  onChange={v => setDocs(p => ({ ...p, comprobanteDomicilio: v }))} />
            <DocRow icon={DollarIcon}   label="Comprobante de ingresos" value={docs.comprobanteIngresos}   onChange={v => setDocs(p => ({ ...p, comprobanteIngresos: v }))} />
            <DocRow icon={IdIcon}       label="Identificacion oficial"  value={docs.identificacion}        onChange={v => setDocs(p => ({ ...p, identificacion: v }))} />
            <DocRow icon={ProfileIcon}  label="Fotografia para perfil"  value={docs.fotoPerfil}            onChange={v => setDocs(p => ({ ...p, fotoPerfil: v }))} />
            <DocRow icon={ActaIcon}     label="Acta Nacimiento"         value={docs.actaNacimiento}        onChange={v => setDocs(p => ({ ...p, actaNacimiento: v }))} />
            <DocRow icon={CurpIcon}     label="CURP"                    value={docs.curpDoc}               onChange={v => setDocs(p => ({ ...p, curpDoc: v }))} />
            <DocRow icon={CasaIcon}     label="Fachada de casa"         value={docs.fachadaCasa}           onChange={v => setDocs(p => ({ ...p, fachadaCasa: v }))} />
            <DocRow icon={NegocioIcon}  label="Fachada de Negocio"      value={docs.fachadaNegocio}        onChange={v => setDocs(p => ({ ...p, fachadaNegocio: v }))} />
          </>}

          {/* ══════════════ TAB 2: INFORMACIÓN FINANCIERA ══════════════ */}
          {tab === 2 && <>
            <div style={{ background: '#fafae8', border: '1px solid #ddd', padding: '14px', marginBottom: '16px' }}>
              <SubHead>Ingresos</SubHead>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '8px' }}>
                <span style={{ fontSize: '13px' }}>
                  Ingreso mensual promedio:&nbsp;
                  <input type="number" value={form.ingresoMensual} onChange={e => ch('ingresoMensual', e.target.value)} style={inpNum} />
                </span>
                <span style={{ fontSize: '13px' }}>
                  Otros Ingresos:&nbsp;
                  <input type="number" value={form.otrosIngresos} onChange={e => ch('otrosIngresos', e.target.value)} style={inpNum} />
                </span>
                <span style={{ fontSize: '13px' }}>
                  Ingreso promedio total:&nbsp;
                  <input readOnly value={ingresoTotal} style={{ ...inpNum, background: '#f0f0f0' }} />
                </span>
              </div>

              <div style={{ height: '16px' }} />
              <SubHead>Gasto promedio mensual</SubHead>
              <div style={{ paddingLeft: '8px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '4px' }}>
                  {[
                    ['Alimento', 'gastoAlimento'], ['Luz', 'gastoLuz'], ['Telefono', 'gastoTelefono'], ['Transporte', 'gastoTransporte'],
                    ['Renta', 'gastoRenta'], ['Inversion negocio', 'gastoInversion'], ['Creditos', 'gastoCreditos'], ['Otros', 'gastoOtros'],
                  ].map(([label, name]) => (
                    <span key={name} style={{ fontSize: '13px', marginRight: '10px' }}>
                      {label}:&nbsp;<input type="number" value={form[name]} onChange={e => ch(name, e.target.value)} style={inpNumSm} />
                    </span>
                  ))}
                </div>
                <span style={{ fontSize: '13px' }}>Total gasto:&nbsp;<input readOnly value={totalGasto} style={{ ...inpNumSm, background: '#f0f0f0' }} /></span>
              </div>

              <div style={{ height: '12px' }} />
              <span style={{ fontSize: '13px', paddingLeft: '8px' }}>
                Total Disponible mensual:&nbsp;
                <input readOnly value={totalDisponible} style={{ ...inpNum, background: '#f0f0f0', color: totalDisponible < 0 ? '#dc2626' : '#166534' }} />
              </span>
            </div>

            {/* Estudio socioeconómico */}
            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700' }}>Estudio socioeconómico</h3>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px' }}>Tipo de Vivienda</span>
              <select value={form.tipoVivienda} onChange={e => ch('tipoVivienda', e.target.value)} style={{ ...sel(false), width: '200px' }}>
                <option value="">Propia, Rentada o Familiar</option>
                <option value="Propia">Propia</option>
                <option value="Rentada">Rentada</option>
                <option value="Familiar">Familiar</option>
              </select>
            </div>
            <div style={{ textAlign: 'center', fontWeight: '700', fontSize: '13px', marginBottom: '8px' }}>Cuenta con estos electrodomesticos</div>
            <div style={{ display: 'grid', gridTemplateColumns: '200px 200px', gap: '6px', paddingLeft: '20px' }}>
              {[
                ['Refrigerador','elecRefrigerador'],['Estufa','elecEstufa'],['Lavadora','elecLavadora'],
                ['Television','elecTelevision'],['Licuadora','elecLicuadora'],['Horno','elecHorno'],
                ['Computadora','elecComputadora'],['Sala','elecSala'],['Celular','elecCelular'],
                ['Vehiculo (Marca, modelo)','elecVehiculo'],
              ].map(([label, name]) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '13px', minWidth: '130px' }}>{label}</span>
                  <input value={form[name]} onChange={e => ch(name, e.target.value)} style={{ border: '1px solid #ccc', borderRadius: '2px', padding: '3px 6px', fontSize: '12px', width: '60px' }} />
                </div>
              ))}
            </div>
          </>}

          {/* ══════════════ TAB 3: INFORMACIÓN LABORAL ══════════════ */}
          {tab === 3 && <>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px' }}>Fuente de ingresos:</span>
              <select value={form.fuenteIngresos} onChange={e => ch('fuenteIngresos', e.target.value)} style={{ ...sel(false), width: '180px' }}>
                <option value="">En espera de seleccion de...</option>
                <option value="Empleo formal">Empleo formal</option>
                <option value="Negocio propio">Negocio propio</option>
                <option value="Pensionado">Pensionado</option>
                <option value="Honorarios">Honorarios</option>
                <option value="Otro">Otro</option>
              </select>
              <span style={{ fontSize: '13px' }}>Nombre de la empresa:</span>
              <input value={form.empresa} onChange={e => ch('empresa', e.target.value)} style={{ ...inp(false), width: '160px' }} />
              <span style={{ fontSize: '13px' }}>RFC:</span>
              <input value={form.rfcEmpresa} onChange={e => ch('rfcEmpresa', e.target.value.toUpperCase())} style={{ ...inp(false), width: '130px' }} />
            </div>

            <div style={{ background: '#e8e8e8', padding: '4px 8px', marginBottom: '8px', fontWeight: '600', fontSize: '13px' }}>Domicilio</div>
            <DomicilioFields form={form} ch={ch} inp={inp} prefijo="Laboral" />

            {/* Confirmar + Guardar */}
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #ddd' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#333', marginBottom: '16px', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.confirmar} onChange={e => ch('confirmar', e.target.checked)} style={{ width: '14px', height: '14px' }} />
                Confirmar datos
              </label>
              <button
                onClick={handleSave}
                disabled={estado === 'loading'}
                style={{ width: '100%', background: '#1565c0', color: '#fff', border: 'none', padding: '14px', fontSize: '16px', fontWeight: '700', cursor: estado === 'loading' ? 'not-allowed' : 'pointer', borderRadius: '4px', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {estado === 'loading' ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />Guardando...</> : 'Agregar cliente'}
              </button>
            </div>
          </>}

        </div>
      </div>

      {/* Botón limpiar global */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px', marginBottom: '32px' }}>
        <button onClick={reset} style={{ background: '#fff', border: '1px solid #ccc', borderRadius: '4px', padding: '7px 18px', fontSize: '13px', color: '#555', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <RotateCcw size={13} /> Limpiar formulario
        </button>
      </div>

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ── Campos de domicilio reutilizables (personal y laboral) ─────────────
function DomicilioFields({ form, ch, inp, prefijo }) {
  const p = prefijo;
  const f = (n) => p ? `${n}${p}` : n;
  const ESTADOS_MX = ['Aguascalientes','Baja California','Baja California Sur','Campeche','Chiapas','Chihuahua','Ciudad de Mexico','Coahuila de Zaragoza','Colima','Distrito Federal','Durango','Guanajuato','Guerrero','Hidalgo','Jalisco','Mexico','Michoacan','Morelos','Nayarit','Nuevo Leon','Oaxaca','Puebla','Queretaro','Quintana Roo','San Luis Potosi','Sinaloa','Sonora','Tabasco','Tamaulipas','Tlaxcala','Veracruz','Yucatan','Zacatecas'];
  const sel = (e) => ({ ...inp(e), cursor: 'pointer' });

  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
        <span style={{ fontSize: '13px', minWidth: '100px' }}>Codigo postal</span>
        <input value={form[f('cp')] || ''} onChange={e => ch(f('cp'), e.target.value)} style={{ ...inp(false), width: '120px' }} />
        <button style={{ background: '#17a2b8', color: '#fff', border: 'none', borderRadius: '3px', padding: '4px 12px', fontSize: '12px', cursor: 'pointer' }}>BUSCAR</button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '13px', minWidth: '45px' }}>Calle:</span>
        <input value={form[f('calle')] || ''} onChange={e => ch(f('calle'), e.target.value)} style={{ ...inp(false), width: '160px' }} />
        <span style={{ fontSize: '13px' }}>Numero exterior:</span>
        <input value={form[f('numExt')] || ''} onChange={e => ch(f('numExt'), e.target.value)} style={{ ...inp(false), width: '100px' }} />
        <span style={{ fontSize: '13px' }}>Numero interior:</span>
        <input value={form[f('numInt')] || ''} onChange={e => ch(f('numInt'), e.target.value)} style={{ ...inp(false), width: '100px' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '13px', minWidth: '140px' }}>Referencia Ubicacion</span>
        <span style={{ fontSize: '13px' }}>Entre las calles de:</span>
        <input value={form[f('entreCalles1')] || ''} onChange={e => ch(f('entreCalles1'), e.target.value)} style={{ ...inp(false), width: '130px' }} />
        <span style={{ fontSize: '13px' }}>y de:</span>
        <input value={form[f('entreCalles2')] || ''} onChange={e => ch(f('entreCalles2'), e.target.value)} style={{ ...inp(false), width: '130px' }} />
      </div>
      <div style={{ marginBottom: '6px' }}>
        <span style={{ fontSize: '13px', display: 'block', marginBottom: '2px' }}>Referencia Adicional</span>
        <input value={form[f('referenciaAdicional')] || ''} onChange={e => ch(f('referenciaAdicional'), e.target.value)} style={{ ...inp(false), width: '100%' }} />
      </div>
      {/* Mapa placeholder */}
      <div style={{ marginTop: '8px', border: '1px solid #ccc', borderRadius: '4px', height: '200px', background: '#e8e8e8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: '13px', flexDirection: 'column', gap: '6px' }}>
        <MapPin size={24} color="#555" />
        <span>-Arrastra la flecha en el mapa para ubicar la casa del cliente</span>
        <span style={{ fontSize: '11px', color: '#888' }}>Mapa de Google Maps</span>
      </div>
    </div>
  );
}

// ── Íconos SVG inline para documentos ──────────────
const FileTextIcon = ({ size, color, strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || '#555'} strokeWidth={strokeWidth || 1.2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
    <circle cx="11" cy="14" r="3"/><line x1="17" y1="20" x2="14.5" y2="17.5"/>
  </svg>
);
const DollarIcon = ({ size, color, strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || '#555'} strokeWidth={strokeWidth || 1.2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="18" rx="2"/>
    <path d="M12 8v8M9 11h6M9 14h6"/>
    <line x1="2" y1="7" x2="22" y2="7"/>
  </svg>
);
const IdIcon = ({ size, color, strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || '#555'} strokeWidth={strokeWidth || 1.2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2"/>
    <circle cx="8" cy="12" r="2"/>
    <line x1="12" y1="10" x2="18" y2="10"/>
    <line x1="12" y1="14" x2="16" y2="14"/>
  </svg>
);
const ProfileIcon = ({ size, color, strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || '#555'} strokeWidth={strokeWidth || 1.2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <circle cx="12" cy="10" r="3"/>
    <path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/>
    <rect x="14" y="3" width="3" height="18" rx="1" fill="#ccc" stroke="none"/>
  </svg>
);
const ActaIcon = ({ size, color, strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || '#555'} strokeWidth={strokeWidth || 1.2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
    <polyline points="9 15 11 17 15 13"/>
    <line x1="9" y1="10" x2="15" y2="10"/>
  </svg>
);
const CurpIcon = ({ size, color, strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || '#555'} strokeWidth={strokeWidth || 1.2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="16" rx="2"/>
    <circle cx="12" cy="10" r="2"/>
    <line x1="7" y1="17" x2="17" y2="17"/>
    <line x1="7" y1="7" x2="10" y2="7"/>
  </svg>
);
const CasaIcon = ({ size, color, strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || '#555'} strokeWidth={strokeWidth || 1.2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const NegocioIcon = ({ size, color, strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || '#555'} strokeWidth={strokeWidth || 1.2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9h18v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9z"/>
    <path d="M3 9l2-5h14l2 5"/>
    <line x1="9" y1="9" x2="9" y2="20"/>
    <line x1="15" y1="9" x2="15" y2="20"/>
    <rect x="10" y="14" width="4" height="6"/>
  </svg>
);