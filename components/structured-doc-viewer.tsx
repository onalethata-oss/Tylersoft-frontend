'use client';
import React, { useMemo } from 'react';
import { Copy, CheckCircle2, Terminal, Globe, Layers, Mail, Phone, MapPin, ExternalLink, Hash, FileText, Image as ImageIcon } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism as lightStyle } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '@/lib/utils';

interface UIBlock {
  id: string;
  type: "metadata" | "contact" | "heading" | "paragraph" | "list" | "table" | "image" | "code" | "divider";
  level?: number | null;
  text?: string | null;
  code?: string | null;
  items?: string[] | null;
  ordered?: boolean | null;
  table?: {
    headers: string[];
    rows: string[][];
  } | null;
  image?: {
    src: string | null;
    caption: string | null;
    page: number | null;
  } | null;
  metadata?: {
    title: string | null;
    authors: string[] | null;
    date: string | null;
    pages: number | null;
  } | null;
  contact?: {
    addresses: string[] | null;
    phones: string[] | null;
    emails: string[] | null;
    websites: string[] | null;
    registration: string | null;
    legal: string | null;
  } | null;
  confidence: number;
}

interface StructuredDocViewerProps {
  jsonString?: string | null;
  fallbackText?: string;
  apiId?: number | null;
}

// ── Shared UI Components ─────────────────────────────────────────────────────

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = React.useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 2000); }}
      className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground/60 hover:text-foreground bg-background border-2 border-border px-3 py-1.5 rounded-xl transition-all uppercase italic tracking-widest">
      {ok ? <CheckCircle2 size={10} className="text-emerald-600" /> : <Copy size={10} />}
      {ok ? 'Copied' : 'Copy'}
    </button>
  );
}

// ── Block Renderers ──────────────────────────────────────────────────────────

export function StructuredDocViewer({ jsonString, fallbackText, apiId }: StructuredDocViewerProps) {
  const blocks = useMemo<UIBlock[]>(() => {
    if (!jsonString) return [];
    try {
      const parsed = JSON.parse(jsonString);
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  }, [jsonString]);

  if (!blocks.length) {
    return (
      <div className="flex flex-col items-center justify-center p-24 text-center h-full bg-background/30">
        <Layers size={40} className="mb-6 text-primary/20 animate-pulse" />
        <h3 className="text-xl font-black text-foreground/40 mb-4 uppercase tracking-tighter italic">Initializing Unified Documentation</h3>
        <p className="text-xs text-muted-foreground/40 max-w-sm">{fallbackText || 'Waiting for core synchronization...'}</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto custom-scrollbar font-sans selection:bg-primary/10 transition-colors bg-background/5">
      <div className="max-w-4xl mx-auto px-10 py-12 space-y-6 pb-24">
        
        {blocks.map((block) => {
          switch (block.type) {
            case 'metadata':
              return null;

            case 'contact':
              return (
                <div key={block.id} className="bg-background/40 border-2 border-border/50 rounded-3xl p-8 my-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Globe size={18} className="text-primary" />
                    <h2 className="text-xs font-black uppercase tracking-widest text-foreground italic">Connectivity Channels</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {block.contact?.emails?.map((email, i) => (
                      <a key={i} href={`mailto:${email}`} className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border hover:border-primary transition-all group">
                        <Mail size={14} className="text-muted-foreground group-hover:text-primary" />
                        <span className="text-xs font-bold text-foreground/80 truncate">{email}</span>
                      </a>
                    ))}
                    {block.contact?.websites?.map((web, i) => (
                      <a key={i} href={web} target="_blank" className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border hover:border-primary transition-all group">
                        <ExternalLink size={14} className="text-muted-foreground group-hover:text-primary" />
                        <span className="text-xs font-bold text-foreground/80 truncate">{web}</span>
                      </a>
                    ))}
                  </div>
                </div>
              );

            case 'heading':
              const Tag = (block.level === 1 ? 'h1' : block.level === 2 ? 'h2' : 'h3') as any;
              return (
                <Tag key={block.id} className={cn(
                  "font-black tracking-tighter uppercase italic pt-6 mb-2 border-l-4 border-primary pl-4",
                  block.level === 1 ? "text-2xl text-foreground" : "text-lg text-foreground/80"
                )}>
                  {block.text}
                </Tag>
              );

            case 'paragraph':
              return (
                <p key={block.id} className="text-muted-foreground text-sm leading-relaxed font-medium max-w-3xl whitespace-pre-wrap my-4 italic">
                  {block.text}
                </p>
              );

            case 'list':
              const ListTag = block.ordered ? 'ol' : 'ul';
              return (
                <ListTag key={block.id} className={cn(
                  "space-y-2 my-4 pl-6",
                  block.ordered ? "list-decimal" : "list-disc"
                )}>
                  {block.items?.map((item, i) => (
                    <li key={i} className="text-foreground/70 text-xs leading-relaxed pl-2 marker:text-primary marker:font-black">
                      {item}
                    </li>
                  ))}
                </ListTag>
              );

            case 'table':
              return (
                <div key={block.id} className="overflow-hidden border border-border rounded-2xl bg-card shadow-lg my-8">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px] border-collapse">
                      <thead>
                        <tr className="bg-background/50 border-b border-border">
                          {block.table?.headers.map((h, i) => (
                            <th key={i} className="px-6 py-4 font-black uppercase tracking-widest text-muted-foreground/60 text-[9px] italic">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {block.table?.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-background/30 transition-colors">
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="px-6 py-4 text-foreground/90 font-bold text-xs">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );

            case 'code':
              const codeContent = block.code || block.text || '';
              const isXml = codeContent.trim().startsWith('<');
              return (
                <div key={block.id} className="rounded-2xl overflow-hidden border border-border shadow-xl my-8">
                  <div className="bg-background/80 p-6">
                    <div className="flex items-center justify-between mb-4 border-b border-border/50 pb-3">
                      <div className="flex items-center gap-2">
                        <Terminal size={14} className="text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 italic">{isXml ? 'XML / HTML' : 'JSON / Script'}</span>
                      </div>
                      <CopyBtn text={codeContent} />
                    </div>
                    <SyntaxHighlighter
                      language={isXml ? 'xml' : 'json'}
                      style={lightStyle}
                      customStyle={{ margin: 0, padding: 0, fontSize: '0.8rem', background: 'transparent' }}
                    >
                      {codeContent}
                    </SyntaxHighlighter>
                  </div>
                </div>
              );

            case 'image':
              return (
                <figure key={block.id} className="my-8 group">
                  <div className="aspect-video bg-muted/20 rounded-2xl border border-dashed border-border/40 flex flex-col items-center justify-center relative overflow-hidden transition-all group-hover:border-primary/30">
                    <ImageIcon size={32} className="text-muted-foreground/10" />
                    {block.image?.src && (
                      <img src={block.image.src} alt={block.image.caption || ''} className="absolute inset-0 w-full h-full object-cover" />
                    )}
                  </div>
                  {block.image?.caption && (
                    <figcaption className="mt-3 text-center text-[10px] font-bold text-muted-foreground italic uppercase tracking-tighter opacity-50">
                      Fig: {block.image.caption}
                    </figcaption>
                  )}
                </figure>
              );

            case 'divider':
              return <hr key={block.id} className="border-border/20 my-10" />;

            default:
              return null;
          }
        })}

      </div>
    </div>
  );
}
