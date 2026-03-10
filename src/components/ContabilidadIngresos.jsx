'use client';
import { useState } from 'react';
import { TrendingUp, TrendingDown, Plus, Search, Eye, X, Save, Trash2 } from 'lucide-react';

function formatMoney(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 }).format(n || 0);
}

const TIPOS     = ['Ingreso', 'Egreso'];
const CONCEPTOS_INGRESO = ['Comision de apertura', 'Intereses cobrados', 'Abono a capital', 'Deposito ahorro', 'Otros ingresos'];
const CONCEPTOS_EGRESO  = ['Salarios', 'Renta', 'Servicios', 'Papeleria', 'Gastos operativos', 'Otros egresos'];
const METODOS   = ['Efectivo', 'Transferencia', 'Deposito bancario', 'Cheque'];
const INITIAL   = { tipo: '', concepto: '', monto: '', metodo: '', fecha: '', referencia: '', descripcion: '' };

export default function ContabilidadIngresos() {
  const [movimientos, setMovimientos] = useState([]);
  const [showForm, setShowForm]       = useState(false);
  const [form, setForm]               = useState(INITIAL);
  const [errors, setErrors]           = useState({});
  const [busqueda, setBusqueda]       = useState('');
  const [filtroTipo, setFiltroTipo]   = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [detalle, setDetalle]         = useState(null);
  const [confirmDel, setConfirmDel]   = useState(null);

  const change = (k, v) => { setForm(p => ({ ...p, [k]: v })); if (errors[k]) setErrors(p => ({ ...p, [k]: false })); };

  const validate = () => {
    const req = ['tipo', 'concepto', 'monto', 'fecha'];
    const errs = {};
    req.forEach(k => { if (!form[k]) errs[k] = true; });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    setMovimientos(p => [...p, { ...form, id: Date.now() }]);
    setShowForm(false);
    setForm(INITIAL);
    setErrors({});
  };

  const handleDelete = (id) => { setMovimientos(p => p.filter(m => m.id !== id)); setConfirmDel(null); setDetalle(null); };

  const filtrados = movimientos.filter(m =>
    (m.concepto?.toLowerCase().includes(busqueda.toLowerCase()) || m.referencia?.includes(busqueda)) &&
    (!filtroTipo || m.tipo === filtroTipo) &&
    (!filtroFecha || m.fecha === filtroFecha)
  );

  const totalIngresos = movimientos.filter(m => m.tipo === 'Ingreso').reduce((s, m) => s + Number(m.monto || 0), 0);
  const totalEgresos  = movimientos.filter(m => m.tipo === 'Egreso').reduce((s, m) => s + Number(m.monto || 0), 0);
  const saldo         = totalIngresos - totalEgresos;

  const inp = (err) => ({ border: `1.5px solid ${err ? '#ef4444' : '#dceaf8'}`, borderRadius: '9px', padding: '10px 13px', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', color: '#1a3d6e', outline: 'none', width: '100%', background: '#fafcff', boxSizing: 'border-box' });
  const lbl = (t, req) => <label style={{ fontSize: '11px', fontWeight: '600', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' }}>{t}{req && <span style={{ color: '#ef4444', marginLeft: '3px' }}>*</span>}</label>;

  const conceptos = form.tipo === 'Ingreso' ? CONCEPTOS_INGRESO : form.tipo === 'Egreso' ? CONCEPTOS_EGRESO : [];

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>

      {/* Resumen */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
        {[
          { label: 'Total ingresos', val: totalIngresos, color: '#166534', bg: '#dcfce7', Icon: TrendingUp },
          { label: 'Total egresos',  val: totalEgresos,  color: '#991b1b', bg: '#fee2e2', Icon: TrendingDown },
          { label: 'Saldo neto',     val: saldo,         color: saldo >= 0 ? '#166534' : '#991b1b', bg: saldo >= 0 ? '#dcfce7' : '#fee2e2', Icon: saldo >= 0 ? TrendingUp : TrendingDown },
        ].map(({ label, val, color, bg, Icon }) => (
          <div key={label} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #dceaf8', boxShadow: '0 2px 12px rgba(14,80,160,0.05)', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '44px', height: '44px', background: bg, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={20} color={color} />
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '600', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color, fontFamily: "'Cormorant Garamond', serif", marginTop: '2px' }}>{formatMoney(val)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros + agregar */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #dceaf8', boxShadow: '0 2px 12px rgba(14,80,160,0.05)', padding: '20px 24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '160px' }}>
            <label style={{ fontSize: '11px', fontWeight: '600', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' }}>Buscar</label>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#90aac8', pointerEvents: 'none' }} />
              <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Concepto o referencia..." style={{ width: '100%', border: '1.5px solid #dceaf8', borderRadius: '9px', padding: '10px 13px 10px 38px', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', color: '#1a3d6e', outline: 'none', background: '#fafcff', boxSizing: 'border-box' }} />
            </div>
          </div>
          <div style={{ minWidth: '140px' }}>
            <label style={{ fontSize: '11px', fontWeight: '600', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' }}>Tipo</label>
            <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} style={{ border: '1.5px solid #dceaf8', borderRadius: '9px', padding: '10px 13px', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', color: '#1a3d6e', outline: 'none', background: '#fafcff', cursor: 'pointer', width: '100%', boxSizing: 'border-box' }}>
              <option value="">Todos</option>
              {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ minWidth: '150px' }}>
            <label style={{ fontSize: '11px', fontWeight: '600', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' }}>Fecha</label>
            <input type="date" value={filtroFecha} onChange={e => setFiltroFecha(e.target.value)} style={{ border: '1.5px solid #dceaf8', borderRadius: '9px', padding: '10px 13px', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', color: '#1a3d6e', outline: 'none', background: '#fafcff', width: '100%', boxSizing: 'border-box' }} />
          </div>
          <button onClick={() => { setForm(INITIAL); setErrors({}); setShowForm(true); }} style={{ background: '#0e50a0', border: 'none', borderRadius: '10px', padding: '11px 22px', fontSize: '13px', fontWeight: '600', color: '#fff', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '7px', boxShadow: '0 4px 14px rgba(14,80,160,0.28)', whiteSpace: 'nowrap' }}>
            <Plus size={15} /> Registrar movimiento
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #dceaf8', boxShadow: '0 2px 12px rgba(14,80,160,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f6ff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', fontWeight: '700', color: '#0a2d5e' }}>Ingresos y egresos</span>
          <span style={{ fontSize: '12px', color: '#90aac8' }}>{filtrados.length} registro(s)</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f4f8fd' }}>
                {['Fecha', 'Tipo', 'Concepto', 'Monto', 'Metodo', 'Referencia', ''].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#90aac8', fontSize: '13px' }}>
                  <TrendingUp size={28} color="#dceaf8" style={{ display: 'block', margin: '0 auto 12px' }} />
                  No hay movimientos registrados
                </td></tr>
              ) : filtrados.map((m, i) => (
                <tr key={m.id} style={{ borderTop: '1px solid #f0f6ff', background: i % 2 === 0 ? '#fff' : '#fafcff' }}>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4a6a94' }}>{m.fecha}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: m.tipo === 'Ingreso' ? '#dcfce7' : '#fee2e2', color: m.tipo === 'Ingreso' ? '#166534' : '#991b1b' }}>
                      {m.tipo === 'Ingreso' ? <TrendingUp size={11} /> : <TrendingDown size={11} />}{m.tipo}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0a2d5e' }}>{m.concepto}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: m.tipo === 'Ingreso' ? '#166534' : '#991b1b' }}>{formatMoney(m.monto)}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4a6a94' }}>{m.metodo || '—'}</td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', fontFamily: 'monospace', color: '#4a6a94' }}>{m.referencia || '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => setDetalle(m)} style={{ background: '#e8f2fc', border: 'none', borderRadius: '7px', padding: '7px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600', color: '#0e50a0', fontFamily: 'DM Sans, sans-serif' }}><Eye size={13} /> Ver</button>
                      <button onClick={() => setConfirmDel(m)} style={{ background: '#fee2e2', border: 'none', borderRadius: '7px', padding: '7px 10px', cursor: 'pointer', color: '#dc2626', display: 'flex', alignItems: 'center' }}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal registrar */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(10,45,94,0.45)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '520px', boxShadow: '0 32px 80px rgba(14,80,160,0.2)', overflow: 'hidden' }}>
            <div style={{ borderBottom: '1px solid #dceaf8', padding: '22px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', fontWeight: '700', color: '#0a2d5e' }}>Registrar movimiento</div>
              <button onClick={() => setShowForm(false)} style={{ background: '#f0f6ff', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#4a6a94' }}><X size={16} /></button>
            </div>
            <div style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                {lbl('Tipo', true)}
                <select value={form.tipo} onChange={e => change('tipo', e.target.value)} style={{ ...inp(errors.tipo), cursor: 'pointer' }}>
                  <option value="">Seleccionar...</option>
                  {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.tipo && <span style={{ color: '#ef4444', fontSize: '11px' }}>Requerido</span>}
              </div>
              <div>
                {lbl('Concepto', true)}
                <select value={form.concepto} onChange={e => change('concepto', e.target.value)} style={{ ...inp(errors.concepto), cursor: 'pointer' }} disabled={!form.tipo}>
                  <option value="">Seleccionar...</option>
                  {conceptos.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.concepto && <span style={{ color: '#ef4444', fontSize: '11px' }}>Requerido</span>}
              </div>
              <div>
                {lbl('Monto (MXN)', true)}
                <input type="number" value={form.monto} onChange={e => change('monto', e.target.value)} placeholder="0.00" style={inp(errors.monto)} />
                {errors.monto && <span style={{ color: '#ef4444', fontSize: '11px' }}>Requerido</span>}
              </div>
              <div>
                {lbl('Fecha', true)}
                <input type="date" value={form.fecha} onChange={e => change('fecha', e.target.value)} style={inp(errors.fecha)} />
                {errors.fecha && <span style={{ color: '#ef4444', fontSize: '11px' }}>Requerido</span>}
              </div>
              <div>
                {lbl('Metodo de pago')}
                <select value={form.metodo} onChange={e => change('metodo', e.target.value)} style={{ ...inp(false), cursor: 'pointer' }}>
                  <option value="">Seleccionar...</option>
                  {METODOS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                {lbl('Referencia')}
                <input value={form.referencia} onChange={e => change('referencia', e.target.value)} placeholder="Num. referencia" style={inp(false)} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                {lbl('Descripcion')}
                <textarea value={form.descripcion} onChange={e => change('descripcion', e.target.value)} placeholder="Descripcion del movimiento..." rows={2} style={{ ...inp(false), resize: 'vertical' }} />
              </div>
            </div>
            <div style={{ padding: '0 28px 24px', display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: '11px', border: '1.5px solid #dceaf8', background: '#fff', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#4a6a94', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Cancelar</button>
              <button onClick={handleSave} style={{ flex: 2, padding: '11px', border: 'none', background: '#0e50a0', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#fff', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', boxShadow: '0 4px 14px rgba(14,80,160,0.28)' }}>
                <Save size={14} /> Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal detalle */}
      {detalle && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(10,45,94,0.45)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '440px', boxShadow: '0 32px 80px rgba(14,80,160,0.2)', overflow: 'hidden' }}>
            <div style={{ borderBottom: '1px solid #dceaf8', padding: '22px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', fontWeight: '700', color: '#0a2d5e' }}>{detalle.concepto}</div>
              <button onClick={() => setDetalle(null)} style={{ background: '#f0f6ff', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#4a6a94' }}><X size={16} /></button>
            </div>
            <div style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { l: 'Tipo',       v: detalle.tipo },
                { l: 'Monto',      v: formatMoney(detalle.monto) },
                { l: 'Fecha',      v: detalle.fecha },
                { l: 'Metodo',     v: detalle.metodo || '—' },
                { l: 'Referencia', v: detalle.referencia || '—' },
              ].map(({ l, v }) => (
                <div key={l}>
                  <div style={{ fontSize: '11px', color: '#90aac8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '4px' }}>{l}</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#0a2d5e' }}>{v}</div>
                </div>
              ))}
              {detalle.descripcion && (
                <div style={{ gridColumn: '1/-1' }}>
                  <div style={{ fontSize: '11px', color: '#90aac8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '4px' }}>Descripcion</div>
                  <div style={{ fontSize: '13px', color: '#4a6a94', background: '#f4f8fd', borderRadius: '8px', padding: '10px 14px' }}>{detalle.descripcion}</div>
                </div>
              )}
            </div>
            <div style={{ padding: '0 28px 24px', display: 'flex', gap: '10px' }}>
              <button onClick={() => setConfirmDel(detalle)} style={{ background: '#fee2e2', border: 'none', borderRadius: '10px', padding: '11px 18px', fontSize: '13px', fontWeight: '600', color: '#dc2626', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '6px' }}><Trash2 size={14} /> Eliminar</button>
              <button onClick={() => setDetalle(null)} style={{ flex: 1, padding: '11px', border: '1.5px solid #dceaf8', background: '#fff', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#4a6a94', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmar eliminar */}
      {confirmDel && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(10,45,94,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '360px', boxShadow: '0 32px 80px rgba(14,80,160,0.2)', overflow: 'hidden' }}>
            <div style={{ padding: '28px 28px 20px', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', background: '#fee2e2', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><Trash2 size={22} color="#dc2626" /></div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', fontWeight: '700', color: '#0a2d5e', marginBottom: '8px' }}>Eliminar movimiento</div>
              <div style={{ fontSize: '13px', color: '#90aac8' }}>¿Confirmas eliminar este registro? Esta accion no se puede deshacer.</div>
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