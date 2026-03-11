'use client';
import { useState, useEffect } from 'react';
import { PiggyBank, User, Save, RotateCcw, CheckCircle, AlertCircle, Loader, Search } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://fiem-backend-production.up.railway.app';
const PRODUCTOS   = ['Ahorro Ordinario', 'Ahorro a Plazo', 'Ahorro Infantil', 'Ahorro Empresarial'];
const FRECUENCIAS = ['Diaria', 'Semanal', 'Quincenal', 'Mensual'];
const INITIAL = { clienteId: '', clienteNombre: '', clienteCurp: '', producto: '', montoInicial: '', frecuencia: '', ejecutivo: '' };

export default function AperturarAhorro() {
  const [form,       setForm]       = useState(INITIAL);
  const [errors,     setErrors]     = useState({});
  const [estado,     setEstado]     = useState(null);
  const [mensaje,    setMensaje]    = useState('');
  const [folio,      setFolio]      = useState('');
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
    const req = ['clienteNombre', 'producto', 'montoInicial', 'frecuencia'];
    const errs = {};
    req.forEach(k => { if (!form[k]) errs[k] = true; });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const cerrarDrop = () => setTimeout(() => setShowDrop(false), 150);

  const handleSave = async () => {
    if (!validate()) return;
    setEstado('loading');
    try {
      const res = await fetch(`${API}/api/cuentas-ahorro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, montoInicial: Number(form.montoInicial), saldo: Number(form.montoInicial), estatus: 'Activa', fechaApertura: new Date().toISOString().slice(0, 10) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al aperturar');
      setFolio(data.folio || '');
      setEstado('ok');
      setMensaje(`Cuenta aperturada. Folio: ${data.folio || ''}`);
      setTimeout(() => { setForm(INITIAL); setBusCliente(''); setEstado(null); setMensaje(''); setFolio(''); }, 4000);
    } catch (e) {
      setEstado('error'); setMensaje(e.message);
      setTimeout(() => setEstado(null), 4000);
    }
  };

  const inp = (err) => ({ border: `1.5px solid ${err ? '#ef4444' : '#dceaf8'}`, borderRadius: '9px', padding: '10px 13px', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', color: '#1a3d6e', outline: 'none', width: '100%', background: '#fafcff', boxSizing: 'border-box' });
  const lbl = (n) => <label style={{ fontSize: '11px', fontWeight: '600', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' }}>{n}</label>;
  const section = (titulo, Icon, children, noOverflow = false) => (
    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #dceaf8', boxShadow: '0 2px 12px rgba(14,80,160,0.05)', marginBottom: '20px', overflow: noOverflow ? 'visible' : 'hidden' }}>
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f6ff', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '32px', height: '32px', background: '#e8f2fc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={16} color="#0e50a0" /></div>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', fontWeight: '700', color: '#0a2d5e' }}>{titulo}</span>
      </div>
      <div style={{ padding: '22px 24px' }}>{children}</div>
    </div>
  );

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      {estado === 'ok' && <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: '12px', padding: '16px 20px', marginBottom: '18px', color: '#166534', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle size={16} />{mensaje}{folio && <span style={{ marginLeft: 'auto', background: '#166534', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '12px' }}>{folio}</span>}</div>}
      {estado === 'error' && <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '12px', padding: '13px 18px', marginBottom: '18px', color: '#dc2626', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}><AlertCircle size={16} />{mensaje}</div>}

      {section('Datos del cliente', User,
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            {lbl('Buscar cliente *')}
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#90aac8', pointerEvents: 'none' }} />
              <input value={busCliente} onChange={e => { setBusCliente(e.target.value); setForm(p => ({ ...p, clienteNombre: e.target.value })); setShowDrop(true); }} onFocus={() => setShowDrop(true)} placeholder="Nombre o CURP..." style={{ ...inp(errors.clienteNombre), paddingLeft: '36px' }} />
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
          <div>{lbl('CURP')}<input value={form.clienteCurp} readOnly style={{ ...inp(false), background: '#f4f8fd', color: '#90aac8' }} /></div>
        </div>
      , true)}

      {section('Datos de la cuenta', PiggyBank,
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <div>
            {lbl('Producto *')}
            <select value={form.producto} onChange={e => change('producto', e.target.value)} style={{ ...inp(errors.producto), cursor: 'pointer' }}>
              <option value="">Seleccionar...</option>
              {PRODUCTOS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            {errors.producto && <span style={{ color: '#ef4444', fontSize: '11px' }}>Requerido</span>}
          </div>
          <div>
            {lbl('Monto inicial *')}
            <input type="number" value={form.montoInicial} onChange={e => change('montoInicial', e.target.value)} placeholder="0.00" style={inp(errors.montoInicial)} />
            {errors.montoInicial && <span style={{ color: '#ef4444', fontSize: '11px' }}>Requerido</span>}
          </div>
          <div>
            {lbl('Frecuencia *')}
            <select value={form.frecuencia} onChange={e => change('frecuencia', e.target.value)} style={{ ...inp(errors.frecuencia), cursor: 'pointer' }}>
              <option value="">Seleccionar...</option>
              {FRECUENCIAS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            {errors.frecuencia && <span style={{ color: '#ef4444', fontSize: '11px' }}>Requerido</span>}
          </div>
          <div>
            {lbl('Ejecutivo')}
            <input value={form.ejecutivo} onChange={e => change('ejecutivo', e.target.value)} placeholder="Nombre del ejecutivo" style={inp(false)} />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button onClick={() => { setForm(INITIAL); setErrors({}); setEstado(null); setBusCliente(''); }} style={{ background: '#fff', border: '1.5px solid #dceaf8', borderRadius: '10px', padding: '11px 24px', fontSize: '13px', fontWeight: '600', color: '#4a6a94', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '7px' }}>
          <RotateCcw size={14} /> Limpiar
        </button>
        <button onClick={handleSave} disabled={estado === 'loading'} style={{ background: estado === 'loading' ? '#90aac8' : '#0e50a0', border: 'none', borderRadius: '10px', padding: '11px 28px', fontSize: '13px', fontWeight: '600', color: '#fff', cursor: estado === 'loading' ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '7px', boxShadow: '0 4px 14px rgba(14,80,160,0.28)' }}>
          {estado === 'loading' ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Aperturando...</> : <><Save size={14} /> Aperturar cuenta</>}
        </button>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}