interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "accent" | "gray";
  className?: string;
}

const variantClasses = {
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/15 text-amber-700",
  gray: "bg-gray-100 text-gray-600",
};

export default function Badge({
  children,
  variant = "primary",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
