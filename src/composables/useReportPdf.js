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

function buildEquipmentHtml(equipment, siteName) {
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1a1a2e;">
      <div style="border-bottom: 3px solid #0d6efd; padding-bottom: 12px; margin-bottom: 28px;">
        <h1 style="margin: 0; font-size: 22px; color: #0d6efd;">IceTrack</h1>
        <p style="margin: 2px 0 0; font-size: 12px; color: #666;">Reporte de Equipo</p>
      </div>
      <h2 style="font-size: 18px; margin: 0 0 16px;">${equipment.name || '—'}</h2>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <tr><td style="padding: 6px 12px; background: #f8f9fa; font-weight: 600; width: 140px;">Modelo</td><td style="padding: 6px 12px;">${equipment.model || '—'}</td></tr>
        <tr><td style="padding: 6px 12px; background: #f8f9fa; font-weight: 600;">Tipo</td><td style="padding: 6px 12px;">${equipment.type || '—'}</td></tr>
        <tr><td style="padding: 6px 12px; background: #f8f9fa; font-weight: 600;">Serial</td><td style="padding: 6px 12px;">${equipment.serial || '—'}</td></tr>
        <tr><td style="padding: 6px 12px; background: #f8f9fa; font-weight: 600;">Estado</td><td style="padding: 6px 12px;">${lbl(equipment.status)}</td></tr>
        <tr><td style="padding: 6px 12px; background: #f8f9fa; font-weight: 600;">Online</td><td style="padding: 6px 12px;">${equipment.online ? 'Sí' : 'No'}</td></tr>
        <tr><td style="padding: 6px 12px; background: #f8f9fa; font-weight: 600;">Sitio</td><td style="padding: 6px 12px;">${siteName || '—'}</td></tr>
        <tr><td style="padding: 6px 12px; background: #f8f9fa; font-weight: 600;">Creado</td><td style="padding: 6px 12px;">${formatDate(equipment.created)}</td></tr>
        <tr><td style="padding: 6px 12px; background: #f8f9fa; font-weight: 600;">Actualizado</td><td style="padding: 6px 12px;">${formatDate(equipment.updated)}</td></tr>
      </table>
      <div style="margin-top: 30px; padding-top: 12px; border-top: 1px solid #dee2e6; font-size: 10px; color: #999; text-align: center;">IceTrack — Generado el ${formatDateTime(new Date().toISOString())}</div>
    </div>
  `
}

function buildTechnicalHtml(request, interventions, technicians, siteName, equipmentName) {
  const interHtml = interventions.map((iv, i) => {
    const tech = technicians.find(t => t.id === iv.technicianId)
    const techName = tech ? tech.name : (iv.technicianId || '—')
    return `
      <div style="margin-bottom: 14px; padding: 10px; background: #f8f9fa; border-radius: 4px;">
        <div style="font-weight: 600; font-size: 13px; margin-bottom: 4px;">Intervención #${i + 1} — ${lbl(iv.status)} — ${formatDate(iv.startTime)}</div>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <tr><td style="padding: 2px 8px; font-weight: 600; width: 100px;">Técnico</td><td style="padding: 2px 8px;">${techName}</td></tr>
          <tr><td style="padding: 2px 8px; font-weight: 600;">Inicio</td><td style="padding: 2px 8px;">${formatDateTime(iv.startTime)}</td></tr>
          <tr><td style="padding: 2px 8px; font-weight: 600;">Fin</td><td style="padding: 2px 8px;">${formatDateTime(iv.endTime)}</td></tr>
          <tr><td style="padding: 2px 8px; font-weight: 600;">Resumen</td><td style="padding: 2px 8px;">${iv.summary || '—'}</td></tr>
          <tr><td style="padding: 2px 8px; font-weight: 600;">Fotos</td><td style="padding: 2px 8px;">${(iv.photoUrls && iv.photoUrls.length) ? iv.photoUrls.length + ' foto(s)' : 'Sin fotos'}</td></tr>
        </table>
      </div>
    `
  }).join('')

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1a1a2e;">
      <div style="border-bottom: 3px solid #0d6efd; padding-bottom: 12px; margin-bottom: 28px;">
        <h1 style="margin: 0; font-size: 22px; color: #0d6efd;">IceTrack</h1>
        <p style="margin: 2px 0 0; font-size: 12px; color: #666;">Reporte Técnico — Solicitud #${request.id}</p>
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
        <tr><td style="padding: 6px 12px; background: #f8f9fa; font-weight: 600; width: 140px;">Estado</td><td style="padding: 6px 12px;">${lbl(request.status)}</td></tr>
        <tr><td style="padding: 6px 12px; background: #f8f9fa; font-weight: 600;">Tipo</td><td style="padding: 6px 12px;">${lbl(request.type)}</td></tr>
        <tr><td style="padding: 6px 12px; background: #f8f9fa; font-weight: 600;">Prioridad</td><td style="padding: 6px 12px;">${lbl(request.priority)}</td></tr>
        <tr><td style="padding: 6px 12px; background: #f8f9fa; font-weight: 600;">Descripción</td><td style="padding: 6px 12px;">${request.description || '—'}</td></tr>
        <tr><td style="padding: 6px 12px; background: #f8f9fa; font-weight: 600;">Sitio</td><td style="padding: 6px 12px;">${siteName}</td></tr>
        <tr><td style="padding: 6px 12px; background: #f8f9fa; font-weight: 600;">Equipo</td><td style="padding: 6px 12px;">${equipmentName}</td></tr>
        <tr><td style="padding: 6px 12px; background: #f8f9fa; font-weight: 600;">Proveedor</td><td style="padding: 6px 12px;">${request.assignedToName || '—'}</td></tr>
        <tr><td style="padding: 6px 12px; background: #f8f9fa; font-weight: 600;">Técnico</td><td style="padding: 6px 12px;">${request.technicianName || '—'}</td></tr>
        <tr><td style="padding: 6px 12px; background: #f8f9fa; font-weight: 600;">Creado</td><td style="padding: 6px 12px;">${formatDateTime(request.createdAt)}</td></tr>
        <tr><td style="padding: 6px 12px; background: #f8f9fa; font-weight: 600;">Completado</td><td style="padding: 6px 12px;">${formatDateTime(request.completedAt)}</td></tr>
      </table>
      <h3 style="font-size: 15px; margin: 20px 0 10px; color: #0d6efd;">Intervenciones</h3>
      ${interventions.length ? interHtml : '<p style="font-size: 13px; color: #666;">No se registraron intervenciones.</p>'}
      <div style="margin-top: 30px; padding-top: 12px; border-top: 1px solid #dee2e6; font-size: 10px; color: #999; text-align: center;">IceTrack — Generado el ${formatDateTime(new Date().toISOString())}</div>
    </div>
  `
}

function buildHistoricalHtml(equipment, siteName, requests, allTechnicians) {
  const requestsHtml = requests.map((req, i) => {
    const techName = req.technicianName || (allTechnicians.find(t => t.id === req.technicianId)?.name) || '—'
    return `
      <div style="margin-bottom: 10px; padding: 8px 10px; background: #f8f9fa; border-radius: 4px; font-size: 12px;">
        <div style="font-weight: 600;">#${i + 1} — ${lbl(req.type)} — ${lbl(req.status)} — ${formatDate(req.createdAt)}</div>
        <div style="margin-top: 4px;">Proveedor: ${req.assignedToName || '—'} | Técnico: ${techName}</div>
        <div style="margin-top: 2px; color: #555;">${req.description || '—'}</div>
      </div>
    `
  }).join('')

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1a1a2e;">
      <div style="border-bottom: 3px solid #0d6efd; padding-bottom: 12px; margin-bottom: 28px;">
        <h1 style="margin: 0; font-size: 22px; color: #0d6efd;">IceTrack</h1>
        <p style="margin: 2px 0 0; font-size: 12px; color: #666;">Historial del Equipo</p>
      </div>
      <h2 style="font-size: 16px; margin: 0 0 12px;">${equipment.name || '—'} (${equipment.serial || '—'})</h2>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
        <tr><td style="padding: 6px 12px; background: #f8f9fa; font-weight: 600; width: 140px;">Modelo</td><td style="padding: 6px 12px;">${equipment.model || '—'}</td></tr>
        <tr><td style="padding: 6px 12px; background: #f8f9fa; font-weight: 600;">Tipo</td><td style="padding: 6px 12px;">${equipment.type || '—'}</td></tr>
        <tr><td style="padding: 6px 12px; background: #f8f9fa; font-weight: 600;">Estado</td><td style="padding: 6px 12px;">${lbl(equipment.status)}</td></tr>
        <tr><td style="padding: 6px 12px; background: #f8f9fa; font-weight: 600;">Sitio</td><td style="padding: 6px 12px;">${siteName || '—'}</td></tr>
      </table>
      <h3 style="font-size: 15px; margin: 20px 0 10px; color: #0d6efd;">Solicitudes de Servicio</h3>
      ${requests.length ? requestsHtml : '<p style="font-size: 13px; color: #666;">No hay solicitudes asociadas a este equipo.</p>'}
      <div style="margin-top: 30px; padding-top: 12px; border-top: 1px solid #dee2e6; font-size: 10px; color: #999; text-align: center;">IceTrack — Generado el ${formatDateTime(new Date().toISOString())}</div>
    </div>
  `
}

async function downloadPdf(html, filename) {
  const container = document.createElement('div')
  container.innerHTML = html
  container.style.position = 'fixed'
  container.style.top = '0'
  container.style.left = '0'
  container.style.opacity = '0'
  container.style.pointerEvents = 'none'
  container.style.zIndex = '-1'
  container.style.width = '210mm'
  document.body.appendChild(container)

  try {
    await html2pdf(container, {
      margin: 0.5,
      filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    })
  } catch (err) {
    console.error('PDF generation error:', err)
  } finally {
    if (container.parentNode) {
      document.body.removeChild(container)
    }
  }
}

export function useReportPdf() {
  function generateEquipmentReport(equipment, siteName) {
    const html = buildEquipmentHtml(equipment, siteName)
    return downloadPdf(html, `equipo-${(equipment.name || equipment.id).replace(/[^a-zA-Z0-9]/g, '_')}.pdf`)
  }

  function generateTechnicalReport(request, interventions, technicians, siteName, equipmentName) {
    const html = buildTechnicalHtml(request, interventions, technicians, siteName, equipmentName)
    return downloadPdf(html, `solicitud-${request.id}.pdf`)
  }

  function generateHistoricalReport(equipment, siteName, requests, allTechnicians) {
    const html = buildHistoricalHtml(equipment, siteName, requests, allTechnicians)
    return downloadPdf(html, `historial-${(equipment.name || equipment.id).replace(/[^a-zA-Z0-9]/g, '_')}.pdf`)
  }

  return { generateEquipmentReport, generateTechnicalReport, generateHistoricalReport }
}
