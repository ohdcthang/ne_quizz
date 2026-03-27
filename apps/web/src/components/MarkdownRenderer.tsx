"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <div className="my-4 rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                <SyntaxHighlighter
                  style={atomDark}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                  customStyle={{
                    margin: 0,
                    padding: "1.5rem",
                    fontSize: "0.875rem",
                    lineHeight: "1.5",
                    backgroundColor: "rgba(0, 0, 0, 0.3)",
                  }}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code
                className={`${className} bg-white/10 px-1.5 py-0.5 rounded-md font-mono text-amber-500`}
                {...props}
              >
                {children}
              </code>
            );
          },
          // Customizing other elements to match the app's aesthetic
          p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="opacity-90">{children}</li>,
          h1: ({ children }) => <h1 className="text-2xl font-black mb-4 uppercase italic tracking-tighter glow-accent text-white">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-black mb-3 uppercase italic tracking-tighter text-white/90">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-bold mb-2 text-white/80">{children}</h3>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-amber-500 bg-white/5 p-4 rounded-r-xl italic opacity-80 my-4">
              {children}
            </blockquote>
          ),
          a: ({ children, href }) => (
            <a href={href} className="text-amber-500 hover:text-amber-400 underline transition-colors" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
