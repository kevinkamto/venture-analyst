import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

type Props = {
  children: string;
  className?: string;
};

export function Markdown({ children, className }: Props) {
  return (
    <div className={cn("space-y-2", className)}>
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 className="font-display text-sm font-bold text-[#251A0E] mt-3 first:mt-0">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="font-sans text-xs font-bold text-[#251A0E] mt-2.5 first:mt-0">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="font-sans text-xs font-semibold text-[#5A4230] mt-2 first:mt-0">
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className="leading-relaxed">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="ml-4 list-disc space-y-0.5">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="ml-4 list-decimal space-y-0.5">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="leading-relaxed">{children}</li>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-[#251A0E]">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic text-[#5A4230]">{children}</em>
        ),
        pre: ({ children }) => (
          <pre className="my-1 overflow-x-auto rounded-lg bg-[#E8DFC9] p-2.5">
            {children}
          </pre>
        ),
        code: ({ children, className: langClass }) => (
          <code
            className={cn(
              "font-mono text-[11px] text-[#9B6E2E]",
              !langClass && "rounded bg-[#E8DFC9] px-1 py-0.5"
            )}
          >
            {children}
          </code>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-[#CDBFA3] pl-3 text-[#967860]">
            {children}
          </blockquote>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#4A5E72] underline hover:opacity-80"
          >
            {children}
          </a>
        ),
        hr: () => <hr className="border-[#E8DFC9]" />,
        table: ({ children }) => (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">{children}</table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border border-[#CDBFA3] bg-[#E8DFC9] px-3 py-1.5 text-left font-sans font-semibold text-[#251A0E]">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border border-[#CDBFA3] px-3 py-1.5">{children}</td>
        ),
      }}
    >
      {children}
    </ReactMarkdown>
    </div>
  );
}
