'use client';
import { useState } from 'react';
import { Search, ArrowUpCircle, Save, PiggyBank } from 'lucide-react';

const METODOS = ['Efectivo', 'Transferencia', 'Deposito bancario', 'Cheque'];

export default function DepositarAhorro() {
  const [busqueda, setBusqueda]     = useState('');
  const [cuentaSel, setCuentaSel]   = useState(null);
  const [form, setForm]             = useState({ monto: '', metodo: '', referencia: '', fecha: '', observaciones: '' });
  const [saved, setSaved]           = useState(false);

  const cuentas = [];

  const filtradas = cuentas.filter(c =>
    c.clienteNombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.numeroCuenta?.includes(busqueda)
  );

  const handleSave = () => {
    if (!cuentaSel || !form.monto || !form.metodo) return;
    setSaved(true);
    setTimeout(() => { setSaved(false); setForm({ monto: '', metodo: '', referencia: '', fecha: '', observaciones: '' }); }, 2500);
  };

  const inp = { border: '1.5px solid #e2e8f0', borderRadius: '9px', padding: '10px 13px', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', color: '#0d1f5c', outline: 'none', width: '100%', background: '#fafbfd', boxSizing: 'border-box' };
  const lbl = (t) => <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' }}>{t}</label>;

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }}>

      {saved && (
        <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: '10px', padding: '12px 18px', marginBottom: '20px', color: '#166534', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Save size={15} /> Deposito registrado correctamente.
        </div>
      )}

      {/* Buscar cuenta */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e4ecf5', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', marginBottom: '20px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Search size={17} color="#0891b2" />
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '16px', fontWeight: '700', color: '#040e2e' }}>Buscar cuenta de ahorro</span>
        </div>
        <div style={{ padding: '22px 24px' }}>
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <Search size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
            <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Nombre del cliente o numero de cuenta..." style={{ ...inp, paddingLeft: '38px' }} />
          </div>
          {filtradas.length === 0 && busqueda && (
            <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', padding: '12px 0' }}>No se encontraron cuentas</p>
          )}
          {filtradas.map(c => (
            <div key={c.id} onClick={() => setCuentaSel(c)} style={{ padding: '14px 16px', borderRadius: '10px', border: `1.5px solid ${cuentaSel?.id === c.id ? '#0891b2' : '#e2e8f0'}`, marginBottom: '8px', cursor: 'pointer', background: cuentaSel?.id === c.id ? '#ecfeff' : '#fafbfd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#0d1f5c' }}>{c.clienteNombre}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Cuenta: {c.numeroCuenta} · {c.producto}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#0891b2' }}>${c.saldo?.toLocaleString('es-MX')}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Saldo</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Datos del deposito */}
      {cuentaSel && (
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e4ecf5', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ArrowUpCircle size={17} color="#166534" />
            <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '16px', fontWeight: '700', color: '#040e2e' }}>Datos del deposito</span>
            <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#94a3b8' }}>{cuentaSel.clienteNombre}</span>
          </div>
          <div style={{ padding: '22px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            <div>
              {lbl('Monto del deposito *')}
              <input type="number" value={form.monto} onChange={e => setForm(p => ({ ...p, monto: e.target.value }))} placeholder="0.00" style={inp} />
            </div>
            <div>
              {lbl('Metodo de pago *')}
              <select value={form.metodo} onChange={e => setForm(p => ({ ...p, metodo: e.target.value }))} style={{ ...inp, cursor: 'pointer' }}>
                <option value="">Seleccionar...</option>
                {METODOS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              {lbl('Referencia / Folio')}
              <input value={form.referencia} onChange={e => setForm(p => ({ ...p, referencia: e.target.value }))} placeholder="No. referencia" style={inp} />
            </div>
            <div>
              {lbl('Fecha')}
              <input type="date" value={form.fecha} onChange={e => setForm(p => ({ ...p, fecha: e.target.value }))} style={inp} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              {lbl('Observaciones')}
              <textarea value={form.observaciones} onChange={e => setForm(p => ({ ...p, observaciones: e.target.value }))} placeholder="Notas adicionales..." rows={2} style={{ ...inp, resize: 'vertical' }} />
            </div>
          </div>
          <div style={{ padding: '0 24px 22px', display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={handleSave} style={{ background: '#166534', border: 'none', borderRadius: '10px', padding: '11px 28px', fontSize: '13px', fontWeight: '600', color: '#fff', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '7px' }}>
              <ArrowUpCircle size={14} /> Registrar deposito
            </button>
          </div>
        </div>
      )}

      {!cuentaSel && !busqueda && (
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e4ecf5', padding: '48px', textAlign: 'center', color: '#94a3b8', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <PiggyBank size={32} color="#cbd5e1" style={{ marginBottom: '12px' }} />
          <p style={{ fontSize: '14px' }}>Busca una cuenta de ahorro para registrar el deposito</p>
        </div>
      )}
    </div>
  );
}