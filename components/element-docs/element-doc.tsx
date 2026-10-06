import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { H2, H3, H4, P } from "@/components/ui/typography"
import type { DocFile } from "@/lib/agi-items/element-docs"

// ONE DOCUMENT OF AN ELEMENT AS A PAGE (step 412-2): the element's Markdown file shown as it is, on the core's text scale.
// A folder document (steps) shows each file under its own name; an empty folder says so. JSON (the passport) is shown as code.
// Words come from the caller — nothing visible is written here.

export type ElementDocWords = { empty: string }

export function ElementDoc({ files, words }: { files: DocFile[]; words: ElementDocWords }) {
  if (files.length === 0) return <P className="text-muted-foreground" data-element-doc="empty">{words.empty}</P>
  return (
    <div className="flex flex-col gap-8" data-element-doc="files">
      {files.map((f) => (
        <article key={f.name} className="flex flex-col gap-3" data-element-doc-file={f.name}>
          {files.length > 1 && <code className="text-[length:var(--fs-small)] text-muted-foreground">{f.name}</code>}
          {f.json ? (
            <pre className="overflow-x-auto rounded-lg border border-border bg-muted/40 p-3 text-[length:var(--fs-small)]">{f.text}</pre>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => <H2>{children}</H2>,
                h2: ({ children }) => <H3>{children}</H3>,
                h3: ({ children }) => <H4>{children}</H4>,
                p: ({ children }) => <P>{children}</P>,
                ul: ({ children }) => <ul className="ml-5 list-disc space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="ml-5 list-decimal space-y-1">{children}</ol>,
                code: ({ children }) => <code className="rounded bg-muted px-1 py-0.5 text-[length:var(--fs-small)]">{children}</code>,
                pre: ({ children }) => <pre className="overflow-x-auto rounded-lg border border-border bg-muted/40 p-3">{children}</pre>,
                table: ({ children }) => (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-[length:var(--fs-small)]">{children}</table>
                  </div>
                ),
                th: ({ children }) => <th className="border-b border-border px-2 py-1 text-left font-medium">{children}</th>,
                td: ({ children }) => <td className="border-b border-border px-2 py-1 align-top">{children}</td>,
              }}
            >
              {f.text}
            </ReactMarkdown>
          )}
        </article>
      ))}
    </div>
  )
}
