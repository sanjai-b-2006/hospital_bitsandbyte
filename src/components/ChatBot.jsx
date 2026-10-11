import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Loader2, ShieldAlert } from 'lucide-react';
import { API_BASE_URL } from '../config';

const WELCOME = {
  role: 'assistant',
  content:
    "Hi! I'm MedAssist AI \u{1F5FE}\n\nI help uncover possible — often rare — causes of a medical presentation. " +
    'Describe the patient\u2019s symptoms, history, vitals, or lab results and I\u2019ll offer structured differentials, red-flag warnings, and next-step investigations.',
};

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([WELCOME]);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || typing) return;

    const userMsg = { role: 'user', content: text };
    const history = [...messages, userMsg];

    // Preserve reasoning_details when the last assistant turn used reasoning
    const payload = history.map((m) => ({
      role: m.role,
      content: m.content,
      ...(m.reasoningDetails ? { reasoning_details: m.reasoningDetails } : {}),
    }));

    setMessages(history);
    setInput('');
    setTyping(true);

    try {
      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: payload }),
      });

      // Handle non-JSON responses (e.g. Vercel timeout/crash returns HTML) gracefully
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        throw new Error(`Server answered with non-JSON (HTTP ${res.status}) — possible function timeout`);
      }

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.content || '(No response received.)',
            reasoningDetails: data.reasoningDetails || undefined,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `⚠️ ${data.error || 'Something went wrong.'}` },
        ]);
      }
    } catch (err) {
      // Show the exact URL + real error so deployment issues are obvious
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ Could not reach ${API_BASE_URL}/chat (${err.message}). If the URL shows localhost:5001, VITE_API_URL is not set/baked into the build on Vercel.`,
        },
      ]);
    } finally {
      setTyping(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setOpen(!open)}
        title="MedAssist AI — Clinical Decision Support"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '28px',
          width: '58px',
          height: '58px',
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 25px rgba(2, 132, 199, 0.4)',
          zIndex: 999,
          transition: 'transform 0.15s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        {open ? <X size={26} /> : <Bot size={28} />}
        {!open && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              width: '14px',
              height: '14px',
              background: '#34d399',
              borderRadius: '50%',
              border: '2px solid white',
            }}
          />
        )}
      </button>

      {/* Chat Panel */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: '96px',
            right: '28px',
            width: '400px',
            maxWidth: 'calc(100vw - 32px)',
            height: '560px',
            maxHeight: 'calc(100vh - 140px)',
            background: 'white',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-xl)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 999,
            animation: 'scaleUp 0.2s ease-out',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 18px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.01em' }}>
                MedAssist AI
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>
                Clinical decision support · OpenRouter
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                color: 'white',
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              background: '#f8fafc',
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  padding: '10px 14px',
                  borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  background: m.role === 'user' ? '#0284c7' : 'white',
                  color: m.role === 'user' ? 'white' : '#0f172a',
                  border: m.role === 'user' ? 'none' : '1px solid var(--border-color)',
                  fontSize: '0.85rem',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  boxShadow: m.role === 'user' ? '0 4px 12px rgba(2,132,199,0.3)' : 'var(--shadow-sm)',
                }}
              >
                {m.content}
              </div>
            ))}

            {typing && (
              <div
                style={{
                  alignSelf: 'flex-start',
                  padding: '12px 16px',
                  borderRadius: '14px 14px 14px 4px',
                  background: 'white',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#64748b',
                  fontSize: '0.85rem',
                }}
              >
                <Loader2 size={16} className="spin" />
                MedAssist is reasoning…
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <div
            style={{
              padding: '8px 16px',
              background: '#fffbeb',
              borderTop: '1px solid #fde68a',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              fontSize: '0.72rem',
              color: '#92400e',
            }}
          >
            <ShieldAlert size={14} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>
              AI suggestions are for decision support only and require clinical confirmation — not a
              substitute for professional medical diagnosis.
            </span>
          </div>

          {/* Input */}
          <div
            style={{
              padding: '12px',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              gap: '8px',
              background: 'white',
            }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Describe symptoms, vitals, or test results…"
              rows={1}
              style={{
                flex: 1,
                resize: 'none',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '10px 12px',
                fontSize: '0.85rem',
                fontFamily: 'inherit',
                outline: 'none',
              }}
            />
            <button
              onClick={send}
              disabled={!input.trim() || typing}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                border: 'none',
                cursor: input.trim() && !typing ? 'pointer' : 'not-allowed',
                background: input.trim() && !typing ? '#0284c7' : '#e2e8f0',
                color: input.trim() && !typing ? 'white' : '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}