import type { CodeBlockProps } from "../utils/types";

export default function CodeBlock({ children }: CodeBlockProps) {
  return (
    <pre className="af-surface-lg overflow-x-hidden whitespace-pre-wrap break-words bg-[#14121a] p-5 text-[12px] leading-relaxed text-white/80">
      <code className="whitespace-pre-wrap break-words">{children}</code>
    </pre>
  );
}
