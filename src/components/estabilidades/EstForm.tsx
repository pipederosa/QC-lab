'use client'
// src/components/estabilidades/EstForm.tsx

import React, { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { UBICACIONES } from '@/lib/data'
import { Button, FormSectionHead, RequiredStar } from '@/components/ui'
import { isoToDMY, nowStr } from '@/lib/utils'
import type { Study, EstadoEstudio, Division } from '@/types'

type FormData = Partial<Omit<Study, 'id'>>

export default function EstForm() {
  const { setPage, addStudy, addAuditEntry, currentUser } = useAppStore()

  const [form, setForm] = useState<FormData>({
    planta: undefined, ubic: '', div: undefined, cod: '', prod: '', lote: '',
    empaque: '', motivo: '', tiempo: '', cond: '',
    ingreso: '', teorica: '', limite: '',
    estado: 'Pendiente', oos: false, oos_obs: '', cumpl: '', aprob: 'Pendiente',
    analistFQ: '', micro: 'No', analistMicro: '',
    contenido: '', deg1: '', deg2: '', deg3: '', disol: '', obs: '',
  })

  const [tempVal, setTempVal]   = useState('')
  const [tempTipo, setTempTipo] = useState<'exacta' | 'rango'>('exacta')
  const [tempMin, setTempMin]   = useState('')
  const [tempMax, setTempMax]   = useState('')
  const [hrTipo, setHrTipo]     = useState<'exacta' | 'rango' | 'na'>('exacta')
  const [hrVal, setHrVal]       = useState('')
  const [hrMin, setHrMin]       = useState('')
  const [hrMax, setHrMax]       = useState('')
  const [errors, setErrors]     = useState<Record<string, string>>({})

  const set = (k: keyof FormData, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  const condPreview = (() => {
    const ts = tempTipo === 'exacta' ? (tempVal ? `${tempVal}°C` : '') : (tempMin || tempMax ? `${tempMin||'?'}–${tempMax||'?'}°C` : '')
    const hs = hrTipo === 'na' ? 'N/A' : hrTipo === 'exacta' ? (hrVal ? `${hrVal}% HR` : '') : (hrMin || hrMax ? `${hrMin||'?'}–${hrMax||'?'}% HR` : '')
    if (ts && hs) return `${ts} / ${hs}`
    return ts || hs || ''
  })()

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.planta) e.planta = 'Obligatorio'
    if (!form.cod?.trim()) e.cod = 'Obligatorio'
    if (!form.prod?.trim()) e.prod = 'Obligatorio'
    if (!form.lote?.trim()) e.lote = 'Obligatorio'
    if (!condPreview) e.cond = 'Complete al menos la temperatura'
    if (!form.ingreso) e.ingreso = 'Obligatorio'
    if (!form.teorica) e.teorica = 'Obligatorio'
    if (!form.limite) e.limite = 'Obligatorio'
    if (form.ingreso && form.teorica && form.teorica <= form.ingreso) e.teorica = 'Debe ser posterior a ingreso'
    if (form.teorica && form.limite && form.limite <= form.teorica) e.limite = 'Debe ser posterior a teórica'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = () => {
    if (!validate()) return
    const newStudy: Omit<Study, 'id'> = {
      cod: form.cod!, prod: form.prod!, lote: form.lote!,
      planta: form.planta as Study['planta'],
      ubic: form.ubic || '', div: form.div as Division || 'PH',
      cond: condPreview, tiempo: form.tiempo || '',
      ingreso: isoToDMY(form.ingreso || ''),
      teorica: isoToDMY(form.teorica || ''),
      limite:  isoToDMY(form.limite || ''),
      estado: (form.estado || 'Pendiente') as EstadoEstudio,
      oos: form.oos === true,
      oos_obs: form.oos_obs || '',
      cumpl: form.cumpl as Study['cumpl'] || '',
      aprob: form.aprob as Study['aprob'] || 'Pendiente',
      analistFQ: form.analistFQ || '', analistMicro: form.analistMicro || '',
      micro: form.micro as Study['micro'] || 'No',
      contenido: form.contenido||'', deg1: form.deg1||'', deg2: form.deg2||'',
      deg3: form.deg3||'', disol: form.disol||'', obs: form.obs||'',
      elab:'', camara:'', fqi:'', fqf:'', fqv:'', msi:'N/A', msf:'N/A',
      motivo: form.motivo||'', empaque: form.empaque||'', condsal:'',
      semana:'', status:'Pendiente', limInf:'', limSup:'', corredor:'',
      cumplEst:'', salida:'', libteor:'', lib:'',
    }
    addStudy(newStudy)
    addAuditEntry({
      who: currentUser.nombre,
      what: `Creó estudio: ${form.prod} (${form.lote}) · ${form.planta}`,
      when: nowStr(), field: 'creación', old: '', new: form.lote!, study: null, module: 'est',
    })
    setPage('results')
  }

  const Field = ({ label, id, required, error, children }: {
    label: string; id: string; required?: boolean; error?: string; children: React.ReactNode
  }) => (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-[11px] font-mono uppercase tracking-wider text-gray-400 flex items-center gap-0.5">
        {label}{required && <RequiredStar />}
      </label>
      {children}
      {error && <span className="text-[11px] text-danger">{error}</span>}
    </div>
  )

  const inputCls = (err?: string) => [
    'px-2.5 py-1.5 text-[13px] rounded border font-sans bg-surface text-gray-700 outline-none transition-all',
    err ? 'border-danger' : 'border-border-2 focus:border-accent focus:ring-1 focus:ring-accent/20',
  ].join(' ')

  return (
    <div className="max-w-3xl">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-[16px] font-medium mb-1">Nuevo estudio de estabilidad</h2>
          <p className="text-[12px] text-gray-400">Los campos marcados con <RequiredStar /> son obligatorios</p>
        </div>
        <Button onClick={() => setPage('results')}>Cancelar</Button>
      </div>

      <div className="bg-surface border border-border rounded-lg p-6">
        <div className="grid grid-cols-2 gap-3 gap-x-5">
          <FormSectionHead>Identificación y ubicación</FormSectionHead>

          <Field label="Planta" id="fp-planta" required error={errors.planta}>
            <select id="fp-planta" className={inputCls(errors.planta)} value={form.planta||''} onChange={e => { set('planta', e.target.value); set('ubic', '') }}>
              <option value="">Seleccionar...</option>
              <option>Planta 1</option><option>Planta 2</option>
            </select>
          </Field>
          <Field label="Ubicación física" id="fp-ubic" required>
            <select id="fp-ubic" className={inputCls()} value={form.ubic||''} onChange={e => set('ubic', e.target.value)}>
              <option value="">— seleccione planta primero —</option>
              {(UBICACIONES[form.planta as string] || []).map(u => <option key={u}>{u}</option>)}
            </select>
          </Field>
          <Field label="División" id="fp-div" required>
            <select id="fp-div" className={inputCls()} value={form.div||''} onChange={e => set('div', e.target.value)}>
              <option value="">Seleccionar...</option><option>CH</option><option>PH</option>
            </select>
          </Field>
          <Field label="Código de producto" id="fp-cod" required error={errors.cod}>
            <input id="fp-cod" className={inputCls(errors.cod)} value={form.cod||''} onChange={e => set('cod', e.target.value)} placeholder="Ej: PRD-00421" />
          </Field>
          <Field label="Producto" id="fp-prod" required error={errors.prod}>
            <input id="fp-prod" className={inputCls(errors.prod)} value={form.prod||''} onChange={e => set('prod', e.target.value)} placeholder="Nombre del producto" />
          </Field>
          <Field label="Lote" id="fp-lote" required error={errors.lote}>
            <input id="fp-lote" className={inputCls(errors.lote)} value={form.lote||''} onChange={e => set('lote', e.target.value)} placeholder="Ej: L240118" />
          </Field>
          <Field label="Material de empaque" id="fp-emp">
            <input id="fp-emp" className={inputCls()} value={form.empaque||''} onChange={e => set('empaque', e.target.value)} placeholder="Ej: Blíster PVC/PVDC" />
          </Field>
          <Field label="Motivo del ensayo" id="fp-motivo">
            <input id="fp-motivo" className={inputCls()} value={form.motivo||''} onChange={e => set('motivo', e.target.value)} />
          </Field>

          <FormSectionHead>Condiciones de almacenamiento</FormSectionHead>

          <div className="col-span-2 flex flex-col gap-1">
            <label className="text-[11px] font-mono uppercase tracking-wider text-gray-400 flex items-center gap-0.5">
              Condiciones <RequiredStar />
            </label>
            <div className="flex items-start gap-4 bg-surface-2 border border-border-2 rounded p-3 flex-wrap">
              {/* Temperatura */}
              <div className="flex flex-col gap-1.5">
                <div className="text-[10px] font-mono uppercase text-gray-400">Temperatura</div>
                <div className="flex items-center gap-2">
                  <select className={inputCls()} value={tempTipo} onChange={e => setTempTipo(e.target.value as 'exacta'|'rango')}>
                    <option value="exacta">Valor exacto</option><option value="rango">Rango</option>
                  </select>
                  {tempTipo === 'exacta'
                    ? <><input type="number" className={`${inputCls()} w-20`} value={tempVal} onChange={e => setTempVal(e.target.value)} placeholder="25" /><span className="text-[12px] text-gray-400 font-mono">°C</span></>
                    : <><input type="number" className={`${inputCls()} w-16`} value={tempMin} onChange={e => setTempMin(e.target.value)} placeholder="Mín" /><span className="text-gray-300">–</span><input type="number" className={`${inputCls()} w-16`} value={tempMax} onChange={e => setTempMax(e.target.value)} placeholder="Máx" /><span className="text-[12px] text-gray-400 font-mono">°C</span></>
                  }
                </div>
              </div>
              <div className="text-[22px] text-gray-300 mt-6">/</div>
              {/* Humedad */}
              <div className="flex flex-col gap-1.5">
                <div className="text-[10px] font-mono uppercase text-gray-400">Humedad relativa</div>
                <div className="flex items-center gap-2">
                  <select className={inputCls()} value={hrTipo} onChange={e => setHrTipo(e.target.value as 'exacta'|'rango'|'na')}>
                    <option value="exacta">Valor exacto</option><option value="rango">Rango</option><option value="na">N/A</option>
                  </select>
                  {hrTipo === 'exacta' && <><input type="number" className={`${inputCls()} w-20`} value={hrVal} onChange={e => setHrVal(e.target.value)} placeholder="60" /><span className="text-[12px] text-gray-400 font-mono">% HR</span></>}
                  {hrTipo === 'rango' && <><input type="number" className={`${inputCls()} w-16`} value={hrMin} onChange={e => setHrMin(e.target.value)} placeholder="Mín" /><span className="text-gray-300">–</span><input type="number" className={`${inputCls()} w-16`} value={hrMax} onChange={e => setHrMax(e.target.value)} placeholder="Máx" /><span className="text-[12px] text-gray-400 font-mono">% HR</span></>}
                </div>
              </div>
              {/* Preview */}
              <div className="flex items-center gap-2 mt-auto ml-auto">
                <span className="text-[10px] font-mono text-gray-400 uppercase">Vista previa:</span>
                <span className={['text-[13px] font-medium font-mono px-2.5 py-1 rounded border min-w-[120px] text-center',
                  condPreview ? 'bg-accent-light border-accent text-accent-text' : 'bg-surface-2 border-border-2 text-gray-400'].join(' ')}>
                  {condPreview || '—'}
                </span>
              </div>
            </div>
            {errors.cond && <span className="text-[11px] text-danger">{errors.cond}</span>}
          </div>

          <Field label="Tiempo de estabilidad" id="fp-tiempo" required>
            <select id="fp-tiempo" className={inputCls()} value={form.tiempo||''} onChange={e => set('tiempo', e.target.value)}>
              <option value="">Seleccionar...</option>
              {['3 meses','6 meses','9 meses','12 meses','18 meses','24 meses','36 meses'].map(t => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Fecha de ingreso" id="fp-ingreso" required error={errors.ingreso}>
            <input type="date" id="fp-ingreso" className={inputCls(errors.ingreso)} value={form.ingreso||''} onChange={e => set('ingreso', e.target.value)} />
          </Field>
          <Field label="Fecha teórica" id="fp-teorica" required error={errors.teorica}>
            <input type="date" id="fp-teorica" className={inputCls(errors.teorica)} value={form.teorica||''} onChange={e => set('teorica', e.target.value)} />
          </Field>
          <Field label="Fecha límite" id="fp-limite" required error={errors.limite}>
            <input type="date" id="fp-limite" className={inputCls(errors.limite)} value={form.limite||''} onChange={e => set('limite', e.target.value)} />
          </Field>

          <FormSectionHead>Estado y OOS</FormSectionHead>
          <Field label="Estado" id="fp-estado" required>
            <select id="fp-estado" className={inputCls()} value={form.estado||'Pendiente'} onChange={e => set('estado', e.target.value)}>
              {['Pendiente','En proceso','Completo','Cancelado'].map(e => <option key={e}>{e}</option>)}
            </select>
          </Field>
          <Field label="OOS" id="fp-oos">
            <select id="fp-oos" className={inputCls()} value={form.oos ? 'Sí' : 'No'} onChange={e => set('oos', e.target.value === 'Sí')}>
              <option>No</option><option>Sí</option>
            </select>
          </Field>
          {form.oos && (
            <div className="col-span-2 flex flex-col gap-1">
              <label className="text-[11px] font-mono uppercase tracking-wider text-danger flex items-center gap-0.5">Observaciones OOS <RequiredStar /></label>
              <textarea className={`${inputCls()} min-h-[60px] resize-y`} value={form.oos_obs||''} onChange={e => set('oos_obs', e.target.value)} />
            </div>
          )}

          <FormSectionHead>Resultados de análisis</FormSectionHead>
          <Field label="Contenido" id="fp-cont"><input id="fp-cont" className={inputCls()} value={form.contenido||''} onChange={e => set('contenido', e.target.value)} placeholder="98.5%" /></Field>
          <Field label="Degradación 1" id="fp-d1"><input id="fp-d1" className={inputCls()} value={form.deg1||''} onChange={e => set('deg1', e.target.value)} placeholder="0.12%" /></Field>
          <Field label="Degradación 2" id="fp-d2"><input id="fp-d2" className={inputCls()} value={form.deg2||''} onChange={e => set('deg2', e.target.value)} placeholder="0.08%" /></Field>
          <Field label="Degradación 3" id="fp-d3"><input id="fp-d3" className={inputCls()} value={form.deg3||''} onChange={e => set('deg3', e.target.value)} placeholder="ND" /></Field>
          <Field label="Disolución" id="fp-dis"><input id="fp-dis" className={inputCls()} value={form.disol||''} onChange={e => set('disol', e.target.value)} placeholder="Q=87%" /></Field>
          <div className="col-span-2 flex flex-col gap-1">
            <label className="text-[11px] font-mono uppercase tracking-wider text-gray-400">Observaciones</label>
            <textarea className={`${inputCls()} min-h-[60px] resize-y`} value={form.obs||''} onChange={e => set('obs', e.target.value)} />
          </div>
        </div>

        <div className="flex justify-end gap-2.5 mt-5 pt-4 border-t border-border">
          <Button onClick={() => setPage('results')}>Cancelar</Button>
          <Button variant="primary" onClick={submit}>Guardar estudio</Button>
        </div>
      </div>
    </div>
  )
}
