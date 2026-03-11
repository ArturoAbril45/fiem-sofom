'use client';
import { useState, useRef } from 'react';
import {
  User, FileText, MapPin, Phone, Mail, Save, RotateCcw,
  CheckCircle, AlertCircle, Loader, Camera, Heart, Users, Upload, X
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://fiem-backend-production.up.railway.app';

const INITIAL = {
  nombre: '', apellidoPaterno: '', apellidoMaterno: '',
  fechaNacimiento: '', genero: '', estadoCivil: '',
  curp: '', rfc: '', ine: '',
  telefono: '', celular: '', correo: '',
  calle: '', numExt: '', numInt: '', colonia: '',
  municipio: '', estado: '', cp: '',
  ocupacion: '', ingresoMensual: '',
  // Cónyuge
  conyuge_nombre: '', conyuge_apellidoP: '', conyuge_apellidoM: '',
  conyuge_curp: '', conyuge_telefono: '', conyuge_ocupacion: '', conyuge_ingreso: '',
  // Referencias
  ref1_nombre: '', ref1_parentesco: '', ref1_telefono: '', ref1_calle: '', ref1_colonia: '', ref1_municipio: '',
  ref2_nombre: '', ref2_parentesco: '', ref2_telefono: '', ref2_calle: '', ref2_colonia: '', ref2_municipio: '',
  ref3_nombre: '', ref3_parentesco: '', ref3_telefono: '', ref3_calle: '', ref3_colonia: '', ref3_municipio: '',
};

const ESTADOS_MX = [
  'Aguascalientes','Baja California','Baja California Sur','Campeche','Chiapas','Chihuahua',
  'Ciudad de Mexico','Coahuila','Colima','Durango','Guanajuato','Guerrero','Hidalgo','Jalisco',
  'Mexico','Michoacan','Morelos','Nayarit','Nuevo Leon','Oaxaca','Puebla','Queretaro',
  'Quintana Roo','San Luis Potosi','Sinaloa','Sonora','Tabasco','Tamaulipas','Tlaxcala',
  'Veracruz','Yucatan','Zacatecas'
];

const REQUERIDOS = ['nombre', 'apellidoPaterno', 'fechaNacimiento', 'curp', 'celular'];

// Componente de subida de foto
function FotoUpload({ label, value, onChange }) {
  const ref = useRef();
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target.result);
    reader.readAsDataURL(file);
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <div
        onClick={() => ref.current.click()}
        style={{
          width: '120px', height: '120px', borderRadius: '12px',
          border: `2px dashed ${value ? '#0e50a0' : '#dceaf8'}`,
          background: value ? 'transparent' : '#f4f9ff',
          cursor: 'pointer', overflow: 'hidden', position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'border-color 0.2s',
        }}
      >
        {value ? (
          <img src={value} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ textAlign: 'center', color: '#90aac8' }}>
            <Camera size={28} />
            <div style={{ fontSize: '11px', marginTop: '6px', fontWeight: '600' }}>Subir foto</div>
          </div>
        )}
        {value && (
          <button
            onClick={(e) => { e.stopPropagation(); onChange(''); }}
            style={{
              position: 'absolute', top: '4px', right: '4px',
              background: 'rgba(0,0,0,0.55)', border: 'none', borderRadius: '50%',
              width: '22px', height: '22px', cursor: 'pointer', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={12} />
          </button>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
      <span style={{ fontSize: '11px', fontWeight: '600', color: '#4a6a94', textAlign: 'center' }}>{label}</span>
    </div>
  );
}

export default function AltaCliente() {
  const [form,    setForm]    = useState(INITIAL);
  const [fotos,   setFotos]   = useState({ cliente: '', casa: '', negocio: '' });
  const [errors,  setErrors]  = useState({});
  const [estado,  setEstado]  = useState(null);
  const [mensaje, setMensaje] = useState('');

  const change = (name, val) => {
    setForm(p => ({ ...p, [name]: val }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: false }));
  };

  const validate = () => {
    const errs = {};
    REQUERIDOS.forEach(k => { if (!form[k]) errs[k] = true; });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setEstado('loading');
    try {
      const payload = {
        nombre:      form.nombre,
        apellidoP:   form.apellidoPaterno,
        apellidoM:   form.apellidoMaterno,
        curp:        form.curp.toUpperCase(),
        rfc:         form.rfc.toUpperCase(),
        fechaNac:    form.fechaNacimiento,
        sexo:        form.genero,
        estadoCivil: form.estadoCivil,
        telefono:    form.telefono,
        celular:     form.celular,
        correo:      form.correo,
        calle:       form.calle,
        colonia:     form.colonia,
        municipio:   form.municipio,
        estado:      form.estado,
        cp:          form.cp,
        ocupacion:   form.ocupacion,
        ingresoMensual: form.ingresoMensual,
        estatus:     'Activo',
        conyuge: form.estadoCivil === 'Casado(a)' || form.estadoCivil === 'Union libre' ? {
          nombre:    form.conyuge_nombre,
          apellidoP: form.conyuge_apellidoP,
          apellidoM: form.conyuge_apellidoM,
          curp:      form.conyuge_curp,
          telefono:  form.conyuge_telefono,
          ocupacion: form.conyuge_ocupacion,
          ingreso:   form.conyuge_ingreso,
        } : null,
        referencias: [
          { nombre: form.ref1_nombre, parentesco: form.ref1_parentesco, telefono: form.ref1_telefono, calle: form.ref1_calle, colonia: form.ref1_colonia, municipio: form.ref1_municipio },
          { nombre: form.ref2_nombre, parentesco: form.ref2_parentesco, telefono: form.ref2_telefono, calle: form.ref2_calle, colonia: form.ref2_colonia, municipio: form.ref2_municipio },
          { nombre: form.ref3_nombre, parentesco: form.ref3_parentesco, telefono: form.ref3_telefono, calle: form.ref3_calle, colonia: form.ref3_colonia, municipio: form.ref3_municipio },
        ].filter(r => r.nombre),
        fotos: {
          cliente: fotos.cliente,
          casa:    fotos.casa,
          negocio: fotos.negocio,
        },
      };

      const res = await fetch(`${API}/api/clientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar');
      setEstado('ok');
      setMensaje(`Cliente ${form.nombre} ${form.apellidoPaterno} registrado correctamente.`);
      setTimeout(() => { setForm(INITIAL); setFotos({ cliente: '', casa: '', negocio: '' }); setEstado(null); setMensaje(''); }, 3500);
    } catch (e) {
      setEstado('error');
      setMensaje(e.message.includes('duplicate') ? 'Ya existe un cliente con ese CURP.' : e.message);
      setTimeout(() => setEstado(null), 4000);
    }
  };

  const handleReset = () => { setForm(INITIAL); setFotos({ cliente: '', casa: '', negocio: '' }); setErrors({}); setEstado(null); setMensaje(''); };

  const inp = (err) => ({
    border: `1.5px solid ${err ? '#ef4444' : '#dceaf8'}`,
    borderRadius: '9px', padding: '10px 13px', fontSize: '13px',
    fontFamily: 'DM Sans, sans-serif', color: '#1a3d6e', outline: 'none',
    width: '100%', background: '#fafcff', boxSizing: 'border-box',
  });

  const cardStyle = {
    background: '#fff', borderRadius: '16px', border: '1px solid #dceaf8',
    boxShadow: '0 2px 12px rgba(14,80,160,0.05)', marginBottom: '20px', overflow: 'visible',
  };

  const headerStyle = {
    padding: '16px 24px', borderBottom: '1px solid #f0f6ff',
    display: 'flex', alignItems: 'center', gap: '10px',
  };

  const bodyStyle = {
    padding: '22px 24px',
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px',
  };

  const renderCampo = (label, name, type, opts, required) => (
    <div key={name}>
      <label style={{ fontSize: '11px', fontWeight: '600', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' }}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      {type === 'select' ? (
        <select value={form[name]} onChange={e => change(name, e.target.value)} style={{ ...inp(errors[name]), cursor: 'pointer' }}>
          <option value="">Seleccionar...</option>
          {opts.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type || 'text'} value={form[name]} onChange={e => change(name, e.target.value)} placeholder={label} style={inp(errors[name])} />
      )}
      {errors[name] && <span style={{ color: '#ef4444', fontSize: '11px' }}>Campo requerido</span>}
    </div>
  );

  const mostrarConyuge = form.estadoCivil === 'Casado(a)' || form.estadoCivil === 'Union libre';

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }}>

      {/* Notificaciones */}
      {estado === 'ok' && (
        <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', color: '#166534', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle size={16} /> {mensaje}
        </div>
      )}
      {estado === 'error' && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', color: '#dc2626', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={16} /> {mensaje}
        </div>
      )}

      {/* DATOS PERSONALES */}
      <div style={cardStyle}>
        <div style={headerStyle}>
          <div style={{ width: '32px', height: '32px', background: '#e8f2fc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={16} color="#0e50a0" />
          </div>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', fontWeight: '700', color: '#0a2d5e' }}>Datos personales</span>
        </div>
        <div style={bodyStyle}>
          {renderCampo('Nombre(s)', 'nombre', 'text', null, true)}
          {renderCampo('Apellido paterno', 'apellidoPaterno', 'text', null, true)}
          {renderCampo('Apellido materno', 'apellidoMaterno', 'text', null, false)}
          {renderCampo('Fecha de nacimiento', 'fechaNacimiento', 'date', null, true)}
          {renderCampo('Genero', 'genero', 'select', ['Masculino', 'Femenino'], false)}
          {renderCampo('Estado civil', 'estadoCivil', 'select', ['Soltero(a)', 'Casado(a)', 'Union libre', 'Divorciado(a)', 'Viudo(a)'], false)}
        </div>
      </div>

      {/* IDENTIFICACION */}
      <div style={cardStyle}>
        <div style={headerStyle}>
          <div style={{ width: '32px', height: '32px', background: '#e8f2fc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={16} color="#0e50a0" />
          </div>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', fontWeight: '700', color: '#0a2d5e' }}>Identificacion</span>
        </div>
        <div style={bodyStyle}>
          {renderCampo('CURP', 'curp', 'text', null, true)}
          {renderCampo('RFC', 'rfc', 'text', null, false)}
          {renderCampo('No. INE/IFE', 'ine', 'text', null, false)}
        </div>
      </div>

      {/* CONTACTO */}
      <div style={cardStyle}>
        <div style={headerStyle}>
          <div style={{ width: '32px', height: '32px', background: '#e8f2fc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Phone size={16} color="#0e50a0" />
          </div>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', fontWeight: '700', color: '#0a2d5e' }}>Contacto</span>
        </div>
        <div style={bodyStyle}>
          {renderCampo('Telefono fijo', 'telefono', 'tel', null, false)}
          {renderCampo('Celular', 'celular', 'tel', null, true)}
          {renderCampo('Correo electronico', 'correo', 'email', null, false)}
        </div>
      </div>

      {/* DOMICILIO */}
      <div style={cardStyle}>
        <div style={headerStyle}>
          <div style={{ width: '32px', height: '32px', background: '#e8f2fc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MapPin size={16} color="#0e50a0" />
          </div>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', fontWeight: '700', color: '#0a2d5e' }}>Domicilio</span>
        </div>
        <div style={bodyStyle}>
          {renderCampo('Calle', 'calle', 'text')}
          {renderCampo('No. exterior', 'numExt', 'text')}
          {renderCampo('No. interior', 'numInt', 'text')}
          {renderCampo('Colonia', 'colonia', 'text')}
          {renderCampo('Municipio / Alcaldia', 'municipio', 'text')}
          {renderCampo('Estado', 'estado', 'select', ESTADOS_MX)}
          {renderCampo('Codigo postal', 'cp', 'text')}
        </div>
      </div>

      {/* INFORMACION ECONOMICA */}
      <div style={cardStyle}>
        <div style={headerStyle}>
          <div style={{ width: '32px', height: '32px', background: '#e8f2fc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Mail size={16} color="#0e50a0" />
          </div>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', fontWeight: '700', color: '#0a2d5e' }}>Informacion economica</span>
        </div>
        <div style={bodyStyle}>
          {renderCampo('Ocupacion', 'ocupacion', 'text')}
          {renderCampo('Ingreso mensual aproximado', 'ingresoMensual', 'number')}
        </div>
      </div>

      {/* DATOS DEL CONYUGE — solo si es casado o union libre */}
      {mostrarConyuge && (
        <div style={cardStyle}>
          <div style={headerStyle}>
            <div style={{ width: '32px', height: '32px', background: '#fce8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Heart size={16} color="#be185d" />
            </div>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', fontWeight: '700', color: '#0a2d5e' }}>Datos del conyuge</span>
          </div>
          <div style={bodyStyle}>
            {[
              { label: 'Nombre(s)',        name: 'conyuge_nombre',    type: 'text' },
              { label: 'Apellido paterno', name: 'conyuge_apellidoP', type: 'text' },
              { label: 'Apellido materno', name: 'conyuge_apellidoM', type: 'text' },
              { label: 'CURP',             name: 'conyuge_curp',      type: 'text' },
              { label: 'Telefono',         name: 'conyuge_telefono',  type: 'tel' },
              { label: 'Ocupacion',        name: 'conyuge_ocupacion', type: 'text' },
              { label: 'Ingreso mensual',  name: 'conyuge_ingreso',   type: 'number' },
            ].map(({ label, name, type }) => renderCampo(label, name, type))}
          </div>
        </div>
      )}

      {/* FOTOGRAFIAS */}
      <div style={cardStyle}>
        <div style={headerStyle}>
          <div style={{ width: '32px', height: '32px', background: '#e8f2fc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Camera size={16} color="#0e50a0" />
          </div>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', fontWeight: '700', color: '#0a2d5e' }}>Fotografias</span>
        </div>
        <div style={{ padding: '24px', display: 'flex', gap: '32px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <FotoUpload label="Foto del cliente"  value={fotos.cliente}  onChange={v => setFotos(p => ({ ...p, cliente: v }))} />
          <FotoUpload label="Foto de la casa"   value={fotos.casa}     onChange={v => setFotos(p => ({ ...p, casa: v }))} />
          <FotoUpload label="Foto del negocio"  value={fotos.negocio}  onChange={v => setFotos(p => ({ ...p, negocio: v }))} />
        </div>
        <div style={{ padding: '0 24px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Upload size={12} color="#90aac8" />
          <span style={{ fontSize: '11px', color: '#90aac8' }}>Formatos aceptados: JPG, PNG. Tamano maximo recomendado: 5 MB por imagen.</span>
        </div>
      </div>

      {/* REFERENCIAS */}
      <div style={cardStyle}>
        <div style={headerStyle}>
          <div style={{ width: '32px', height: '32px', background: '#e8f2fc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={16} color="#0e50a0" />
          </div>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', fontWeight: '700', color: '#0a2d5e' }}>Referencias personales</span>
          <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#90aac8', fontWeight: '600' }}>3 referencias</span>
        </div>
        <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {[1, 2, 3].map(n => (
            <div key={n}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#0e50a0', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px', paddingBottom: '8px', borderBottom: '1px solid #f0f6ff' }}>
                Referencia {n}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                {[
                  { label: 'Nombre completo', name: `ref${n}_nombre`,     type: 'text' },
                  { label: 'Parentesco',       name: `ref${n}_parentesco`, type: 'text' },
                  { label: 'Telefono',         name: `ref${n}_telefono`,   type: 'tel' },
                  { label: 'Calle',            name: `ref${n}_calle`,      type: 'text' },
                  { label: 'Colonia',          name: `ref${n}_colonia`,    type: 'text' },
                  { label: 'Municipio',        name: `ref${n}_municipio`,  type: 'text' },
                ].map(({ label, name, type }) => (
                  <div key={name}>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: '#90aac8', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' }}>
                      {label}
                    </label>
                    <input
                      type={type}
                      value={form[name]}
                      onChange={e => change(name, e.target.value)}
                      placeholder={label}
                      style={inp(false)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BOTONES */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '4px', marginBottom: '32px' }}>
        <button onClick={handleReset} style={{ background: '#fff', border: '1.5px solid #dceaf8', borderRadius: '10px', padding: '11px 24px', fontSize: '13px', fontWeight: '600', color: '#4a6a94', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '7px' }}>
          <RotateCcw size={14} /> Limpiar
        </button>
        <button onClick={handleSave} disabled={estado === 'loading'} style={{ background: estado === 'loading' ? '#90aac8' : '#0e50a0', border: 'none', borderRadius: '10px', padding: '11px 28px', fontSize: '13px', fontWeight: '600', color: '#fff', cursor: estado === 'loading' ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '7px', boxShadow: '0 4px 14px rgba(14,80,160,0.28)' }}>
          {estado === 'loading' ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Guardando...</> : <><Save size={14} /> Guardar cliente</>}
        </button>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}