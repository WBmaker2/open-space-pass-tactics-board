import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: "primary" | "secondary";
  /** 필수 다음 행동 두 개(패스 길 확인·다음 지원 시험)에만 사용하는 맥박 강조. */
  readonly pulse?: boolean;
  readonly children: ReactNode;
}

export function ActionButton({
  variant = "secondary",
  pulse = false,
  className,
  children,
  type,
  ...rest
}: ActionButtonProps) {
  const classes = [
    "action-button",
    variant === "primary" ? "action-button--primary" : "action-button--secondary",
    pulse ? "gi-pulse" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type ?? "button"} className={classes} {...rest}>
      {pulse ? (
        <span className="action-button__badge" aria-hidden="true">
          필수
        </span>
      ) : null}
      <span className="action-button__label">{children}</span>
    </button>
  );
}
