'use client';
import { useState } from 'react';
import { PiggyBank, Plus, Eye, X, Save, Trash2, Search } from 'lucide-react';

const INITIAL_FORM = { nombre: '', clave: '', tasa: '', plazoMin: '', plazoMax: '', montoMin: '', periocidad: '', activo: true, descripcion: '' };
const PERIOCIDADES = ['Mensual', 'Bimestral', 'Trimestral', 'Semestral', 'Anual', 'Al vencimiento'];

const PRODUCTOS_INICIALES = [
  { id: 1, nombre: 'AHORRO ORDINARIO',   clave: 'AHO-ORD',  tasa: 0,  plazoMin: 0,   plazoMax: 0,   montoMin: 0, periocidad: 'Mensual',       activo: true, descripcion: '' },
  { id: 2, nombre: 'AHORRO CRECEMAX',    clave: 'AHO-CRE',  tasa: 4,  plazoMin: 0,   plazoMax: 0,   montoMin: 0, periocidad: 'Mensual',       activo: true, descripcion: '' },
  { id: 3, nombre: 'Inversion 60',       clave: 'INV-60',   tasa: 60, plazoMin: 60,  plazoMax: 60,  montoMin: 0, periocidad: 'Al vencimiento',activo: true, descripcion: '' },
  { id: 4, nombre: 'Ahorro creceMax 120',clave: 'AHO-120',  tasa: 0,  plazoMin: 120, plazoMax: 120, montoMin: 0, periocidad: 'Mensual',       activo: true, descripcion: '' },
  { id: 5, nombre: 'AHORRO NOMINA',      clave: 'AHO-NOM',  tasa: 24, plazoMin: 0,   plazoMax: 0,   montoMin: 0, periocidad: 'Mensual',       activo: true, descripcion: '' },
];

export default function ConfigProductosAhorro() {
  const [productos, setProductos] = useState(PRODUCTOS_INICIALES);
  const [busqueda, setBusqueda]   = useState('');
  const [showForm, setShowForm]   = useState(false);
  const [editando, setEditando]   = useState(null);
  const [form, setForm]           = useState(INITIAL_FORM);
  const [errors, setErrors]       = useState({});
  const [confirmDel, setConfirmDel] = useState(null);

  const change = (k, v) => { setForm(p => ({ ...p, [k]: v })); if (errors[k]) setErrors(p => ({ ...p, [k]: false })); };

  const validate = () => {
    const req = ['nombre', 'clave'];
    const errs = {};
    req.forEach(k => { if (!form[k]) errs[k] = true; });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const openAdd  = () => { setForm(INITIAL_FORM); setEditando(null); setErrors({}); setShowForm(true); };
  const openEdit = (p) => { setForm({ ...p }); setEditando(p.id); setErrors({}); setShowForm(true); };

  const handleSave = () => {
    if (!validate()) return;
    if (editando) setProductos(prev => prev.map(p => p.id === editando ? { ...form, id: editando } : p));
    else setProductos(prev => [...prev, { ...form, id: Date.now() }]);
    setShowForm(false); setForm(INITIAL_FORM); setEditando(null);
  };

  const handleDelete = (id) => { setProductos(p => p.filter(x => x.id !== id)); setConfirmDel(null); };
  const filtrados = productos.filter(p => p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) || p.clave?.toLowerCase().includes(busqueda.toLowerCase()));

  const inp = (err) => ({ border: `1.5px solid ${err ? '#ef4444' : '#dceaf8'}`, borderRadius: '9px', padding: '10px 13px', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', color: '#1a3d6e', outline: 'none', width: '100%', background: '#fafcff', boxSizing: 'border-box' });
  const lbl = (t, req) => <label style={{ fontSize: '11px', fontWeight: '600', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' }}>{t}{req && <span style={{ color: '#ef4444', marginLeft: '3px' }}>*</span>}</label>;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #dceaf8', boxShadow: '0 2px 12px rgba(14,80,160,0.05)', padding: '20px 24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '11px', fontWeight: '600', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' }}>Buscar producto</label>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#90aac8', pointerEvents: 'none' }} />
              <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Nombre o clave..." style={{ width: '100%', border: '1.5px solid #dceaf8', borderRadius: '9px', padding: '10px 13px 10px 38px', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', color: '#1a3d6e', outline: 'none', background: '#fafcff', boxSizing: 'border-box' }} />
            </div>
          </div>
          <button onClick={openAdd} style={{ background: '#0891b2', border: 'none', borderRadius: '10px', padding: '11px 22px', fontSize: '13px', fontWeight: '600', color: '#fff', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '7px', boxShadow: '0 4px 14px rgba(8,145,178,0.28)', whiteSpace: 'nowrap' }}>
            <Plus size={15} /> Nuevo producto
          </button>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #dceaf8', boxShadow: '0 2px 12px rgba(14,80,160,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f6ff', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', background: '#e0f2fe', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PiggyBank size={16} color="#0891b2" /></div>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', fontWeight: '700', color: '#0a2d5e' }}>Productos de ahorro</span>
          <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#90aac8' }}>{filtrados.length} producto(s)</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f4f8fd' }}>
                {['Clave', 'Nombre', 'Tasa %', 'Plazo', 'Periocidad', 'Estatus', ''].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map((p, i) => (
                <tr key={p.id} style={{ borderTop: '1px solid #f0f6ff', background: i % 2 === 0 ? '#fff' : '#fafcff' }}>
                  <td style={{ padding: '12px 16px', fontSize: '12px', fontFamily: 'monospace', fontWeight: '700', color: '#0891b2' }}>{p.clave}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0a2d5e' }}>{p.nombre}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: '#166534' }}>{p.tasa}%</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4a6a94' }}>{p.plazoMin ? `${p.plazoMin}${p.plazoMax && p.plazoMax !== p.plazoMin ? ` - ${p.plazoMax}` : ''} dias` : '—'}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4a6a94' }}>{p.periocidad || '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: p.activo ? '#dcfce7' : '#f1f5f9', color: p.activo ? '#166534' : '#475569' }}>{p.activo ? 'Activo' : 'Inactivo'}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => openEdit(p)} style={{ background: '#e0f2fe', border: 'none', borderRadius: '7px', padding: '7px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600', color: '#0891b2', fontFamily: 'DM Sans, sans-serif' }}><Eye size={13} /> Ver</button>
                      <button onClick={() => setConfirmDel(p)} style={{ background: '#fee2e2', border: 'none', borderRadius: '7px', padding: '7px 10px', cursor: 'pointer', color: '#dc2626', display: 'flex', alignItems: 'center' }}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(10,45,94,0.45)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '520px', boxShadow: '0 32px 80px rgba(14,80,160,0.2)', overflow: 'hidden' }}>
            <div style={{ borderBottom: '1px solid #dceaf8', padding: '22px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', fontWeight: '700', color: '#0a2d5e' }}>{editando ? 'Editar producto' : 'Nuevo producto de ahorro'}</div>
              <button onClick={() => setShowForm(false)} style={{ background: '#f0f6ff', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#4a6a94' }}><X size={16} /></button>
            </div>
            <div style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>{lbl('Nombre', true)}<input value={form.nombre} onChange={e => change('nombre', e.target.value)} style={inp(errors.nombre)} />{errors.nombre && <span style={{ color: '#ef4444', fontSize: '11px' }}>Requerido</span>}</div>
              <div>{lbl('Clave', true)}<input value={form.clave} onChange={e => change('clave', e.target.value)} style={inp(errors.clave)} />{errors.clave && <span style={{ color: '#ef4444', fontSize: '11px' }}>Requerido</span>}</div>
              <div>{lbl('Tasa de interes (%)')}<input type="number" value={form.tasa} onChange={e => change('tasa', e.target.value)} placeholder="0" style={inp(false)} /></div>
              <div>{lbl('Periocidad')}<select value={form.periocidad} onChange={e => change('periocidad', e.target.value)} style={{ ...inp(false), cursor: 'pointer' }}><option value="">Seleccionar...</option>{PERIOCIDADES.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
              <div>{lbl('Plazo minimo (dias)')}<input type="number" value={form.plazoMin} onChange={e => change('plazoMin', e.target.value)} placeholder="0" style={inp(false)} /></div>
              <div>{lbl('Plazo maximo (dias)')}<input type="number" value={form.plazoMax} onChange={e => change('plazoMax', e.target.value)} placeholder="0" style={inp(false)} /></div>
              <div>{lbl('Monto minimo (MXN)')}<input type="number" value={form.montoMin} onChange={e => change('montoMin', e.target.value)} placeholder="0" style={inp(false)} /></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '20px' }}>
                <input type="checkbox" id="activoA" checked={form.activo} onChange={e => change('activo', e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#0891b2', cursor: 'pointer' }} />
                <label htmlFor="activoA" style={{ fontSize: '13px', fontWeight: '600', color: '#1a3d6e', cursor: 'pointer' }}>Producto activo</label>
              </div>
              <div style={{ gridColumn: '1/-1' }}>{lbl('Descripcion')}<textarea value={form.descripcion} onChange={e => change('descripcion', e.target.value)} rows={2} style={{ ...inp(false), resize: 'vertical' }} /></div>
            </div>
            <div style={{ padding: '0 28px 24px', display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: '11px', border: '1.5px solid #dceaf8', background: '#fff', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#4a6a94', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Cancelar</button>
              <button onClick={handleSave} style={{ flex: 2, padding: '11px', border: 'none', background: '#0891b2', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#fff', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', boxShadow: '0 4px 14px rgba(8,145,178,0.28)' }}><Save size={14} /> Guardar</button>
            </div>
          </div>
        </div>
      )}

      {confirmDel && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(10,45,94,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '360px', boxShadow: '0 32px 80px rgba(14,80,160,0.2)', overflow: 'hidden' }}>
            <div style={{ padding: '28px 28px 20px', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', background: '#fee2e2', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><Trash2 size={22} color="#dc2626" /></div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', fontWeight: '700', color: '#0a2d5e', marginBottom: '8px' }}>Eliminar producto</div>
              <div style={{ fontSize: '13px', color: '#90aac8' }}>¿Confirmas eliminar <strong style={{ color: '#0a2d5e' }}>{confirmDel.nombre}</strong>?</div>
            </div>
            <div style={{ padding: '0 28px 24px', display: 'flex', gap: '10px' }}>
              <button onClick={() => setConfirmDel(null)} style={{ flex: 1, padding: '11px', border: '1.5px solid #dceaf8', background: '#fff', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#4a6a94', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Cancelar</button>
              <button onClick={() => handleDelete(confirmDel.id)} style={{ flex: 1, padding: '11px', border: 'none', background: '#dc2626', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#fff', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}