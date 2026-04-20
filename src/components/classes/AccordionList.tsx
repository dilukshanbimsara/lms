"use client";

import { useState } from "react";
import { classCategories } from "@/data/classes";
import AccordionItem from "./AccordionItem";

export default function AccordionList() {
  const [openId, setOpenId] = useState<string | null>("hall");

  const handleToggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-3">
      {classCategories.map((category) => (
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
