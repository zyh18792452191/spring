"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Drawer variants
const drawerVariants = cva(
  "fixed z-[100] gap-4 bg-white shadow-lg transition-all duration-300 ease-in-out",
  {
    variants: {
      side: {
        right: "inset-y-0 right-0 h-full w-full border-l sm:max-w-[1100px]",
        left: "inset-y-0 left-0 h-full w-full border-r sm:max-w-[500px]",
        top: "inset-x-0 top-0 h-auto border-b sm:max-h-[80vh]",
        bottom: "inset-x-0 bottom-0 h-auto border-t sm:max-h-[80vh]",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
)

interface DrawerProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof drawerVariants> {
  open: boolean
  onOpenChange: (open: boolean) => void
  showCloseButton?: boolean
}

const Drawer = React.forwardRef<HTMLDivElement, DrawerProps>(
  ({ className, children, open, onOpenChange, side, showCloseButton = true, ...props }, ref) => {
    const [isClosing, setIsClosing] = React.useState(false)
    const drawerRef = React.useRef<HTMLDivElement>(null)
    const overlayRef = React.useRef<HTMLDivElement>(null)

    // 阻止body滚动
    React.useEffect(() => {
      if (open) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }

      return () => {
        document.body.style.overflow = ''
      }
    }, [open])

    React.useEffect(() => {
      if (!open) {
        setIsClosing(true)
        const timer = setTimeout(() => setIsClosing(false), 300)
        return () => clearTimeout(timer)
      }
    }, [open])

    // Overlay点击事件：阻止事件冒泡
    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation()
      e.preventDefault()
      onOpenChange(false)
    }

    // 使用原生DOM事件监听器捕获事件
    React.useEffect(() => {
      if (open && overlayRef.current) {
        const handleOverlayNativeClick = (e: Event) => {
          e.stopPropagation()
          e.preventDefault()
          onOpenChange(false)
        }

        overlayRef.current.addEventListener('click', handleOverlayNativeClick, true) // 使用捕获阶段

        return () => {
          if (overlayRef.current) {
            overlayRef.current.removeEventListener('click', handleOverlayNativeClick, true)
          }
        }
      }
    }, [open, onOpenChange])

    if (!open && !isClosing) return null

    return (
      <>
        {/* Overlay */}
        <div
          ref={overlayRef}
          className={cn(
            "fixed inset-0 z-[99] bg-black/50 backdrop-blur-sm transition-opacity duration-300",
            open ? "opacity-100" : "opacity-0"
          )}
          onClick={handleOverlayClick}
        />

        {/* Drawer */}
        <div
          ref={(node) => {
            drawerRef.current = node
            if (typeof ref === 'function') {
              ref(node)
            } else if (ref) {
              ref.current = node
            }
          }}
          className={cn(
            drawerVariants({ side }),
            "flex flex-col",
            open ? "translate-x-0" : side === "right" ? "translate-x-full" : side === "left" ? "-translate-x-full" : side === "top" ? "-translate-y-full" : "translate-y-full",
            className
          )}
          {...props}
        >
          {showCloseButton && (
            <button
              onClick={() => onOpenChange(false)}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="sr-only">关闭</span>
            </button>
          )}
          {children}
        </div>
      </>
    )
  }
)
Drawer.displayName = "Drawer"

const DrawerHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-2 p-6 pb-4 shrink-0", className)}
    {...props}
  />
))
DrawerHeader.displayName = "DrawerHeader"

const DrawerTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
DrawerTitle.displayName = "DrawerTitle"

const DrawerDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DrawerDescription.displayName = "DrawerDescription"

const DrawerContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex-1 overflow-hidden", className)}
    {...props}
  >
    {children}
  </div>
))
DrawerContent.displayName = "DrawerContent"

const DrawerFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center justify-end gap-2 p-6 pt-0", className)}
    {...props}
  />
))
DrawerFooter.displayName = "DrawerFooter"

export {
  Drawer,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerContent,
  DrawerFooter,
  drawerVariants,
}
