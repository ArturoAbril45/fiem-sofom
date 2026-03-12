'use client';
import { useState, useEffect, useCallback } from 'react';
import { Search, FileText, Eye, X, Check, XCircle, RefreshCw, AlertCircle, CheckCircle, Loader, ChevronDown } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://fiem-backend-production.up.railway.app';
const fmt  = v => `$${(parseFloat(v)||0).toLocaleString('es-MX',{minimumFractionDigits:2})}`;
const fmtF = d => d ? new Date(d).toLocaleDateString('es-MX',{day:'2-digit',month:'2-digit',year:'numeric'}) : '—';

export default function ConsultarSolicitud() {
  const [busqueda,      setBusqueda]      = useState('');
  const [filtroEstatus, setFiltroEstatus] = useState('');
  const [seleccionado,  setSeleccionado]  = useState(null);
  const [solicitudes,   setSolicitudes]   = useState([]);
  const [cargando,      setCargando]      = useState(true);
  const [notif,         setNotif]         = useState(null);
  const [accionando,    setAccionando]    = useState(false);
  const [modalAprob,    setModalAprob]    = useState(false);
  const [modalRechaz,   setModalRechaz]   = useState(false);
  const [fechaInicio,   setFechaInicio]   = useState('');
  const [motivoRech,    setMotivoRech]    = useState('');

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const res  = await fetch(`${API}/api/solicitudes`);
      const data = await res.json();
      setSolicitudes(Array.isArray(data) ? data : []);
    } catch { setSolicitudes([]); }
    finally { setCargando(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const mostrarNotif = (tipo, msg) => {
    setNotif({ tipo, msg });
    setTimeout(() => setNotif(null), 4000);
  };

  // ── Aprobar solicitud → crear crédito ──
  const aprobarSolicitud = async () => {
    if (!fechaInicio) { mostrarNotif('error', 'Selecciona la fecha de inicio del crédito.'); return; }
    setAccionando(true);
    try {
      // 1. Actualizar estatus solicitud
      await fetch(`${API}/api/solicitudes/${seleccionado._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estatus: 'Aprobada', fechaAprobacion: new Date().toISOString() }),
      });
      // 2. Crear crédito automáticamente
      const creditoPayload = {
        clienteId:      seleccionado.clienteId,
        clienteNombre:  seleccionado.clienteNombre,
        clienteCurp:    seleccionado.clienteCurp,
        solicitudId:    seleccionado._id,
        producto:       seleccionado.producto,
        tipo:           seleccionado.tipo || 'PERSONAL',
        monto:          seleccionado.monto,
        saldo:          seleccionado.monto,
        plazo:          seleccionado.plazo,
        frecuencia:     seleccionado.frecuencia,
        tasaInteres:    seleccionado.tasaInteres,
        tasaMoratoria:  seleccionado.tasaMoratoria,
        destino:        seleccionado.destino,
        fechaInicio,
        estatus:        'Vigente',
        miembros:       seleccionado.miembros,
        nombreGrupo:    seleccionado.nombreGrupo,
        avales:         seleccionado.avales,
        tablaPagos:     seleccionado.tablaPagos,
        pagosRealizados: 0,
      };
      const resC   = await fetch(`${API}/api/creditos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creditoPayload),
      });
      const credito = await resC.json();
      mostrarNotif('ok', `✅ Solicitud aprobada — Crédito ${credito.folio || ''} creado correctamente`);
      setModalAprob(false);
      setFechaInicio('');
      setSeleccionado(null);
      cargar();
    } catch (e) {
      mostrarNotif('error', 'Error al aprobar: ' + e.message);
    } finally { setAccionando(false); }
  };

  // ── Rechazar solicitud ──
  const rechazarSolicitud = async () => {
    setAccionando(true);
    try {
      await fetch(`${API}/api/solicitudes/${seleccionado._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estatus: 'Rechazada', motivoRechazo: motivoRech, fechaRechazo: new Date().toISOString() }),
      });
      mostrarNotif('ok', 'Solicitud rechazada correctamente.');
      setModalRechaz(false);
      setMotivoRech('');
      setSeleccionado(null);
      cargar();
    } catch { mostrarNotif('error', 'Error al rechazar la solicitud.'); }
    finally { setAccionando(false); }
  };

  const filtradas = solicitudes.filter(s =>
    ((s.clienteNombre || '').toLowerCase().includes(busqueda.toLowerCase()) ||
     (s.clienteCurp   || '').includes(busqueda) ||
     (s.nombreGrupo   || '').toLowerCase().includes(busqueda.toLowerCase())) &&
    (!filtroEstatus || s.estatus === filtroEstatus)
  );

  const pillCfg = {
    Pendiente:   { bg: '#fef9c3', c: '#854d0e' },
    Aprobada:    { bg: '#dcfce7', c: '#166534' },
    Rechazada:   { bg: '#fee2e2', c: '#991b1b' },
    'En revisión':{ bg: '#e0f2fe', c: '#0c4a6e' },
    Cancelada:   { bg: '#f1f5f9', c: '#475569' },
  };
  const Pill = ({ v }) => {
    const s = pillCfg[v] || { bg: '#f1f5f9', c: '#475569' };
    return <span style={{ background: s.bg, color: s.c, borderRadius: '20px', padding: '3px 11px', fontSize: '11px', fontWeight: '700', display: 'inline-block' }}>{v || '—'}</span>;
  };

  const inp = { border: '1.5px solid #dceaf8', borderRadius: '9px', padding: '10px 13px', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', color: '#1a3d6e', outline: 'none', background: '#fafcff', boxSizing: 'border-box' };

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', fontFamily: 'DM Sans, sans-serif' }}>

      {/* Notificación */}
      {notif && (
        <div style={{ background: notif.tipo === 'ok' ? '#dcfce7' : '#fee2e2', border: `1px solid ${notif.tipo === 'ok' ? '#86efac' : '#fca5a5'}`, borderRadius: '12px', padding: '13px 18px', marginBottom: '18px', color: notif.tipo === 'ok' ? '#166534' : '#dc2626', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
          {notif.tipo === 'ok' ? <CheckCircle size={16} /> : <AlertCircle size={16} />} {notif.msg}
        </div>
      )}

      {/* Filtros */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #dceaf8', boxShadow: '0 2px 12px rgba(14,80,160,0.05)', padding: '18px 24px', marginBottom: '18px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ fontSize: '11px', fontWeight: '700', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' }}>Buscar</label>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#90aac8', pointerEvents: 'none' }} />
              <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
                placeholder="Nombre, CURP o grupo..." style={{ ...inp, width: '100%', paddingLeft: '38px' }} />
            </div>
          </div>
          <div style={{ minWidth: '160px' }}>
            <label style={{ fontSize: '11px', fontWeight: '700', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' }}>Estatus</label>
            <select value={filtroEstatus} onChange={e => setFiltroEstatus(e.target.value)} style={{ ...inp, cursor: 'pointer', width: '100%' }}>
              <option value="">Todos los estatus</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En revisión">En revisión</option>
              <option value="Aprobada">Aprobada</option>
              <option value="Rechazada">Rechazada</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </div>
          <button onClick={cargar} style={{ background: '#e8f2fc', border: '1px solid #dceaf8', borderRadius: '9px', padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#0e50a0' }}>
            <RefreshCw size={14} /> Actualizar
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #dceaf8', boxShadow: '0 2px 12px rgba(14,80,160,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f6ff', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', background: '#e8f2fc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={16} color="#0e50a0" />
          </div>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', fontWeight: '700', color: '#0a2d5e' }}>Solicitudes de crédito</span>
          <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#90aac8', background: '#f4f8fd', borderRadius: '20px', padding: '3px 10px', fontWeight: '600' }}>{filtradas.length} resultado(s)</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          {cargando ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#90aac8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> Cargando solicitudes...
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#0d1f5c' }}>
                  {['Folio', 'Cliente', 'Producto', 'Monto', 'Plazo', 'Frecuencia', 'Estatus', 'Fecha', 'Acciones'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#b8cde8', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtradas.length === 0 ? (
                  <tr><td colSpan={9} style={{ padding: '50px', textAlign: 'center', color: '#90aac8', fontSize: '13px' }}>No se encontraron solicitudes</td></tr>
                ) : filtradas.map((s, i) => (
                  <tr key={s._id} style={{ borderTop: '1px solid #f0f6ff', background: i % 2 === 0 ? '#fff' : '#fafcff' }}>
                    <td style={{ padding: '11px 14px', fontFamily: 'monospace', fontSize: '11px', color: '#0e50a0', fontWeight: '700' }}>{s._id?.slice(-8).toUpperCase()}</td>
                    <td style={{ padding: '11px 14px', fontSize: '13px', fontWeight: '600', color: '#0a2d5e', textTransform: 'uppercase', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.tipo === 'GRUPAL' ? `👥 ${s.nombreGrupo || 'Grupo'}` : (s.clienteNombre || '—')}
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: '13px', color: '#4a6a94' }}>{s.producto || '—'}</td>
                    <td style={{ padding: '11px 14px', fontSize: '13px', fontWeight: '700', color: '#0d1f5c' }}>{fmt(s.monto)}</td>
                    <td style={{ padding: '11px 14px', fontSize: '13px', color: '#4a6a94', textAlign: 'center' }}>{s.plazo || '—'}</td>
                    <td style={{ padding: '11px 14px', fontSize: '13px', color: '#4a6a94' }}>{s.frecuencia || '—'}</td>
                    <td style={{ padding: '11px 14px' }}><Pill v={s.estatus} /></td>
                    <td style={{ padding: '11px 14px', fontSize: '12px', color: '#90aac8' }}>{fmtF(s.fecha || s.createdAt)}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button onClick={() => setSeleccionado(s)}
                          style={{ background: '#e8f2fc', border: 'none', borderRadius: '7px', padding: '6px 11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600', color: '#0e50a0' }}>
                          <Eye size={12} /> Ver
                        </button>
                        {s.estatus === 'Pendiente' && (
                          <>
                            <button onClick={() => { setSeleccionado(s); setModalAprob(true); }}
                              style={{ background: '#dcfce7', border: 'none', borderRadius: '7px', padding: '6px 11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600', color: '#166534' }}>
                              <Check size={12} /> Aprobar
                            </button>
                            <button onClick={() => { setSeleccionado(s); setModalRechaz(true); }}
                              style={{ background: '#fee2e2', border: 'none', borderRadius: '7px', padding: '6px 11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600', color: '#dc2626' }}>
                              <XCircle size={12} /> Rechazar
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ═══ MODAL VER DETALLE ═══ */}
      {seleccionado && !modalAprob && !modalRechaz && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(10,45,94,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', overflowY: 'auto' }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '580px', boxShadow: '0 24px 80px rgba(10,45,94,0.2)', overflow: 'hidden', maxHeight: '90vh', overflowY: 'auto' }}>

            {/* Header */}
            <div style={{ borderBottom: '1px solid #dceaf8', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '38px', height: '38px', background: '#e8f2fc', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileText size={18} color="#0e50a0" /></div>
                <div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', fontWeight: '700', color: '#0a2d5e' }}>
                    {seleccionado.tipo === 'GRUPAL' ? seleccionado.nombreGrupo : seleccionado.clienteNombre}
                  </div>
                  <div style={{ fontSize: '11px', color: '#90aac8', marginTop: '2px' }}>Solicitud · {seleccionado._id?.slice(-8).toUpperCase()}</div>
                </div>
              </div>
              <button onClick={() => setSeleccionado(null)} style={{ background: '#f0f6ff', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#4a6a94' }}><X size={16} /></button>
            </div>

            {/* Cuerpo */}
            <div style={{ padding: '20px 24px' }}>
              {/* Datos principales */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                {[
                  ['Producto',       seleccionado.producto],
                  ['Monto',          fmt(seleccionado.monto)],
                  ['Plazo',          `${seleccionado.plazo} periodos`],
                  ['Frecuencia',     seleccionado.frecuencia],
                  ['Tasa interés',   `${seleccionado.tasaInteres || 0}%`],
                  ['Tipo CNBV',      seleccionado.tipoCNBV || '—'],
                  ['Destino',        seleccionado.destino || '—'],
                  ['Fecha',          fmtF(seleccionado.fecha || seleccionado.createdAt)],
                ].map(([label, val]) => (
                  <div key={label} style={{ background: '#f4f8fd', borderRadius: '10px', padding: '10px 12px', border: '1px solid #dceaf8' }}>
                    <div style={{ fontSize: '10px', fontWeight: '700', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '3px' }}>{label}</div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#0a2d5e' }}>{val || '—'}</div>
                  </div>
                ))}
              </div>

              {/* Estatus */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Estatus:</span>
                <Pill v={seleccionado.estatus} />
              </div>

              {/* Cliente / Grupo */}
              {seleccionado.tipo === 'GRUPAL' && (seleccionado.miembros || []).length > 0 && (
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#0e50a0', textTransform: 'uppercase', letterSpacing: '0.05em', background: '#e8f2fc', borderRadius: '6px', padding: '5px 12px', marginBottom: '8px' }}>
                    Miembros del grupo
                  </div>
                  {seleccionado.miembros.map((m, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 10px', background: i % 2 === 0 ? '#fff' : '#f8fbff', borderRadius: '6px', fontSize: '12px' }}>
                      <span style={{ fontWeight: '600', textTransform: 'uppercase' }}>{m.nombre}</span>
                      <span style={{ color: '#0e50a0', fontWeight: '700' }}>{fmt(m.montoIndividual)}</span>
                    </div>
                  ))}
                </div>
              )}

              {seleccionado.tipo !== 'GRUPAL' && (
                <div style={{ marginBottom: '14px', background: '#f4f8fd', borderRadius: '10px', padding: '12px 14px', border: '1px solid #dceaf8' }}>
                  <div style={{ fontSize: '10px', fontWeight: '700', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Datos del cliente</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', color: '#0a2d5e' }}>{seleccionado.clienteNombre || '—'}</div>
                  <div style={{ fontSize: '11px', color: '#90aac8', marginTop: '3px' }}>CURP: {seleccionado.clienteCurp || '—'} · Ruta: {seleccionado.rutaVinculacion || '—'}</div>
                </div>
              )}

              {/* Avales */}
              {(seleccionado.avales || []).length > 0 && (
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#0e50a0', textTransform: 'uppercase', letterSpacing: '0.05em', background: '#e8f2fc', borderRadius: '6px', padding: '5px 12px', marginBottom: '8px' }}>Avales</div>
                  {seleccionado.avales.map((av, i) => (
                    <div key={i} style={{ fontSize: '12px', padding: '5px 0', borderBottom: '1px solid #f0f4f8', display: 'flex', gap: '16px' }}>
                      <span><b>Nombre:</b> {av.nombre || '—'}</span>
                      <span><b>CURP:</b> {av.curp || '—'}</span>
                      <span><b>Tel:</b> {av.telefono || '—'}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Info financiera */}
              <div style={{ marginBottom: '14px', background: '#f4f8fd', borderRadius: '10px', padding: '12px 14px', border: '1px solid #dceaf8' }}>
                <div style={{ fontSize: '10px', fontWeight: '700', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Información financiera</div>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '12px' }}>
                  <span><b>Ingreso mensual:</b> {fmt(seleccionado.ingresoMensual)}</span>
                  <span><b>Otros ingresos:</b> {fmt(seleccionado.otrosIngresos)}</span>
                  <span><b>Total gastos:</b> {fmt(Object.values(seleccionado.gastos || {}).reduce((a, v) => a + (parseFloat(v) || 0), 0))}</span>
                </div>
              </div>

              {/* Tabla de pagos */}
              {(seleccionado.tablaPagos || []).length > 0 && (
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#0e50a0', textTransform: 'uppercase', letterSpacing: '0.05em', background: '#e8f2fc', borderRadius: '6px', padding: '5px 12px', marginBottom: '8px' }}>
                    Tabla de pagos simulada ({seleccionado.tablaPagos.length} periodos)
                  </div>
                  <div style={{ overflowX: 'auto', maxHeight: '200px', overflowY: 'auto', borderRadius: '8px', border: '1px solid #dceaf8' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px' }}>
                      <thead style={{ position: 'sticky', top: 0 }}>
                        <tr style={{ background: '#0d1f5c' }}>
                          {['#', 'Fecha', 'Abono cap.', 'Interés', 'Pago total', 'Saldo'].map(h => (
                            <th key={h} style={{ padding: '6px 8px', color: '#b8cde8', fontSize: '10px', fontWeight: '700', textAlign: 'right', whiteSpace: 'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {seleccionado.tablaPagos.map((f, i) => (
                          <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f8fbff' }}>
                            <td style={{ padding: '5px 8px', textAlign: 'right', color: '#0e50a0', fontWeight: '700' }}>{f.periodo}</td>
                            <td style={{ padding: '5px 8px', textAlign: 'right', fontFamily: 'monospace', fontSize: '10px' }}>{f.fecha}</td>
                            <td style={{ padding: '5px 8px', textAlign: 'right', color: '#166534', fontWeight: '600' }}>{fmt(f.abonoCapital)}</td>
                            <td style={{ padding: '5px 8px', textAlign: 'right', color: '#dc2626' }}>{fmt(f.interes)}</td>
                            <td style={{ padding: '5px 8px', textAlign: 'right', fontWeight: '700' }}>{fmt(f.pagoTotal)}</td>
                            <td style={{ padding: '5px 8px', textAlign: 'right' }}>{fmt(f.saldoFinal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Motivo rechazo */}
              {seleccionado.motivoRechazo && (
                <div style={{ background: '#fee2e2', borderRadius: '10px', padding: '12px 14px', marginBottom: '14px', border: '1px solid #fca5a5' }}>
                  <div style={{ fontWeight: '700', color: '#dc2626', marginBottom: '4px', fontSize: '12px' }}>Motivo de rechazo</div>
                  <div style={{ fontSize: '13px', color: '#991b1b' }}>{seleccionado.motivoRechazo}</div>
                </div>
              )}
            </div>

            {/* Acciones */}
            <div style={{ padding: '0 24px 22px', display: 'flex', gap: '10px' }}>
              {seleccionado.estatus === 'Pendiente' ? (
                <>
                  <button onClick={() => { setModalRechaz(true); }}
                    style={{ flex: 1, padding: '11px', border: '1.5px solid #fca5a5', background: '#fff', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#dc2626', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <XCircle size={14} /> Rechazar
                  </button>
                  <button onClick={() => setModalAprob(true)}
                    style={{ flex: 2, padding: '11px', border: 'none', background: '#166534', borderRadius: '10px', fontSize: '13px', fontWeight: '700', color: '#fff', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(22,101,52,0.25)' }}>
                    <Check size={14} /> Aprobar solicitud
                  </button>
                </>
              ) : (
                <button onClick={() => setSeleccionado(null)}
                  style={{ width: '100%', padding: '11px', border: '1.5px solid #dceaf8', background: '#fff', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#4a6a94', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                  Cerrar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL APROBAR ═══ */}
      {modalAprob && seleccionado && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(5,15,40,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '420px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
            <div style={{ background: '#166534', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: '#fff', fontWeight: '700', fontSize: '16px', fontFamily: "'Cormorant Garamond', serif" }}>Aprobar solicitud</span>
              <button onClick={() => { setModalAprob(false); setFechaInicio(''); }} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={16} /></button>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ background: '#f0fdf4', borderRadius: '10px', padding: '12px', marginBottom: '16px', border: '1px solid #86efac' }}>
                <div style={{ fontWeight: '700', color: '#166534', fontSize: '14px', marginBottom: '4px' }}>
                  {seleccionado.tipo === 'GRUPAL' ? seleccionado.nombreGrupo : seleccionado.clienteNombre}
                </div>
                <div style={{ fontSize: '12px', color: '#555', display: 'flex', gap: '14px' }}>
                  <span><b>Producto:</b> {seleccionado.producto}</span>
                  <span><b>Monto:</b> {fmt(seleccionado.monto)}</span>
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>Fecha de inicio del crédito *</label>
                <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)}
                  style={{ ...inp, width: '100%' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button onClick={aprobarSolicitud} disabled={accionando}
                  style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: '10px', padding: '11px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  {accionando ? <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle size={13} />}
                  Confirmar y crear crédito
                </button>
                <button onClick={() => { setModalAprob(false); setFechaInicio(''); }}
                  style={{ background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '10px', padding: '11px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL RECHAZAR ═══ */}
      {modalRechaz && seleccionado && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(5,15,40,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '400px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
            <div style={{ background: '#dc2626', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: '#fff', fontWeight: '700', fontSize: '16px', fontFamily: "'Cormorant Garamond', serif" }}>Rechazar solicitud</span>
              <button onClick={() => { setModalRechaz(false); setMotivoRech(''); }} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={16} /></button>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>Motivo del rechazo</label>
                <textarea value={motivoRech} onChange={e => setMotivoRech(e.target.value)}
                  rows={3} placeholder="Describe el motivo..."
                  style={{ ...inp, width: '100%', resize: 'vertical' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button onClick={rechazarSolicitud} disabled={accionando}
                  style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: '10px', padding: '11px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  {accionando ? <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <XCircle size={13} />}
                  Confirmar rechazo
                </button>
                <button onClick={() => { setModalRechaz(false); setMotivoRech(''); }}
                  style={{ background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '10px', padding: '11px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}