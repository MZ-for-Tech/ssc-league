"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";
import DropdownSelect from "@/components/ui/DropdownSelect";

type GuideSection = { label: string; id: string };

export default function GuideContentsDropdown({ contents }: { contents: GuideSection[] }) {
  const [selectedId, setSelectedId] = useState("");

  const selectSection = (id: string) => {
    setSelectedId(id);
    const section = document.getElementById(id);
    if (!section) return;

    window.location.hash = id;
    section.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  return (
    <DropdownSelect
      value={selectedId}
      options={contents.map(({ label, id }) => ({ label, value: id }))}
      onChange={selectSection}
      ariaLabel="Jump to a guide section"
      leadingIcon={<BookOpen size={15} />}
    />
  );
}
