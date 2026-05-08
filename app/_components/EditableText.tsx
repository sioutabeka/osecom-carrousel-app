"use client";

import { useEffect, useRef } from "react";
import { RichText } from "./RichText";

interface Props {
  value: string;
  onChange?: (v: string) => void;
  editable?: boolean;
  className?: string;
}

export function EditableText({ value, onChange, editable, className }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!editable) return;
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [editable, value]);

  if (!editable || !onChange) {
    return <RichText>{value}</RichText>;
  }

  return (
    <textarea
      ref={ref}
      className={`cs-editable ${className ?? ""}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onInput={(e) => {
        const el = e.currentTarget;
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
      }}
    />
  );
}
