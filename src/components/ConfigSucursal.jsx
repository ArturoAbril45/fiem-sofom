'use client';
import { useState } from 'react';
import { Building2, Save, Check } from 'lucide-react';

const INITIAL = {
  nombre: 'Oficina Central', rfc: 'FIE200820GI7', razonSocial: 'FIEM SA DE CV SOFOM ENR',
  calle: '', colonia: '', municipio: 'Tizayuca', estado: 'Hidalgo', cp: '',
  telefono: '', correo: '', gerente: '', horario: '',
};

export default function ConfigSucursal() {
  const [form, setForm]   = useState(INITIAL);
  const [saved, setSaved] = useState(false);

  const change = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const inp = () => ({ border: '1.5px solid #dceaf8', borderRadius: '9px', padding: '10px 13px', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', color: '#1a3d6e', outline: 'none', width: '100%', background: '#fafcff', boxSizing: 'border-box' });
  const lbl = (t, req) => <label style={{ fontSize: '11px', fontWeight: '600', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' }}>{t}{req && <span style={{ color: '#ef4444', marginLeft: '3px' }}>*</span>}</label>;
  const card = (titulo, Icon, children) => (
    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #dceaf8', boxShadow: '0 2px 12px rgba(14,80,160,0.05)', marginBottom: '20px', overflow: 'hidden' }}>
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f6ff', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '32px', height: '32px', background: '#e8f2fc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={16} color="#0e50a0" /></div>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', fontWeight: '700', color: '#0a2d5e' }}>{titulo}</span>
      </div>
      <div style={{ padding: '22px 24px' }}>{children}</div>
    </div>
  );

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }}>
      {saved && (
        <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: '10px', padding: '12px 18px', marginBottom: '20px', color: '#166534', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={15} /> Configuracion de sucursal guardada.
        </div>
      )}
      {card('Informacion de la sucursal', Building2,
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {[
            { l: 'Nombre de sucursal', k: 'nombre', req: true },
            { l: 'Razon social',       k: 'razonSocial' },
            { l: 'RFC',                k: 'rfc' },
            { l: 'Telefono',           k: 'telefono', type: 'tel' },
            { l: 'Correo electronico', k: 'correo',   type: 'email' },
            { l: 'Gerente / Director', k: 'gerente' },
            { l: 'Horario de atencion',k: 'horario', placeholder: 'Lun-Vie 9:00-18:00' },
          ].map(({ l, k, req, type, placeholder }) => (
            <div key={k}>
              {lbl(l, req)}
              <input type={type || 'text'} value={form[k]} onChange={e => change(k, e.target.value)} placeholder={placeholder || l} style={inp()} />
            </div>
          ))}
        </div>
      )}
      {card('Domicilio fiscal', Building2,
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          {[
            { l: 'Calle y numero', k: 'calle' },
            { l: 'Colonia',        k: 'colonia' },
            { l: 'Municipio',      k: 'municipio' },
            { l: 'Estado',         k: 'estado' },
            { l: 'Codigo postal',  k: 'cp', placeholder: '00000' },
          ].map(({ l, k, placeholder }) => (
            <div key={k}>
              {lbl(l)}
              <input value={form[k]} onChange={e => change(k, e.target.value)} placeholder={placeholder || l} style={inp()} />
            </div>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={handleSave} style={{ background: '#0e50a0', border: 'none', borderRadius: '10px', padding: '11px 28px', fontSize: '13px', fontWeight: '600', color: '#fff', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '7px', boxShadow: '0 4px 14px rgba(14,80,160,0.28)' }}>
          <Save size={14} /> Guardar configuracion
        </button>
      </div>
    </div>
  );
}