"use client"

import { useState } from "react"
import { InfoIcon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// 495-5 (owner 2026-10-15): a tooltip after every indicator's name explains what it is. Hover opens it on a computer; a tap opens and
// closes it on a phone, where a plain tooltip never opens.
export function IndicatorHint({ label, text }: { label: string; text: string[] }) {
  const [open, setOpen] = useState(false)
  return (
    <TooltipProvider>
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={label}
            className="relative z-10 inline-flex size-5 items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((v) => !v) }}
            data-lagrix-hint
          >
            <InfoIcon aria-hidden className="size-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-left leading-relaxed">
          <ul className="flex flex-col gap-1">{text.map((t) => <li key={t}>– {t}</li>)}</ul>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
