'use client';
import { useState } from 'react';
import { User, FileText, MapPin, Phone, Mail, Save, RotateCcw } from 'lucide-react';

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
  const [form, setForm]     = useState(INITIAL);
  const [saved, setSaved]   = useState(false);
  const [errors, setErrors] = useState({});

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

  const handleSave  = () => { if (!validate()) return; setSaved(true); setTimeout(() => setSaved(false), 2500); };
  const handleReset = () => { setForm(INITIAL); setErrors({}); setSaved(false); };

  const inp = (err) => ({
    border: `1.5px solid ${err ? '#ef4444' : '#e2e8f0'}`,
    borderRadius: '9px', padding: '10px 13px', fontSize: '13px',
    fontFamily: 'DM Sans, sans-serif', color: '#0d1f5c', outline: 'none',
    width: '100%', background: '#fafbfd', boxSizing: 'border-box',
  });

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }}>

      {saved && (
        <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: '10px', padding: '12px 18px', marginBottom: '20px', color: '#166534', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Save size={15} /> Cliente registrado correctamente.
        </div>
      )}

      {SECCIONES.map(({ titulo, icon: Icon, campos }) => (
        <div key={titulo} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e4ecf5', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', marginBottom: '20px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Icon size={17} color="#1565c0" />
            <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '16px', fontWeight: '700', color: '#040e2e' }}>{titulo}</span>
          </div>
          <div style={{ padding: '22px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {campos.map(({ label, name, type, opts }) => (
              <div key={name}>
                <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' }}>
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
        <button onClick={handleReset} style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '11px 24px', fontSize: '13px', fontWeight: '600', color: '#64748b', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '7px' }}>
          <RotateCcw size={14} /> Limpiar
        </button>
        <button onClick={handleSave} style={{ background: '#1565c0', border: 'none', borderRadius: '10px', padding: '11px 28px', fontSize: '13px', fontWeight: '600', color: '#fff', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '7px' }}>
          <Save size={14} /> Guardar cliente
        </button>
      </div>
    </div>
  );
}