
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../types';
import { CodeBlock } from './CodeBlock';
import { User, Bot } from 'lucide-react';
import { cn } from '../utils/cn';

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

export function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn(
      "py-4 sm:py-6 px-3 sm:px-4 md:px-8",
      isUser ? "bg-white" : "bg-slate-50"
    )}>
      <div className="max-w-3xl mx-auto flex gap-2 sm:gap-4">
        <div className={cn(
          "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0",
          isUser ? "bg-blue-600 text-white" : "bg-emerald-600 text-white"
        )}>
          {isUser ? <User className="w-4 h-4 sm:w-5 sm:h-5" /> : <Bot className="w-4 h-4 sm:w-5 sm:h-5" />}
        </div>
        <div className="flex-1 min-w-0 prose prose-slate max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const code = String(children).replace(/\n$/, '');
                
                // Check if it's inline code or code block
                const isInline = !match && !code.includes('\n');
                
                if (isInline) {
                  return (
                    <code className="bg-slate-200 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                      {children}
                    </code>
                  );
                }
                
                return <CodeBlock language={match?.[1] || ''} code={code} />;
              },
              p({ children }) {
                return <p className="mb-4 last:mb-0 leading-7">{children}</p>;
              },
              ul({ children }) {
                return <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>;
              },
              ol({ children }) {
                return <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>;
              },
              table({ children }) {
                return (
                  <div className="overflow-x-auto my-4">
                    <table className="min-w-full border-collapse border border-slate-300">
                      {children}
                    </table>
                  </div>
                );
              },
              th({ children }) {
                return (
                  <th className="border border-slate-300 bg-slate-100 px-4 py-2 text-left font-semibold">
                    {children}
                  </th>
                );
              },
              td({ children }) {
                return (
                  <td className="border border-slate-300 px-4 py-2">
                    {children}
                  </td>
                );
              },
              a({ href, children }) {
                return (
                  <a 
                    href={href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {children}
                  </a>
                );
              },
              blockquote({ children }) {
                return (
                  <blockquote className="border-l-4 border-slate-300 pl-4 italic text-slate-600 my-4">
                    {children}
                  </blockquote>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
          {isStreaming && (
            <span className="inline-block w-2 h-5 bg-slate-400 animate-pulse ml-1" />
          )}
        </div>
      </div>
    </div>
  );
}
