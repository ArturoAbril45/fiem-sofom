'use client';
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Search } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://fiem-backend-production.up.railway.app';

const fmt  = n => new Intl.NumberFormat('es-MX', { style:'currency', currency:'MXN', minimumFractionDigits:0 }).format(n||0);
const fmtK = v => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}k` : v;

const inp = { border:'1.5px solid #dceaf8', borderRadius:'9px', padding:'9px 13px', fontSize:'13px', fontFamily:'DM Sans,sans-serif', color:'#1a3d6e', outline:'none', background:'#fafcff', boxSizing:'border-box' };
const lbl = t => <label style={{ fontSize:'11px', fontWeight:'600', color:'#90aac8', textTransform:'uppercase', letterSpacing:'.07em', display:'block', marginBottom:'5px' }}>{t}</label>;

export default function ReporteValorCartera() {
  const [creditos, setCreditos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRuta, setFiltroRuta] = useState('');

  useEffect(() => {
    fetch(`${API}/api/creditos?estatus=Vigente`)
      .then(r => r.json())
      .then(d => setCreditos(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  // Cálculos
  const calcInteres = c => Math.round((c.monto || 0) * ((c.tasaInteres || 0) / 100));
  const calcMoratorio = c => c.estatus === 'Vencido' ? Math.round((c.saldo || 0) * 0.05) : 0;

  const credsFiltrados = creditos.filter(c => {
    const txt = busqueda.toLowerCase();
    const ok = !txt || (c.clienteNombre||'').toLowerCase().includes(txt) || (c.folio||'').toLowerCase().includes(txt) || String(c.monto||'').includes(txt);
    const rutaOk = !filtroRuta || c.ruta === filtroRuta;
    return ok && rutaOk;
  });

  const totalCapital  = creditos.reduce((s,c) => s + (c.saldo||0), 0);
  const totalInteres  = creditos.reduce((s,c) => s + calcInteres(c), 0);
  const totalGeneral  = totalCapital + totalInteres;
  const vigentes      = creditos.filter(c => c.estatus !== 'Vencido');
  const vencidos      = creditos.filter(c => c.estatus === 'Vencido');
  const capVigente    = vigentes.reduce((s,c) => s + (c.saldo||0), 0);
  const capVencido    = vencidos.reduce((s,c) => s + (c.saldo||0), 0);
  const pagosVencidos = vencidos.reduce((s,c) => s + (c.plazo||0) - (c.pagosRealizados||0), 0);
  const totalMoratorio = creditos.reduce((s,c) => s + calcMoratorio(c), 0);

  const rutas = [...new Set(creditos.map(c => c.ruta).filter(Boolean))];

  const barData = [
    { name: 'Interés actual', valor: totalInteres },
    { name: 'Capital actual', valor: totalCapital },
  ];

  const pieTotal = capVigente + capVencido || 1;
  const pieData = [
    { name: `Cartera al corriente (Normalidad): ${((capVigente/pieTotal)*100).toFixed(1)} %`, value: capVigente },
    { name: `Saldo en atraso (Interés y mora): ${((capVencido/pieTotal)*100).toFixed(1)} %`,  value: capVencido },
  ];
  const COLORS = ['#4ade80', '#93c5fd'];

  return (
    <div style={{ maxWidth:'1100px', margin:'0 auto' }}>

      {/* Header */}
      <div style={{ textAlign:'center', marginBottom:'24px', padding:'28px', background:'#fff', borderRadius:'20px', border:'1px solid #dceaf8', boxShadow:'0 2px 12px rgba(14,80,160,0.06)' }}>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'26px', fontWeight:'700', color:'#0a2d5e', marginBottom:'4px' }}>Valor de cartera de credito</div>
        <div style={{ fontSize:'13px', fontWeight:'600', color:'#4a6a94', marginBottom:'2px' }}>Cartera activa creditos</div>
        <div style={{ fontSize:'12px', color:'#90aac8' }}>Esta informacion representa el valor de la cartera actual</div>
      </div>

      {/* Filtros */}
      <div style={{ background:'#fff', borderRadius:'16px', border:'1px solid #dceaf8', padding:'18px 24px', marginBottom:'20px', boxShadow:'0 2px 12px rgba(14,80,160,0.05)' }}>
        <div style={{ fontSize:'13px', fontWeight:'700', color:'#0a2d5e', marginBottom:'12px' }}>Fecha referencia</div>
        <div style={{ display:'flex', gap:'14px', flexWrap:'wrap', alignItems:'flex-end' }}>
          <div>{lbl('Forma de pago')}<select style={{ ...inp, cursor:'pointer', minWidth:'140px' }}><option>-Todos-</option><option>Semanal</option><option>Quincenal</option><option>Mensual</option></select></div>
          <div>{lbl('Ejecutivo')}<select style={{ ...inp, cursor:'pointer', minWidth:'160px' }}><option>-Todos-</option></select></div>
          <button style={{ background:'#0e50a0', border:'none', borderRadius:'9px', padding:'10px 20px', fontSize:'13px', fontWeight:'600', color:'#fff', cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>
            Consultar creditos a esta fecha
          </button>
        </div>
      </div>

      {/* Gráficas */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'18px', marginBottom:'20px' }}>

        {/* Barra */}
        <div style={{ background:'#fff', borderRadius:'16px', border:'1px solid #dceaf8', padding:'20px 24px', boxShadow:'0 2px 12px rgba(14,80,160,0.05)' }}>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'16px', fontWeight:'700', color:'#0a2d5e', marginBottom:'4px' }}>Valor actual de cartera</div>
          <div style={{ fontSize:'11px', color:'#90aac8', marginBottom:'16px' }}>Informacion obtenida de los rangos seleccionados agrupados por suma de fechas</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} margin={{ top:10, right:10, bottom:30, left:10 }}>
              <XAxis dataKey="name" tick={{ fontSize:11, fill:'#4a6a94' }} angle={-20} textAnchor="end" />
              <YAxis tickFormatter={fmtK} tick={{ fontSize:11, fill:'#90aac8' }} />
              <Tooltip formatter={v => fmt(v)} />
              <Bar dataKey="valor" fill="#1d6fce" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie */}
        <div style={{ background:'#fff', borderRadius:'16px', border:'1px solid #dceaf8', padding:'20px 24px', boxShadow:'0 2px 12px rgba(14,80,160,0.05)' }}>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'16px', fontWeight:'700', color:'#0a2d5e', marginBottom:'16px' }}>Informacion en tiempo real</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={85} dataKey="value" label={({ percent }) => `${(percent*100).toFixed(1)}%`} labelLine={false}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Legend iconSize={12} wrapperStyle={{ fontSize:'11px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Resumen */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'18px', marginBottom:'20px' }}>
        {/* Izquierda */}
        <div style={{ background:'#fff', borderRadius:'16px', border:'1px solid #dceaf8', padding:'22px 26px', boxShadow:'0 2px 12px rgba(14,80,160,0.05)' }}>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'17px', fontWeight:'700', color:'#0a2d5e', marginBottom:'12px' }}>Valor de cartera total de creditos</div>
          {[
            { l:'Creditos actuales',           v: creditos.length },
            { l:'Valor total de interes actual', v: fmt(totalInteres) },
            { l:'Valor total de capital actual', v: fmt(totalCapital) },
            { l:'Valor general de la cartera',  v: fmt(totalGeneral) },
          ].map(({l,v}) => (
            <div key={l} style={{ fontSize:'13px', color:'#4a6a94', marginBottom:'6px' }}>
              <span style={{ color:'#0a2d5e' }}>-{l}: </span><strong style={{ color:'#0e50a0' }}>{v}</strong>
            </div>
          ))}
          <div style={{ marginTop:'16px', fontFamily:"'Cormorant Garamond',serif", fontSize:'15px', fontWeight:'700', color:'#0a2d5e', marginBottom:'8px' }}>De esto tu cartera vencida es la siguiente:</div>
          {[
            { l:'Creditos que presentan atrasos', v: vencidos.length },
            { l:'Pagos vencidos',                 v: pagosVencidos },
            { l:'Que suman capital vencido',       v: fmt(capVencido) },
            { l:'Moratorio total',                 v: fmt(totalMoratorio) },
            { l:'Vencido general',                 v: fmt(capVencido + totalMoratorio) },
          ].map(({l,v}) => (
            <div key={l} style={{ fontSize:'13px', color:'#4a6a94', marginBottom:'4px' }}>
              <span>- {l}: </span><strong style={{ color:'#dc2626' }}>{v}</strong>
            </div>
          ))}
        </div>

        {/* Derecha */}
        <div style={{ background:'#fff', borderRadius:'16px', border:'1px solid #dceaf8', padding:'22px 26px', boxShadow:'0 2px 12px rgba(14,80,160,0.05)' }}>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'17px', fontWeight:'700', color:'#0a2d5e', marginBottom:'12px' }}>Indicadores actuales:</div>
          {[
            { l:'Cartera Total (CAPITAL E INTERES)',                       v: fmt(totalGeneral),              c:'#0a2d5e' },
            { l:'Cartera al corriente (Normalidad) (CAPITAL E INTERES)',   v: fmt(capVigente + totalInteres),  c:'#059669' },
            { l:'Saldo en atraso (CAPITAL E INTERES)',                     v: fmt(capVencido),                 c:'#dc2626' },
            { l:'Intereses moratorios generados',                          v: fmt(totalMoratorio),             c:'#d97706' },
          ].map(({l,v,c}) => (
            <div key={l} style={{ fontSize:'13px', color:'#4a6a94', marginBottom:'10px', paddingBottom:'8px', borderBottom:'1px solid #f0f6ff' }}>
              -{l}: <strong style={{ color:c }}>{v}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* Buscador */}
      <div style={{ background:'#fff', borderRadius:'12px', border:'1px solid #dceaf8', padding:'10px 16px', marginBottom:'12px', display:'flex', alignItems:'center', gap:'10px' }}>
        <Search size={15} color="#90aac8" />
        <input
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar credito por nombre cliente, id credito, monto, fecha, etc"
          style={{ border:'none', outline:'none', fontSize:'13px', color:'#1a3d6e', background:'transparent', width:'100%', fontFamily:'DM Sans,sans-serif' }}
        />
        <select value={filtroRuta} onChange={e => setFiltroRuta(e.target.value)} style={{ ...inp, minWidth:'150px', padding:'6px 10px' }}>
          <option value="">Todas las rutas</option>
          {rutas.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* Tabla */}
      <div style={{ background:'#fff', borderRadius:'16px', border:'1px solid #dceaf8', boxShadow:'0 2px 12px rgba(14,80,160,0.05)', overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'12px' }}>
            <thead>
              <tr style={{ background:'#f4f8fd' }}>
                {['Numero credito (ID)','Nombre socio o grupo','Nombre Ruta','Capital Vigente','Capital Vencido','Total Capital actual','Interes Vigente','Interes Vencido','Interes actual','Total','Moratorio Generado','Total con moratorio'].map(h => (
                  <th key={h} style={{ padding:'10px 12px', textAlign:'left', fontSize:'10px', fontWeight:'700', color:'#90aac8', textTransform:'uppercase', letterSpacing:'.06em', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {credsFiltrados.length === 0 ? (
                <tr><td colSpan={12} style={{ padding:'40px', textAlign:'center', color:'#90aac8', fontSize:'13px' }}>Sin datos</td></tr>
              ) : credsFiltrados.map((c, i) => {
                const esVencido    = c.estatus === 'Vencido';
                const capitalVig   = esVencido ? 0 : (c.saldo||0);
                const capitalVenc  = esVencido ? (c.saldo||0) : 0;
                const interes      = calcInteres(c);
                const interesVig   = esVencido ? 0 : interes;
                const interesVenc  = esVencido ? interes : 0;
                const moratorio    = calcMoratorio(c);
                const total        = (c.saldo||0) + interes;
                const totalMor     = total + moratorio;
                const bg           = esVencido ? '#fff7f7' : i%2===0 ? '#fff' : '#fafcff';
                return (
                  <tr key={c._id} style={{ borderTop:'1px solid #f0f6ff', background: bg }}>
                    <td style={{ padding:'10px 12px', color:'#0a2d5e', fontWeight:'600' }}>{c.folio || c._id?.slice(-6)}</td>
                    <td style={{ padding:'10px 12px', color:'#1a3d6e', whiteSpace:'nowrap' }}>{c.clienteNombre}</td>
                    <td style={{ padding:'10px 12px', color:'#4a6a94' }}>{c.ruta || '—'}</td>
                    <td style={{ padding:'10px 12px', color:'#059669' }}>{capitalVig ? fmt(capitalVig) : '$0'}</td>
                    <td style={{ padding:'10px 12px', color:'#dc2626' }}>{capitalVenc ? fmt(capitalVenc) : '$0'}</td>
                    <td style={{ padding:'10px 12px', color:'#0a2d5e', fontWeight:'600' }}>{fmt(c.saldo||0)}</td>
                    <td style={{ padding:'10px 12px', color:'#059669' }}>{interesVig ? fmt(interesVig) : '$0'}</td>
                    <td style={{ padding:'10px 12px', color:'#dc2626' }}>{interesVenc ? fmt(interesVenc) : '$0'}</td>
                    <td style={{ padding:'10px 12px', color:'#0a2d5e' }}>{fmt(interes)}</td>
                    <td style={{ padding:'10px 12px', color:'#0e50a0', fontWeight:'600' }}>{fmt(total)}</td>
                    <td style={{ padding:'10px 12px', color:'#d97706' }}>{moratorio ? fmt(moratorio) : '$0'}</td>
                    <td style={{ padding:'10px 12px', color:'#0a2d5e', fontWeight:'700' }}>{fmt(totalMor)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
