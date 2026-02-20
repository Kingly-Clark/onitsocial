"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface DialogContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  dialogRef: React.MutableRefObject<HTMLDialogElement | null>;
}

const DialogContext = React.createContext<DialogContextType | undefined>(undefined);

function useDialog(): DialogContextType {
  const context = React.useContext(DialogContext);
  if (!context) {
    throw new Error("Dialog components must be used within Dialog");
  }
  return context;
}

interface DialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function Dialog({ children, open: controlledOpen, onOpenChange }: DialogProps) {
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);

  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const setOpen = (newOpen: boolean) => {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(newOpen);
    }
    onOpenChange?.(newOpen);

    if (newOpen && dialogRef.current) {
      dialogRef.current.showModal();
    } else if (!newOpen && dialogRef.current) {
      dialogRef.current.close();
    }
  };

  return (
    <DialogContext.Provider value={{ open, setOpen, dialogRef }}>
      {children}
    </DialogContext.Provider>
  );
}

interface DialogTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const DialogTrigger = React.forwardRef<HTMLButtonElement, DialogTriggerProps>(
  ({ onClick, ...props }, ref) => {
    const { setOpen } = useDialog();

    return (
      <button
        ref={ref}
        onClick={(e) => {
          setOpen(true);
          onClick?.(e);
        }}
        {...props}
      />
    );
  }
);
DialogTrigger.displayName = "DialogTrigger";

const DialogContent = React.forwardRef<
  HTMLDialogElement,
  React.HTMLAttributes<HTMLDialogElement>
>(({ className, children, ...props }, ref) => {
  const { dialogRef, setOpen } = useDialog();
  const mergedRef = React.useRef<HTMLDialogElement>(null);

  React.useLayoutEffect(() => {
    const dialog = mergedRef.current;
    if (dialog) {
      const handleClose = () => setOpen(false);
      const handleCancel = (e: Event) => {
        e.preventDefault();
        setOpen(false);
      };

      dialog.addEventListener("close", handleClose);
      dialog.addEventListener("cancel", handleCancel);

      return () => {
        dialog.removeEventListener("close", handleClose);
        dialog.removeEventListener("cancel", handleCancel);
      };
    }
  }, [setOpen]);

  return (
    <dialog
      ref={(el) => {
        mergedRef.current = el;
        dialogRef.current = el;
        if (typeof ref === "function") ref(el);
        else if (ref) ref.current = el;
      }}
      className={cn(
        "max-h-[85vh] w-full max-w-lg rounded-lg border border-slate-200 bg-white shadow-lg backdrop:bg-black/50 dark:border-slate-800 dark:bg-slate-950 dark:backdrop:bg-slate-900/80",
        className
      )}
      {...props}
    >
      {children}
    </dialog>
  );
});
DialogContent.displayName = "DialogContent";

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col space-y-1.5 border-b border-slate-200 p-6 dark:border-slate-800", className)}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse gap-2 border-t border-slate-200 p-6 dark:border-slate-800 sm:flex-row sm:justify-end",
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight text-slate-950 dark:text-slate-50",
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-slate-500 dark:text-slate-400", className)}
    {...props}
  />
));
DialogDescription.displayName = "DialogDescription";

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
