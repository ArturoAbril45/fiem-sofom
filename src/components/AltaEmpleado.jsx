'use client';
import { useState } from 'react';
import { User, Shield, Save, RotateCcw, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://fiem-backend-production.up.railway.app';
const PUESTOS = ['Gerente', 'Ejecutivo de cobranza', 'Cajero', 'Administrativo', 'Director', 'Otro'];
const INITIAL = { nombre: '', apellidoP: '', apellidoM: '', curp: '', rfc: '', telefono: '', email: '', puesto: '', sucursal: '', fechaIngreso: '', usuario: '', rol: 'ejecutivo' };

export default function AltaEmpleado() {
  const [form,   setForm]   = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [estado, setEstado] = useState(null);
  const [mensaje,setMensaje]= useState('');

  const change = (k, v) => { setForm(p => ({ ...p, [k]: v })); if (errors[k]) setErrors(p => ({ ...p, [k]: false })); };

  const validate = () => {
    const req = ['nombre', 'apellidoP', 'curp', 'telefono', 'puesto'];
    const errs = {};
    req.forEach(k => { if (!form[k]) errs[k] = true; });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setEstado('loading');
    try {
      const res = await fetch(`${API}/api/empleados`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, estatus: 'Activo' }),
      });
      if (!res.ok) throw new Error('Error al registrar empleado');
      setEstado('ok'); setMensaje('Empleado registrado correctamente.');
      setTimeout(() => { setForm(INITIAL); setEstado(null); setMensaje(''); }, 3000);
    } catch (e) {
      setEstado('error'); setMensaje(e.message);
      setTimeout(() => setEstado(null), 4000);
    }
  };

  const inp = (err) => ({ border: `1.5px solid ${err ? '#ef4444' : '#dceaf8'}`, borderRadius: '9px', padding: '10px 13px', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', color: '#1a3d6e', outline: 'none', width: '100%', background: '#fafcff', boxSizing: 'border-box' });
  const lbl = (n) => <label style={{ fontSize: '11px', fontWeight: '600', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' }}>{n}</label>;
  const section = (titulo, Icon, children) => (
    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #dceaf8', boxShadow: '0 2px 12px rgba(14,80,160,0.05)', marginBottom: '20px', overflow: 'hidden' }}>
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f6ff', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '32px', height: '32px', background: '#e8f2fc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={16} color="#0e50a0" /></div>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', fontWeight: '700', color: '#0a2d5e' }}>{titulo}</span>
      </div>
      <div style={{ padding: '22px 24px' }}>{children}</div>
    </div>
  );

  const field = (label, key, opts = {}) => (
    <div>
      {lbl(label)}
      {opts.type === 'select' ? (
        <select value={form[key]} onChange={e => change(key, e.target.value)} style={{ ...inp(errors[key]), cursor: 'pointer' }}>
          <option value="">Seleccionar...</option>
          {opts.options.map(o => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
        </select>
      ) : (
        <input type={opts.type || 'text'} value={form[key]} onChange={e => change(key, e.target.value)} placeholder={opts.placeholder || label} style={inp(errors[key])} />
      )}
      {errors[key] && <span style={{ color: '#ef4444', fontSize: '11px' }}>Requerido</span>}
    </div>
  );

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }}>
      {estado === 'ok'    && <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: '12px', padding: '13px 18px', marginBottom: '18px', color: '#166534', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle size={16} />{mensaje}</div>}
      {estado === 'error' && <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '12px', padding: '13px 18px', marginBottom: '18px', color: '#dc2626', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}><AlertCircle size={16} />{mensaje}</div>}

      {section('Datos personales', User,
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {field('Nombre *',         'nombre',    { placeholder: 'Nombre(s)' })}
          {field('Apellido paterno *','apellidoP', { placeholder: 'Apellido paterno' })}
          {field('Apellido materno', 'apellidoM', { placeholder: 'Apellido materno' })}
          {field('CURP *',           'curp',      { placeholder: 'CURP' })}
          {field('RFC',              'rfc',       { placeholder: 'RFC' })}
          {field('Telefono *',       'telefono',  { placeholder: '10 digitos' })}
          <div style={{ gridColumn: '1 / -1' }}>{field('Email', 'email', { type: 'email', placeholder: 'correo@ejemplo.com' })}</div>
        </div>
      )}

      {section('Datos laborales', Shield,
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {field('Puesto *', 'puesto', { type: 'select', options: PUESTOS })}
          {field('Sucursal', 'sucursal', { placeholder: 'Nombre de la sucursal' })}
          {field('Fecha de ingreso', 'fechaIngreso', { type: 'date' })}
          {field('Usuario del sistema', 'usuario', { placeholder: 'Nombre de usuario' })}
          {field('Rol', 'rol', { type: 'select', options: [{ value: 'admin', label: 'Administrador' }, { value: 'ejecutivo', label: 'Ejecutivo' }, { value: 'cajero', label: 'Cajero' }] })}
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button onClick={() => { setForm(INITIAL); setErrors({}); setEstado(null); }} style={{ background: '#fff', border: '1.5px solid #dceaf8', borderRadius: '10px', padding: '11px 24px', fontSize: '13px', fontWeight: '600', color: '#4a6a94', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '7px' }}>
          <RotateCcw size={14} /> Limpiar
        </button>
        <button onClick={handleSave} disabled={estado === 'loading'} style={{ background: estado === 'loading' ? '#90aac8' : '#0e50a0', border: 'none', borderRadius: '10px', padding: '11px 28px', fontSize: '13px', fontWeight: '600', color: '#fff', cursor: estado === 'loading' ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '7px', boxShadow: '0 4px 14px rgba(14,80,160,0.28)' }}>
          {estado === 'loading' ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Guardando...</> : <><Save size={14} /> Guardar empleado</>}
        </button>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}