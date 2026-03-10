'use client';
import { useState } from 'react';
import { Map, Plus, Eye, X, Save, Trash2, Search } from 'lucide-react';

const GERENCIAS   = ['MATRIZ (01)', 'Zumpango (02)', 'TIZAYUCA (03)'];
const INITIAL_FORM = { nombre: '', clave: '', gerencia: '', municipio: '', descripcion: '', activa: true };

export default function GerenciasRutas() {
  const [rutas, setRutas]               = useState([]);
  const [showAdd, setShowAdd]           = useState(false);
  const [form, setForm]                 = useState(INITIAL_FORM);
  const [errors, setErrors]             = useState({});
  const [seleccionada, setSeleccionada] = useState(null);
  const [busqueda, setBusqueda]         = useState('');
  const [filtroGer, setFiltroGer]       = useState('');
  const [confirmDel, setConfirmDel]     = useState(null);

  const change = (k, v) => { setForm(p => ({ ...p, [k]: v })); if (errors[k]) setErrors(p => ({ ...p, [k]: false })); };

  const validate = () => {
    const req = ['nombre', 'clave', 'gerencia'];
    const errs = {};
    req.forEach(k => { if (!form[k]) errs[k] = true; });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAdd = () => {
    if (!validate()) return;
    setRutas(p => [...p, { ...form, id: Date.now() }]);
    setForm(INITIAL_FORM);
    setShowAdd(false);
    setErrors({});
  };

  const handleDelete = (id) => {
    setRutas(p => p.filter(r => r.id !== id));
    setConfirmDel(null);
    if (seleccionada?.id === id) setSeleccionada(null);
  };

  const filtradas = rutas.filter(r =>
    (r.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      r.clave?.toLowerCase().includes(busqueda.toLowerCase())) &&
    (!filtroGer || r.gerencia === filtroGer)
  );

  const inp = (err) => ({
    border: `1.5px solid ${err ? '#ef4444' : '#dceaf8'}`, borderRadius: '9px',
    padding: '10px 13px', fontSize: '13px', fontFamily: 'DM Sans, sans-serif',
    color: '#1a3d6e', outline: 'none', width: '100%', background: '#fafcff', boxSizing: 'border-box',
  });
  const lbl = (t, req) => (
    <label style={{ fontSize: '11px', fontWeight: '600', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' }}>
      {t}{req && <span style={{ color: '#ef4444', marginLeft: '3px' }}>*</span>}
    </label>
  );

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>

      {/* Filtros + agregar */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #dceaf8', boxShadow: '0 2px 12px rgba(14,80,160,0.05)', padding: '20px 24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '180px' }}>
            <label style={{ fontSize: '11px', fontWeight: '600', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' }}>Buscar</label>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#90aac8', pointerEvents: 'none' }} />
              <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Nombre o clave..." style={{ width: '100%', border: '1.5px solid #dceaf8', borderRadius: '9px', padding: '10px 13px 10px 38px', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', color: '#1a3d6e', outline: 'none', background: '#fafcff', boxSizing: 'border-box' }} />
            </div>
          </div>
          <div style={{ minWidth: '180px' }}>
            <label style={{ fontSize: '11px', fontWeight: '600', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' }}>Gerencia</label>
            <select value={filtroGer} onChange={e => setFiltroGer(e.target.value)} style={{ border: '1.5px solid #dceaf8', borderRadius: '9px', padding: '10px 13px', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', color: '#1a3d6e', outline: 'none', background: '#fafcff', cursor: 'pointer', width: '100%', boxSizing: 'border-box' }}>
              <option value="">Todas</option>
              {GERENCIAS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <button onClick={() => { setShowAdd(true); setForm(INITIAL_FORM); setErrors({}); }} style={{ background: '#0e50a0', border: 'none', borderRadius: '10px', padding: '11px 22px', fontSize: '13px', fontWeight: '600', color: '#fff', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '7px', boxShadow: '0 4px 14px rgba(14,80,160,0.28)', whiteSpace: 'nowrap' }}>
            <Plus size={15} /> Agregar ruta
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #dceaf8', boxShadow: '0 2px 12px rgba(14,80,160,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f6ff', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', background: '#e8f2fc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Map size={16} color="#0e50a0" />
          </div>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', fontWeight: '700', color: '#0a2d5e' }}>Rutas registradas</span>
          <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#90aac8' }}>{filtradas.length} registro(s)</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f4f8fd' }}>
                {['Clave', 'Nombre', 'Gerencia', 'Municipio', 'Estatus', ''].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtradas.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#90aac8', fontSize: '13px' }}>
                    <Map size={28} color="#dceaf8" style={{ display: 'block', margin: '0 auto 12px' }} />
                    No hay rutas registradas
                  </td>
                </tr>
              ) : filtradas.map((r, i) => (
                <tr key={r.id} style={{ borderTop: '1px solid #f0f6ff', background: i % 2 === 0 ? '#fff' : '#fafcff' }}>
                  <td style={{ padding: '12px 16px', fontSize: '12px', fontFamily: 'monospace', fontWeight: '700', color: '#0e50a0' }}>{r.clave}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0a2d5e' }}>{r.nombre}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4a6a94' }}>{r.gerencia}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4a6a94' }}>{r.municipio || '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: r.activa ? '#dcfce7' : '#f1f5f9', color: r.activa ? '#166534' : '#475569' }}>
                      {r.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => setSeleccionada(r)} style={{ background: '#e8f2fc', border: 'none', borderRadius: '7px', padding: '7px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600', color: '#0e50a0', fontFamily: 'DM Sans, sans-serif' }}>
                        <Eye size={13} /> Ver
                      </button>
                      <button onClick={() => setConfirmDel(r)} style={{ background: '#fee2e2', border: 'none', borderRadius: '7px', padding: '7px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#dc2626' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal agregar */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(10,45,94,0.45)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '520px', boxShadow: '0 32px 80px rgba(14,80,160,0.2)', overflow: 'hidden' }}>
            <div style={{ background: '#fff', borderBottom: '1px solid #dceaf8', padding: '22px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', background: '#e8f2fc', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Map size={20} color="#0e50a0" />
                </div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', fontWeight: '700', color: '#0a2d5e' }}>Nueva ruta</div>
              </div>
              <button onClick={() => setShowAdd(false)} style={{ background: '#f0f6ff', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#4a6a94' }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                {lbl('Nombre', true)}
                <input value={form.nombre} onChange={e => change('nombre', e.target.value)} placeholder="Nombre de la ruta" style={inp(errors.nombre)} />
                {errors.nombre && <span style={{ color: '#ef4444', fontSize: '11px' }}>Requerido</span>}
              </div>
              <div>
                {lbl('Clave', true)}
                <input value={form.clave} onChange={e => change('clave', e.target.value)} placeholder="Ej. R01, R02" style={inp(errors.clave)} />
                {errors.clave && <span style={{ color: '#ef4444', fontSize: '11px' }}>Requerido</span>}
              </div>
              <div>
                {lbl('Gerencia', true)}
                <select value={form.gerencia} onChange={e => change('gerencia', e.target.value)} style={{ ...inp(errors.gerencia), cursor: 'pointer' }}>
                  <option value="">Seleccionar...</option>
                  {GERENCIAS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                {errors.gerencia && <span style={{ color: '#ef4444', fontSize: '11px' }}>Requerido</span>}
              </div>
              <div>
                {lbl('Municipio')}
                <input value={form.municipio} onChange={e => change('municipio', e.target.value)} placeholder="Municipio" style={inp(false)} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                {lbl('Descripcion')}
                <textarea value={form.descripcion} onChange={e => change('descripcion', e.target.value)} placeholder="Descripcion de la ruta..." rows={2} style={{ ...inp(false), resize: 'vertical' }} />
              </div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="checkbox" id="activa" checked={form.activa} onChange={e => change('activa', e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#0e50a0', cursor: 'pointer' }} />
                <label htmlFor="activa" style={{ fontSize: '13px', fontWeight: '600', color: '#1a3d6e', cursor: 'pointer' }}>Ruta activa</label>
              </div>
            </div>
            <div style={{ padding: '0 28px 24px', display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowAdd(false)} style={{ flex: 1, padding: '11px', border: '1.5px solid #dceaf8', background: '#fff', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#4a6a94', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Cancelar</button>
              <button onClick={handleAdd} style={{ flex: 2, padding: '11px', border: 'none', background: '#0e50a0', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#fff', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', boxShadow: '0 4px 14px rgba(14,80,160,0.28)' }}>
                <Save size={14} /> Guardar ruta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal detalle */}
      {seleccionada && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(10,45,94,0.45)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '440px', boxShadow: '0 32px 80px rgba(14,80,160,0.2)', overflow: 'hidden' }}>
            <div style={{ background: '#fff', borderBottom: '1px solid #dceaf8', padding: '22px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', background: '#e8f2fc', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Map size={20} color="#0e50a0" />
                </div>
                <div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', fontWeight: '700', color: '#0a2d5e' }}>{seleccionada.nombre}</div>
                  <div style={{ fontSize: '12px', color: '#90aac8', marginTop: '2px' }}>Clave: {seleccionada.clave}</div>
                </div>
              </div>
              <button onClick={() => setSeleccionada(null)} style={{ background: '#f0f6ff', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#4a6a94' }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { label: 'Clave',      val: seleccionada.clave },
                { label: 'Gerencia',   val: seleccionada.gerencia },
                { label: 'Municipio',  val: seleccionada.municipio || '—' },
                { label: 'Estatus',    val: seleccionada.activa ? 'Activa' : 'Inactiva' },
                { label: 'Descripcion',val: seleccionada.descripcion || '—' },
              ].map(({ label, val }) => (
                <div key={label} style={{ gridColumn: label === 'Descripcion' ? '1 / -1' : 'auto' }}>
                  <div style={{ fontSize: '11px', color: '#90aac8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '4px' }}>{label}</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#0a2d5e' }}>{val}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: '0 28px 24px' }}>
              <button onClick={() => setSeleccionada(null)} style={{ width: '100%', padding: '11px', border: '1.5px solid #dceaf8', background: '#fff', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#4a6a94', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmar eliminar */}
      {confirmDel && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(10,45,94,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '360px', boxShadow: '0 32px 80px rgba(14,80,160,0.2)', overflow: 'hidden' }}>
            <div style={{ padding: '28px 28px 20px', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', background: '#fee2e2', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Trash2 size={22} color="#dc2626" />
              </div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', fontWeight: '700', color: '#0a2d5e', marginBottom: '8px' }}>Eliminar ruta</div>
              <div style={{ fontSize: '13px', color: '#90aac8' }}>¿Confirmas eliminar <strong style={{ color: '#0a2d5e' }}>{confirmDel.nombre}</strong>? Esta accion no se puede deshacer.</div>
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