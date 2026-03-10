'use client';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Save, Trash2, Clock, MapPin, User } from 'lucide-react';

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const TIPOS = ['Visita a cliente', 'Cobranza', 'Reunion interna', 'Llamada programada', 'Tramite', 'Otro'];
const COLORES = {
  'Visita a cliente':   '#0e50a0',
  'Cobranza':           '#dc2626',
  'Reunion interna':    '#7c3aed',
  'Llamada programada': '#0891b2',
  'Tramite':            '#d97706',
  'Otro':               '#475569',
};

const INITIAL_FORM = { titulo: '', tipo: '', fecha: '', horaInicio: '', horaFin: '', lugar: '', responsable: '', notas: '' };

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

export default function Agenda() {
  const today = new Date();
  const [viewYear, setViewYear]   = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);
  const [eventos, setEventos]     = useState([]);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState(INITIAL_FORM);
  const [errors, setErrors]       = useState({});
  const [detalle, setDetalle]     = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  const change = (k, v) => { setForm(p => ({ ...p, [k]: v })); if (errors[k]) setErrors(p => ({ ...p, [k]: false })); };

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };

  const validate = () => {
    const req = ['titulo', 'tipo', 'fecha', 'horaInicio'];
    const errs = {};
    req.forEach(k => { if (!form[k]) errs[k] = true; });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    setEventos(p => [...p, { ...form, id: Date.now() }]);
    setShowForm(false);
    setForm(INITIAL_FORM);
    setErrors({});
  };

  const handleDelete = (id) => {
    setEventos(p => p.filter(e => e.id !== id));
    setConfirmDel(null);
    setDetalle(null);
  };

  const openAdd = (fecha = '') => {
    setForm({ ...INITIAL_FORM, fecha });
    setErrors({});
    setShowForm(true);
  };

  const daysInMonth  = getDaysInMonth(viewYear, viewMonth);
  const firstDay     = getFirstDayOfMonth(viewYear, viewMonth);
  const todayStr     = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  const eventosDelDia = (dayNum) => {
    const dateStr = `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(dayNum).padStart(2,'0')}`;
    return eventos.filter(e => e.fecha === dateStr);
  };

  const eventosSeleccionados = selectedDay
    ? eventos.filter(e => e.fecha === `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(selectedDay).padStart(2,'0')}`)
    : [];

  const inp = (err) => ({
    border: `1.5px solid ${err ? '#ef4444' : '#dceaf8'}`, borderRadius: '9px',
    padding: '10px 13px', fontSize: '13px', fontFamily: 'DM Sans, sans-serif',
    color: '#1a3d6e', outline: 'none', width: '100%', background: '#fafcff', boxSizing: 'border-box',
  });
  const lbl = (t, req) => (
    <label style={{ fontSize: '11px', fontWeight: '600', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' }}>
      {t}{req && <span style={{ color: '#ef4444', marginLeft: '3px' }}>*</span>}
    </label>
  );

  // Proximos eventos (todos, ordenados por fecha)
  const proximosEventos = [...eventos].sort((a, b) => a.fecha.localeCompare(b.fecha));

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>

      {/* ── Columna izquierda: Calendario ── */}
      <div style={{ flex: '0 0 520px' }}>
        <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #dceaf8', boxShadow: '0 2px 20px rgba(14,80,160,0.06)', overflow: 'hidden' }}>

          {/* Header mes */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0f6ff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button onClick={prevMonth} style={{ background: '#f4f8fd', border: 'none', borderRadius: '8px', width: '34px', height: '34px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4a6a94' }}>
              <ChevronLeft size={18} />
            </button>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: '700', color: '#0a2d5e' }}>{MESES[viewMonth]}</div>
              <div style={{ fontSize: '12px', color: '#90aac8', marginTop: '1px' }}>{viewYear}</div>
            </div>
            <button onClick={nextMonth} style={{ background: '#f4f8fd', border: 'none', borderRadius: '8px', width: '34px', height: '34px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4a6a94' }}>
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Dias semana */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '12px 16px 4px' }}>
            {DIAS_SEMANA.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: '11px', fontWeight: '700', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', padding: '6px 0' }}>{d}</div>
            ))}
          </div>

          {/* Grid dias */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 16px 20px', gap: '4px' }}>
            {/* Espacios vacíos al inicio */}
            {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day     = i + 1;
              const dateStr = `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
              const isToday = dateStr === todayStr;
              const isSel   = selectedDay === day;
              const evts    = eventosDelDia(day);

              return (
                <div key={day} onClick={() => setSelectedDay(isSel ? null : day)}
                  style={{
                    borderRadius: '10px', padding: '6px 4px', cursor: 'pointer', textAlign: 'center', minHeight: '52px',
                    background: isSel ? '#0e50a0' : isToday ? '#e8f2fc' : 'transparent',
                    border: isToday && !isSel ? '1.5px solid #0e50a0' : '1.5px solid transparent',
                    transition: 'all .15s',
                  }}>
                  <div style={{ fontSize: '13px', fontWeight: isSel || isToday ? '700' : '500', color: isSel ? '#fff' : isToday ? '#0e50a0' : '#1a3d6e', marginBottom: '4px' }}>{day}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2px' }}>
                    {evts.slice(0, 3).map(e => (
                      <div key={e.id} style={{ width: '7px', height: '7px', borderRadius: '50%', background: isSel ? '#fff' : (COLORES[e.tipo] || '#0e50a0') }} />
                    ))}
                    {evts.length > 3 && <div style={{ fontSize: '9px', color: isSel ? '#fff' : '#90aac8', fontWeight: '700' }}>+{evts.length - 3}</div>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Boton agregar */}
          <div style={{ padding: '0 16px 20px' }}>
            <button onClick={() => openAdd(selectedDay ? `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(selectedDay).padStart(2,'0')}` : '')}
              style={{ width: '100%', background: '#0e50a0', border: 'none', borderRadius: '10px', padding: '11px', fontSize: '13px', fontWeight: '600', color: '#fff', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', boxShadow: '0 4px 14px rgba(14,80,160,0.28)' }}>
              <Plus size={15} /> Nuevo evento
            </button>
          </div>
        </div>
      </div>

      {/* ── Columna derecha: Eventos ── */}
      <div style={{ flex: 1, minWidth: 0 }}>

        {/* Eventos del dia seleccionado */}
        {selectedDay && (
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #dceaf8', boxShadow: '0 2px 12px rgba(14,80,160,0.05)', marginBottom: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0f6ff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '16px', fontWeight: '700', color: '#0a2d5e' }}>
                {selectedDay} de {MESES[viewMonth]}
              </span>
              <span style={{ fontSize: '12px', color: '#90aac8' }}>{eventosSeleccionados.length} evento(s)</span>
            </div>
            <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {eventosSeleccionados.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#90aac8', fontSize: '13px' }}>Sin eventos este dia</div>
              ) : eventosSeleccionados.map(e => (
                <div key={e.id} onClick={() => setDetalle(e)}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '10px', border: '1px solid #f0f6ff', cursor: 'pointer', background: '#fafcff', transition: 'background .15s' }}>
                  <div style={{ width: '4px', height: '40px', borderRadius: '4px', background: COLORES[e.tipo] || '#0e50a0', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#0a2d5e', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.titulo}</div>
                    <div style={{ fontSize: '11px', color: '#90aac8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Clock size={10} />{e.horaInicio}{e.horaFin ? ` - ${e.horaFin}` : ''}</span>
                      {e.lugar && <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><MapPin size={10} />{e.lugar}</span>}
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '20px', background: `${COLORES[e.tipo]}18`, color: COLORES[e.tipo] || '#0e50a0', whiteSpace: 'nowrap' }}>{e.tipo}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Proximos eventos */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #dceaf8', boxShadow: '0 2px 12px rgba(14,80,160,0.05)', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0f6ff' }}>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '16px', fontWeight: '700', color: '#0a2d5e' }}>Todos los eventos</span>
          </div>
          <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '420px', overflowY: 'auto' }}>
            {proximosEventos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: '#90aac8', fontSize: '13px' }}>
                <Clock size={28} color="#dceaf8" style={{ display: 'block', margin: '0 auto 10px' }} />
                No hay eventos registrados
              </div>
            ) : proximosEventos.map(e => (
              <div key={e.id} onClick={() => setDetalle(e)}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '10px', border: '1px solid #f0f6ff', cursor: 'pointer', background: '#fafcff' }}>
                <div style={{ width: '4px', height: '40px', borderRadius: '4px', background: COLORES[e.tipo] || '#0e50a0', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '12px', color: '#90aac8', marginBottom: '2px' }}>{e.fecha}</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#0a2d5e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.titulo}</div>
                </div>
                <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '20px', background: `${COLORES[e.tipo]}18`, color: COLORES[e.tipo] || '#0e50a0', whiteSpace: 'nowrap' }}>{e.tipo}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Modal nuevo evento ── */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(10,45,94,0.45)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '540px', boxShadow: '0 32px 80px rgba(14,80,160,0.2)', overflow: 'hidden' }}>
            <div style={{ background: '#fff', borderBottom: '1px solid #dceaf8', padding: '22px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', fontWeight: '700', color: '#0a2d5e' }}>Nuevo evento</div>
              <button onClick={() => setShowForm(false)} style={{ background: '#f0f6ff', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#4a6a94' }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                {lbl('Titulo', true)}
                <input value={form.titulo} onChange={e => change('titulo', e.target.value)} placeholder="Titulo del evento" style={inp(errors.titulo)} />
                {errors.titulo && <span style={{ color: '#ef4444', fontSize: '11px' }}>Requerido</span>}
              </div>
              <div>
                {lbl('Tipo', true)}
                <select value={form.tipo} onChange={e => change('tipo', e.target.value)} style={{ ...inp(errors.tipo), cursor: 'pointer' }}>
                  <option value="">Seleccionar...</option>
                  {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.tipo && <span style={{ color: '#ef4444', fontSize: '11px' }}>Requerido</span>}
              </div>
              <div>
                {lbl('Fecha', true)}
                <input type="date" value={form.fecha} onChange={e => change('fecha', e.target.value)} style={inp(errors.fecha)} />
                {errors.fecha && <span style={{ color: '#ef4444', fontSize: '11px' }}>Requerido</span>}
              </div>
              <div>
                {lbl('Hora inicio', true)}
                <input type="time" value={form.horaInicio} onChange={e => change('horaInicio', e.target.value)} style={inp(errors.horaInicio)} />
                {errors.horaInicio && <span style={{ color: '#ef4444', fontSize: '11px' }}>Requerido</span>}
              </div>
              <div>
                {lbl('Hora fin')}
                <input type="time" value={form.horaFin} onChange={e => change('horaFin', e.target.value)} style={inp(false)} />
              </div>
              <div>
                {lbl('Lugar')}
                <input value={form.lugar} onChange={e => change('lugar', e.target.value)} placeholder="Lugar del evento" style={inp(false)} />
              </div>
              <div>
                {lbl('Responsable')}
                <input value={form.responsable} onChange={e => change('responsable', e.target.value)} placeholder="Nombre" style={inp(false)} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                {lbl('Notas')}
                <textarea value={form.notas} onChange={e => change('notas', e.target.value)} placeholder="Descripcion o notas adicionales..." rows={2} style={{ ...inp(false), resize: 'vertical' }} />
              </div>
            </div>
            <div style={{ padding: '0 28px 24px', display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: '11px', border: '1.5px solid #dceaf8', background: '#fff', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#4a6a94', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Cancelar</button>
              <button onClick={handleSave} style={{ flex: 2, padding: '11px', border: 'none', background: '#0e50a0', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#fff', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', boxShadow: '0 4px 14px rgba(14,80,160,0.28)' }}>
                <Save size={14} /> Guardar evento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal detalle evento ── */}
      {detalle && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(10,45,94,0.45)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '460px', boxShadow: '0 32px 80px rgba(14,80,160,0.2)', overflow: 'hidden' }}>
            <div style={{ background: '#fff', borderBottom: '1px solid #dceaf8', padding: '22px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '6px', height: '44px', borderRadius: '4px', background: COLORES[detalle.tipo] || '#0e50a0' }} />
                <div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', fontWeight: '700', color: '#0a2d5e' }}>{detalle.titulo}</div>
                  <div style={{ fontSize: '12px', color: '#90aac8', marginTop: '2px' }}>{detalle.tipo}</div>
                </div>
              </div>
              <button onClick={() => setDetalle(null)} style={{ background: '#f0f6ff', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#4a6a94' }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { icon: <Clock size={15} />, label: 'Fecha y hora', val: `${detalle.fecha}  ${detalle.horaInicio}${detalle.horaFin ? ` - ${detalle.horaFin}` : ''}` },
                { icon: <MapPin size={15} />, label: 'Lugar', val: detalle.lugar || '—' },
                { icon: <User size={15} />, label: 'Responsable', val: detalle.responsable || '—' },
              ].map(({ icon, label, val }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ width: '30px', height: '30px', background: '#e8f2fc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0e50a0', flexShrink: 0 }}>{icon}</div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#90aac8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#0a2d5e', marginTop: '2px' }}>{val}</div>
                  </div>
                </div>
              ))}
              {detalle.notas && (
                <div style={{ background: '#f4f8fd', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', color: '#4a6a94', lineHeight: '1.6' }}>{detalle.notas}</div>
              )}
            </div>
            <div style={{ padding: '0 28px 24px', display: 'flex', gap: '10px' }}>
              <button onClick={() => setConfirmDel(detalle)} style={{ background: '#fee2e2', border: 'none', borderRadius: '10px', padding: '11px 18px', fontSize: '13px', fontWeight: '600', color: '#dc2626', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Trash2 size={14} /> Eliminar
              </button>
              <button onClick={() => setDetalle(null)} style={{ flex: 1, padding: '11px', border: '1.5px solid #dceaf8', background: '#fff', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#4a6a94', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal confirmar eliminar ── */}
      {confirmDel && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(10,45,94,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '360px', boxShadow: '0 32px 80px rgba(14,80,160,0.2)', overflow: 'hidden' }}>
            <div style={{ padding: '28px 28px 20px', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', background: '#fee2e2', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Trash2 size={22} color="#dc2626" />
              </div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', fontWeight: '700', color: '#0a2d5e', marginBottom: '8px' }}>Eliminar evento</div>
              <div style={{ fontSize: '13px', color: '#90aac8' }}>¿Confirmas eliminar <strong style={{ color: '#0a2d5e' }}>{confirmDel.titulo}</strong>?</div>
            </div>
            <div style={{ padding: '0 28px 24px', display: 'flex', gap: '10px' }}>
              <button onClick={() => setConfirmDel(null)} style={{ flex: 1, padding: '11px', border: '1.5px solid #dceaf8', background: '#fff', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#4a6a94', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Cancelar</button>
              <button onClick={() => handleDelete(confirmDel.id)} style={{ flex: 1, padding: '11px', border: 'none', background: '#dc2626', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#fff', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}