'use client';
import { useState, useEffect, useCallback } from 'react';
import { Search, User, Eye, X, RefreshCw, Loader, Save, CheckCircle, AlertCircle } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://fiem-backend-production.up.railway.app';
const PUESTOS = ['Gerente', 'Ejecutivo de cobranza', 'Cajero', 'Administrativo', 'Director', 'Otro'];

export default function ConsultarEmpleado() {
  const [busqueda,     setBusqueda]     = useState('');
  const [filtroEstatus,setFiltroEstatus]= useState('');
  const [empleados,    setEmpleados]    = useState([]);
  const [cargando,     setCargando]     = useState(true);
  const [seleccionado, setSeleccionado] = useState(null);
  const [editando,     setEditando]     = useState(false);
  const [formEdit,     setFormEdit]     = useState({});
  const [notif,        setNotif]        = useState(null);
  const [guardando,    setGuardando]    = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const res  = await fetch(`${API}/api/empleados`);
      const data = await res.json();
      setEmpleados(Array.isArray(data) ? data : []);
    } catch { setEmpleados([]); }
    finally { setCargando(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const mostrarNotif = (tipo, msg) => { setNotif({ tipo, msg }); setTimeout(() => setNotif(null), 3500); };

  const abrirEditar = (emp) => { setFormEdit({ ...emp }); setEditando(true); setSeleccionado(emp); };

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      const res = await fetch(`${API}/api/empleados/${formEdit._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formEdit),
      });
      if (!res.ok) throw new Error('Error al actualizar');
      mostrarNotif('ok', 'Empleado actualizado correctamente.');
      setEditando(false); setSeleccionado(null);
      cargar();
    } catch (e) { mostrarNotif('error', e.message); }
    finally { setGuardando(false); }
  };

  const filtrados = empleados.filter(e =>
    (`${e.nombre} ${e.apellidoP}`.toLowerCase().includes(busqueda.toLowerCase()) || (e.curp || '').includes(busqueda)) &&
    (!filtroEstatus || e.estatus === filtroEstatus)
  );

  const badge = (e) => {
    const map = { Activo: ['#dcfce7','#166534'], Inactivo: ['#f1f5f9','#475569'], Baja: ['#fee2e2','#991b1b'] };
    const [bg, color] = map[e] || ['#f1f5f9','#475569'];
    return { display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: bg, color };
  };

  const inp = { border: '1.5px solid #dceaf8', borderRadius: '9px', padding: '10px 13px', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', color: '#1a3d6e', outline: 'none', background: '#fafcff', boxSizing: 'border-box' };
  const lbl = (n) => <label style={{ fontSize: '11px', fontWeight: '600', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '5px' }}>{n}</label>;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {notif && <div style={{ background: notif.tipo === 'ok' ? '#dcfce7' : '#fee2e2', border: `1px solid ${notif.tipo === 'ok' ? '#86efac' : '#fca5a5'}`, borderRadius: '12px', padding: '13px 18px', marginBottom: '18px', color: notif.tipo === 'ok' ? '#166534' : '#dc2626', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>{notif.tipo === 'ok' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}{notif.msg}</div>}

      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #dceaf8', boxShadow: '0 2px 12px rgba(14,80,160,0.05)', padding: '20px 24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ fontSize: '11px', fontWeight: '600', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' }}>Buscar</label>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#90aac8', pointerEvents: 'none' }} />
              <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Nombre o CURP..." style={{ ...inp, width: '100%', paddingLeft: '38px' }} />
            </div>
          </div>
          <div style={{ minWidth: '160px' }}>
            <label style={{ fontSize: '11px', fontWeight: '600', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' }}>Estatus</label>
            <select value={filtroEstatus} onChange={e => setFiltroEstatus(e.target.value)} style={{ ...inp, cursor: 'pointer', width: '100%' }}>
              <option value="">Todos</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
              <option value="Baja">Baja</option>
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
          <div style={{ width: '32px', height: '32px', background: '#e8f2fc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={16} color="#0e50a0" /></div>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', fontWeight: '700', color: '#0a2d5e' }}>Empleados</span>
          <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#90aac8' }}>{filtrados.length} resultado(s)</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          {cargando ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#90aac8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> Cargando empleados...
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f4f8fd' }}>
                  {['Nombre', 'CURP', 'Puesto', 'Telefono', 'Sucursal', 'Estatus', ''].map(h => (
                    <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtrados.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#90aac8', fontSize: '13px' }}>No se encontraron empleados</td></tr>
                ) : filtrados.map((e, i) => (
                  <tr key={e._id} style={{ borderTop: '1px solid #f0f6ff', background: i % 2 === 0 ? '#fff' : '#fafcff' }}>
                    <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0a2d5e' }}>{e.nombre} {e.apellidoP}</td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', fontFamily: 'monospace', color: '#4a6a94' }}>{e.curp}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4a6a94' }}>{e.puesto}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4a6a94' }}>{e.telefono}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4a6a94' }}>{e.sucursal || '—'}</td>
                    <td style={{ padding: '12px 16px' }}><span style={badge(e.estatus)}>{e.estatus}</span></td>
                    <td style={{ padding: '12px 16px' }}>
                      <button onClick={() => { setSeleccionado(e); setEditando(false); }} style={{ background: '#e8f2fc', border: 'none', borderRadius: '7px', padding: '7px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: '600', color: '#0e50a0', fontFamily: 'DM Sans, sans-serif' }}>
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
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '560px', boxShadow: '0 24px 80px rgba(10,45,94,0.2)', overflow: 'hidden', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ background: '#fff', borderBottom: '1px solid #dceaf8', padding: '22px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', background: '#e8f2fc', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={20} color="#0e50a0" /></div>
                <div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', fontWeight: '700', color: '#0a2d5e' }}>{seleccionado.nombre} {seleccionado.apellidoP}</div>
                  <div style={{ fontSize: '12px', color: '#90aac8', marginTop: '2px' }}>{seleccionado.puesto}</div>
                </div>
              </div>
              <button onClick={() => { setSeleccionado(null); setEditando(false); }} style={{ background: '#f0f6ff', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#4a6a94' }}><X size={16} /></button>
            </div>

            {!editando ? (
              <>
                <div style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {[
                    { label: 'CURP',          val: seleccionado.curp || '—' },
                    { label: 'RFC',           val: seleccionado.rfc || '—' },
                    { label: 'Telefono',      val: seleccionado.telefono || '—' },
                    { label: 'Email',         val: seleccionado.email || '—' },
                    { label: 'Sucursal',      val: seleccionado.sucursal || '—' },
                    { label: 'Fecha ingreso', val: seleccionado.fechaIngreso ? new Date(seleccionado.fechaIngreso).toLocaleDateString('es-MX') : '—' },
                    { label: 'Usuario',       val: seleccionado.usuario || '—' },
                    { label: 'Estatus',       val: seleccionado.estatus },
                  ].map(({ label, val }) => (
                    <div key={label}>
                      <div style={{ fontSize: '11px', color: '#90aac8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '4px' }}>{label}</div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#0a2d5e' }}>{val}</div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '0 28px 24px', display: 'flex', gap: '10px' }}>
                  <button onClick={() => abrirEditar(seleccionado)} style={{ flex: 2, padding: '11px', border: 'none', background: '#0e50a0', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#fff', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', boxShadow: '0 4px 12px rgba(14,80,160,0.25)' }}>Editar datos</button>
                  <button onClick={() => { setSeleccionado(null); setEditando(false); }} style={{ flex: 1, padding: '11px', border: '1.5px solid #dceaf8', background: '#fff', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#4a6a94', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Cerrar</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  {[
                    { label: 'Nombre',          key: 'nombre' },
                    { label: 'Apellido paterno', key: 'apellidoP' },
                    { label: 'Apellido materno', key: 'apellidoM' },
                    { label: 'CURP',             key: 'curp' },
                    { label: 'RFC',              key: 'rfc' },
                    { label: 'Telefono',         key: 'telefono' },
                    { label: 'Email',            key: 'email' },
                    { label: 'Sucursal',         key: 'sucursal' },
                  ].map(({ label, key }) => (
                    <div key={key}>
                      {lbl(label)}
                      <input value={formEdit[key] || ''} onChange={e => setFormEdit(p => ({ ...p, [key]: e.target.value }))} style={{ ...inp, width: '100%' }} />
                    </div>
                  ))}
                  <div>
                    {lbl('Puesto')}
                    <select value={formEdit.puesto || ''} onChange={e => setFormEdit(p => ({ ...p, puesto: e.target.value }))} style={{ ...inp, cursor: 'pointer', width: '100%' }}>
                      {PUESTOS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    {lbl('Estatus')}
                    <select value={formEdit.estatus || ''} onChange={e => setFormEdit(p => ({ ...p, estatus: e.target.value }))} style={{ ...inp, cursor: 'pointer', width: '100%' }}>
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                      <option value="Baja">Baja</option>
                    </select>
                  </div>
                </div>
                <div style={{ padding: '0 28px 24px', display: 'flex', gap: '10px' }}>
                  <button onClick={handleGuardar} disabled={guardando} style={{ flex: 2, padding: '11px', border: 'none', background: guardando ? '#90aac8' : '#0e50a0', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#fff', cursor: guardando ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(14,80,160,0.25)' }}>
                    {guardando ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Guardando...</> : <><Save size={14} /> Guardar cambios</>}
                  </button>
                  <button onClick={() => setEditando(false)} style={{ flex: 1, padding: '11px', border: '1.5px solid #dceaf8', background: '#fff', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#4a6a94', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Cancelar</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}