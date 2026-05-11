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
          <h1 className="font-mono text-sm font-bold text-[#E6EDF3] mt-3 first:mt-0">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="font-mono text-xs font-bold text-[#E6EDF3] mt-2.5 first:mt-0">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="font-mono text-xs font-semibold text-[#C9D1D9] mt-2 first:mt-0">
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
          <strong className="font-semibold text-[#E6EDF3]">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic text-[#C9D1D9]">{children}</em>
        ),
        pre: ({ children }) => (
          <pre className="my-1 overflow-x-auto rounded bg-[#161B22] p-2.5">
            {children}
          </pre>
        ),
        code: ({ children, className: langClass }) => (
          <code
            className={cn(
              "font-mono text-[11px] text-[#00FF88]",
              !langClass && "rounded bg-[#161B22] px-1 py-0.5"
            )}
          >
            {children}
          </code>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-[#388BFD] pl-3 text-[#8B949E]">
            {children}
          </blockquote>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#388BFD] underline hover:opacity-80"
          >
            {children}
          </a>
        ),
        hr: () => <hr className="border-[#21262D]" />,
        table: ({ children }) => (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">{children}</table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border border-[#21262D] bg-[#161B22] px-3 py-1.5 text-left font-mono font-semibold text-[#E6EDF3]">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border border-[#21262D] px-3 py-1.5">{children}</td>
        ),
      }}
    >
      {children}
    </ReactMarkdown>
    </div>
  );
}
