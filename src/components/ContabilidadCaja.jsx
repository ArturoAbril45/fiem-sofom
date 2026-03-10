'use client';
import { useState } from 'react';
import { Wallet, Search, Eye, X, ChevronDown, ChevronUp } from 'lucide-react';

function formatMoney(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 }).format(n || 0);
}

export default function ContabilidadCaja() {
  const [busqueda, setBusqueda]   = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [expandido, setExpandido] = useState(null);
  const [detalle, setDetalle]     = useState(null);

  // Datos vacios — se llenaran con backend
  const ejecutivos = [];

  const filtrados = ejecutivos.filter(e =>
    e.nombre?.toLowerCase().includes(busqueda.toLowerCase()) &&
    (!filtroFecha || e.fecha === filtroFecha)
  );

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>

      {/* Filtros */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #dceaf8', boxShadow: '0 2px 12px rgba(14,80,160,0.05)', padding: '20px 24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '180px' }}>
            <label style={{ fontSize: '11px', fontWeight: '600', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' }}>Buscar ejecutivo</label>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#90aac8', pointerEvents: 'none' }} />
              <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Nombre del ejecutivo..." style={{ width: '100%', border: '1.5px solid #dceaf8', borderRadius: '9px', padding: '10px 13px 10px 38px', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', color: '#1a3d6e', outline: 'none', background: '#fafcff', boxSizing: 'border-box' }} />
            </div>
          </div>
          <div style={{ minWidth: '160px' }}>
            <label style={{ fontSize: '11px', fontWeight: '600', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' }}>Fecha de corte</label>
            <input type="date" value={filtroFecha} onChange={e => setFiltroFecha(e.target.value)} style={{ border: '1.5px solid #dceaf8', borderRadius: '9px', padding: '10px 13px', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', color: '#1a3d6e', outline: 'none', background: '#fafcff', width: '100%', boxSizing: 'border-box' }} />
          </div>
        </div>
      </div>

      {/* Tabla ejecutivos */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #dceaf8', boxShadow: '0 2px 12px rgba(14,80,160,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f6ff', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', background: '#e8f2fc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wallet size={16} color="#0e50a0" />
          </div>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', fontWeight: '700', color: '#0a2d5e' }}>Caja por ejecutivo</span>
          <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#90aac8' }}>{filtrados.length} ejecutivo(s)</span>
        </div>

        {filtrados.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#90aac8', fontSize: '13px' }}>
            <Wallet size={28} color="#dceaf8" style={{ display: 'block', margin: '0 auto 12px' }} />
            No hay datos de caja disponibles
          </div>
        ) : filtrados.map((ej, i) => (
          <div key={ej.id}>
            {/* Fila ejecutivo */}
            <div
              onClick={() => setExpandido(expandido === ej.id ? null : ej.id)}
              style={{ display: 'flex', alignItems: 'center', padding: '14px 24px', borderTop: i > 0 ? '1px solid #f0f6ff' : 'none', cursor: 'pointer', background: expandido === ej.id ? '#f4f8fd' : '#fff', gap: '16px' }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#0a2d5e' }}>{ej.nombre}</div>
                <div style={{ fontSize: '12px', color: '#90aac8', marginTop: '2px' }}>{ej.ruta} — {ej.fecha}</div>
              </div>
              <div style={{ textAlign: 'right', marginRight: '8px' }}>
                <div style={{ fontSize: '11px', color: '#90aac8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Total cobrado</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#166534', fontFamily: "'Cormorant Garamond', serif" }}>{formatMoney(ej.totalCobrado)}</div>
              </div>
              <div style={{ textAlign: 'right', marginRight: '8px' }}>
                <div style={{ fontSize: '11px', color: '#90aac8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Pagos</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#0a2d5e', fontFamily: "'Cormorant Garamond', serif" }}>{ej.numeroPagos || 0}</div>
              </div>
              <div style={{ color: '#90aac8' }}>
                {expandido === ej.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </div>

            {/* Detalle expandido */}
            {expandido === ej.id && (
              <div style={{ background: '#f9fbff', borderTop: '1px solid #dceaf8', padding: '16px 24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  {[
                    { l: 'Efectivo',       v: formatMoney(ej.efectivo) },
                    { l: 'Transferencia',  v: formatMoney(ej.transferencia) },
                    { l: 'Deposito',       v: formatMoney(ej.deposito) },
                    { l: 'Total cobrado',  v: formatMoney(ej.totalCobrado) },
                    { l: 'Pagos pendientes', v: ej.pagosPendientes || 0 },
                  ].map(({ l, v }) => (
                    <div key={l} style={{ background: '#fff', borderRadius: '10px', border: '1px solid #dceaf8', padding: '12px 16px' }}>
                      <div style={{ fontSize: '11px', color: '#90aac8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '4px' }}>{l}</div>
                      <div style={{ fontSize: '15px', fontWeight: '700', color: '#0a2d5e', fontFamily: "'Cormorant Garamond', serif" }}>{v}</div>
                    </div>
                  ))}
                </div>

                {/* Tabla movimientos del ejecutivo */}
                {ej.movimientos && ej.movimientos.length > 0 && (
                  <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid #dceaf8', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f4f8fd' }}>
                          {['Cliente', 'Folio', 'Monto', 'Metodo', 'Hora'].map(h => (
                            <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {ej.movimientos.map((m, mi) => (
                          <tr key={mi} style={{ borderTop: '1px solid #f0f6ff' }}>
                            <td style={{ padding: '10px 14px', fontSize: '13px', fontWeight: '600', color: '#0a2d5e' }}>{m.cliente}</td>
                            <td style={{ padding: '10px 14px', fontSize: '12px', fontFamily: 'monospace', color: '#4a6a94' }}>{m.folio}</td>
                            <td style={{ padding: '10px 14px', fontSize: '13px', fontWeight: '700', color: '#166534' }}>{formatMoney(m.monto)}</td>
                            <td style={{ padding: '10px 14px', fontSize: '13px', color: '#4a6a94' }}>{m.metodo}</td>
                            <td style={{ padding: '10px 14px', fontSize: '13px', color: '#4a6a94' }}>{m.hora}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal detalle (si se usa) */}
      {detalle && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(10,45,94,0.45)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '420px', boxShadow: '0 32px 80px rgba(14,80,160,0.2)', padding: '28px' }}>
            <button onClick={() => setDetalle(null)} style={{ float: 'right', background: '#f0f6ff', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', color: '#4a6a94', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', fontWeight: '700', color: '#0a2d5e', marginBottom: '16px' }}>{detalle.nombre}</div>
            <button onClick={() => setDetalle(null)} style={{ width: '100%', padding: '11px', border: '1.5px solid #dceaf8', background: '#fff', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#4a6a94', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', marginTop: '16px' }}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}