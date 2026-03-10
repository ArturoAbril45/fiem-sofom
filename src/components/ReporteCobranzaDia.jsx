'use client';
import { useState } from 'react';
import { TrendingUp, Download, FileText } from 'lucide-react';

export default function ReporteCobranzaDia() {
  const today = new Date().toISOString().split('T')[0];
  const [filtros, setFiltros] = useState({ fecha: today, ejecutivo: '', gerencia: '' });
  const f = (k, v) => setFiltros(p => ({ ...p, [k]: v }));
  const inp = { border: '1.5px solid #dceaf8', borderRadius: '9px', padding: '10px 13px', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', color: '#1a3d6e', outline: 'none', background: '#fafcff', boxSizing: 'border-box', width: '100%' };
  const lbl = (t) => <label style={{ fontSize: '11px', fontWeight: '600', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' }}>{t}</label>;

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
        {[{ l: 'Pagos esperados', v: '0' }, { l: 'Pagos cobrados', v: '0' }, { l: 'Monto cobrado', v: '$0' }, { l: 'Pagos pendientes', v: '0' }].map(({ l, v }) => (
          <div key={l} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #dceaf8', padding: '18px 20px', boxShadow: '0 2px 12px rgba(14,80,160,0.05)' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{l}</div>
            <div style={{ fontSize: '26px', fontWeight: '700', color: '#0a2d5e', fontFamily: "'Cormorant Garamond', serif", marginTop: '6px' }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #dceaf8', padding: '20px 24px', marginBottom: '20px', boxShadow: '0 2px 12px rgba(14,80,160,0.05)' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ minWidth: '160px' }}>{lbl('Fecha')}<input type="date" value={filtros.fecha} onChange={e => f('fecha', e.target.value)} style={inp} /></div>
          <div style={{ flex: 1, minWidth: '150px' }}>{lbl('Ejecutivo')}<input value={filtros.ejecutivo} onChange={e => f('ejecutivo', e.target.value)} placeholder="Nombre del ejecutivo" style={inp} /></div>
          <div style={{ minWidth: '160px' }}>{lbl('Gerencia')}<select value={filtros.gerencia} onChange={e => f('gerencia', e.target.value)} style={{ ...inp, cursor: 'pointer' }}><option value="">Todas</option><option>MATRIZ (01)</option><option>Zumpango (02)</option><option>TIZAYUCA (03)</option></select></div>
          <button style={{ background: '#0e50a0', border: 'none', borderRadius: '10px', padding: '11px 20px', fontSize: '13px', fontWeight: '600', color: '#fff', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 14px rgba(14,80,160,0.28)' }}><Download size={14} /> Exportar</button>
        </div>
      </div>
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #dceaf8', boxShadow: '0 2px 12px rgba(14,80,160,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f6ff', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', background: '#e8f2fc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><TrendingUp size={16} color="#0e50a0" /></div>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', fontWeight: '700', color: '#0a2d5e' }}>Cobranza del dia</span>
          <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#90aac8' }}>0 registros</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: '#f4f8fd' }}>{['Cliente', 'Folio', 'Producto', 'Monto esperado', 'Monto cobrado', 'Metodo', 'Hora cobro', 'Ejecutivo', 'Estatus'].map(h => <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>)}</tr></thead>
          <tbody><tr><td colSpan={9} style={{ padding: '48px', textAlign: 'center', color: '#90aac8', fontSize: '13px' }}><FileText size={28} color="#dceaf8" style={{ display: 'block', margin: '0 auto 12px' }} />Sin cobros registrados para esta fecha.</td></tr></tbody>
        </table>
      </div>
    </div>
  );
}