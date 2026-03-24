'use client';
import { useState, useEffect } from 'react';
import { Bell, DollarSign, Eye, TrendingUp, AlertCircle } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://fiem-backend-production.up.railway.app';

function formatMoney(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(n || 0);
}

function fmtFecha(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function fmtHora(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

export default function Inicio({ onNavigate }) {
  const [notificaciones, setNotificaciones] = useState([]);
  const [cobranza,       setCobranza]       = useState({ totalPagos:0, totalMonto:0, pagosFaltantes:0, montoFaltante:0 });

  useEffect(() => {
    fetch(`${API}/api/notificaciones/admin`)
      .then(r => r.json())
      .then(data => setNotificaciones(Array.isArray(data) ? data : []))
      .catch(() => {});

    fetch(`${API}/api/resumen-dia`)
      .then(r => r.json())
      .then(data => setCobranza({
        totalPagos:     data.cobranza?.totalPagos   || 0,
        totalMonto:     data.cobranza?.totalMonto   || 0,
        pagosFaltantes: data.cobranza?.faltanPagos  || 0,
        montoFaltante:  data.cobranza?.faltanMonto  || 0,
      }))
      .catch(() => {});
  }, []);

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ── Hero ── */}
      <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #dceaf8', boxShadow: '0 2px 20px rgba(14,80,160,0.06)', padding: '40px 32px', textAlign: 'center' }}>
        {/* Logo circular FIEM */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <div style={{
            width: '120px', height: '120px',
            borderRadius: '50%',
            border: '3px solid #dceaf8',
            boxShadow: '0 8px 32px rgba(14,80,160,0.14)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#f0f6ff',
            overflow: 'hidden',
          }}>
            {/* Ícono estilizado tipo logo bancario */}
            <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="36" cy="36" r="34" stroke="#0e50a0" strokeWidth="2.5" fill="#e8f2fc" />
              {/* Barras de gráfica */}
              <rect x="16" y="42" width="8" height="14" rx="2" fill="#0e50a0" />
              <rect x="28" y="32" width="8" height="24" rx="2" fill="#1868c8" />
              <rect x="40" y="22" width="8" height="34" rx="2" fill="#0e50a0" />
              {/* Flecha de tendencia */}
              <path d="M14 38 L28 26 L40 30 L56 18" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <circle cx="56" cy="18" r="3" fill="#3b82f6" />
              {/* Círculo exterior decorativo */}
              <circle cx="36" cy="36" r="34" stroke="#90b4e0" strokeWidth=".8" fill="none" strokeDasharray="4 3" />
            </svg>
          </div>
        </div>

        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '32px', fontWeight: '700', color: '#0a2d5e', letterSpacing: '.06em', marginBottom: '4px' }}>
          F I E M
        </div>
        <div style={{ fontSize: '13px', fontWeight: '600', color: '#4a6a94', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: '6px' }}>
          S.A. de C.V. SOFOM E.N.R.
        </div>
        <div style={{ width: '48px', height: '2px', background: '#0e50a0', margin: '14px auto', borderRadius: '2px' }} />
        <div style={{ fontSize: '16px', fontWeight: '600', color: '#0a2d5e', marginBottom: '8px' }}>
          Oficina Central
        </div>
        <div style={{ fontSize: '13px', color: '#90aac8', lineHeight: '1.7', maxWidth: '560px', margin: '0 auto' }}>
          Este panel estara cambiando para ofrecerte una informacion mas precisa y personalizada para ti. Para agilizar el tiempo de carga del sistema se ha creado el modulo{' '}
          <button
            onClick={() => onNavigate && onNavigate('Resumen del dia')}
            style={{ background: 'none', border: 'none', color: '#0e50a0', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit', fontSize: 'inherit' }}
          >
            Resumen del dia
          </button>
          {' '}donde podras consultar informacion sobre tu cartera de credito actual.
        </div>
      </div>

      {/* ── Notificaciones ── */}
      <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #dceaf8', boxShadow: '0 2px 20px rgba(14,80,160,0.06)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 28px', borderBottom: '1px solid #dceaf8', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', background: '#fff8e8', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={18} color="#d97706" />
          </div>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', fontWeight: '700', color: '#0a2d5e' }}>Notificaciones</span>
          {notificaciones.length > 0 && (
            <span style={{ marginLeft: 'auto', background: '#fee2e2', color: '#991b1b', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px' }}>
              {notificaciones.length}
            </span>
          )}
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f4f8fd' }}>
                {['Fecha', 'Hora', 'Titulo', 'Opciones'].map(h => (
                  <th key={h} style={{ padding: '11px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '.07em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {notificaciones.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#90aac8', fontSize: '13px' }}>
                    <AlertCircle size={22} color="#dceaf8" style={{ display: 'block', margin: '0 auto 10px' }} />
                    Sin notificaciones pendientes
                  </td>
                </tr>
              ) : notificaciones.map((n, i) => (
                <tr key={i} style={{ borderTop: '1px solid #f0f6ff', background: i % 2 === 0 ? '#fff' : '#fafcff' }}>
                  <td style={{ padding: '12px 20px', fontSize: '13px', color: '#4a6a94' }}>{fmtFecha(n.createdAt)}</td>
                  <td style={{ padding: '12px 20px', fontSize: '13px', color: '#4a6a94' }}>{fmtHora(n.createdAt)}</td>
                  <td style={{ padding: '12px 20px', fontSize: '13px', fontWeight: '600', color: '#0a2d5e' }}>{n.titulo || n.mensaje}</td>
                  <td style={{ padding: '12px 20px' }}>
                    <button style={{ background: '#e8f2fc', border: 'none', borderRadius: '7px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: '#0e50a0', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Eye size={12} /> Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Cobranza de hoy ── */}
      <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #dceaf8', boxShadow: '0 2px 20px rgba(14,80,160,0.06)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 28px', borderBottom: '1px solid #dceaf8', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', background: '#e8f2fc', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DollarSign size={18} color="#0e50a0" />
          </div>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', fontWeight: '700', color: '#0a2d5e' }}>Cobranza de hoy</span>
        </div>
        <div style={{ padding: '32px 28px', textAlign: 'center' }}>
          {cobranza.totalPagos === 0 ? (
            <div style={{ color: '#90aac8', fontSize: '13px' }}>
              <TrendingUp size={28} color="#dceaf8" style={{ display: 'block', margin: '0 auto 12px' }} />
              Sin datos de cobranza por el momento
            </div>
          ) : (
            <>
              <p style={{ fontSize: '15px', color: '#4a6a94', marginBottom: '6px' }}>
                Hay <strong style={{ color: '#0a2d5e' }}>{cobranza.totalPagos} pagos</strong> para hoy que suman un total de{' '}
                <strong style={{ color: '#0a2d5e' }}>{formatMoney(cobranza.totalMonto)}</strong>
              </p>
              <p style={{ fontSize: '14px', color: '#4a6a94', marginBottom: '24px' }}>
                De estos te faltan{' '}
                <strong style={{ color: '#dc2626' }}>{cobranza.pagosFaltantes} pagos</strong> que suman{' '}
                <strong style={{ color: '#dc2626' }}>{formatMoney(cobranza.montoFaltante)}</strong>
              </p>
            </>
          )}
          <button
            onClick={() => onNavigate && onNavigate('Cobranza del dia')}
            style={{ background: '#0e50a0', border: 'none', borderRadius: '10px', padding: '11px 28px', fontSize: '13px', fontWeight: '600', color: '#fff', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', boxShadow: '0 4px 14px rgba(14,80,160,0.28)', marginTop: cobranza.totalPagos === 0 ? '16px' : '0' }}
          >
            Ver cobranza hoy
          </button>
        </div>
      </div>

    </div>
  );
}