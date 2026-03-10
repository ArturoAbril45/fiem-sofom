'use client';
import { useState } from 'react';
import { Users, Search, Download, FileText } from 'lucide-react';

export default function ReporteCarteraClientes() {
  const [filtros, setFiltros] = useState({ busqueda: '', gerencia: '', ruta: '', estatus: '' });
  const f = (k, v) => setFiltros(p => ({ ...p, [k]: v }));
  const clientes = [];

  const inp = { border: '1.5px solid #dceaf8', borderRadius: '9px', padding: '10px 13px', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', color: '#1a3d6e', outline: 'none', background: '#fafcff', boxSizing: 'border-box', width: '100%' };
  const lbl = (t) => <label style={{ fontSize: '11px', fontWeight: '600', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' }}>{t}</label>;

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto' }}>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
        {[{ l: 'Total clientes', v: '0' }, { l: 'Clientes activos', v: '0' }, { l: 'Clientes inactivos', v: '0' }].map(({ l, v }) => (
          <div key={l} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #dceaf8', padding: '20px 24px', boxShadow: '0 2px 12px rgba(14,80,160,0.05)' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{l}</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#0a2d5e', fontFamily: "'Cormorant Garamond', serif", marginTop: '6px' }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #dceaf8', padding: '20px 24px', marginBottom: '20px', boxShadow: '0 2px 12px rgba(14,80,160,0.05)' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '160px' }}>
            {lbl('Buscar')}
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#90aac8', pointerEvents: 'none' }} />
              <input value={filtros.busqueda} onChange={e => f('busqueda', e.target.value)} placeholder="Nombre o CURP..." style={{ ...inp, paddingLeft: '38px' }} />
            </div>
          </div>
          <div style={{ minWidth: '140px' }}>
            {lbl('Gerencia')}
            <select value={filtros.gerencia} onChange={e => f('gerencia', e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
              <option value="">Todas</option>
              <option>MATRIZ (01)</option><option>Zumpango (02)</option><option>TIZAYUCA (03)</option>
            </select>
          </div>
          <div style={{ minWidth: '140px' }}>
            {lbl('Estatus')}
            <select value={filtros.estatus} onChange={e => f('estatus', e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
              <option value="">Todos</option><option>Activo</option><option>Inactivo</option>
            </select>
          </div>
          <button style={{ background: '#0e50a0', border: 'none', borderRadius: '10px', padding: '11px 20px', fontSize: '13px', fontWeight: '600', color: '#fff', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 14px rgba(14,80,160,0.28)', whiteSpace: 'nowrap' }}>
            <Download size={14} /> Exportar
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #dceaf8', boxShadow: '0 2px 12px rgba(14,80,160,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f6ff', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', background: '#e8f2fc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={16} color="#0e50a0" /></div>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', fontWeight: '700', color: '#0a2d5e' }}>Cartera de clientes</span>
          <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#90aac8' }}>0 registros</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f4f8fd' }}>
                {['Nombre', 'CURP', 'Telefono', 'Municipio', 'Gerencia', 'Ruta', 'Creditos activos', 'Estatus'].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr><td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: '#90aac8', fontSize: '13px' }}>
                <FileText size={28} color="#dceaf8" style={{ display: 'block', margin: '0 auto 12px' }} />
                Sin datos. Conecta el backend para ver la cartera de clientes.
              </td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}