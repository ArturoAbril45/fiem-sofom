'use client';
import { useState } from 'react';
import { Phone, User, Save, RotateCcw, Check, AlertCircle } from 'lucide-react';

const TIPOS_GESTION  = ['Llamada telefonica', 'Visita domiciliaria', 'Visita en trabajo', 'Mensaje WhatsApp', 'Correo electronico', 'Acuerdo de pago', 'Promesa de pago'];
const RESULTADOS     = ['Contacto exitoso', 'Sin respuesta', 'Numero incorrecto', 'Promesa de pago aceptada', 'Rechazo de pago', 'Domicilio no localizado', 'Cliente ausente'];
const INITIAL = {
  clienteNombre: '', clienteCurp: '', folioCRedito: '',
  tipoGestion: '', resultado: '', montoComprometido: '',
  fechaCompromiso: '', fechaGestion: '', ejecutivo: '',
  observaciones: '',
};

export default function NuevaGestion() {
  const [form, setForm]     = useState(INITIAL);
  const [saved, setSaved]   = useState(false);
  const [errors, setErrors] = useState({});

  const change = (k, v) => { setForm(p => ({ ...p, [k]: v })); if (errors[k]) setErrors(p => ({ ...p, [k]: false })); };

  const validate = () => {
    const req = ['clienteNombre', 'folioCRedito', 'tipoGestion', 'resultado', 'fechaGestion'];
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
          <Check size={15} /> Gestion de cobranza registrada correctamente.
        </div>
      )}

      {card('Datos del cliente', User,
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div>
            {lbl('Nombre del cliente', true)}
            <input value={form.clienteNombre} onChange={e => change('clienteNombre', e.target.value)} placeholder="Nombre completo" style={inp(errors.clienteNombre)} />
            {errors.clienteNombre && <span style={{ color: '#ef4444', fontSize: '11px' }}>Requerido</span>}
          </div>
          <div>
            {lbl('CURP')}
            <input value={form.clienteCurp} onChange={e => change('clienteCurp', e.target.value)} placeholder="CURP" style={inp(false)} />
          </div>
          <div>
            {lbl('Folio de credito', true)}
            <input value={form.folioCRedito} onChange={e => change('folioCRedito', e.target.value)} placeholder="Folio" style={inp(errors.folioCRedito)} />
            {errors.folioCRedito && <span style={{ color: '#ef4444', fontSize: '11px' }}>Requerido</span>}
          </div>
        </div>
      )}

      {card('Datos de la gestion', Phone,
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            {lbl('Tipo de gestion', true)}
            <select value={form.tipoGestion} onChange={e => change('tipoGestion', e.target.value)} style={{ ...inp(errors.tipoGestion), cursor: 'pointer' }}>
              <option value="">Seleccionar...</option>
              {TIPOS_GESTION.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {errors.tipoGestion && <span style={{ color: '#ef4444', fontSize: '11px' }}>Requerido</span>}
          </div>
          <div>
            {lbl('Resultado', true)}
            <select value={form.resultado} onChange={e => change('resultado', e.target.value)} style={{ ...inp(errors.resultado), cursor: 'pointer' }}>
              <option value="">Seleccionar...</option>
              {RESULTADOS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            {errors.resultado && <span style={{ color: '#ef4444', fontSize: '11px' }}>Requerido</span>}
          </div>
          <div>
            {lbl('Fecha de gestion', true)}
            <input type="date" value={form.fechaGestion} onChange={e => change('fechaGestion', e.target.value)} style={inp(errors.fechaGestion)} />
            {errors.fechaGestion && <span style={{ color: '#ef4444', fontSize: '11px' }}>Requerido</span>}
          </div>
          <div>
            {lbl('Ejecutivo')}
            <input value={form.ejecutivo} onChange={e => change('ejecutivo', e.target.value)} placeholder="Nombre del ejecutivo" style={inp(false)} />
          </div>
          <div>
            {lbl('Monto comprometido (MXN)')}
            <input type="number" value={form.montoComprometido} onChange={e => change('montoComprometido', e.target.value)} placeholder="0.00" style={inp(false)} />
          </div>
          <div>
            {lbl('Fecha de compromiso de pago')}
            <input type="date" value={form.fechaCompromiso} onChange={e => change('fechaCompromiso', e.target.value)} style={inp(false)} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            {lbl('Observaciones')}
            <textarea value={form.observaciones} onChange={e => change('observaciones', e.target.value)} placeholder="Descripcion detallada de la gestion realizada..." rows={3} style={{ ...inp(false), resize: 'vertical' }} />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button onClick={handleReset} style={{ background: '#fff', border: '1.5px solid #dceaf8', borderRadius: '10px', padding: '11px 24px', fontSize: '13px', fontWeight: '600', color: '#4a6a94', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '7px' }}>
          <RotateCcw size={14} /> Limpiar
        </button>
        <button onClick={handleSave} style={{ background: '#0e50a0', border: 'none', borderRadius: '10px', padding: '11px 28px', fontSize: '13px', fontWeight: '600', color: '#fff', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '7px', boxShadow: '0 4px 14px rgba(14,80,160,0.28)' }}>
          <Save size={14} /> Registrar gestion
        </button>
      </div>
    </div>
  );
}