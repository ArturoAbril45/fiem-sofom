'use client';
import { useState } from 'react';
import { User, PiggyBank, Save, RotateCcw } from 'lucide-react';

const PRODUCTOS = [
  'AHORRO ORDINARIO', 'AHORRO CRECEMAX', 'Inversion 60',
  'Ahorro creceMax 120', 'AHORRO NOMINA',
];

const INITIAL = {
  clienteNombre: '', clienteCurp: '', producto: '',
  montoInicial: '', ejecutivo: '', fechaApertura: '', observaciones: '',
};

export default function AperturarAhorro() {
  const [form, setForm]     = useState(INITIAL);
  const [saved, setSaved]   = useState(false);
  const [errors, setErrors] = useState({});

  const change = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    if (errors[k]) setErrors(p => ({ ...p, [k]: false }));
  };

  const validate = () => {
    const req = ['clienteNombre', 'clienteCurp', 'producto', 'fechaApertura'];
    const errs = {};
    req.forEach(k => { if (!form[k]) errs[k] = true; });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave  = () => { if (!validate()) return; setSaved(true); setTimeout(() => setSaved(false), 2500); };
  const handleReset = () => { setForm(INITIAL); setErrors({}); setSaved(false); };

  const inp = (err) => ({
    border: `1.5px solid ${err ? '#ef4444' : '#e2e8f0'}`, borderRadius: '9px',
    padding: '10px 13px', fontSize: '13px', fontFamily: 'DM Sans, sans-serif',
    color: '#0d1f5c', outline: 'none', width: '100%', background: '#fafbfd', boxSizing: 'border-box',
  });

  const lbl = (t) => (
    <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' }}>
      {t}
    </label>
  );

  const section = (titulo, Icon, children) => (
    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e4ecf5', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', marginBottom: '20px', overflow: 'hidden' }}>
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Icon size={17} color="#0891b2" />
        <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '16px', fontWeight: '700', color: '#040e2e' }}>{titulo}</span>
      </div>
      <div style={{ padding: '22px 24px' }}>{children}</div>
    </div>
  );

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }}>

      {saved && (
        <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: '10px', padding: '12px 18px', marginBottom: '20px', color: '#166534', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Save size={15} /> Cuenta de ahorro aperturada correctamente.
        </div>
      )}

      {section('Datos del cliente', User,
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            {lbl('Nombre del cliente *')}
            <input
              value={form.clienteNombre}
              onChange={e => change('clienteNombre', e.target.value)}
              placeholder="Nombre completo"
              style={inp(errors.clienteNombre)}
            />
            {errors.clienteNombre && <span style={{ color: '#ef4444', fontSize: '11px' }}>Requerido</span>}
          </div>
          <div>
            {lbl('CURP *')}
            <input
              value={form.clienteCurp}
              onChange={e => change('clienteCurp', e.target.value)}
              placeholder="CURP"
              style={inp(errors.clienteCurp)}
            />
            {errors.clienteCurp && <span style={{ color: '#ef4444', fontSize: '11px' }}>Requerido</span>}
          </div>
        </div>
      )}

      {section('Producto de ahorro', PiggyBank,
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            {lbl('Producto *')}
            <select
              value={form.producto}
              onChange={e => change('producto', e.target.value)}
              style={{ ...inp(errors.producto), cursor: 'pointer' }}
            >
              <option value="">Seleccionar...</option>
              {PRODUCTOS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            {errors.producto && <span style={{ color: '#ef4444', fontSize: '11px' }}>Requerido</span>}
          </div>
          <div>
            {lbl('Monto inicial (MXN)')}
            <input
              type="number"
              value={form.montoInicial}
              onChange={e => change('montoInicial', e.target.value)}
              placeholder="0.00"
              style={inp(false)}
            />
          </div>
          <div>
            {lbl('Fecha de apertura *')}
            <input
              type="date"
              value={form.fechaApertura}
              onChange={e => change('fechaApertura', e.target.value)}
              style={inp(errors.fechaApertura)}
            />
            {errors.fechaApertura && <span style={{ color: '#ef4444', fontSize: '11px' }}>Requerido</span>}
          </div>
          <div>
            {lbl('Ejecutivo asignado')}
            <input
              value={form.ejecutivo}
              onChange={e => change('ejecutivo', e.target.value)}
              placeholder="Nombre del ejecutivo"
              style={inp(false)}
            />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            {lbl('Observaciones')}
            <textarea
              value={form.observaciones}
              onChange={e => change('observaciones', e.target.value)}
              placeholder="Notas adicionales..."
              rows={2}
              style={{ ...inp(false), resize: 'vertical' }}
            />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button
          onClick={handleReset}
          style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '11px 24px', fontSize: '13px', fontWeight: '600', color: '#64748b', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '7px' }}
        >
          <RotateCcw size={14} /> Limpiar
        </button>
        <button
          onClick={handleSave}
          style={{ background: '#0891b2', border: 'none', borderRadius: '10px', padding: '11px 28px', fontSize: '13px', fontWeight: '600', color: '#fff', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '7px' }}
        >
          <Save size={14} /> Aperturar cuenta
        </button>
      </div>
    </div>
  );
}