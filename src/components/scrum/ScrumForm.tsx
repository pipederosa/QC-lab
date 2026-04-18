'use client'
// src/components/scrum/ScrumForm.tsx

import React, { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { Button, FormSectionHead, RequiredStar } from '@/components/ui'
import { isoToDMY, nowStr } from '@/lib/utils'
import type { ScrumRecord, DivisionScrum } from '@/types'

type FormData = Partial<Omit<ScrumRecord, 'id'>>

export default function ScrumForm() {
  const { setPage, addScrumRecord, addAuditEntry, currentUser } = useAppStore()

  const [form, setForm] = useState<FormData>({
    cod: '', planta: undefined, desc: '', lote: '', div: undefined,
    nInspeccion: '', prioridad: 'No', fechaLimPrioridad: '',
    identDeposito: '', limiteQC: '', ingresoFQ: '',
    spMicroConthLal: '', spMicroEsterilidad: '',
    controlHigienico: 'No', fechaFinEsterilidad: '', fechaFinMicro: '',
    analistFQ: '', fechaInicioAnalisis: '', fechaFinAnalisis: '',
    validacionFichaSAP: '', finalQCSAP: '',
    obs: '', status: 'En análisis', statusFinal: 'Pendiente',
    liberadoATiempo: 'Pendiente', granelCompControl: 'Granel',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const set = (k: keyof FormData, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.cod?.trim())          e.cod    = 'Obligatorio'
    if (!form.planta)               e.planta = 'Obligatorio'
    if (!form.desc?.trim())         e.desc   = 'Obligatorio'
    if (!form.lote?.trim())         e.lote   = 'Obligatorio'
    if (!form.div)                  e.div    = 'Obligatorio'
    if (!form.identDeposito)        e.identDeposito = 'Obligatorio'
    if (!form.limiteQC)             e.limiteQC      = 'Obligatorio'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = () => {
    if (!validate()) return
    const nr: Omit<ScrumRecord, 'id'> = {
      cod:              form.cod!.trim(),
      planta:           form.planta as ScrumRecord['planta'],
      desc:             form.desc!.trim(),
      lote:             form.lote!.trim(),
      div:              form.div as DivisionScrum,
      nInspeccion:      form.nInspeccion || '',
      prioridad:        form.prioridad || 'No',
      fechaLimPrioridad: form.prioridad === 'Sí' ? isoToDMY(form.fechaLimPrioridad || '') : '',
      identDeposito:    isoToDMY(form.identDeposito || ''),
      limiteQC:         isoToDMY(form.limiteQC || ''),
      ingresoFQ:        isoToDMY(form.ingresoFQ || ''),
      spMicroConthLal:  isoToDMY(form.spMicroConthLal || '') || 'N/A',
      spMicroEsterilidad: isoToDMY(form.spMicroEsterilidad || '') || 'N/A',
      controlHigienico: form.controlHigienico || 'No',
      fechaFinEsterilidad: '',
      fechaFinMicro:    '',
      analistFQ:        form.analistFQ || '',
      fechaInicioAnalisis: isoToDMY(form.fechaInicioAnalisis || ''),
      fechaFinAnalisis: '',
      validacionFichaSAP: '',
      finalQCSAP:       '',
      obs:              form.obs || '',
      status:           'En análisis',
      statusFinal:      'Pendiente',
      liberadoATiempo:  'Pendiente',
      granelCompControl: form.granelCompControl as ScrumRecord['granelCompControl'] || 'Granel',
    }
    addScrumRecord(nr)
    addAuditEntry({
      who: currentUser.nombre,
      what: `SCRUM: Creó lote ${nr.cod} (${nr.desc}, ${nr.lote}) · ${nr.planta}`,
      when: nowStr(), field: 'creación', old: '', new: nr.cod, study: null, module: 'scrum',
    })
    setPage('results')
  }

  const inputCls = (err?: string) => [
    'px-2.5 py-1.5 text-[13px] rounded border font-sans bg-surface text-gray-700 outline-none transition-all w-full',
    err ? 'border-danger' : 'border-border-2 focus:border-accent focus:ring-1 focus:ring-accent/20',
  ].join(' ')

  const Field = ({ label, id, req, err, children }: {
    label: string; id: string; req?: boolean; err?: string; children: React.ReactNode
  }) => (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-[11px] font-mono uppercase tracking-wider text-gray-400 flex items-center gap-0.5">
        {label}{req && <RequiredStar />}
      </label>
      {children}
      {err && <span className="text-[11px] text-danger">{err}</span>}
    </div>
  )

  return (
    <div className="max-w-3xl">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-[16px] font-medium mb-1">Nuevo lote SCRUM</h2>
          <p className="text-[12px] text-gray-400">Los campos marcados con <RequiredStar /> son obligatorios</p>
        </div>
        <Button onClick={() => setPage('results')}>Cancelar</Button>
      </div>

      <div className="bg-surface border border-border rounded-lg p-6">
        <div className="grid grid-cols-2 gap-3 gap-x-5">

          <FormSectionHead>Identificación</FormSectionHead>

          <Field label="Código" id="sf-cod" req err={errors.cod}>
            <input id="sf-cod" className={inputCls(errors.cod)} value={form.cod || ''} onChange={e => set('cod', e.target.value)} placeholder="Ej: SCR-00111" />
          </Field>
          <Field label="Planta" id="sf-planta" req err={errors.planta}>
            <select id="sf-planta" className={inputCls(errors.planta)} value={form.planta || ''} onChange={e => set('planta', e.target.value)}>
              <option value="">Seleccionar...</option>
              <option>Planta 1</option>
              <option>Planta 2</option>
            </select>
          </Field>
          <Field label="Descripción" id="sf-desc" req err={errors.desc}>
            <input id="sf-desc" className={inputCls(errors.desc)} value={form.desc || ''} onChange={e => set('desc', e.target.value)} placeholder="Ej: Amoxicilina 500mg Tab" />
          </Field>
          <Field label="Lote" id="sf-lote" req err={errors.lote}>
            <input id="sf-lote" className={inputCls(errors.lote)} value={form.lote || ''} onChange={e => set('lote', e.target.value)} placeholder="Ej: L260501" />
          </Field>
          <Field label="División" id="sf-div" req err={errors.div}>
            <select id="sf-div" className={inputCls(errors.div)} value={form.div || ''} onChange={e => set('div', e.target.value)}>
              <option value="">Seleccionar...</option>
              <option>PH</option><option>CH</option><option>INY</option>
            </select>
          </Field>
          <Field label="Tipo" id="sf-tipo">
            <select id="sf-tipo" className={inputCls()} value={form.granelCompControl || 'Granel'} onChange={e => set('granelCompControl', e.target.value)}>
              <option>Granel</option><option>Completo</option><option>Control Final</option>
            </select>
          </Field>
          <Field label="N° Inspección" id="sf-ninsp">
            <input id="sf-ninsp" className={inputCls()} value={form.nInspeccion || ''} onChange={e => set('nInspeccion', e.target.value)} placeholder="Ej: INS-2026-050" />
          </Field>
          <Field label="Prioridad" id="sf-prior">
            <select id="sf-prior" className={inputCls()} value={form.prioridad || 'No'} onChange={e => set('prioridad', e.target.value)}>
              <option>No</option><option>Sí</option>
            </select>
          </Field>
          {form.prioridad === 'Sí' && (
            <Field label="F. límite prioridad" id="sf-prior-fecha">
              <input type="date" id="sf-prior-fecha" className={inputCls()} value={form.fechaLimPrioridad || ''} onChange={e => set('fechaLimPrioridad', e.target.value)} />
            </Field>
          )}

          <FormSectionHead>Fechas clave</FormSectionHead>

          <Field label="Ident. por depósito" id="sf-ident" req err={errors.identDeposito}>
            <input type="date" id="sf-ident" className={inputCls(errors.identDeposito)} value={form.identDeposito || ''} onChange={e => set('identDeposito', e.target.value)} />
          </Field>
          <Field label="Límite QC time" id="sf-limqc" req err={errors.limiteQC}>
            <input type="date" id="sf-limqc" className={inputCls(errors.limiteQC)} value={form.limiteQC || ''} onChange={e => set('limiteQC', e.target.value)} />
          </Field>
          <Field label="Ingreso FQ" id="sf-ingfq">
            <input type="date" id="sf-ingfq" className={inputCls()} value={form.ingresoFQ || ''} onChange={e => set('ingresoFQ', e.target.value)} />
          </Field>
          <Field label="SP Micro CONTH/LAL" id="sf-spmicro">
            <input type="date" id="sf-spmicro" className={inputCls()} value={form.spMicroConthLal || ''} onChange={e => set('spMicroConthLal', e.target.value)} />
          </Field>
          <Field label="SP Micro esterilidad" id="sf-spest">
            <input type="date" id="sf-spest" className={inputCls()} value={form.spMicroEsterilidad || ''} onChange={e => set('spMicroEsterilidad', e.target.value)} />
          </Field>
          <Field label="Control higiénico" id="sf-ctrlhig">
            <select id="sf-ctrlhig" className={inputCls()} value={form.controlHigienico || 'No'} onChange={e => set('controlHigienico', e.target.value)}>
              <option>No</option><option>Sí</option>
            </select>
          </Field>

          <FormSectionHead>Análisis</FormSectionHead>

          <Field label="Analista FQ" id="sf-anfq">
            <input id="sf-anfq" className={inputCls()} value={form.analistFQ || ''} onChange={e => set('analistFQ', e.target.value)} placeholder="Nombre del analista" />
          </Field>
          <Field label="F. inicio análisis" id="sf-finicio">
            <input type="date" id="sf-finicio" className={inputCls()} value={form.fechaInicioAnalisis || ''} onChange={e => set('fechaInicioAnalisis', e.target.value)} />
          </Field>
          <div className="col-span-2 flex flex-col gap-1">
            <label className="text-[11px] font-mono uppercase tracking-wider text-gray-400">Observaciones</label>
            <textarea className={`${inputCls()} min-h-[60px] resize-y`} value={form.obs || ''} onChange={e => set('obs', e.target.value)} />
          </div>
        </div>

        <div className="flex justify-end gap-2.5 mt-5 pt-4 border-t border-border">
          <Button onClick={() => setPage('results')}>Cancelar</Button>
          <Button variant="primary" onClick={submit}>Guardar lote</Button>
        </div>
      </div>
    </div>
  )
}
