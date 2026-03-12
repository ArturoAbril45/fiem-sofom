'use client';
import { useState, useEffect, useCallback } from 'react';
import { Search, FileText, Eye, X, Check, XCircle, RefreshCw, AlertCircle, CheckCircle, Loader, ArrowLeft, User, DollarSign } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://fiem-backend-production.up.railway.app';
const fmt  = v => `$${(parseFloat(v)||0).toLocaleString('es-MX',{minimumFractionDigits:2})}`;
const fmtF = d => d ? new Date(d).toLocaleDateString('es-MX',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '—';
const inp  = { border:'1.5px solid #dceaf8', borderRadius:'9px', padding:'9px 13px', fontSize:'13px', fontFamily:'DM Sans,sans-serif', color:'#1a3d6e', outline:'none', background:'#fafcff', boxSizing:'border-box' };

function Sec({titulo,icono,children}) {
  return (
    <div style={{background:'#fff',borderRadius:'14px',border:'1px solid #dceaf8',boxShadow:'0 2px 10px rgba(14,80,160,0.05)',marginBottom:'14px',overflow:'hidden'}}>
      <div style={{padding:'11px 18px',background:'#f4f8fd',borderBottom:'1px solid #dceaf8',display:'flex',alignItems:'center',gap:'8px',fontFamily:"'Cormorant Garamond',serif",fontSize:'16px',fontWeight:'700',color:'#0a2d5e'}}>
        {icono}{titulo}
      </div>
      <div style={{padding:'14px 18px'}}>{children}</div>
    </div>
  );
}

function Campo({label,val,w='auto'}) {
  return (
    <div style={{minWidth:'120px',width:w,marginBottom:'4px'}}>
      <div style={{fontSize:'10px',fontWeight:'700',color:'#90aac8',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'2px'}}>{label}</div>
      <div style={{fontSize:'13px',fontWeight:'600',color:'#0a2d5e'}}>{val||'—'}</div>
    </div>
  );
}

function FieldRO({label,val}) {
  return (
    <div style={{display:'flex',alignItems:'center',gap:'5px',flexWrap:'wrap',marginBottom:'4px'}}>
      <span style={{fontSize:'11px',fontWeight:'700',color:'#90aac8',textTransform:'uppercase',letterSpacing:'0.05em',whiteSpace:'nowrap'}}>{label}:</span>
      <span style={{border:'1.5px solid #dceaf8',borderRadius:'6px',padding:'4px 10px',fontSize:'13px',fontFamily:'DM Sans,sans-serif',color:'#1a3d6e',background:'#f8fbff',fontWeight:'600'}}>{val||'—'}</span>
    </div>
  );
}

export default function ConsultarSolicitud() {
  const [vista,       setVista]       = useState('lista');
  const [filtroBtn,   setFiltroBtn]   = useState('pendientes');
  const [busqueda,    setBusqueda]    = useState('');
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando,    setCargando]    = useState(true);
  const [detalle,     setDetalle]     = useState(null);
  const [notif,       setNotif]       = useState(null);
  const [accionando,  setAccionando]  = useState(false);
  const [modalAprob,  setModalAprob]  = useState(false);
  const [modalRechaz, setModalRechaz] = useState(false);
  const [fechaInicio, setFechaInicio] = useState('');
  const [motivoRech,  setMotivoRech]  = useState('');

  const estatusMap   = { pendientes:'Pendiente', aprobadas:'Aprobada', rechazadas:'Rechazada' };
  const subtituloMap = { pendientes:'Solicitudes pendientes', aprobadas:'Solicitudes aprobadas', rechazadas:'Solicitudes rechazadas' };

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const res  = await fetch(`${API}/api/solicitudes`);
      const data = await res.json();
      setSolicitudes(Array.isArray(data) ? data : []);
    } catch { setSolicitudes([]); }
    finally { setCargando(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const mostrarNotif = (tipo, msg) => { setNotif({tipo,msg}); setTimeout(()=>setNotif(null),4000); };

  const aprobarSolicitud = async () => {
    if (!fechaInicio) { mostrarNotif('error','Selecciona la fecha de inicio.'); return; }
    setAccionando(true);
    try {
      await fetch(`${API}/api/solicitudes/${detalle._id}`,{
        method:'PUT', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({estatus:'Aprobada',fechaAprobacion:new Date().toISOString()}),
      });
      await fetch(`${API}/api/creditos`,{
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          clienteId:detalle.clienteId, clienteNombre:detalle.clienteNombre,
          clienteCurp:detalle.clienteCurp, solicitudId:detalle._id,
          producto:detalle.producto, tipo:detalle.tipo||'PERSONAL',
          monto:detalle.monto, saldo:detalle.monto, plazo:detalle.plazo,
          frecuencia:detalle.frecuencia, tasaInteres:detalle.tasaInteres,
          tasaMoratoria:detalle.tasaMoratoria, destino:detalle.destino,
          fechaInicio, estatus:'Vigente', miembros:detalle.miembros,
          nombreGrupo:detalle.nombreGrupo, avales:detalle.avales,
          tablaPagos:detalle.tablaPagos, pagosRealizados:0,
        }),
      });
      mostrarNotif('ok','✅ Solicitud aprobada — crédito creado correctamente');
      setModalAprob(false); setFechaInicio('');
      setDetalle(d=>({...d,estatus:'Aprobada'}));
      cargar();
    } catch(e) { mostrarNotif('error','Error: '+e.message); }
    finally { setAccionando(false); }
  };

  const rechazarSolicitud = async () => {
    setAccionando(true);
    try {
      await fetch(`${API}/api/solicitudes/${detalle._id}`,{
        method:'PUT', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({estatus:'Rechazada',motivoRechazo:motivoRech,fechaRechazo:new Date().toISOString()}),
      });
      mostrarNotif('ok','Solicitud rechazada correctamente.');
      setModalRechaz(false); setMotivoRech('');
      setDetalle(d=>({...d,estatus:'Rechazada',motivoRechazo:motivoRech}));
      cargar();
    } catch { mostrarNotif('error','Error al rechazar.'); }
    finally { setAccionando(false); }
  };

  const estatusActivo = estatusMap[filtroBtn];
  const filtradas = solicitudes.filter(s =>
    s.estatus === estatusActivo &&
    ((s.clienteNombre||'').toLowerCase().includes(busqueda.toLowerCase()) ||
     (s.clienteCurp||'').includes(busqueda) ||
     (s.nombreGrupo||'').toLowerCase().includes(busqueda.toLowerCase()) ||
     (s._id||'').toLowerCase().includes(busqueda.toLowerCase()) ||
     String(s.monto||'').includes(busqueda))
  );

  const bannerCfg = {
    Pendiente:    { bg:'#fef3c7', c:'#92400e', txt:'Esta solicitud se encuentra pendiente de revisión' },
    Aprobada:     { bg:'#22c55e', c:'#fff',    txt:'Esta solicitud ya esta aprobada' },
    Rechazada:    { bg:'#ef4444', c:'#fff',    txt:'Esta solicitud se encuentra cancelada' },
    'En revisión':{ bg:'#3b82f6', c:'#fff',    txt:'Esta solicitud está en revisión' },
  };

  // ════════ VISTA DETALLE ════════
  if (vista==='detalle' && detalle) {
    const banner      = bannerCfg[detalle.estatus] || bannerCfg['Pendiente'];
    const totalGastos = Object.values(detalle.gastos||{}).reduce((a,v)=>a+(parseFloat(v)||0),0);
    return (
      <div style={{maxWidth:'860px',margin:'0 auto',fontFamily:'DM Sans,sans-serif'}}>
        {notif && (
          <div style={{background:notif.tipo==='ok'?'#dcfce7':'#fee2e2',border:`1px solid ${notif.tipo==='ok'?'#86efac':'#fca5a5'}`,borderRadius:'12px',padding:'12px 18px',marginBottom:'16px',color:notif.tipo==='ok'?'#166534':'#dc2626',fontSize:'13px',fontWeight:'600',display:'flex',alignItems:'center',gap:'8px'}}>
            {notif.tipo==='ok'?<CheckCircle size={15}/>:<AlertCircle size={15}/>}{notif.msg}
          </div>
        )}

        <button onClick={()=>setVista('lista')} style={{display:'flex',alignItems:'center',gap:'6px',background:'none',border:'none',color:'#0e50a0',fontWeight:'700',fontSize:'13px',cursor:'pointer',marginBottom:'14px',padding:0}}>
          <ArrowLeft size={15}/> Regresar a solicitudes
        </button>

        <div style={{textAlign:'center',marginBottom:'14px'}}>
          <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'22px',fontWeight:'700',color:'#0a2d5e',margin:'0 0 4px'}}>
            Consultar solicitud {detalle.tipo==='GRUPAL'?'grupal':'personal'}
          </h2>
          <div style={{fontSize:'14px',fontWeight:'700',color:'#0a2d5e',textTransform:'uppercase'}}>
            {detalle.tipo==='GRUPAL' ? detalle.nombreGrupo : detalle.clienteNombre}
          </div>
          <div style={{fontSize:'13px',color:'#90aac8'}}>SOLICITUD: {detalle._id?.slice(-8).toUpperCase()}</div>
        </div>

        {/* Banner */}
        <div style={{background:banner.bg,borderRadius:'10px',padding:'13px',textAlign:'center',marginBottom:'16px'}}>
          <span style={{color:banner.c,fontWeight:'700',fontSize:'14px'}}>{banner.txt}</span>
        </div>

        {/* Botones acción — solo pendiente */}
        {detalle.estatus==='Pendiente' && (
          <div style={{display:'flex',gap:'10px',marginBottom:'16px'}}>
            <button onClick={()=>setModalRechaz(true)}
              style={{flex:1,padding:'11px',border:'1.5px solid #fca5a5',background:'#fff',borderRadius:'10px',fontSize:'13px',fontWeight:'600',color:'#dc2626',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px'}}>
              <XCircle size={14}/> Rechazar solicitud
            </button>
            <button onClick={()=>setModalAprob(true)}
              style={{flex:2,padding:'11px',border:'none',background:'#166534',borderRadius:'10px',fontSize:'13px',fontWeight:'700',color:'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px',boxShadow:'0 4px 12px rgba(22,101,52,0.25)'}}>
              <Check size={14}/> Aprobar solicitud
            </button>
          </div>
        )}

        {/* ── Info solicitud ── */}
        <Sec titulo="Información de la solicitud" icono={<FileText size={15}/>}>
          <div style={{display:'flex',gap:'16px',flexWrap:'wrap'}}>
            <FieldRO label="Identificador único de solicitud" val={detalle._id?.slice(-8).toUpperCase()}/>
            <FieldRO label="Fecha creada" val={fmtF(detalle.fecha||detalle.createdAt)}/>
          </div>
        </Sec>

        {/* ── Cliente ── */}
        {detalle.tipo!=='GRUPAL' && (
          <Sec titulo="Cliente" icono={<User size={15}/>}>
            <div style={{marginBottom:'12px'}}>
              <div style={{fontSize:'14px',fontWeight:'700',color:'#0a2d5e',marginBottom:'4px'}}>NOMBRE: {detalle.clienteNombre||'—'}</div>
              <div style={{fontSize:'13px',color:'#555'}}>CURP: {detalle.clienteCurp||'—'}</div>
            </div>
            <div style={{fontSize:'12px',fontWeight:'700',color:'#0a2d5e',marginBottom:'8px',textTransform:'uppercase'}}>Domicilio que aparecerá en la solicitud</div>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:'12px'}}>
              <thead><tr style={{background:'#e8f2fc'}}>
                {['Selección','Fecha Agregada','CP','Estado','Municipio','Colonia','Calle','Numero exterior'].map(h=>(
                  <th key={h} style={{padding:'7px 10px',textAlign:'left',fontWeight:'700',color:'#0a2d5e',fontSize:'11px',borderBottom:'2px solid #dceaf8'}}>{h}</th>
                ))}
              </tr></thead>
              <tbody><tr style={{background:'#fff'}}>
                <td style={{padding:'7px 10px'}}><span style={{background:'#0e50a0',color:'#fff',borderRadius:'4px',padding:'2px 8px',fontSize:'11px',fontWeight:'600'}}>Seleccionar</span></td>
                <td style={{padding:'7px 10px',fontSize:'11px',color:'#555'}}>{fmtF(detalle.createdAt)}</td>
                <td style={{padding:'7px 10px'}}>{detalle.domicilio?.cp||'—'}</td>
                <td style={{padding:'7px 10px'}}>{detalle.domicilio?.estado||'—'}</td>
                <td style={{padding:'7px 10px'}}>{detalle.domicilio?.municipio||'—'}</td>
                <td style={{padding:'7px 10px'}}>{detalle.domicilio?.colonia||'—'}</td>
                <td style={{padding:'7px 10px'}}>{detalle.domicilio?.calle||'—'}</td>
                <td style={{padding:'7px 10px'}}>{detalle.domicilio?.numExt||'—'}</td>
              </tr></tbody>
            </table>
          </Sec>
        )}

        {/* ── Grupo ── */}
        {detalle.tipo==='GRUPAL' && (detalle.miembros||[]).length>0 && (
          <Sec titulo="Miembros del grupo" icono={<User size={15}/>}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:'12px'}}>
              <thead><tr style={{background:'#0d1f5c'}}>
                {['#','Nombre','CURP','Monto individual'].map(h=>(
                  <th key={h} style={{padding:'7px 10px',color:'#b8cde8',textAlign:'left',fontSize:'11px',fontWeight:'700'}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>{detalle.miembros.map((m,i)=>(
                <tr key={i} style={{background:i%2===0?'#fff':'#f8fbff',borderBottom:'1px solid #f0f4f8'}}>
                  <td style={{padding:'7px 10px',fontWeight:'700',color:'#0e50a0'}}>{i+1}</td>
                  <td style={{padding:'7px 10px',fontWeight:'600',textTransform:'uppercase'}}>{m.nombre}</td>
                  <td style={{padding:'7px 10px',fontFamily:'monospace',fontSize:'11px'}}>{m.curp||'—'}</td>
                  <td style={{padding:'7px 10px',fontWeight:'700'}}>{fmt(m.montoIndividual)}</td>
                </tr>
              ))}</tbody>
            </table>
          </Sec>
        )}

        {/* ── Avales ── */}
        <Sec titulo="Avales" icono={<User size={15}/>}>
          {(detalle.avales||[]).length===0
            ? <div style={{color:'#90aac8',fontSize:'13px'}}>Sin avales registrados</div>
            : detalle.avales.map((av,i)=>(
              <div key={i} style={{display:'flex',gap:'16px',flexWrap:'wrap',padding:'8px 0',borderBottom:'1px solid #f0f4f8',fontSize:'13px'}}>
                <span><b>Nombre:</b> {av.nombre||'—'}</span>
                <span><b>CURP:</b> {av.curp||'—'}</span>
                <span><b>Tel:</b> {av.telefono||'—'}</span>
              </div>
            ))
          }
        </Sec>

        {/* ── Características principales ── */}
        <Sec titulo="Características principales" icono={<FileText size={15}/>}>
          <div style={{display:'flex',gap:'10px',flexWrap:'wrap',alignItems:'center',marginBottom:'10px'}}>
            <FieldRO label="Tipo de crédito"    val={detalle.producto||'—'}/>
            <FieldRO label="Tipo de producto"   val={detalle.tipoCNBV||'—'}/>
          </div>
          <div style={{display:'flex',gap:'10px',flexWrap:'wrap',alignItems:'center',marginBottom:'10px'}}>
            <FieldRO label="Tipo (CNBV)"        val={detalle.tipoCNBV||'—'}/>
            <FieldRO label="Monto total"        val={fmt(detalle.monto)}/>
            <FieldRO label="IVA"               val={`${detalle.iva||0}`}/>
          </div>
          <div style={{display:'flex',gap:'10px',flexWrap:'wrap',alignItems:'center',marginBottom:'10px'}}>
            <FieldRO label="Forma de pago"      val={detalle.frecuencia||'—'}/>
            <FieldRO label="Plazo"             val={String(detalle.plazo||'—')}/>
            <FieldRO label="T.B. Interés normal" val={detalle.tbN||'FIJA'}/>
            <FieldRO label="Tipo tasa"         val={detalle.tipoTasa||'MENSUAL'}/>
            <FieldRO label="Tasa de interés"   val={`${detalle.tasaInteres||0}`}/>
          </div>
          <div style={{display:'flex',gap:'10px',flexWrap:'wrap',alignItems:'center'}}>
            <FieldRO label="T.B. Interés Moratorio" val={detalle.tbM||'FIJA'}/>
            <FieldRO label="Tipo tasa Moratorio"    val={detalle.tipoTasaM||'MENSUAL'}/>
            <FieldRO label="% tasa moratorio"       val={`${detalle.tasaMoratoria||0}`}/>
            <FieldRO label="Destino"               val={detalle.destino||'—'}/>
          </div>
        </Sec>

        {/* ── Información financiera ── */}
        <Sec titulo="Características principales" icono={<DollarSign size={15}/>}>
          <div style={{background:'#f0f4f8',borderRadius:'6px',padding:'5px 12px',marginBottom:'10px',fontSize:'11px',fontWeight:'700',color:'#0a2d5e',textTransform:'uppercase'}}>Ingresos</div>
          <div style={{display:'flex',gap:'12px',flexWrap:'wrap',marginBottom:'14px'}}>
            <FieldRO label="Ingreso mensual promedio"  val={fmt(detalle.ingresoMensual)}/>
            <FieldRO label="Otros Ingresos"            val={fmt(detalle.otrosIngresos)}/>
            <FieldRO label="Ingreso promedio total"    val={fmt((parseFloat(detalle.ingresoMensual)||0)+(parseFloat(detalle.otrosIngresos)||0))}/>
          </div>
          <div style={{background:'#f0f4f8',borderRadius:'6px',padding:'5px 12px',marginBottom:'10px',fontSize:'11px',fontWeight:'700',color:'#0a2d5e',textTransform:'uppercase'}}>Gasto promedio mensual</div>
          <div style={{display:'flex',gap:'10px',flexWrap:'wrap',marginBottom:'8px'}}>
            <FieldRO label="Alimento"   val={fmt(detalle.gastos?.alimento)}/>
            <FieldRO label="Luz"        val={fmt(detalle.gastos?.luz)}/>
            <FieldRO label="Telefono"   val={fmt(detalle.gastos?.telefono)}/>
            <FieldRO label="Transporte" val={fmt(detalle.gastos?.transporte)}/>
          </div>
          <div style={{display:'flex',gap:'10px',flexWrap:'wrap',marginBottom:'10px'}}>
            <FieldRO label="Renta"             val={fmt(detalle.gastos?.renta)}/>
            <FieldRO label="Inversión negocio" val={fmt(detalle.gastos?.inversion)}/>
            <FieldRO label="Créditos"          val={fmt(detalle.gastos?.creditos)}/>
            <FieldRO label="Otros"             val={fmt(detalle.gastos?.otros)}/>
          </div>
          <div style={{display:'flex',gap:'12px',flexWrap:'wrap'}}>
            <FieldRO label="Total gasto"           val={fmt(totalGastos)}/>
            <FieldRO label="Total Disponible mensual" val={fmt((parseFloat(detalle.ingresoMensual)||0)+(parseFloat(detalle.otrosIngresos)||0)-totalGastos)}/>
          </div>
        </Sec>

        {(detalle.tablaPagos||[]).length>0 && (
          <Sec titulo={`Tabla de pagos (${detalle.tablaPagos.length} periodos)`} icono={<FileText size={15}/>}>
            <div style={{overflowX:'auto',maxHeight:'220px',overflowY:'auto',borderRadius:'8px',border:'1px solid #dceaf8'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:'11.5px'}}>
                <thead style={{position:'sticky',top:0}}>
                  <tr style={{background:'#0d1f5c'}}>
                    {['#','Fecha','Cap. pend.','Abono cap.','Interés','IVA','Pago total','Saldo'].map(h=>(
                      <th key={h} style={{padding:'6px 8px',color:'#b8cde8',fontSize:'10px',fontWeight:'700',textAlign:'right',whiteSpace:'nowrap'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {detalle.tablaPagos.map((f,i)=>(
                    <tr key={i} style={{background:i%2===0?'#fff':'#f8fbff'}}>
                      <td style={{padding:'5px 8px',textAlign:'right',color:'#0e50a0',fontWeight:'700'}}>{f.periodo}</td>
                      <td style={{padding:'5px 8px',textAlign:'right',fontFamily:'monospace',fontSize:'10px'}}>{f.fecha}</td>
                      <td style={{padding:'5px 8px',textAlign:'right'}}>{fmt(f.capitalPendiente)}</td>
                      <td style={{padding:'5px 8px',textAlign:'right',color:'#166534',fontWeight:'600'}}>{fmt(f.abonoCapital)}</td>
                      <td style={{padding:'5px 8px',textAlign:'right',color:'#dc2626'}}>{fmt(f.interes)}</td>
                      <td style={{padding:'5px 8px',textAlign:'right'}}>{fmt(f.iva||0)}</td>
                      <td style={{padding:'5px 8px',textAlign:'right',fontWeight:'700'}}>{fmt(f.pagoTotal)}</td>
                      <td style={{padding:'5px 8px',textAlign:'right'}}>{fmt(f.saldoFinal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Sec>
        )}

        {detalle.motivoRechazo && (
          <div style={{background:'#fee2e2',borderRadius:'10px',padding:'14px',marginBottom:'16px',border:'1px solid #fca5a5'}}>
            <div style={{fontWeight:'700',color:'#dc2626',marginBottom:'4px'}}>Motivo de rechazo</div>
            <div style={{fontSize:'13px',color:'#991b1b'}}>{detalle.motivoRechazo}</div>
          </div>
        )}

        {/* Modal Aprobar */}
        {modalAprob && (
          <div style={{position:'fixed',inset:0,background:'rgba(5,15,40,0.75)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:2000,padding:'20px'}}>
            <div style={{background:'#fff',borderRadius:'16px',width:'100%',maxWidth:'420px',overflow:'hidden',boxShadow:'0 20px 60px rgba(0,0,0,0.4)'}}>
              <div style={{background:'#166634',padding:'14px 20px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <span style={{color:'#fff',fontWeight:'700',fontSize:'16px',fontFamily:"'Cormorant Garamond',serif"}}>Aprobar solicitud</span>
                <button onClick={()=>{setModalAprob(false);setFechaInicio('');}} style={{background:'none',border:'none',color:'#fff',cursor:'pointer'}}><X size={16}/></button>
              </div>
              <div style={{padding:'20px'}}>
                <div style={{background:'#f0fdf4',borderRadius:'10px',padding:'12px',marginBottom:'16px',border:'1px solid #86efac'}}>
                  <div style={{fontWeight:'700',color:'#166534',marginBottom:'4px'}}>{detalle.clienteNombre||detalle.nombreGrupo}</div>
                  <div style={{fontSize:'12px',color:'#555',display:'flex',gap:'14px'}}>
                    <span><b>Producto:</b> {detalle.producto}</span>
                    <span><b>Monto:</b> {fmt(detalle.monto)}</span>
                  </div>
                </div>
                <div style={{marginBottom:'16px'}}>
                  <label style={{fontSize:'11px',fontWeight:'700',color:'#90aac8',textTransform:'uppercase',letterSpacing:'0.06em',display:'block',marginBottom:'6px'}}>Fecha de inicio del crédito *</label>
                  <input type="date" value={fechaInicio} onChange={e=>setFechaInicio(e.target.value)} style={{...inp,width:'100%'}}/>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
                  <button onClick={aprobarSolicitud} disabled={accionando}
                    style={{background:'#22c55e',color:'#fff',border:'none',borderRadius:'10px',padding:'11px',fontSize:'13px',fontWeight:'700',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px'}}>
                    {accionando?<Loader size={13} style={{animation:'spin 1s linear infinite'}}/>:<CheckCircle size={13}/>} Confirmar
                  </button>
                  <button onClick={()=>{setModalAprob(false);setFechaInicio('');}}
                    style={{background:'#f1f5f9',color:'#475569',border:'none',borderRadius:'10px',padding:'11px',fontSize:'13px',fontWeight:'600',cursor:'pointer'}}>
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Rechazar */}
        {modalRechaz && (
          <div style={{position:'fixed',inset:0,background:'rgba(5,15,40,0.75)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:2000,padding:'20px'}}>
            <div style={{background:'#fff',borderRadius:'16px',width:'100%',maxWidth:'400px',overflow:'hidden',boxShadow:'0 20px 60px rgba(0,0,0,0.4)'}}>
              <div style={{background:'#dc2626',padding:'14px 20px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <span style={{color:'#fff',fontWeight:'700',fontSize:'16px',fontFamily:"'Cormorant Garamond',serif"}}>Rechazar solicitud</span>
                <button onClick={()=>{setModalRechaz(false);setMotivoRech('');}} style={{background:'none',border:'none',color:'#fff',cursor:'pointer'}}><X size={16}/></button>
              </div>
              <div style={{padding:'20px'}}>
                <div style={{marginBottom:'16px'}}>
                  <label style={{fontSize:'11px',fontWeight:'700',color:'#90aac8',textTransform:'uppercase',letterSpacing:'0.06em',display:'block',marginBottom:'6px'}}>Motivo del rechazo</label>
                  <textarea value={motivoRech} onChange={e=>setMotivoRech(e.target.value)} rows={3} placeholder="Describe el motivo..." style={{...inp,width:'100%',resize:'vertical'}}/>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
                  <button onClick={rechazarSolicitud} disabled={accionando}
                    style={{background:'#dc2626',color:'#fff',border:'none',borderRadius:'10px',padding:'11px',fontSize:'13px',fontWeight:'700',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px'}}>
                    {accionando?<Loader size={13} style={{animation:'spin 1s linear infinite'}}/>:<XCircle size={13}/>} Confirmar
                  </button>
                  <button onClick={()=>{setModalRechaz(false);setMotivoRech('');}}
                    style={{background:'#f1f5f9',color:'#475569',border:'none',borderRadius:'10px',padding:'11px',fontSize:'13px',fontWeight:'600',cursor:'pointer'}}>
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // ════════ VISTA LISTA ════════
  return (
    <div style={{maxWidth:'980px',margin:'0 auto',fontFamily:'DM Sans,sans-serif'}}>
      {notif && (
        <div style={{background:notif.tipo==='ok'?'#dcfce7':'#fee2e2',border:`1px solid ${notif.tipo==='ok'?'#86efac':'#fca5a5'}`,borderRadius:'12px',padding:'12px 18px',marginBottom:'16px',color:notif.tipo==='ok'?'#166534':'#dc2626',fontSize:'13px',fontWeight:'600',display:'flex',alignItems:'center',gap:'8px'}}>
          {notif.tipo==='ok'?<CheckCircle size={15}/>:<AlertCircle size={15}/>}{notif.msg}
        </div>
      )}

      {/* Botones filtro — igual al sistema original */}
      <div style={{display:'flex',gap:'8px',marginBottom:'20px',flexWrap:'wrap',alignItems:'center'}}>
        {[
          {key:'pendientes', label:'Ver pendientes', bg:'#0e50a0'},
          {key:'aprobadas',  label:'Ver aprobadas',  bg:'#166534'},
          {key:'rechazadas', label:'Ver rechazadas', bg:'#dc2626'},
        ].map(btn=>(
          <button key={btn.key} onClick={()=>setFiltroBtn(btn.key)}
            style={{background:filtroBtn===btn.key?btn.bg:'#fff',color:filtroBtn===btn.key?'#fff':btn.bg,border:`1.5px solid ${btn.bg}`,borderRadius:'9px',padding:'9px 18px',fontSize:'13px',fontWeight:'700',cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>
            {btn.label}
          </button>
        ))}
        <button onClick={cargar} style={{background:'#f4f8fd',border:'1px solid #dceaf8',borderRadius:'9px',padding:'9px 14px',cursor:'pointer',display:'flex',alignItems:'center',gap:'6px',fontSize:'13px',fontWeight:'600',color:'#0e50a0',marginLeft:'auto'}}>
          <RefreshCw size={13}/> Actualizar
        </button>
      </div>

      <div style={{background:'#fff',borderRadius:'16px',border:'1px solid #dceaf8',boxShadow:'0 2px 12px rgba(14,80,160,0.05)',overflow:'hidden'}}>
        {/* Header centrado — igual al sistema original */}
        <div style={{padding:'18px 24px 14px',borderBottom:'1px solid #f0f6ff',textAlign:'center'}}>
          <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'22px',fontWeight:'700',color:'#0a2d5e',margin:'0 0 2px'}}>Solicitudes de crédito</h2>
          <div style={{fontSize:'14px',fontWeight:'700',color:'#0e50a0',marginBottom:'2px'}}>{subtituloMap[filtroBtn]}</div>
          <div style={{fontSize:'12px',color:'#90aac8'}}>Dirección General tiene acceso a toda la información</div>
        </div>

        {/* Buscador */}
        <div style={{padding:'14px 24px',borderBottom:'1px solid #f0f6ff'}}>
          <div style={{position:'relative'}}>
            <Search size={14} style={{position:'absolute',left:'13px',top:'50%',transform:'translateY(-50%)',color:'#90aac8',pointerEvents:'none'}}/>
            <input value={busqueda} onChange={e=>setBusqueda(e.target.value)}
              placeholder="Buscar solicitud por nombre cliente, id solicitud, monto"
              style={{...inp,width:'100%',paddingLeft:'38px'}}/>
          </div>
        </div>

        {/* Tabla */}
        <div style={{overflowX:'auto'}}>
          {cargando ? (
            <div style={{padding:'50px',textAlign:'center',color:'#90aac8',display:'flex',alignItems:'center',justifyContent:'center',gap:'10px'}}>
              <Loader size={18} style={{animation:'spin 1s linear infinite'}}/> Cargando...
            </div>
          ) : (
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead>
                <tr style={{background:'#e8f2fc'}}>
                  {['Numero solicitud (ID)','Tipo solicitud','Nombre','Monto','Fecha creada','Captura Origen',''].map(h=>(
                    <th key={h} style={{padding:'10px 14px',textAlign:'left',fontSize:'12px',fontWeight:'700',color:'#0a2d5e',borderBottom:'2px solid #dceaf8',whiteSpace:'nowrap'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtradas.length===0 ? (
                  <tr><td colSpan={7} style={{padding:'50px',textAlign:'center',color:'#90aac8',fontSize:'13px'}}>
                    No hay solicitudes {filtroBtn}
                  </td></tr>
                ) : filtradas.map((s,i)=>(
                  <tr key={s._id} style={{borderBottom:'1px solid #f0f6ff',background:i%2===0?'#fff':'#fafcff'}}>
                    <td style={{padding:'11px 14px',fontSize:'13px',fontWeight:'700',color:'#0e50a0',fontFamily:'monospace'}}>{s._id?.slice(-8).toUpperCase()}</td>
                    <td style={{padding:'11px 14px',fontSize:'13px',color:'#444',textTransform:'uppercase'}}>{s.producto||'—'}</td>
                    <td style={{padding:'11px 14px',fontSize:'13px',fontWeight:'600',color:'#0a2d5e',textTransform:'uppercase'}}>
                      {s.tipo==='GRUPAL'?`👥 ${s.nombreGrupo||'Grupo'}`:(s.clienteNombre||'—')}
                    </td>
                    <td style={{padding:'11px 14px',fontSize:'13px',fontWeight:'700',color:'#0d1f5c'}}>{fmt(s.monto)}</td>
                    <td style={{padding:'11px 14px',fontSize:'12px',color:'#90aac8'}}>{fmtF(s.fecha||s.createdAt)}</td>
                    <td style={{padding:'11px 14px',fontSize:'12px',color:'#555'}}>SISTEMA</td>
                    <td style={{padding:'11px 14px'}}>
                      <button onClick={()=>{setDetalle(s);setVista('detalle');}}
                        style={{background:'#0e9cb5',color:'#fff',border:'none',borderRadius:'7px',padding:'7px 18px',cursor:'pointer',fontSize:'12px',fontWeight:'700',fontFamily:'DM Sans,sans-serif'}}>
                        Consultar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}