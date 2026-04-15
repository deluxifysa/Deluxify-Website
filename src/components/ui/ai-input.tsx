"use client"

import React from "react"
import { cx } from "class-variance-authority"
import { AnimatePresence, motion } from "motion/react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface OrbProps {
  dimension?: string
  className?: string
  tones?: {
    base?: string
    accent1?: string
    accent2?: string
    accent3?: string
  }
  spinDuration?: number
}

const ColorOrb: React.FC<OrbProps> = ({
  dimension = "192px",
  className,
  tones,
  spinDuration = 20,
}) => {
  const fallbackTones = {
    base: "oklch(95% 0.02 264.695)",
    accent1: "oklch(75% 0.15 350)",
    accent2: "oklch(80% 0.12 200)",
    accent3: "oklch(78% 0.14 280)",
  }

  const palette = { ...fallbackTones, ...tones }

  const dimValue = parseInt(dimension.replace("px", ""), 10)

  const blurStrength =
    dimValue < 50 ? Math.max(dimValue * 0.008, 1) : Math.max(dimValue * 0.015, 4)

  const contrastStrength =
    dimValue < 50 ? Math.max(dimValue * 0.004, 1.2) : Math.max(dimValue * 0.008, 1.5)

  const pixelDot = dimValue < 50 ? Math.max(dimValue * 0.004, 0.05) : Math.max(dimValue * 0.008, 0.1)

  const shadowRange = dimValue < 50 ? Math.max(dimValue * 0.004, 0.5) : Math.max(dimValue * 0.008, 2)

  const maskRadius =
    dimValue < 30 ? "0%" : dimValue < 50 ? "5%" : dimValue < 100 ? "15%" : "25%"

  const adjustedContrast =
    dimValue < 30 ? 1.1 : dimValue < 50 ? Math.max(contrastStrength * 1.2, 1.3) : contrastStrength

  return (
    <div
      className={cn("color-orb", className)}
      style={{
        width: dimension,
        height: dimension,
        "--base": palette.base,
        "--accent1": palette.accent1,
        "--accent2": palette.accent2,
        "--accent3": palette.accent3,
        "--spin-duration": `${spinDuration}s`,
        "--blur": `${blurStrength}px`,
        "--contrast": adjustedContrast,
        "--dot": `${pixelDot}px`,
        "--shadow": `${shadowRange}px`,
        "--mask": maskRadius,
      } as React.CSSProperties}
    >
      <style>{`
        @property --angle {
          syntax: "<angle>";
          inherits: false;
          initial-value: 0deg;
        }

        .color-orb {
          display: grid;
          grid-template-areas: "stack";
          overflow: hidden;
          border-radius: 50%;
          position: relative;
          transform: scale(1.1);
        }

        .color-orb::before,
        .color-orb::after {
          content: "";
          display: block;
          grid-area: stack;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          transform: translateZ(0);
        }

        .color-orb::before {
          background:
            conic-gradient(
              from calc(var(--angle) * 2) at 25% 70%,
              var(--accent3),
              transparent 20% 80%,
              var(--accent3)
            ),
            conic-gradient(
              from calc(var(--angle) * 2) at 45% 75%,
              var(--accent2),
              transparent 30% 60%,
              var(--accent2)
            ),
            conic-gradient(
              from calc(var(--angle) * -3) at 80% 20%,
              var(--accent1),
              transparent 40% 60%,
              var(--accent1)
            ),
            conic-gradient(
              from calc(var(--angle) * 2) at 15% 5%,
              var(--accent2),
              transparent 10% 90%,
              var(--accent2)
            ),
            conic-gradient(
              from calc(var(--angle) * 1) at 20% 80%,
              var(--accent1),
              transparent 10% 90%,
              var(--accent1)
            ),
            conic-gradient(
              from calc(var(--angle) * -2) at 85% 10%,
              var(--accent3),
              transparent 20% 80%,
              var(--accent3)
            );
          box-shadow: inset var(--base) 0 0 var(--shadow) calc(var(--shadow) * 0.2);
          filter: blur(var(--blur)) contrast(var(--contrast));
          animation: spin var(--spin-duration) linear infinite;
        }

        .color-orb::after {
          background-image: radial-gradient(
            circle at center,
            var(--base) var(--dot),
            transparent var(--dot)
          );
          background-size: calc(var(--dot) * 2) calc(var(--dot) * 2);
          backdrop-filter: blur(calc(var(--blur) * 2)) contrast(calc(var(--contrast) * 2));
          mix-blend-mode: overlay;
        }

        .color-orb[style*="--mask: 0%"]::after {
          mask-image: none;
        }

        .color-orb:not([style*="--mask: 0%"])::after {
          mask-image: radial-gradient(black var(--mask), transparent 75%);
        }

        @keyframes spin {
          to {
            --angle: 360deg;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .color-orb::before {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}

const SPEED_FACTOR = 1

interface ContextShape {
  showForm: boolean
  successFlag: boolean
  triggerOpen: () => void
  triggerClose: () => void
  labelVisible: boolean
  isMobile: boolean
}

const FormContext = React.createContext({} as ContextShape)
const useFormContext = () => React.useContext(FormContext)

export function MorphPanel() {
  const wrapperRef = React.useRef<HTMLDivElement>(null)
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)

  const { theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  const isLight = mounted && theme === "light"

  const [showForm, setShowForm] = React.useState(false)
  const [successFlag, setSuccessFlag] = React.useState(false)
  const [labelVisible, setLabelVisible] = React.useState(true)
  const [isMobile, setIsMobile] = React.useState(false)

  // Detect mobile (client-side only)
  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  // After 2 s on mobile, hide the "Ask AI" label — leaving just the orb
  React.useEffect(() => {
    if (!isMobile) return
    const t = setTimeout(() => setLabelVisible(false), 2000)
    return () => clearTimeout(t)
  }, [isMobile])

  const triggerClose = React.useCallback(() => {
    setShowForm(false)
    textareaRef.current?.blur()
  }, [])

  const triggerOpen = React.useCallback(() => {
    setShowForm(true)
    setTimeout(() => {
      textareaRef.current?.focus()
    })
  }, [])

  const handleSuccess = React.useCallback(() => {
    triggerClose()
    setSuccessFlag(true)
    setTimeout(() => setSuccessFlag(false), 1500)
  }, [triggerClose])

  React.useEffect(() => {
    function clickOutsideHandler(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node) && showForm) {
        triggerClose()
      }
    }
    document.addEventListener("mousedown", clickOutsideHandler)
    return () => document.removeEventListener("mousedown", clickOutsideHandler)
  }, [showForm, triggerClose])

  const ctx = React.useMemo(
    () => ({ showForm, successFlag, triggerOpen, triggerClose, labelVisible, isMobile }),
    [showForm, successFlag, triggerOpen, triggerClose, labelVisible, isMobile]
  )

  // Icon-only state: mobile + label hidden + form closed
  const iconOnly = isMobile && !labelVisible && !showForm

  return (
    // On mobile: align button to bottom-right corner with padding.
    // On desktop: keep centered inside the full-size container.
    <div
      className={cx(
        "flex items-end justify-end sm:items-end sm:justify-end sm:pb-10 sm:pr-8",
        !showForm && isMobile && "pb-10 pr-8"
      )}
      style={{ width: FORM_WIDTH, height: FORM_HEIGHT }}
    >
      <motion.div
        ref={wrapperRef}
        data-panel
        className={cx(
          "relative z-3 flex flex-col items-center overflow-hidden border",
          isLight ? "bg-black border-black/20 text-white" : "bg-background"
        )}
        initial={false}
        animate={{
          width: showForm ? FORM_WIDTH : iconOnly ? 44 : "auto",
          height: showForm ? FORM_HEIGHT : 44,
          borderRadius: showForm ? 14 : iconOnly ? 22 : 20,
          x: showForm ? -12 : 0,
          y: showForm ? -12 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 550 / SPEED_FACTOR,
          damping: 45,
          mass: 0.7,
          delay: showForm ? 0 : 0.08,
        }}
      >
        <FormContext.Provider value={ctx}>
          <DockBar />
          <InputForm ref={textareaRef} onSuccess={handleSuccess} />
        </FormContext.Provider>
      </motion.div>
    </div>
  )
}

function DockBar() {
  const { showForm, triggerOpen, labelVisible, isMobile } = useFormContext()
  const iconOnly = isMobile && !labelVisible && !showForm

  return (
    <footer
      className="mt-auto flex h-[44px] items-center justify-center whitespace-nowrap select-none cursor-pointer"
      onClick={!showForm ? triggerOpen : undefined}
    >
      <div className={cx(
        "flex items-center justify-center gap-2",
        iconOnly ? "px-0" : "px-3 max-sm:px-2"
      )}>
        <div className="flex w-fit items-center gap-2">
          <AnimatePresence mode="wait">
            {showForm ? (
              <motion.div
                key="blank"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                className="h-5 w-5"
              />
            ) : (
              <motion.div
                key="orb"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ColorOrb dimension="24px" tones={{ base: "oklch(22.64% 0 0)" }} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {!iconOnly && (
            <motion.div
              initial={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.4 }}
              className="overflow-hidden"
            >
              <Button
                type="button"
                className="flex h-fit flex-1 justify-end rounded-full px-2 !py-0.5 hover:bg-transparent"
                variant="ghost"
                onClick={triggerOpen}
              >
                <span className="truncate">Ask AI</span>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </footer>
  )
}

const FORM_WIDTH = 360
const FORM_HEIGHT = 400

function InputForm({ ref }: { ref: React.Ref<HTMLTextAreaElement>; onSuccess: () => void }) {
  const { triggerClose, showForm } = useFormContext()
  const btnRef = React.useRef<HTMLButtonElement>(null)
  const scrollRef = React.useRef<HTMLDivElement>(null)

  const [message, setMessage] = React.useState("")
  const [reply, setReply] = React.useState("")
  const [status, setStatus] = React.useState<"idle" | "loading" | "error">("idle")

  // Reset when panel closes
  React.useEffect(() => {
    if (!showForm) {
      setMessage("")
      setReply("")
      setStatus("idle")
    }
  }, [showForm])

  // Auto-scroll reply area
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [reply])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!message.trim() || status === "loading") return
    setStatus("loading")
    setReply("")
    try {
      const res = await fetch("/api/ask-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed")
      setReply(data.reply)
      setStatus("idle")
      setMessage("")
    } catch {
      setReply("Sorry, something went wrong. Please try again.")
      setStatus("error")
    }
  }

  function handleKeys(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Escape") triggerClose()
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      btnRef.current?.click()
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="absolute bottom-0"
      style={{ width: FORM_WIDTH, height: FORM_HEIGHT, pointerEvents: showForm ? "all" : "none" }}
    >
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 550 / SPEED_FACTOR, damping: 45, mass: 0.7 }}
            className="flex h-full flex-col p-1"
          >
            {/* Header */}
            <div className="flex justify-between py-1 shrink-0">
              <p className="text-foreground z-2 ml-[38px] flex items-center gap-[6px] select-none text-sm font-medium">
                Ask Deluxify AI
              </p>
              <button
                type="button"
                onClick={triggerClose}
                className="text-foreground mt-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-md bg-transparent opacity-50 hover:opacity-100 transition-opacity mr-1"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Reply area */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto rounded-md px-3 py-2 text-sm text-foreground/80 min-h-0"
            >
              {!reply && status === "idle" && (
                <p className="text-foreground/30 text-xs leading-relaxed select-none">
                  Ask me about our services, pricing, how AI can help your business, or anything else.
                </p>
              )}
              {status === "loading" && (
                <div className="flex items-center gap-1.5 text-foreground/40 text-xs">
                  <span className="animate-pulse">●</span>
                  <span className="animate-pulse [animation-delay:0.2s]">●</span>
                  <span className="animate-pulse [animation-delay:0.4s]">●</span>
                </div>
              )}
              {reply && (
                <p className={`leading-relaxed whitespace-pre-wrap ${status === "error" ? "text-red-400" : ""}`}>
                  {reply}
                </p>
              )}
            </div>

            {/* Input row */}
            <div className="flex items-end gap-1.5 p-1 shrink-0">
              <textarea
                ref={ref}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask me anything… (Enter to send)"
                name="message"
                rows={2}
                className="flex-1 resize-none scroll-py-2 rounded-md px-3 py-2 text-sm outline-0 bg-transparent border border-white/10 text-foreground placeholder:text-foreground/30 focus:border-white/20 transition-colors"
                onKeyDown={handleKeys}
                spellCheck={false}
              />
              <button
                ref={btnRef}
                type="submit"
                disabled={!message.trim() || status === "loading"}
                className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-600 transition-colors"
                aria-label="Send"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute top-2 left-3"
          >
            <ColorOrb dimension="24px" tones={{ base: "oklch(22.64% 0 0)" }} />
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  )
}


export default MorphPanel
