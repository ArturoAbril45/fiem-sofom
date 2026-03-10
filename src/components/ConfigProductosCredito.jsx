'use client';
import { useState } from 'react';
import { CreditCard, Plus, Eye, X, Save, Trash2, Search, Pencil } from 'lucide-react';

export default function ConfigProductosCredito() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [modal, setModal] = useState(null);
  const [seleccionado, setSeleccionado] = useState(null);
  const [form, setForm] = useState({ nombre: '', clave: '', plazoMin: '', plazoMax: '', montoMin: '', montoMax: '', tasa: '', frecuencia: 'Semanal', comisionApertura: '', activo: true });

  const inp = { border: '1.5px solid #dceaf8', borderRadius: '9px', padding: '10px 13px', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', color: '#1a3d6e', outline: 'none', background: '#fafcff', boxSizing: 'border-box', width: '100%' };
  const lbl = (t) => <label style={{ fontSize: '11px', fontWeight: '600', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' }}>{t}</label>;

  const resetForm = () => setForm({ nombre: '', clave: '', plazoMin: '', plazoMax: '', montoMin: '', montoMax: '', tasa: '', frecuencia: 'Semanal', comisionApertura: '', activo: true });
  const abrirNuevo = () => { resetForm(); setModal('nuevo'); };
  const abrirEditar = (p) => { setSeleccionado(p); setForm({ ...p }); setModal('editar'); };
  const abrirVer = (p) => { setSeleccionado(p); setModal('ver'); };
  const abrirEliminar = (p) => { setSeleccionado(p); setModal('eliminar'); };

  const guardar = () => {
    if (!form.nombre || !form.clave) return;
    if (modal === 'nuevo') {
      setProductos(prev => [...prev, { ...form, id: Date.now() }]);
    } else {
      setProductos(prev => prev.map(p => p.id === seleccionado.id ? { ...form, id: p.id } : p));
    }
    setModal(null);
  };

  const eliminar = () => {
    setProductos(prev => prev.filter(p => p.id !== seleccionado.id));
    setModal(null);
  };

  const filtrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.clave.toLowerCase().includes(busqueda.toLowerCase())
  );

  const frecuencias = ['Diario', 'Semanal', 'Quincenal', 'Mensual'];

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto' }}>

      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #dceaf8', padding: '20px 24px', marginBottom: '20px', boxShadow: '0 2px 12px rgba(14,80,160,0.05)', display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          {lbl('Buscar producto')}
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#90aac8', pointerEvents: 'none' }} />
            <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Nombre o clave..." style={{ ...inp, paddingLeft: '38px' }} />
          </div>
        </div>
        <button onClick={abrirNuevo} style={{ background: '#0e50a0', border: 'none', borderRadius: '10px', padding: '11px 20px', fontSize: '13px', fontWeight: '600', color: '#fff', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 14px rgba(14,80,160,0.28)', whiteSpace: 'nowrap' }}>
          <Plus size={15} /> Nuevo producto
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #dceaf8', boxShadow: '0 2px 12px rgba(14,80,160,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f6ff', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', background: '#e8f2fc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CreditCard size={16} color="#0e50a0" /></div>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', fontWeight: '700', color: '#0a2d5e' }}>Productos de credito</span>
          <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#90aac8' }}>{filtrados.length} producto{filtrados.length !== 1 ? 's' : ''}</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f4f8fd' }}>
                {['Clave', 'Nombre', 'Plazo (sem)', 'Monto', 'Tasa (%)', 'Frecuencia', 'Comision', 'Estado', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr><td colSpan={9} style={{ padding: '52px', textAlign: 'center', color: '#90aac8', fontSize: '13px' }}>
                  <CreditCard size={28} color="#dceaf8" style={{ display: 'block', margin: '0 auto 12px' }} />
                  Sin productos de credito. Crea el primero con el boton de arriba.
                </td></tr>
              ) : filtrados.map((p, i) => (
                <tr key={p.id} style={{ borderTop: '1px solid #f0f6ff', background: i % 2 === 0 ? '#fff' : '#fafcff' }}>
                  <td style={{ padding: '12px 14px', fontSize: '12px', fontWeight: '700', color: '#0e50a0', fontFamily: 'monospace' }}>{p.clave}</td>
                  <td style={{ padding: '12px 14px', fontSize: '13px', color: '#1a3d6e', fontWeight: '500' }}>{p.nombre}</td>
                  <td style={{ padding: '12px 14px', fontSize: '13px', color: '#1a3d6e' }}>{p.plazoMin && p.plazoMax ? `${p.plazoMin}–${p.plazoMax}` : p.plazoMin || p.plazoMax || '—'}</td>
                  <td style={{ padding: '12px 14px', fontSize: '12px', color: '#1a3d6e' }}>{p.montoMin && p.montoMax ? `$${Number(p.montoMin).toLocaleString('es-MX')}–$${Number(p.montoMax).toLocaleString('es-MX')}` : '—'}</td>
                  <td style={{ padding: '12px 14px', fontSize: '13px', color: '#1a3d6e' }}>{p.tasa}%</td>
                  <td style={{ padding: '12px 14px', fontSize: '13px', color: '#1a3d6e' }}>{p.frecuencia}</td>
                  <td style={{ padding: '12px 14px', fontSize: '13px', color: '#1a3d6e' }}>{p.comisionApertura ? `${p.comisionApertura}%` : '—'}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: p.activo ? '#dcfce7' : '#fee2e2', color: p.activo ? '#166534' : '#dc2626' }}>
                      {p.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => abrirVer(p)} style={{ border: '1px solid #dceaf8', background: '#f4f8fd', borderRadius: '7px', padding: '5px 8px', cursor: 'pointer', color: '#0e50a0' }} title="Ver"><Eye size={13} /></button>
                      <button onClick={() => abrirEditar(p)} style={{ border: '1px solid #dceaf8', background: '#f4f8fd', borderRadius: '7px', padding: '5px 8px', cursor: 'pointer', color: '#0e50a0' }} title="Editar"><Pencil size={13} /></button>
                      <button onClick={() => abrirEliminar(p)} style={{ border: '1px solid #fee2e2', background: '#fff5f5', borderRadius: '7px', padding: '5px 8px', cursor: 'pointer', color: '#dc2626' }} title="Eliminar"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal nuevo/editar */}
      {(modal === 'nuevo' || modal === 'editar') && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(10,45,94,0.42)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div style={{ background: '#fff', borderRadius: '22px', width: '100%', maxWidth: '540px', boxShadow: '0 32px 80px rgba(14,80,160,0.2)', overflow: 'hidden' }}>
            <div style={{ background: '#fff', borderBottom: '1px solid #dceaf8', padding: '22px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '38px', height: '38px', background: '#e8f2fc', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CreditCard size={18} color="#0e50a0" /></div>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: '700', color: '#0a2d5e' }}>{modal === 'nuevo' ? 'Nuevo producto' : 'Editar producto'}</span>
              </div>
              <button onClick={() => setModal(null)} style={{ background: '#f0f6ff', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#4a6a94' }}><X size={16} /></button>
            </div>
            <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>{lbl('Clave')}<input value={form.clave} onChange={e => setForm(p => ({ ...p, clave: e.target.value }))} placeholder="Ej. FIEM-27" style={inp} /></div>
                <div>{lbl('Nombre')}<input value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} placeholder="Nombre del producto" style={inp} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>{lbl('Plazo minimo (sem)')}<input type="number" value={form.plazoMin} onChange={e => setForm(p => ({ ...p, plazoMin: e.target.value }))} placeholder="0" style={inp} /></div>
                <div>{lbl('Plazo maximo (sem)')}<input type="number" value={form.plazoMax} onChange={e => setForm(p => ({ ...p, plazoMax: e.target.value }))} placeholder="0" style={inp} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>{lbl('Monto minimo')}<input type="number" value={form.montoMin} onChange={e => setForm(p => ({ ...p, montoMin: e.target.value }))} placeholder="0" style={inp} /></div>
                <div>{lbl('Monto maximo')}<input type="number" value={form.montoMax} onChange={e => setForm(p => ({ ...p, montoMax: e.target.value }))} placeholder="0" style={inp} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>{lbl('Tasa (%)')}<input type="number" value={form.tasa} onChange={e => setForm(p => ({ ...p, tasa: e.target.value }))} placeholder="0" style={inp} /></div>
                <div>{lbl('Frecuencia')}<select value={form.frecuencia} onChange={e => setForm(p => ({ ...p, frecuencia: e.target.value }))} style={{ ...inp, cursor: 'pointer' }}>{frecuencias.map(x => <option key={x}>{x}</option>)}</select></div>
                <div>{lbl('Comision apertura (%)')}<input type="number" value={form.comisionApertura} onChange={e => setForm(p => ({ ...p, comisionApertura: e.target.value }))} placeholder="0" style={inp} /></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="checkbox" id="activo-cred" checked={form.activo} onChange={e => setForm(p => ({ ...p, activo: e.target.checked }))} style={{ width: '16px', height: '16px', accentColor: '#0e50a0', cursor: 'pointer' }} />
                <label htmlFor="activo-cred" style={{ fontSize: '13px', color: '#1a3d6e', cursor: 'pointer' }}>Producto activo</label>
              </div>
            </div>
            <div style={{ padding: '0 28px 24px', display: 'flex', gap: '10px' }}>
              <button onClick={() => setModal(null)} style={{ flex: 1, padding: '12px', border: '1.5px solid #dceaf8', background: '#fff', borderRadius: '11px', fontFamily: 'DM Sans, sans-serif', fontSize: '14px', fontWeight: '600', color: '#4a6a94', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={guardar} style={{ flex: 2, padding: '12px', border: 'none', background: '#0e50a0', borderRadius: '11px', fontFamily: 'DM Sans, sans-serif', fontSize: '14px', fontWeight: '600', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(14,80,160,0.28)' }}>
                <Save size={15} /> Guardar producto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal ver */}
      {modal === 'ver' && seleccionado && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(10,45,94,0.42)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div style={{ background: '#fff', borderRadius: '22px', width: '100%', maxWidth: '460px', boxShadow: '0 32px 80px rgba(14,80,160,0.2)', overflow: 'hidden' }}>
            <div style={{ background: '#fff', borderBottom: '1px solid #dceaf8', padding: '22px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: '700', color: '#0a2d5e' }}>{seleccionado.nombre}</span>
              <button onClick={() => setModal(null)} style={{ background: '#f0f6ff', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#4a6a94' }}><X size={16} /></button>
            </div>
            <div style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                ['Clave', seleccionado.clave],
                ['Tasa', `${seleccionado.tasa}%`],
                ['Frecuencia', seleccionado.frecuencia],
                ['Comision apertura', seleccionado.comisionApertura ? `${seleccionado.comisionApertura}%` : '—'],
                ['Plazo', `${seleccionado.plazoMin || '—'}–${seleccionado.plazoMax || '—'} sem`],
                ['Monto', seleccionado.montoMin && seleccionado.montoMax ? `$${Number(seleccionado.montoMin).toLocaleString('es-MX')} – $${Number(seleccionado.montoMax).toLocaleString('es-MX')}` : '—'],
              ].map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '4px' }}>{k}</div>
                  <div style={{ fontSize: '14px', color: '#1a3d6e', fontWeight: '500' }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: '0 28px 24px' }}>
              <button onClick={() => abrirEditar(seleccionado)} style={{ width: '100%', padding: '12px', border: 'none', background: '#0e50a0', borderRadius: '11px', fontFamily: 'DM Sans, sans-serif', fontSize: '14px', fontWeight: '600', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Pencil size={14} /> Editar producto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal eliminar */}
      {modal === 'eliminar' && seleccionado && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(10,45,94,0.42)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div style={{ background: '#fff', borderRadius: '22px', width: '100%', maxWidth: '400px', boxShadow: '0 32px 80px rgba(14,80,160,0.2)', overflow: 'hidden' }}>
            <div style={{ background: '#fff', borderBottom: '1px solid #dceaf8', padding: '22px 28px' }}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: '700', color: '#0a2d5e' }}>Eliminar producto</span>
            </div>
            <div style={{ padding: '24px 28px', fontSize: '14px', color: '#4a6a94' }}>
              Esta accion eliminara el producto <strong style={{ color: '#0a2d5e' }}>{seleccionado.nombre}</strong>. Esta accion no se puede deshacer.
            </div>
            <div style={{ padding: '0 28px 24px', display: 'flex', gap: '10px' }}>
              <button onClick={() => setModal(null)} style={{ flex: 1, padding: '12px', border: '1.5px solid #dceaf8', background: '#fff', borderRadius: '11px', fontFamily: 'DM Sans, sans-serif', fontSize: '14px', fontWeight: '600', color: '#4a6a94', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={eliminar} style={{ flex: 1, padding: '12px', border: 'none', background: '#dc2626', borderRadius: '11px', fontFamily: 'DM Sans, sans-serif', fontSize: '14px', fontWeight: '600', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Trash2 size={14} /> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}