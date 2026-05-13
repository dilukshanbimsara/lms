"use client";

import { useState } from "react";
import { classCategories as staticCategories } from "@/data/classes";
import AccordionItem from "./AccordionItem";
import type { ClassCategory } from "@/types";

interface AccordionListProps {
  categories?: ClassCategory[];
}

export default function AccordionList({ categories }: AccordionListProps) {
  const data = categories && categories.length > 0 ? categories : staticCategories;
  const [openId, setOpenId] = useState<string | null>(data[0]?.id ?? null);

  const handleToggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-3">
      {data.map((category) => (
        <AccordionItem
          key={category.id}
          category={category}
          isOpen={openId === category.id}
          onToggle={() => handleToggle(category.id)}
        />
      ))}
    </div>
  );
}
