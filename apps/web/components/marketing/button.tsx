import { cn } from "@/lib/cn";
import { TELEGRAM_URL } from "@/lib/constants";

type Variant = "primary" | "secondary" | "ghost";
type Arrow = "ne" | "down" | "none";

type Props = {
  href?: string;
  children: React.ReactNode;
  variant?: Variant;
  arrow?: Arrow;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  onClick?: () => void;
  external?: boolean;
  type?: "button" | "submit";
};

function ArrowIcon({ dir }: { dir: Arrow }) {
  if (dir === "none") return null;
  if (dir === "down") {
    return (
      <span className="btn-arrow" aria-hidden>
        ↓
      </span>
    );
  }
  return (
    <span className="btn-arrow" aria-hidden>
      ↗
    </span>
  );
}

export function Button({
  href,
  children,
  variant = "primary",
  arrow = "ne",
  disabled,
  loading,
  className,
  onClick,
  external,
  type = "button",
}: Props) {
  const classes = cn(
    "group/btn inline-flex h-11 items-center justify-center gap-2 rounded-none px-5 text-[13px] font-medium uppercase tracking-[0.12em] transition-colors duration-300",
    variant === "primary" && "btn-primary",
    variant === "secondary" && "btn-secondary",
    variant === "ghost" && "bg-transparent text-ink hover:text-arcblue",
    arrow === "down" && "group/btn-down",
    loading && "is-loading",
    disabled && "cursor-not-allowed",
    className,
  );

  const content = (
    <>
      {loading ? (
        <span
          className="spin inline-block size-3.5 rounded-full border border-current border-t-transparent"
          aria-hidden
        />
      ) : null}
      <span>{children}</span>
      {!loading ? <ArrowIcon dir={arrow} /> : null}
    </>
  );

  if (href && !disabled) {
    const isExternal = external ?? href.startsWith("http");
    return (
      <a
        href={href}
        className={classes}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
      >
        {content}
      </a>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled || loading} onClick={onClick}>
      {content}
    </button>
  );
}

export function TelegramCta({
  children = "Open ArcTrade",
  variant = "primary",
  className,
}: {
  children?: React.ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <Button href={TELEGRAM_URL} variant={variant} className={className}>
      {children}
    </Button>
  );
}
