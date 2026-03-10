'use client';
import { useState } from 'react';
import { Search, DollarSign, Eye, X } from 'lucide-react';

function formatMoney(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(n || 0);
}

export default function MovimientosAbonos() {
  const [busqueda, setBusqueda]         = useState('');
  const [filtroMetodo, setFiltroMetodo] = useState('');
  const [seleccionado, setSeleccionado] = useState(null);

  const movimientos = [];

  const filtrados = movimientos.filter(m =>
    (m.clienteNombre?.toLowerCase().includes(busqueda.toLowerCase()) || m.folio?.includes(busqueda)) &&
    (!filtroMetodo || m.metodo === filtroMetodo)
  );

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>

      {/* Filtros */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e4ecf5', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', padding: '20px 24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' }}>Buscar</label>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
              <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Cliente o folio..." style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: '9px', padding: '10px 13px 10px 38px', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', color: '#0d1f5c', outline: 'none', background: '#fafbfd', boxSizing: 'border-box' }} />
            </div>
          </div>
          <div style={{ minWidth: '180px' }}>
            <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' }}>Metodo de pago</label>
            <select value={filtroMetodo} onChange={e => setFiltroMetodo(e.target.value)} style={{ border: '1.5px solid #e2e8f0', borderRadius: '9px', padding: '10px 13px', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', color: '#0d1f5c', outline: 'none', background: '#fafbfd', cursor: 'pointer', width: '100%', boxSizing: 'border-box' }}>
              <option value="">Todos</option>
              {['Efectivo', 'Transferencia', 'Deposito bancario', 'Cheque'].map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e4ecf5', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <DollarSign size={17} color="#1565c0" />
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '16px', fontWeight: '700', color: '#040e2e' }}>Movimientos de abonos</span>
          <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#94a3b8' }}>{filtrados.length} registro(s)</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Fecha', 'Cliente', 'Folio credito', 'Monto', 'Metodo', 'Referencia', ''].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No se encontraron movimientos</td></tr>
              ) : filtrados.map((m, i) => (
                <tr key={m.id} style={{ borderTop: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#fafbfd' }}>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{m.fecha}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0d1f5c' }}>{m.clienteNombre}</td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', fontFamily: 'monospace', color: '#475569' }}>{m.folio}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: '#166534' }}>{formatMoney(m.monto)}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{m.metodo}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{m.referencia || '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <button onClick={() => setSeleccionado(m)} style={{ background: '#eef2f7', border: 'none', borderRadius: '7px', padding: '7px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: '600', color: '#1565c0', fontFamily: 'DM Sans, sans-serif' }}>
                      <Eye size={13} /> Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal detalle */}
      {seleccionado && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(4,14,46,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '460px', boxShadow: '0 24px 80px rgba(13,31,92,0.18)', overflow: 'hidden' }}>
            <div style={{ background: '#fff', borderBottom: '1px solid #e4ecf5', padding: '22px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', background: '#eef2f7', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DollarSign size={20} color="#1565c0" />
                </div>
                <div>
                  <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '17px', fontWeight: '700', color: '#040e2e' }}>Detalle del abono</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{seleccionado.clienteNombre}</div>
                </div>
              </div>
              <button onClick={() => setSeleccionado(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { label: 'Folio credito', val: seleccionado.folio },
                { label: 'Fecha',         val: seleccionado.fecha },
                { label: 'Monto',         val: formatMoney(seleccionado.monto) },
                { label: 'Metodo',        val: seleccionado.metodo },
                { label: 'Referencia',    val: seleccionado.referencia || '—' },
                { label: 'Observaciones', val: seleccionado.observaciones || '—' },
              ].map(({ label, val }) => (
                <div key={label}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '4px' }}>{label}</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#0d1f5c' }}>{val}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: '0 28px 24px' }}>
              <button onClick={() => setSeleccionado(null)} style={{ width: '100%', padding: '11px', border: '1.5px solid #e2e8f0', background: '#fff', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#64748b', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}