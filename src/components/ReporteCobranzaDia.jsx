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

const RUTA_COLORS = ['#0e50a0','#059669','#dc2626','#d97706','#7c3aed','#0891b2','#be185d','#65a30d'];

function MapaCobranza({ creditos }) {
  const ref     = useRef(null);
  const mapRef  = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (typeof window === 'undefined' || !ref.current) return;
    import('leaflet').then(L => {
      // CSS de Leaflet
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (!mapRef.current) {
        mapRef.current = L.map(ref.current, { zoomControl: true, attributionControl: false }).setView([19.83, -99.16], 10);
        // Tile oscuro y moderno
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
        }).addTo(mapRef.current);
        L.control.attribution({ prefix: '© CartoDB © OSM' }).addTo(mapRef.current);
      }

      // Limpiar marcadores anteriores
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      if (creditos.length === 0) return;

      // Rutas únicas → color
      const rutas = [...new Set(creditos.map(c => c.ruta || 'Sin ruta'))];
      const rutaColor = Object.fromEntries(rutas.map((r, i) => [r, RUTA_COLORS[i % RUTA_COLORS.length]]));

      const lats = [19.83,19.91,19.75,20.08,19.98,19.70,19.88,20.01,19.65,19.79,19.55,19.62,19.72,19.95,20.12];
      const lngs = [-99.16,-99.22,-99.10,-99.30,-99.18,-99.05,-99.35,-99.08,-99.25,-98.97,-99.40,-98.90,-99.55,-98.80,-99.20];

      creditos.slice(0, 40).forEach((c, i) => {
        const lat   = lats[i % lats.length] + (Math.random() - 0.5) * 0.18;
        const lng   = lngs[i % lngs.length] + (Math.random() - 0.5) * 0.18;
        const ruta  = c.ruta || 'Sin ruta';
        const color = rutaColor[ruta];

        const icon = L.divIcon({
          className: '',
          html: `<div style="
            width:32px;height:32px;
            background:${color};
            border:3px solid #fff;
            border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);
            box-shadow:0 3px 10px rgba(0,0,0,0.35);
            cursor:pointer;
            transition:transform .2s;
          "></div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -34],
        });

        const marker = L.marker([lat, lng], { icon })
          .bindPopup(`
            <div style="font-family:DM Sans,sans-serif;min-width:180px">
              <div style="font-weight:700;color:#0a2d5e;font-size:13px;margin-bottom:4px">${c.clienteNombre || '—'}</div>
              <div style="font-size:11px;color:#4a6a94;margin-bottom:2px">📍 Ruta: <b>${ruta}</b></div>
              <div style="font-size:11px;color:#4a6a94;margin-bottom:2px">💳 Folio: <b>${c.folio || '—'}</b></div>
              <div style="font-size:11px;color:#059669;font-weight:700">Saldo: $${Number(c.saldo||0).toLocaleString('es-MX')}</div>
            </div>
          `, { maxWidth: 220 })
          .addTo(mapRef.current);
        markersRef.current.push(marker);
      });

      // Leyenda de rutas
      const legend = L.control({ position: 'bottomright' });
      legend.onAdd = () => {
        const div = L.DomUtil.create('div');
        div.innerHTML = `<div style="background:#fff;padding:10px 14px;border-radius:10px;box-shadow:0 2px 10px rgba(0,0,0,0.15);font-family:DM Sans,sans-serif;font-size:11px;max-width:160px">
          <b style="color:#0a2d5e;display:block;margin-bottom:6px">Rutas</b>
          ${rutas.slice(0,8).map(r => `<div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
            <span style="width:10px;height:10px;border-radius:50%;background:${rutaColor[r]};flex-shrink:0"></span>
            <span style="color:#4a6a94;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:120px">${r}</span>
          </div>`).join('')}
        </div>`;
        return div;
      };
      legend.addTo(mapRef.current);
    });
  }, [creditos]);

  return (
    <div style={{ position:'relative' }}>
      <div ref={ref} style={{ height:'440px', borderRadius:'16px', overflow:'hidden', border:'1px solid #dceaf8', boxShadow:'0 4px 20px rgba(14,80,160,0.1)' }} />
      {creditos.length === 0 && (
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(244,248,253,0.85)', borderRadius:'16px' }}>
          <span style={{ fontSize:'13px', color:'#90aac8' }}>Consulta para ver los puntos en el mapa</span>
        </div>
      )}
    </div>
  );
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
