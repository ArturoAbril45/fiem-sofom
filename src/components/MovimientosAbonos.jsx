'use client';
import { useState, useEffect, useCallback } from 'react';
import { Search, DollarSign, Eye, X, RefreshCw, Loader } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://fiem-backend-production.up.railway.app';

function fmt(n) { return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(n || 0); }

export default function MovimientosAbonos() {
  const [busqueda,     setBusqueda]     = useState('');
  const [filtroMetodo, setFiltroMetodo] = useState('');
  const [seleccionado, setSeleccionado] = useState(null);
  const [abonos,       setAbonos]       = useState([]);
  const [cargando,     setCargando]     = useState(true);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const res  = await fetch(`${API}/api/abonos`);
      const data = await res.json();
      setAbonos(Array.isArray(data) ? data : []);
    } catch { setAbonos([]); }
    finally { setCargando(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const filtrados = abonos.filter(m =>
    ((m.clienteNombre || '').toLowerCase().includes(busqueda.toLowerCase()) || (m.folio || '').includes(busqueda)) &&
    (!filtroMetodo || m.metodo === filtroMetodo)
  );

  const totalFiltrado = filtrados.reduce((s, m) => s + (m.monto || 0), 0);

  const inp = { border: '1.5px solid #dceaf8', borderRadius: '9px', padding: '10px 13px', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', color: '#1a3d6e', outline: 'none', background: '#fafcff', boxSizing: 'border-box' };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>

      {/* KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
        {[
          { label: 'Total abonos',   val: filtrados.length,       color: '#0e50a0', bg: '#e8f2fc' },
          { label: 'Suma del periodo', val: fmt(totalFiltrado),   color: '#166534', bg: '#dcfce7' },
          { label: 'Metodos distintos', val: [...new Set(filtrados.map(m => m.metodo))].length, color: '#854d0e', bg: '#fef9c3' },
        ].map(({ label, val, color, bg }) => (
          <div key={label} style={{ background: '#fff', borderRadius: '14px', border: '1px solid #dceaf8', boxShadow: '0 2px 10px rgba(14,80,160,0.05)', padding: '18px 22px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>{label}</div>
            <div style={{ fontSize: '22px', fontWeight: '700', color, background: bg, display: 'inline-block', padding: '4px 14px', borderRadius: '20px' }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #dceaf8', boxShadow: '0 2px 12px rgba(14,80,160,0.05)', padding: '20px 24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ fontSize: '11px', fontWeight: '600', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' }}>Buscar</label>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#90aac8', pointerEvents: 'none' }} />
              <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Cliente o folio..." style={{ ...inp, width: '100%', paddingLeft: '38px' }} />
            </div>
          </div>
          <div style={{ minWidth: '180px' }}>
            <label style={{ fontSize: '11px', fontWeight: '600', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' }}>Metodo de pago</label>
            <select value={filtroMetodo} onChange={e => setFiltroMetodo(e.target.value)} style={{ ...inp, cursor: 'pointer', width: '100%' }}>
              <option value="">Todos</option>
              {['Efectivo', 'Transferencia', 'Deposito bancario', 'Cheque'].map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button onClick={cargar} style={{ background: '#e8f2fc', border: '1px solid #dceaf8', borderRadius: '9px', padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#0e50a0', fontFamily: 'DM Sans, sans-serif' }}>
              <RefreshCw size={14} /> Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #dceaf8', boxShadow: '0 2px 12px rgba(14,80,160,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f6ff', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', background: '#e8f2fc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><DollarSign size={16} color="#0e50a0" /></div>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', fontWeight: '700', color: '#0a2d5e' }}>Movimientos de abonos</span>
          <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#90aac8' }}>{filtrados.length} registro(s)</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          {cargando ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#90aac8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> Cargando abonos...
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f4f8fd' }}>
                  {['Fecha', 'Cliente', 'Folio credito', 'Monto', 'Metodo', 'Referencia', ''].map(h => (
                    <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtrados.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#90aac8', fontSize: '13px' }}>No se encontraron movimientos</td></tr>
                ) : filtrados.map((m, i) => (
                  <tr key={m._id} style={{ borderTop: '1px solid #f0f6ff', background: i % 2 === 0 ? '#fff' : '#fafcff' }}>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4a6a94' }}>{m.fecha ? new Date(m.fecha).toLocaleDateString('es-MX') : '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0a2d5e' }}>{m.clienteNombre}</td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', fontFamily: 'monospace', color: '#4a6a94' }}>{m.folio}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: '#166534' }}>{fmt(m.monto)}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4a6a94' }}>{m.metodo}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4a6a94' }}>{m.referencia || '—'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <button onClick={() => setSeleccionado(m)} style={{ background: '#e8f2fc', border: 'none', borderRadius: '7px', padding: '7px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: '600', color: '#0e50a0', fontFamily: 'DM Sans, sans-serif' }}>
                        <Eye size={13} /> Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {seleccionado && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(10,45,94,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '460px', boxShadow: '0 24px 80px rgba(10,45,94,0.2)', overflow: 'hidden' }}>
            <div style={{ background: '#fff', borderBottom: '1px solid #dceaf8', padding: '22px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', background: '#e8f2fc', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><DollarSign size={20} color="#0e50a0" /></div>
                <div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', fontWeight: '700', color: '#0a2d5e' }}>Detalle del abono</div>
                  <div style={{ fontSize: '12px', color: '#90aac8', marginTop: '2px' }}>{seleccionado.clienteNombre}</div>
                </div>
              </div>
              <button onClick={() => setSeleccionado(null)} style={{ background: '#f0f6ff', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#4a6a94' }}><X size={16} /></button>
            </div>
            <div style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { label: 'Folio credito', val: seleccionado.folio },
                { label: 'Fecha',         val: seleccionado.fecha ? new Date(seleccionado.fecha).toLocaleDateString('es-MX') : '—' },
                { label: 'Monto',         val: fmt(seleccionado.monto) },
                { label: 'Metodo',        val: seleccionado.metodo },
                { label: 'Referencia',    val: seleccionado.referencia || '—' },
                { label: 'Observaciones', val: seleccionado.observaciones || '—' },
              ].map(({ label, val }) => (
                <div key={label}>
                  <div style={{ fontSize: '11px', color: '#90aac8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '4px' }}>{label}</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#0a2d5e' }}>{val}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: '0 28px 24px' }}>
              <button onClick={() => setSeleccionado(null)} style={{ width: '100%', padding: '11px', border: '1.5px solid #dceaf8', background: '#fff', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#4a6a94', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}