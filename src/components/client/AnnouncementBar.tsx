'use client';

import { useEffect, useRef } from 'react';
import { SiteContent } from '@/lib/types';

interface Props {
  content: SiteContent;
}

export default function AnnouncementBar({ content }: Props) {
  const { announcementBar } = content;

  if (!announcementBar.isVisible) return null;

  const messages = [...announcementBar.messages, ...announcementBar.messages];

  return (
    <div className="announcement-bar">
      <div className="ticker-wrap">
        <div className="ticker-content">
          {messages.map((msg, i) => (
            <span key={i} className="ticker-item">
              {msg}
              <span className="ticker-sep">✦</span>
            </span>
          ))}
        </div>
      </div>

      <style jsx>{`
        .announcement-bar {
          background: var(--black);
          color: var(--white);
          height: 42px;
          overflow: hidden;
          display: flex;
          align-items: center;
          position: relative;
          top: 70px;
          z-index: 999;
        }
        .ticker-wrap {
          overflow: hidden;
          width: 100%;
        }
        .ticker-content {
          display: flex;
          white-space: nowrap;
          animation: tickerScroll 28s linear infinite;
          will-change: transform;
        }
        .ticker-item {
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.04em;
          padding: 0 8px;
          display: inline-flex;
          align-items: center;
          gap: 12px;
        }
        .ticker-sep {
          font-size: 10px;
          opacity: 0.5;
          margin-left: 12px;
        }
      `}</style>
    </div>
  );
}
