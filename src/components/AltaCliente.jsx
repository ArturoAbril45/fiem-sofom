'use client';
import { useState } from 'react';
import { User, FileText, MapPin, Phone, Mail, Save, RotateCcw, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://fiem-backend-production.up.railway.app';

const INITIAL = {
  nombre: '', apellidoPaterno: '', apellidoMaterno: '',
  fechaNacimiento: '', genero: '', estadoCivil: '',
  curp: '', rfc: '', ine: '',
  telefono: '', celular: '', correo: '',
  calle: '', numExt: '', numInt: '', colonia: '',
  municipio: '', estado: '', cp: '',
  ocupacion: '', ingresoMensual: '',
};

const SECCIONES = [
  {
    titulo: 'Datos personales', icon: User,
    campos: [
      { label: 'Nombre(s)',           name: 'nombre',          type: 'text' },
      { label: 'Apellido paterno',    name: 'apellidoPaterno', type: 'text' },
      { label: 'Apellido materno',    name: 'apellidoMaterno', type: 'text' },
      { label: 'Fecha de nacimiento', name: 'fechaNacimiento', type: 'date' },
      { label: 'Genero',              name: 'genero',          type: 'select', opts: ['Masculino', 'Femenino'] },
      { label: 'Estado civil',        name: 'estadoCivil',     type: 'select', opts: ['Soltero(a)', 'Casado(a)', 'Union libre', 'Divorciado(a)', 'Viudo(a)'] },
    ],
  },
  {
    titulo: 'Identificacion', icon: FileText,
    campos: [
      { label: 'CURP',        name: 'curp', type: 'text' },
      { label: 'RFC',         name: 'rfc',  type: 'text' },
      { label: 'No. INE/IFE', name: 'ine',  type: 'text' },
    ],
  },
  {
    titulo: 'Contacto', icon: Phone,
    campos: [
      { label: 'Telefono fijo',      name: 'telefono', type: 'tel' },
      { label: 'Celular',            name: 'celular',  type: 'tel' },
      { label: 'Correo electronico', name: 'correo',   type: 'email' },
    ],
  },
  {
    titulo: 'Domicilio', icon: MapPin,
    campos: [
      { label: 'Calle',              name: 'calle',     type: 'text' },
      { label: 'No. exterior',       name: 'numExt',    type: 'text' },
      { label: 'No. interior',       name: 'numInt',    type: 'text' },
      { label: 'Colonia',            name: 'colonia',   type: 'text' },
      { label: 'Municipio/Alcaldia', name: 'municipio', type: 'text' },
      { label: 'Estado',             name: 'estado',    type: 'select', opts: ['Aguascalientes','Baja California','Baja California Sur','Campeche','Chiapas','Chihuahua','Ciudad de Mexico','Coahuila','Colima','Durango','Guanajuato','Guerrero','Hidalgo','Jalisco','Mexico','Michoacan','Morelos','Nayarit','Nuevo Leon','Oaxaca','Puebla','Queretaro','Quintana Roo','San Luis Potosi','Sinaloa','Sonora','Tabasco','Tamaulipas','Tlaxcala','Veracruz','Yucatan','Zacatecas'] },
      { label: 'Codigo postal',      name: 'cp',        type: 'text' },
    ],
  },
  {
    titulo: 'Informacion economica', icon: Mail,
    campos: [
      { label: 'Ocupacion',                  name: 'ocupacion',      type: 'text' },
      { label: 'Ingreso mensual aproximado', name: 'ingresoMensual', type: 'number' },
    ],
  },
];

const REQUERIDOS = ['nombre', 'apellidoPaterno', 'fechaNacimiento', 'curp', 'celular'];

export default function AltaCliente() {
  const [form,    setForm]    = useState(INITIAL);
  const [errors,  setErrors]  = useState({});
  const [estado,  setEstado]  = useState(null); // null | 'loading' | 'ok' | 'error'
  const [mensaje, setMensaje] = useState('');

  const change = (name, val) => {
    setForm(p => ({ ...p, [name]: val }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: false }));
  };

  const validate = () => {
    const errs = {};
    REQUERIDOS.forEach(k => { if (!form[k]) errs[k] = true; });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setEstado('loading');
    try {
      const res = await fetch(`${API}/api/clientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre:    form.nombre,
          apellidoP: form.apellidoPaterno,
          apellidoM: form.apellidoMaterno,
          curp:      form.curp.toUpperCase(),
          rfc:       form.rfc.toUpperCase(),
          fechaNac:  form.fechaNacimiento,
          sexo:      form.genero,
          estadoCivil: form.estadoCivil,
          telefono:  form.telefono,
          celular:   form.celular,
          correo:    form.correo,
          calle:     form.calle,
          colonia:   form.colonia,
          municipio: form.municipio,
          estado:    form.estado,
          cp:        form.cp,
          estatus:   'Activo',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar');
      setEstado('ok');
      setMensaje(`Cliente ${form.nombre} ${form.apellidoPaterno} registrado correctamente.`);
      setTimeout(() => { setForm(INITIAL); setEstado(null); setMensaje(''); }, 3000);
    } catch (e) {
      setEstado('error');
      setMensaje(e.message.includes('duplicate') ? 'Ya existe un cliente con ese CURP.' : e.message);
      setTimeout(() => setEstado(null), 4000);
    }
  };

  const handleReset = () => { setForm(INITIAL); setErrors({}); setEstado(null); setMensaje(''); };

  const inp = (err) => ({
    border: `1.5px solid ${err ? '#ef4444' : '#dceaf8'}`,
    borderRadius: '9px', padding: '10px 13px', fontSize: '13px',
    fontFamily: 'DM Sans, sans-serif', color: '#1a3d6e', outline: 'none',
    width: '100%', background: '#fafcff', boxSizing: 'border-box',
  });

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }}>

      {/* Notificación */}
      {estado === 'ok' && (
        <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', color: '#166534', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle size={16} /> {mensaje}
        </div>
      )}
      {estado === 'error' && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', color: '#dc2626', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={16} /> {mensaje}
        </div>
      )}

      {SECCIONES.map(({ titulo, icon: Icon, campos }) => (
        <div key={titulo} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #dceaf8', boxShadow: '0 2px 12px rgba(14,80,160,0.05)', marginBottom: '20px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f6ff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', background: '#e8f2fc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={16} color="#0e50a0" />
            </div>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', fontWeight: '700', color: '#0a2d5e' }}>{titulo}</span>
          </div>
          <div style={{ padding: '22px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {campos.map(({ label, name, type, opts }) => (
              <div key={name}>
                <label style={{ fontSize: '11px', fontWeight: '600', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' }}>
                  {label} {REQUERIDOS.includes(name) && <span style={{ color: '#ef4444' }}>*</span>}
                </label>
                {type === 'select' ? (
                  <select value={form[name]} onChange={e => change(name, e.target.value)} style={{ ...inp(errors[name]), cursor: 'pointer' }}>
                    <option value="">Seleccionar...</option>
                    {opts.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input type={type} value={form[name]} onChange={e => change(name, e.target.value)} placeholder={label} style={inp(errors[name])} />
                )}
                {errors[name] && <span style={{ color: '#ef4444', fontSize: '11px' }}>Campo requerido</span>}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '4px' }}>
        <button onClick={handleReset} style={{ background: '#fff', border: '1.5px solid #dceaf8', borderRadius: '10px', padding: '11px 24px', fontSize: '13px', fontWeight: '600', color: '#4a6a94', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '7px' }}>
          <RotateCcw size={14} /> Limpiar
        </button>
        <button onClick={handleSave} disabled={estado === 'loading'} style={{ background: estado === 'loading' ? '#90aac8' : '#0e50a0', border: 'none', borderRadius: '10px', padding: '11px 28px', fontSize: '13px', fontWeight: '600', color: '#fff', cursor: estado === 'loading' ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '7px', boxShadow: '0 4px 14px rgba(14,80,160,0.28)' }}>
          {estado === 'loading' ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Guardando...</> : <><Save size={14} /> Guardar cliente</>}
        </button>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}