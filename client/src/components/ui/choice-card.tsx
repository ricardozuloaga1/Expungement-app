import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const choiceCardVariants = cva(
  "w-full text-left transition-all duration-200 cursor-pointer focus:outline-none focus:ring-3 focus:ring-[hsl(var(--primary))]/50",
  {
    variants: {
      variant: {
        default: "border border-[#E5E7EB] bg-white hover:border-[#4F46E5]/30 hover:bg-[#F9FAFB]",
        active: "border-2 border-[#BFA77B] bg-[#E6D5B8]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface ChoiceCardProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof choiceCardVariants> {
  title: string
  description?: string
  isSelected?: boolean
}

const ChoiceCard = React.forwardRef<HTMLButtonElement, ChoiceCardProps>(
  ({ className, variant, title, description, isSelected, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        choiceCardVariants({ 
          variant: isSelected ? "active" : "default", 
          className 
        }),
        "rounded-[0.75rem] p-4 sm:p-6 text-[#111827] h-full min-h-[100px] flex flex-col justify-between"
      )}
      {...props}
    >
      <div className="space-y-1 text-center">
        <div className="font-medium text-sm sm:text-base leading-5 sm:leading-6">
          {title}
        </div>
        {description && (
          <div className="text-xs sm:text-sm text-[#6B7280] leading-4 sm:leading-5">
            {description}
          </div>
        )}
      </div>
    </button>
  )
)
ChoiceCard.displayName = "ChoiceCard"

export { ChoiceCard, choiceCardVariants } 