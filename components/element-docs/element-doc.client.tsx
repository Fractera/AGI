"use client"

import { useEffect, useState } from "react"
import { P } from "@/components/ui/typography"
import { ElementDoc, type ElementDocWords } from "./element-doc"
import type { DocFile } from "@/lib/agi-items/element-docs"

// ISLAND OF ONE ELEMENT DOCUMENT (step 412-2): the page is prerendered, the agent rewrites its documents at any minute, so the
// text is asked from `GET /api/node/element-docs` when the page opens. Four states: loading · files · empty folder · refused
// (a refusal means «unknown», not «there is no document»).

export type ElementDocIslandWords = ElementDocWords & { loading: string; failed: string }

export function ElementDocIsland({ item, page, words }: { item: string; page: string; words: ElementDocIslandWords }) {
  const [files, setFiles] = useState<DocFile[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [collapse, setCollapse] = useState(false)

  useEffect(() => {
    let live = true
    fetch(`/api/node/element-docs?item=${encodeURIComponent(item)}&page=${encodeURIComponent(page)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((b: { ok?: boolean; files?: DocFile[]; collapse?: boolean }) => {
        if (!live) return
        if (b.ok && Array.isArray(b.files)) {
          setCollapse(Boolean(b.collapse))
          setFiles(b.files)
        }
        else setFailed(true)
      })
      .catch(() => live && setFailed(true))
    return () => {
      live = false
    }
  }, [item, page])

  if (failed) return <P className="text-muted-foreground" data-element-doc="failed">{words.failed}</P>
  if (!files) return <P className="text-muted-foreground" data-element-doc="loading">{words.loading}</P>
  return <ElementDoc files={files} words={words} collapse={collapse} />
}
