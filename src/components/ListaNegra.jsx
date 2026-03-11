'use client';
import { useState, useEffect, useCallback } from 'react';
import { Search, AlertCircle, UserX, X, Plus, CheckCircle, Loader, RefreshCw } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://fiem-backend-production.up.railway.app';

function formatMoney(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(n || 0);
}

export default function ListaNegra() {
  const [busqueda,      setBusqueda]      = useState('');
  const [lista,         setLista]         = useState([]);
  const [modal,         setModal]         = useState(false);
  const [confirmarElim, setConfirmarElim] = useState(null);
  const [cargando,      setCargando]      = useState(true);
  const [guardando,     setGuardando]     = useState(false);
  const [eliminando,    setEliminando]    = useState(false);
  const [notif,         setNotif]         = useState(null);
  const [errorConn,     setErrorConn]     = useState('');

  // Para el modal — buscar cliente existente
  const [busModal,      setBusModal]      = useState('');
  const [clientesAll,   setClientesAll]   = useState([]);
  const [clienteSel,    setClienteSel]    = useState(null);
  const [motivo,        setMotivo]        = useState('');
  const [montoAdeudado, setMontoAdeudado] = useState('');
  const [showDrop,      setShowDrop]      = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true); setErrorConn('');
    try {
      const res  = await fetch(`${API}/api/lista-negra`);
      const data = await res.json();
      setLista(Array.isArray(data) ? data : []);
    } catch {
      setErrorConn('No se pudo conectar con el servidor.');
    } finally {
      setCargando(false);
    }
  }, []);

  const cargarClientes = useCallback(async () => {
    try {
      const res  = await fetch(`${API}/api/clientes`);
      const data = await res.json();
      // Solo clientes que NO están ya en lista negra
      setClientesAll(Array.isArray(data) ? data.filter(c => c.estatus !== 'Lista negra') : []);
    } catch {}
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const abrirModal = () => {
    cargarClientes();
    setBusModal(''); setClienteSel(null); setMotivo(''); setMontoAdeudado(''); setShowDrop(false);
    setModal(true);
  };

  const clientesFiltrados = clientesAll.filter(c => {
    const nombre = `${c.nombre} ${c.apellidoP} ${c.apellidoM}`.toLowerCase();
    return nombre.includes(busModal.toLowerCase()) || (c.curp || '').toLowerCase().includes(busModal.toLowerCase());
  }).slice(0, 6);

  const mostrarNotif = (tipo, msg) => {
    setNotif({ tipo, msg });
    setTimeout(() => setNotif(null), 3500);
  };

  const agregar = async () => {
    if (!clienteSel || !motivo) {
      mostrarNotif('error', 'Selecciona un cliente e ingresa el motivo.');
      return;
    }
    setGuardando(true);
    try {
      // Cambiar estatus del cliente existente a "Lista negra"
      const res = await fetch(`${API}/api/clientes/${clienteSel._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estatus: 'Lista negra',
          motivoListaNegra: motivo,
          montoAdeudado: Number(montoAdeudado) || 0,
        }),
      });
      if (!res.ok) throw new Error('Error al actualizar');
      mostrarNotif('ok', `${clienteSel.nombre} ${clienteSel.apellidoP} agregado a lista negra.`);
      setModal(false);
      cargar();
    } catch (e) {
      mostrarNotif('error', 'Error al agregar a lista negra.');
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async () => {
    if (!confirmarElim) return;
    setEliminando(true);
    try {
      // Restaurar estatus a "Activo"
      const res = await fetch(`${API}/api/clientes/${confirmarElim._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estatus: 'Activo', motivoListaNegra: '', montoAdeudado: 0 }),
      });
      if (!res.ok) throw new Error();
      mostrarNotif('ok', `${confirmarElim.nombre} ${confirmarElim.apellidoP} removido de lista negra.`);
      setConfirmarElim(null);
      cargar();
    } catch {
      mostrarNotif('error', 'Error al eliminar el registro.');
      setConfirmarElim(null);
    } finally {
      setEliminando(false);
    }
  };

  const filtrados = lista.filter(c => {
    const nombreCompleto = `${c.nombre} ${c.apellidoP} ${c.apellidoM}`.toLowerCase();
    return nombreCompleto.includes(busqueda.toLowerCase()) || (c.curp || '').toLowerCase().includes(busqueda.toLowerCase());
  });

  const inp = { border: '1.5px solid #dceaf8', borderRadius: '9px', padding: '10px 13px', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', color: '#1a3d6e', outline: 'none', width: '100%', background: '#fafcff', boxSizing: 'border-box' };
  const lbl = { fontSize: '11px', fontWeight: '600', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>

      {notif && (
        <div style={{ background: notif.tipo === 'ok' ? '#dcfce7' : '#fee2e2', border: `1px solid ${notif.tipo === 'ok' ? '#86efac' : '#fca5a5'}`, borderRadius: '12px', padding: '13px 18px', marginBottom: '18px', color: notif.tipo === 'ok' ? '#166534' : '#dc2626', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
          {notif.tipo === 'ok' ? <CheckCircle size={16} /> : <AlertCircle size={16} />} {notif.msg}
        </div>
      )}

      {errorConn && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '12px', padding: '13px 18px', marginBottom: '18px', color: '#dc2626', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={16} /> {errorConn}
          <button onClick={cargar} style={{ marginLeft: 'auto', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '7px', padding: '5px 12px', fontSize: '12px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: '600' }}>Reintentar</button>
        </div>
      )}

      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #dceaf8', boxShadow: '0 2px 12px rgba(14,80,160,0.05)', padding: '20px 24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={lbl}>Buscar en lista negra</label>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#90aac8', pointerEvents: 'none' }} />
              <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Nombre o CURP..." style={{ ...inp, paddingLeft: '38px' }} />
            </div>
          </div>
          <button onClick={cargar} style={{ background: '#e8f2fc', border: '1px solid #dceaf8', borderRadius: '9px', padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#0e50a0', fontFamily: 'DM Sans, sans-serif' }}>
            <RefreshCw size={14} />
          </button>
          <button onClick={abrirModal} style={{ background: '#dc2626', border: 'none', borderRadius: '9px', padding: '10px 18px', fontSize: '13px', fontWeight: '600', color: '#fff', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(220,38,38,0.25)' }}>
            <Plus size={14} /> Agregar
          </button>
        </div>
      </div>

      <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '12px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <AlertCircle size={16} color="#dc2626" />
        <span style={{ fontSize: '13px', color: '#dc2626', fontWeight: '500' }}>
          Los clientes en esta lista no pueden recibir nuevos creditos. Total registros: <strong>{lista.length}</strong>
        </span>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #dceaf8', boxShadow: '0 2px 12px rgba(14,80,160,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f6ff', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', background: '#fee2e2', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserX size={16} color="#dc2626" />
          </div>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', fontWeight: '700', color: '#0a2d5e' }}>Lista negra</span>
          <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#90aac8' }}>{filtrados.length} registro(s)</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          {cargando ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#90aac8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> Cargando lista negra...
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#fef2f2' }}>
                  {['Nombre', 'CURP', 'Motivo', 'Monto adeudado', 'Fecha ingreso', ''].map(h => (
                    <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtrados.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#90aac8', fontSize: '13px' }}>No hay registros en lista negra</td></tr>
                ) : filtrados.map((c, i) => (
                  <tr key={c._id} style={{ borderTop: '1px solid #f0f6ff', background: i % 2 === 0 ? '#fff' : '#fafcff' }}>
                    <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0a2d5e' }}>{c.nombre} {c.apellidoP} {c.apellidoM}</td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#4a6a94', fontFamily: 'monospace' }}>{c.curp}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4a6a94', maxWidth: '200px' }}>{c.motivoListaNegra || '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: '#dc2626' }}>{formatMoney(c.montoAdeudado)}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4a6a94' }}>{c.updatedAt ? new Date(c.updatedAt).toLocaleDateString('es-MX') : '—'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <button onClick={() => setConfirmarElim(c)} style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '7px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: '#dc2626', fontFamily: 'DM Sans, sans-serif' }}>
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal agregar — busca cliente existente */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(10,45,94,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '480px', boxShadow: '0 24px 80px rgba(10,45,94,0.2)', overflow: 'hidden' }}>
            <div style={{ background: '#fff', borderBottom: '1px solid #dceaf8', padding: '22px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', background: '#fee2e2', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UserX size={20} color="#dc2626" /></div>
                <div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', fontWeight: '700', color: '#0a2d5e' }}>Agregar a lista negra</div>
                  <div style={{ fontSize: '12px', color: '#90aac8', marginTop: '2px' }}>Selecciona un cliente existente</div>
                </div>
              </div>
              <button onClick={() => setModal(false)} style={{ background: '#f0f6ff', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#4a6a94' }}><X size={16} /></button>
            </div>

            <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Buscador de cliente */}
              <div style={{ position: 'relative' }}>
                <label style={lbl}>Buscar cliente *</label>
                <div style={{ position: 'relative' }}>
                  <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#90aac8', pointerEvents: 'none' }} />
                  <input
                    value={busModal}
                    onChange={e => { setBusModal(e.target.value); setClienteSel(null); setShowDrop(true); }}
                    onFocus={() => setShowDrop(true)}
                    placeholder="Nombre o CURP del cliente..."
                    style={{ ...inp, paddingLeft: '36px' }}
                  />
                </div>
                {showDrop && busModal && clientesFiltrados.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #dceaf8', borderRadius: '10px', boxShadow: '0 8px 24px rgba(14,80,160,0.12)', zIndex: 200, marginTop: '4px' }}>
                    {clientesFiltrados.map(c => (
                      <div key={c._id} onClick={() => { setClienteSel(c); setBusModal(`${c.nombre} ${c.apellidoP} ${c.apellidoM}`); setShowDrop(false); }}
                        style={{ padding: '10px 14px', cursor: 'pointer', fontSize: '13px', color: '#0a2d5e', borderBottom: '1px solid #f0f6ff' }}
                        onMouseEnter={e => e.currentTarget.style.background='#f4f8fd'} onMouseLeave={e => e.currentTarget.style.background='#fff'}>
                        <strong>{c.nombre} {c.apellidoP}</strong> <span style={{ color: '#90aac8', fontSize: '11px' }}>{c.curp}</span>
                      </div>
                    ))}
                  </div>
                )}
                {showDrop && busModal && clientesFiltrados.length === 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #dceaf8', borderRadius: '10px', padding: '12px 14px', zIndex: 200, marginTop: '4px', fontSize: '13px', color: '#90aac8' }}>
                    No se encontraron clientes
                  </div>
                )}
              </div>

              {/* Cliente seleccionado */}
              {clienteSel && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#0a2d5e' }}>{clienteSel.nombre} {clienteSel.apellidoP} {clienteSel.apellidoM}</div>
                    <div style={{ fontSize: '11px', color: '#90aac8', marginTop: '2px' }}>CURP: {clienteSel.curp}</div>
                  </div>
                  <CheckCircle size={18} color="#dc2626" />
                </div>
              )}

              <div>
                <label style={lbl}>Motivo *</label>
                <input value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Motivo de la inclusion en lista negra" style={inp} />
              </div>

              <div>
                <label style={lbl}>Monto adeudado (MXN)</label>
                <input type="number" value={montoAdeudado} onChange={e => setMontoAdeudado(e.target.value)} placeholder="0.00" style={inp} />
              </div>
            </div>

            <div style={{ padding: '0 28px 24px', display: 'flex', gap: '10px' }}>
              <button onClick={() => setModal(false)} style={{ flex: 1, padding: '11px', border: '1.5px solid #dceaf8', background: '#fff', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#4a6a94', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Cancelar</button>
              <button onClick={agregar} disabled={guardando} style={{ flex: 2, padding: '11px', border: 'none', background: guardando ? '#fca5a5' : '#dc2626', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#fff', cursor: guardando ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', boxShadow: '0 4px 12px rgba(220,38,38,0.25)' }}>
                {guardando ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Guardando...</> : 'Agregar a lista negra'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmar remover */}
      {confirmarElim && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(10,45,94,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '380px', padding: '32px', boxShadow: '0 24px 80px rgba(10,45,94,0.2)' }}>
            <div style={{ width: '52px', height: '52px', background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
              <AlertCircle size={24} color="#dc2626" />
            </div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', fontWeight: '700', color: '#0a2d5e', marginBottom: '10px' }}>Confirmar accion</div>
            <p style={{ fontSize: '13px', color: '#4a6a94', marginBottom: '24px', lineHeight: '1.7' }}>
              Vas a remover a <strong>{confirmarElim.nombre} {confirmarElim.apellidoP}</strong> de la lista negra. Su estatus volvera a <strong>Activo</strong>.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setConfirmarElim(null)} style={{ flex: 1, padding: '11px', border: '1.5px solid #dceaf8', background: '#fff', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#4a6a94', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Cancelar</button>
              <button onClick={eliminar} disabled={eliminando} style={{ flex: 1, padding: '11px', border: 'none', background: '#dc2626', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#fff', cursor: eliminando ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px' }}>
                {eliminando ? <><Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> Procesando...</> : 'Remover'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}