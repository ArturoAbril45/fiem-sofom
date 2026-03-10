'use client';
import { useState } from 'react';
import { BarChart2, TrendingUp, TrendingDown, DollarSign, ChevronDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

function formatMoney(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(n || 0);
}

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

// Datos en cero hasta conectar backend
const dataGrafica = MESES.map(m => ({ mes: m.slice(0, 3), ingresos: 0, egresos: 0 }));

const resumen = {
  ingresos: 0, egresos: 0, saldo: 0,
  carteraTotal: 0, ahorroTotal: 0, clientesActivos: 0,
};

const desglose = {
  ingresos: [
    { concepto: 'Comisiones de apertura', monto: 0 },
    { concepto: 'Intereses cobrados',     monto: 0 },
    { concepto: 'Abonos a capital',       monto: 0 },
    { concepto: 'Depositos de ahorro',    monto: 0 },
    { concepto: 'Otros ingresos',         monto: 0 },
  ],
  egresos: [
    { concepto: 'Salarios',          monto: 0 },
    { concepto: 'Renta',             monto: 0 },
    { concepto: 'Servicios',         monto: 0 },
    { concepto: 'Papeleria',         monto: 0 },
    { concepto: 'Gastos operativos', monto: 0 },
    { concepto: 'Otros egresos',     monto: 0 },
  ],
};

export default function ContabilidadBalance() {
  const today    = new Date();
  const [anio, setAnio]   = useState(today.getFullYear());
  const [showDes, setShowDes] = useState({ ingresos: false, egresos: false });

  const anos = [today.getFullYear(), today.getFullYear() - 1, today.getFullYear() - 2];

  const toggleDes = (k) => setShowDes(p => ({ ...p, [k]: !p[k] }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: '#fff', border: '1px solid #dceaf8', borderRadius: '10px', padding: '12px 16px', boxShadow: '0 8px 24px rgba(14,80,160,0.12)', fontSize: '12px' }}>
        <div style={{ fontWeight: '700', color: '#0a2d5e', marginBottom: '6px' }}>{label}</div>
        {payload.map(p => (
          <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: p.fill }} />
            <span style={{ color: '#4a6a94' }}>{p.name}:</span>
            <span style={{ fontWeight: '700', color: '#0a2d5e' }}>{formatMoney(p.value)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>

      {/* Filtro año */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #dceaf8', boxShadow: '0 2px 12px rgba(14,80,160,0.05)', padding: '16px 24px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ fontSize: '13px', fontWeight: '600', color: '#4a6a94' }}>Periodo:</span>
        <select value={anio} onChange={e => setAnio(Number(e.target.value))} style={{ border: '1.5px solid #dceaf8', borderRadius: '9px', padding: '8px 14px', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', color: '#1a3d6e', outline: 'none', background: '#fafcff', cursor: 'pointer' }}>
          {anos.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <span style={{ fontSize: '12px', color: '#90aac8', marginLeft: 'auto' }}>Datos al {new Date().toLocaleDateString('es-MX')}</span>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
        {[
          { label: 'Total ingresos',    val: resumen.ingresos,       color: '#166534', bg: '#dcfce7', Icon: TrendingUp },
          { label: 'Total egresos',     val: resumen.egresos,        color: '#991b1b', bg: '#fee2e2', Icon: TrendingDown },
          { label: 'Saldo neto',        val: resumen.saldo,          color: resumen.saldo >= 0 ? '#166534' : '#991b1b', bg: resumen.saldo >= 0 ? '#dcfce7' : '#fee2e2', Icon: DollarSign },
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

      {/* KPIs secundarios */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
        {[
          { label: 'Cartera total',     val: formatMoney(resumen.carteraTotal) },
          { label: 'Ahorro total',      val: formatMoney(resumen.ahorroTotal) },
          { label: 'Clientes activos',  val: resumen.clientesActivos },
        ].map(({ label, val }) => (
          <div key={label} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #dceaf8', boxShadow: '0 2px 12px rgba(14,80,160,0.05)', padding: '18px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>{label}</div>
            <div style={{ fontSize: '22px', fontWeight: '700', color: '#0a2d5e', fontFamily: "'Cormorant Garamond', serif" }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Grafica */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #dceaf8', boxShadow: '0 2px 12px rgba(14,80,160,0.05)', padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={{ width: '32px', height: '32px', background: '#e8f2fc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BarChart2 size={16} color="#0e50a0" />
          </div>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', fontWeight: '700', color: '#0a2d5e' }}>Ingresos vs Egresos — {anio}</span>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={dataGrafica} margin={{ top: 0, right: 10, left: 10, bottom: 0 }} barSize={14}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f6ff" />
            <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#90aac8', fontFamily: 'DM Sans, sans-serif' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#90aac8', fontFamily: 'DM Sans, sans-serif' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v/1000}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '12px', fontFamily: 'DM Sans, sans-serif', paddingTop: '12px' }} />
            <Bar dataKey="ingresos" name="Ingresos" fill="#0e50a0" radius={[4, 4, 0, 0]} />
            <Bar dataKey="egresos"  name="Egresos"  fill="#fca5a5" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Desglose ingresos */}
      {['ingresos', 'egresos'].map(tipo => (
        <div key={tipo} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #dceaf8', boxShadow: '0 2px 12px rgba(14,80,160,0.05)', marginBottom: '16px', overflow: 'hidden' }}>
          <button
            onClick={() => toggleDes(tipo)}
            style={{ width: '100%', background: 'none', border: 'none', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', textAlign: 'left' }}
          >
            <div style={{ width: '32px', height: '32px', background: tipo === 'ingresos' ? '#dcfce7' : '#fee2e2', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {tipo === 'ingresos' ? <TrendingUp size={16} color="#166534" /> : <TrendingDown size={16} color="#991b1b" />}
            </div>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', fontWeight: '700', color: '#0a2d5e', flex: 1 }}>
              Desglose de {tipo === 'ingresos' ? 'Ingresos' : 'Egresos'}
            </span>
            <ChevronDown size={18} color="#90aac8" style={{ transform: showDes[tipo] ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
          </button>
          {showDes[tipo] && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f4f8fd' }}>
                    <th style={{ padding: '10px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Concepto</th>
                    <th style={{ padding: '10px 24px', textAlign: 'right', fontSize: '11px', fontWeight: '700', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {desglose[tipo].map((d, i) => (
                    <tr key={d.concepto} style={{ borderTop: '1px solid #f0f6ff', background: i % 2 === 0 ? '#fff' : '#fafcff' }}>
                      <td style={{ padding: '12px 24px', fontSize: '13px', color: '#4a6a94' }}>{d.concepto}</td>
                      <td style={{ padding: '12px 24px', fontSize: '14px', fontWeight: '700', color: tipo === 'ingresos' ? '#166534' : '#991b1b', textAlign: 'right', fontFamily: "'Cormorant Garamond', serif" }}>{formatMoney(d.monto)}</td>
                    </tr>
                  ))}
                  <tr style={{ borderTop: '2px solid #dceaf8', background: '#f4f8fd' }}>
                    <td style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '700', color: '#0a2d5e' }}>Total</td>
                    <td style={{ padding: '12px 24px', fontSize: '15px', fontWeight: '700', color: tipo === 'ingresos' ? '#166534' : '#991b1b', textAlign: 'right', fontFamily: "'Cormorant Garamond', serif" }}>
                      {formatMoney(desglose[tipo].reduce((s, d) => s + d.monto, 0))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}