// Embeds the full case study PDF using the browser's native PDF renderer —
// no extra dependency. Renders nothing until pdf_url is set (see admin).
export default function PdfViewer({ pdfUrl, title = 'Case Study' }) {
  if (!pdfUrl) return null

  return (
    <div>
      <div className="flex items-end justify-between gap-4 flex-wrap mb-4">
        <h2 className="heading-section mb-0">Read the Full Case Study</h2>
        <div className="flex gap-3 shrink-0">
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="text-body-sm font-bold" style={{ color: 'var(--accent)' }}>
            Open in New Tab &rarr;
          </a>
          <a href={pdfUrl} download className="text-body-sm font-bold" style={{ color: 'var(--accent)' }}>
            Download PDF &darr;
          </a>
        </div>
      </div>
      <div className="card overflow-hidden" style={{ height: 'min(80vh, 900px)' }}>
        <iframe
          src={`${pdfUrl}#toolbar=1&view=FitH`}
          title={`${title} — full PDF`}
          className="w-full h-full"
          style={{ border: 'none' }}
        />
      </div>
      <p className="text-body-sm text-gray-400 mt-3">
        Having trouble viewing the embedded PDF?{' '}
        <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="font-semibold" style={{ color: 'var(--accent)' }}>
          Open it directly
        </a>.
      </p>
    </div>
  )
}
