'use client';
import { useState } from 'react';
import { Map, User, Save, RotateCcw, Check } from 'lucide-react';

const GERENCIAS = ['MATRIZ (01)', 'Zumpango (02)', 'TIZAYUCA (03)'];
const INITIAL   = {
  ejecutivoNombre: '', ejecutivoCurp: '', ejecutivoCelular: '',
  ruta: '', gerencia: '', fechaAsignacion: '', observaciones: '',
};

export default function AsignacionRutas() {
  const [form, setForm]     = useState(INITIAL);
  const [saved, setSaved]   = useState(false);
  const [errors, setErrors] = useState({});

  const change = (k, v) => { setForm(p => ({ ...p, [k]: v })); if (errors[k]) setErrors(p => ({ ...p, [k]: false })); };

  const validate = () => {
    const req = ['ejecutivoNombre', 'ejecutivoCurp', 'ruta', 'gerencia', 'fechaAsignacion'];
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

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }}>
      {saved && (
        <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: '10px', padding: '12px 18px', marginBottom: '20px', color: '#166534', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={15} /> Ruta asignada correctamente.
        </div>
      )}

      {card('Datos del ejecutivo', User,
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div>
            {lbl('Nombre completo', true)}
            <input value={form.ejecutivoNombre} onChange={e => change('ejecutivoNombre', e.target.value)} placeholder="Nombre del ejecutivo" style={inp(errors.ejecutivoNombre)} />
            {errors.ejecutivoNombre && <span style={{ color: '#ef4444', fontSize: '11px' }}>Requerido</span>}
          </div>
          <div>
            {lbl('CURP', true)}
            <input value={form.ejecutivoCurp} onChange={e => change('ejecutivoCurp', e.target.value)} placeholder="CURP" style={inp(errors.ejecutivoCurp)} />
            {errors.ejecutivoCurp && <span style={{ color: '#ef4444', fontSize: '11px' }}>Requerido</span>}
          </div>
          <div>
            {lbl('Celular')}
            <input type="tel" value={form.ejecutivoCelular} onChange={e => change('ejecutivoCelular', e.target.value)} placeholder="10 digitos" style={inp(false)} />
          </div>
        </div>
      )}

      {card('Asignacion de ruta', Map,
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            {lbl('Ruta', true)}
            <input value={form.ruta} onChange={e => change('ruta', e.target.value)} placeholder="Nombre o clave de la ruta" style={inp(errors.ruta)} />
            {errors.ruta && <span style={{ color: '#ef4444', fontSize: '11px' }}>Requerido</span>}
          </div>
          <div>
            {lbl('Gerencia', true)}
            <select value={form.gerencia} onChange={e => change('gerencia', e.target.value)} style={{ ...inp(errors.gerencia), cursor: 'pointer' }}>
              <option value="">Seleccionar...</option>
              {GERENCIAS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            {errors.gerencia && <span style={{ color: '#ef4444', fontSize: '11px' }}>Requerido</span>}
          </div>
          <div>
            {lbl('Fecha de asignacion', true)}
            <input type="date" value={form.fechaAsignacion} onChange={e => change('fechaAsignacion', e.target.value)} style={inp(errors.fechaAsignacion)} />
            {errors.fechaAsignacion && <span style={{ color: '#ef4444', fontSize: '11px' }}>Requerido</span>}
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            {lbl('Observaciones')}
            <textarea value={form.observaciones} onChange={e => change('observaciones', e.target.value)} placeholder="Notas adicionales..." rows={2} style={{ ...inp(false), resize: 'vertical' }} />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button onClick={handleReset} style={{ background: '#fff', border: '1.5px solid #dceaf8', borderRadius: '10px', padding: '11px 24px', fontSize: '13px', fontWeight: '600', color: '#4a6a94', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '7px' }}>
          <RotateCcw size={14} /> Limpiar
        </button>
        <button onClick={handleSave} style={{ background: '#0e50a0', border: 'none', borderRadius: '10px', padding: '11px 28px', fontSize: '13px', fontWeight: '600', color: '#fff', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '7px', boxShadow: '0 4px 14px rgba(14,80,160,0.28)' }}>
          <Save size={14} /> Guardar asignacion
        </button>
      </div>
    </div>
  );
}