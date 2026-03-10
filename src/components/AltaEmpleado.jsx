'use client';
import { useState } from 'react';
import { User, MapPin, Briefcase, Save, RotateCcw } from 'lucide-react';

const INITIAL = {
  nombre: '', apellidoPaterno: '', apellidoMaterno: '',
  curp: '', rfc: '', nss: '',
  fechaNacimiento: '', sexo: '', estadoCivil: '',
  celular: '', correo: '',
  calle: '', colonia: '', municipio: '', estado: '', cp: '',
  puesto: '', gerencia: '', ruta: '', fechaIngreso: '',
  salario: '', tipoContrato: '',
};

const PUESTOS    = ['Ejecutivo de campo', 'Gerente de zona', 'Cajero', 'Analista de credito', 'Coordinador', 'Administrador', 'Director'];
const CONTRATOS  = ['Nomina', 'Honorarios', 'Temporal', 'Por proyecto'];
const GERENCIAS  = ['MATRIZ (01)', 'Zumpango (02)', 'TIZAYUCA (03)'];

export default function AltaEmpleado() {
  const [form, setForm]     = useState(INITIAL);
  const [saved, setSaved]   = useState(false);
  const [errors, setErrors] = useState({});

  const change = (k, v) => { setForm(p => ({ ...p, [k]: v })); if (errors[k]) setErrors(p => ({ ...p, [k]: false })); };

  const validate = () => {
    const req = ['nombre', 'apellidoPaterno', 'curp', 'fechaNacimiento', 'celular', 'puesto', 'fechaIngreso'];
    const errs = {};
    req.forEach(k => { if (!form[k]) errs[k] = true; });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave  = () => { if (!validate()) return; setSaved(true); setTimeout(() => setSaved(false), 2500); };
  const handleReset = () => { setForm(INITIAL); setErrors({}); setSaved(false); };

  const inp = (err) => ({
    border: `1.5px solid ${err ? '#ef4444' : '#dceaf8'}`, borderRadius: '9px',
    padding: '10px 13px', fontSize: '13px', fontFamily: 'DM Sans, sans-serif',
    color: '#1a3d6e', outline: 'none', width: '100%', background: '#fafcff', boxSizing: 'border-box',
    transition: 'border-color .15s',
  });
  const lbl = (t, req) => (
    <label style={{ fontSize: '11px', fontWeight: '600', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' }}>
      {t}{req && <span style={{ color: '#ef4444', marginLeft: '3px' }}>*</span>}
    </label>
  );
  const card = (titulo, Icon, children) => (
    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #dceaf8', boxShadow: '0 2px 12px rgba(14,80,160,0.05)', marginBottom: '20px', overflow: 'hidden' }}>
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f6ff', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '32px', height: '32px', background: '#e8f2fc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={16} color="#0e50a0" />
        </div>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', fontWeight: '700', color: '#0a2d5e' }}>{titulo}</span>
      </div>
      <div style={{ padding: '22px 24px' }}>{children}</div>
    </div>
  );

  const field = (label, key, opts = {}) => (
    <div>
      {lbl(label, opts.req)}
      {opts.type === 'select' ? (
        <select value={form[key]} onChange={e => change(key, e.target.value)} style={{ ...inp(errors[key]), cursor: 'pointer' }}>
          <option value="">Seleccionar...</option>
          {opts.opts.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={opts.type || 'text'} value={form[key]} onChange={e => change(key, e.target.value)} placeholder={opts.placeholder || label} style={inp(errors[key])} />
      )}
      {errors[key] && <span style={{ color: '#ef4444', fontSize: '11px' }}>Requerido</span>}
    </div>
  );

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto' }}>
      {saved && (
        <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: '10px', padding: '12px 18px', marginBottom: '20px', color: '#166534', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Save size={15} /> Empleado registrado correctamente.
        </div>
      )}

      {card('Datos personales', User,
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {field('Nombre', 'nombre', { req: true })}
          {field('Apellido paterno', 'apellidoPaterno', { req: true })}
          {field('Apellido materno', 'apellidoMaterno')}
          {field('CURP', 'curp', { req: true, placeholder: 'CURP18 caracteres' })}
          {field('RFC', 'rfc', { placeholder: 'RFC con homoclave' })}
          {field('NSS', 'nss', { placeholder: 'Num. seguro social' })}
          {field('Fecha de nacimiento', 'fechaNacimiento', { req: true, type: 'date' })}
          {field('Sexo', 'sexo', { type: 'select', opts: ['Masculino', 'Femenino'] })}
          {field('Estado civil', 'estadoCivil', { type: 'select', opts: ['Soltero(a)', 'Casado(a)', 'Union libre', 'Divorciado(a)', 'Viudo(a)'] })}
        </div>
      )}

      {card('Contacto', User,
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {field('Celular', 'celular', { req: true, type: 'tel', placeholder: '10 digitos' })}
          {field('Correo electronico', 'correo', { type: 'email', placeholder: 'correo@ejemplo.com' })}
        </div>
      )}

      {card('Domicilio', MapPin,
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {field('Calle y numero', 'calle')}
          {field('Colonia', 'colonia')}
          {field('Municipio', 'municipio')}
          {field('Estado', 'estado')}
          {field('Codigo postal', 'cp', { placeholder: '00000' })}
        </div>
      )}

      {card('Informacion laboral', Briefcase,
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {field('Puesto', 'puesto', { req: true, type: 'select', opts: PUESTOS })}
          {field('Gerencia', 'gerencia', { type: 'select', opts: GERENCIAS })}
          {field('Ruta asignada', 'ruta', { placeholder: 'Nombre de la ruta' })}
          {field('Fecha de ingreso', 'fechaIngreso', { req: true, type: 'date' })}
          {field('Salario mensual (MXN)', 'salario', { type: 'number', placeholder: '0.00' })}
          {field('Tipo de contrato', 'tipoContrato', { type: 'select', opts: CONTRATOS })}
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button onClick={handleReset} style={{ background: '#fff', border: '1.5px solid #dceaf8', borderRadius: '10px', padding: '11px 24px', fontSize: '13px', fontWeight: '600', color: '#4a6a94', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '7px' }}>
          <RotateCcw size={14} /> Limpiar
        </button>
        <button onClick={handleSave} style={{ background: '#0e50a0', border: 'none', borderRadius: '10px', padding: '11px 28px', fontSize: '13px', fontWeight: '600', color: '#fff', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '7px', boxShadow: '0 4px 14px rgba(14,80,160,0.28)' }}>
          <Save size={14} /> Guardar empleado
        </button>
      </div>
    </div>
  );
}