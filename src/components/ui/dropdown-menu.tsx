"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface DropdownMenuContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.MutableRefObject<HTMLButtonElement | null>;
}

const DropdownMenuContext = React.createContext<
  DropdownMenuContextType | undefined
>(undefined);

function useDropdownMenu(): DropdownMenuContextType {
  const context = React.useContext(DropdownMenuContext);
  if (!context) {
    throw new Error("DropdownMenu components must be used within DropdownMenu");
  }
  return context;
}

interface DropdownMenuProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function DropdownMenu({
  children,
  open: controlledOpen,
  onOpenChange,
}: DropdownMenuProps) {
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);

  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const setOpen = (newOpen: boolean) => {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen, triggerRef }}>
      {children}
    </DropdownMenuContext.Provider>
  );
}

interface DropdownMenuTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  DropdownMenuTriggerProps
>(({ onClick, ...props }, ref) => {
  const { open, setOpen, triggerRef } = useDropdownMenu();

  return (
    <button
      ref={(el) => {
        triggerRef.current = el;
        if (typeof ref === "function") ref(el);
        else if (ref) ref.current = el;
      }}
      onClick={(e) => {
        setOpen(!open);
        onClick?.(e);
      }}
      {...props}
    />
  );
});
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

interface DropdownMenuContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "center" | "end";
}

const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  DropdownMenuContentProps
>(({ className, align = "start", ...props }, ref) => {
  const { open, setOpen, triggerRef } = useDropdownMenu();
  const [position, setPosition] = React.useState({ top: 0, left: 0, right: "auto" as string | number });
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (open && triggerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      
      if (align === "end") {
        setPosition({
          top: triggerRect.bottom + 8,
          left: "auto" as unknown as number,
          right: viewportWidth - triggerRect.right,
        });
      } else if (align === "center") {
        setPosition({
          top: triggerRect.bottom + 8,
          left: triggerRect.left + (triggerRect.width / 2),
          right: "auto",
        });
      } else {
        setPosition({
          top: triggerRect.bottom + 8,
          left: triggerRect.left,
          right: "auto",
        });
      }
    }
  }, [open, triggerRef, align]);

  React.useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(e.target as Node) &&
        !triggerRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, setOpen, triggerRef]);

  if (!open) {
    return null;
  }

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        top: `${position.top}px`,
        left: align === "end" ? "auto" : (align === "center" ? `${position.left}px` : `${position.left}px`),
        right: align === "end" ? `${position.right}px` : "auto",
        transform: align === "center" ? "translateX(-50%)" : undefined,
        zIndex: 50,
      }}
      className={cn(
        "min-w-[8rem] overflow-hidden rounded-md border border-slate-200 bg-white p-1 shadow-md dark:border-slate-800 dark:bg-slate-950",
        className
      )}
      {...props}
    />
  );
});
DropdownMenuContent.displayName = "DropdownMenuContent";

interface DropdownMenuItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const DropdownMenuItem = React.forwardRef<
  HTMLButtonElement,
  DropdownMenuItemProps
>(({ className, onClick, ...props }, ref) => {
  const { setOpen } = useDropdownMenu();

  return (
    <button
      ref={ref}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded px-2 py-1.5 text-sm outline-none hover:bg-slate-100 focus:bg-slate-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:hover:bg-slate-800 dark:focus:bg-slate-800",
        className
      )}
      onClick={(e) => {
        setOpen(false);
        onClick?.(e);
      }}
      {...props}
    />
  );
});
DropdownMenuItem.displayName = "DropdownMenuItem";

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
};
