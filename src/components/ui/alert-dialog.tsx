"use client";

import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog";
import type {
  AlertDialogCloseProps,
  AlertDialogDescriptionProps,
  AlertDialogPopupProps,
  AlertDialogRootProps,
  AlertDialogTitleProps,
  AlertDialogTriggerProps,
} from "@base-ui/react/alert-dialog";
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import type * as React from "react";

import { colors, radius } from "@/lib/tokens.stylex";
import { customClassName } from "@/lib/utils.stylex";

const styles = stylex.create({
  backdrop: {
    backgroundColor: "color-mix(in oklab, black 50%, transparent)",
    inset: 0,
    position: "fixed",
    zIndex: 50,
  },
  popup: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderStyle: "solid",
    borderWidth: "1px",
    boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.15), 0 8px 10px -6px rgb(0 0 0 / 0.15)",
    color: colors.cardForeground,
    display: "grid",
    gap: "1rem",
    maxWidth: "min(28rem, calc(100vw - 2rem))",
    padding: "1.5rem",
    width: "100%",
  },
  viewport: {
    alignItems: "center",
    display: "flex",
    inset: 0,
    justifyContent: "center",
    position: "fixed",
    zIndex: 50,
  },
  header: { display: "grid", gap: "0.4rem" },
  footer: {
    display: "flex",
    gap: "0.5rem",
    justifyContent: "flex-end",
    marginTop: "0.25rem",
  },
  title: { fontSize: "1.05rem", fontWeight: 700 },
  description: { color: colors.mutedForeground, fontSize: "0.875rem" },
});

function AlertDialog(props: AlertDialogRootProps) {
  return <AlertDialogPrimitive.Root {...props} />;
}

function AlertDialogTrigger(props: AlertDialogTriggerProps) {
  return <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />;
}

type AlertDialogContentProps = Omit<AlertDialogPopupProps, "className" | "style"> & {
  className?: string;
  style?: StyleXStyles;
};

function AlertDialogContent({ className, style, ...props }: AlertDialogContentProps) {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Backdrop
        data-slot="alert-dialog-backdrop"
        {...stylex.props(styles.backdrop)}
      />
      <AlertDialogPrimitive.Viewport
        data-slot="alert-dialog-viewport"
        {...stylex.props(styles.viewport)}
      >
        <AlertDialogPrimitive.Popup
          data-slot="alert-dialog-content"
          {...stylex.props(styles.popup, customClassName(className), style)}
          {...props}
        />
      </AlertDialogPrimitive.Viewport>
    </AlertDialogPrimitive.Portal>
  );
}

function AlertDialogHeader({ children }: { children: React.ReactNode }) {
  return (
    <div data-slot="alert-dialog-header" {...stylex.props(styles.header)}>
      {children}
    </div>
  );
}

function AlertDialogFooter({ children }: { children: React.ReactNode }) {
  return (
    <div data-slot="alert-dialog-footer" {...stylex.props(styles.footer)}>
      {children}
    </div>
  );
}

function AlertDialogTitle(props: AlertDialogTitleProps) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      {...stylex.props(styles.title)}
      {...props}
    />
  );
}

function AlertDialogDescription(props: AlertDialogDescriptionProps) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      {...stylex.props(styles.description)}
      {...props}
    />
  );
}

function AlertDialogClose(props: AlertDialogCloseProps) {
  return <AlertDialogPrimitive.Close data-slot="alert-dialog-close" {...props} />;
}

export {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
};
