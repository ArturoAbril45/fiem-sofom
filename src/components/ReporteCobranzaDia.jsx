'use client';
import { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, Download } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://fiem-backend-production.up.railway.app';
const fmt  = n => new Intl.NumberFormat('es-MX', { style:'currency', currency:'MXN', minimumFractionDigits:0 }).format(n||0);
const fmtFecha = iso => iso ? new Date(iso).toLocaleDateString('es-MX',{day:'2-digit',month:'2-digit',year:'numeric'}) : '—';
const fmtK = v => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}k` : v;

const inp = { border:'1.5px solid #dceaf8', borderRadius:'9px', padding:'8px 12px', fontSize:'12px', fontFamily:'DM Sans,sans-serif', color:'#1a3d6e', outline:'none', background:'#fafcff', boxSizing:'border-box' };
const lbl = t => <span style={{ fontSize:'11px', fontWeight:'600', color:'#4a6a94', marginRight:'6px' }}>{t}</span>;

function MapaCobranza({ creditos }) {
  const ref = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !ref.current || creditos.length === 0) return;
    import('leaflet').then(L => {
      if (ref.current._leaflet_id) return;
      const map = L.map(ref.current).setView([19.83, -99.16], 10);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);
      // Puntos simulados cerca del centro (sin coordenadas reales en el modelo)
      const lats = [19.83, 19.91, 19.75, 20.08, 19.98, 19.70, 19.88, 20.01, 19.65, 19.79];
      const lngs = [-99.16, -99.22, -99.10, -99.30, -99.18, -99.05, -99.35, -99.08, -99.25, -98.97];
      creditos.slice(0, 30).forEach((_, i) => {
        const lat = lats[i % lats.length] + (Math.random() - 0.5) * 0.15;
        const lng = lngs[i % lngs.length] + (Math.random() - 0.5) * 0.15;
        L.marker([lat, lng]).addTo(map);
      });
    });
  }, [creditos]);

  return <div ref={ref} style={{ height:'380px', borderRadius:'16px', overflow:'hidden', border:'1px solid #dceaf8' }} />;
}

export default function ReporteCobranzaDia() {
  const today = new Date().toISOString().split('T')[0];
  const [fechaIni,  setFechaIni]  = useState(today);
  const [fechaFin,  setFechaFin]  = useState(today);
  const [tipoProd,  setTipoProd]  = useState('');
  const [formaPago, setFormaPago] = useState('');
  const [estadoCred,setEstadoCred]= useState('ACTIVO');
  const [estadoPago,setEstadoPago]= useState('No pagados');
  const [ejecutivo, setEjecutivo] = useState('');
  const [abonos,    setAbonos]    = useState([]);
  const [creditos,  setCreditos]  = useState([]);
  const [busqueda,  setBusqueda]  = useState('');
  const [cargando,  setCargando]  = useState(false);

  const consultar = async () => {
    setCargando(true);
    try {
      const [ab, cr] = await Promise.all([
        fetch(`${API}/api/abonos?fecha=${fechaIni}`).then(r => r.json()),
        fetch(`${API}/api/creditos?estatus=Vigente`).then(r => r.json()),
      ]);
      setAbonos(Array.isArray(ab) ? ab : []);
      setCreditos(Array.isArray(cr) ? cr : []);
    } catch { }
    setCargando(false);
  };

  useEffect(() => { consultar(); }, []);

  // Datos gráfica
  const agrupadoFecha = abonos.reduce((acc, a) => {
    const d = (a.fecha || a.createdAt || '').slice(0, 10);
    acc[d] = (acc[d] || 0) + (a.monto || 0);
    return acc;
  }, {});
  const barData = Object.entries(agrupadoFecha).map(([fecha, monto]) => ({ fecha, monto }));

  // Créditos filtrados para tabla
  const creditosFiltrados = creditos.filter(c => {
    const txt = busqueda.toLowerCase();
    return !txt || (c.clienteNombre||'').toLowerCase().includes(txt) || (c.folio||'').toLowerCase().includes(txt);
  });

  const totalAbonos = abonos.reduce((s, a) => s + (a.monto || 0), 0);

  return (
    <div style={{ maxWidth:'1100px', margin:'0 auto' }}>

      {/* Header */}
      <div style={{ textAlign:'center', marginBottom:'20px', padding:'24px 28px', background:'#fff', borderRadius:'20px', border:'1px solid #dceaf8', boxShadow:'0 2px 12px rgba(14,80,160,0.06)' }}>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'26px', fontWeight:'700', color:'#0a2d5e', marginBottom:'4px' }}>Cobranza del dia</div>
        <div style={{ fontSize:'13px', color:'#90aac8' }}>Pagos a recibir segun la consulta</div>
      </div>

      {/* Filtros */}
      <div style={{ background:'#fff', borderRadius:'16px', border:'1px solid #dceaf8', padding:'16px 22px', marginBottom:'18px', boxShadow:'0 2px 12px rgba(14,80,160,0.05)' }}>
        <div style={{ fontSize:'13px', fontWeight:'700', color:'#0a2d5e', marginBottom:'12px' }}>Filtro de busqueda avanzada</div>
        <div style={{ display:'flex', gap:'10px', flexWrap:'wrap', alignItems:'center', marginBottom:'10px' }}>
          {lbl('De la fecha')}<input type="date" value={fechaIni} onChange={e=>setFechaIni(e.target.value)} style={inp} />
          {lbl('A la fecha')}<input type="date" value={fechaFin} onChange={e=>setFechaFin(e.target.value)} style={inp} />
          {lbl('Tipo producto')}<select value={tipoProd} onChange={e=>setTipoProd(e.target.value)} style={{ ...inp, cursor:'pointer' }}><option value="">-Todos-</option><option>PERSONAL</option><option>GRUPAL</option></select>
          {lbl('Forma de pago')}<select value={formaPago} onChange={e=>setFormaPago(e.target.value)} style={{ ...inp, cursor:'pointer' }}><option value="">-Todos-</option><option>Semanal</option><option>Quincenal</option><option>Mensual</option></select>
        </div>
        <div style={{ display:'flex', gap:'10px', flexWrap:'wrap', alignItems:'center' }}>
          {lbl('Estado del credito')}<select value={estadoCred} onChange={e=>setEstadoCred(e.target.value)} style={{ ...inp, cursor:'pointer' }}><option>ACTIVO</option><option>VENCIDO</option><option>LIQUIDADO</option></select>
          {lbl('Estado Pago')}<select value={estadoPago} onChange={e=>setEstadoPago(e.target.value)} style={{ ...inp, cursor:'pointer' }}><option>-No pagados-</option><option>Pagados</option><option>Todos</option></select>
          {lbl('Ejecutivo')}<select value={ejecutivo} onChange={e=>setEjecutivo(e.target.value)} style={{ ...inp, cursor:'pointer', minWidth:'140px' }}><option value="">-Todos-</option></select>
          <button onClick={consultar} style={{ background:'#0e50a0', border:'none', borderRadius:'9px', padding:'9px 18px', fontSize:'13px', fontWeight:'600', color:'#fff', cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>
            {cargando ? 'Consultando...' : 'Consultar pagos'}
          </button>
        </div>
      </div>

      {/* Gráfica */}
      <div style={{ background:'#fff', borderRadius:'16px', border:'1px solid #dceaf8', padding:'20px 24px', marginBottom:'18px', boxShadow:'0 2px 12px rgba(14,80,160,0.05)' }}>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'17px', fontWeight:'700', color:'#0a2d5e', marginBottom:'2px' }}>Abonos</div>
        <div style={{ fontSize:'11px', color:'#90aac8', marginBottom:'16px' }}>Informacion obtenida de los rangos seleccionados agrupados por suma de fechas</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barData} margin={{ top:10, right:20, bottom:30, left:10 }}>
            <XAxis dataKey="fecha" tick={{ fontSize:11, fill:'#4a6a94' }} angle={-20} textAnchor="end" />
            <YAxis tickFormatter={fmtK} tick={{ fontSize:11, fill:'#90aac8' }} />
            <Tooltip formatter={v => fmt(v)} />
            <Bar dataKey="monto" fill="#38bdf8" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
        <div style={{ fontSize:'11px', color:'#dc2626', textAlign:'center', marginTop:'8px' }}>
          La tabla muestra la suma de los abonos agrupados por fecha correspondiente a los filtros seleccionados.
        </div>
      </div>

      {/* Resumen */}
      <div style={{ fontSize:'16px', fontWeight:'700', color:'#0a2d5e', marginBottom:'14px', padding:'0 4px' }}>
        La consulta resulto que Hay <strong style={{ color:'#0e50a0' }}>{creditosFiltrados.length}</strong> abonos que suman una cantidad de <strong style={{ color:'#0e50a0' }}>{fmt(totalAbonos)}</strong>
      </div>

      {/* Buscador */}
      <div style={{ background:'#fff', borderRadius:'12px', border:'1px solid #dceaf8', padding:'10px 16px', marginBottom:'12px', display:'flex', alignItems:'center', gap:'10px' }}>
        <Search size={14} color="#90aac8" />
        <input value={busqueda} onChange={e=>setBusqueda(e.target.value)} placeholder="Buscar solicitud por nombre cliente, id credito, monto, fecha, etc"
          style={{ border:'none', outline:'none', fontSize:'13px', color:'#1a3d6e', background:'transparent', width:'100%', fontFamily:'DM Sans,sans-serif' }} />
      </div>

      {/* Tabla */}
      <div style={{ background:'#fff', borderRadius:'16px', border:'1px solid #dceaf8', boxShadow:'0 2px 12px rgba(14,80,160,0.05)', overflow:'hidden', marginBottom:'16px' }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'12px' }}>
            <thead>
              <tr style={{ background:'#d1f5d3' }}>
                {['Numero credito (ID)','Numero socio o grupo','Nombre socio o grupo','Ruta','Colonia','fecha ultimo pago','Cantidad pagos','Cantidad',''].map(h => (
                  <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:'11px', fontWeight:'700', color:'#14532d', textTransform:'uppercase', letterSpacing:'.05em', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {creditosFiltrados.length === 0 ? (
                <tr><td colSpan={9} style={{ padding:'40px', textAlign:'center', color:'#90aac8', fontSize:'13px' }}>Sin registros para esta consulta</td></tr>
              ) : creditosFiltrados.map((c, i) => (
                <tr key={c._id} style={{ borderTop:'1px solid #f0f6ff', background: i%2===0 ? '#fff' : '#fafcff' }}>
                  <td style={{ padding:'10px 14px', color:'#0a2d5e', fontWeight:'600' }}>{c.folio || c._id?.slice(-4)}</td>
                  <td style={{ padding:'10px 14px', color:'#4a6a94' }}>{i + 1}</td>
                  <td style={{ padding:'10px 14px', color:'#1a3d6e', fontWeight:'500' }}>{c.clienteNombre}</td>
                  <td style={{ padding:'10px 14px', color:'#4a6a94' }}>{c.ruta || '—'}</td>
                  <td style={{ padding:'10px 14px', color:'#4a6a94' }}>—</td>
                  <td style={{ padding:'10px 14px', color:'#4a6a94' }}>{fmtFecha(c.createdAt)}</td>
                  <td style={{ padding:'10px 14px', color:'#0e50a0', fontWeight:'600' }}>{c.pagosRealizados || 1}</td>
                  <td style={{ padding:'10px 14px', color:'#0a2d5e', fontWeight:'600' }}>{fmt(c.saldo)}</td>
                  <td style={{ padding:'10px 14px' }}>
                    <button style={{ background:'#e8f2fc', border:'none', borderRadius:'7px', padding:'5px 12px', fontSize:'11px', fontWeight:'600', color:'#0e50a0', cursor:'pointer', whiteSpace:'nowrap' }}>
                      Ir a pago
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Descargar Excel */}
      <div style={{ marginBottom:'28px' }}>
        <button style={{ width:'100%', background:'#0e50a0', border:'none', borderRadius:'10px', padding:'13px', fontSize:'14px', fontWeight:'600', color:'#fff', cursor:'pointer', fontFamily:'DM Sans,sans-serif', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
          <Download size={15} /> Descargar en formato excel
        </button>
      </div>

      {/* Mapa */}
      <div style={{ background:'#fff', borderRadius:'20px', border:'1px solid #dceaf8', padding:'22px 24px', boxShadow:'0 2px 12px rgba(14,80,160,0.06)' }}>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'20px', fontWeight:'700', color:'#0a2d5e', textAlign:'center', marginBottom:'16px' }}>
          Planifica tu ruta de cobranza
        </div>
        <MapaCobranza creditos={creditosFiltrados} />
      </div>

    </div>
  );
}
