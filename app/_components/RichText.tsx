import React from "react";

/**
 * Parse simple : `**bold**` → <strong>, `*italique*` → <em>.
 * Pas de markdown complet, juste ces 2 markers.
 */
export function RichText({ children }: { children: string }) {
  const parts: React.ReactNode[] = [];
  let buf = "";
  let i = 0;

  const flush = () => {
    if (buf) {
      parts.push(buf);
      buf = "";
    }
  };

  while (i < children.length) {
    if (children[i] === "*" && children[i + 1] === "*") {
      const end = children.indexOf("**", i + 2);
      if (end === -1) {
        buf += "**";
        i += 2;
        continue;
      }
      flush();
      parts.push(<strong key={parts.length}>{children.slice(i + 2, end)}</strong>);
      i = end + 2;
    } else if (children[i] === "*") {
      const end = children.indexOf("*", i + 1);
      if (end === -1) {
        buf += "*";
        i++;
        continue;
      }
      flush();
      parts.push(<em key={parts.length}>{children.slice(i + 1, end)}</em>);
      i = end + 1;
    } else {
      buf += children[i];
      i++;
    }
  }
  flush();

  return <>{parts}</>;
}
