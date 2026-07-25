// Renders one or more JSON-LD <script> tags. Accepts a single schema object
// or an array; falsy entries are skipped.
export default function SchemaScript({ schemas }) {
  const list = (Array.isArray(schemas) ? schemas : [schemas]).filter(Boolean)
  if (!list.length) return null

  return (
    <>
      {list.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  )
}
