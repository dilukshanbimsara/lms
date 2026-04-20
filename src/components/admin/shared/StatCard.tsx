import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  href?: string;
  color?: "primary" | "accent" | "green" | "red";
}

const colorMap = {
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/10 text-accent",
  green: "bg-green-100 text-green-600",
  red: "bg-red-100 text-red-600",
};

export default function StatCard({ title, value, icon: Icon, href, color = "primary" }: StatCardProps) {
  const content = (
    <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center gap-4 hover:shadow-sm transition-shadow">
      <div className={`p-3 rounded-xl ${colorMap[color]}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  );

  if (href) return <Link href={href}>{content}</Link>;
  return content;
}
