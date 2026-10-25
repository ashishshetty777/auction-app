import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded font-sans font-semibold tracking-wide transition-[background-color,border-color,color,box-shadow] duration-150 disabled:cursor-not-allowed disabled:opacity-45 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-floodlight-strong text-white shadow-[0_6px_20px_-8px_rgba(232,49,127,0.7)] hover:bg-floodlight active:bg-floodlight-strong",
        secondary:
          "border border-rule-strong bg-night-3 text-ink hover:border-ink-3 hover:bg-[#1f2a6b]",
        ghost: "text-ink-2 hover:bg-night-3 hover:text-ink",
        danger:
          "bg-ball text-white hover:bg-[#ef3f48] shadow-[0_6px_20px_-8px_rgba(224,49,58,0.7)]",
        "danger-quiet":
          "border border-ball/50 text-[#ff8a90] hover:bg-ball/15 hover:border-ball",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-4 text-[15px]",
        lg: "h-14 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => {
    return (
      <button
        type={type}
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
