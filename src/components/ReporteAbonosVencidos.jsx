'use client';
import { useState, useEffect, useRef } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Search, Download } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://fiem-backend-production.up.railway.app';
const fmt  = n => new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',minimumFractionDigits:0}).format(n||0);
const fmtK = v => v>=1000000?`${(v/1e6).toFixed(1)}M`:v>=1000?`${(v/1000).toFixed(0)}k`:v;
const fmtFecha = iso => iso ? new Date(iso).toLocaleDateString('es-MX',{day:'2-digit',month:'2-digit',year:'numeric'}) : '—';
const inp = {border:'1.5px solid #dceaf8',borderRadius:'9px',padding:'8px 12px',fontSize:'12px',fontFamily:'DM Sans,sans-serif',color:'#1a3d6e',outline:'none',background:'#fafcff',boxSizing:'border-box'};
const lbl = t => <span style={{fontSize:'11px',fontWeight:'600',color:'#4a6a94',marginRight:'6px'}}>{t}</span>;

// Color por pagos vencidos
function colorFila(pagosVenc) {
  if (pagosVenc >= 11) return { bg:'#374151', tx:'#fff' };
  if (pagosVenc >= 6)  return { bg:'#fca5a5', tx:'#7f1d1d' };
  if (pagosVenc >= 4)  return { bg:'#fdba74', tx:'#7c2d12' };
  return { bg:'#fef08a', tx:'#713f12' };
}

function colorPin(pagosVenc) {
  if (pagosVenc >= 11) return '#374151';
  if (pagosVenc >= 6)  return '#dc2626';
  if (pagosVenc >= 4)  return '#f97316';
  return '#eab308';
}

function MapaVencidos({ creditos }) {
  const ref    = useRef(null);
  const mapRef = useRef(null);
  const mksRef = useRef([]);

  useEffect(() => {
    if (typeof window === 'undefined' || !ref.current) return;
    import('leaflet').then(L => {
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id='leaflet-css'; link.rel='stylesheet';
        link.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }
      if (!mapRef.current) {
        mapRef.current = L.map(ref.current,{zoomControl:true,attributionControl:false}).setView([19.83,-99.16],10);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',{maxZoom:19}).addTo(mapRef.current);
        L.control.attribution({prefix:'© CartoDB © OSM'}).addTo(mapRef.current);
      }
      mksRef.current.forEach(m=>m.remove()); mksRef.current=[];
      if (!creditos.length) return;
      const lats=[19.83,19.91,19.75,20.08,19.98,19.70,19.88,20.01,19.65,19.79,19.55,19.62,19.72,19.95,20.12];
      const lngs=[-99.16,-99.22,-99.10,-99.30,-99.18,-99.05,-99.35,-99.08,-99.25,-98.97,-99.40,-98.90,-99.55,-98.80,-99.20];
      creditos.slice(0,50).forEach((c,i) => {
        const pv   = c._pagosVenc || 1;
        const color= colorPin(pv);
        const lat  = lats[i%lats.length]+(Math.random()-.5)*.18;
        const lng  = lngs[i%lngs.length]+(Math.random()-.5)*.18;
        const icon = L.divIcon({
          className:'',
          html:`<div style="width:28px;height:28px;background:${color};border:2.5px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 3px 8px rgba(0,0,0,0.35)"></div>`,
          iconSize:[28,28],iconAnchor:[14,28],popupAnchor:[0,-30]
        });
        const m = L.marker([lat,lng],{icon})
          .bindPopup(`<div style="font-family:DM Sans,sans-serif;min-width:170px">
            <b style="color:#0a2d5e">${c.clienteNombre||'—'}</b><br/>
            <span style="font-size:11px;color:#4a6a94">Ruta: <b>${c.ruta||'—'}</b></span><br/>
            <span style="font-size:11px;color:#dc2626;font-weight:700">Pagos vencidos: ${pv}</span><br/>
            <span style="font-size:11px;color:#0e50a0">Saldo: ${fmt(c.saldo)}</span>
          </div>`,{maxWidth:200})
          .addTo(mapRef.current);
        mksRef.current.push(m);
      });
    });
  }, [creditos]);

  return (
    <div style={{position:'relative'}}>
      <div ref={ref} style={{height:'420px',borderRadius:'16px',overflow:'hidden',border:'1px solid #dceaf8',boxShadow:'0 4px 20px rgba(14,80,160,0.1)'}}/>
      {!creditos.length && (
        <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(244,248,253,0.85)',borderRadius:'16px'}}>
          <span style={{fontSize:'13px',color:'#90aac8'}}>Consulta para ver los puntos en el mapa</span>
        </div>
      )}
    </div>
  );
}

export default function ReporteAbonosVencidos() {
  const [fechaIni,  setFechaIni]  = useState('2020-01-01');
  const [fechaFin,  setFechaFin]  = useState(new Date().toISOString().split('T')[0]);
  const [tipoProd,  setTipoProd]  = useState('');
  const [formaPago, setFormaPago] = useState('');
  const [ejecutivo, setEjecutivo] = useState('');
  const [creditos,  setCreditos]  = useState([]);
  const [busqueda,  setBusqueda]  = useState('');
  const [cargando,  setCargando]  = useState(false);

  const consultar = async () => {
    setCargando(true);
    try {
      const cr = await fetch(`${API}/api/creditos?estatus=Vencido`).then(r=>r.json());
      // Simular pagos vencidos basados en plazo - pagosRealizados
      const conPV = (Array.isArray(cr)?cr:[]).map(c => ({
        ...c,
        _pagosVenc: Math.max(0,(c.plazo||0)-(c.pagosRealizados||0)),
      }));
      setCreditos(conPV);
    } catch {}
    setCargando(false);
  };

  useEffect(()=>{ consultar(); },[]);

  // Gráfica multi-línea: agrupar por fecha creación
  const byFecha = creditos.reduce((acc,c) => {
    const d = (c.createdAt||'').slice(0,10);
    if (!d) return acc;
    if (!acc[d]) acc[d] = { fecha:d, total:0, capital:0, interes:0, moratorio:0 };
    const interes   = Math.round((c.monto||0)*((c.tasaInteres||0)/100));
    const moratorio = Math.round((c.saldo||0)*0.05);
    acc[d].capital   += (c.saldo||0);
    acc[d].interes   += interes;
    acc[d].moratorio += moratorio;
    acc[d].total     += (c.saldo||0)+interes+moratorio;
    return acc;
  },{});
  const barData = Object.values(byFecha).sort((a,b)=>a.fecha.localeCompare(b.fecha));

  const filtrados = creditos.filter(c => {
    const txt = busqueda.toLowerCase();
    return !txt||(c.clienteNombre||'').toLowerCase().includes(txt)||(c.folio||'').toLowerCase().includes(txt);
  });

  const totalSuma = filtrados.reduce((s,c)=>{
    const i=Math.round((c.monto||0)*((c.tasaInteres||0)/100));
    const m=Math.round((c.saldo||0)*0.05);
    return s+(c.saldo||0)+i+m;
  },0);

  return (
    <div style={{maxWidth:'1100px',margin:'0 auto'}}>

      {/* Header */}
      <div style={{textAlign:'center',marginBottom:'20px',padding:'24px 28px',background:'#fff',borderRadius:'20px',border:'1px solid #dceaf8',boxShadow:'0 2px 12px rgba(14,80,160,0.06)'}}>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'26px',fontWeight:'700',color:'#0a2d5e',marginBottom:'6px'}}>Abonos vencidos</div>
        <div style={{fontSize:'13px',color:'#4a6a94',fontWeight:'500'}}>Se consideran solo los pagos que tienen de 1 a mas dias de atraso que no se han aplicado</div>
      </div>

      {/* Filtros */}
      <div style={{background:'#fff',borderRadius:'16px',border:'1px solid #dceaf8',padding:'16px 22px',marginBottom:'18px',boxShadow:'0 2px 12px rgba(14,80,160,0.05)'}}>
        <div style={{fontSize:'13px',fontWeight:'700',color:'#0a2d5e',marginBottom:'12px'}}>Filtro de busqueda avanzada</div>
        <div style={{display:'flex',gap:'10px',flexWrap:'wrap',alignItems:'center',marginBottom:'10px'}}>
          {lbl('De la fecha')}<input type="date" value={fechaIni} onChange={e=>setFechaIni(e.target.value)} style={inp}/>
          {lbl('A la fecha')}<input type="date" value={fechaFin} onChange={e=>setFechaFin(e.target.value)} style={inp}/>
          {lbl('Tipo producto')}<select value={tipoProd} onChange={e=>setTipoProd(e.target.value)} style={{...inp,cursor:'pointer'}}><option value="">-Todos-</option><option>PERSONAL</option><option>GRUPAL</option></select>
          {lbl('Forma de pago')}<select value={formaPago} onChange={e=>setFormaPago(e.target.value)} style={{...inp,cursor:'pointer'}}><option value="">-Todos-</option><option>Semanal</option><option>Quincenal</option><option>Mensual</option></select>
        </div>
        <div style={{display:'flex',gap:'10px',flexWrap:'wrap',alignItems:'center'}}>
          {lbl('Ejecutivo')}<select value={ejecutivo} onChange={e=>setEjecutivo(e.target.value)} style={{...inp,cursor:'pointer',minWidth:'140px'}}><option value="">-Todos-</option></select>
          <button onClick={consultar} style={{background:'#0e50a0',border:'none',borderRadius:'9px',padding:'9px 18px',fontSize:'13px',fontWeight:'600',color:'#fff',cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>
            {cargando?'Consultando...':'Consultar pagos a esta fecha'}
          </button>
        </div>
      </div>

      {/* Gráfica */}
      <div style={{background:'#fff',borderRadius:'16px',border:'1px solid #dceaf8',padding:'20px 24px',marginBottom:'18px',boxShadow:'0 2px 12px rgba(14,80,160,0.05)'}}>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'17px',fontWeight:'700',color:'#0a2d5e',marginBottom:'2px'}}>Desglose de abonos vencidos</div>
        <div style={{fontSize:'11px',color:'#90aac8',marginBottom:'16px'}}>Agrupados por fechas</div>
        <ResponsiveContainer width="100%" height={230}>
          <ComposedChart data={barData} margin={{top:10,right:20,bottom:40,left:10}}>
            <XAxis dataKey="fecha" tick={{fontSize:9,fill:'#4a6a94'}} angle={-35} textAnchor="end"/>
            <YAxis tickFormatter={fmtK} tick={{fontSize:10,fill:'#90aac8'}}/>
            <Tooltip formatter={v=>fmt(v)}/>
            <Legend iconSize={10} wrapperStyle={{fontSize:'11px'}}/>
            <Bar dataKey="total"     name="Total"     fill="#38bdf8" radius={[2,2,0,0]}/>
            <Bar dataKey="capital"   name="Capital"   fill="#6366f1" radius={[2,2,0,0]}/>
            <Bar dataKey="interes"   name="Interes"   fill="#22c55e" radius={[2,2,0,0]}/>
            <Bar dataKey="moratorio" name="Moratorio" fill="#f97316" radius={[2,2,0,0]}/>
          </ComposedChart>
        </ResponsiveContainer>
        <div style={{fontSize:'11px',color:'#dc2626',textAlign:'center',marginTop:'8px'}}>
          La tabla muestra la suma de los abonos agrupados por fecha correspondiente a los filtros seleccionados.
        </div>
      </div>

      {/* Leyenda colores */}
      <div style={{background:'#fff',borderRadius:'14px',border:'1px solid #dceaf8',padding:'14px 20px',marginBottom:'14px',boxShadow:'0 2px 8px rgba(14,80,160,0.05)'}}>
        <div style={{fontWeight:'700',fontSize:'12px',color:'#0a2d5e',marginBottom:'8px'}}>ColorValor</div>
        <div style={{display:'flex',flexWrap:'wrap',gap:'12px'}}>
          {[
            {bg:'#fef08a',tx:'#713f12',label:'Hasta 3 pagos vencidos'},
            {bg:'#fdba74',tx:'#7c2d12',label:'Hasta 5 pagos vencidos'},
            {bg:'#fca5a5',tx:'#7f1d1d',label:'Hasta 10 pagos vencidos'},
            {bg:'#374151',tx:'#fff',   label:'Mas de 10 pagos vencidos'},
          ].map(({bg,tx,label})=>(
            <div key={label} style={{display:'flex',alignItems:'center',gap:'8px'}}>
              <div style={{width:'20px',height:'16px',background:bg,borderRadius:'4px',border:'1px solid rgba(0,0,0,0.1)'}}/>
              <span style={{fontSize:'12px',color:'#4a6a94'}}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Buscador */}
      <div style={{background:'#fff',borderRadius:'12px',border:'1px solid #dceaf8',padding:'10px 16px',marginBottom:'12px',display:'flex',alignItems:'center',gap:'10px'}}>
        <Search size={14} color="#90aac8"/>
        <input value={busqueda} onChange={e=>setBusqueda(e.target.value)} placeholder="Buscar solicitud por nombre cliente, id credito, monto, fecha, etc"
          style={{border:'none',outline:'none',fontSize:'13px',color:'#1a3d6e',background:'transparent',width:'100%',fontFamily:'DM Sans,sans-serif'}}/>
      </div>

      {/* Tabla */}
      <div style={{background:'#fff',borderRadius:'16px',border:'1px solid #dceaf8',boxShadow:'0 2px 12px rgba(14,80,160,0.05)',overflow:'hidden',marginBottom:'16px'}}>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:'12px'}}>
            <thead>
              <tr style={{background:'#d1f5d3'}}>
                {['Numero credito (ID)','Numero socio o grupo','Nombre socio o grupo','Ruta','fecha ultimo pago vencido','Cantidad pagos vencidos','Capital','Interes','Parcialidad','Moratorios','Cantidad total a pagar','Opcion'].map(h=>(
                  <th key={h} style={{padding:'10px 12px',textAlign:'left',fontSize:'10px',fontWeight:'700',color:'#14532d',textTransform:'uppercase',letterSpacing:'.05em',whiteSpace:'nowrap'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.length===0?(
                <tr><td colSpan={12} style={{padding:'40px',textAlign:'center',color:'#90aac8',fontSize:'13px'}}>Sin registros vencidos</td></tr>
              ):filtrados.map((c,i)=>{
                const pv     = c._pagosVenc||1;
                const {bg,tx}= colorFila(pv);
                const interes = Math.round((c.monto||0)*((c.tasaInteres||0)/100));
                const parc    = (c.saldo||0)+interes;
                const mora    = Math.round((c.saldo||0)*0.05);
                const total   = parc+mora;
                return (
                  <tr key={c._id} style={{borderTop:'1px solid rgba(0,0,0,0.05)',background:bg,color:tx}}>
                    <td style={{padding:'9px 12px',fontWeight:'600'}}>{c.folio||c._id?.slice(-4)}</td>
                    <td style={{padding:'9px 12px'}}>{i+1}</td>
                    <td style={{padding:'9px 12px',fontWeight:'500'}}>{c.clienteNombre}</td>
                    <td style={{padding:'9px 12px'}}>{c.ruta||'—'}</td>
                    <td style={{padding:'9px 12px'}}>{fmtFecha(c.createdAt)}</td>
                    <td style={{padding:'9px 12px',fontWeight:'700',textAlign:'center'}}>{pv}</td>
                    <td style={{padding:'9px 12px'}}>{fmt(c.saldo)}</td>
                    <td style={{padding:'9px 12px'}}>{fmt(interes)}</td>
                    <td style={{padding:'9px 12px',fontWeight:'600'}}>{fmt(parc)}</td>
                    <td style={{padding:'9px 12px'}}>{fmt(mora)}</td>
                    <td style={{padding:'9px 12px',fontWeight:'700'}}>{fmt(total)}</td>
                    <td style={{padding:'9px 12px'}}>
                      <button style={{background:'rgba(255,255,255,0.35)',border:'1px solid rgba(0,0,0,0.15)',borderRadius:'6px',padding:'4px 10px',fontSize:'11px',fontWeight:'600',cursor:'pointer',color:tx}}>
                        Ir a pago
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Total */}
      <div style={{fontSize:'14px',fontWeight:'600',color:'#0a2d5e',marginBottom:'14px',padding:'0 4px'}}>
        La suma de los abonos corresponde a los valores de consulta: <strong style={{color:'#0e50a0'}}>{fmt(totalSuma)}</strong>
      </div>

      {/* Descargar */}
      <div style={{marginBottom:'28px'}}>
        <button style={{width:'100%',background:'#0e50a0',border:'none',borderRadius:'10px',padding:'13px',fontSize:'14px',fontWeight:'600',color:'#fff',cursor:'pointer',fontFamily:'DM Sans,sans-serif',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
          <Download size={15}/> Descargar en formato excel
        </button>
      </div>

      {/* Mapa */}
      <div style={{background:'#fff',borderRadius:'20px',border:'1px solid #dceaf8',padding:'22px 24px',boxShadow:'0 2px 12px rgba(14,80,160,0.06)'}}>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'20px',fontWeight:'700',color:'#0a2d5e',textAlign:'center',marginBottom:'16px'}}>
          Planifica tu ruta de cobranza
        </div>
        <MapaVencidos creditos={filtrados}/>
      </div>

    </div>
  );
}
