'use client';
import { useState } from 'react';
import { Search, User, Phone, MapPin, CreditCard, Eye, X } from 'lucide-react';

export default function ConsultarCliente() {
  const [busqueda, setBusqueda]           = useState('');
  const [seleccionado, setSeleccionado]   = useState(null);

  const clientes = [];

  const filtrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.curp.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.celular.includes(busqueda)
  );

  const badge = (estatus) => ({
    display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
    background: estatus === 'Activo' ? '#dcfce7' : '#f1f5f9',
    color: estatus === 'Activo' ? '#166534' : '#64748b',
  });

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>

      {/* Buscador */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e4ecf5', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', padding: '20px 24px', marginBottom: '20px' }}>
        <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '8px' }}>Buscar cliente</label>
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Nombre, CURP o celular..." style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: '9px', padding: '10px 13px 10px 38px', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', color: '#0d1f5c', outline: 'none', background: '#fafbfd', boxSizing: 'border-box' }} />
        </div>
      </div>

      {/* Tabla */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e4ecf5', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <User size={17} color="#1565c0" />
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '16px', fontWeight: '700', color: '#040e2e' }}>Clientes registrados</span>
          <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#94a3b8' }}>{filtrados.length} resultado(s)</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Nombre', 'CURP', 'Celular', 'Municipio', 'Creditos', 'Estatus', ''].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No se encontraron clientes</td></tr>
              ) : filtrados.map((c, i) => (
                <tr key={c.id} style={{ borderTop: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#fafbfd' }}>
                  <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0d1f5c' }}>{c.nombre}</td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: '#475569', fontFamily: 'monospace' }}>{c.curp}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{c.celular}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{c.municipio}, {c.estado}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569', textAlign: 'center' }}>{c.creditos}</td>
                  <td style={{ padding: '12px 16px' }}><span style={badge(c.estatus)}>{c.estatus}</span></td>
                  <td style={{ padding: '12px 16px' }}>
                    <button onClick={() => setSeleccionado(c)} style={{ background: '#eef2f7', border: 'none', borderRadius: '7px', padding: '7px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: '600', color: '#1565c0', fontFamily: 'DM Sans, sans-serif' }}>
                      <Eye size={13} /> Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal detalle */}
      {seleccionado && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(4,14,46,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '500px', boxShadow: '0 24px 80px rgba(13,31,92,0.18)', overflow: 'hidden' }}>

            {/* Header sin degradado */}
            <div style={{ background: '#fff', borderBottom: '1px solid #e4ecf5', padding: '22px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '44px', height: '44px', background: '#eef2f7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={20} color="#1565c0" />
                </div>
                <div>
                  <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '17px', fontWeight: '700', color: '#040e2e' }}>{seleccionado.nombre}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{seleccionado.curp}</div>
                </div>
              </div>
              <button onClick={() => setSeleccionado(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { icon: Phone,      label: 'Celular',   val: seleccionado.celular },
                { icon: MapPin,     label: 'Municipio', val: `${seleccionado.municipio}, ${seleccionado.estado}` },
                { icon: MapPin,     label: 'Colonia',   val: seleccionado.colonia },
                { icon: User,       label: 'Ocupacion', val: seleccionado.ocupacion },
                { icon: CreditCard, label: 'Creditos',  val: seleccionado.creditos },
                { icon: User,       label: 'Estatus',   val: seleccionado.estatus },
              ].map(({ icon: Icon, label, val }) => (
                <div key={label}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Icon size={11} /> {label}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#0d1f5c' }}>{val}</div>
                </div>
              ))}
            </div>

            <div style={{ padding: '0 28px 24px', display: 'flex', gap: '10px' }}>
              <button onClick={() => setSeleccionado(null)} style={{ flex: 1, padding: '11px', border: '1.5px solid #e2e8f0', background: '#fff', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#64748b', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Cerrar</button>
              <button style={{ flex: 2, padding: '11px', border: 'none', background: '#1565c0', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#fff', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Editar cliente</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}