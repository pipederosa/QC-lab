// src/lib/data.ts
// Datos de ejemplo tipados. En producción, reemplazar las funciones
// fetchStudies(), fetchScrumRecords() etc. con llamadas a la API real.

import type {
  AppUser, Study, ScrumRecord, AuditEntry, QuarterData,
} from '@/types'

// ============================================================
// UBICACIONES
// ============================================================
export const UBICACIONES: Record<string, string[]> = {
  'Planta 1': ['Cámara 1','Cámara 2','Cámara 3','Cámara 4','Cámara 5','Refrigerador A','Refrigerador B'],
  'Planta 2': ['Cámara 6','Cámara 7','Cámara 8','Refrigerador C','Refrigerador D','Zona controlada 1','Zona controlada 2'],
}

export const ALL_UBICACIONES = Object.values(UBICACIONES).flat()

// ============================================================
// QUARTERS
// ============================================================
export const QUARTERS_TODAS: QuarterData[] = [
  { q: 'Q1 2025', pct: 82 }, { q: 'Q2 2025', pct: 85 },
  { q: 'Q3 2025', pct: 79 }, { q: 'Q4 2025', pct: 88 }, { q: 'Q1 2026', pct: 87 },
]
export const QUARTERS_P1: QuarterData[] = [
  { q: 'Q1 2025', pct: 78 }, { q: 'Q2 2025', pct: 83 },
  { q: 'Q3 2025', pct: 75 }, { q: 'Q4 2025', pct: 90 }, { q: 'Q1 2026', pct: 85 },
]
export const QUARTERS_P2: QuarterData[] = [
  { q: 'Q1 2025', pct: 86 }, { q: 'Q2 2025', pct: 88 },
  { q: 'Q3 2025', pct: 83 }, { q: 'Q4 2025', pct: 86 }, { q: 'Q1 2026', pct: 89 },
]

// ============================================================
// USERS
// ============================================================
export const INITIAL_USERS: AppUser[] = [
  { id:1, nombre:'M. García',    usuario:'mgarcia',    email:'mgarcia@lab.com',    rol:'analyst',    planta:'todas',    estado:'activo',   lastLogin:'15/04/2026 09:12', initials:'MG' },
  { id:2, nombre:'S. López',     usuario:'slopez',     email:'slopez@lab.com',     rol:'analyst',    planta:'Planta 2', estado:'activo',   lastLogin:'15/04/2026 08:45', initials:'SL' },
  { id:3, nombre:'R. Pérez',     usuario:'rperez',     email:'rperez@lab.com',     rol:'supervisor', planta:'todas',    estado:'activo',   lastLogin:'14/04/2026 17:30', initials:'RP' },
  { id:4, nombre:'Admin Sistema',usuario:'admin',      email:'admin@lab.com',      rol:'admin',      planta:'todas',    estado:'activo',   lastLogin:'15/04/2026 07:00', initials:'AS' },
  { id:5, nombre:'J. Fernández', usuario:'jfernandez', email:'jfernandez@lab.com', rol:'viewer',     planta:'Planta 1', estado:'activo',   lastLogin:'13/04/2026 11:08', initials:'JF' },
  { id:6, nombre:'L. Martínez', usuario:'lmartinez',  email:'lmartinez@lab.com',  rol:'analyst',    planta:'Planta 1', estado:'inactivo', lastLogin:'01/03/2026 09:00', initials:'LM' },
]

// ============================================================
// STUDIES (Estabilidades)
// ============================================================
export const INITIAL_STUDIES: Study[] = [
  { id:1, cod:'PRD-00421', prod:'Amoxicilina 500mg', lote:'L240118', cond:'25°C / 60% HR', tiempo:'12 meses', ingreso:'15/01/2024', teorica:'15/01/2025', limite:'18/04/2026', estado:'En proceso', oos:true, oos_obs:'pH fuera de rango superior en T=6m.', planta:'Planta 1', ubic:'Cámara 3', div:'PH', analistFQ:'M. García', analistMicro:'T. Romero', micro:'Sí', aprob:'Pendiente', cumpl:'No', elab:'10/01/2024', camara:'15/01/2024', fqi:'15/01/2025', fqf:'20/01/2025', fqv:'22/01/2025', msi:'15/01/2025', msf:'17/01/2025', contenido:'97.2%', deg1:'0.18%', deg2:'0.09%', deg3:'ND', disol:'Q=85%', condsal:'', semana:'', status:'En revisión QA', limInf:'90.0%', limSup:'110.0%', corredor:'±5%', cumplEst:'No', salida:'', libteor:'', lib:'', motivo:'Estabilidad 12M', empaque:'Blíster PVC/PVDC', obs:'Pendiente OOS.' },
  { id:2, cod:'PRD-00318', prod:'Ibuprofeno 400mg', lote:'L240203', cond:'30°C / 75% HR', tiempo:'6 meses', ingreso:'03/02/2024', teorica:'03/08/2024', limite:'26/04/2026', estado:'En proceso', oos:false, oos_obs:'', planta:'Planta 2', ubic:'Refrigerador C', div:'CH', analistFQ:'S. López', analistMicro:'N/A', micro:'No', aprob:'Pendiente', cumpl:'Sí', elab:'01/02/2024', camara:'03/02/2024', fqi:'03/08/2024', fqf:'08/08/2024', fqv:'10/08/2024', msi:'N/A', msf:'N/A', contenido:'99.1%', deg1:'0.07%', deg2:'ND', deg3:'ND', disol:'Q=91%', condsal:'Conformes', semana:'S08-2026', status:'Aprobación pendiente', limInf:'95.0%', limSup:'105.0%', corredor:'±3%', cumplEst:'Sí', salida:'10/08/2024', libteor:'15/08/2024', lib:'', motivo:'Acelerado 6M', empaque:'Frasco HDPE', obs:'' },
  { id:3, cod:'PRD-00512', prod:'Metformina 850mg', lote:'L240115', cond:'40°C / 75% HR', tiempo:'3 meses', ingreso:'15/01/2024', teorica:'15/04/2024', limite:'02/05/2026', estado:'Pendiente', oos:false, oos_obs:'', planta:'Planta 1', ubic:'Cámara 5', div:'PH', analistFQ:'R. Pérez', analistMicro:'N/A', micro:'No', aprob:'Pendiente', cumpl:'', elab:'10/01/2024', camara:'15/01/2024', fqi:'', fqf:'', fqv:'', msi:'N/A', msf:'N/A', contenido:'', deg1:'', deg2:'', deg3:'', disol:'', condsal:'', semana:'', status:'Aguardando inicio', limInf:'90.0%', limSup:'110.0%', corredor:'±5%', cumplEst:'', salida:'', libteor:'', lib:'', motivo:'Acelerado 3M', empaque:'Blíster aluminio', obs:'' },
  { id:4, cod:'PRD-00189', prod:'Atorvastatina 10mg', lote:'L240220', cond:'25°C / 60% HR', tiempo:'18 meses', ingreso:'20/02/2024', teorica:'20/08/2025', limite:'08/05/2026', estado:'En proceso', oos:false, oos_obs:'', planta:'Planta 2', ubic:'Cámara 6', div:'CH', analistFQ:'M. García', analistMicro:'T. Romero', micro:'Sí', aprob:'Pendiente', cumpl:'Sí', elab:'18/02/2024', camara:'20/02/2024', fqi:'20/08/2025', fqf:'25/08/2025', fqv:'28/08/2025', msi:'20/08/2025', msf:'22/08/2025', contenido:'100.3%', deg1:'0.05%', deg2:'ND', deg3:'ND', disol:'Q=89%', condsal:'Conformes', semana:'', status:'En proceso', limInf:'92.0%', limSup:'108.0%', corredor:'±4%', cumplEst:'Sí', salida:'28/08/2025', libteor:'05/09/2025', lib:'', motivo:'Largo plazo 18M', empaque:'Blíster PVC/PE/PVDC', obs:'' },
  { id:5, cod:'PRD-00634', prod:'Losartán 50mg', lote:'L240198', cond:'30°C / 65% HR', tiempo:'24 meses', ingreso:'18/01/2024', teorica:'18/01/2026', limite:'11/05/2026', estado:'Pendiente', oos:false, oos_obs:'', planta:'Planta 1', ubic:'Refrigerador A', div:'PH', analistFQ:'S. López', analistMicro:'N/A', micro:'No', aprob:'Pendiente', cumpl:'', elab:'15/01/2024', camara:'18/01/2024', fqi:'', fqf:'', fqv:'', msi:'N/A', msf:'N/A', contenido:'', deg1:'', deg2:'', deg3:'', disol:'', condsal:'', semana:'', status:'Esperando T=24M', limInf:'90.0%', limSup:'110.0%', corredor:'±5%', cumplEst:'', salida:'', libteor:'', lib:'', motivo:'Largo plazo 24M', empaque:'Blíster aluminio', obs:'' },
  { id:6, cod:'PRD-00221', prod:'Omeprazol 20mg', lote:'L231198', cond:'25°C / 60% HR', tiempo:'24 meses', ingreso:'01/12/2023', teorica:'01/12/2025', limite:'15/03/2026', estado:'Completo', oos:false, oos_obs:'', planta:'Planta 1', ubic:'Cámara 3', div:'PH', analistFQ:'R. Pérez', analistMicro:'T. Romero', micro:'Sí', aprob:'Aprobado', cumpl:'Sí', elab:'28/11/2023', camara:'01/12/2023', fqi:'01/12/2025', fqf:'05/12/2025', fqv:'08/12/2025', msi:'01/12/2025', msf:'03/12/2025', contenido:'98.9%', deg1:'0.11%', deg2:'0.04%', deg3:'ND', disol:'Q=88%', condsal:'Conformes', semana:'S02-2026', status:'Liberado', limInf:'90.0%', limSup:'110.0%', corredor:'±5%', cumplEst:'Sí', salida:'08/12/2025', libteor:'10/12/2025', lib:'12/12/2025', motivo:'Largo plazo 24M', empaque:'Blíster Al/Al', obs:'Finalizado.' },
  { id:7, cod:'PRD-00409', prod:'Ciprofloxacino 500mg', lote:'L231045', cond:'30°C / 75% HR', tiempo:'12 meses', ingreso:'15/10/2023', teorica:'15/10/2024', limite:'20/01/2026', estado:'Completo', oos:false, oos_obs:'', planta:'Planta 2', ubic:'Cámara 7', div:'CH', analistFQ:'M. García', analistMicro:'N/A', micro:'No', aprob:'Aprobado', cumpl:'Sí', elab:'12/10/2023', camara:'15/10/2023', fqi:'15/10/2024', fqf:'18/10/2024', fqv:'21/10/2024', msi:'N/A', msf:'N/A', contenido:'101.1%', deg1:'0.06%', deg2:'ND', deg3:'ND', disol:'Q=92%', condsal:'Conformes', semana:'S45-2024', status:'Liberado', limInf:'95.0%', limSup:'105.0%', corredor:'±3%', cumplEst:'Sí', salida:'21/10/2024', libteor:'25/10/2024', lib:'28/10/2024', motivo:'Estabilidad 12M', empaque:'Frasco vidrio III', obs:'' },
  { id:8, cod:'PRD-00502', prod:'Paracetamol 500mg', lote:'L231201', cond:'40°C / 75% HR', tiempo:'6 meses', ingreso:'01/12/2023', teorica:'01/06/2024', limite:'10/02/2026', estado:'Cancelado', oos:false, oos_obs:'', planta:'Planta 1', ubic:'Cámara 4', div:'PH', analistFQ:'S. López', analistMicro:'N/A', micro:'No', aprob:'—', cumpl:'', elab:'28/11/2023', camara:'01/12/2023', fqi:'', fqf:'', fqv:'', msi:'N/A', msf:'N/A', contenido:'', deg1:'', deg2:'', deg3:'', disol:'', condsal:'', semana:'', status:'Cancelado', limInf:'', limSup:'', corredor:'', cumplEst:'', salida:'', libteor:'', lib:'', motivo:'Falla en cámara.', empaque:'Blíster PVC/Al', obs:'Cancelado por falla.' },
  { id:9, cod:'PRD-00311', prod:'Amlodipina 5mg', lote:'L240089', cond:'25°C / 60% HR', tiempo:'18 meses', ingreso:'10/01/2024', teorica:'10/07/2025', limite:'05/04/2026', estado:'En proceso', oos:true, oos_obs:'Disolución Q=72% vs Q≥80%.', planta:'Planta 2', ubic:'Cámara 7', div:'CH', analistFQ:'R. Pérez', analistMicro:'T. Romero', micro:'Sí', aprob:'Pendiente', cumpl:'No', elab:'05/01/2024', camara:'10/01/2024', fqi:'10/07/2025', fqf:'15/07/2025', fqv:'18/07/2025', msi:'10/07/2025', msf:'12/07/2025', contenido:'98.5%', deg1:'0.14%', deg2:'0.05%', deg3:'ND', disol:'Q=72%', condsal:'No conformes', semana:'', status:'Investigación OOS', limInf:'90.0%', limSup:'110.0%', corredor:'±5%', cumplEst:'No', salida:'', libteor:'', lib:'', motivo:'Largo plazo 18M', empaque:'Blíster PVC/PVDC', obs:'OOS en investigación.' },
  { id:10, cod:'PRD-00718', prod:'Warfarina 5mg', lote:'L240301', cond:'25°C / 60% HR', tiempo:'36 meses', ingreso:'01/03/2024', teorica:'01/03/2027', limite:'30/06/2027', estado:'En proceso', oos:false, oos_obs:'', planta:'Planta 2', ubic:'Zona controlada 1', div:'PH', analistFQ:'M. García', analistMicro:'T. Romero', micro:'Sí', aprob:'Pendiente', cumpl:'', elab:'28/02/2024', camara:'01/03/2024', fqi:'', fqf:'', fqv:'', msi:'', msf:'', contenido:'', deg1:'', deg2:'', deg3:'', disol:'', condsal:'', semana:'', status:'T=0 completado', limInf:'90.0%', limSup:'110.0%', corredor:'±5%', cumplEst:'', salida:'', libteor:'', lib:'', motivo:'Largo plazo 36M', empaque:'Blíster aluminio', obs:'' },
]

// ============================================================
// SCRUM RECORDS
// ============================================================
export const INITIAL_SCRUM: ScrumRecord[] = [
  { id:1, cod:'SCR-00101', planta:'Planta 1', desc:'Amoxicilina 500mg Tab', lote:'L260401', div:'PH', nInspeccion:'INS-2026-041', prioridad:'Sí', fechaLimPrioridad:'13/04/2026', identDeposito:'08/04/2026', limiteQC:'14/04/2026', ingresoFQ:'09/04/2026', spMicroConthLal:'10/04/2026', spMicroEsterilidad:'N/A', controlHigienico:'No', fechaFinEsterilidad:'N/A', fechaFinMicro:'12/04/2026', analistFQ:'M. García', fechaInicioAnalisis:'09/04/2026', fechaFinAnalisis:'', validacionFichaSAP:'', finalQCSAP:'', obs:'Prioridad urgente.', status:'En análisis', statusFinal:'Pendiente', liberadoATiempo:'Pendiente', granelCompControl:'Granel' },
  { id:2, cod:'SCR-00102', planta:'Planta 2', desc:'Ibuprofeno 400mg Tab', lote:'L260388', div:'CH', nInspeccion:'INS-2026-038', prioridad:'No', fechaLimPrioridad:'', identDeposito:'05/04/2026', limiteQC:'11/04/2026', ingresoFQ:'06/04/2026', spMicroConthLal:'07/04/2026', spMicroEsterilidad:'N/A', controlHigienico:'No', fechaFinEsterilidad:'N/A', fechaFinMicro:'10/04/2026', analistFQ:'S. López', fechaInicioAnalisis:'06/04/2026', fechaFinAnalisis:'11/04/2026', validacionFichaSAP:'12/04/2026', finalQCSAP:'', obs:'', status:'Análisis completo', statusFinal:'Pendiente', liberadoATiempo:'Cumplió', granelCompControl:'Completo' },
  { id:3, cod:'SCR-00103', planta:'Planta 1', desc:'Metformina 850mg Tab', lote:'L260375', div:'PH', nInspeccion:'INS-2026-035', prioridad:'No', fechaLimPrioridad:'', identDeposito:'01/04/2026', limiteQC:'07/04/2026', ingresoFQ:'02/04/2026', spMicroConthLal:'03/04/2026', spMicroEsterilidad:'N/A', controlHigienico:'Sí', fechaFinEsterilidad:'N/A', fechaFinMicro:'06/04/2026', analistFQ:'R. Pérez', fechaInicioAnalisis:'02/04/2026', fechaFinAnalisis:'07/04/2026', validacionFichaSAP:'08/04/2026', finalQCSAP:'09/04/2026', obs:'Sin obs.', status:'Liberado', statusFinal:'Terminado', liberadoATiempo:'Cumplió', granelCompControl:'Control Final' },
  { id:4, cod:'SCR-00104', planta:'Planta 2', desc:'Atorvastatina 10mg Tab', lote:'L260360', div:'CH', nInspeccion:'INS-2026-030', prioridad:'Sí', fechaLimPrioridad:'02/04/2026', identDeposito:'28/03/2026', limiteQC:'03/04/2026', ingresoFQ:'29/03/2026', spMicroConthLal:'30/03/2026', spMicroEsterilidad:'N/A', controlHigienico:'No', fechaFinEsterilidad:'N/A', fechaFinMicro:'02/04/2026', analistFQ:'M. García', fechaInicioAnalisis:'29/03/2026', fechaFinAnalisis:'04/04/2026', validacionFichaSAP:'05/04/2026', finalQCSAP:'06/04/2026', obs:'1 día de demora.', status:'Liberado', statusFinal:'Terminado', liberadoATiempo:'Overdue', granelCompControl:'Completo' },
  { id:5, cod:'SCR-00105', planta:'Planta 1', desc:'Losartán 50mg Tab', lote:'L260412', div:'PH', nInspeccion:'INS-2026-044', prioridad:'No', fechaLimPrioridad:'', identDeposito:'10/04/2026', limiteQC:'16/04/2026', ingresoFQ:'11/04/2026', spMicroConthLal:'12/04/2026', spMicroEsterilidad:'N/A', controlHigienico:'No', fechaFinEsterilidad:'N/A', fechaFinMicro:'', analistFQ:'S. López', fechaInicioAnalisis:'11/04/2026', fechaFinAnalisis:'', validacionFichaSAP:'', finalQCSAP:'', obs:'', status:'En análisis', statusFinal:'Pendiente', liberadoATiempo:'Pendiente', granelCompControl:'Granel' },
  { id:6, cod:'SCR-00106', planta:'Planta 1', desc:'Omeprazol 20mg Caps', lote:'L260398', div:'PH', nInspeccion:'INS-2026-040', prioridad:'Sí', fechaLimPrioridad:'12/04/2026', identDeposito:'07/04/2026', limiteQC:'13/04/2026', ingresoFQ:'08/04/2026', spMicroConthLal:'09/04/2026', spMicroEsterilidad:'N/A', controlHigienico:'No', fechaFinEsterilidad:'N/A', fechaFinMicro:'11/04/2026', analistFQ:'R. Pérez', fechaInicioAnalisis:'08/04/2026', fechaFinAnalisis:'', validacionFichaSAP:'', finalQCSAP:'', obs:'Pendiente micro.', status:'En análisis', statusFinal:'Pendiente', liberadoATiempo:'Pendiente', granelCompControl:'Completo' },
  { id:7, cod:'SCR-00107', planta:'Planta 2', desc:'Ciprofloxacino 500mg Tab', lote:'L260350', div:'CH', nInspeccion:'INS-2026-028', prioridad:'No', fechaLimPrioridad:'', identDeposito:'25/03/2026', limiteQC:'31/03/2026', ingresoFQ:'26/03/2026', spMicroConthLal:'27/03/2026', spMicroEsterilidad:'N/A', controlHigienico:'Sí', fechaFinEsterilidad:'N/A', fechaFinMicro:'30/03/2026', analistFQ:'M. García', fechaInicioAnalisis:'26/03/2026', fechaFinAnalisis:'31/03/2026', validacionFichaSAP:'01/04/2026', finalQCSAP:'02/04/2026', obs:'', status:'Liberado', statusFinal:'Terminado', liberadoATiempo:'Cumplió', granelCompControl:'Control Final' },
  { id:8, cod:'SCR-00108', planta:'Planta 2', desc:'Paracetamol 1g Iny', lote:'L260420', div:'INY', nInspeccion:'INS-2026-046', prioridad:'Sí', fechaLimPrioridad:'17/04/2026', identDeposito:'12/04/2026', limiteQC:'18/04/2026', ingresoFQ:'13/04/2026', spMicroConthLal:'14/04/2026', spMicroEsterilidad:'14/04/2026', controlHigienico:'No', fechaFinEsterilidad:'', fechaFinMicro:'', analistFQ:'S. López', fechaInicioAnalisis:'13/04/2026', fechaFinAnalisis:'', validacionFichaSAP:'', finalQCSAP:'', obs:'Inyectable.', status:'En análisis', statusFinal:'Pendiente', liberadoATiempo:'Pendiente', granelCompControl:'Granel' },
]

// ============================================================
// AUDIT LOG
// ============================================================
export const INITIAL_AUDIT: AuditEntry[] = [
  { who:'M. García',   what:'Cambió estado Amoxicilina 500mg (L240118): "Pendiente" → "En proceso"', when:'14/04/2026 09:12', field:'estado', old:'Pendiente', new:'En proceso', study:1, module:'est' },
  { who:'S. López',    what:'SCRUM: Lote L260388 (Ibuprofeno 400mg) registrado como "Cumplió"',       when:'12/04/2026 14:30', field:'liberadoATiempo', old:'Pendiente', new:'Cumplió', study:2, module:'scrum' },
  { who:'R. Pérez',    what:'Actualizó fecha FQ fin Omeprazol 20mg (L231198)',                        when:'13/04/2026 14:22', field:'fqf', old:'', new:'05/12/2025', study:6, module:'est' },
  { who:'Admin',       what:'Creó usuario J. Fernández · rol Viewer',                                when:'12/04/2026 11:08', field:'usuario', old:'', new:'J. Fernández', study:null, module:'sys' },
  { who:'M. García',   what:'Aprobó estudio Ciprofloxacino 500mg (L231045)',                         when:'11/04/2026 10:31', field:'aprob', old:'Pendiente', new:'Aprobado', study:7, module:'est' },
  { who:'M. García',   what:'SCRUM: Creó lote SCR-00101 (Amoxicilina 500mg, L260401)',                when:'08/04/2026 09:00', field:'creación', old:'', new:'SCR-00101', study:1, module:'scrum' },
  { who:'Admin',       what:'Exportó tabla a CSV (10 registros)',                                     when:'07/04/2026 16:00', field:'export', old:'', new:'CSV', study:null, module:'sys' },
]

// ============================================================
// API FUNCTIONS
// En producción reemplazar con fetch() a la API real.
// React Query llama estas funciones como queryFn.
// ============================================================

// Simulate async (useful when switching to real API)
const delay = (ms = 0) => new Promise(res => setTimeout(res, ms))

export async function fetchStudies(): Promise<Study[]> {
  await delay()
  return [...INITIAL_STUDIES]
}

export async function fetchScrumRecords(): Promise<ScrumRecord[]> {
  await delay()
  return [...INITIAL_SCRUM]
}

export async function fetchAuditLog(): Promise<AuditEntry[]> {
  await delay()
  return [...INITIAL_AUDIT]
}

export async function fetchUsers(): Promise<AppUser[]> {
  await delay()
  return [...INITIAL_USERS]
}
