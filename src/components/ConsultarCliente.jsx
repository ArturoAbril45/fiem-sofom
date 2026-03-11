'use client';
import { useState } from 'react';
import {
  Search, User, FileText, MapPin, Phone, Mail,
  Heart, Users, Camera, ChevronDown, ChevronUp,
  AlertCircle, Loader, X, CheckCircle, Edit2, Save, RotateCcw
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://fiem-backend-production.up.railway.app';

const fmt = (val) => val || '—';
const fmtMoney = (val) => val ? `$${Number(val).toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : '—';
const fmtFecha = (val) => {
  if (!val) return '—';
  try { return new Date(val).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' }); }
  catch { return val; }
};

// ── Pill de estatus ──
const Estatus = ({ v }) => {
  const colores = {
    'Activo':      { bg: '#dcfce7', color: '#166534' },
    'Lista negra': { bg: '#fee2e2', color: '#dc2626' },
    'Inactivo':    { bg: '#f3f4f6', color: '#6b7280' },
  };
  const c = colores[v] || colores['Inactivo'];
  return (
    <span style={{ background: c.bg, color: c.color, borderRadius: '999px', padding: '3px 12px', fontSize: '12px', fontWeight: '700' }}>
      {v || 'Sin estatus'}
    </span>
  );
};

// ── Fila de dato ──
const Fila = ({ label, value }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
    <span style={{ fontSize: '10px', fontWeight: '700', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</span>
    <span style={{ fontSize: '13px', color: '#1a3d6e', fontWeight: '500' }}>{value || '—'}</span>
  </div>
);

// ── Sección colapsable ──
function Seccion({ icon: Icon, titulo, iconBg = '#e8f2fc', iconColor = '#0e50a0', children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #dceaf8', boxShadow: '0 2px 12px rgba(14,80,160,0.05)', marginBottom: '16px', overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', padding: '16px 24px', borderBottom: open ? '1px solid #f0f6ff' : 'none', display: 'flex', alignItems: 'center', gap: '10px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
      >
        <div style={{ width: '32px', height: '32px', background: iconBg, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={16} color={iconColor} />
        </div>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', fontWeight: '700', color: '#0a2d5e', flex: 1 }}>{titulo}</span>
        {open ? <ChevronUp size={16} color="#90aac8" /> : <ChevronDown size={16} color="#90aac8" />}
      </button>
      {open && <div style={{ padding: '20px 24px' }}>{children}</div>}
    </div>
  );
}

// ── Grid de campos ──
const Grid = ({ children }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
    {children}
  </div>
);

export default function ConsultarCliente() {
  const [busqueda,  setBusqueda]  = useState('');
  const [clientes,  setClientes]  = useState([]);
  const [selected,  setSelected]  = useState(null);
  const [cargando,  setCargando]  = useState(false);
  const [error,     setError]     = useState('');
  const [editando,  setEditando]  = useState(false);
  const [formEdit,  setFormEdit]  = useState({});
  const [guardando, setGuardando] = useState(false);
  const [msgOk,     setMsgOk]     = useState('');

  const buscar = async () => {
    if (!busqueda.trim()) return;
    setCargando(true); setError(''); setClientes([]); setSelected(null);
    try {
      const res  = await fetch(`${API}/api/clientes?busqueda=${encodeURIComponent(busqueda)}&estatus=Activo`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al buscar');
      setClientes(data);
      if (data.length === 0) setError('No se encontraron clientes con esa búsqueda.');
    } catch (e) { setError(e.message); }
    finally { setCargando(false); }
  };

  const verDetalle = async (id) => {
    setCargando(true); setError(''); setSelected(null); setEditando(false);
    try {
      const res  = await fetch(`${API}/api/clientes/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al obtener cliente');
      setSelected(data);
    } catch (e) { setError(e.message); }
    finally { setCargando(false); }
  };

  const iniciarEdicion = () => {
    setFormEdit({ ...selected });
    setEditando(true);
  };

  const guardarEdicion = async () => {
    setGuardando(true);
    try {
      const res  = await fetch(`${API}/api/clientes/${selected._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formEdit),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar');
      setSelected(data);
      setEditando(false);
      setMsgOk('Cliente actualizado correctamente.');
      setTimeout(() => setMsgOk(''), 3000);
    } catch (e) { setError(e.message); }
    finally { setGuardando(false); }
  };

  const ec = (name, val) => setFormEdit(p => ({ ...p, [name]: val }));

  const inp = {
    border: '1.5px solid #dceaf8', borderRadius: '9px', padding: '9px 12px',
    fontSize: '13px', fontFamily: 'DM Sans, sans-serif', color: '#1a3d6e',
    outline: 'none', width: '100%', background: '#fafcff', boxSizing: 'border-box',
  };

  const ESTADOS_MX = ['Aguascalientes','Baja California','Baja California Sur','Campeche','Chiapas','Chihuahua','Ciudad de Mexico','Coahuila','Colima','Durango','Guanajuato','Guerrero','Hidalgo','Jalisco','Mexico','Michoacan','Morelos','Nayarit','Nuevo Leon','Oaxaca','Puebla','Queretaro','Quintana Roo','San Luis Potosi','Sinaloa','Sonora','Tabasco','Tamaulipas','Tlaxcala','Veracruz','Yucatan','Zacatecas'];

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto' }}>

      {/* Buscador */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #dceaf8', boxShadow: '0 2px 12px rgba(14,80,160,0.05)', padding: '20px 24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && buscar()}
            placeholder="Buscar por nombre, apellido o CURP..."
            style={{ ...inp, flex: 1 }}
          />
          <button onClick={buscar} disabled={cargando} style={{ background: '#0e50a0', border: 'none', borderRadius: '10px', padding: '10px 22px', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px', fontFamily: 'DM Sans, sans-serif' }}>
            {cargando ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Search size={14} />} Buscar
          </button>
        </div>
      </div>

      {/* Mensajes */}
      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '12px', padding: '13px 18px', marginBottom: '16px', color: '#dc2626', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={15} /> {error}
        </div>
      )}
      {msgOk && (
        <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: '12px', padding: '13px 18px', marginBottom: '16px', color: '#166534', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={15} /> {msgOk}
        </div>
      )}

      {/* Lista de resultados */}
      {clientes.length > 0 && !selected && (
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #dceaf8', boxShadow: '0 2px 12px rgba(14,80,160,0.05)', marginBottom: '20px', overflow: 'hidden' }}>
          <div style={{ padding: '14px 24px', borderBottom: '1px solid #f0f6ff' }}>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '16px', fontWeight: '700', color: '#0a2d5e' }}>
              {clientes.length} resultado{clientes.length !== 1 ? 's' : ''} encontrado{clientes.length !== 1 ? 's' : ''}
            </span>
          </div>
          {clientes.map((c, i) => (
            <div
              key={c._id}
              onClick={() => verDetalle(c._id)}
              style={{ padding: '14px 24px', borderBottom: i < clientes.length - 1 ? '1px solid #f0f6ff' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f4f9ff'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {/* Avatar con foto o inicial */}
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: '#e8f2fc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {c.fotos?.cliente
                  ? <img src={c.fotos.cliente} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', fontWeight: '700', color: '#0e50a0' }}>{c.nombre?.[0]?.toUpperCase()}</span>
                }
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#0a2d5e' }}>{c.nombre} {c.apellidoP} {c.apellidoM}</div>
                <div style={{ fontSize: '12px', color: '#90aac8', marginTop: '2px' }}>CURP: {c.curp || '—'} · {c.celular || c.telefono || '—'}</div>
              </div>
              <Estatus v={c.estatus} />
            </div>
          ))}
        </div>
      )}

      {/* Detalle del cliente */}
      {selected && (
        <div>
          {/* Header */}
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #dceaf8', boxShadow: '0 2px 12px rgba(14,80,160,0.05)', padding: '20px 24px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={() => { setSelected(null); setEditando(false); }} style={{ background: '#f0f6ff', border: 'none', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', fontWeight: '600', color: '#4a6a94', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <X size={13} /> Cerrar
            </button>
            {/* Foto principal */}
            <div style={{ width: '56px', height: '56px', borderRadius: '12px', overflow: 'hidden', background: '#e8f2fc', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {selected.fotos?.cliente
                ? <img src={selected.fotos.cliente} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontWeight: '700', color: '#0e50a0' }}>{selected.nombre?.[0]?.toUpperCase()}</span>
              }
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: '700', color: '#0a2d5e' }}>
                {selected.nombre} {selected.apellidoP} {selected.apellidoM}
              </div>
              <div style={{ fontSize: '12px', color: '#90aac8', marginTop: '3px' }}>CURP: {selected.curp || '—'}</div>
            </div>
            <Estatus v={selected.estatus} />
            {!editando
              ? <button onClick={iniciarEdicion} style={{ background: '#0e50a0', border: 'none', borderRadius: '10px', padding: '10px 18px', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px', fontFamily: 'DM Sans, sans-serif' }}>
                  <Edit2 size={13} /> Editar
                </button>
              : <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setEditando(false)} style={{ background: '#fff', border: '1.5px solid #dceaf8', borderRadius: '10px', padding: '10px 16px', color: '#4a6a94', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'DM Sans, sans-serif' }}>
                    <RotateCcw size={13} /> Cancelar
                  </button>
                  <button onClick={guardarEdicion} disabled={guardando} style={{ background: guardando ? '#90aac8' : '#0e50a0', border: 'none', borderRadius: '10px', padding: '10px 18px', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px', fontFamily: 'DM Sans, sans-serif' }}>
                    {guardando ? <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={13} />} Guardar
                  </button>
                </div>
            }
          </div>

          {/* ── DATOS PERSONALES ── */}
          <Seccion icon={User} titulo="Datos personales">
            {!editando ? (
              <Grid>
                <Fila label="Nombre(s)"         value={selected.nombre} />
                <Fila label="Apellido paterno"   value={selected.apellidoP} />
                <Fila label="Apellido materno"   value={selected.apellidoM} />
                <Fila label="Fecha de nacimiento" value={fmtFecha(selected.fechaNac)} />
                <Fila label="Género"             value={selected.sexo} />
                <Fila label="Estado civil"       value={selected.estadoCivil} />
              </Grid>
            ) : (
              <Grid>
                {[
                  { l: 'Nombre(s)', n: 'nombre' }, { l: 'Apellido paterno', n: 'apellidoP' }, { l: 'Apellido materno', n: 'apellidoM' },
                  { l: 'Fecha de nacimiento', n: 'fechaNac', t: 'date' },
                ].map(({ l, n, t }) => (
                  <div key={n}>
                    <label style={{ fontSize: '10px', fontWeight: '700', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '5px' }}>{l}</label>
                    <input type={t || 'text'} value={formEdit[n] || ''} onChange={e => ec(n, e.target.value)} style={inp} />
                  </div>
                ))}
                {[
                  { l: 'Género', n: 'sexo', opts: ['Masculino', 'Femenino'] },
                  { l: 'Estado civil', n: 'estadoCivil', opts: ['Soltero(a)', 'Casado(a)', 'Union libre', 'Divorciado(a)', 'Viudo(a)'] },
                  { l: 'Estatus', n: 'estatus', opts: ['Activo', 'Inactivo', 'Lista negra'] },
                ].map(({ l, n, opts }) => (
                  <div key={n}>
                    <label style={{ fontSize: '10px', fontWeight: '700', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '5px' }}>{l}</label>
                    <select value={formEdit[n] || ''} onChange={e => ec(n, e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                      <option value="">Seleccionar...</option>
                      {opts.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </Grid>
            )}
          </Seccion>

          {/* ── IDENTIFICACION ── */}
          <Seccion icon={FileText} titulo="Identificación">
            {!editando ? (
              <Grid>
                <Fila label="CURP"      value={selected.curp} />
                <Fila label="RFC"       value={selected.rfc} />
                <Fila label="No. INE/IFE" value={selected.ine} />
              </Grid>
            ) : (
              <Grid>
                {[{ l: 'CURP', n: 'curp' }, { l: 'RFC', n: 'rfc' }, { l: 'No. INE/IFE', n: 'ine' }].map(({ l, n }) => (
                  <div key={n}>
                    <label style={{ fontSize: '10px', fontWeight: '700', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '5px' }}>{l}</label>
                    <input value={formEdit[n] || ''} onChange={e => ec(n, e.target.value)} style={inp} />
                  </div>
                ))}
              </Grid>
            )}
          </Seccion>

          {/* ── CONTACTO ── */}
          <Seccion icon={Phone} titulo="Contacto">
            {!editando ? (
              <Grid>
                <Fila label="Teléfono fijo"      value={selected.telefono} />
                <Fila label="Celular"             value={selected.celular} />
                <Fila label="Correo electrónico"  value={selected.correo} />
              </Grid>
            ) : (
              <Grid>
                {[{ l: 'Teléfono fijo', n: 'telefono', t: 'tel' }, { l: 'Celular', n: 'celular', t: 'tel' }, { l: 'Correo', n: 'correo', t: 'email' }].map(({ l, n, t }) => (
                  <div key={n}>
                    <label style={{ fontSize: '10px', fontWeight: '700', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '5px' }}>{l}</label>
                    <input type={t} value={formEdit[n] || ''} onChange={e => ec(n, e.target.value)} style={inp} />
                  </div>
                ))}
              </Grid>
            )}
          </Seccion>

          {/* ── DOMICILIO ── */}
          <Seccion icon={MapPin} titulo="Domicilio">
            {!editando ? (
              <Grid>
                <Fila label="Calle"        value={selected.calle} />
                <Fila label="Colonia"      value={selected.colonia} />
                <Fila label="Municipio"    value={selected.municipio} />
                <Fila label="Estado"       value={selected.estado} />
                <Fila label="C.P."         value={selected.cp} />
              </Grid>
            ) : (
              <Grid>
                {[{ l: 'Calle', n: 'calle' }, { l: 'Colonia', n: 'colonia' }, { l: 'Municipio', n: 'municipio' }, { l: 'C.P.', n: 'cp' }].map(({ l, n }) => (
                  <div key={n}>
                    <label style={{ fontSize: '10px', fontWeight: '700', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '5px' }}>{l}</label>
                    <input value={formEdit[n] || ''} onChange={e => ec(n, e.target.value)} style={inp} />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: '10px', fontWeight: '700', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '5px' }}>Estado</label>
                  <select value={formEdit.estado || ''} onChange={e => ec('estado', e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                    <option value="">Seleccionar...</option>
                    {ESTADOS_MX.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </Grid>
            )}
          </Seccion>

          {/* ── INFORMACION ECONOMICA ── */}
          <Seccion icon={Mail} titulo="Información económica">
            {!editando ? (
              <Grid>
                <Fila label="Ocupación"        value={selected.ocupacion} />
                <Fila label="Ingreso mensual"  value={fmtMoney(selected.ingresoMensual)} />
              </Grid>
            ) : (
              <Grid>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: '700', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '5px' }}>Ocupación</label>
                  <input value={formEdit.ocupacion || ''} onChange={e => ec('ocupacion', e.target.value)} style={inp} />
                </div>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: '700', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '5px' }}>Ingreso mensual</label>
                  <input type="number" value={formEdit.ingresoMensual || ''} onChange={e => ec('ingresoMensual', e.target.value)} style={inp} />
                </div>
              </Grid>
            )}
          </Seccion>

          {/* ── CONYUGE ── */}
          {(selected.conyuge?.nombre || selected.estadoCivil === 'Casado(a)' || selected.estadoCivil === 'Union libre') && (
            <Seccion icon={Heart} titulo="Datos del cónyuge" iconBg="#fce8f0" iconColor="#be185d" defaultOpen={!!selected.conyuge?.nombre}>
              {!editando ? (
                <Grid>
                  <Fila label="Nombre(s)"      value={selected.conyuge?.nombre} />
                  <Fila label="Apellido paterno" value={selected.conyuge?.apellidoP} />
                  <Fila label="Apellido materno" value={selected.conyuge?.apellidoM} />
                  <Fila label="CURP"            value={selected.conyuge?.curp} />
                  <Fila label="Teléfono"        value={selected.conyuge?.telefono} />
                  <Fila label="Ocupación"       value={selected.conyuge?.ocupacion} />
                  <Fila label="Ingreso mensual" value={fmtMoney(selected.conyuge?.ingreso)} />
                </Grid>
              ) : (
                <Grid>
                  {[
                    { l: 'Nombre(s)', n: 'conyuge_nombre' }, { l: 'Apellido paterno', n: 'conyuge_apellidoP' },
                    { l: 'Apellido materno', n: 'conyuge_apellidoM' }, { l: 'CURP', n: 'conyuge_curp' },
                    { l: 'Teléfono', n: 'conyuge_telefono', t: 'tel' }, { l: 'Ocupación', n: 'conyuge_ocupacion' },
                    { l: 'Ingreso mensual', n: 'conyuge_ingreso', t: 'number' },
                  ].map(({ l, n, t }) => {
                    const key = n.replace('conyuge_', '');
                    return (
                      <div key={n}>
                        <label style={{ fontSize: '10px', fontWeight: '700', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '5px' }}>{l}</label>
                        <input type={t || 'text'} value={formEdit.conyuge?.[key] || ''} onChange={e => ec('conyuge', { ...formEdit.conyuge, [key]: e.target.value })} style={inp} />
                      </div>
                    );
                  })}
                </Grid>
              )}
            </Seccion>
          )}

          {/* ── FOTOGRAFIAS ── */}
          <Seccion icon={Camera} titulo="Fotografías">
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              {[
                { key: 'cliente', label: 'Foto del cliente' },
                { key: 'casa',    label: 'Foto de la casa' },
                { key: 'negocio', label: 'Foto del negocio' },
              ].map(({ key, label }) => (
                <div key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '140px', height: '140px', borderRadius: '12px', overflow: 'hidden', border: `2px solid ${selected.fotos?.[key] ? '#0e50a0' : '#dceaf8'}`, background: '#f4f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {selected.fotos?.[key]
                      ? <img src={selected.fotos[key]} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ textAlign: 'center', color: '#c0d4ea' }}>
                          <Camera size={28} />
                          <div style={{ fontSize: '11px', marginTop: '6px' }}>Sin foto</div>
                        </div>
                    }
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#4a6a94' }}>{label}</span>
                </div>
              ))}
            </div>
          </Seccion>

          {/* ── REFERENCIAS ── */}
          {selected.referencias?.length > 0 && (
            <Seccion icon={Users} titulo={`Referencias personales (${selected.referencias.length})`}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {selected.referencias.map((ref, i) => (
                  <div key={i}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#0e50a0', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #f0f6ff' }}>
                      Referencia {i + 1}
                    </div>
                    {!editando ? (
                      <Grid>
                        <Fila label="Nombre"     value={ref.nombre} />
                        <Fila label="Parentesco" value={ref.parentesco} />
                        <Fila label="Teléfono"   value={ref.telefono} />
                        <Fila label="Calle"      value={ref.calle} />
                        <Fila label="Colonia"    value={ref.colonia} />
                        <Fila label="Municipio"  value={ref.municipio} />
                      </Grid>
                    ) : (
                      <Grid>
                        {['nombre', 'parentesco', 'telefono', 'calle', 'colonia', 'municipio'].map(campo => (
                          <div key={campo}>
                            <label style={{ fontSize: '10px', fontWeight: '700', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '5px' }}>{campo.charAt(0).toUpperCase() + campo.slice(1)}</label>
                            <input
                              value={formEdit.referencias?.[i]?.[campo] || ''}
                              onChange={e => {
                                const refs = [...(formEdit.referencias || [])];
                                if (!refs[i]) refs[i] = {};
                                refs[i] = { ...refs[i], [campo]: e.target.value };
                                ec('referencias', refs);
                              }}
                              style={inp}
                            />
                          </div>
                        ))}
                      </Grid>
                    )}
                  </div>
                ))}
              </div>
            </Seccion>
          )}

          {/* ── FECHA DE REGISTRO ── */}
          <div style={{ textAlign: 'center', fontSize: '11px', color: '#b0c4d8', marginBottom: '32px', marginTop: '4px' }}>
            Registrado el {fmtFecha(selected.createdAt)}
            {selected.updatedAt && selected.updatedAt !== selected.createdAt && ` · Actualizado el ${fmtFecha(selected.updatedAt)}`}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}