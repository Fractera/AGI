import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { H2, H3, H4, P } from "@/components/ui/typography"
import type { DocFile } from "@/lib/agi-items/element-docs"

// ONE DOCUMENT OF AN ELEMENT AS A PAGE (step 412-2): the element's Markdown file shown as it is, on the core's text scale.
// A folder document (steps) shows each file under its own name; an empty folder says so. JSON (the passport) is shown as code.
// Words come from the caller — nothing visible is written here.

export type ElementDocWords = { empty: string }

// 416: `collapse` — папка навыков: каждый файл свёрнут под своим именем (навык — имя его папки), раскрывается по нажатию.
export function ElementDoc({ files, words, collapse = false }: { files: DocFile[]; words: ElementDocWords; collapse?: boolean }) {
  if (files.length === 0) return <P className="text-muted-foreground" data-element-doc="empty">{words.empty}</P>
  return (
    <div className={collapse ? "flex flex-col gap-3" : "flex flex-col gap-8"} data-element-doc="files">
      {files.map((f) => (
        <Shell key={f.name} name={f.name} collapse={collapse} many={files.length > 1}>
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
        </Shell>
      ))}
    </div>
  )
}

/** Рамка одного файла: обычная статья или (416, навыки) свёрнутый блок с именем навыка. */
function Shell({ name, collapse, many, children }: { name: string; collapse: boolean; many: boolean; children: React.ReactNode }) {
  if (collapse) {
    const parts = name.split("/")
    const title = parts[parts.length - 1] === "SKILL.md" ? parts[parts.length - 2] : parts[parts.length - 1]
    return (
      <details className="rounded-lg border border-border px-4 py-3" data-element-doc-file={name}>
        <summary className="cursor-pointer font-medium">{title}</summary>
        <div className="mt-3 flex flex-col gap-3">{children}</div>
      </details>
    )
  }
  return (
    <article className="flex flex-col gap-3" data-element-doc-file={name}>
      {many && <code className="text-[length:var(--fs-small)] text-muted-foreground">{name}</code>}
      {children}
    </article>
  )
}
