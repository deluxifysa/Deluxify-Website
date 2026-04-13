"use client"

import { cn } from "@/lib/utils"
import React from "react"

export type CodeBlockProps = {
  children?: React.ReactNode
  className?: string
} & React.HTMLProps<HTMLDivElement>

function CodeBlock({ children, className, ...props }: CodeBlockProps) {
  return (
    <div
      className={cn(
        "not-prose flex w-full flex-col overflow-clip border",
        "border-border bg-card text-card-foreground rounded-xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export type CodeBlockCodeProps = {
  code: string
  language?: string
  theme?: string
  className?: string
} & React.HTMLProps<HTMLDivElement>

function CodeBlockCode({
  code,
  theme = "github-dark-dimmed",
  className,
  ...props
}: CodeBlockCodeProps) {
  const isLight = theme.includes("light")

  return (
    <div
      className={cn(
        "w-full overflow-x-auto text-[13px]",
        isLight ? "bg-[#f6f8fa]" : "bg-[#1c1c1e]",
        className
      )}
      {...props}
    >
      <pre className="px-4 py-4">
        <code
          className="font-mono leading-relaxed"
          style={{ color: isLight ? "#24292e" : "#adbac7" }}
        >
          {code}
        </code>
      </pre>
    </div>
  )
}

export type CodeBlockGroupProps = React.HTMLAttributes<HTMLDivElement>

function CodeBlockGroup({
  children,
  className,
  ...props
}: CodeBlockGroupProps) {
  return (
    <div
      className={cn("flex items-center justify-between", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export { CodeBlockGroup, CodeBlockCode, CodeBlock }
