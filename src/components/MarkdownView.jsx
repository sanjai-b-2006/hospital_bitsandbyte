import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Shared, nicely-styled Markdown renderer for AI answers (real bold + real tables)
const mdComponents = {
  h1: ({ node, ...p }) => <h4 style={{ margin: '2px 0 6px', fontSize: '0.95rem' }} {...p} />,
  h2: ({ node, ...p }) => <h5 style={{ margin: '2px 0 6px', fontSize: '0.9rem' }} {...p} />,
  h3: ({ node, ...p }) => <h6 style={{ margin: '2px 0 6px', fontSize: '0.86rem' }} {...p} />,
  p: ({ node, ...p }) => <p style={{ margin: '0 0 8px' }} {...p} />,
  ul: ({ node, ...p }) => <ul style={{ margin: '0 0 8px', paddingLeft: '18px' }} {...p} />,
  ol: ({ node, ...p }) => <ol style={{ margin: '0 0 8px', paddingLeft: '18px' }} {...p} />,
  li: ({ node, ...p }) => <li style={{ marginBottom: '3px' }} {...p} />,
  strong: ({ node, ...p }) => <strong style={{ fontWeight: 700 }} {...p} />,
  a: ({ node, ...p }) => <a style={{ color: '#0369a1' }} target="_blank" rel="noreferrer" {...p} />,
  code: ({ node, ...p }) => (
    <code style={{ background: '#f1f5f9', padding: '1px 4px', borderRadius: '4px', fontSize: '0.8em' }} {...p} />
  ),
  table: ({ node, ...p }) => (
    <div style={{ overflowX: 'auto', margin: '6px 0 10px' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.8rem' }} {...p} />
    </div>
  ),
  th: ({ node, ...p }) => (
    <th style={{ border: '1px solid #e2e8f0', background: '#f1f5f9', padding: '5px 7px', textAlign: 'left', fontWeight: 700 }} {...p} />
  ),
  td: ({ node, ...p }) => <td style={{ border: '1px solid #e2e8f0', padding: '5px 7px', verticalAlign: 'top' }} {...p} />,
  hr: ({ node, ...p }) => <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '10px 0' }} {...p} />,
  blockquote: ({ node, ...p }) => (
    <blockquote style={{ borderLeft: '3px solid #cbd5e1', margin: '6px 0', paddingLeft: '10px', color: '#475569' }} {...p} />
  ),
};

export default function MarkdownView({ content }) {
  if (!content) return null;
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
      {content}
    </ReactMarkdown>
  );
}