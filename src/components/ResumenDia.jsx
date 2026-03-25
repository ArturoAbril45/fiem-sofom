'use client';
import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, AlertCircle, CreditCard, PiggyBank, Users, X, BarChart2, Wallet } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://fiem-backend-production.up.railway.app';

function formatMoney(amount) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(amount);
}

// Secciones sin módulo propio — se muestran como panel embebido
function PanelSinModulo({ titulo, descripcion, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(10,45,94,0.42)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', borderRadius: '22px', width: '100%', maxWidth: '440px', boxShadow: '0 32px 80px rgba(14,80,160,0.2)', overflow: 'hidden' }}>
        <div style={{ background: '#fff', borderBottom: '1px solid #dceaf8', padding: '22px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: '700', color: '#0a2d5e' }}>{titulo}</span>
          <button onClick={onClose} style={{ background: '#f0f6ff', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#4a6a94' }}><X size={16} /></button>
        </div>
        <div style={{ padding: '28px', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', background: '#e8f2fc', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <BarChart2 size={24} color="#0e50a0" />
          </div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', fontWeight: '700', color: '#0a2d5e', marginBottom: '10px' }}>{titulo}</div>
          <div style={{ fontSize: '13px', color: '#90aac8', lineHeight: '1.7' }}>{descripcion}</div>
          <div style={{ marginTop: '20px', padding: '14px', background: '#f4f8fd', borderRadius: '12px', border: '1px solid #dceaf8', fontSize: '12px', color: '#90aac8' }}>
            Conecta el backend para ver los datos de este apartado.
          </div>
        </div>
        <div style={{ padding: '0 28px 24px' }}>
          <button onClick={onClose} style={{ width: '100%', padding: '12px', border: 'none', background: '#0e50a0', borderRadius: '11px', fontFamily: 'DM Sans, sans-serif', fontSize: '14px', fontWeight: '600', color: '#fff', cursor: 'pointer', boxShadow: '0 4px 14px rgba(14,80,160,0.28)' }}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ResumenDia({ onNavigate }) {
  const [panel, setPanel] = useState(null);
  const [data, setData]   = useState({
    cartera:           { interes: 0, capital: 0, total: 0 },
    cobranza:          { totalPagos: 0, totalMonto: 0, faltanPagos: 0, faltanMonto: 0 },
    pagosVencidos:     { creditosAtraso: 0, pagosVencidos: 0, montoVencido: 0 },
    creditosVigentes:  { total: 0 },
    nuevosCreditos:    { cantidad: 0, capitalPrestado: 0, interesOrdinario: 0 },
    ahorro:            { cuentas: 0, saldoTotal: 0, depositosHoy: 0 },
    clientes:          { total: 0, nuevosHoy: 0 },
  });

  useEffect(() => {
    fetch(`${API}/api/resumen-dia`)
      .then(r => r.json())
      .then(d => setData({
        cartera:          { interes: d.cartera?.interes || 0,                capital: d.cartera?.capital || 0,             total: d.cartera?.total || 0 },
        cobranza:         { totalPagos: d.cobranza?.totalPagos || 0,         totalMonto: d.cobranza?.totalMonto || 0,      faltanPagos: d.cobranza?.faltanPagos || 0, faltanMonto: d.cobranza?.faltanMonto || 0 },
        pagosVencidos:    { creditosAtraso: d.creditosVencidos?.total || 0,  pagosVencidos: 0,                             montoVencido: 0 },
        creditosVigentes: { total: d.creditosVigentes?.total || 0 },
        nuevosCreditos:   { cantidad: d.nuevosCreditos?.cantidad || 0,       capitalPrestado: d.nuevosCreditos?.capitalPrestado || 0, interesOrdinario: d.nuevosCreditos?.interesOrdinario || 0 },
        ahorro:           { cuentas: d.ahorro?.cuentas || 0,                 saldoTotal: d.ahorro?.saldoTotal || 0,        depositosHoy: d.ahorro?.depositosHoy || 0 },
        clientes:         { total: d.clientes?.total || 0,                   nuevosHoy: 0 },
      }))
      .catch(() => {});
  }, []);

  const navegar = (destino) => onNavigate && onNavigate(destino);
  const abrirPanel = (titulo, descripcion) => setPanel({ titulo, descripcion });

  const card = { backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(14,80,160,0.06)', border: '1px solid #dceaf8', display: 'flex', flexDirection: 'column' };
  const btn = (color = '#0e50a0') => ({ backgroundColor: color, color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 0', fontSize: '13px', fontWeight: '600', cursor: 'pointer', width: '100%', fontFamily: 'DM Sans, sans-serif', boxShadow: `0 4px 12px ${color}44` });
  const cardTitle = { fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', fontWeight: '700', color: '#0a2d5e', margin: '0 0 12px 0' };
  const txt = { color: '#4a6a94', fontSize: '13px', margin: '0 0 5px 0', lineHeight: '1.6' };
  const kpi = (color = '#0a2d5e') => ({ color, fontSize: '32px', fontWeight: '700', fontFamily: "'Cormorant Garamond', serif", margin: '8px 0 16px 0', lineHeight: 1 });

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '28px', padding: '28px', background: '#fff', borderRadius: '20px', border: '1px solid #dceaf8', boxShadow: '0 2px 12px rgba(14,80,160,0.06)' }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', fontWeight: '700', color: '#0a2d5e', marginBottom: '6px' }}>
          Este es tu resumen del dia
        </div>
        <div style={{ color: '#4a6a94', fontSize: '13px', fontWeight: '600', marginBottom: '2px' }}>Oficina Central — Tizayuca</div>
        <div style={{ color: '#90aac8', fontSize: '12px' }}>
          {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Grid 4 cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '20px' }}>

        {/* Cobranza del dia — tiene módulo */}
        <div style={card}>
          <Wallet size={22} color="#0e50a0" style={{ marginBottom: '10px' }} />
          <h3 style={cardTitle}>Cobranza de hoy</h3>
          <p style={txt}>Hay <strong>{data.cobranza.totalPagos}</strong> pagos para hoy que suman <strong style={{ color: '#0e50a0' }}>{formatMoney(data.cobranza.totalMonto)}</strong></p>
          <p style={{ ...txt, marginBottom: '18px' }}>Faltan <strong>{data.cobranza.faltanPagos}</strong> pagos que suman <strong style={{ color: '#dc2626' }}>{formatMoney(data.cobranza.faltanMonto)}</strong></p>
          <button onClick={() => navegar('Cobranza del dia')} style={btn('#0e50a0')}>Ver cobranza hoy</button>
        </div>

        {/* Pagos vencidos — tiene módulo */}
        <div style={card}>
          <AlertCircle size={22} color="#dc2626" style={{ marginBottom: '10px' }} />
          <h3 style={cardTitle}>Pagos vencidos</h3>
          <p style={txt}><strong style={{ color: '#dc2626' }}>{data.pagosVencidos.creditosAtraso}</strong> creditos con atrasos</p>
          <p style={txt}><strong>{data.pagosVencidos.pagosVencidos}</strong> pagos vencidos</p>
          <p style={{ ...txt, marginBottom: '18px' }}>Suman <strong style={{ color: '#dc2626' }}>{formatMoney(data.pagosVencidos.montoVencido)}</strong></p>
          <button onClick={() => navegar('Abonos vencidos')} style={btn('#dc2626')}>Ver pagos vencidos</button>
        </div>

        {/* Creditos vigentes — tiene módulo */}
        <div style={card}>
          <CreditCard size={22} color="#0891b2" style={{ marginBottom: '10px' }} />
          <h3 style={cardTitle}>Creditos vigentes</h3>
          <p style={{ color: '#90aac8', fontSize: '13px', margin: '0 0 4px 0' }}>Creditos activos actualmente</p>
          <div style={kpi('#0e50a0')}>{data.creditosVigentes.total}</div>
          <button onClick={() => navegar('Consultar credito')} style={btn('#0891b2')}>Ver creditos</button>
        </div>

        {/* Nuevos creditos — navega a Reporte cartera credito */}
        <div style={card}>
          <TrendingUp size={22} color="#059669" style={{ marginBottom: '10px' }} />
          <h3 style={cardTitle}>Nuevos creditos hoy</h3>
          <p style={txt}><strong>{data.nuevosCreditos.cantidad}</strong> creditos nuevos hoy</p>
          <p style={txt}>Capital prestado: <strong style={{ color: '#0e50a0' }}>{formatMoney(data.nuevosCreditos.capitalPrestado)}</strong></p>
          <p style={{ ...txt, marginBottom: '18px' }}>Interes ordinario: <strong style={{ color: '#059669' }}>{formatMoney(data.nuevosCreditos.interesOrdinario)}</strong></p>
          <button onClick={() => navegar('Cartera de creditos')} style={btn('#059669')}>
            Ver detalle
          </button>
        </div>

      </div>


      {/* Panel modal para secciones sin módulo */}
      {panel && (
        <PanelSinModulo
          titulo={panel.titulo}
          descripcion={panel.descripcion}
          onClose={() => setPanel(null)}
        />
      )}
    </div>
  );
}