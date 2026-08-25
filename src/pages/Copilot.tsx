import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, ChevronRight, BarChart2, Zap, Database, Shield } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { INITIAL_MESSAGES, getCopilotResponse } from '@/data/copilotData';
import type { CopilotMessage } from '@/types';

const QUICK_QUESTIONS = [
  'Why is production expected to fall next month?',
  'Which zone has the highest reserve probability?',
  'Which equipment is causing the most downtime?',
  'What should we change to achieve 100% production target?',
  'Simulate a 20% increase in rainfall.',
];

function renderMarkdown(text: string): JSX.Element {
  const lines = text.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
          return <p key={i} className="font-semibold text-[hsl(var(--text-primary))]">{line.slice(2, -2)}</p>;
        }
        if (line.startsWith('> ')) {
          return <blockquote key={i} className="border-l-2 border-[hsl(var(--amber))] pl-2 text-[hsl(var(--text-secondary))]">{line.slice(2)}</blockquote>;
        }
        if (line.startsWith('- ') || line.startsWith('* ') || line.match(/^\d+\. /)) {
          const content = line.replace(/^[-*]\s|^\d+\.\s/, '');
          return (
            <div key={i} className="flex items-start gap-1.5">
              <span className="text-[hsl(var(--amber))] mt-0.5 shrink-0">›</span>
              <span dangerouslySetInnerHTML={{ __html: content.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />
            </div>
          );
        }
        if (line.startsWith('|') && line.includes('|')) {
          if (line.includes('---')) return null;
          const cells = line.split('|').filter(c => c.trim());
          const isHeader = i < lines.length - 1 && lines[i + 1]?.includes('---');
          return (
            <div key={i} className={`grid text-[11px] gap-2 py-1 border-b border-[hsl(var(--border))] ${isHeader ? 'font-semibold text-[hsl(var(--text-primary))]' : 'text-[hsl(var(--text-secondary))]'}`}
              style={{ gridTemplateColumns: `repeat(${cells.length}, 1fr)` }}>
              {cells.map((c, j) => <span key={j}>{c.trim()}</span>)}
            </div>
          );
        }
        if (line === '') return <div key={i} className="h-1" />;
        return (
          <p key={i} className="text-[hsl(var(--text-secondary))]"
            dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.+?)\*\*/g, '<strong class="text-[hsl(var(--text-primary))]">$1</strong>') }}
          />
        );
      }).filter(Boolean)}
    </div>
  );
}

function MiniChart({ chart }: { chart: NonNullable<CopilotMessage['charts']>[0] }) {
  return (
    <div className="mt-3 bg-[hsl(var(--surface-2))] rounded p-3 border border-[hsl(var(--border))]">
      <div className="section-label mb-2">{chart.title}</div>
      <ResponsiveContainer width="100%" height={120}>
        {chart.type === 'bar' ? (
          <BarChart data={chart.data} margin={{ top: 0, right: 4, left: -16, bottom: 0 }}>
            <XAxis dataKey={chart.xKey} tick={{ fontSize: 8, fill: 'hsl(215 14% 48%)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 8 }} axisLine={false} tickLine={false} width={28} />
            <Tooltip contentStyle={{ background: 'hsl(220 16% 10%)', border: '1px solid hsl(220 12% 18%)', borderRadius: '4px', fontSize: '10px' }} />
            <Bar dataKey={chart.dataKey} fill="hsl(38 92% 50%)" fillOpacity={0.8} radius={[2, 2, 0, 0]} />
          </BarChart>
        ) : chart.type === 'area' ? (
          <AreaChart data={chart.data} margin={{ top: 0, right: 4, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="copilotGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(38 92% 50%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(38 92% 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey={chart.xKey} tick={{ fontSize: 8, fill: 'hsl(215 14% 48%)' }} axisLine={false} tickLine={false} interval={4} />
            <YAxis tick={{ fontSize: 8 }} axisLine={false} tickLine={false} width={36} />
            <Tooltip contentStyle={{ background: 'hsl(220 16% 10%)', border: '1px solid hsl(220 12% 18%)', borderRadius: '4px', fontSize: '10px' }} />
            <Area type="monotone" dataKey={chart.dataKey} stroke="hsl(38 92% 50%)" strokeWidth={1.5} fill="url(#copilotGrad)" />
            {chart.data[0] && 'target' in chart.data[0] && (
              <Line type="monotone" dataKey="target" stroke="hsl(215 14% 36%)" strokeWidth={1} strokeDasharray="4 2" dot={false} />
            )}
          </AreaChart>
        ) : (
          <LineChart data={chart.data} margin={{ top: 0, right: 4, left: -16, bottom: 0 }}>
            <XAxis dataKey={chart.xKey} tick={{ fontSize: 8 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 8 }} axisLine={false} tickLine={false} width={28} />
            <Tooltip contentStyle={{ background: 'hsl(220 16% 10%)', border: '1px solid hsl(220 12% 18%)', borderRadius: '4px', fontSize: '10px' }} />
            <Line type="monotone" dataKey={chart.dataKey} stroke="hsl(38 92% 50%)" strokeWidth={1.5} dot={false} />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

function MessageBubble({ msg }: { msg: CopilotMessage }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center mt-0.5 ${isUser ? 'bg-[hsl(var(--surface-3))]' : 'bg-[hsl(38_92%_50%/0.15)] border border-[hsl(38_92%_50%/0.3)]'}`}>
        {isUser ? <User className="w-3.5 h-3.5 text-[hsl(var(--text-secondary))]" /> : <Bot className="w-3.5 h-3.5 text-[hsl(var(--amber))]" />}
      </div>

      <div className={`flex-1 max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
        {!isUser && (
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[10px] font-semibold text-[hsl(var(--amber))]">MANGAN-X Copilot</span>
            {msg.confidence && (
              <span className="text-[9px] text-[hsl(var(--text-tertiary))]">· {(msg.confidence * 100).toFixed(0)}% confidence</span>
            )}
          </div>
        )}

        <div className={`rounded p-3 text-[12px] leading-relaxed ${isUser
          ? 'bg-[hsl(var(--surface-3))] text-[hsl(var(--text-primary))] ml-auto'
          : 'bg-[hsl(var(--surface-2))] border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))]'
        }`}>
          {isUser ? msg.content : renderMarkdown(msg.content)}

          {msg.charts?.map((chart, i) => (
            <MiniChart key={i} chart={chart} />
          ))}
        </div>

        {!isUser && msg.sources && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <Database className="w-3 h-3 text-[hsl(var(--text-tertiary))]" />
            {msg.sources.map(s => (
              <span key={s} className="text-[9px] px-1.5 py-0.5 rounded bg-[hsl(var(--surface-2))] border border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))]">{s}</span>
            ))}
          </div>
        )}

        {!isUser && msg.actions && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {msg.actions.map(action => (
              <button key={action} className="flex items-center gap-1 text-[10px] px-2 py-1 rounded border border-[hsl(38_92%_50%/0.3)] text-[hsl(var(--amber))] hover:bg-[hsl(38_92%_50%/0.1)] transition-colors">
                {action}
                <ChevronRight className="w-2.5 h-2.5" />
              </button>
            ))}
          </div>
        )}

        <span className="text-[9px] text-[hsl(var(--text-tertiary))]">
          {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}

let messageIdCounter = 100;

export default function Copilot() {
  const [messages, setMessages] = useState<CopilotMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim() || thinking) return;

    const userMsg: CopilotMessage = {
      id: String(++messageIdCounter),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(m => [...m, userMsg]);
    setInput('');
    setThinking(true);

    const delay = 1000 + Math.random() * 800;
    setTimeout(() => {
      const resp = getCopilotResponse(text);
      const assistantMsg: CopilotMessage = {
        id: String(++messageIdCounter),
        role: 'assistant',
        content: resp.response,
        timestamp: new Date(),
        confidence: resp.confidence,
        sources: resp.sources,
        actions: resp.actions,
        charts: resp.chartData ? [resp.chartData] : undefined,
      };
      setMessages(m => [...m, assistantMsg]);
      setThinking(false);
    }, delay);
  };

  return (
    <div className="flex h-[calc(100vh-3rem)]">
      {/* Main chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="px-4 py-3 border-b border-[hsl(var(--border))] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[hsl(38_92%_50%/0.15)] border border-[hsl(38_92%_50%/0.3)] flex items-center justify-center">
              <Bot className="w-4 h-4 text-[hsl(var(--amber))]" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[hsl(var(--text-primary))]">MANGAN-X Copilot</div>
              <div className="flex items-center gap-1.5 text-[10px] text-[hsl(var(--text-tertiary))]">
                <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--green))]" />
                Mining Intelligence Assistant · GPT-4 + Mine Data Model
              </div>
            </div>
          </div>
          <div className="demo-badge">SIMULATION RESPONSES</div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {messages.map(msg => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}

          {thinking && (
            <div className="flex gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[hsl(38_92%_50%/0.15)] border border-[hsl(38_92%_50%/0.3)] flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5 text-[hsl(var(--amber))]" />
              </div>
              <div className="bg-[hsl(var(--surface-2))] border border-[hsl(var(--border))] rounded p-3">
                <div className="flex items-center gap-1.5 text-[11px] text-[hsl(var(--text-tertiary))]">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--amber))] animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                  Analyzing mine data...
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-[hsl(var(--border))] shrink-0">
          <div className="flex items-center gap-2 bg-[hsl(var(--surface-2))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 focus-within:border-[hsl(var(--amber))] transition-colors">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
              placeholder="Ask about production, reserves, equipment, risks..."
              className="flex-1 bg-transparent text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] outline-none"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || thinking}
              className="p-1.5 rounded bg-[hsl(var(--amber))] text-black disabled:opacity-40 hover:bg-[hsl(38_92%_44%)] transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar — Quick questions */}
      <div className="w-64 border-l border-[hsl(var(--border))] flex flex-col shrink-0">
        <div className="px-3 py-3 border-b border-[hsl(var(--border))]">
          <div className="section-label">Quick Queries</div>
        </div>
        <div className="flex-1 px-2 py-2 space-y-1 overflow-y-auto">
          {QUICK_QUESTIONS.map(q => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              disabled={thinking}
              className="w-full text-left px-2.5 py-2 rounded text-[11px] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--text-primary))] transition-colors leading-relaxed"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Capabilities */}
        <div className="px-3 py-3 border-t border-[hsl(var(--border))]">
          <div className="section-label mb-2">Capabilities</div>
          <div className="space-y-1.5">
            {[
              { icon: BarChart2, label: 'Production Analysis' },
              { icon: Shield, label: 'Risk Assessment' },
              { icon: Zap, label: 'Equipment Alerts' },
              { icon: Database, label: 'Reserve Intelligence' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-[10px] text-[hsl(var(--text-tertiary))]">
                <Icon className="w-3 h-3" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
