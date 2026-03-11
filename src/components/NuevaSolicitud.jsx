'use client';
import { useState, useEffect } from 'react';
import { User, CreditCard, Save, RotateCcw, CheckCircle, AlertCircle, Loader, Search } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://fiem-backend-production.up.railway.app';
const PRODUCTOS   = ['FIEM-27', 'FIEM-NEGOCIOS', 'FIEM-MOVIL3', 'MOVIL-FIEM8', 'MOVIL-FIEM12', 'PERSONALIZADO'];
const FRECUENCIAS = ['Diaria', 'Semanal', 'Quincenal', 'Mensual'];
const INITIAL = { clienteId: '', clienteNombre: '', clienteCurp: '', producto: '', monto: '', plazo: '', frecuencia: '', destino: '', aval1Nombre: '', aval1Curp: '', aval1Telefono: '', aval2Nombre: '', aval2Curp: '', aval2Telefono: '' };

export default function NuevaSolicitud() {
  const [form,       setForm]       = useState(INITIAL);
  const [errors,     setErrors]     = useState({});
  const [estado,     setEstado]     = useState(null);
  const [mensaje,    setMensaje]    = useState('');
  const [clientes,   setClientes]   = useState([]);
  const [busCliente, setBusCliente] = useState('');
  const [showDrop,   setShowDrop]   = useState(false);

  useEffect(() => {
    fetch(`${API}/api/clientes`).then(r => r.json()).then(d => setClientes(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const clientesFiltrados = clientes.filter(c => {
    const nombre = `${c.nombre} ${c.apellidoP} ${c.apellidoM}`.toLowerCase();
    return nombre.includes(busCliente.toLowerCase()) || (c.curp || '').toLowerCase().includes(busCliente.toLowerCase());
  }).slice(0, 6);

  const seleccionarCliente = (c) => {
    setForm(p => ({ ...p, clienteId: c._id, clienteNombre: `${c.nombre} ${c.apellidoP} ${c.apellidoM}`, clienteCurp: c.curp }));
    setBusCliente(`${c.nombre} ${c.apellidoP}`);
    setShowDrop(false);
  };

  const change = (k, v) => { setForm(p => ({ ...p, [k]: v })); if (errors[k]) setErrors(p => ({ ...p, [k]: false })); };

  const validate = () => {
    const req = ['clienteNombre', 'producto', 'monto', 'plazo', 'frecuencia'];
    const errs = {};
    req.forEach(k => { if (!form[k]) errs[k] = true; });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Cerrar dropdown al hacer click fuera
  const cerrarDrop = () => setTimeout(() => setShowDrop(false), 150);

  const handleSave = async () => {
    if (!validate()) return;
    setEstado('loading');
    try {
      const res = await fetch(`${API}/api/solicitudes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, monto: Number(form.monto), plazo: Number(form.plazo), estatus: 'Pendiente', fecha: new Date().toISOString().slice(0, 10) }),
      });
      if (!res.ok) throw new Error('Error al guardar');
      setEstado('ok'); setMensaje('Solicitud registrada correctamente.');
      setTimeout(() => { setForm(INITIAL); setBusCliente(''); setEstado(null); setMensaje(''); }, 3000);
    } catch (e) {
      setEstado('error'); setMensaje(e.message);
      setTimeout(() => setEstado(null), 4000);
    }
  };

  const inp = (err) => ({ border: `1.5px solid ${err ? '#ef4444' : '#dceaf8'}`, borderRadius: '9px', padding: '10px 13px', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', color: '#1a3d6e', outline: 'none', width: '100%', background: '#fafcff', boxSizing: 'border-box' });
  const lbl = (n) => <label style={{ fontSize: '11px', fontWeight: '600', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' }}>{n}</label>;
  const card = (titulo, Icon, children, noOverflow = false) => (
    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #dceaf8', boxShadow: '0 2px 12px rgba(14,80,160,0.05)', marginBottom: '20px', overflow: noOverflow ? 'visible' : 'hidden' }}>
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f6ff', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '32px', height: '32px', background: '#e8f2fc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={16} color="#0e50a0" /></div>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', fontWeight: '700', color: '#0a2d5e' }}>{titulo}</span>
      </div>
      <div style={{ padding: '22px 24px' }}>{children}</div>
    </div>
  );

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }}>
      {estado === 'ok'    && <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: '12px', padding: '13px 18px', marginBottom: '18px', color: '#166534', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle size={16} />{mensaje}</div>}
      {estado === 'error' && <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '12px', padding: '13px 18px', marginBottom: '18px', color: '#dc2626', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}><AlertCircle size={16} />{mensaje}</div>}

      {card('Datos del cliente', User,
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ position: 'relative', zIndex: 200 }}>
            {lbl('Buscar cliente *')}
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#90aac8', pointerEvents: 'none' }} />
              <input value={busCliente} onChange={e => { setBusCliente(e.target.value); setForm(p => ({ ...p, clienteNombre: e.target.value })); setShowDrop(true); }} onFocus={() => setShowDrop(true)} onBlur={cerrarDrop} placeholder="Buscar por nombre o CURP..." style={{ ...inp(errors.clienteNombre), paddingLeft: '36px' }} />
            </div>
            {showDrop && clientesFiltrados.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #dceaf8', borderRadius: '10px', boxShadow: '0 8px 24px rgba(14,80,160,0.12)', zIndex: 999, marginTop: '4px', maxHeight: '220px', overflowY: 'auto' }}>
                {clientesFiltrados.map(c => (
                  <div key={c._id} onClick={() => seleccionarCliente(c)} style={{ padding: '10px 14px', cursor: 'pointer', fontSize: '13px', color: '#0a2d5e', borderBottom: '1px solid #f0f6ff' }}
                    onMouseEnter={e => e.currentTarget.style.background='#f4f8fd'} onMouseLeave={e => e.currentTarget.style.background='#fff'}>
                    <strong>{c.nombre} {c.apellidoP}</strong> <span style={{ color: '#90aac8', fontSize: '11px' }}>{c.curp}</span>
                  </div>
                ))}
              </div>
            )}
            {errors.clienteNombre && <span style={{ color: '#ef4444', fontSize: '11px' }}>Selecciona un cliente</span>}
          </div>
          <div>
            {lbl('CURP del cliente')}
            <input value={form.clienteCurp} readOnly placeholder="Se llena al seleccionar cliente" style={{ ...inp(false), background: '#f4f8fd', color: '#90aac8' }} />
          </div>
        </div>
      , true)}

      {card('Datos del credito', CreditCard,
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          {[
            { label: 'Producto *',          key: 'producto',   type: 'select', opts: PRODUCTOS },
            { label: 'Monto solicitado *',   key: 'monto',      type: 'number' },
            { label: 'Plazo (periodos) *',   key: 'plazo',      type: 'number' },
            { label: 'Frecuencia de pago *', key: 'frecuencia', type: 'select', opts: FRECUENCIAS },
          ].map(({ label, key, type, opts }) => (
            <div key={key}>
              {lbl(label)}
              {type === 'select' ? (
                <select value={form[key]} onChange={e => change(key, e.target.value)} style={{ ...inp(errors[key]), cursor: 'pointer' }}>
                  <option value="">Seleccionar...</option>
                  {opts.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input type={type} value={form[key]} onChange={e => change(key, e.target.value)} placeholder="0" style={inp(errors[key])} />
              )}
              {errors[key] && <span style={{ color: '#ef4444', fontSize: '11px' }}>Requerido</span>}
            </div>
          ))}
          <div style={{ gridColumn: '1 / -1' }}>
            {lbl('Destino del credito')}
            <input value={form.destino} onChange={e => change('destino', e.target.value)} placeholder="Ej. Capital de trabajo, consumo personal..." style={inp(false)} />
          </div>
        </div>
      )}

      {card('Avales', User,
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[
            { label: 'Nombre aval 1', key: 'aval1Nombre' }, { label: 'CURP aval 1', key: 'aval1Curp' }, { label: 'Telefono aval 1', key: 'aval1Telefono' },
            { label: 'Nombre aval 2', key: 'aval2Nombre' }, { label: 'CURP aval 2', key: 'aval2Curp' }, { label: 'Telefono aval 2', key: 'aval2Telefono' },
          ].map(({ label, key }) => (
            <div key={key}>{lbl(label)}<input value={form[key]} onChange={e => change(key, e.target.value)} placeholder={label} style={inp(false)} /></div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button onClick={() => { setForm(INITIAL); setErrors({}); setEstado(null); setBusCliente(''); }} style={{ background: '#fff', border: '1.5px solid #dceaf8', borderRadius: '10px', padding: '11px 24px', fontSize: '13px', fontWeight: '600', color: '#4a6a94', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '7px' }}>
          <RotateCcw size={14} /> Limpiar
        </button>
        <button onClick={handleSave} disabled={estado === 'loading'} style={{ background: estado === 'loading' ? '#90aac8' : '#0e50a0', border: 'none', borderRadius: '10px', padding: '11px 28px', fontSize: '13px', fontWeight: '600', color: '#fff', cursor: estado === 'loading' ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '7px', boxShadow: '0 4px 14px rgba(14,80,160,0.28)' }}>
          {estado === 'loading' ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Guardando...</> : <><Save size={14} /> Guardar solicitud</>}
        </button>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}