import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#4F46E5]/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-[#4F46E5] text-white hover:bg-[#4338CA] rounded-[0.5rem]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-[0.5rem]",
        outline:
          "border border-[#E5E7EB] bg-transparent text-[#4F46E5] hover:bg-[#F9FAFB] rounded-[0.5rem]",
        secondary:
          "bg-transparent border border-[#E5E7EB] text-[#4F46E5] hover:bg-[#F9FAFB] rounded-[0.5rem]",
        ghost: "hover:bg-accent hover:text-accent-foreground rounded-[0.5rem]",
        link: "text-primary underline-offset-4 hover:underline",
        "accent-orange": "bg-[hsl(var(--accent-orange))] text-white hover:bg-[hsl(var(--accent-orange))]/90 rounded-[0.5rem]",
      },
      size: {
        default: "px-6 py-3",
        sm: "px-3 py-2",
        lg: "px-8 py-4",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && (
          <Loader2 className="w-4 h-4 animate-spin" />
        )}
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
