'use client';
import React, { useState, useEffect } from 'react';
import {
  Search, User, AlertCircle, CheckCircle, Loader,
  Plus, X, CreditCard, DollarSign, FileText, ChevronRight
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://fiem-backend-production.up.railway.app';

const fmtMoney = v => v ? `$${Number(v).toLocaleString('es-MX',{minimumFractionDigits:2})}` : '$0.00';

// ─── Estilos base ──────────────────────────────────────────────
const S = {
  card:    { background:'#fff', borderRadius:'16px', borderWidth:'1px', borderStyle:'solid', borderColor:'#dceaf8', boxShadow:'0 2px 14px rgba(14,80,160,0.07)', marginBottom:'16px', overflow:'hidden' },
  cardHead:{ padding:'14px 20px', background:'#f4f8fd', borderBottomWidth:'1px', borderBottomStyle:'solid', borderBottomColor:'#dceaf8', fontFamily:"'Cormorant Garamond', serif", fontSize:'17px', fontWeight:'700', color:'#0a2d5e' },
  cardBody:{ padding:'18px 20px' },
  input:   { border:'1.5px solid #dceaf8', borderRadius:'8px', padding:'7px 11px', fontSize:'13px', fontFamily:'DM Sans, sans-serif', color:'#1a3d6e', outline:'none', background:'#fafcff', boxSizing:'border-box' },
  inputRO: { border:'1.5px solid #f0f6ff', borderRadius:'8px', padding:'7px 11px', fontSize:'13px', fontFamily:'DM Sans, sans-serif', color:'#4a6a94', outline:'none', background:'#f8fbff', boxSizing:'border-box' },
  label:   { fontSize:'11px', fontWeight:'700', color:'#90aac8', textTransform:'uppercase', letterSpacing:'0.06em' },
  sel:     { border:'1.5px solid #dceaf8', borderRadius:'8px', padding:'7px 11px', fontSize:'13px', fontFamily:'DM Sans, sans-serif', color:'#1a3d6e', outline:'none', background:'#fafcff', cursor:'pointer', boxSizing:'border-box' },
};

const Lbl = ({children}) => <span style={S.label}>{children}</span>;

const Inp = ({val, onChange, type='text', placeholder='', width='100%', readOnly=false}) => (
  <input type={type} value={val||''} onChange={readOnly?undefined:e=>onChange(e.target.value)}
    readOnly={readOnly} placeholder={placeholder}
    style={{...( readOnly?S.inputRO:S.input), width}}/>
);

const Sel = ({val, onChange, opts=[], width='100%', placeholder=''}) => (
  <select value={val||''} onChange={e=>onChange(e.target.value)} style={{...S.sel, width}}>
    {placeholder && <option value="">{placeholder}</option>}
    {opts.map(o => <option key={o} value={o}>{o}</option>)}
  </select>
);

// ─── Componente principal ──────────────────────────────────────
export default function NuevaSolicitud() {
  const [paso,          setPaso]         = useState(1); // 1=elegir producto, 2=formulario
  const [productos,     setProductos]    = useState([]);
  const [productoSel,   setProductoSel]  = useState(null);
  const [cargando,      setCargando]     = useState(false);
  const [msgOk,         setMsgOk]        = useState('');
  const [msgErr,        setMsgErr]       = useState('');
  const [enviando,      setEnviando]     = useState(false);
  const [modalPlan,     setModalPlan]    = useState(false);
  const [tablaPlan,     setTablaPlan]    = useState([]);

  // Cliente
  const [numSocio,      setNumSocio]     = useState('');
  const [cliente,       setCliente]      = useState(null);
  const [buscandoCli,   setBuscandoCli]  = useState(false);
  const [errCliente,    setErrCliente]   = useState('');

  // Avales
  const [avales,        setAvales]       = useState([]);

  // Características
  const [tipoCNBV,      setTipoCNBV]     = useState('AL CONSUMO');
  const [monto,         setMonto]        = useState('');
  const [iva,           setIva]          = useState('0');
  const [formaPago,     setFormaPago]    = useState('SEMANAL');
  const [plazo,         setPlazo]        = useState('1');
  const [tbInteresN,    setTbInteresN]   = useState('FIJA');
  const [tipoTasa,      setTipoTasa]     = useState('MENSUAL');
  const [tasaInteres,   setTasaInteres]  = useState('');
  const [tbInteresM,    setTbInteresM]   = useState('FIJA');
  const [tipoTasaMor,   setTipoTasaMor]  = useState('MENSUAL');
  const [pctMoratorio,  setPctMoratorio] = useState('');
  const [destino,       setDestino]      = useState('');

  // Financiero
  const [ingresoM,      setIngresoM]     = useState('0');
  const [otrosIng,      setOtrosIng]     = useState('0');
  const [gastos,        setGastos]       = useState({ alimento:'', luz:'', telefono:'', transporte:'', renta:'', inversion:'', creditos:'', otros:'' });

  useEffect(() => { fetchProductos(); }, []);

  const PRODUCTOS_DEFAULT = [
    { _id: 'default-personal', clave: 'PERSONAL', nombre: 'PRESTAMO PERSONAL', frecuencia: 'SEMANAL', activo: true },
    { _id: 'default-grupal',   clave: 'GRUPAL',   nombre: 'PRESTAMO GRUPAL',   frecuencia: 'SEMANAL', activo: true },
  ];

  const fetchProductos = async () => {
    setCargando(true);
    try {
      const res  = await fetch(`${API}/api/productos-credito`);
      const data = await res.json();
      const arr  = Array.isArray(data) ? data.filter(p=>p.activo!==false) : [];
      setProductos(arr.length > 0 ? arr : PRODUCTOS_DEFAULT);
    } catch {
      setProductos(PRODUCTOS_DEFAULT);
    } finally { setCargando(false); }
  };

  const buscarCliente = async () => {
    if (!numSocio.trim()) return;
    setBuscandoCli(true); setErrCliente(''); setCliente(null);
    try {
      // Buscar por número de socio (búsqueda general)
      const res  = await fetch(`${API}/api/clientes?busqueda=${encodeURIComponent(numSocio)}`);
      const data = await res.json();
      const arr  = Array.isArray(data) ? data : (data.clientes || []);
      if (arr.length === 0) { setErrCliente('No se encontró ningún cliente con ese número.'); return; }
      const cl = arr[0];
      if (cl.estatus === 'Lista negra') { setErrCliente('Este cliente está en lista negra y no puede solicitar crédito.'); return; }
      setCliente(cl);
      // Pre-llenar ingresos del cliente
      if (cl.ingresoMensual) setIngresoM(String(cl.ingresoMensual));
      if (cl.otrosIngresos)  setOtrosIng(String(cl.otrosIngresos));
      if (cl.gastos) setGastos(g => ({ ...g, ...cl.gastos }));
    } catch { setErrCliente('Error al buscar cliente.'); }
    finally { setBuscandoCli(false); }
  };

  const agregarAval = () => setAvales(a => [...a, { nombre:'', curp:'', telefono:'' }]);
  const quitarAval  = i => setAvales(a => a.filter((_,j)=>j!==i));
  const chAval = (i, f, v) => setAvales(a => { const n=[...a]; n[i]={...n[i],[f]:v}; return n; });
  const chGasto = (k, v) => setGastos(g => ({...g, [k]:v}));

  const ingresoTotal  = (parseFloat(ingresoM)||0) + (parseFloat(otrosIng)||0);
  const totalGasto    = Object.values(gastos).reduce((a,v)=>a+(parseFloat(v)||0),0);
  const totalDisp     = ingresoTotal - totalGasto;

  const simularPlan = () => {
    if (!monto || !plazo || !tasaInteres) {
      setMsgErr('Completa monto, plazo y tasa de interés para simular.');
      setTimeout(()=>setMsgErr(''),3000); return;
    }
    const capital   = parseFloat(monto) || 0;
    const tasaP     = parseFloat(tasaInteres) / 100; // tasa por periodo
    const periodos  = parseInt(plazo) || 1;
    const ivaP      = parseFloat(iva) / 100 || 0;

    // Calcular pago fijo (sistema francés / cuota nivelada)
    let pagoPeriodo;
    if (tasaP === 0) {
      pagoPeriodo = capital / periodos;
    } else {
      pagoPeriodo = (capital * tasaP) / (1 - Math.pow(1 + tasaP, -periodos));
    }

    // Calcular fecha base según forma de pago
    const hoy = new Date();
    const diasSalto = { DIARIA:1, SEMANAL:7, CATORCENAL:14, QUINCENAL:15, MENSUAL:30 };
    const salto = diasSalto[formaPago] || 7;

    const filas = [];
    let saldo = capital;
    for (let i = 1; i <= periodos; i++) {
      const fechaPago = new Date(hoy);
      fechaPago.setDate(hoy.getDate() + salto * i);
      const interes     = saldo * tasaP;
      const ivaMonto    = interes * ivaP;
      const abonoCapital = pagoPeriodo - interes - ivaMonto;
      const pagoTotal   = pagoPeriodo + ivaMonto;
      saldo = Math.max(saldo - abonoCapital, 0);
      filas.push({
        periodo:   i,
        fecha:     fechaPago.toLocaleDateString('es-MX', {year:'numeric',month:'2-digit',day:'2-digit'}),
        capitalPendiente: saldo + abonoCapital, // antes del abono
        abonoCapital: Math.max(abonoCapital, 0),
        interes,
        iva: ivaMonto,
        pagoTotal,
        saldoFinal: saldo,
      });
    }
    setTablaPlan(filas);
    setModalPlan(true);
  };

  const enviarSolicitud = async () => {
    if (!cliente)        { setMsgErr('Selecciona un cliente primero.'); return; }
    if (!productoSel)    { setMsgErr('Selecciona un producto de crédito.'); return; }
    if (!monto)          { setMsgErr('Ingresa el monto solicitado.'); return; }
    setEnviando(true);
    try {
      const payload = {
        clienteId:     cliente._id,
        clienteNombre: `${cliente.apellidoP||''} ${cliente.apellidoM||''} ${cliente.nombre||''}`.trim(),
        clienteCurp:   cliente.curp || '',
        producto:      productoSel.nombre,
        monto:         parseFloat(monto),
        plazo:         parseInt(plazo),
        frecuencia:    formaPago,
        destino,
        tipoCNBV,
        tasaInteres:   parseFloat(tasaInteres)||0,
        tbInteresN,    tipoTasa,
        tbInteresM,    tipoTasaMor,
        pctMoratorio:  parseFloat(pctMoratorio)||0,
        ingresoMensual:parseFloat(ingresoM)||0,
        otrosIngresos: parseFloat(otrosIng)||0,
        gastos,
        avales,
        estatus:       'Pendiente',
        fecha:         new Date().toLocaleDateString('es-MX'),
      };
      const res  = await fetch(`${API}/api/solicitudes`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error||'Error al enviar');
      setMsgOk('Solicitud enviada correctamente. Folio: ' + (data._id?.slice(-6)||'—'));
      setTimeout(()=>setMsgOk(''),5000);
      // Reset
      setPaso(1); setProductoSel(null); setCliente(null); setNumSocio('');
      setMonto(''); setPlazo('1'); setTasaInteres(''); setDestino('');
      setAvales([]); setIngresoM('0'); setOtrosIng('0');
      setGastos({alimento:'',luz:'',telefono:'',transporte:'',renta:'',inversion:'',creditos:'',otros:''});
    } catch(e) { setMsgErr(e.message); setTimeout(()=>setMsgErr(''),4000); }
    finally { setEnviando(false); }
  };

  const cancelar = () => {
    setPaso(1); setProductoSel(null); setCliente(null); setNumSocio('');
    setMonto(''); setPlazo('1'); setTasaInteres(''); setDestino(''); setAvales([]);
    setMsgOk(''); setMsgErr('');
  };

  // ── PASO 1: Seleccionar producto ───────────────────────────────
  if (paso === 1) return (
    <div style={{ maxWidth:'860px', margin:'0 auto', fontFamily:'DM Sans, sans-serif' }}>
      {msgErr && <div style={{ background:'#fee2e2', borderWidth:'1px', borderStyle:'solid', borderColor:'#fca5a5', borderRadius:'10px', padding:'11px 16px', marginBottom:'14px', color:'#dc2626', fontSize:'13px', fontWeight:'600', display:'flex', alignItems:'center', gap:'8px' }}><AlertCircle size={15}/>{msgErr}</div>}
      {msgOk  && <div style={{ background:'#dcfce7', borderWidth:'1px', borderStyle:'solid', borderColor:'#86efac', borderRadius:'10px', padding:'11px 16px', marginBottom:'14px', color:'#166534', fontSize:'13px', fontWeight:'600', display:'flex', alignItems:'center', gap:'8px' }}><CheckCircle size={15}/>{msgOk}</div>}

      <div style={S.card}>
        {/* Header */}
        <div style={{ padding:'22px 24px', borderBottomWidth:'1px', borderBottomStyle:'solid', borderBottomColor:'#dceaf8', textAlign:'center' }}>
          <h2 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:'26px', fontWeight:'700', color:'#0a2d5e', margin:'0 0 6px' }}>Nueva solicitud de crédito</h2>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'#f0f7ff', borderRadius:'20px', padding:'5px 16px' }}>
            <div style={{ width:'22px', height:'22px', borderRadius:'50%', background:'#0e50a0', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ color:'#fff', fontSize:'12px', fontWeight:'700' }}>1</span>
            </div>
            <span style={{ fontSize:'13px', color:'#0e50a0', fontWeight:'600' }}>Seleccionar tipo de crédito (paso 1 de 3)</span>
          </div>
        </div>

        {/* Tabla de productos */}
        <div style={{ padding:'6px 0' }}>
          <div style={{ padding:'10px 20px', background:'#e8f2fc', borderBottomWidth:'1px', borderBottomStyle:'solid', borderBottomColor:'#dceaf8' }}>
            <span style={{ fontSize:'13px', fontWeight:'700', color:'#0e50a0' }}>Nombre producto crédito</span>
          </div>
          {cargando && (
            <div style={{ padding:'30px', textAlign:'center' }}><Loader size={22} color="#0e50a0" style={{ animation:'spin 1s linear infinite' }}/></div>
          )}
          {!cargando && productos.length === 0 && (
            <div style={{ padding:'30px', textAlign:'center', color:'#90aac8', fontSize:'13px' }}>No hay productos de crédito configurados.</div>
          )}
          {productos.map((p, i) => (
            <div key={p._id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px', borderBottomWidth:'1px', borderBottomStyle:'solid', borderBottomColor:'#f0f6ff', background:i%2===0?'#fff':'#fafcff' }}>
              <div>
                <span style={{ fontSize:'14px', fontWeight:'600', color:'#1a3d6e', textTransform:'uppercase' }}>{p.nombre}</span>
                {(p.montoMin||p.montoMax) && (
                  <span style={{ fontSize:'12px', color:'#90aac8', marginLeft:'14px' }}>
                    {p.montoMin?fmtMoney(p.montoMin):''}{p.montoMax?` – ${fmtMoney(p.montoMax)}`:''}
                  </span>
                )}
              </div>
              <button onClick={()=>{ setProductoSel(p); if(p.tasa) setTasaInteres(String(p.tasa)); setPaso(2); }}
                style={{ background:'#22c55e', color:'#fff', border:'none', borderRadius:'8px', padding:'9px 32px', fontSize:'13px', fontWeight:'700', cursor:'pointer', minWidth:'160px' }}>
                Seleccionar
              </button>
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // ── PASO 2: Formulario ─────────────────────────────────────────
  return (
    <div style={{ maxWidth:'860px', margin:'0 auto', fontFamily:'DM Sans, sans-serif' }}>
      {msgErr && <div style={{ background:'#fee2e2', borderWidth:'1px', borderStyle:'solid', borderColor:'#fca5a5', borderRadius:'10px', padding:'11px 16px', marginBottom:'14px', color:'#dc2626', fontSize:'13px', fontWeight:'600', display:'flex', alignItems:'center', gap:'8px' }}><AlertCircle size={15}/>{msgErr}</div>}
      {msgOk  && <div style={{ background:'#dcfce7', borderWidth:'1px', borderStyle:'solid', borderColor:'#86efac', borderRadius:'10px', padding:'11px 16px', marginBottom:'14px', color:'#166534', fontSize:'13px', fontWeight:'600', display:'flex', alignItems:'center', gap:'8px' }}><CheckCircle size={15}/>{msgOk}</div>}

      {/* Título */}
      <div style={{ textAlign:'center', marginBottom:'18px' }}>
        <h2 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:'26px', fontWeight:'700', color:'#0a2d5e', margin:'0 0 8px' }}>
          Nueva solicitud de crédito — {productoSel?.nombre}
        </h2>
        <button onClick={()=>setPaso(1)} style={{ background:'#e8f2fc', color:'#0e50a0', border:'none', borderRadius:'8px', padding:'6px 16px', fontSize:'12px', fontWeight:'600', cursor:'pointer' }}>
          ← Cambiar producto
        </button>
      </div>

      {/* ── CLIENTE ── */}
      <div style={S.card}>
        <div style={S.cardHead}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <div style={{ width:'28px', height:'28px', background:'#e8f2fc', borderRadius:'7px', display:'flex', alignItems:'center', justifyContent:'center' }}><User size={14} color="#0e50a0"/></div>
            Cliente
          </div>
        </div>
        <div style={S.cardBody}>
          <div style={{ display:'flex', gap:'10px', alignItems:'center', marginBottom:'14px', flexWrap:'wrap' }}>
            <Inp val={numSocio} onChange={setNumSocio} placeholder="Número de socio / nombre" width="220px"/>
            <button onClick={buscarCliente} disabled={buscandoCli} style={{ background:'#0e50a0', color:'#fff', border:'none', borderRadius:'8px', padding:'8px 20px', fontSize:'13px', fontWeight:'600', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px' }}>
              {buscandoCli ? <Loader size={13} style={{ animation:'spin 1s linear infinite' }}/> : <Search size={13}/>} Buscar
            </button>
          </div>
          {errCliente && <p style={{ color:'#dc2626', fontSize:'13px', margin:'0 0 8px', fontWeight:'600' }}>{errCliente}</p>}
          {cliente ? (
            <div style={{ background:'#f0f7ff', borderRadius:'10px', padding:'12px 16px', display:'flex', gap:'24px', flexWrap:'wrap', alignItems:'center', borderWidth:'1px', borderStyle:'solid', borderColor:'#dceaf8' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <div style={{ width:'40px', height:'40px', borderRadius:'50%', overflow:'hidden', background:'#e8f2fc', flexShrink:0 }}>
                  {(cliente.documentos?.fotoPerfil||cliente.fotos?.cliente)
                    ? <img src={cliente.documentos?.fotoPerfil||cliente.fotos?.cliente} alt="Foto" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                    : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}><User size={20} color="#90aac8"/></div>}
                </div>
                <div>
                  <div style={{ fontSize:'14px', fontWeight:'700', color:'#0a2d5e', textTransform:'uppercase' }}>
                    {cliente.apellidoP} {cliente.apellidoM} {cliente.nombre}
                  </div>
                  <div style={{ fontSize:'12px', color:'#4a6a94' }}>CURP: {cliente.curp||'—'}</div>
                </div>
              </div>
              <div style={{ display:'flex', gap:'16px', flexWrap:'wrap' }}>
                <div><div style={S.label}>Ruta</div><div style={{ fontSize:'13px', color:'#1a3d6e' }}>{cliente.rutaVinculacion||'—'}</div></div>
                <div><div style={S.label}>Celular</div><div style={{ fontSize:'13px', color:'#1a3d6e' }}>{cliente.celular||'—'}</div></div>
                <div><div style={S.label}>Estatus</div><span style={{ background:'#dcfce7', color:'#166534', borderRadius:'20px', padding:'2px 10px', fontSize:'11px', fontWeight:'700' }}>{cliente.estatus}</span></div>
              </div>
              <button onClick={()=>{ setCliente(null); setNumSocio(''); }} style={{ background:'none', border:'none', cursor:'pointer', color:'#90aac8', marginLeft:'auto' }}><X size={16}/></button>
            </div>
          ) : (
            <div style={{ display:'grid', gap:'6px' }}>
              <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
                <Lbl>NOMBRE:</Lbl>
                <span style={{ fontSize:'13px', color:'#90aac8', fontStyle:'italic' }}>Busca un cliente por número o nombre</span>
              </div>
              <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
                <Lbl>CURP:</Lbl>
                <span style={{ fontSize:'13px', color:'#90aac8' }}>—</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── AVALES ── */}
      <div style={S.card}>
        <div style={{ ...S.cardHead, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <div style={{ width:'28px', height:'28px', background:'#fef3c7', borderRadius:'7px', display:'flex', alignItems:'center', justifyContent:'center' }}><User size={14} color="#d97706"/></div>
            Avales
          </div>
          <button onClick={agregarAval} style={{ background:'#e8f2fc', color:'#0e50a0', border:'none', borderRadius:'7px', padding:'5px 14px', fontSize:'12px', fontWeight:'600', cursor:'pointer', display:'flex', alignItems:'center', gap:'5px' }}>
            <Plus size={13}/> Agregar aval
          </button>
        </div>
        {avales.length === 0 ? (
          <div style={{ ...S.cardBody, color:'#90aac8', fontSize:'13px', textAlign:'center' }}>Sin avales — opcional</div>
        ) : (
          <div style={S.cardBody}>
            {avales.map((av, i) => (
              <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr auto', gap:'10px', marginBottom:'10px', alignItems:'end' }}>
                <div><label style={S.label}>Nombre aval {i+1}</label><Inp val={av.nombre} onChange={v=>chAval(i,'nombre',v)} width="100%"/></div>
                <div><label style={S.label}>CURP</label><Inp val={av.curp} onChange={v=>chAval(i,'curp',v.toUpperCase())} width="100%"/></div>
                <div><label style={S.label}>Teléfono</label><Inp val={av.telefono} onChange={v=>chAval(i,'telefono',v)} type="tel" width="100%"/></div>
                <button onClick={()=>quitarAval(i)} style={{ background:'#fee2e2', color:'#dc2626', border:'none', borderRadius:'7px', padding:'8px', cursor:'pointer', display:'flex', alignItems:'center', marginBottom:'1px' }}><X size={14}/></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── CARACTERÍSTICAS PRINCIPALES ── */}
      <div style={S.card}>
        <div style={S.cardHead}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <div style={{ width:'28px', height:'28px', background:'#e8f2fc', borderRadius:'7px', display:'flex', alignItems:'center', justifyContent:'center' }}><CreditCard size={14} color="#0e50a0"/></div>
            Características principales
          </div>
        </div>
        <div style={S.cardBody}>
          {/* Tipo crédito + producto */}
          <div style={{ display:'flex', gap:'12px', flexWrap:'wrap', alignItems:'center', marginBottom:'14px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <Lbl>Tipo de crédito:</Lbl>
              <Sel val={productoSel?.nombre} onChange={()=>{}} opts={[productoSel?.nombre||'']} width="190px"/>
            </div>
          </div>
          <div style={{ marginBottom:'14px' }}>
            <Lbl>Tipo de Producto:</Lbl>
            <input readOnly value={productoSel ? productoSel.nombre : 'En espera...Seleccione un producto de crédito antes de continuar'}
              style={{ ...S.inputRO, width:'100%', marginTop:'4px', color: productoSel?'#1a3d6e':'#90aac8', fontStyle: productoSel?'normal':'italic' }}/>
          </div>

          <hr style={{ border:'none', borderTopWidth:'1px', borderTopStyle:'solid', borderTopColor:'#f0f6ff', margin:'14px 0' }}/>

          {/* Fila 1: CNBV, Monto, IVA */}
          <div style={{ display:'flex', gap:'14px', flexWrap:'wrap', alignItems:'center', marginBottom:'12px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
              <Lbl>Tipo (CNBV):</Lbl>
              <Sel val={tipoCNBV} onChange={setTipoCNBV} opts={['AL CONSUMO','COMERCIAL','A LA VIVIENDA']} width="140px"/>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
              <Lbl>Monto total:</Lbl>
              <Inp val={monto} onChange={setMonto} type="number" width="130px"/>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
              <Lbl>IVA:</Lbl>
              <Inp val={iva} onChange={setIva} type="number" width="80px"/>
            </div>
          </div>

          {/* Fila 2: Forma pago, Plazo, TB normal, Tipo tasa, Tasa */}
          <div style={{ display:'flex', gap:'10px', flexWrap:'wrap', alignItems:'center', marginBottom:'12px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'5px' }}>
              <Lbl>Forma de pago:</Lbl>
              <Sel val={formaPago} onChange={setFormaPago} opts={['DIARIA','SEMANAL','CATORCENAL','QUINCENAL','MENSUAL']} width="130px"/>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'5px' }}>
              <Lbl>Plazo:</Lbl>
              <Sel val={plazo} onChange={setPlazo} opts={Array.from({length:60},(_,i)=>String(i+1))} width="70px"/>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'5px' }}>
              <Lbl>T.B. Interés normal:</Lbl>
              <Sel val={tbInteresN} onChange={setTbInteresN} opts={['FIJA','VARIABLE']} width="100px"/>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'5px' }}>
              <Lbl>Tipo tasa:</Lbl>
              <Sel val={tipoTasa} onChange={setTipoTasa} opts={['MENSUAL','ANUAL','DIARIA','SEMANAL']} width="110px"/>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'5px' }}>
              <Lbl>Tasa de interés:</Lbl>
              <Inp val={tasaInteres} onChange={setTasaInteres} type="number" width="90px"/>
            </div>
          </div>

          {/* Fila 3: Moratorio + Destino */}
          <div style={{ display:'flex', gap:'10px', flexWrap:'wrap', alignItems:'center' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'5px' }}>
              <Lbl>T.B. Interés Moratorio:</Lbl>
              <Sel val={tbInteresM} onChange={setTbInteresM} opts={['FIJA','VARIABLE']} width="100px"/>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'5px' }}>
              <Lbl>Tipo tasa Moratorio:</Lbl>
              <Sel val={tipoTasaMor} onChange={setTipoTasaMor} opts={['MENSUAL','ANUAL','DIARIA','SEMANAL']} width="110px"/>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'5px' }}>
              <Lbl>Porcentaje tasa moratorio:</Lbl>
              <Inp val={pctMoratorio} onChange={setPctMoratorio} type="number" width="90px"/>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'5px' }}>
              <Lbl>Destino:</Lbl>
              <Inp val={destino} onChange={setDestino} width="140px"/>
            </div>
          </div>
        </div>
      </div>

      {/* ── INFORMACIÓN FINANCIERA ── */}
      <div style={S.card}>
        <div style={S.cardHead}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <div style={{ width:'28px', height:'28px', background:'#fef3c7', borderRadius:'7px', display:'flex', alignItems:'center', justifyContent:'center' }}><DollarSign size={14} color="#d97706"/></div>
            Información financiera
          </div>
        </div>
        <div style={S.cardBody}>
          {/* Ingresos */}
          <div style={{ background:'#e8f2fc', borderRadius:'6px', padding:'6px 12px', marginBottom:'12px', fontSize:'12px', fontWeight:'700', color:'#0e50a0', textTransform:'uppercase', letterSpacing:'0.05em' }}>Ingresos</div>
          <div style={{ display:'flex', gap:'16px', flexWrap:'wrap', marginBottom:'16px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <Lbl>Ingreso mensual promedio:</Lbl>
              <Inp val={ingresoM} onChange={setIngresoM} type="number" width="130px"/>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <Lbl>Otros Ingresos:</Lbl>
              <Inp val={otrosIng} onChange={setOtrosIng} type="number" width="130px"/>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <Lbl>Ingreso promedio total:</Lbl>
              <input readOnly value={ingresoTotal} style={{ ...S.inputRO, width:'130px', fontWeight:'700', color:'#0e50a0' }}/>
            </div>
          </div>

          {/* Gastos */}
          <div style={{ background:'#e8f2fc', borderRadius:'6px', padding:'6px 12px', marginBottom:'12px', fontSize:'12px', fontWeight:'700', color:'#0e50a0', textTransform:'uppercase', letterSpacing:'0.05em' }}>Gasto promedio mensual</div>
          <div style={{ display:'flex', gap:'12px', flexWrap:'wrap', marginBottom:'12px' }}>
            {[['Alimento','alimento'],['Luz','luz'],['Teléfono','telefono'],['Transporte','transporte']].map(([l,k])=>(
              <div key={k} style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                <Lbl>{l}:</Lbl>
                <Inp val={gastos[k]} onChange={v=>chGasto(k,v)} type="number" width="100px"/>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', gap:'12px', flexWrap:'wrap', marginBottom:'14px' }}>
            {[['Renta','renta'],['Inversión negocio','inversion'],['Créditos','creditos'],['Otros','otros']].map(([l,k])=>(
              <div key={k} style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                <Lbl>{l}:</Lbl>
                <Inp val={gastos[k]} onChange={v=>chGasto(k,v)} type="number" width="100px"/>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', gap:'20px', flexWrap:'wrap' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <Lbl>Total gasto:</Lbl>
              <input readOnly value={totalGasto} style={{ ...S.inputRO, width:'120px', color:'#dc2626', fontWeight:'700' }}/>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <Lbl>Total Disponible mensual:</Lbl>
              <input readOnly value={totalDisp} style={{ ...S.inputRO, width:'120px', color:totalDisp>=0?'#166534':'#dc2626', fontWeight:'700' }}/>
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTONES ── */}
      <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginTop:'4px', marginBottom:'24px' }}>
        {/* Simular plan */}
        <button onClick={simularPlan} style={{ width:'100%', background:'#1a1a2e', color:'#fff', border:'none', borderRadius:'10px', padding:'14px', fontSize:'15px', fontWeight:'700', cursor:'pointer', letterSpacing:'0.03em' }}>
          Simular plan de pagos
        </button>
        {/* Enviar solicitud */}
        <button onClick={enviarSolicitud} disabled={enviando} style={{ width:'100%', background:'#22c55e', color:'#fff', border:'none', borderRadius:'10px', padding:'14px', fontSize:'15px', fontWeight:'700', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', opacity:enviando?0.7:1 }}>
          {enviando ? <><Loader size={16} style={{ animation:'spin 1s linear infinite' }}/> Enviando...</> : 'Enviar solicitud'}
        </button>
        {/* Cancelar */}
        <button onClick={cancelar} style={{ width:'100%', background:'#dc2626', color:'#fff', border:'none', borderRadius:'10px', padding:'14px', fontSize:'15px', fontWeight:'700', cursor:'pointer' }}>
          Cancelar
        </button>
      </div>


      {/* ── Modal Simulación ── */}
      {modalPlan && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'flex-start', justifyContent:'center', zIndex:2000, padding:'20px', overflowY:'auto' }}>
          <div style={{ background:'#fff', borderRadius:'16px', width:'100%', maxWidth:'900px', boxShadow:'0 20px 60px rgba(0,0,0,0.3)', marginTop:'20px' }}>
            {/* Header */}
            <div style={{ background:'#0d1f5c', borderRadius:'16px 16px 0 0', padding:'16px 24px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div>
                <h3 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:'20px', fontWeight:'700', color:'#fff', margin:0 }}>Simulación de tabla de pagos</h3>
                <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.7)', margin:'2px 0 0' }}>
                  {productoSel?.nombre} — {fmtMoney(parseFloat(monto)||0)} — {plazo} periodos {formaPago.toLowerCase()}
                </p>
              </div>
              <button onClick={()=>setModalPlan(false)} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:'8px', padding:'7px 10px', cursor:'pointer', color:'#fff', display:'flex', alignItems:'center' }}><X size={18}/></button>
            </div>
            {/* Tabla */}
            <div style={{ overflowX:'auto', padding:'0' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
                <thead>
                  <tr style={{ background:'#0d1f5c' }}>
                    {['Periodo','Fecha pago','Capital Pendiente','Abono capital','Interés','IVA','Pago total','Saldo final'].map(h=>(
                      <th key={h} style={{ padding:'10px 14px', color:'#fff', fontWeight:'700', fontSize:'12px', textAlign:'right', whiteSpace:'nowrap', borderRightWidth:'1px', borderRightStyle:'solid', borderRightColor:'rgba(255,255,255,0.1)' }}>
                        {h==='Periodo'||h==='Fecha pago' ? <span style={{textAlign:'center',display:'block'}}>{h}</span> : h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tablaPlan.map((f,i)=>(
                    <tr key={i} style={{ background: i%2===0?'#fff':'#f8fbff' }}>
                      <td style={{ padding:'9px 14px', textAlign:'center', borderBottomWidth:'1px', borderBottomStyle:'solid', borderBottomColor:'#f0f6ff', fontWeight:'700', color:'#0e50a0' }}>{f.periodo}</td>
                      <td style={{ padding:'9px 14px', textAlign:'center', borderBottomWidth:'1px', borderBottomStyle:'solid', borderBottomColor:'#f0f6ff', fontFamily:'monospace', fontSize:'12px' }}>{f.fecha}</td>
                      <td style={{ padding:'9px 14px', textAlign:'right', borderBottomWidth:'1px', borderBottomStyle:'solid', borderBottomColor:'#f0f6ff' }}>{fmtMoney(f.capitalPendiente)}</td>
                      <td style={{ padding:'9px 14px', textAlign:'right', borderBottomWidth:'1px', borderBottomStyle:'solid', borderBottomColor:'#f0f6ff', color:'#166534', fontWeight:'600' }}>{fmtMoney(f.abonoCapital)}</td>
                      <td style={{ padding:'9px 14px', textAlign:'right', borderBottomWidth:'1px', borderBottomStyle:'solid', borderBottomColor:'#f0f6ff', color:'#dc2626' }}>{fmtMoney(f.interes)}</td>
                      <td style={{ padding:'9px 14px', textAlign:'right', borderBottomWidth:'1px', borderBottomStyle:'solid', borderBottomColor:'#f0f6ff' }}>{fmtMoney(f.iva)}</td>
                      <td style={{ padding:'9px 14px', textAlign:'right', borderBottomWidth:'1px', borderBottomStyle:'solid', borderBottomColor:'#f0f6ff', fontWeight:'700', color:'#0a2d5e' }}>{fmtMoney(f.pagoTotal)}</td>
                      <td style={{ padding:'9px 14px', textAlign:'right', borderBottomWidth:'1px', borderBottomStyle:'solid', borderBottomColor:'#f0f6ff', color: f.saldoFinal<1?'#166534':'#1a3d6e', fontWeight:'600' }}>{fmtMoney(f.saldoFinal)}</td>
                    </tr>
                  ))}
                </tbody>
                {/* Totales */}
                <tfoot>
                  <tr style={{ background:'#0d1f5c' }}>
                    <td colSpan={2} style={{ padding:'10px 14px', color:'#fff', fontWeight:'700', fontSize:'13px' }}>TOTALES</td>
                    <td style={{ padding:'10px 14px', textAlign:'right', color:'rgba(255,255,255,0.7)' }}>—</td>
                    <td style={{ padding:'10px 14px', textAlign:'right', color:'#86efac', fontWeight:'700' }}>{fmtMoney(tablaPlan.reduce((a,f)=>a+f.abonoCapital,0))}</td>
                    <td style={{ padding:'10px 14px', textAlign:'right', color:'#fca5a5', fontWeight:'700' }}>{fmtMoney(tablaPlan.reduce((a,f)=>a+f.interes,0))}</td>
                    <td style={{ padding:'10px 14px', textAlign:'right', color:'rgba(255,255,255,0.8)', fontWeight:'700' }}>{fmtMoney(tablaPlan.reduce((a,f)=>a+f.iva,0))}</td>
                    <td style={{ padding:'10px 14px', textAlign:'right', color:'#fff', fontWeight:'700', fontSize:'14px' }}>{fmtMoney(tablaPlan.reduce((a,f)=>a+f.pagoTotal,0))}</td>
                    <td style={{ padding:'10px 14px', textAlign:'right', color:'rgba(255,255,255,0.7)' }}>—</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            {/* Footer */}
            <div style={{ padding:'16px 24px', borderTopWidth:'1px', borderTopStyle:'solid', borderTopColor:'#dceaf8', display:'flex', justifyContent:'flex-end' }}>
              <button onClick={()=>setModalPlan(false)} style={{ background:'#0e50a0', color:'#fff', border:'none', borderRadius:'9px', padding:'10px 28px', fontSize:'13px', fontWeight:'600', cursor:'pointer' }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}