interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
}

export default function SectionHeading({
  title,
  subtitle,
  centered = false,
  className = "",
}: SectionHeadingProps) {
  return (
    <div className={`mb-10 ${centered ? "text-center" : ""} ${className}`}>
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
        {title}
      </h2>
      <div
        className={`h-1 w-16 bg-primary rounded-full mb-4 ${centered ? "mx-auto" : ""}`}
      />
      {subtitle && (
        <p className="text-gray-600 text-lg max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
