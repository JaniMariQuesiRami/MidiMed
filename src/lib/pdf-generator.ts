interface Html2PdfOptions {
  margin?: number
  filename?: string
  image?: { type: string; quality: number }
  html2canvas?: {
    scale: number
    useCORS: boolean
    allowTaint: boolean
    backgroundColor?: string
    ignoreElements?: (element: Element) => boolean
    onclone?: (clonedDoc: Document) => void
  }
  jsPDF?: { unit: string; format: string; orientation: string }
}

interface Html2PdfInstance {
  set: (options: Html2PdfOptions) => Html2PdfInstance
  from: (element: HTMLElement) => Html2PdfInstance
  save: () => Promise<void>
}

interface Html2PdfModule {
  default: () => Html2PdfInstance
}

interface PDFGeneratorOptions {
  elementRef: HTMLDivElement
  tenant?: { name?: string }
  user?: { displayName?: string }
}

export async function generateReportPDF({ 
  elementRef, 
  tenant, 
  user 
}: PDFGeneratorOptions): Promise<void> {
  const originalCanvases = Array.from(
    elementRef.querySelectorAll('canvas')
  ) as HTMLCanvasElement[];

  const snapshots = originalCanvases.map((c) => ({
    dataUrl: c.toDataURL('image/png'),
    width: c.width,
    height: c.height,
  }));

  // Crear una copia del contenido con encabezado personalizado
  const originalContent = elementRef.cloneNode(true) as HTMLElement

  Array.from(originalContent.querySelectorAll('canvas')).forEach(
    (clonedCanvas, i) => {
      const snap = snapshots[i];
      const img = document.createElement('img');
      img.src = snap.dataUrl;
      img.width = snap.width;
      img.height = snap.height;
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      clonedCanvas.replaceWith(img);
    }
  );

  // Crear contenedor temporal para el PDF
  const pdfContainer = document.createElement('div')
  pdfContainer.style.fontFamily = '"Source Sans Pro", sans-serif'
  pdfContainer.style.backgroundColor = '#ffffff'
  pdfContainer.style.padding = '20px'
  pdfContainer.style.position = 'fixed'
  pdfContainer.style.left = '-9999px'
  pdfContainer.style.top = '0'
  pdfContainer.style.width = '0'
  pdfContainer.style.height = '0'
  pdfContainer.style.overflow = 'hidden'

  // Crear encabezado
  const header = document.createElement('div')
  header.style.marginBottom = '30px'
  header.style.borderBottom = '2px solid #3abdd4'
  header.style.paddingBottom = '20px'

  // Logo y título
  const headerTop = document.createElement('div')
  headerTop.style.display = 'flex'
  headerTop.style.alignItems = 'center'
  headerTop.style.justifyContent = 'space-between'
  headerTop.style.marginBottom = '15px'

  const logoContainer = document.createElement('div')
  logoContainer.style.display = 'flex'
  logoContainer.style.alignItems = 'center'
  logoContainer.style.gap = '10px'

  const logo = document.createElement('img')
  logo.src = '/logoPrimary.svg'
  logo.style.height = '40px'
  logo.style.width = 'auto'
  logo.style.display = 'block'
  logo.style.marginRight = '10px'
  logoContainer.appendChild(logo)

  const title = document.createElement('h1')
  title.textContent = 'MidiMed'
  title.style.display = 'inline-block'
  title.style.lineHeight = '1'
  title.style.verticalAlign = 'middle'
  title.style.fontSize = '28px'
  title.style.fontWeight = 'bold'
  title.style.color = '#3abdd4'
  title.style.margin = '0'
  title.style.padding = '0'
  title.style.alignSelf = 'center'
  logoContainer.appendChild(title)

  const dateTime = document.createElement('div')
  const now = new Date()
  dateTime.textContent = `Generado: ${now.toLocaleDateString('es-ES')} ${now.toLocaleTimeString('es-ES')}`
  dateTime.style.fontSize = '12px'
  dateTime.style.color = '#666'

  headerTop.appendChild(logoContainer)
  headerTop.appendChild(dateTime)

  // Información del reporte
  const reportInfo = document.createElement('div')
  reportInfo.style.display = 'grid'
  reportInfo.style.gridTemplateColumns = '1fr 1fr'
  reportInfo.style.gap = '20px'
  reportInfo.style.fontSize = '14px'

  const leftInfo = document.createElement('div')
  leftInfo.innerHTML = `
    <strong>Reporte de Análisis</strong><br>
    <span style="color: #666;">Organización: ${tenant?.name || 'MidiMed'}</span>
  `

  const rightInfo = document.createElement('div')
  rightInfo.innerHTML = `
    <span style="color: #666;">Generado por: ${user?.displayName || 'Usuario'}</span><br>
    <span style="color: #666;">Período: Desde la primera cita registrada</span>
  `

  reportInfo.appendChild(leftInfo)
  reportInfo.appendChild(rightInfo)

  header.appendChild(headerTop)
  header.appendChild(reportInfo)

  // Agregar encabezado y contenido al contenedor
  pdfContainer.appendChild(header)
  pdfContainer.appendChild(originalContent)

  // Agregar al DOM temporalmente
  document.body.appendChild(pdfContainer)

  try {
    // Importar dinámicamente y con timeout
    const html2pdfModule = await Promise.race([
      import('html2pdf.js'),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout al cargar html2pdf')), 10000)
      )
    ]) as Html2PdfModule

    const html2pdf = html2pdfModule.default

    // Configurar opciones para mejor rendimiento
    const options = {
      margin: 0.5,
      filename: `reporte-midimed-${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.9 },
      html2canvas: {
        scale: 1.2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        ignoreElements: (element: Element) => {
          return element.classList.contains('no-print')
        },
        onclone: (clonedDoc: Document) => {
          // Convertir colores oklch a hex en el documento clonado
          const style = clonedDoc.createElement('style')
          style.textContent = `
            * {
              color: #000000 !important;
              background-color: transparent !important;
              border-color: #e2e8f0 !important;
            }
            .bg-primary { background-color: #3abdd4 !important; color: #ffffff !important; }
            .text-primary { color: #3abdd4 !important; }
            .bg-muted { background-color: #f8fafc !important; }
            .text-muted-foreground { color: #64748b !important; }
            .border { border: 1px solid #e2e8f0 !important; }
            .border-b { border-bottom: 1px solid #e2e8f0 !important; }
            .text-white { color: #ffffff !important; }
            .rounded { border-radius: 0.375rem !important; }
            .font-semibold { font-weight: 600 !important; }
            .font-medium { font-weight: 500 !important; }
            .text-sm { font-size: 0.875rem !important; }
            .text-lg { font-size: 1.125rem !important; }
            
            /* Estilos específicos para tablas */
            table { 
              border-collapse: collapse !important; 
              width: 100% !important;
              margin: 10px 0 !important;
            }
            th { 
              background-color: #f8fafc !important; 
              color: #374151 !important; 
              font-weight: 600 !important;
              border: 1px solid #e2e8f0 !important;
              padding: 8px !important;
              text-align: left !important;
            }
            td { 
              color: #374151 !important; 
              border: 1px solid #e2e8f0 !important;
              padding: 8px !important;
            }
            tr { 
              border-bottom: 1px solid #e2e8f0 !important; 
            }
            
            /* Estilos para KPI cards */
            .space-y-4 > * + * { margin-top: 1rem !important; }
            .grid { display: grid !important; }
            .gap-3 { gap: 0.75rem !important; }
            .grid-cols-2 { grid-template-columns: repeat(2, 1fr) !important; }
            .grid-cols-4 { grid-template-columns: repeat(4, 1fr) !important; }
            .p-3 { padding: 0.75rem !important; }
            .flex { display: flex !important; }
            .flex-col { flex-direction: column !important; }
            
            /* Asegurar que el texto sea visible */
            h1, h2, h3, h4, h5, h6 { color: #111827 !important; }
            p, span, div { color: #374151 !important; }
          `
          clonedDoc.head.appendChild(style)
        }
      },
      jsPDF: {
        unit: 'in',
        format: 'a4',
        orientation: 'portrait'
      }
    }

    await html2pdf().set(options).from(pdfContainer).save()
  } finally {
    // Limpiar el DOM
    if (document.body.contains(pdfContainer)) {
      document.body.removeChild(pdfContainer)
    }
  }
}
