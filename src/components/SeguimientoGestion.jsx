'use client';
import { useState } from 'react';
import { Search, Phone, Eye, X, AlertCircle, CheckCircle, Clock } from 'lucide-react';

function formatMoney(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(n || 0);
}

export default function SeguimientoGestion() {
  const [busqueda, setBusqueda]       = useState('');
  const [filtroResultado, setFiltroResultado] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [seleccionado, setSeleccionado] = useState(null);

  const gestiones = [];

  const RESULTADOS = ['Contacto exitoso', 'Sin respuesta', 'Promesa de pago aceptada', 'Rechazo de pago', 'Domicilio no localizado', 'Cliente ausente'];

  const filtradas = gestiones.filter(g =>
    (g.clienteNombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      g.folioCRedito?.includes(busqueda)) &&
    (!filtroResultado || g.resultado === filtroResultado) &&
    (!filtroFecha || g.fechaGestion === filtroFecha)
  );

  const resultadoBadge = (r) => {
    if (r === 'Promesa de pago aceptada' || r === 'Contacto exitoso')
      return { bg: '#dcfce7', color: '#166534', icon: <CheckCircle size={12} /> };
    if (r === 'Sin respuesta' || r === 'Cliente ausente' || r === 'Domicilio no localizado')
      return { bg: '#fff8e8', color: '#92400e', icon: <Clock size={12} /> };
    return { bg: '#fee2e2', color: '#991b1b', icon: <AlertCircle size={12} /> };
  };

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto' }}>

      {/* Filtros */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #dceaf8', boxShadow: '0 2px 12px rgba(14,80,160,0.05)', padding: '20px 24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '180px' }}>
            <label style={{ fontSize: '11px', fontWeight: '600', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' }}>Buscar</label>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#90aac8', pointerEvents: 'none' }} />
              <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Cliente o folio..." style={{ width: '100%', border: '1.5px solid #dceaf8', borderRadius: '9px', padding: '10px 13px 10px 38px', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', color: '#1a3d6e', outline: 'none', background: '#fafcff', boxSizing: 'border-box' }} />
            </div>
          </div>
          <div style={{ minWidth: '200px' }}>
            <label style={{ fontSize: '11px', fontWeight: '600', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' }}>Resultado</label>
            <select value={filtroResultado} onChange={e => setFiltroResultado(e.target.value)} style={{ border: '1.5px solid #dceaf8', borderRadius: '9px', padding: '10px 13px', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', color: '#1a3d6e', outline: 'none', background: '#fafcff', cursor: 'pointer', width: '100%', boxSizing: 'border-box' }}>
              <option value="">Todos</option>
              {RESULTADOS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div style={{ minWidth: '160px' }}>
            <label style={{ fontSize: '11px', fontWeight: '600', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' }}>Fecha</label>
            <input type="date" value={filtroFecha} onChange={e => setFiltroFecha(e.target.value)} style={{ border: '1.5px solid #dceaf8', borderRadius: '9px', padding: '10px 13px', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', color: '#1a3d6e', outline: 'none', background: '#fafcff', width: '100%', boxSizing: 'border-box' }} />
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #dceaf8', boxShadow: '0 2px 12px rgba(14,80,160,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f6ff', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', background: '#e8f2fc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Phone size={16} color="#0e50a0" />
          </div>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', fontWeight: '700', color: '#0a2d5e' }}>Seguimiento de gestiones</span>
          <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#90aac8' }}>{filtradas.length} registro(s)</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f4f8fd' }}>
                {['Fecha', 'Cliente', 'Folio', 'Tipo gestion', 'Resultado', 'Monto comprometido', 'Fecha compromiso', ''].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtradas.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: '#90aac8', fontSize: '13px' }}>
                    <Phone size={28} color="#dceaf8" style={{ display: 'block', margin: '0 auto 12px' }} />
                    No se encontraron gestiones
                  </td>
                </tr>
              ) : filtradas.map((g, i) => {
                const badge = resultadoBadge(g.resultado);
                return (
                  <tr key={g.id} style={{ borderTop: '1px solid #f0f6ff', background: i % 2 === 0 ? '#fff' : '#fafcff' }}>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4a6a94' }}>{g.fechaGestion}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0a2d5e' }}>{g.clienteNombre}</td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', fontFamily: 'monospace', color: '#4a6a94' }}>{g.folioCRedito}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4a6a94' }}>{g.tipoGestion}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: badge.bg, color: badge.color }}>
                        {badge.icon}{g.resultado}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: g.montoComprometido ? '#166534' : '#90aac8' }}>
                      {g.montoComprometido ? formatMoney(g.montoComprometido) : '—'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4a6a94' }}>{g.fechaCompromiso || '—'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <button onClick={() => setSeleccionado(g)} style={{ background: '#e8f2fc', border: 'none', borderRadius: '7px', padding: '7px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: '600', color: '#0e50a0', fontFamily: 'DM Sans, sans-serif' }}>
                        <Eye size={13} /> Ver
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal detalle */}
      {seleccionado && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(10,45,94,0.45)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '520px', boxShadow: '0 32px 80px rgba(14,80,160,0.2)', overflow: 'hidden' }}>
            <div style={{ background: '#fff', borderBottom: '1px solid #dceaf8', padding: '22px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', background: '#e8f2fc', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Phone size={20} color="#0e50a0" />
                </div>
                <div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', fontWeight: '700', color: '#0a2d5e' }}>{seleccionado.clienteNombre}</div>
                  <div style={{ fontSize: '12px', color: '#90aac8', marginTop: '2px' }}>Folio: {seleccionado.folioCRedito}</div>
                </div>
              </div>
              <button onClick={() => setSeleccionado(null)} style={{ background: '#f0f6ff', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#4a6a94' }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { label: 'Fecha gestion',     val: seleccionado.fechaGestion },
                { label: 'Tipo de gestion',   val: seleccionado.tipoGestion },
                { label: 'Resultado',         val: seleccionado.resultado },
                { label: 'Ejecutivo',         val: seleccionado.ejecutivo || '—' },
                { label: 'Monto comprometido',val: seleccionado.montoComprometido ? formatMoney(seleccionado.montoComprometido) : '—' },
                { label: 'Fecha compromiso',  val: seleccionado.fechaCompromiso || '—' },
              ].map(({ label, val }) => (
                <div key={label}>
                  <div style={{ fontSize: '11px', color: '#90aac8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '4px' }}>{label}</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#0a2d5e' }}>{val}</div>
                </div>
              ))}
              {seleccionado.observaciones && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: '11px', color: '#90aac8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '4px' }}>Observaciones</div>
                  <div style={{ fontSize: '13px', color: '#4a6a94', lineHeight: '1.6', background: '#f4f8fd', borderRadius: '8px', padding: '10px 14px' }}>{seleccionado.observaciones}</div>
                </div>
              )}
            </div>
            <div style={{ padding: '0 28px 24px' }}>
              <button onClick={() => setSeleccionado(null)} style={{ width: '100%', padding: '11px', border: '1.5px solid #dceaf8', background: '#fff', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#4a6a94', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}