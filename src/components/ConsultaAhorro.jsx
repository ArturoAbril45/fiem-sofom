'use client';
import { useState, useEffect, useCallback } from 'react';
import { Search, PiggyBank, Eye, X, RefreshCw, Loader, CheckCircle, AlertCircle } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://fiem-backend-production.up.railway.app';
function fmt(n) { return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(n || 0); }

export default function ConsultaAhorro() {
  const [busqueda,      setBusqueda]      = useState('');
  const [filtroEstatus, setFiltroEstatus] = useState('');
  const [seleccionado,  setSeleccionado]  = useState(null);
  const [cuentas,       setCuentas]       = useState([]);
  const [cargando,      setCargando]      = useState(true);
  const [notif,         setNotif]         = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const res = await fetch(`${API}/api/cuentas-ahorro`);
      const data = await res.json();
      setCuentas(Array.isArray(data) ? data : []);
    } catch { setCuentas([]); }
    finally { setCargando(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const cambiarEstatus = async (id, estatus) => {
    try {
      await fetch(`${API}/api/cuentas-ahorro/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ estatus }) });
      setNotif({ tipo: 'ok', msg: `Cuenta ${estatus.toLowerCase()} correctamente.` });
      setTimeout(() => setNotif(null), 3000);
      setSeleccionado(null);
      cargar();
    } catch {
      setNotif({ tipo: 'error', msg: 'Error al actualizar.' });
      setTimeout(() => setNotif(null), 3000);
    }
  };

  const filtradas = cuentas.filter(c =>
    ((c.clienteNombre || '').toLowerCase().includes(busqueda.toLowerCase()) || (c.folio || '').includes(busqueda)) &&
    (!filtroEstatus || c.estatus === filtroEstatus)
  );

  const badge = (e) => {
    const map = { Activa: ['#dcfce7','#166534'], Suspendida: ['#fef9c3','#854d0e'], Cerrada: ['#f1f5f9','#475569'] };
    const [bg, color] = map[e] || ['#f1f5f9','#475569'];
    return { display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: bg, color };
  };

  const inp = { border: '1.5px solid #dceaf8', borderRadius: '9px', padding: '10px 13px', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', color: '#1a3d6e', outline: 'none', background: '#fafcff', boxSizing: 'border-box' };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {notif && <div style={{ background: notif.tipo === 'ok' ? '#dcfce7' : '#fee2e2', border: `1px solid ${notif.tipo === 'ok' ? '#86efac' : '#fca5a5'}`, borderRadius: '12px', padding: '13px 18px', marginBottom: '18px', color: notif.tipo === 'ok' ? '#166534' : '#dc2626', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>{notif.tipo === 'ok' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}{notif.msg}</div>}

      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #dceaf8', boxShadow: '0 2px 12px rgba(14,80,160,0.05)', padding: '20px 24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ fontSize: '11px', fontWeight: '600', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' }}>Buscar</label>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#90aac8', pointerEvents: 'none' }} />
              <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Nombre o folio..." style={{ ...inp, width: '100%', paddingLeft: '38px' }} />
            </div>
          </div>
          <div style={{ minWidth: '160px' }}>
            <label style={{ fontSize: '11px', fontWeight: '600', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' }}>Estatus</label>
            <select value={filtroEstatus} onChange={e => setFiltroEstatus(e.target.value)} style={{ ...inp, cursor: 'pointer', width: '100%' }}>
              <option value="">Todos</option>
              <option value="Activa">Activa</option>
              <option value="Suspendida">Suspendida</option>
              <option value="Cerrada">Cerrada</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button onClick={cargar} style={{ background: '#e8f2fc', border: '1px solid #dceaf8', borderRadius: '9px', padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#0e50a0', fontFamily: 'DM Sans, sans-serif' }}>
              <RefreshCw size={14} /> Actualizar
            </button>
          </div>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #dceaf8', boxShadow: '0 2px 12px rgba(14,80,160,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f6ff', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', background: '#e8f2fc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PiggyBank size={16} color="#0e50a0" /></div>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', fontWeight: '700', color: '#0a2d5e' }}>Cuentas de ahorro</span>
          <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#90aac8' }}>{filtradas.length} resultado(s)</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          {cargando ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#90aac8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> Cargando cuentas...
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f4f8fd' }}>
                  {['Folio', 'Cliente', 'Producto', 'Saldo', 'Frecuencia', 'Apertura', 'Estatus', ''].map(h => (
                    <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtradas.length === 0 ? (
                  <tr><td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: '#90aac8', fontSize: '13px' }}>No se encontraron cuentas</td></tr>
                ) : filtradas.map((c, i) => (
                  <tr key={c._id} style={{ borderTop: '1px solid #f0f6ff', background: i % 2 === 0 ? '#fff' : '#fafcff' }}>
                    <td style={{ padding: '12px 16px', fontSize: '12px', fontFamily: 'monospace', color: '#4a6a94' }}>{c.folio}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0a2d5e' }}>{c.clienteNombre}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4a6a94' }}>{c.producto}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: '#166534' }}>{fmt(c.saldo)}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4a6a94' }}>{c.frecuencia}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4a6a94' }}>{c.fechaApertura ? new Date(c.fechaApertura).toLocaleDateString('es-MX') : '—'}</td>
                    <td style={{ padding: '12px 16px' }}><span style={badge(c.estatus)}>{c.estatus}</span></td>
                    <td style={{ padding: '12px 16px' }}>
                      <button onClick={() => setSeleccionado(c)} style={{ background: '#e8f2fc', border: 'none', borderRadius: '7px', padding: '7px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: '600', color: '#0e50a0', fontFamily: 'DM Sans, sans-serif' }}>
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

      {seleccionado && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(10,45,94,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '500px', boxShadow: '0 24px 80px rgba(10,45,94,0.2)', overflow: 'hidden' }}>
            <div style={{ background: '#fff', borderBottom: '1px solid #dceaf8', padding: '22px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', background: '#e8f2fc', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PiggyBank size={20} color="#0e50a0" /></div>
                <div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', fontWeight: '700', color: '#0a2d5e' }}>{seleccionado.clienteNombre}</div>
                  <div style={{ fontSize: '12px', color: '#90aac8', marginTop: '2px' }}>Folio: {seleccionado.folio}</div>
                </div>
              </div>
              <button onClick={() => setSeleccionado(null)} style={{ background: '#f0f6ff', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#4a6a94' }}><X size={16} /></button>
            </div>
            <div style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { label: 'Producto',    val: seleccionado.producto },
                { label: 'Saldo',       val: fmt(seleccionado.saldo) },
                { label: 'Monto inicial', val: fmt(seleccionado.montoInicial) },
                { label: 'Frecuencia',  val: seleccionado.frecuencia },
                { label: 'Apertura',    val: seleccionado.fechaApertura ? new Date(seleccionado.fechaApertura).toLocaleDateString('es-MX') : '—' },
                { label: 'Ejecutivo',   val: seleccionado.ejecutivo || '—' },
                { label: 'Estatus',     val: seleccionado.estatus },
              ].map(({ label, val }) => (
                <div key={label}>
                  <div style={{ fontSize: '11px', color: '#90aac8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '4px' }}>{label}</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#0a2d5e' }}>{val}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: '0 28px 24px', display: 'flex', gap: '10px' }}>
              {seleccionado.estatus === 'Activa' && (
                <button onClick={() => cambiarEstatus(seleccionado._id, 'Suspendida')} style={{ flex: 1, padding: '10px', border: '1.5px solid #fca5a5', background: '#fff', borderRadius: '10px', fontSize: '12px', fontWeight: '600', color: '#dc2626', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Suspender</button>
              )}
              {seleccionado.estatus !== 'Cerrada' && (
                <button onClick={() => cambiarEstatus(seleccionado._id, 'Cerrada')} style={{ flex: 1, padding: '10px', border: 'none', background: '#dc2626', borderRadius: '10px', fontSize: '12px', fontWeight: '600', color: '#fff', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Cerrar cuenta</button>
              )}
              <button onClick={() => setSeleccionado(null)} style={{ flex: 1, padding: '10px', border: '1.5px solid #dceaf8', background: '#fff', borderRadius: '10px', fontSize: '12px', fontWeight: '600', color: '#4a6a94', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}