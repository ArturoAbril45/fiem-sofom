'use client';
import { useState } from 'react';
import { Search, Users, Eye, X, Briefcase } from 'lucide-react';

export default function ConsultarEmpleado() {
  const [busqueda, setBusqueda]       = useState('');
  const [filtroPuesto, setFiltroPuesto] = useState('');
  const [seleccionado, setSeleccionado] = useState(null);

  const empleados = [];

  const PUESTOS = ['Ejecutivo de campo', 'Gerente de zona', 'Cajero', 'Analista de credito', 'Coordinador', 'Administrador', 'Director'];

  const filtrados = empleados.filter(e =>
    (e.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      e.curp?.includes(busqueda)) &&
    (!filtroPuesto || e.puesto === filtroPuesto)
  );

  const badge = (activo) => ({
    display: 'inline-block', padding: '3px 10px', borderRadius: '20px',
    fontSize: '11px', fontWeight: '700',
    background: activo ? '#dcfce7' : '#f1f5f9',
    color: activo ? '#166534' : '#475569',
  });

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>

      {/* Filtros */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #dceaf8', boxShadow: '0 2px 12px rgba(14,80,160,0.05)', padding: '20px 24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ fontSize: '11px', fontWeight: '600', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' }}>Buscar</label>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#90aac8', pointerEvents: 'none' }} />
              <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Nombre o CURP..." style={{ width: '100%', border: '1.5px solid #dceaf8', borderRadius: '9px', padding: '10px 13px 10px 38px', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', color: '#1a3d6e', outline: 'none', background: '#fafcff', boxSizing: 'border-box' }} />
            </div>
          </div>
          <div style={{ minWidth: '200px' }}>
            <label style={{ fontSize: '11px', fontWeight: '600', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' }}>Puesto</label>
            <select value={filtroPuesto} onChange={e => setFiltroPuesto(e.target.value)} style={{ border: '1.5px solid #dceaf8', borderRadius: '9px', padding: '10px 13px', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', color: '#1a3d6e', outline: 'none', background: '#fafcff', cursor: 'pointer', width: '100%', boxSizing: 'border-box' }}>
              <option value="">Todos</option>
              {PUESTOS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #dceaf8', boxShadow: '0 2px 12px rgba(14,80,160,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f6ff', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', background: '#e8f2fc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={16} color="#0e50a0" />
          </div>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', fontWeight: '700', color: '#0a2d5e' }}>Empleados</span>
          <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#90aac8' }}>{filtrados.length} resultado(s)</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f4f8fd' }}>
                {['Nombre', 'CURP', 'Puesto', 'Gerencia', 'Celular', 'Ingreso', 'Estatus', ''].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: '#90aac8', fontSize: '13px' }}>
                    <Users size={28} color="#dceaf8" style={{ display: 'block', margin: '0 auto 12px' }} />
                    No se encontraron empleados
                  </td>
                </tr>
              ) : filtrados.map((e, i) => (
                <tr key={e.id} style={{ borderTop: '1px solid #f0f6ff', background: i % 2 === 0 ? '#fff' : '#fafcff' }}>
                  <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0a2d5e' }}>{e.nombre}</td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', fontFamily: 'monospace', color: '#4a6a94' }}>{e.curp}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4a6a94' }}>{e.puesto}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4a6a94' }}>{e.gerencia}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4a6a94' }}>{e.celular}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4a6a94' }}>{e.fechaIngreso}</td>
                  <td style={{ padding: '12px 16px' }}><span style={badge(e.activo)}>{e.activo ? 'Activo' : 'Inactivo'}</span></td>
                  <td style={{ padding: '12px 16px' }}>
                    <button onClick={() => setSeleccionado(e)} style={{ background: '#e8f2fc', border: 'none', borderRadius: '7px', padding: '7px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: '600', color: '#0e50a0', fontFamily: 'DM Sans, sans-serif' }}>
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
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(10,45,94,0.45)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '540px', boxShadow: '0 32px 80px rgba(14,80,160,0.2)', overflow: 'hidden' }}>
            <div style={{ background: '#fff', borderBottom: '1px solid #dceaf8', padding: '22px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', background: '#e8f2fc', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Briefcase size={20} color="#0e50a0" />
                </div>
                <div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', fontWeight: '700', color: '#0a2d5e' }}>{seleccionado.nombre}</div>
                  <div style={{ fontSize: '12px', color: '#90aac8', marginTop: '2px' }}>{seleccionado.puesto}</div>
                </div>
              </div>
              <button onClick={() => setSeleccionado(null)} style={{ background: '#f0f6ff', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#4a6a94' }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { label: 'CURP',         val: seleccionado.curp },
                { label: 'RFC',          val: seleccionado.rfc || '—' },
                { label: 'NSS',          val: seleccionado.nss || '—' },
                { label: 'Celular',      val: seleccionado.celular },
                { label: 'Correo',       val: seleccionado.correo || '—' },
                { label: 'Gerencia',     val: seleccionado.gerencia || '—' },
                { label: 'Ruta',         val: seleccionado.ruta || '—' },
                { label: 'Fecha ingreso',val: seleccionado.fechaIngreso },
                { label: 'Salario',      val: seleccionado.salario ? `$${Number(seleccionado.salario).toLocaleString('es-MX')}` : '—' },
                { label: 'Contrato',     val: seleccionado.tipoContrato || '—' },
              ].map(({ label, val }) => (
                <div key={label}>
                  <div style={{ fontSize: '11px', color: '#90aac8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '4px' }}>{label}</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#0a2d5e' }}>{val}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: '0 28px 24px' }}>
              <button onClick={() => setSeleccionado(null)} style={{ width: '100%', padding: '11px', border: '1.5px solid #dceaf8', background: '#fff', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#4a6a94', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}