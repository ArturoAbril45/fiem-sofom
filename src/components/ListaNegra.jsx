'use client';
import { useState } from 'react';
import { Search, AlertCircle, UserX, X, Plus } from 'lucide-react';

function formatMoney(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(n);
}

export default function ListaNegra() {
  const [busqueda, setBusqueda]           = useState('');
  const [lista, setLista]                 = useState([]);
  const [modal, setModal]                 = useState(false);
  const [confirmarElim, setConfirmarElim] = useState(null);
  const [form, setForm]                   = useState({ nombre: '', curp: '', motivo: '', monto: '' });

  const filtrados = lista.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.curp.toLowerCase().includes(busqueda.toLowerCase())
  );

  const agregar = () => {
    if (!form.nombre || !form.curp || !form.motivo) return;
    setLista(p => [...p, { id: Date.now(), ...form, monto: Number(form.monto) || 0, fechaIngreso: new Date().toISOString().slice(0, 10) }]);
    setForm({ nombre: '', curp: '', motivo: '', monto: '' });
    setModal(false);
  };

  const eliminar = (id) => { setLista(p => p.filter(c => c.id !== id)); setConfirmarElim(null); };

  const inp = { border: '1.5px solid #e2e8f0', borderRadius: '9px', padding: '10px 13px', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', color: '#0d1f5c', outline: 'none', width: '100%', background: '#fafbfd', boxSizing: 'border-box' };
  const lbl = { fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>

      {/* Buscador + boton */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e4ecf5', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', padding: '20px 24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={lbl}>Buscar en lista negra</label>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
              <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Nombre o CURP..." style={{ ...inp, paddingLeft: '38px' }} />
            </div>
          </div>
          <button onClick={() => setModal(true)} style={{ background: '#1565c0', border: 'none', borderRadius: '9px', padding: '10px 18px', fontSize: '13px', fontWeight: '600', color: '#fff', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
            <Plus size={14} /> Agregar
          </button>
        </div>
      </div>

      {/* Alerta */}
      <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '12px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <AlertCircle size={16} color="#dc2626" />
        <span style={{ fontSize: '13px', color: '#dc2626', fontWeight: '500' }}>
          Los clientes en esta lista no pueden recibir nuevos creditos. Total registros: <strong>{lista.length}</strong>
        </span>
      </div>

      {/* Tabla */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e4ecf5', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <UserX size={17} color="#dc2626" />
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '16px', fontWeight: '700', color: '#040e2e' }}>Lista negra</span>
          <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#94a3b8' }}>{filtrados.length} registro(s)</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
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
                <tr><td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No hay registros en lista negra</td></tr>
              ) : filtrados.map((c, i) => (
                <tr key={c.id} style={{ borderTop: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#fafbfd' }}>
                  <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0d1f5c' }}>{c.nombre}</td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: '#475569', fontFamily: 'monospace' }}>{c.curp}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569', maxWidth: '200px' }}>{c.motivo}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: '#dc2626' }}>{formatMoney(c.monto)}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{c.fechaIngreso}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <button onClick={() => setConfirmarElim(c)} style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '7px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: '#dc2626', fontFamily: 'DM Sans, sans-serif' }}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal agregar */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(4,14,46,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '460px', boxShadow: '0 24px 80px rgba(13,31,92,0.18)', overflow: 'hidden' }}>

            {/* Header sin degradado */}
            <div style={{ background: '#fff', borderBottom: '1px solid #e4ecf5', padding: '22px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', background: '#fef2f2', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserX size={20} color="#dc2626" />
                </div>
                <div>
                  <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '17px', fontWeight: '700', color: '#040e2e' }}>Agregar a lista negra</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>El cliente no podra recibir creditos</div>
                </div>
              </div>
              <button onClick={() => setModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { label: 'Nombre completo',      key: 'nombre', type: 'text' },
                { label: 'CURP',                 key: 'curp',   type: 'text' },
                { label: 'Motivo',               key: 'motivo', type: 'text' },
                { label: 'Monto adeudado (MXN)', key: 'monto',  type: 'number' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label style={lbl}>{label}</label>
                  <input type={type} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} placeholder={label} style={inp} />
                </div>
              ))}
            </div>

            <div style={{ padding: '0 28px 24px', display: 'flex', gap: '10px' }}>
              <button onClick={() => setModal(false)} style={{ flex: 1, padding: '11px', border: '1.5px solid #e2e8f0', background: '#fff', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#64748b', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Cancelar</button>
              <button onClick={agregar} style={{ flex: 2, padding: '11px', border: 'none', background: '#dc2626', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#fff', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Agregar a lista negra</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmar eliminar */}
      {confirmarElim && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(4,14,46,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '380px', padding: '28px', boxShadow: '0 24px 80px rgba(13,31,92,0.18)' }}>
            <AlertCircle size={32} color="#dc2626" style={{ marginBottom: '14px' }} />
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '17px', fontWeight: '700', color: '#040e2e', marginBottom: '8px' }}>Confirmar eliminacion</div>
            <p style={{ fontSize: '13px', color: '#475569', marginBottom: '22px', lineHeight: '1.6' }}>
              Estas por eliminar a <strong>{confirmarElim.nombre}</strong> de la lista negra. Esta accion no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setConfirmarElim(null)} style={{ flex: 1, padding: '11px', border: '1.5px solid #e2e8f0', background: '#fff', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#64748b', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Cancelar</button>
              <button onClick={() => eliminar(confirmarElim.id)} style={{ flex: 1, padding: '11px', border: 'none', background: '#dc2626', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#fff', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}