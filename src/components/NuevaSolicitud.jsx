'use client';
import React, { useState, useEffect } from 'react';
import { Search, User, AlertCircle, CheckCircle, Loader, Plus, X, DollarSign, Eye, FileText, Clock, CheckSquare, XSquare, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://fiem-backend-production.up.railway.app';
const fmt  = v => `$${(parseFloat(v)||0).toLocaleString('es-MX',{minimumFractionDigits:2})}`;
const fmtF = d => d ? new Date(d).toLocaleDateString('es-MX',{day:'2-digit',month:'2-digit',year:'numeric'}) : '—';

const S = {
  card:    { background:'#fff', borderRadius:'16px', borderWidth:'1px', borderStyle:'solid', borderColor:'#dceaf8', boxShadow:'0 2px 14px rgba(14,80,160,0.07)', marginBottom:'16px', overflow:'hidden' },
  head:    { padding:'13px 20px', background:'#f4f8fd', borderBottomWidth:'1px', borderBottomStyle:'solid', borderBottomColor:'#dceaf8', fontFamily:"'Cormorant Garamond',serif", fontSize:'17px', fontWeight:'700', color:'#0a2d5e', display:'flex', alignItems:'center', gap:'10px' },
  body:    { padding:'16px 20px' },
  input:   { border:'1.5px solid #dceaf8', borderRadius:'8px', padding:'6px 11px', fontSize:'13px', fontFamily:'DM Sans,sans-serif', color:'#1a3d6e', outline:'none', background:'#fafcff', boxSizing:'border-box' },
  inputRO: { border:'1.5px solid #f0f6ff', borderRadius:'8px', padding:'6px 11px', fontSize:'13px', fontFamily:'DM Sans,sans-serif', color:'#4a6a94', outline:'none', background:'#f8fbff', boxSizing:'border-box' },
  lbl:     { fontSize:'11px', fontWeight:'700', color:'#90aac8', textTransform:'uppercase', letterSpacing:'0.06em', marginRight:'5px', whiteSpace:'nowrap' },
  sel:     { border:'1.5px solid #dceaf8', borderRadius:'8px', padding:'6px 10px', fontSize:'13px', fontFamily:'DM Sans,sans-serif', color:'#1a3d6e', outline:'none', background:'#fafcff', cursor:'pointer', boxSizing:'border-box' },
  subHead: { background:'#e8f2fc', borderRadius:'6px', padding:'5px 12px', marginBottom:'10px', fontSize:'11px', fontWeight:'700', color:'#0e50a0', textTransform:'uppercase', letterSpacing:'0.05em' },
  btnVerde:{ background:'#22c55e', color:'#fff', border:'none', borderRadius:'10px', padding:'12px 0', fontSize:'14px', fontWeight:'700', cursor:'pointer', width:'100%', boxShadow:'0 4px 14px rgba(34,197,94,0.25)' },
  btnOsc:  { background:'#0d1f5c', color:'#fff', border:'none', borderRadius:'10px', padding:'12px 0', fontSize:'14px', fontWeight:'700', cursor:'pointer', width:'100%', boxShadow:'0 4px 14px rgba(13,31,92,0.25)' },
  btnRojo: { background:'#dc2626', color:'#fff', border:'none', borderRadius:'10px', padding:'12px 0', fontSize:'14px', fontWeight:'700', cursor:'pointer', width:'100%', boxShadow:'0 4px 14px rgba(220,38,38,0.2)' },
  btnAzul: { background:'#0e50a0', color:'#fff', border:'none', borderRadius:'8px', padding:'7px 16px', fontSize:'12px', fontWeight:'600', cursor:'pointer', boxShadow:'0 3px 10px rgba(14,80,160,0.2)' },
  btnGris: { background:'#64748b', color:'#fff', border:'none', borderRadius:'10px', padding:'12px 0', fontSize:'14px', fontWeight:'700', cursor:'pointer', width:'100%' },
};

const Lbl = ({children,w='auto'}) => <span style={{...S.lbl,width:w,display:'inline-block'}}>{children}</span>;
const Inp = ({val,onChange,type='text',w='130px',ph='',ro=false}) => (
  <input type={type} value={val||''} onChange={ro?undefined:e=>onChange(e.target.value)}
    readOnly={ro} placeholder={ph} style={{...(ro?S.inputRO:S.input),width:w}}/>
);
const Sel = ({val,onChange,opts=[],w='130px',ph=''}) => (
  <select value={val||''} onChange={e=>onChange(e.target.value)} style={{...S.sel,width:w}}>
    {ph && <option value="">{ph}</option>}
    {opts.map(o=><option key={o} value={o}>{o}</option>)}
  </select>
);

const Pill = ({v}) => {
  const cfg = {
    'Pendiente':  {bg:'#fef3c7',c:'#92400e'},
    'Aprobada':   {bg:'#dcfce7',c:'#166534'},
    'Rechazada':  {bg:'#fee2e2',c:'#991b1b'},
    'En revisión':{bg:'#e0f2fe',c:'#0c4a6e'},
    'Cancelada':  {bg:'#f1f5f9',c:'#475569'},
  };
  const s = cfg[v]||{bg:'#f1f5f9',c:'#475569'};
  return <span style={{background:s.bg,color:s.c,borderRadius:'20px',padding:'3px 10px',fontSize:'11px',fontWeight:'700'}}>{v||'—'}</span>;
};

const Msg = ({tipo,msg}) => msg ? (
  <div style={{background:tipo==='ok'?'#dcfce7':'#fee2e2',borderWidth:'1px',borderStyle:'solid',borderColor:tipo==='ok'?'#86efac':'#fca5a5',borderRadius:'10px',padding:'10px 14px',marginBottom:'12px',color:tipo==='ok'?'#166534':'#dc2626',fontSize:'13px',fontWeight:'600',display:'flex',alignItems:'center',gap:'7px'}}>
    {tipo==='ok'?<CheckCircle size={14}/>:<AlertCircle size={14}/>}{msg}
  </div>
) : null;

// ════════════════════════════════════════════════════════════
export default function NuevaSolicitud() {
  
  const [paso,        setPaso]       = useState(1);
  const [productos,   setProductos]  = useState([]);
  const [prodSel,     setProdSel]    = useState(null);
  const [cargando,    setCargando]   = useState(false);
  const [msgOk,       setMsgOk]      = useState('');
  const [msgErr,      setMsgErr]     = useState('');
  const [enviando,    setEnviando]   = useState(false);
  const [modalPlan,   setModalPlan]  = useState(false);
  const [tablaPlan,   setTablaPlan]  = useState([]);

  // Lista de solicitudes
  const [solicitudes,  setSolicitudes]  = useState([]);
  const [cargSol,      setCargSol]      = useState(false);
  const [solicDetalle, setSolicDetalle] = useState(null);
  const [filtroBusc,   setFiltroBusc]   = useState('');
  const [filtroEst,    setFiltroEst]    = useState('');
  const [aprobando,    setAprobando]    = useState(false);
  const [modalAprob,   setModalAprob]   = useState(false);
  const [modalRechaz,  setModalRechaz]  = useState(false);
  const [motivoRech,   setMotivoRech]   = useState('');
  const [fechaInicio,  setFechaInicio]  = useState('');

  // Personal
  const [numSocio,    setNumSocio]   = useState('');
  const [cliente,     setCliente]    = useState(null);
  const [buscCli,     setBuscCli]    = useState(false);
  const [errCli,      setErrCli]     = useState('');
  const [resultsCli,  setResultsCli] = useState([]);
  const [avales,      setAvales]     = useState([]);

  // Grupal
  const [miembros,    setMiembros]   = useState([]);
  const [numSocioG,   setNumSocioG]  = useState('');
  const [buscG,       setBuscG]      = useState(false);
  const [errG,        setErrG]       = useState('');
  const [nombreGrupo, setNombreGrupo]= useState('');

  // Características
  const [tipoCNBV,    setTipoCNBV]   = useState('AL CONSUMO');
  const [monto,       setMonto]      = useState('');
  const [iva,         setIva]        = useState('0');
  const [formaPago,   setFormaPago]  = useState('SEMANAL');
  const [plazo,       setPlazo]      = useState('12');
  const [tbN,         setTbN]        = useState('FIJA');
  const [tipoTasa,    setTipoTasa]   = useState('MENSUAL');
  const [tasa,        setTasa]       = useState('');
  const [tbM,         setTbM]        = useState('FIJA');
  const [tipoTasaM,   setTipoTasaM]  = useState('MENSUAL');
  const [pctMor,      setPctMor]     = useState('');
  const [destino,     setDestino]    = useState('');

  // Financiero
  const [ingresoM,    setIngresoM]   = useState('0');
  const [otrosIng,    setOtrosIng]   = useState('0');
  const [gastos,      setGastos]     = useState({alimento:'',luz:'',telefono:'',transporte:'',renta:'',inversion:'',creditos:'',otros:''});

  const esGrupal = prodSel?.nombre?.toUpperCase().includes('GRUPAL') || prodSel?.clave === 'GRUPAL';

  const PRODS_DEFAULT = [
    {_id:'p1', clave:'PERSONAL', nombre:'PRESTAMO PERSONAL', activo:true},
    {_id:'p2', clave:'GRUPAL',   nombre:'PRESTAMO GRUPAL',   activo:true},
  ];

  useEffect(()=>{ fetchProds(); fetchSolicitudes(); },[]);

  const fetchProds = async () => {
    setCargando(true);
    try {
      const res = await fetch(`${API}/api/productos-credito`);
      const d   = await res.json();
      const arr = Array.isArray(d) ? d.filter(p=>p.activo!==false) : [];
      setProductos(arr.length>0 ? arr : PRODS_DEFAULT);
    } catch { setProductos(PRODS_DEFAULT); }
    finally { setCargando(false); }
  };

  const fetchSolicitudes = async () => {
    setCargSol(true);
    try {
      let url = `${API}/api/solicitudes?`;
      if (filtroEst)  url += `estatus=${encodeURIComponent(filtroEst)}&`;
      if (filtroBusc) url += `busqueda=${encodeURIComponent(filtroBusc)}&`;
      const res = await fetch(url);
      const d   = await res.json();
      setSolicitudes(Array.isArray(d) ? d : []);
    } catch { setSolicitudes([]); }
    finally { setCargSol(false); }
  };

  useEffect(()=>{ fetchSolicitudes(); },[filtroEst]);

  // ── Buscar cliente con resultados múltiples ──
  const buscarCliente = async () => {
    if (!numSocio.trim()) return;
    setBuscCli(true); setErrCli(''); setCliente(null); setResultsCli([]);
    try {
      const res = await fetch(`${API}/api/clientes?busqueda=${encodeURIComponent(numSocio)}`);
      const d   = await res.json();
      const arr = Array.isArray(d) ? d : (d.clientes||[]);
      if (!arr.length) { setErrCli('No se encontró ningún cliente.'); return; }
      if (arr.length === 1) {
        const cl = arr[0];
        if (cl.estatus==='Lista negra') { setErrCli('Cliente en lista negra — no puede solicitar crédito.'); return; }
        setCliente(cl);
        if (cl.ingresoMensual) setIngresoM(String(cl.ingresoMensual));
        if (cl.gastos) setGastos(g=>({...g,...cl.gastos}));
      } else {
        setResultsCli(arr.filter(c=>c.estatus!=='Lista negra'));
      }
    } catch { setErrCli('Error al conectar con el servidor.'); }
    finally { setBuscCli(false); }
  };

  const seleccionarCliente = (cl) => {
    setCliente(cl);
    setResultsCli([]);
    if (cl.ingresoMensual) setIngresoM(String(cl.ingresoMensual));
    if (cl.gastos) setGastos(g=>({...g,...cl.gastos}));
  };

  const buscarMiembro = async () => {
    if (!numSocioG.trim()) return;
    setBuscG(true); setErrG('');
    try {
      const res = await fetch(`${API}/api/clientes?busqueda=${encodeURIComponent(numSocioG)}`);
      const d   = await res.json();
      const arr = Array.isArray(d) ? d : (d.clientes||[]);
      if (!arr.length) { setErrG('No se encontró cliente.'); return; }
      const cl = arr[0];
      if (cl.estatus==='Lista negra') { setErrG('Cliente en lista negra.'); return; }
      if (miembros.find(m=>m._id===cl._id)) { setErrG('Ya está en el grupo.'); return; }
      setMiembros(m=>[...m,{...cl,montoIndividual:''}]);
      if (!nombreGrupo) setNombreGrupo(`GRUPO-${cl.apellidoP}`);
      setNumSocioG('');
    } catch { setErrG('Error al buscar.'); }
    finally { setBuscG(false); }
  };

  const quitarMiembro = i => setMiembros(m=>m.filter((_,j)=>j!==i));
  const chMonto       = (i,v) => setMiembros(m=>{ const n=[...m]; n[i]={...n[i],montoIndividual:v}; return n; });
  const agregarAval   = () => setAvales(a=>[...a,{nombre:'',curp:'',telefono:''}]);
  const quitarAval    = i => setAvales(a=>a.filter((_,j)=>j!==i));
  const chAval        = (i,f,v) => setAvales(a=>{ const n=[...a]; n[i]={...n[i],[f]:v}; return n; });
  const chGasto       = (k,v) => setGastos(g=>({...g,[k]:v}));

  const ingresoTotal = (parseFloat(ingresoM)||0)+(parseFloat(otrosIng)||0);
  const totalGasto   = Object.values(gastos).reduce((a,v)=>a+(parseFloat(v)||0),0);
  const totalDisp    = ingresoTotal-totalGasto;

  const simularPlan = () => {
    const capital  = parseFloat(monto)||0;
    const tasaP    = parseFloat(tasa)/100||0;
    const periodos = parseInt(plazo)||1;
    const ivaP     = parseFloat(iva)/100||0;
    const pagoPer  = tasaP===0 ? capital/periodos : (capital*tasaP)/(1-Math.pow(1+tasaP,-periodos));
    const saltoMap = {DIARIA:1,SEMANAL:7,CATORCENAL:14,QUINCENAL:15,MENSUAL:30};
    const salto    = saltoMap[formaPago]||7;
    const hoy      = new Date();
    const filas    = [];
    let saldo      = capital;
    for (let i=1; i<=periodos; i++) {
      const fp = new Date(hoy); fp.setDate(hoy.getDate()+salto*i);
      const interes      = saldo*tasaP;
      const ivaMonto     = interes*ivaP;
      const abonoCapital = Math.max(pagoPer-interes-ivaMonto, 0);
      saldo = Math.max(saldo-abonoCapital, 0);
      filas.push({
        periodo:i,
        fecha:fp.toLocaleDateString('es-MX',{year:'numeric',month:'2-digit',day:'2-digit'}),
        capitalPendiente: saldo+abonoCapital,
        abonoCapital, interes, iva:ivaMonto,
        pagoTotal: pagoPer+ivaMonto, saldoFinal: saldo,
      });
    }
    setTablaPlan(filas);
    setModalPlan(true);
  };

  const construirPayload = () => ({
    tipo:          esGrupal ? 'GRUPAL' : 'PERSONAL',
    clienteId:     !esGrupal ? cliente?._id : undefined,
    clienteNombre: !esGrupal ? `${cliente?.apellidoP||''} ${cliente?.apellidoM||''} ${cliente?.nombre||''}`.trim() : undefined,
    clienteCurp:   !esGrupal ? cliente?.curp : undefined,
    rutaVinculacion: !esGrupal ? cliente?.rutaVinculacion : undefined,
    miembros:      esGrupal ? miembros.map(m=>({
      clienteId:m._id,
      nombre:`${m.apellidoP||''} ${m.apellidoM||''} ${m.nombre||''}`.trim(),
      curp:m.curp,
      montoIndividual:parseFloat(m.montoIndividual)||0
    })) : undefined,
    nombreGrupo:    esGrupal ? nombreGrupo : undefined,
    producto:       prodSel?.nombre,
    productoId:     prodSel?._id,
    monto:          parseFloat(monto)||0,
    plazo:          parseInt(plazo)||1,
    frecuencia:     formaPago,
    destino,
    tipoCNBV,
    tasaInteres:    parseFloat(tasa)||0,
    tasaMoratoria:  parseFloat(pctMor)||0,
    tbN, tipoTasa, tbM, tipoTasaM,
    iva:            parseFloat(iva)||0,
    avales:         !esGrupal ? avales : [],
    ingresoMensual: parseFloat(ingresoM)||0,
    otrosIngresos:  parseFloat(otrosIng)||0,
    gastos,
    tablaPagos:     tablaPlan,
    estatus:        'Pendiente',
    fecha:          new Date().toISOString(),
  });

  const enviarSolicitud = async () => {
    if (esGrupal && !miembros.length) { setMsgErr('Agrega al menos un miembro al grupo.'); return; }
    if (!esGrupal && !cliente)        { setMsgErr('Selecciona un cliente.'); return; }
    if (!monto || parseFloat(monto)<=0) { setMsgErr('Ingresa un monto válido.'); return; }
    if (!tasa)                        { setMsgErr('Ingresa la tasa de interés.'); return; }
    setEnviando(true); setMsgErr('');
    try {
      const res  = await fetch(`${API}/api/solicitudes`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(construirPayload())});
      const data = await res.json();
      if (!res.ok) throw new Error(data.error||'Error al guardar');
      setMsgOk(`✅ Solicitud creada — Folio: ${data._id?.slice(-8).toUpperCase()||'—'}`);
      setTimeout(()=>setMsgOk(''),6000);
      resetForm();
      
      fetchSolicitudes();
    } catch(e) { setMsgErr(e.message); setTimeout(()=>setMsgErr(''),5000); }
    finally { setEnviando(false); }
  };

  // ── Aprobar solicitud → crear crédito ──
  const aprobarSolicitud = async () => {
    if (!solicDetalle || !fechaInicio) { setMsgErr('Selecciona la fecha de inicio del crédito.'); return; }
    setAprobando(true);
    try {
      // 1. Actualizar estatus solicitud
      await fetch(`${API}/api/solicitudes/${solicDetalle._id}`,{
        method:'PUT',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({estatus:'Aprobada',fechaAprobacion:new Date().toISOString()})
      });
      // 2. Crear crédito
      const creditoPayload = {
        clienteId:      solicDetalle.clienteId,
        clienteNombre:  solicDetalle.clienteNombre,
        clienteCurp:    solicDetalle.clienteCurp,
        solicitudId:    solicDetalle._id,
        producto:       solicDetalle.producto,
        tipo:           solicDetalle.tipo||'PERSONAL',
        monto:          solicDetalle.monto,
        saldo:          solicDetalle.monto,
        plazo:          solicDetalle.plazo,
        frecuencia:     solicDetalle.frecuencia,
        tasaInteres:    solicDetalle.tasaInteres,
        tasaMoratoria:  solicDetalle.tasaMoratoria,
        destino:        solicDetalle.destino,
        fechaInicio,
        estatus:        'Vigente',
        miembros:       solicDetalle.miembros,
        nombreGrupo:    solicDetalle.nombreGrupo,
        avales:         solicDetalle.avales,
        tablaPagos:     solicDetalle.tablaPagos,
        pagosRealizados:0,
      };
      const resC = await fetch(`${API}/api/creditos`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(creditoPayload)});
      const credito = await resC.json();
      setMsgOk(`✅ Solicitud aprobada — Crédito ${credito.folio||''} creado`);
      setModalAprob(false); setFechaInicio('');
      setTimeout(()=>setMsgOk(''),6000);
      fetchSolicitudes();
      
    } catch(e) { setMsgErr('Error al aprobar: '+e.message); }
    finally { setAprobando(false); setSolicDetalle(null); }
  };

  // ── Rechazar solicitud ──
  const rechazarSolicitud = async () => {
    if (!solicDetalle) return;
    setAprobando(true);
    try {
      await fetch(`${API}/api/solicitudes/${solicDetalle._id}`,{
        method:'PUT',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({estatus:'Rechazada',motivoRechazo:motivoRech,fechaRechazo:new Date().toISOString()})
      });
      setMsgOk('Solicitud rechazada correctamente.');
      setModalRechaz(false); setMotivoRech('');
      setTimeout(()=>setMsgOk(''),5000);
      fetchSolicitudes();
      
    } catch(e) { setMsgErr('Error: '+e.message); }
    finally { setAprobando(false); setSolicDetalle(null); }
  };

  const resetForm = () => {
    setPaso(1); setProdSel(null); setCliente(null); setNumSocio(''); setResultsCli([]);
    setMiembros([]); setNombreGrupo(''); setMonto(''); setPlazo('12');
    setTasa(''); setDestino(''); setAvales([]); setMsgErr('');
    setIngresoM('0'); setOtrosIng('0'); setGastos({alimento:'',luz:'',telefono:'',transporte:'',renta:'',inversion:'',creditos:'',otros:''});
  };



  const cancelar = () => { resetForm(); };

  if (paso === 1) return (
    <div style={{maxWidth:'800px',margin:'0 auto',fontFamily:'DM Sans,sans-serif'}}>
      <Msg tipo="err" msg={msgErr}/>
      <div style={S.card}>
        <div style={{padding:'18px 20px 10px',textAlign:'center'}}>
          <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'24px',fontWeight:'700',color:'#0a2d5e',margin:'0 0 4px'}}>Nueva solicitud de crédito</h2>
          <div style={{fontSize:'12px',fontWeight:'700',color:'#90aac8',textTransform:'uppercase',letterSpacing:'0.06em'}}>Paso 1 de 2 — Seleccionar tipo de crédito</div>
        </div>
        <div style={{marginTop:'12px'}}>
          <div style={{padding:'8px 20px',background:'#e8f2fc',borderTopWidth:'1px',borderTopStyle:'solid',borderTopColor:'#dceaf8',borderBottomWidth:'1px',borderBottomStyle:'solid',borderBottomColor:'#dceaf8'}}>
            <span style={{fontSize:'12px',fontWeight:'700',color:'#0e50a0',textTransform:'uppercase',letterSpacing:'0.05em'}}>Nombre del producto de crédito</span>
          </div>
          {cargando
            ? <div style={{padding:'24px',textAlign:'center'}}><Loader size={18} color="#0e50a0" style={{animation:'spin 1s linear infinite'}}/></div>
            : productos.map((p,i)=>(
              <div key={p._id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'13px 20px',borderBottomWidth:'1px',borderBottomStyle:'solid',borderBottomColor:'#eef2f7',background:i%2===0?'#fff':'#fafcff'}}>
                <div>
                  <div style={{fontSize:'15px',fontWeight:'700',color:'#0a2d5e',textTransform:'uppercase'}}>{p.nombre}</div>
                  {p.frecuencia && <div style={{fontSize:'11px',color:'#90aac8',marginTop:'2px'}}>Frecuencia: {p.frecuencia}</div>}
                </div>
                <button onClick={()=>{setProdSel(p);if(p.tasa)setTasa(String(p.tasa));if(p.frecuencia)setFormaPago(p.frecuencia);setPaso(2);}}
                  style={{background:'#22c55e',color:'#fff',border:'none',borderRadius:'10px',padding:'10px 28px',fontSize:'13px',fontWeight:'700',cursor:'pointer',boxShadow:'0 4px 12px rgba(34,197,94,0.25)'}}>
                  Seleccionar
                </button>
              </div>
            ))
          }
        </div>
        <div style={{padding:'14px 20px'}}>
  
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // ════════════ VISTA NUEVA SOLICITUD (PASO 2) ════════════
  return (
    <div style={{maxWidth:'800px',margin:'0 auto',fontFamily:'DM Sans,sans-serif'}}>
      <Msg tipo="err" msg={msgErr}/>
      <Msg tipo="ok"  msg={msgOk}/>

      <div style={{textAlign:'center',marginBottom:'14px'}}>
        <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'22px',fontWeight:'700',color:'#0a2d5e',margin:'0 0 4px'}}>
          {esGrupal ? 'Solicitud grupal' : 'Solicitud personal'} — {prodSel?.nombre}
        </h2>
        <div style={{fontSize:'12px',color:'#90aac8',textTransform:'uppercase',letterSpacing:'0.06em'}}>Paso 2 de 2 — Datos de la solicitud</div>
      </div>

      {/* PERSONAL — Cliente */}
      {!esGrupal && (
        <div style={S.card}>
          <div style={S.head}><User size={16}/> Cliente</div>
          <div style={S.body}>
            <div style={{display:'flex',gap:'8px',alignItems:'center',marginBottom:'10px',flexWrap:'wrap'}}>
              <Inp val={numSocio} onChange={setNumSocio} ph="Nombre, número de socio o CURP" w="240px"/>
              <button onClick={buscarCliente} disabled={buscCli}
                style={{...S.btnAzul,display:'flex',alignItems:'center',gap:'5px'}}>
                {buscCli?<Loader size={12} style={{animation:'spin 1s linear infinite'}}/>:<Search size={12}/>} Buscar
              </button>
            </div>
            {errCli && <p style={{color:'#dc3545',fontSize:'12px',margin:'0 0 6px'}}>{errCli}</p>}

            {/* Resultados múltiples */}
            {resultsCli.length > 1 && (
              <div style={{background:'#f4f8fd',borderRadius:'10px',padding:'10px',marginBottom:'10px',borderWidth:'1px',borderStyle:'solid',borderColor:'#dceaf8'}}>
                <div style={{...S.lbl,display:'block',marginBottom:'8px'}}>Selecciona el cliente:</div>
                {resultsCli.map(cl=>(
                  <div key={cl._id} onClick={()=>seleccionarCliente(cl)}
                    style={{display:'flex',alignItems:'center',gap:'10px',padding:'8px 10px',borderRadius:'8px',cursor:'pointer',marginBottom:'4px',background:'#fff',borderWidth:'1px',borderStyle:'solid',borderColor:'#dceaf8',transition:'background 0.15s'}}
                    onMouseEnter={e=>e.currentTarget.style.background='#e8f2fc'}
                    onMouseLeave={e=>e.currentTarget.style.background='#fff'}>
                    <User size={14} color="#90aac8"/>
                    <div>
                      <div style={{fontWeight:'700',fontSize:'13px',textTransform:'uppercase'}}>{cl.apellidoP} {cl.apellidoM} {cl.nombre}</div>
                      <div style={{fontSize:'11px',color:'#90aac8'}}>CURP: {cl.curp||'—'} | Ruta: {cl.rutaVinculacion||'—'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {cliente ? (
              <div style={{background:'#f0f7ff',borderRadius:'10px',padding:'12px 14px',borderWidth:'1px',borderStyle:'solid',borderColor:'#dceaf8',display:'flex',gap:'12px',alignItems:'center'}}>
                <div style={{width:'38px',height:'38px',borderRadius:'50%',overflow:'hidden',background:'#dce8f0',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
                  {(cliente.documentos?.fotoPerfil||cliente.fotos?.cliente)
                    ?<img src={cliente.documentos?.fotoPerfil||cliente.fotos?.cliente} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                    :<User size={18} color="#90aac8"/>}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:'700',fontSize:'13px',textTransform:'uppercase'}}>{cliente.apellidoP} {cliente.apellidoM} {cliente.nombre}</div>
                  <div style={{fontSize:'11px',color:'#555',marginTop:'2px'}}>
                    CURP: {cliente.curp||'—'} | Ruta: {cliente.rutaVinculacion||'—'}
                  </div>
                </div>
                <button onClick={()=>{setCliente(null);setNumSocio('');setResultsCli([]);}} style={{background:'#fee2e2',color:'#dc2626',border:'none',borderRadius:'6px',padding:'5px 8px',cursor:'pointer'}}><X size={13}/></button>
              </div>
            ) : (
              <div style={{color:'#90aac8',fontSize:'12px',textAlign:'center',padding:'8px'}}>Busca y selecciona un cliente</div>
            )}
          </div>
        </div>
      )}

      {/* GRUPAL — Miembros */}
      {esGrupal && (
        <div style={S.card}>
          <div style={{...S.head,justifyContent:'space-between'}}>
            <span>Miembros del grupo</span>
            <button onClick={buscarMiembro} disabled={buscG}
              style={{...S.btnAzul,fontSize:'11px',padding:'5px 12px',display:'flex',alignItems:'center',gap:'4px'}}>
              {buscG?<Loader size={11} style={{animation:'spin 1s linear infinite'}}/>:<Plus size={11}/>} Agregar miembro
            </button>
          </div>
          <div style={S.body}>
            <div style={{display:'flex',gap:'8px',alignItems:'center',marginBottom:'10px'}}>
              <Inp val={numSocioG} onChange={setNumSocioG} ph="Nombre, número o CURP" w="220px"/>
              <span style={{fontSize:'12px',color:'#90aac8'}}>↑ Escribe y presiona "Agregar miembro"</span>
            </div>
            {errG && <p style={{color:'#dc3545',fontSize:'12px',margin:'0 0 8px'}}>{errG}</p>}
            {miembros.length===0
              ? <p style={{color:'#90aac8',fontSize:'12px',textAlign:'center',padding:'12px 0'}}>Sin miembros — busca y agrega al menos uno</p>
              : <table style={{width:'100%',borderCollapse:'collapse',fontSize:'12px',marginTop:'4px'}}>
                  <thead><tr style={{background:'#0d1f5c'}}>
                    {['#','Nombre','CURP','Monto individual',''].map(h=>(
                      <th key={h} style={{padding:'7px 10px',color:'#b8cde8',fontWeight:'600',textAlign:'left',fontSize:'11px'}}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>{miembros.map((m,i)=>(
                    <tr key={m._id} style={{background:i%2===0?'#fff':'#f8f8f8'}}>
                      <td style={{padding:'7px 10px',fontWeight:'700',color:'#0e50a0'}}>{i+1}</td>
                      <td style={{padding:'7px 10px',textTransform:'uppercase',fontWeight:'600'}}>{m.apellidoP} {m.apellidoM} {m.nombre}</td>
                      <td style={{padding:'7px 10px',fontFamily:'monospace',fontSize:'11px'}}>{m.curp||'—'}</td>
                      <td style={{padding:'7px 10px'}}><Inp val={m.montoIndividual} onChange={v=>chMonto(i,v)} type="number" w="100px" ph="$0.00"/></td>
                      <td style={{padding:'7px 10px'}}>
                        <button onClick={()=>quitarMiembro(i)} style={{background:'#fee2e2',color:'#dc2626',border:'none',borderRadius:'6px',padding:'4px 8px',cursor:'pointer'}}><X size={12}/></button>
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
            }
          </div>
        </div>
      )}

      {/* GRUPAL — Info grupo */}
      {esGrupal && (
        <div style={S.card}>
          <div style={S.head}>Información del grupo</div>
          <div style={S.body}>
            <div style={{display:'flex',gap:'14px',alignItems:'center',flexWrap:'wrap'}}>
              <div style={{display:'flex',alignItems:'center',gap:'6px'}}><Lbl>No. participantes:</Lbl><Inp val={String(miembros.length)} onChange={()=>{}} ro w="55px"/></div>
              <div style={{display:'flex',alignItems:'center',gap:'6px',flex:1}}><Lbl>Nombre del grupo:</Lbl><Inp val={nombreGrupo} onChange={setNombreGrupo} w="100%" ph="Nombre del grupo"/></div>
            </div>
          </div>
        </div>
      )}

      {/* PERSONAL — Avales */}
      {!esGrupal && (
        <div style={S.card}>
          <div style={{...S.head,justifyContent:'space-between'}}>
            <span>Avales</span>
            <button onClick={agregarAval} style={{...S.btnAzul,fontSize:'11px',padding:'5px 12px',display:'flex',alignItems:'center',gap:'4px'}}><Plus size={11}/> Agregar aval</button>
          </div>
          {avales.length===0
            ? <div style={{...S.body,color:'#90aac8',fontSize:'12px',textAlign:'center'}}>Sin avales registrados</div>
            : <div style={S.body}>
                {avales.map((av,i)=>(
                  <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr auto',gap:'8px',marginBottom:'8px',alignItems:'end'}}>
                    <div><div style={{...S.lbl,display:'block',marginBottom:'2px'}}>Nombre</div><Inp val={av.nombre} onChange={v=>chAval(i,'nombre',v)} w="100%"/></div>
                    <div><div style={{...S.lbl,display:'block',marginBottom:'2px'}}>CURP</div><Inp val={av.curp} onChange={v=>chAval(i,'curp',v.toUpperCase())} w="100%"/></div>
                    <div><div style={{...S.lbl,display:'block',marginBottom:'2px'}}>Teléfono</div><Inp val={av.telefono} onChange={v=>chAval(i,'telefono',v)} type="tel" w="100%"/></div>
                    <button onClick={()=>quitarAval(i)} style={{background:'#fee2e2',color:'#dc2626',border:'none',borderRadius:'6px',padding:'5px 8px',cursor:'pointer',marginBottom:'1px'}}><X size={12}/></button>
                  </div>
                ))}
              </div>
          }
        </div>
      )}

      {/* Características */}
      <div style={S.card}>
        <div style={S.head}><DollarSign size={16}/> Características principales</div>
        <div style={S.body}>
          <div style={{display:'flex',gap:'10px',alignItems:'center',flexWrap:'wrap',marginBottom:'10px'}}>
            <div style={{display:'flex',alignItems:'center',gap:'4px'}}><Lbl>Tipo crédito:</Lbl><Inp val={prodSel?.nombre||''} onChange={()=>{}} ro w="160px"/></div>
            <div style={{display:'flex',alignItems:'center',gap:'4px'}}><Lbl>Tipo (CNBV):</Lbl><Sel val={tipoCNBV} onChange={setTipoCNBV} opts={['AL CONSUMO','COMERCIAL','A LA VIVIENDA']} w="130px"/></div>
            <div style={{display:'flex',alignItems:'center',gap:'4px'}}><Lbl>Monto:</Lbl><Inp val={monto} onChange={setMonto} type="number" w="120px" ph="0.00"/></div>
            <div style={{display:'flex',alignItems:'center',gap:'4px'}}><Lbl>IVA %:</Lbl><Inp val={iva} onChange={setIva} type="number" w="65px" ph="0"/></div>
          </div>
          <div style={{display:'flex',gap:'8px',alignItems:'center',flexWrap:'wrap',marginBottom:'10px'}}>
            <div style={{display:'flex',alignItems:'center',gap:'4px'}}><Lbl>Forma de pago:</Lbl><Sel val={formaPago} onChange={setFormaPago} opts={['DIARIA','SEMANAL','CATORCENAL','QUINCENAL','MENSUAL']} w="120px"/></div>
            <div style={{display:'flex',alignItems:'center',gap:'4px'}}><Lbl>Plazo:</Lbl><Sel val={plazo} onChange={setPlazo} opts={Array.from({length:60},(_,i)=>String(i+1))} w="65px"/></div>
            <div style={{display:'flex',alignItems:'center',gap:'4px'}}><Lbl>T.B. normal:</Lbl><Sel val={tbN} onChange={setTbN} opts={['FIJA','VARIABLE']} w="80px"/></div>
            <div style={{display:'flex',alignItems:'center',gap:'4px'}}><Lbl>Tipo tasa:</Lbl><Sel val={tipoTasa} onChange={setTipoTasa} opts={['MENSUAL','ANUAL','DIARIA','SEMANAL']} w="100px"/></div>
            <div style={{display:'flex',alignItems:'center',gap:'4px'}}><Lbl>Tasa interés %:</Lbl><Inp val={tasa} onChange={setTasa} type="number" w="85px" ph="0.00"/></div>
          </div>
          <div style={{display:'flex',gap:'8px',alignItems:'center',flexWrap:'wrap'}}>
            <div style={{display:'flex',alignItems:'center',gap:'4px'}}><Lbl>T.B. moratorio:</Lbl><Sel val={tbM} onChange={setTbM} opts={['FIJA','VARIABLE']} w="80px"/></div>
            <div style={{display:'flex',alignItems:'center',gap:'4px'}}><Lbl>Tipo moratorio:</Lbl><Sel val={tipoTasaM} onChange={setTipoTasaM} opts={['MENSUAL','ANUAL','DIARIA','SEMANAL']} w="100px"/></div>
            <div style={{display:'flex',alignItems:'center',gap:'4px'}}><Lbl>% moratorio:</Lbl><Inp val={pctMor} onChange={setPctMor} type="number" w="80px"/></div>
            <div style={{display:'flex',alignItems:'center',gap:'4px'}}><Lbl>Destino:</Lbl><Inp val={destino} onChange={setDestino} w="130px" ph="Capital de trabajo..."/></div>
          </div>
        </div>
      </div>

      {/* Información financiera */}
      <div style={S.card}>
        <div style={S.head}>Información financiera</div>
        <div style={S.body}>
          <div style={S.subHead}>Ingresos</div>
          <div style={{display:'flex',gap:'12px',flexWrap:'wrap',marginBottom:'12px'}}>
            <div style={{display:'flex',alignItems:'center',gap:'5px'}}><Lbl w="150px">Ingreso mensual promedio:</Lbl><Inp val={ingresoM} onChange={setIngresoM} type="number" w="110px"/></div>
            <div style={{display:'flex',alignItems:'center',gap:'5px'}}><Lbl w="90px">Otros ingresos:</Lbl><Inp val={otrosIng} onChange={setOtrosIng} type="number" w="110px"/></div>
            <div style={{display:'flex',alignItems:'center',gap:'5px'}}><Lbl w="90px">Total ingresos:</Lbl>
              <span style={{fontWeight:'700',color:'#166534',fontSize:'14px'}}>{fmt(ingresoTotal)}</span>
            </div>
          </div>
          <div style={S.subHead}>Gasto promedio mensual</div>
          <div style={{display:'flex',gap:'8px',flexWrap:'wrap',marginBottom:'8px'}}>
            {[['Alimento','alimento'],['Luz','luz'],['Teléfono','telefono'],['Transporte','transporte']].map(([l,k])=>(
              <div key={k} style={{display:'flex',alignItems:'center',gap:'4px'}}><Lbl>{l}:</Lbl><Inp val={gastos[k]} onChange={v=>chGasto(k,v)} type="number" w="90px" ph="0"/></div>
            ))}
          </div>
          <div style={{display:'flex',gap:'8px',flexWrap:'wrap',marginBottom:'10px'}}>
            {[['Renta','renta'],['Inversión negocio','inversion'],['Créditos','creditos'],['Otros','otros']].map(([l,k])=>(
              <div key={k} style={{display:'flex',alignItems:'center',gap:'4px'}}><Lbl>{l}:</Lbl><Inp val={gastos[k]} onChange={v=>chGasto(k,v)} type="number" w="90px" ph="0"/></div>
            ))}
          </div>
          <div style={{display:'flex',gap:'16px',flexWrap:'wrap',padding:'10px',background:'#f4f8fd',borderRadius:'10px',borderWidth:'1px',borderStyle:'solid',borderColor:'#dceaf8'}}>
            <div><Lbl w="90px">Total gastos:</Lbl><span style={{fontWeight:'700',color:'#dc2626'}}>{fmt(totalGasto)}</span></div>
            <div><Lbl w="150px">Total disponible mensual:</Lbl>
              <span style={{fontWeight:'700',color:totalDisp>=0?'#166534':'#dc2626',fontSize:'14px'}}>{fmt(totalDisp)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Botones finales */}
      <div style={{display:'flex',flexDirection:'column',gap:'8px',marginBottom:'28px'}}>
        <button onClick={simularPlan} style={S.btnOsc}>Simular plan de pagos</button>
        <button onClick={enviarSolicitud} disabled={enviando}
          style={{...S.btnVerde,opacity:enviando?0.7:1,display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
          {enviando?<><Loader size={14} style={{animation:'spin 1s linear infinite'}}/> Enviando...</>
          : esGrupal?'Crear solicitud grupal':'Enviar solicitud'}
        </button>
        <button onClick={cancelar} style={S.btnRojo}>Cancelar</button>
      </div>

      {/* ═══ MODAL SIMULADOR ═══ */}
      {modalPlan && (
        <div style={{position:'fixed',inset:0,background:'rgba(5,15,40,0.82)',display:'flex',alignItems:'flex-start',justifyContent:'center',zIndex:3000,padding:'24px 14px',overflowY:'auto'}}>
          <div style={{background:'#fff',width:'100%',maxWidth:'980px',boxShadow:'0 10px 50px rgba(0,0,0,0.5)',fontFamily:'DM Sans,sans-serif',borderRadius:'16px',overflow:'hidden'}}>
            <div style={{background:'#0d1f5c',padding:'0'}}>
              <div style={{padding:'12px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottomWidth:'1px',borderBottomStyle:'solid',borderBottomColor:'rgba(255,255,255,0.1)'}}>
                <div style={{fontSize:'18px',fontWeight:'700',color:'#fff',fontFamily:"'Cormorant Garamond',serif",textTransform:'uppercase'}}>
                  Simulación — tabla de pagos
                </div>
                <button onClick={()=>setModalPlan(false)} style={{background:'rgba(255,255,255,0.12)',borderWidth:'1px',borderStyle:'solid',borderColor:'rgba(255,255,255,0.2)',padding:'5px 10px',cursor:'pointer',color:'#fff',display:'flex',alignItems:'center',borderRadius:'6px'}}><X size={15}/></button>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',borderBottomWidth:'1px',borderBottomStyle:'solid',borderBottomColor:'rgba(255,255,255,0.08)'}}>
                {[
                  ['Producto',          prodSel?.nombre||'—'],
                  ['Monto solicitado',  fmt(parseFloat(monto)||0)],
                  ['Pago por periodo',  tablaPlan.length?fmt(tablaPlan[0].pagoTotal):'$0.00'],
                  ['Total a pagar',     fmt(tablaPlan.reduce((a,f)=>a+f.pagoTotal,0))],
                ].map(([l,v])=>(
                  <div key={l} style={{padding:'10px 18px',borderRightWidth:'1px',borderRightStyle:'solid',borderRightColor:'rgba(255,255,255,0.08)'}}>
                    <div style={{fontSize:'10px',color:'rgba(255,255,255,0.45)',textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:'3px'}}>{l}</div>
                    <div style={{fontSize:'15px',fontWeight:'700',color:'#fff'}}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:'12.5px'}}>
                <thead>
                  <tr style={{background:'#17305c'}}>
                    {['Periodo','Fecha pago','Capital Pendiente','Abono capital','Interés','IVA','Pago total','Saldo final'].map(h=>(
                      <th key={h} style={{padding:'8px 12px',color:'#b8cde8',fontWeight:'700',fontSize:'11px',textAlign:['Periodo','Fecha pago'].includes(h)?'center':'right',textTransform:'uppercase',letterSpacing:'0.05em',whiteSpace:'nowrap'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tablaPlan.map((f,i)=>(
                    <tr key={i} style={{background:i%2===0?'#fff':'#f4f8fd'}}>
                      <td style={{padding:'7px 12px',textAlign:'center',fontWeight:'700',color:'#0d1f5c'}}>{f.periodo}</td>
                      <td style={{padding:'7px 12px',textAlign:'center',fontFamily:'monospace',fontSize:'12px',color:'#446'}}>{f.fecha}</td>
                      <td style={{padding:'7px 12px',textAlign:'right'}}>{fmt(f.capitalPendiente)}</td>
                      <td style={{padding:'7px 12px',textAlign:'right',color:'#155724',fontWeight:'600'}}>{fmt(f.abonoCapital)}</td>
                      <td style={{padding:'7px 12px',textAlign:'right',color:'#dc3545'}}>{fmt(f.interes)}</td>
                      <td style={{padding:'7px 12px',textAlign:'right'}}>{fmt(f.iva)}</td>
                      <td style={{padding:'7px 12px',textAlign:'right',fontWeight:'700',color:'#0d1f5c'}}>{fmt(f.pagoTotal)}</td>
                      <td style={{padding:'7px 12px',textAlign:'right',color:f.saldoFinal<1?'#155724':'#222',fontWeight:'600'}}>{fmt(f.saldoFinal)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{background:'#0d1f5c'}}>
                    <td colSpan={2} style={{padding:'8px 12px',color:'#fff',fontWeight:'700',fontSize:'12px',textTransform:'uppercase',letterSpacing:'0.06em'}}>Totales</td>
                    <td style={{padding:'8px 12px',textAlign:'right',color:'rgba(255,255,255,0.35)'}}>—</td>
                    <td style={{padding:'8px 12px',textAlign:'right',color:'#86efac',fontWeight:'700'}}>{fmt(tablaPlan.reduce((a,f)=>a+f.abonoCapital,0))}</td>
                    <td style={{padding:'8px 12px',textAlign:'right',color:'#fca5a5',fontWeight:'700'}}>{fmt(tablaPlan.reduce((a,f)=>a+f.interes,0))}</td>
                    <td style={{padding:'8px 12px',textAlign:'right',color:'rgba(255,255,255,0.7)',fontWeight:'700'}}>{fmt(tablaPlan.reduce((a,f)=>a+f.iva,0))}</td>
                    <td style={{padding:'8px 12px',textAlign:'right',color:'#fff',fontWeight:'700',fontSize:'13px'}}>{fmt(tablaPlan.reduce((a,f)=>a+f.pagoTotal,0))}</td>
                    <td style={{padding:'8px 12px',textAlign:'right',color:'rgba(255,255,255,0.35)'}}>—</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div style={{padding:'10px 18px',borderTopWidth:'1px',borderTopStyle:'solid',borderTopColor:'#dce4ef',display:'flex',justifyContent:'space-between',alignItems:'center',background:'#f4f6fa'}}>
              <span style={{fontSize:'12px',color:'#90aac8'}}>Tasa: {tasa}% {tipoTasa} | Plazo: {plazo} {formaPago}</span>
              <button onClick={()=>setModalPlan(false)} style={{background:'#0d1f5c',color:'#fff',border:'none',padding:'9px 30px',fontSize:'13px',fontWeight:'700',cursor:'pointer',borderRadius:'10px',boxShadow:'0 4px 14px rgba(13,31,92,0.3)'}}>
                CERRAR
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}