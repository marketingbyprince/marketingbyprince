// screenshots: [{ url, caption }] — real campaign screenshots/charts supplied
// with the case study. Renders nothing when none exist yet.
export default function ScreenshotGallery({ screenshots = [], title }) {
  if (!screenshots.length) return null

  return (
    <div>
      {title && <h2 className="heading-section mb-4">{title}</h2>}
      <div className={`grid gap-5 ${screenshots.length === 1 ? 'grid-cols-1 max-w-2xl' : 'sm:grid-cols-2'}`}>
        {screenshots.map((shot, i) => (
          <figure key={shot.url || i} className="card overflow-hidden m-0">
            <img
              src={shot.url}
              alt={shot.caption || `Campaign screenshot ${i + 1}`}
              loading="lazy"
              className="w-full h-auto block"
            />
            {shot.caption && (
              <figcaption className="text-body-sm text-gray-500 px-4 py-3 border-t border-gray-100">
                {shot.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </div>
  )
}
