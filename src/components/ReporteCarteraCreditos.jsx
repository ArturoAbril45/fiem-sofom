'use client';
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, Download } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://fiem-backend-production.up.railway.app';
const fmt  = n => new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',minimumFractionDigits:2}).format(n||0);
const fmtK = v => v>=1000000?`${(v/1e6).toFixed(1)}M`:v>=1000?`${(v/1000).toFixed(0)}k`:v;
const fmtFecha = iso => iso ? iso.slice(0,10) : '—';
const inp = {border:'1.5px solid #dceaf8',borderRadius:'9px',padding:'8px 12px',fontSize:'12px',fontFamily:'DM Sans,sans-serif',color:'#1a3d6e',outline:'none',background:'#fafcff',boxSizing:'border-box'};
const lbl = t => <span style={{fontSize:'11px',fontWeight:'600',color:'#4a6a94',marginRight:'6px'}}>{t}</span>;

export default function ReporteCarteraCreditos() {
  const [creditos,   setCreditos]   = useState([]);
  const [busqueda,   setBusqueda]   = useState('');
  const [fechaIni,   setFechaIni]   = useState('2022-01-01');
  const [fechaFin,   setFechaFin]   = useState(new Date().toISOString().slice(0,10));
  const [producto,   setProducto]   = useState('');
  const [formaPago,  setFormaPago]  = useState('');
  const [estadoCred, setEstadoCred] = useState('ACTIVO');
  const [ejecutivo,  setEjecutivo]  = useState('');
  const [cargando,   setCargando]   = useState(false);

  const consultar = async () => {
    setCargando(true);
    try {
      const data = await fetch(`${API}/api/creditos`).then(r=>r.json());
      setCreditos(Array.isArray(data)?data:[]);
    } catch {}
    setCargando(false);
  };

  useEffect(()=>{ consultar(); },[]);

  // Gráfica: agrupar por fecha apertura
  const byFecha = creditos.reduce((acc,c)=>{
    const d=(c.createdAt||'').slice(0,10);
    if(!d) return acc;
    acc[d]=(acc[d]||0)+(c.monto||0);
    return acc;
  },{});
  const barData = Object.entries(byFecha)
    .sort((a,b)=>a[0].localeCompare(b[0]))
    .map(([fecha,monto])=>({fecha,monto}));

  const filtrados = creditos.filter(c=>{
    const txt=busqueda.toLowerCase();
    return !txt||(c.clienteNombre||'').toLowerCase().includes(txt)||(c.folio||'').toLowerCase().includes(txt)||(c.ruta||'').toLowerCase().includes(txt);
  });

  const totalCapital = filtrados.reduce((s,c)=>s+(c.monto||0),0);
  const totalInteres = filtrados.reduce((s,c)=>s+Math.round((c.monto||0)*((c.tasaInteres||0)/100)),0);

  // Acumulado por cliente
  const acumCliente = filtrados.reduce((acc,c)=>{
    acc[c.clienteId]=(acc[c.clienteId]||0)+1; return acc;
  },{});

  return (
    <div style={{maxWidth:'1200px',margin:'0 auto'}}>

      {/* Header */}
      <div style={{textAlign:'center',marginBottom:'20px',padding:'24px 28px',background:'#fff',borderRadius:'20px',border:'1px solid #dceaf8',boxShadow:'0 2px 12px rgba(14,80,160,0.06)'}}>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'26px',fontWeight:'700',color:'#0a2d5e',marginBottom:'4px'}}>Reporte cartera credito</div>
        <div style={{fontSize:'13px',fontWeight:'600',color:'#4a6a94',marginBottom:'2px'}}>Cartera activa creditos</div>
        <div style={{fontSize:'12px',color:'#90aac8'}}>Cartera registrada del periodo {fechaIni} al {fechaFin}</div>
      </div>

      {/* Filtros */}
      <div style={{background:'#fff',borderRadius:'16px',border:'1px solid #dceaf8',padding:'16px 22px',marginBottom:'18px',boxShadow:'0 2px 12px rgba(14,80,160,0.05)'}}>
        <div style={{fontSize:'13px',fontWeight:'700',color:'#0a2d5e',marginBottom:'12px'}}>Fecha referencia</div>
        <div style={{display:'flex',gap:'10px',flexWrap:'wrap',alignItems:'center',marginBottom:'10px'}}>
          {lbl('De la fecha')}<input type="date" value={fechaIni} onChange={e=>setFechaIni(e.target.value)} style={inp}/>
          {lbl('A la fecha')}<input type="date" value={fechaFin} onChange={e=>setFechaFin(e.target.value)} style={inp}/>
          {lbl('Producto')}<select value={producto} onChange={e=>setProducto(e.target.value)} style={{...inp,cursor:'pointer'}}><option value="">-Todos-</option><option>PERSONAL</option><option>GRUPAL</option></select>
          {lbl('Forma de pago')}<select value={formaPago} onChange={e=>setFormaPago(e.target.value)} style={{...inp,cursor:'pointer'}}><option value="">-Todos-</option><option>Semanal</option><option>Quincenal</option><option>Mensual</option><option>Diaria</option></select>
        </div>
        <div style={{display:'flex',gap:'10px',flexWrap:'wrap',alignItems:'center'}}>
          {lbl('Estado del credito')}<select value={estadoCred} onChange={e=>setEstadoCred(e.target.value)} style={{...inp,cursor:'pointer'}}><option>ACTIVO</option><option>VENCIDO</option><option>LIQUIDADO</option></select>
          {lbl('Ver los creditos del Ejecutivo')}<select value={ejecutivo} onChange={e=>setEjecutivo(e.target.value)} style={{...inp,cursor:'pointer',minWidth:'140px'}}><option value="">-Todos-</option></select>
          <button onClick={consultar} style={{background:'#0e50a0',border:'none',borderRadius:'9px',padding:'9px 18px',fontSize:'13px',fontWeight:'600',color:'#fff',cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>
            {cargando?'Consultando...':'Consultar creditos a esta fecha'}
          </button>
        </div>
      </div>

      {/* Gráfica */}
      <div style={{background:'#fff',borderRadius:'16px',border:'1px solid #dceaf8',padding:'20px 24px',marginBottom:'18px',boxShadow:'0 2px 12px rgba(14,80,160,0.05)'}}>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'17px',fontWeight:'700',color:'#0a2d5e',marginBottom:'2px'}}>Creditos aperturados</div>
        <div style={{fontSize:'11px',color:'#90aac8',marginBottom:'16px'}}>Informacion obtenida de los rangos seleccionados agrupados por suma de fechas</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barData} margin={{top:10,right:20,bottom:50,left:10}}>
            <XAxis dataKey="fecha" tick={{fontSize:9,fill:'#4a6a94'}} angle={-45} textAnchor="end"/>
            <YAxis tickFormatter={fmtK} tick={{fontSize:10,fill:'#90aac8'}}/>
            <Tooltip formatter={v=>fmt(v)}/>
            <Bar dataKey="monto" fill="#38bdf8" radius={[3,3,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
        <div style={{fontSize:'11px',color:'#dc2626',textAlign:'center',marginTop:'8px'}}>
          La tabla muestra la suma de los creditos agrupados por fecha correspondiente a los filtros seleccionados.
        </div>
      </div>

      {/* Resumen */}
      <div style={{background:'#fff',borderRadius:'14px',border:'1px solid #dceaf8',marginBottom:'14px',overflow:'hidden'}}>
        <div style={{fontSize:'14px',fontWeight:'700',color:'#0a2d5e',padding:'14px 20px',borderBottom:'1px solid #f0f6ff'}}>Informacion detallada</div>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{background:'#b2ebf2'}}>
              {['Numero de creditos','Cantidad capital otorgado','Interes ordinario generado'].map(h=>(
                <th key={h} style={{padding:'10px 20px',textAlign:'left',fontSize:'12px',fontWeight:'700',color:'#006064'}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{padding:'12px 20px',fontSize:'14px',fontWeight:'600',color:'#0a2d5e'}}>{filtrados.length}</td>
              <td style={{padding:'12px 20px',fontSize:'14px',fontWeight:'600',color:'#0a2d5e'}}>{totalCapital.toLocaleString('es-MX',{minimumFractionDigits:2})}</td>
              <td style={{padding:'12px 20px',fontSize:'14px',fontWeight:'600',color:'#0a2d5e'}}>{totalInteres.toLocaleString('es-MX',{minimumFractionDigits:2})}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Buscador */}
      <div style={{background:'#fff',borderRadius:'12px',border:'1px solid #dceaf8',padding:'10px 16px',marginBottom:'12px',display:'flex',alignItems:'center',gap:'10px'}}>
        <Search size={14} color="#90aac8"/>
        <input value={busqueda} onChange={e=>setBusqueda(e.target.value)} placeholder="Buscar credito por nombre cliente, id credito, monto, fecha, etc"
          style={{border:'none',outline:'none',fontSize:'13px',color:'#1a3d6e',background:'transparent',width:'100%',fontFamily:'DM Sans,sans-serif'}}/>
      </div>

      {/* Tabla */}
      <div style={{background:'#fff',borderRadius:'16px',border:'1px solid #dceaf8',boxShadow:'0 2px 12px rgba(14,80,160,0.05)',overflow:'hidden',marginBottom:'16px'}}>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:'12px'}}>
            <thead>
              <tr style={{background:'#b2ebf2'}}>
                {['Numero credito (ID)','Tipo credito','Nombre socio o grupo','Acumulado de Creditos del cliente','Ruta','fecha apertura','Plazo','Periodo','Monto prestado','Interes total','Tasa base','Tasa moratorio','Parcialidad','Opcion'].map(h=>(
                  <th key={h} style={{padding:'10px 12px',textAlign:'left',fontSize:'10px',fontWeight:'700',color:'#006064',whiteSpace:'nowrap'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.length===0?(
                <tr><td colSpan={14} style={{padding:'40px',textAlign:'center',color:'#90aac8',fontSize:'13px'}}>Sin registros</td></tr>
              ):filtrados.map((c,i)=>{
                const interes   = Math.round((c.monto||0)*((c.tasaInteres||0)/100));
                const parc      = c.monto&&c.plazo ? Math.round(((c.monto||0)+interes)/(c.plazo||1)) : 0;
                const acum      = acumCliente[c.clienteId]||1;
                return (
                  <tr key={c._id} style={{borderTop:'1px solid #f0f6ff',background:i%2===0?'#fff':'#f9fdff'}}>
                    <td style={{padding:'9px 12px',color:'#0a2d5e',fontWeight:'600'}}>{c.folio||c._id?.slice(-4)}</td>
                    <td style={{padding:'9px 12px',color:'#4a6a94'}}>PRESTAMO PERSONAL</td>
                    <td style={{padding:'9px 12px',color:'#1a3d6e',fontWeight:'500',whiteSpace:'nowrap'}}>{c.clienteNombre}</td>
                    <td style={{padding:'9px 12px',color:'#0e50a0',textAlign:'center'}}>{acum}</td>
                    <td style={{padding:'9px 12px',color:'#4a6a94'}}>{c.ruta||'—'}</td>
                    <td style={{padding:'9px 12px',color:'#4a6a94',whiteSpace:'nowrap'}}>{fmtFecha(c.createdAt)}</td>
                    <td style={{padding:'9px 12px',color:'#0a2d5e',textAlign:'center'}}>{c.plazo||'—'}</td>
                    <td style={{padding:'9px 12px',color:'#4a6a94'}}>{c.frecuencia||'SEMANAL'}</td>
                    <td style={{padding:'9px 12px',color:'#059669',fontWeight:'600'}}>{fmt(c.monto)}</td>
                    <td style={{padding:'9px 12px',color:'#0e50a0',fontWeight:'600'}}>{fmt(interes)}</td>
                    <td style={{padding:'9px 12px',color:'#4a6a94'}}>{c.tasaInteres||0}</td>
                    <td style={{padding:'9px 12px',color:'#4a6a94'}}>{c.tasaMoratoria||0}</td>
                    <td style={{padding:'9px 12px',color:'#0a2d5e',fontWeight:'600'}}>{fmt(parc)}</td>
                    <td style={{padding:'9px 12px'}}>
                      <button style={{background:'#0e50a0',border:'none',borderRadius:'6px',padding:'5px 14px',fontSize:'11px',fontWeight:'600',color:'#fff',cursor:'pointer'}}>
                        Consultar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Descargar */}
      <button style={{background:'#1565c0',border:'none',borderRadius:'8px',padding:'12px',fontSize:'13px',fontWeight:'600',color:'#fff',cursor:'pointer',fontFamily:'DM Sans,sans-serif',display:'flex',alignItems:'center',gap:'8px'}}>
        <Download size={14}/> Descargar en formato excel
      </button>

    </div>
  );
}
