declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | number[]
    filename?: string
    image?: { type?: string; quality?: number }
    html2canvas?: { scale?: number; logging?: boolean; dpi?: number; letterRendering?: boolean }
    jsPDF?: { unit?: string; format?: string; orientation?: string }
  }

  interface Html2Pdf {
    from(element: HTMLElement): Html2Pdf
    set(options: Html2PdfOptions): Html2Pdf
    save(filename?: string): Promise<void>
    output(type?: string): string | Blob | ArrayBuffer
    outputPdf(type?: string): string | Blob
    then(onFulfilled?: (value: unknown) => unknown): Promise<unknown>
  }

  function html2pdf(): Html2Pdf
  function html2pdf(element: HTMLElement): Html2Pdf
  function html2pdf(element: HTMLElement, options: Html2PdfOptions): Html2Pdf

  export = html2pdf
}
