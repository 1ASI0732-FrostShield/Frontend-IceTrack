import html2pdf from 'html2pdf.js/dist/html2pdf.bundle.min.js'

function formatDate(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  }).format(new Date(value))
}

function formatDateTime(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(new Date(value))
}

const STATUS_LABELS = {
  completed: 'Completada', inProgress: 'En progreso', accepted: 'Aceptada',
  pending: 'Pendiente', canceled: 'Cancelada', rejected: 'Rechazada',
  corrective: 'Correctivo', preventive: 'Preventivo',
  low: 'Baja', medium: 'Media', high: 'Alta',
  ACTIVE: 'Activo', MAINTENANCE: 'Mantenimiento', REPAIR: 'Reparación', OFF: 'Apagado'
}

function lbl(val) {
  return STATUS_LABELS[val] || val
}

const DOC_STYLE = 'background-color:#ffffff; color:#000000; font-family: \'Calibri\', \'Segoe UI\', Arial, sans-serif; word-wrap: break-word; overflow-wrap: break-word; box-sizing: border-box;'
const LABEL_STYLE = 'padding: 5px 12px 5px 0; font-weight: 700; font-size: 11px; color: #000000; width: 140px; vertical-align: top; background-color:#ffffff; border: 0; border-bottom: 1px solid #cccccc; box-sizing: border-box;'
const VALUE_STYLE = 'padding: 5px 0; font-size: 11px; color: #000000; background-color:#ffffff; border: 0; border-bottom: 1px solid #cccccc; box-sizing: border-box; word-wrap: break-word; overflow-wrap: break-word;'

const PDF_RESET_CSS = `<style>
.pdf-report{background-color:#ffffff!important;font-family:'Calibri','Segoe UI',Arial,sans-serif!important}
.pdf-report table,.pdf-report thead,.pdf-report tbody,.pdf-report tr,.pdf-report td,.pdf-report th{color:#000000!important;background-color:#ffffff!important}
.pdf-report p,.pdf-report div,.pdf-report span,.pdf-report strong{background-color:#ffffff!important}
.pdf-report table{border-collapse:collapse!important}
.pdf-report td,.pdf-report th{border:0}
</style>`

function buildRow(label, val) {
  return `<tr style="background-color:#ffffff;"><td style="${LABEL_STYLE}">${label}</td><td style="${VALUE_STYLE}">${val}</td></tr>`
}

function buildRowNoBorder(label, val) {
  return `<tr><td style="padding: 4px 12px 4px 0; font-weight: 700; font-size: 11px; color: #000000; width: 100px; vertical-align: top; background-color:#ffffff;">${label}</td><td style="padding: 4px 0; font-size: 11px; color: #000000; background-color:#ffffff; word-wrap: break-word; overflow-wrap: break-word;">${val}</td></tr>`
}

function buildHeader(title, requestId) {
  return `
    <table style="width: 100%; border-collapse: collapse; background-color:#ffffff; box-sizing: border-box;">
      <tr>
        <td style="padding: 0 0 14px 0; vertical-align: top; background-color:#ffffff;">
          <div style="font-size: 22px; font-weight: 700; color: #000000; letter-spacing: 1.5px; background-color:#ffffff;">ICETRACK</div>
          <div style="font-size: 13px; color: #333333; margin-top: 6px; font-weight: 600; background-color:#ffffff;">${title}</div>
        </td>
        ${requestId ? `<td style="padding: 0 0 14px 0; vertical-align: top; text-align: right; background-color:#ffffff; width: 130px;">
          <div style="font-size: 11px; color: #666666; background-color:#ffffff; white-space: nowrap;">N.º de Solicitud</div>
          <div style="font-size: 18px; font-weight: 700; color: #000000; background-color:#ffffff;">#${requestId}</div>
        </td>` : ''}
      </tr>
    </table>
    <div style="border-bottom: 2px solid #000000; margin-bottom: 10px;"></div>
    <div style="font-size: 10px; color: #888888; background-color:#ffffff; margin-bottom: 26px;">Fecha y hora de emisión: ${formatDateTime(new Date().toISOString())}</div>
  `
}

function buildFooter() {
  return `
    <div style="margin-top: 36px; padding-top: 12px; border-top: 1px solid #e5e5e5; background-color:#ffffff; font-size: 9px; color: #888888; text-align: center;">
      IceTrack — Documento generado el ${formatDateTime(new Date().toISOString())}
    </div>
  `
}

function buildSignatureBlock() {
  return `
    <table style="width: 100%; border-collapse: collapse; margin-top: 40px; background-color:#ffffff; box-sizing: border-box;">
      <tr>
        <td style="width: 45%; text-align:center; padding: 0; background-color:#ffffff;">
          <div style="border-top: 1px solid #000000; padding-top: 6px; font-size: 11px; color: #000000; background-color:#ffffff;">Firma del Técnico</div>
        </td>
        <td style="width: 10%; background-color:#ffffff;"></td>
        <td style="width: 45%; text-align:center; padding: 0; background-color:#ffffff;">
          <div style="border-top: 1px solid #000000; padding-top: 6px; font-size: 11px; color: #000000; background-color:#ffffff;">Firma del Supervisor</div>
        </td>
      </tr>
    </table>
  `
}

function buildEquipmentHtml(equipment, siteName) {
  const rows = [
    ['Modelo', equipment.model || '—'],
    ['Tipo', equipment.type || '—'],
    ['Serial', equipment.serial || '—'],
    ['Estado', lbl(equipment.status)],
    ['Online', equipment.online ? 'Sí' : 'No'],
    ['Ubicación', siteName || '—'],
    ['Creado', formatDate(equipment.created)],
    ['Actualizado', formatDate(equipment.updated)]
  ].map(([label, val]) => buildRow(label, val)).join('')

  return `
    <div style="${DOC_STYLE} padding: 48px;">
      ${buildHeader('Reporte de Equipo', null)}
      <div style="font-size: 16px; font-weight: 700; color: #000000; margin-bottom: 16px; background-color:#ffffff;">${equipment.name || '—'}</div>
      <table style="width: 100%; border-collapse: collapse; background-color:#ffffff; box-sizing: border-box;">
        ${rows}
      </table>
      ${buildFooter()}
    </div>
  `
}

function buildTechnicalHtml(request, interventions, technicians, siteName, equipmentName) {
  const mainRows = [
    ['Estado', lbl(request.status)],
    ['Tipo de intervención', lbl(request.type)],
    ['Prioridad', lbl(request.priority)],
    ['Origen', request.origin || '—'],
    ['Ubicación', siteName || '—'],
    ['Equipo intervenido', equipmentName || '—'],
    ['Solicitante', request.requesterName || '—'],
    ['Proveedor', request.assignedToName || '—'],
    ['Técnico responsable', request.technicianName || '—'],
    ['Creado', formatDateTime(request.createdAt)],
    ['Completado', formatDateTime(request.completedAt)]
  ].map(([label, val]) => buildRow(label, val)).join('')

  const descripcionNarrativa = request.description
    ? `El equipo <strong>${equipmentName || 'reportado'}</strong> presentó la siguiente falla: "${request.description}", afectando su correcto funcionamiento en ${siteName || 'el sitio correspondiente'}.`
    : `No se registró una descripción detallada del problema para esta solicitud.`

  const interHtml = interventions.map((iv, i) => {
    const tech = technicians.find(t => t.id === iv.technicianId)
    const techName = tech ? tech.name : (iv.technicianId ? '—' : 'sin asignar')
    const resumen = iv.summary ? iv.summary : 'sin observaciones adicionales registradas'
    const estadoTexto = lbl(iv.status).toLowerCase()

    return `
      <div style="margin-bottom: 12px; background-color:#ffffff; word-wrap: break-word; overflow-wrap: break-word; box-sizing: border-box;">
        <p style="font-size: 12px; color: #000000; line-height: 1.5; margin: 0; background-color:#ffffff; word-wrap: break-word; overflow-wrap: break-word;">
          <strong>Intervención #${i + 1}</strong> — El ${formatDate(iv.startTime)}, ${techName !== 'sin asignar' ? `el técnico <strong>${techName}</strong>` : 'el técnico asignado'} realizó la intervención correspondiente. ${resumen}. Estado de la intervención: <strong>${estadoTexto}</strong>${iv.endTime ? `, finalizada el ${formatDateTime(iv.endTime)}` : ''}.
        </p>
      </div>
    `
  }).join('')

  const conclusion = request.status === 'completed'
    ? 'La solicitud fue atendida satisfactoriamente. El equipo se encuentra operativo. Se recomienda realizar seguimiento mediante mantenimiento preventivo en los próximos meses.'
    : 'La solicitud se encuentra actualmente en proceso de atención. Se recomienda dar seguimiento hasta su cierre definitivo.'

  return `
    <div style="${DOC_STYLE} padding: 48px;">
      ${buildHeader('Informe Técnico', request.id)}

      <div style="font-size: 14px; font-weight: 700; color: #000000; margin-bottom: 12px; border-bottom: 2px solid #000000; padding-bottom: 6px; background-color:#ffffff;">Datos Generales</div>
      <table style="width: 100%; border-collapse: collapse; background-color:#ffffff; margin-bottom: 26px; box-sizing: border-box;">
        ${mainRows}
      </table>

      <div style="font-size: 14px; font-weight: 700; color: #000000; margin-bottom: 10px; border-bottom: 2px solid #000000; padding-bottom: 6px; background-color:#ffffff;">Descripción del Problema</div>
      <p style="font-size: 12px; color: #000000; line-height: 1.5; margin: 0 0 26px 0; background-color:#ffffff; word-wrap: break-word; overflow-wrap: break-word;">${descripcionNarrativa}</p>

      <div style="font-size: 14px; font-weight: 700; color: #000000; margin-bottom: 10px; border-bottom: 2px solid #000000; padding-bottom: 6px; background-color:#ffffff;">Intervenciones Realizadas</div>
      ${interventions.length ? interHtml : '<p style="font-size: 12px; color: #666666; background-color:#ffffff; word-wrap: break-word; overflow-wrap: break-word;">No se registraron intervenciones para esta solicitud.</p>'}

      <div style="font-size: 14px; font-weight: 700; color: #000000; margin: 26px 0 10px 0; border-bottom: 2px solid #000000; padding-bottom: 6px; background-color:#ffffff;">Conclusiones / Observaciones</div>
      <p style="font-size: 12px; color: #000000; line-height: 1.5; margin: 0; background-color:#ffffff; word-wrap: break-word; overflow-wrap: break-word;">${conclusion}</p>

      ${buildSignatureBlock()}
      ${buildFooter()}
    </div>
  `
}

function buildHistoricalHtml(equipment, siteName, requests, allTechnicians) {
  const equipRows = [
    ['Modelo', equipment.model || '—'],
    ['Tipo', equipment.type || '—'],
    ['Serial', equipment.serial || '—'],
    ['Estado', lbl(equipment.status)],
    ['Ubicación', siteName || '—']
  ].map(([label, val]) => buildRow(label, val)).join('')

  const requestsHtml = requests.map((req, i) => {
    const techName = req.technicianName || (allTechnicians.find(t => t.id === req.technicianId)?.name) || '—'
    return `
      <div style="border: 1px solid #d9d9d9; padding: 14px; margin-bottom: 12px; background-color:#ffffff; word-wrap: break-word; overflow-wrap: break-word; box-sizing: border-box;">
        <div style="font-weight: 700; font-size: 12px; color: #000000; margin-bottom: 6px; background-color:#ffffff;">
          #${i + 1} — ${lbl(req.type)} — ${lbl(req.status)} — ${formatDate(req.createdAt)}
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; background-color:#ffffff; box-sizing: border-box;">
          <tr><td style="padding: 3px 12px 3px 0; font-weight: 700; color: #000000; width: 90px; vertical-align: top; background-color:#ffffff;">Proveedor</td><td style="padding: 3px 0; color: #000000; background-color:#ffffff; word-wrap: break-word; overflow-wrap: break-word;">${req.assignedToName || '—'}</td></tr>
          <tr><td style="padding: 3px 12px 3px 0; font-weight: 700; color: #000000; width: 90px; vertical-align: top; background-color:#ffffff;">Técnico</td><td style="padding: 3px 0; color: #000000; background-color:#ffffff; word-wrap: break-word; overflow-wrap: break-word;">${techName}</td></tr>
          <tr><td style="padding: 3px 12px 3px 0; font-weight: 700; color: #000000; width: 90px; vertical-align: top; background-color:#ffffff;">Descripción</td><td style="padding: 3px 0; color: #000000; background-color:#ffffff; word-wrap: break-word; overflow-wrap: break-word;">${req.description || '—'}</td></tr>
        </table>
      </div>
    `
  }).join('')

  return `
    <div style="${DOC_STYLE} padding: 48px;">
      ${buildHeader('Historial del Equipo', null)}
      <div style="font-size: 16px; font-weight: 700; color: #000000; margin-bottom: 16px; background-color:#ffffff; word-wrap: break-word; overflow-wrap: break-word;">${equipment.name || '—'} (${equipment.serial || '—'})</div>
      <table style="width: 100%; border-collapse: collapse; background-color:#ffffff; box-sizing: border-box;">
        ${equipRows}
      </table>
      <div style="margin-top: 26px; background-color:#ffffff;">
        <div style="font-size: 14px; font-weight: 700; color: #000000; margin-bottom: 12px; border-bottom: 2px solid #000000; padding-bottom: 6px; background-color:#ffffff;">Solicitudes de Servicio</div>
        ${requests.length ? requestsHtml : '<div style="font-size: 12px; color: #666666; background-color:#ffffff; word-wrap: break-word; overflow-wrap: break-word;">No hay solicitudes asociadas a este equipo.</div>'}
      </div>
      ${buildFooter()}
    </div>
  `
}

async function downloadPdf(html, filename) {
  const wrapper = document.createElement('div')
  wrapper.style.position = 'fixed'
  wrapper.style.top = '0'
  wrapper.style.left = '0'
  wrapper.style.width = '0'
  wrapper.style.height = '0'
  wrapper.style.overflow = 'hidden'

  const container = document.createElement('div')
  container.innerHTML = `<div class="pdf-report">${PDF_RESET_CSS}${html}</div>`
  container.style.backgroundColor = '#ffffff'
  container.style.boxSizing = 'border-box'
  container.style.wordWrap = 'break-word'
  container.style.overflowWrap = 'break-word'

  wrapper.appendChild(container)
  document.body.appendChild(wrapper)

  try {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready
    }
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))

    await html2pdf(container, {
      margin: 0.5,
      filename,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    })
  } catch (err) {
    console.error('[PDF] generation error:', err)
  } finally {
    if (wrapper.parentNode) {
      document.body.removeChild(wrapper)
    }
  }
}

export function useReportPdf() {
  function generateEquipmentReport(equipment, siteName) {
    const html = buildEquipmentHtml(equipment, siteName)
    const name = (equipment.name || equipment.id || '').replace(/[^a-zA-Z0-9]/g, '_')
    return downloadPdf(html, `Reporte_Equipo_${name}_IceTrack.pdf`)
  }

  function generateTechnicalReport(request, interventions, technicians, siteName, equipmentName) {
    const html = buildTechnicalHtml(request, interventions, technicians, siteName, equipmentName)
    return downloadPdf(html, `Informe_Tecnico_Solicitud_N${request.id}_IceTrack.pdf`)
  }

  function generateHistoricalReport(equipment, siteName, requests, allTechnicians) {
    const html = buildHistoricalHtml(equipment, siteName, requests, allTechnicians)
    const name = (equipment.name || equipment.id || '').replace(/[^a-zA-Z0-9]/g, '_')
    return downloadPdf(html, `Historial_Equipo_${name}_IceTrack.pdf`)
  }

  return { generateEquipmentReport, generateTechnicalReport, generateHistoricalReport }
}