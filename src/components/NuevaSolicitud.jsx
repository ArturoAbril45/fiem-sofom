'use client';
import React, { useState, useEffect } from 'react';
import { Search, User, AlertCircle, CheckCircle, Loader, Plus, X, DollarSign } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://fiem-backend-production.up.railway.app';
const fmtMoney = v => `$${(parseFloat(v)||0).toLocaleString('es-MX',{minimumFractionDigits:2})}`;

const S = {
  card:    { background:'#fff', borderRadius:'4px', borderWidth:'1px', borderStyle:'solid', borderColor:'#ccc', marginBottom:'14px', overflow:'hidden' },
  head:    { padding:'10px 16px', background:'#f9f6ed', borderBottomWidth:'1px', borderBottomStyle:'solid', borderBottomColor:'#ccc', fontFamily:"'Cormorant Garamond',serif", fontSize:'16px', fontWeight:'700', color:'#0a2d5e' },
  body:    { padding:'14px 16px' },
  input:   { border:'1px solid #bbb', borderRadius:'3px', padding:'4px 8px', fontSize:'13px', fontFamily:'DM Sans,sans-serif', color:'#1a1a1a', outline:'none', background:'#fff', boxSizing:'border-box' },
  inputRO: { border:'1px solid #ddd', borderRadius:'3px', padding:'4px 8px', fontSize:'13px', fontFamily:'DM Sans,sans-serif', color:'#555', outline:'none', background:'#f4f4f4', boxSizing:'border-box' },
  lbl:     { fontSize:'12px', fontWeight:'600', color:'#333', marginRight:'4px', whiteSpace:'nowrap' },
  sel:     { border:'1px solid #bbb', borderRadius:'3px', padding:'4px 7px', fontSize:'13px', fontFamily:'DM Sans,sans-serif', color:'#1a1a1a', outline:'none', background:'#fff', cursor:'pointer', boxSizing:'border-box' },
  subHead: { background:'#d4edda', borderRadius:'2px', padding:'4px 10px', marginBottom:'8px', fontSize:'12px', fontWeight:'700', color:'#155724' },
  btnVerde:{ background:'#28a745', color:'#fff', border:'none', borderRadius:'3px', padding:'11px 0', fontSize:'14px', fontWeight:'700', cursor:'pointer', width:'100%' },
  btnOsc:  { background:'#212529', color:'#fff', border:'none', borderRadius:'3px', padding:'11px 0', fontSize:'14px', fontWeight:'700', cursor:'pointer', width:'100%' },
  btnRojo: { background:'#dc3545', color:'#fff', border:'none', borderRadius:'3px', padding:'11px 0', fontSize:'14px', fontWeight:'700', cursor:'pointer', width:'100%' },
  btnAzul: { background:'#007bff', color:'#fff', border:'none', borderRadius:'3px', padding:'6px 14px', fontSize:'12px', fontWeight:'600', cursor:'pointer' },
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

  // Personal
  const [numSocio,    setNumSocio]   = useState('');
  const [cliente,     setCliente]    = useState(null);
  const [buscCli,     setBuscCli]    = useState(false);
  const [errCli,      setErrCli]     = useState('');
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
  const [formaPago,   setFormaPago]  = useState('DIARIA');
  const [plazo,       setPlazo]      = useState('1');
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

  useEffect(()=>{ fetchProds(); },[]);

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

  const buscarCliente = async () => {
    if (!numSocio.trim()) return;
    setBuscCli(true); setErrCli(''); setCliente(null);
    try {
      const res = await fetch(`${API}/api/clientes?busqueda=${encodeURIComponent(numSocio)}`);
      const d   = await res.json();
      const arr = Array.isArray(d) ? d : (d.clientes||[]);
      if (!arr.length) { setErrCli('No se encontró cliente.'); return; }
      const cl = arr[0];
      if (cl.estatus==='Lista negra') { setErrCli('Cliente en lista negra.'); return; }
      setCliente(cl);
      if (cl.ingresoMensual) setIngresoM(String(cl.ingresoMensual));
      if (cl.gastos) setGastos(g=>({...g,...cl.gastos}));
    } catch { setErrCli('Error al buscar.'); }
    finally { setBuscCli(false); }
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

  const enviarSolicitud = async () => {
    if (esGrupal && !miembros.length) { setMsgErr('Agrega al menos un miembro.'); return; }
    if (!esGrupal && !cliente) { setMsgErr('Selecciona un cliente.'); return; }
    if (!monto) { setMsgErr('Ingresa el monto.'); return; }
    setEnviando(true);
    try {
      const payload = {
        tipo: esGrupal?'GRUPAL':'PERSONAL',
        clienteId:     !esGrupal ? cliente._id : undefined,
        clienteNombre: !esGrupal ? `${cliente.apellidoP||''} ${cliente.apellidoM||''} ${cliente.nombre||''}`.trim() : undefined,
        miembros:      esGrupal ? miembros.map(m=>({clienteId:m._id,nombre:`${m.apellidoP} ${m.apellidoM} ${m.nombre}`.trim(),montoIndividual:parseFloat(m.montoIndividual)||0})) : undefined,
        nombreGrupo:   esGrupal ? nombreGrupo : undefined,
        producto:prodSel.nombre, monto:parseFloat(monto), plazo:parseInt(plazo),
        frecuencia:formaPago, destino, tipoCNBV, tasaInteres:parseFloat(tasa)||0,
        tbN, tipoTasa, tbM, tipoTasaM, pctMoratorio:parseFloat(pctMor)||0,
        avales: !esGrupal ? avales : [],
        ingresoMensual:parseFloat(ingresoM)||0, otrosIngresos:parseFloat(otrosIng)||0, gastos,
        estatus:'Pendiente', fecha:new Date().toLocaleDateString('es-MX'),
      };
      const res  = await fetch(`${API}/api/solicitudes`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      const data = await res.json();
      if (!res.ok) throw new Error(data.error||'Error');
      setMsgOk('Solicitud enviada. Folio: '+(data._id?.slice(-6)||'—'));
      setTimeout(()=>setMsgOk(''),5000);
      setPaso(1); setProdSel(null); setCliente(null); setNumSocio(''); setMiembros([]);
      setNombreGrupo(''); setMonto(''); setPlazo('1'); setTasa(''); setDestino(''); setAvales([]);
    } catch(e) { setMsgErr(e.message); setTimeout(()=>setMsgErr(''),4000); }
    finally { setEnviando(false); }
  };

  const cancelar = () => {
    setPaso(1); setProdSel(null); setCliente(null); setNumSocio('');
    setMiembros([]); setNombreGrupo(''); setMonto(''); setTasa(''); setAvales([]);
    setMsgOk(''); setMsgErr('');
  };

  const Msg = ({tipo,msg}) => msg ? (
    <div style={{background:tipo==='ok'?'#d4edda':'#f8d7da',borderWidth:'1px',borderStyle:'solid',borderColor:tipo==='ok'?'#c3e6cb':'#f5c6cb',borderRadius:'4px',padding:'10px 14px',marginBottom:'12px',color:tipo==='ok'?'#155724':'#721c24',fontSize:'13px',fontWeight:'600',display:'flex',alignItems:'center',gap:'7px'}}>
      {tipo==='ok'?<CheckCircle size={14}/>:<AlertCircle size={14}/>}{msg}
    </div>
  ) : null;

  // ════════════ PASO 1 ════════════
  if (paso===1) return (
    <div style={{maxWidth:'800px',margin:'0 auto',fontFamily:'DM Sans,sans-serif'}}>
      <Msg tipo="err" msg={msgErr}/>
      <Msg tipo="ok"  msg={msgOk}/>
      <div style={S.card}>
        <div style={{padding:'18px 20px 10px',textAlign:'center'}}>
          <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'24px',fontWeight:'700',color:'#0a2d5e',margin:'0 0 6px'}}>Nueva solicitud de credito</h2>
          <div style={{fontSize:'13px',fontWeight:'600',color:'#155724'}}>Seleccionar tipo de credito (paso 1 de 3)</div>
        </div>
        <div style={{marginTop:'12px'}}>
          <div style={{padding:'7px 16px',background:'#c3e6cb',borderTopWidth:'1px',borderTopStyle:'solid',borderTopColor:'#b1dfbb',borderBottomWidth:'1px',borderBottomStyle:'solid',borderBottomColor:'#b1dfbb'}}>
            <span style={{fontSize:'13px',fontWeight:'600',color:'#155724'}}>Nombre producto credito</span>
          </div>
          {cargando && <div style={{padding:'24px',textAlign:'center'}}><Loader size={18} color="#0e50a0" style={{animation:'spin 1s linear infinite'}}/></div>}
          {productos.map((p,i)=>(
            <div key={p._id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 16px',borderBottomWidth:'1px',borderBottomStyle:'solid',borderBottomColor:'#eee',background:i%2===0?'#fff':'#fafafa'}}>
              <span style={{fontSize:'14px',fontWeight:'600',color:'#1a1a1a',textTransform:'uppercase'}}>{p.nombre}</span>
              <button onClick={()=>{setProdSel(p);if(p.tasa)setTasa(String(p.tasa));setPaso(2);}}
                style={{background:'#28a745',color:'#fff',border:'none',borderRadius:'3px',padding:'9px 0',fontSize:'13px',fontWeight:'700',cursor:'pointer',width:'46%'}}>
                Seleccionar
              </button>
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // ════════════ PASO 2 ════════════
  return (
    <div style={{maxWidth:'800px',margin:'0 auto',fontFamily:'DM Sans,sans-serif'}}>
      <Msg tipo="err" msg={msgErr}/>
      <Msg tipo="ok"  msg={msgOk}/>

      <div style={{textAlign:'center',marginBottom:'12px'}}>
        <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'24px',fontWeight:'700',color:'#0a2d5e',margin:'0 0 8px'}}>
          Nueva solicitud de credito {esGrupal?'grupal':'personal'}
        </h2>
        <button style={S.btnAzul}>Ayuda localizar cliente</button>
      </div>

      {/* PERSONAL — Cliente */}
      {!esGrupal && (
        <div style={S.card}>
          <div style={S.head}>Cliente</div>
          <div style={S.body}>
            <div style={{display:'flex',gap:'8px',alignItems:'center',marginBottom:'10px'}}>
              <Inp val={numSocio} onChange={setNumSocio} ph="Numero de socio" w="170px"/>
              <button onClick={buscarCliente} disabled={buscCli}
                style={{...S.btnAzul,display:'flex',alignItems:'center',gap:'5px'}}>
                {buscCli?<Loader size={12} style={{animation:'spin 1s linear infinite'}}/>:<Search size={12}/>} Buscar
              </button>
            </div>
            {errCli && <p style={{color:'#dc3545',fontSize:'12px',margin:'0 0 6px'}}>{errCli}</p>}
            {cliente ? (
              <div style={{background:'#e8f4fd',borderRadius:'3px',padding:'9px 12px',borderWidth:'1px',borderStyle:'solid',borderColor:'#bee5eb',display:'flex',gap:'12px',alignItems:'center'}}>
                <div style={{width:'34px',height:'34px',borderRadius:'50%',overflow:'hidden',background:'#dce8f0',flexShrink:0}}>
                  {(cliente.documentos?.fotoPerfil||cliente.fotos?.cliente)
                    ?<img src={cliente.documentos?.fotoPerfil||cliente.fotos?.cliente} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                    :<div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center'}}><User size={16} color="#90aac8"/></div>}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:'700',fontSize:'13px',textTransform:'uppercase'}}>{cliente.apellidoP} {cliente.apellidoM} {cliente.nombre}</div>
                  <div style={{fontSize:'11px',color:'#555'}}>CURP: {cliente.curp||'—'}</div>
                </div>
                <button onClick={()=>{setCliente(null);setNumSocio('');}} style={{background:'none',border:'none',cursor:'pointer',color:'#999'}}><X size={14}/></button>
              </div>
            ) : (
              <div style={{fontSize:'13px',color:'#333'}}>
                <div><strong>NOMBRE:</strong></div>
                <div><strong>CURP:</strong></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* GRUPAL — Miembros */}
      {esGrupal && (
        <div style={S.card}>
          <div style={{...S.head,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <span>Miembros del grupo</span>
            <button onClick={buscarMiembro} disabled={buscG}
              style={{...S.btnAzul,fontSize:'11px',padding:'4px 10px',display:'flex',alignItems:'center',gap:'4px'}}>
              {buscG?<Loader size={11} style={{animation:'spin 1s linear infinite'}}/>:<Plus size={11}/>} Agregar miembro del grupo
            </button>
          </div>
          <div style={S.body}>
            <div style={{display:'flex',gap:'8px',alignItems:'center',marginBottom:'8px'}}>
              <Inp val={numSocioG} onChange={setNumSocioG} ph="Número de socio" w="180px"/>
              <span style={{fontSize:'12px',color:'#555'}}>Busca y presiona "Agregar miembro del grupo"</span>
            </div>
            {errG && <p style={{color:'#dc3545',fontSize:'12px',margin:'0 0 8px'}}>{errG}</p>}
            {miembros.length===0
              ? <p style={{color:'#999',fontSize:'12px',textAlign:'center',margin:'8px 0'}}>Sin miembros aún</p>
              : (
                <table style={{width:'100%',borderCollapse:'collapse',fontSize:'12px',marginTop:'4px'}}>
                  <thead>
                    <tr style={{background:'#0d1f5c'}}>
                      {['#','Nombre','CURP','Monto individual',''].map(h=>(
                        <th key={h} style={{padding:'6px 10px',color:'#fff',fontWeight:'600',textAlign:'left'}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {miembros.map((m,i)=>(
                      <tr key={m._id} style={{background:i%2===0?'#fff':'#f8f8f8'}}>
                        <td style={{padding:'6px 10px',borderBottomWidth:'1px',borderBottomStyle:'solid',borderBottomColor:'#eee',fontWeight:'700',color:'#0e50a0'}}>{i+1}</td>
                        <td style={{padding:'6px 10px',borderBottomWidth:'1px',borderBottomStyle:'solid',borderBottomColor:'#eee',textTransform:'uppercase',fontWeight:'600'}}>{m.apellidoP} {m.apellidoM} {m.nombre}</td>
                        <td style={{padding:'6px 10px',borderBottomWidth:'1px',borderBottomStyle:'solid',borderBottomColor:'#eee',fontFamily:'monospace'}}>{m.curp||'—'}</td>
                        <td style={{padding:'6px 10px',borderBottomWidth:'1px',borderBottomStyle:'solid',borderBottomColor:'#eee'}}>
                          <Inp val={m.montoIndividual} onChange={v=>chMonto(i,v)} type="number" w="100px" ph="$0"/>
                        </td>
                        <td style={{padding:'6px 10px',borderBottomWidth:'1px',borderBottomStyle:'solid',borderBottomColor:'#eee'}}>
                          <button onClick={()=>quitarMiembro(i)} style={{background:'#f8d7da',color:'#721c24',border:'none',borderRadius:'2px',padding:'3px 7px',cursor:'pointer'}}><X size={12}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            }
          </div>
        </div>
      )}

      {/* GRUPAL — Info grupo */}
      {esGrupal && (
        <div style={S.card}>
          <div style={S.head}>Informacion del grupo</div>
          <div style={S.body}>
            <div style={{display:'flex',gap:'14px',alignItems:'center',flexWrap:'wrap'}}>
              <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                <Lbl>No participantes</Lbl>
                <Inp val={String(miembros.length)} onChange={()=>{}} ro w="60px"/>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                <Lbl>Nombre grupo:</Lbl>
                <Inp val={nombreGrupo} onChange={setNombreGrupo} w="220px" ph="En espera de seleccion de..."/>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PERSONAL — Avales */}
      {!esGrupal && (
        <div style={S.card}>
          <div style={{...S.head,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <span>Avales</span>
            <button onClick={agregarAval} style={{...S.btnAzul,fontSize:'11px',padding:'4px 10px',display:'flex',alignItems:'center',gap:'4px'}}><Plus size={11}/> Agregar aval</button>
          </div>
          {avales.length===0
            ? <div style={{...S.body,color:'#999',fontSize:'12px',textAlign:'center'}}>Sin avales</div>
            : <div style={S.body}>
                {avales.map((av,i)=>(
                  <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr auto',gap:'8px',marginBottom:'7px',alignItems:'end'}}>
                    <div><div style={{...S.lbl,display:'block',marginBottom:'2px'}}>Nombre</div><Inp val={av.nombre} onChange={v=>chAval(i,'nombre',v)} w="100%"/></div>
                    <div><div style={{...S.lbl,display:'block',marginBottom:'2px'}}>CURP</div><Inp val={av.curp} onChange={v=>chAval(i,'curp',v.toUpperCase())} w="100%"/></div>
                    <div><div style={{...S.lbl,display:'block',marginBottom:'2px'}}>Teléfono</div><Inp val={av.telefono} onChange={v=>chAval(i,'telefono',v)} type="tel" w="100%"/></div>
                    <button onClick={()=>quitarAval(i)} style={{background:'#f8d7da',color:'#721c24',border:'none',borderRadius:'2px',padding:'5px 7px',cursor:'pointer',marginBottom:'1px'}}><X size={12}/></button>
                  </div>
                ))}
              </div>
          }
        </div>
      )}

      {/* Características */}
      <div style={S.card}>
        <div style={S.head}>Caracteristicas principales</div>
        <div style={S.body}>
          <div style={{background:'#f8d7da',borderRadius:'2px',height:'6px',marginBottom:'10px'}}/>
          <div style={{display:'flex',gap:'10px',alignItems:'center',flexWrap:'wrap',marginBottom:'9px'}}>
            <div style={{display:'flex',alignItems:'center',gap:'4px'}}><Lbl>Tipo de credito:</Lbl><Sel val={prodSel?.nombre} onChange={()=>{}} opts={[prodSel?.nombre||'']} w="175px"/></div>
            <div style={{display:'flex',alignItems:'center',gap:'4px'}}><Lbl>Tipo (CNBV):</Lbl><Sel val={tipoCNBV} onChange={setTipoCNBV} opts={['AL CONSUMO','COMERCIAL','A LA VIVIENDA']} w="135px"/></div>
            <div style={{display:'flex',alignItems:'center',gap:'4px'}}><Lbl>Monto total:</Lbl><Inp val={monto} onChange={setMonto} type="number" w="120px" ph="0"/></div>
            <div style={{display:'flex',alignItems:'center',gap:'4px'}}><Lbl>IVA:</Lbl><Inp val={iva} onChange={setIva} type="number" w="70px" ph="0"/></div>
          </div>
          <div style={{display:'flex',gap:'8px',alignItems:'center',flexWrap:'wrap',marginBottom:'8px'}}>
            <div style={{display:'flex',alignItems:'center',gap:'4px'}}><Lbl>Forma de pago:</Lbl><Sel val={formaPago} onChange={setFormaPago} opts={['DIARIA','SEMANAL','CATORCENAL','QUINCENAL','MENSUAL']} w="115px"/></div>
            <div style={{display:'flex',alignItems:'center',gap:'4px'}}><Lbl>Plazo:</Lbl><Sel val={plazo} onChange={setPlazo} opts={Array.from({length:60},(_,i)=>String(i+1))} w="60px"/></div>
            <div style={{display:'flex',alignItems:'center',gap:'4px'}}><Lbl>T.B. Interes normal:</Lbl><Sel val={tbN} onChange={setTbN} opts={['FIJA','VARIABLE']} w="85px"/></div>
            <div style={{display:'flex',alignItems:'center',gap:'4px'}}><Lbl>Tipo tasa:</Lbl><Sel val={tipoTasa} onChange={setTipoTasa} opts={['MENSUAL','ANUAL','DIARIA','SEMANAL']} w="100px"/></div>
            <div style={{display:'flex',alignItems:'center',gap:'4px'}}><Lbl>Tasa de interes:</Lbl><Inp val={tasa} onChange={setTasa} type="number" w="85px"/></div>
          </div>
          <div style={{display:'flex',gap:'8px',alignItems:'center',flexWrap:'wrap'}}>
            <div style={{display:'flex',alignItems:'center',gap:'4px'}}><Lbl>T.B. interes Moratorio:</Lbl><Sel val={tbM} onChange={setTbM} opts={['FIJA','VARIABLE']} w="85px"/></div>
            <div style={{display:'flex',alignItems:'center',gap:'4px'}}><Lbl>Tipo tasa Moratorio:</Lbl><Sel val={tipoTasaM} onChange={setTipoTasaM} opts={['MENSUAL','ANUAL','DIARIA','SEMANAL']} w="100px"/></div>
            <div style={{display:'flex',alignItems:'center',gap:'4px'}}><Lbl>Porcentaje tasa moratorio:</Lbl><Inp val={pctMor} onChange={setPctMor} type="number" w="85px"/></div>
            <div style={{display:'flex',alignItems:'center',gap:'4px'}}><Lbl>Destino:</Lbl><Inp val={destino} onChange={setDestino} w="120px"/></div>
          </div>
        </div>
      </div>

      {/* Información financiera */}
      <div style={S.card}>
        <div style={S.head}>Informacion financiera</div>
        <div style={S.body}>
          <div style={S.subHead}>Ingresos</div>
          <div style={{display:'flex',gap:'12px',flexWrap:'wrap',marginBottom:'12px'}}>
            <div style={{display:'flex',alignItems:'center',gap:'5px'}}><Lbl w="160px">Ingreso mensual promedio:</Lbl><Inp val={ingresoM} onChange={setIngresoM} type="number" w="110px"/></div>
            <div style={{display:'flex',alignItems:'center',gap:'5px'}}><Lbl w="90px">Otros Ingresos:</Lbl><Inp val={otrosIng} onChange={setOtrosIng} type="number" w="110px"/></div>
            <div style={{display:'flex',alignItems:'center',gap:'5px'}}><Lbl w="130px">Ingreso promedio total:</Lbl><Inp val={String(ingresoTotal)} onChange={()=>{}} ro w="110px"/></div>
          </div>
          <div style={S.subHead}>Gasto promedio mensual</div>
          <div style={{display:'flex',gap:'8px',flexWrap:'wrap',marginBottom:'7px'}}>
            {[['Alimento','alimento'],['Luz','luz'],['Telefono','telefono'],['Transporte','transporte']].map(([l,k])=>(
              <div key={k} style={{display:'flex',alignItems:'center',gap:'4px'}}><Lbl>{l}:</Lbl><Inp val={gastos[k]} onChange={v=>chGasto(k,v)} type="number" w="95px"/></div>
            ))}
          </div>
          <div style={{display:'flex',gap:'8px',flexWrap:'wrap',marginBottom:'10px'}}>
            {[['Renta','renta'],['Inversion negocio','inversion'],['Creditos','creditos'],['Otros','otros']].map(([l,k])=>(
              <div key={k} style={{display:'flex',alignItems:'center',gap:'4px'}}><Lbl>{l}:</Lbl><Inp val={gastos[k]} onChange={v=>chGasto(k,v)} type="number" w="95px"/></div>
            ))}
          </div>
          <div style={{display:'flex',gap:'14px',flexWrap:'wrap'}}>
            <div style={{display:'flex',alignItems:'center',gap:'5px'}}><Lbl w="80px">Total gasto:</Lbl><Inp val={String(totalGasto)} onChange={()=>{}} ro w="100px"/></div>
            <div style={{display:'flex',alignItems:'center',gap:'5px'}}><Lbl w="150px">Total Disponible mensual:</Lbl><Inp val={String(totalDisp)} onChange={()=>{}} ro w="100px"/></div>
          </div>
        </div>
      </div>

      {/* Botones */}
      <div style={{display:'flex',flexDirection:'column',gap:'7px',marginBottom:'24px'}}>
        <button onClick={simularPlan} style={S.btnOsc}>Simular plan de pagos</button>
        <button onClick={enviarSolicitud} disabled={enviando}
          style={{...S.btnVerde,opacity:enviando?0.7:1,display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
          {enviando?<><Loader size={14} style={{animation:'spin 1s linear infinite'}}/> Enviando...</>
          : esGrupal?'Crear solicitud grupal':'Enviar solicitud'}
        </button>
        <button onClick={cancelar} style={S.btnRojo}>Cancelar</button>
      </div>

      {/* ═══ MODAL SIMULADOR PROFESIONAL ═══ */}
      {modalPlan && (
        <div style={{position:'fixed',inset:0,background:'rgba(5,15,40,0.82)',display:'flex',alignItems:'flex-start',justifyContent:'center',zIndex:3000,padding:'24px 14px',overflowY:'auto'}}>
          <div style={{background:'#fff',width:'100%',maxWidth:'980px',boxShadow:'0 10px 50px rgba(0,0,0,0.5)',fontFamily:'DM Sans,sans-serif',border:'none'}}>

            {/* Header azul marino */}
            <div style={{background:'#0d1f5c',padding:'0'}}>
              <div style={{padding:'12px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottomWidth:'1px',borderBottomStyle:'solid',borderBottomColor:'rgba(255,255,255,0.1)'}}>
                <div style={{fontSize:'17px',fontWeight:'700',color:'#fff',fontFamily:"'Cormorant Garamond',serif",letterSpacing:'0.03em',textTransform:'uppercase'}}>
                  Simulacion de tabla de pagos
                </div>
                <button onClick={()=>setModalPlan(false)} style={{background:'rgba(255,255,255,0.12)',borderWidth:'1px',borderStyle:'solid',borderColor:'rgba(255,255,255,0.2)',padding:'5px 10px',cursor:'pointer',color:'#fff',display:'flex',alignItems:'center',borderRadius:'2px'}}><X size={15}/></button>
              </div>
              {/* Fila resumen */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',borderBottomWidth:'1px',borderBottomStyle:'solid',borderBottomColor:'rgba(255,255,255,0.08)'}}>
                {[
                  ['Producto',         prodSel?.nombre||'—'],
                  ['Monto',            fmtMoney(parseFloat(monto)||0)],
                  ['Pago por periodo', tablaPlan.length?fmtMoney(tablaPlan[0].pagoTotal):'$0.00'],
                  ['Total a pagar',    fmtMoney(tablaPlan.reduce((a,f)=>a+f.pagoTotal,0))],
                ].map(([l,v])=>(
                  <div key={l} style={{padding:'9px 18px',borderRightWidth:'1px',borderRightStyle:'solid',borderRightColor:'rgba(255,255,255,0.08)'}}>
                    <div style={{fontSize:'10px',color:'rgba(255,255,255,0.45)',textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:'2px'}}>{l}</div>
                    <div style={{fontSize:'14px',fontWeight:'700',color:'#fff'}}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabla */}
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:'12.5px'}}>
                <thead>
                  <tr style={{background:'#17305c'}}>
                    {['Periodo','Fecha pago','Capital Pendiente','Abono capital','Interes','IVA','Pago total','Saldo final'].map(h=>(
                      <th key={h} style={{padding:'8px 12px',color:'#b8cde8',fontWeight:'700',fontSize:'11px',textAlign:h==='Periodo'||h==='Fecha pago'?'center':'right',textTransform:'uppercase',letterSpacing:'0.05em',borderRightWidth:'1px',borderRightStyle:'solid',borderRightColor:'rgba(255,255,255,0.05)',whiteSpace:'nowrap'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tablaPlan.map((f,i)=>(
                    <tr key={i} style={{background:i%2===0?'#fff':'#f4f8fd'}}>
                      <td style={{padding:'7px 12px',textAlign:'center',borderBottomWidth:'1px',borderBottomStyle:'solid',borderBottomColor:'#e8edf3',fontWeight:'700',color:'#0d1f5c',borderRightWidth:'1px',borderRightStyle:'solid',borderRightColor:'#e8edf3'}}>{f.periodo}</td>
                      <td style={{padding:'7px 12px',textAlign:'center',borderBottomWidth:'1px',borderBottomStyle:'solid',borderBottomColor:'#e8edf3',fontFamily:'monospace',fontSize:'12px',color:'#446',borderRightWidth:'1px',borderRightStyle:'solid',borderRightColor:'#e8edf3'}}>{f.fecha}</td>
                      <td style={{padding:'7px 12px',textAlign:'right',borderBottomWidth:'1px',borderBottomStyle:'solid',borderBottomColor:'#e8edf3',borderRightWidth:'1px',borderRightStyle:'solid',borderRightColor:'#e8edf3'}}>{fmtMoney(f.capitalPendiente)}</td>
                      <td style={{padding:'7px 12px',textAlign:'right',borderBottomWidth:'1px',borderBottomStyle:'solid',borderBottomColor:'#e8edf3',color:'#155724',fontWeight:'600',borderRightWidth:'1px',borderRightStyle:'solid',borderRightColor:'#e8edf3'}}>{fmtMoney(f.abonoCapital)}</td>
                      <td style={{padding:'7px 12px',textAlign:'right',borderBottomWidth:'1px',borderBottomStyle:'solid',borderBottomColor:'#e8edf3',color:'#dc3545',borderRightWidth:'1px',borderRightStyle:'solid',borderRightColor:'#e8edf3'}}>{fmtMoney(f.interes)}</td>
                      <td style={{padding:'7px 12px',textAlign:'right',borderBottomWidth:'1px',borderBottomStyle:'solid',borderBottomColor:'#e8edf3',borderRightWidth:'1px',borderRightStyle:'solid',borderRightColor:'#e8edf3'}}>{fmtMoney(f.iva)}</td>
                      <td style={{padding:'7px 12px',textAlign:'right',borderBottomWidth:'1px',borderBottomStyle:'solid',borderBottomColor:'#e8edf3',fontWeight:'700',color:'#0d1f5c',borderRightWidth:'1px',borderRightStyle:'solid',borderRightColor:'#e8edf3'}}>{fmtMoney(f.pagoTotal)}</td>
                      <td style={{padding:'7px 12px',textAlign:'right',borderBottomWidth:'1px',borderBottomStyle:'solid',borderBottomColor:'#e8edf3',color:f.saldoFinal<1?'#155724':'#222',fontWeight:'600'}}>{fmtMoney(f.saldoFinal)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{background:'#0d1f5c'}}>
                    <td colSpan={2} style={{padding:'8px 12px',color:'#fff',fontWeight:'700',fontSize:'12px',textTransform:'uppercase',letterSpacing:'0.06em'}}>Totales</td>
                    <td style={{padding:'8px 12px',textAlign:'right',color:'rgba(255,255,255,0.35)'}}>—</td>
                    <td style={{padding:'8px 12px',textAlign:'right',color:'#86efac',fontWeight:'700'}}>{fmtMoney(tablaPlan.reduce((a,f)=>a+f.abonoCapital,0))}</td>
                    <td style={{padding:'8px 12px',textAlign:'right',color:'#fca5a5',fontWeight:'700'}}>{fmtMoney(tablaPlan.reduce((a,f)=>a+f.interes,0))}</td>
                    <td style={{padding:'8px 12px',textAlign:'right',color:'rgba(255,255,255,0.7)',fontWeight:'700'}}>{fmtMoney(tablaPlan.reduce((a,f)=>a+f.iva,0))}</td>
                    <td style={{padding:'8px 12px',textAlign:'right',color:'#fff',fontWeight:'700',fontSize:'13px'}}>{fmtMoney(tablaPlan.reduce((a,f)=>a+f.pagoTotal,0))}</td>
                    <td style={{padding:'8px 12px',textAlign:'right',color:'rgba(255,255,255,0.35)'}}>—</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div style={{padding:'10px 18px',borderTopWidth:'1px',borderTopStyle:'solid',borderTopColor:'#dce4ef',display:'flex',justifyContent:'flex-end',background:'#f4f6fa'}}>
              <button onClick={()=>setModalPlan(false)} style={{background:'#0d1f5c',color:'#fff',border:'none',padding:'8px 32px',fontSize:'13px',fontWeight:'700',cursor:'pointer',textTransform:'uppercase',letterSpacing:'0.07em'}}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}