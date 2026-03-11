'use client';
import { useState, useEffect, useCallback } from 'react';
import { Search, User, Phone, MapPin, CreditCard, Eye, X, RefreshCw, AlertCircle, Pencil, CheckCircle, Loader } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://fiem-backend-production.up.railway.app';

const ESTADOS_MX = ['Aguascalientes','Baja California','Baja California Sur','Campeche','Chiapas','Chihuahua','Ciudad de Mexico','Coahuila','Colima','Durango','Guanajuato','Guerrero','Hidalgo','Jalisco','Mexico','Michoacan','Morelos','Nayarit','Nuevo Leon','Oaxaca','Puebla','Queretaro','Quintana Roo','San Luis Potosi','Sinaloa','Sonora','Tabasco','Tamaulipas','Tlaxcala','Veracruz','Yucatan','Zacatecas'];

export default function ConsultarCliente() {
  const [busqueda,     setBusqueda]     = useState('');
  const [clientes,     setClientes]     = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [editando,     setEditando]     = useState(false);
  const [formEdit,     setFormEdit]     = useState({});
  const [cargando,     setCargando]     = useState(true);
  const [error,        setError]        = useState('');
  const [notif,        setNotif]        = useState(null); // {tipo:'ok'|'error', msg}

  const cargar = useCallback(async () => {
    setCargando(true); setError('');
    try {
      const res  = await fetch(`${API}/api/clientes`);
      const data = await res.json();
      setClientes(Array.isArray(data) ? data : []);
    } catch {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const mostrarNotif = (tipo, msg) => {
    setNotif({ tipo, msg });
    setTimeout(() => setNotif(null), 3500);
  };

  const guardarEdicion = async () => {
    try {
      const res = await fetch(`${API}/api/clientes/${seleccionado._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formEdit),
      });
      if (!res.ok) throw new Error();
      mostrarNotif('ok', 'Cliente actualizado correctamente.');
      setEditando(false);
      setSeleccionado(null);
      cargar();
    } catch {
      mostrarNotif('error', 'Error al actualizar el cliente.');
    }
  };

  const filtrados = clientes.filter(c => {
    if (c.estatus === 'Lista negra') return false; // excluir lista negra
    const q = busqueda.toLowerCase();
    const nombre = `${c.nombre} ${c.apellidoP} ${c.apellidoM}`.toLowerCase();
    return nombre.includes(q) || (c.curp || '').toLowerCase().includes(q) || (c.celular || '').includes(q);
  });

  const abrirEdicion = (c) => {
    setFormEdit({ ...c });
    setEditando(true);
  };

  const inp = { border: '1.5px solid #dceaf8', borderRadius: '9px', padding: '9px 12px', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', color: '#1a3d6e', outline: 'none', width: '100%', background: '#fafcff', boxSizing: 'border-box' };
  const lbl = { fontSize: '11px', fontWeight: '600', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '5px' };

  const badge = (estatus) => ({
    display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
    background: estatus === 'Activo' ? '#dcfce7' : '#f1f5f9',
    color: estatus === 'Activo' ? '#166534' : '#64748b',
  });

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>

      {/* Notificación */}
      {notif && (
        <div style={{ background: notif.tipo === 'ok' ? '#dcfce7' : '#fee2e2', border: `1px solid ${notif.tipo === 'ok' ? '#86efac' : '#fca5a5'}`, borderRadius: '12px', padding: '13px 18px', marginBottom: '18px', color: notif.tipo === 'ok' ? '#166534' : '#dc2626', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
          {notif.tipo === 'ok' ? <CheckCircle size={16} /> : <AlertCircle size={16} />} {notif.msg}
        </div>
      )}

      {/* Error de conexión */}
      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '12px', padding: '13px 18px', marginBottom: '18px', color: '#dc2626', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={16} /> {error}
          <button onClick={cargar} style={{ marginLeft: 'auto', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '7px', padding: '5px 12px', fontSize: '12px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: '600' }}>Reintentar</button>
        </div>
      )}

      {/* Buscador */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #dceaf8', boxShadow: '0 2px 12px rgba(14,80,160,0.05)', padding: '20px 24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={lbl}>Buscar cliente</label>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#90aac8', pointerEvents: 'none' }} />
              <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Nombre, CURP o celular..." style={{ ...inp, paddingLeft: '38px' }} />
            </div>
          </div>
          <button onClick={cargar} style={{ background: '#e8f2fc', border: '1px solid #dceaf8', borderRadius: '9px', padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#0e50a0', fontFamily: 'DM Sans, sans-serif' }}>
            <RefreshCw size={14} /> Actualizar
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #dceaf8', boxShadow: '0 2px 12px rgba(14,80,160,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f6ff', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', background: '#e8f2fc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={16} color="#0e50a0" />
          </div>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', fontWeight: '700', color: '#0a2d5e' }}>Clientes registrados</span>
          <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#90aac8' }}>{filtrados.length} resultado(s)</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          {cargando ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#90aac8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> Cargando clientes...
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f4f8fd' }}>
                  {['Nombre', 'CURP', 'Celular', 'Municipio', 'Estatus', ''].map(h => (
                    <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtrados.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#90aac8', fontSize: '13px' }}>No se encontraron clientes</td></tr>
                ) : filtrados.map((c, i) => (
                  <tr key={c._id} style={{ borderTop: '1px solid #f0f6ff', background: i % 2 === 0 ? '#fff' : '#fafcff' }}>
                    <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0a2d5e' }}>{c.nombre} {c.apellidoP} {c.apellidoM}</td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#4a6a94', fontFamily: 'monospace' }}>{c.curp}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4a6a94' }}>{c.celular}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4a6a94' }}>{c.municipio}, {c.estado}</td>
                    <td style={{ padding: '12px 16px' }}><span style={badge(c.estatus)}>{c.estatus || 'Activo'}</span></td>
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

      {/* Modal detalle */}
      {seleccionado && !editando && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(10,45,94,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '520px', boxShadow: '0 24px 80px rgba(10,45,94,0.2)', overflow: 'hidden' }}>
            <div style={{ background: '#fff', borderBottom: '1px solid #dceaf8', padding: '22px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '44px', height: '44px', background: '#e8f2fc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={20} color="#0e50a0" />
                </div>
                <div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', fontWeight: '700', color: '#0a2d5e' }}>{seleccionado.nombre} {seleccionado.apellidoP} {seleccionado.apellidoM}</div>
                  <div style={{ fontSize: '12px', color: '#90aac8', marginTop: '2px' }}>{seleccionado.curp}</div>
                </div>
              </div>
              <button onClick={() => setSeleccionado(null)} style={{ background: '#f0f6ff', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#4a6a94' }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { icon: Phone,      label: 'Celular',    val: seleccionado.celular },
                { icon: Phone,      label: 'Telefono',   val: seleccionado.telefono || '—' },
                { icon: MapPin,     label: 'Municipio',  val: `${seleccionado.municipio}, ${seleccionado.estado}` },
                { icon: MapPin,     label: 'Colonia',    val: seleccionado.colonia || '—' },
                { icon: User,       label: 'Ocupacion',  val: seleccionado.ocupacion || '—' },
                { icon: CreditCard, label: 'RFC',        val: seleccionado.rfc || '—' },
                { icon: User,       label: 'Genero',     val: seleccionado.sexo || '—' },
                { icon: User,       label: 'Estatus',    val: seleccionado.estatus || 'Activo' },
              ].map(({ icon: Icon, label, val }) => (
                <div key={label}>
                  <div style={{ fontSize: '11px', color: '#90aac8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Icon size={11} /> {label}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#0a2d5e' }}>{val}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: '0 28px 24px', display: 'flex', gap: '10px' }}>
              <button onClick={() => setSeleccionado(null)} style={{ flex: 1, padding: '11px', border: '1.5px solid #dceaf8', background: '#fff', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#4a6a94', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Cerrar</button>
              <button onClick={() => abrirEdicion(seleccionado)} style={{ flex: 2, padding: '11px', border: 'none', background: '#0e50a0', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#fff', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', boxShadow: '0 4px 14px rgba(14,80,160,0.28)' }}>
                <Pencil size={13} /> Editar cliente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal edición */}
      {editando && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(10,45,94,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '560px', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(10,45,94,0.2)' }}>
            <div style={{ background: '#fff', borderBottom: '1px solid #dceaf8', padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Pencil size={16} color="#0e50a0" />
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', fontWeight: '700', color: '#0a2d5e' }}>Editar cliente</span>
              </div>
              <button onClick={() => setEditando(false)} style={{ background: '#f0f6ff', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#4a6a94' }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {[
                { label: 'Nombre(s)',        key: 'nombre',    type: 'text' },
                { label: 'Apellido paterno', key: 'apellidoP', type: 'text' },
                { label: 'Apellido materno', key: 'apellidoM', type: 'text' },
                { label: 'CURP',             key: 'curp',      type: 'text' },
                { label: 'RFC',              key: 'rfc',       type: 'text' },
                { label: 'Celular',          key: 'celular',   type: 'tel' },
                { label: 'Telefono',         key: 'telefono',  type: 'tel' },
                { label: 'Correo',           key: 'correo',    type: 'email' },
                { label: 'Colonia',          key: 'colonia',   type: 'text' },
                { label: 'Municipio',        key: 'municipio', type: 'text' },
                { label: 'CP',               key: 'cp',        type: 'text' },
                { label: 'Ocupacion',        key: 'ocupacion', type: 'text' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label style={lbl}>{label}</label>
                  <input type={type} value={formEdit[key] || ''} onChange={e => setFormEdit(p => ({ ...p, [key]: e.target.value }))} style={inp} />
                </div>
              ))}
              <div>
                <label style={lbl}>Estado</label>
                <select value={formEdit.estado || ''} onChange={e => setFormEdit(p => ({ ...p, estado: e.target.value }))} style={{ ...inp, cursor: 'pointer' }}>
                  <option value="">Seleccionar...</option>
                  {ESTADOS_MX.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Estatus</label>
                <select value={formEdit.estatus || 'Activo'} onChange={e => setFormEdit(p => ({ ...p, estatus: e.target.value }))} style={{ ...inp, cursor: 'pointer' }}>
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                  {/* Lista negra se gestiona desde el modulo Lista Negra */}
                </select>
              </div>
            </div>
            <div style={{ padding: '0 28px 24px', display: 'flex', gap: '10px' }}>
              <button onClick={() => setEditando(false)} style={{ flex: 1, padding: '11px', border: '1.5px solid #dceaf8', background: '#fff', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#4a6a94', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Cancelar</button>
              <button onClick={guardarEdicion} style={{ flex: 2, padding: '11px', border: 'none', background: '#0e50a0', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#fff', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', boxShadow: '0 4px 14px rgba(14,80,160,0.28)' }}>Guardar cambios</button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}