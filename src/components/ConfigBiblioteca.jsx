'use client';
import { useState } from 'react';
import { BookOpen, Plus, Search, Eye, Trash2, X, Save, FileText, Download } from 'lucide-react';

const CATEGORIAS = ['Contrato', 'Pagare', 'Reglamento', 'Formato', 'Circular', 'Otro'];
const INITIAL_FORM = { nombre: '', categoria: '', version: '', descripcion: '', activo: true };

export default function ConfigBiblioteca() {
  const [documentos, setDocumentos]   = useState([]);
  const [busqueda, setBusqueda]       = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [showForm, setShowForm]       = useState(false);
  const [form, setForm]               = useState(INITIAL_FORM);
  const [errors, setErrors]           = useState({});
  const [detalle, setDetalle]         = useState(null);
  const [confirmDel, setConfirmDel]   = useState(null);

  const change = (k, v) => { setForm(p => ({ ...p, [k]: v })); if (errors[k]) setErrors(p => ({ ...p, [k]: false })); };

  const validate = () => {
    const req = ['nombre', 'categoria'];
    const errs = {};
    req.forEach(k => { if (!form[k]) errs[k] = true; });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    setDocumentos(p => [...p, { ...form, id: Date.now(), fecha: new Date().toLocaleDateString('es-MX') }]);
    setShowForm(false); setForm(INITIAL_FORM); setErrors({});
  };

  const handleDelete = (id) => { setDocumentos(p => p.filter(d => d.id !== id)); setConfirmDel(null); setDetalle(null); };

  const filtrados = documentos.filter(d =>
    d.nombre?.toLowerCase().includes(busqueda.toLowerCase()) &&
    (!filtroCategoria || d.categoria === filtroCategoria)
  );

  const inp = (err) => ({ border: `1.5px solid ${err ? '#ef4444' : '#dceaf8'}`, borderRadius: '9px', padding: '10px 13px', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', color: '#1a3d6e', outline: 'none', width: '100%', background: '#fafcff', boxSizing: 'border-box' });
  const lbl = (t, req) => <label style={{ fontSize: '11px', fontWeight: '600', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' }}>{t}{req && <span style={{ color: '#ef4444', marginLeft: '3px' }}>*</span>}</label>;

  const categoriaBadge = (c) => {
    const map = { 'Contrato': '#0e50a0', 'Pagare': '#7c3aed', 'Reglamento': '#d97706', 'Formato': '#0891b2', 'Circular': '#166534', 'Otro': '#475569' };
    const color = map[c] || '#475569';
    return <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: `${color}18`, color }}>{c}</span>;
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Filtros + agregar */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #dceaf8', boxShadow: '0 2px 12px rgba(14,80,160,0.05)', padding: '20px 24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '180px' }}>
            <label style={{ fontSize: '11px', fontWeight: '600', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' }}>Buscar</label>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#90aac8', pointerEvents: 'none' }} />
              <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Nombre del documento..." style={{ width: '100%', border: '1.5px solid #dceaf8', borderRadius: '9px', padding: '10px 13px 10px 38px', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', color: '#1a3d6e', outline: 'none', background: '#fafcff', boxSizing: 'border-box' }} />
            </div>
          </div>
          <div style={{ minWidth: '160px' }}>
            <label style={{ fontSize: '11px', fontWeight: '600', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' }}>Categoria</label>
            <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)} style={{ border: '1.5px solid #dceaf8', borderRadius: '9px', padding: '10px 13px', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', color: '#1a3d6e', outline: 'none', background: '#fafcff', cursor: 'pointer', width: '100%', boxSizing: 'border-box' }}>
              <option value="">Todas</option>
              {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button onClick={() => { setForm(INITIAL_FORM); setErrors({}); setShowForm(true); }} style={{ background: '#0e50a0', border: 'none', borderRadius: '10px', padding: '11px 22px', fontSize: '13px', fontWeight: '600', color: '#fff', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '7px', boxShadow: '0 4px 14px rgba(14,80,160,0.28)', whiteSpace: 'nowrap' }}>
            <Plus size={15} /> Agregar documento
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #dceaf8', boxShadow: '0 2px 12px rgba(14,80,160,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f6ff', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', background: '#e8f2fc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BookOpen size={16} color="#0e50a0" /></div>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', fontWeight: '700', color: '#0a2d5e' }}>Biblioteca de documentos</span>
          <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#90aac8' }}>{filtrados.length} documento(s)</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f4f8fd' }}>
                {['Nombre', 'Categoria', 'Version', 'Fecha', 'Estatus', ''].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#90aac8', fontSize: '13px' }}>
                  <FileText size={28} color="#dceaf8" style={{ display: 'block', margin: '0 auto 12px' }} />
                  No hay documentos registrados
                </td></tr>
              ) : filtrados.map((d, i) => (
                <tr key={d.id} style={{ borderTop: '1px solid #f0f6ff', background: i % 2 === 0 ? '#fff' : '#fafcff' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={15} color="#90aac8" />
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#0a2d5e' }}>{d.nombre}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>{categoriaBadge(d.categoria)}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4a6a94' }}>{d.version || '1.0'}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4a6a94' }}>{d.fecha}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: d.activo ? '#dcfce7' : '#f1f5f9', color: d.activo ? '#166534' : '#475569' }}>{d.activo ? 'Activo' : 'Inactivo'}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => setDetalle(d)} style={{ background: '#e8f2fc', border: 'none', borderRadius: '7px', padding: '7px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600', color: '#0e50a0', fontFamily: 'DM Sans, sans-serif' }}><Eye size={13} /> Ver</button>
                      <button style={{ background: '#f4f8fd', border: 'none', borderRadius: '7px', padding: '7px 10px', cursor: 'pointer', color: '#4a6a94', display: 'flex', alignItems: 'center' }}><Download size={13} /></button>
                      <button onClick={() => setConfirmDel(d)} style={{ background: '#fee2e2', border: 'none', borderRadius: '7px', padding: '7px 10px', cursor: 'pointer', color: '#dc2626', display: 'flex', alignItems: 'center' }}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal agregar */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(10,45,94,0.45)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '500px', boxShadow: '0 32px 80px rgba(14,80,160,0.2)', overflow: 'hidden' }}>
            <div style={{ borderBottom: '1px solid #dceaf8', padding: '22px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', fontWeight: '700', color: '#0a2d5e' }}>Agregar documento</div>
              <button onClick={() => setShowForm(false)} style={{ background: '#f0f6ff', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#4a6a94' }}><X size={16} /></button>
            </div>
            <div style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ gridColumn: '1/-1' }}>{lbl('Nombre del documento', true)}<input value={form.nombre} onChange={e => change('nombre', e.target.value)} placeholder="Nombre del documento" style={inp(errors.nombre)} />{errors.nombre && <span style={{ color: '#ef4444', fontSize: '11px' }}>Requerido</span>}</div>
              <div>{lbl('Categoria', true)}<select value={form.categoria} onChange={e => change('categoria', e.target.value)} style={{ ...inp(errors.categoria), cursor: 'pointer' }}><option value="">Seleccionar...</option>{CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}</select>{errors.categoria && <span style={{ color: '#ef4444', fontSize: '11px' }}>Requerido</span>}</div>
              <div>{lbl('Version')}<input value={form.version} onChange={e => change('version', e.target.value)} placeholder="Ej. 1.0, 2.1" style={inp(false)} /></div>
              <div style={{ gridColumn: '1/-1' }}>{lbl('Descripcion')}<textarea value={form.descripcion} onChange={e => change('descripcion', e.target.value)} rows={2} placeholder="Descripcion del documento..." style={{ ...inp(false), resize: 'vertical' }} /></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="checkbox" id="activoD" checked={form.activo} onChange={e => change('activo', e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#0e50a0', cursor: 'pointer' }} />
                <label htmlFor="activoD" style={{ fontSize: '13px', fontWeight: '600', color: '#1a3d6e', cursor: 'pointer' }}>Documento activo</label>
              </div>
            </div>
            <div style={{ padding: '0 28px 24px', display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: '11px', border: '1.5px solid #dceaf8', background: '#fff', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#4a6a94', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Cancelar</button>
              <button onClick={handleSave} style={{ flex: 2, padding: '11px', border: 'none', background: '#0e50a0', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#fff', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', boxShadow: '0 4px 14px rgba(14,80,160,0.28)' }}><Save size={14} /> Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal detalle */}
      {detalle && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(10,45,94,0.45)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '420px', boxShadow: '0 32px 80px rgba(14,80,160,0.2)', overflow: 'hidden' }}>
            <div style={{ borderBottom: '1px solid #dceaf8', padding: '22px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={20} color="#0e50a0" />
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', fontWeight: '700', color: '#0a2d5e' }}>{detalle.nombre}</div>
              </div>
              <button onClick={() => setDetalle(null)} style={{ background: '#f0f6ff', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#4a6a94' }}><X size={16} /></button>
            </div>
            <div style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {[{ l: 'Categoria', v: detalle.categoria }, { l: 'Version', v: detalle.version || '1.0' }, { l: 'Fecha', v: detalle.fecha }, { l: 'Estatus', v: detalle.activo ? 'Activo' : 'Inactivo' }].map(({ l, v }) => (
                <div key={l}><div style={{ fontSize: '11px', color: '#90aac8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '4px' }}>{l}</div><div style={{ fontSize: '14px', fontWeight: '600', color: '#0a2d5e' }}>{v}</div></div>
              ))}
              {detalle.descripcion && <div style={{ gridColumn: '1/-1' }}><div style={{ fontSize: '11px', color: '#90aac8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '4px' }}>Descripcion</div><div style={{ fontSize: '13px', color: '#4a6a94', background: '#f4f8fd', borderRadius: '8px', padding: '10px 14px' }}>{detalle.descripcion}</div></div>}
            </div>
            <div style={{ padding: '0 28px 24px', display: 'flex', gap: '10px' }}>
              <button onClick={() => setConfirmDel(detalle)} style={{ background: '#fee2e2', border: 'none', borderRadius: '10px', padding: '11px 18px', fontSize: '13px', fontWeight: '600', color: '#dc2626', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '6px' }}><Trash2 size={14} /> Eliminar</button>
              <button onClick={() => setDetalle(null)} style={{ flex: 1, padding: '11px', border: '1.5px solid #dceaf8', background: '#fff', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#4a6a94', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {confirmDel && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(10,45,94,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '360px', boxShadow: '0 32px 80px rgba(14,80,160,0.2)', overflow: 'hidden' }}>
            <div style={{ padding: '28px 28px 20px', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', background: '#fee2e2', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><Trash2 size={22} color="#dc2626" /></div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', fontWeight: '700', color: '#0a2d5e', marginBottom: '8px' }}>Eliminar documento</div>
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