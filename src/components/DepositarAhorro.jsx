'use client';
import { useState, useEffect } from 'react';
import { Search, PiggyBank, Save, TrendingUp, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://fiem-backend-production.up.railway.app';
const METODOS = ['Efectivo', 'Transferencia', 'Deposito bancario', 'Cheque'];
function fmt(n) { return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(n || 0); }

export default function DepositarAhorro() {
  const [busqueda,   setBusqueda]   = useState('');
  const [cuentaSel,  setCuentaSel]  = useState(null);
  const [form,       setForm]       = useState({ monto: '', metodo: '', referencia: '', fecha: new Date().toISOString().slice(0,10), observaciones: '' });
  const [cuentas,    setCuentas]    = useState([]);
  const [estado,     setEstado]     = useState(null);
  const [mensaje,    setMensaje]    = useState('');

  useEffect(() => {
    fetch(`${API}/api/cuentas-ahorro`).then(r => r.json()).then(d => setCuentas(Array.isArray(d) ? d.filter(c => c.estatus === 'Activa') : [])).catch(() => {});
  }, []);

  const filtradas = cuentas.filter(c =>
    (c.clienteNombre || '').toLowerCase().includes(busqueda.toLowerCase()) || (c.folio || '').includes(busqueda)
  );

  const handleSave = async () => {
    if (!cuentaSel || !form.monto || !form.metodo) {
      setEstado('error'); setMensaje('Selecciona una cuenta e ingresa monto y metodo.');
      setTimeout(() => setEstado(null), 3000); return;
    }
    setEstado('loading');
    try {
      const res = await fetch(`${API}/api/movimientos-ahorro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cuentaId: cuentaSel._id, folio: cuentaSel.folio || cuentaSel.numeroCuenta || cuentaSel._id, clienteNombre: cuentaSel.clienteNombre, tipo: 'Deposito', monto: Number(form.monto), metodo: form.metodo, referencia: form.referencia, fecha: form.fecha, observaciones: form.observaciones }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al registrar deposito');
      setEstado('ok');
      setMensaje(`Deposito registrado. Nuevo saldo: ${fmt(data.nuevoSaldo)}`);
      setForm({ monto: '', metodo: '', referencia: '', fecha: new Date().toISOString().slice(0,10), observaciones: '' });
      setCuentaSel(null);
      fetch(`${API}/api/cuentas-ahorro`).then(r => r.json()).then(d => setCuentas(Array.isArray(d) ? d.filter(c => c.estatus === 'Activa') : []));
      setTimeout(() => setEstado(null), 4000);
    } catch (e) {
      setEstado('error'); setMensaje(e.message);
      setTimeout(() => setEstado(null), 4000);
    }
  };

  const inp = { border: '1.5px solid #dceaf8', borderRadius: '9px', padding: '10px 13px', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', color: '#1a3d6e', outline: 'none', width: '100%', background: '#fafcff', boxSizing: 'border-box' };
  const lbl = (t) => <label style={{ fontSize: '11px', fontWeight: '600', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' }}>{t}</label>;

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }}>
      {estado === 'ok'    && <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: '12px', padding: '13px 18px', marginBottom: '18px', color: '#166534', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle size={16} />{mensaje}</div>}
      {estado === 'error' && <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '12px', padding: '13px 18px', marginBottom: '18px', color: '#dc2626', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}><AlertCircle size={16} />{mensaje}</div>}

      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #dceaf8', boxShadow: '0 2px 12px rgba(14,80,160,0.05)', marginBottom: '20px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f6ff', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', background: '#e8f2fc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Search size={16} color="#0e50a0" /></div>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', fontWeight: '700', color: '#0a2d5e' }}>Buscar cuenta</span>
        </div>
        <div style={{ padding: '22px 24px' }}>
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <Search size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#90aac8', pointerEvents: 'none' }} />
            <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Nombre del cliente o folio..." style={{ ...inp, paddingLeft: '38px' }} />
          </div>
          {filtradas.length === 0 && busqueda && <p style={{ color: '#90aac8', fontSize: '13px', textAlign: 'center', padding: '12px 0' }}>No se encontraron cuentas activas</p>}
          {filtradas.map(c => (
            <div key={c._id} onClick={() => setCuentaSel(c)} style={{ padding: '14px 16px', borderRadius: '10px', border: `1.5px solid ${cuentaSel?._id === c._id ? '#0e50a0' : '#dceaf8'}`, marginBottom: '8px', cursor: 'pointer', background: cuentaSel?._id === c._id ? '#eff6ff' : '#fafcff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#0a2d5e' }}>{c.clienteNombre}</div>
                <div style={{ fontSize: '12px', color: '#90aac8', marginTop: '2px' }}>Folio: {c.folio} · {c.producto}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#166534' }}>{fmt(c.saldo)}</div>
                <div style={{ fontSize: '11px', color: '#90aac8' }}>Saldo actual</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {cuentaSel && (
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #dceaf8', boxShadow: '0 2px 12px rgba(14,80,160,0.05)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f6ff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', background: '#dcfce7', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><TrendingUp size={16} color="#166534" /></div>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', fontWeight: '700', color: '#0a2d5e' }}>Deposito</span>
            <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#90aac8' }}>{cuentaSel.clienteNombre}</span>
          </div>
          <div style={{ padding: '22px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            <div>{lbl('Monto del deposito *')}<input type="number" value={form.monto} onChange={e => setForm(p => ({ ...p, monto: e.target.value }))} placeholder="0.00" style={inp} /></div>
            <div>{lbl('Metodo *')}<select value={form.metodo} onChange={e => setForm(p => ({ ...p, metodo: e.target.value }))} style={{ ...inp, cursor: 'pointer' }}><option value="">Seleccionar...</option>{METODOS.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
            <div>{lbl('Referencia')}<input value={form.referencia} onChange={e => setForm(p => ({ ...p, referencia: e.target.value }))} placeholder="No. referencia" style={inp} /></div>
            <div>{lbl('Fecha')}<input type="date" value={form.fecha} onChange={e => setForm(p => ({ ...p, fecha: e.target.value }))} style={inp} /></div>
            <div style={{ gridColumn: '1 / -1' }}>{lbl('Observaciones')}<textarea value={form.observaciones} onChange={e => setForm(p => ({ ...p, observaciones: e.target.value }))} rows={2} placeholder="Notas adicionales..." style={{ ...inp, resize: 'vertical' }} /></div>
          </div>
          <div style={{ padding: '0 24px 22px', display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={handleSave} disabled={estado === 'loading'} style={{ background: estado === 'loading' ? '#90aac8' : '#166534', border: 'none', borderRadius: '10px', padding: '11px 28px', fontSize: '13px', fontWeight: '600', color: '#fff', cursor: estado === 'loading' ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '7px', boxShadow: '0 4px 14px rgba(22,101,52,0.28)' }}>
              {estado === 'loading' ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Registrando...</> : <><Save size={14} /> Registrar deposito</>}
            </button>
          </div>
        </div>
      )}

      {!cuentaSel && !busqueda && (
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #dceaf8', padding: '48px', textAlign: 'center', color: '#90aac8', boxShadow: '0 2px 12px rgba(14,80,160,0.05)' }}>
          <PiggyBank size={32} color="#dceaf8" style={{ marginBottom: '12px' }} />
          <p style={{ fontSize: '14px' }}>Busca una cuenta activa para registrar el deposito</p>
        </div>
      )}
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}