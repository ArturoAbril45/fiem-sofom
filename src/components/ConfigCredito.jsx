'use client';
import { useState } from 'react';
import { Settings, Save, Check, DollarSign, Shield, AlertTriangle } from 'lucide-react';

const INITIAL = {
  diasMoraInicio: '1', tasaMora: '0', diasProrroga: '0',
  limiteAbonoMinimo: '0', limiteMontoPrestamo: '0',
  diasAviso: '3', bloqueoAutomatico: false,
  requiereAval: false, requiereFirma: true,
  notificacionSMS: false, notificacionEmail: false,
  textoRecibo: 'FIEM SA DE CV SOFOM ENR', observaciones: '',
};

export default function ConfigCredito() {
  const [form, setForm]   = useState(INITIAL);
  const [saved, setSaved] = useState(false);

  const change = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const inp = () => ({ border: '1.5px solid #dceaf8', borderRadius: '9px', padding: '10px 13px', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', color: '#1a3d6e', outline: 'none', width: '100%', background: '#fafcff', boxSizing: 'border-box' });
  const lbl = (t) => <label style={{ fontSize: '11px', fontWeight: '600', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' }}>{t}</label>;
  const card = (titulo, Icon, color, children) => (
    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #dceaf8', boxShadow: '0 2px 12px rgba(14,80,160,0.05)', marginBottom: '20px', overflow: 'hidden' }}>
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f6ff', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '32px', height: '32px', background: `${color}18`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={16} color={color} /></div>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', fontWeight: '700', color: '#0a2d5e' }}>{titulo}</span>
      </div>
      <div style={{ padding: '22px 24px' }}>{children}</div>
    </div>
  );
  const toggle = (k, label) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <input type="checkbox" id={k} checked={form[k]} onChange={e => change(k, e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#0e50a0', cursor: 'pointer' }} />
      <label htmlFor={k} style={{ fontSize: '13px', fontWeight: '600', color: '#1a3d6e', cursor: 'pointer' }}>{label}</label>
    </div>
  );

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }}>
      {saved && (
        <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: '10px', padding: '12px 18px', marginBottom: '20px', color: '#166534', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={15} /> Parametros de credito guardados.
        </div>
      )}

      {card('Parametros de mora', AlertTriangle, '#d97706',
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <div>{lbl('Dias para inicio de mora')}<input type="number" value={form.diasMoraInicio} onChange={e => change('diasMoraInicio', e.target.value)} style={inp()} /></div>
          <div>{lbl('Tasa de mora (%)')}<input type="number" value={form.tasaMora} onChange={e => change('tasaMora', e.target.value)} placeholder="0.00" style={inp()} /></div>
          <div>{lbl('Dias de prorroga permitidos')}<input type="number" value={form.diasProrroga} onChange={e => change('diasProrroga', e.target.value)} style={inp()} /></div>
          <div>{lbl('Dias aviso vencimiento')}<input type="number" value={form.diasAviso} onChange={e => change('diasAviso', e.target.value)} style={inp()} /></div>
        </div>
      )}

      {card('Limites y montos', DollarSign, '#0e50a0',
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div>{lbl('Abono minimo (MXN)')}<input type="number" value={form.limiteAbonoMinimo} onChange={e => change('limiteAbonoMinimo', e.target.value)} placeholder="0" style={inp()} /></div>
          <div>{lbl('Monto maximo de prestamo (MXN)')}<input type="number" value={form.limiteMontoPrestamo} onChange={e => change('limiteMontoPrestamo', e.target.value)} placeholder="0" style={inp()} /></div>
        </div>
      )}

      {card('Politicas y requisitos', Shield, '#7c3aed',
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {toggle('requiereAval',         'Requiere aval para aprobar credito')}
          {toggle('requiereFirma',        'Requiere firma de contrato')}
          {toggle('bloqueoAutomatico',    'Bloqueo automatico al entrar en mora')}
          {toggle('notificacionSMS',      'Enviar notificacion SMS al cliente')}
          {toggle('notificacionEmail',    'Enviar notificacion por correo electronico')}
        </div>
      )}

      {card('Texto en recibos', Settings, '#475569',
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>{lbl('Encabezado del recibo')}<input value={form.textoRecibo} onChange={e => change('textoRecibo', e.target.value)} style={inp()} /></div>
          <div>{lbl('Observaciones generales')}<textarea value={form.observaciones} onChange={e => change('observaciones', e.target.value)} rows={3} placeholder="Texto adicional que aparece en recibos y contratos..." style={{ ...inp(), resize: 'vertical' }} /></div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={handleSave} style={{ background: '#0e50a0', border: 'none', borderRadius: '10px', padding: '11px 28px', fontSize: '13px', fontWeight: '600', color: '#fff', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '7px', boxShadow: '0 4px 14px rgba(14,80,160,0.28)' }}>
          <Save size={14} /> Guardar parametros
        </button>
      </div>
    </div>
  );
}