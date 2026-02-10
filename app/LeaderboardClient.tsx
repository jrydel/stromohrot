'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Athlete } from '@/lib/db/schema';
import './globals.css';

interface LeaderboardData {
  athletes5k: Athlete[];
  athletes10k: Athlete[];
}

interface Props {
  initialAthletes5k: Athlete[];
  initialAthletes10k: Athlete[];
}

const SEGMENT_INFO = {
  '5k': {
    label: '5km — Libeňák',
    stravaUrl: 'https://www.strava.com/segments/40839456',
  },
  '10k': {
    label: '10km — Stromovka',
    stravaUrl: 'https://www.strava.com/segments/40863161',
  },
} as const;

async function fetchLeaderboard(): Promise<LeaderboardData> {
  const res = await fetch('/api/leaderboard');
  if (!res.ok) throw new Error('Failed to fetch leaderboard');
  return res.json();
}

export function LeaderboardClient({ initialAthletes5k, initialAthletes10k }: Props) {
  const [activeSegment, setActiveSegment] = useState<'5k' | '10k'>('5k');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formName, setFormName] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formSegment, setFormSegment] = useState<'5k' | '10k'>('5k');

  const { data, refetch } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: fetchLeaderboard,
    initialData: { athletes5k: initialAthletes5k, athletes10k: initialAthletes10k },
    refetchInterval: 5000,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage({ text: 'Submitting your time...', type: 'info' });

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formName, segment: formSegment, time: formTime }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit');
      }

      setStatusMessage({ text: result.message, type: 'success' });
      setFormTime('');
      refetch();
    } catch (e: any) {
      setStatusMessage({ text: e.message, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderLeaderboard = (list: Athlete[]) => {
    if (list.length === 0) {
      return (
        <div className="empty-state">
          <div className="empty-state-icon">🏃</div>
          <p>No times yet.<br />Be the first to submit your time!</p>
        </div>
      );
    }

    return list.map((a, i) => {
      const displayRank = i + 1;
      let rc = 'rank';
      if (displayRank === 1) rc += ' first';
      else if (displayRank === 2) rc += ' second';
      else if (displayRank === 3) rc += ' third';

      const champagne = displayRank === 1 ? <span style={{ fontSize: '0.9rem' }}>🍾</span> : null;

      return (
        <div key={a.id}>
          <div className="entry" style={{ animationDelay: `${i * 0.06}s` }}>
            <div className={rc}>
              {displayRank}
              {champagne}
            </div>
            <div className="athlete-name">
              {a.name}
            </div>
            <div className="col-date" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {a.date || ''}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'right' }}>
              {a.pace || ''}
            </div>
            <div className="time">{a.timeDisplay}</div>
          </div>
        </div>
      );
    });
  };

  const currentLeaderboard = activeSegment === '5k' ? data.athletes5k : data.athletes10k;
  const segmentInfo = SEGMENT_INFO[activeSegment];

  return (
    <>
      <div className="grain-overlay"></div>
      <div className="container">
        <header>
          <h1 className="challenge-title">Stromohrot 2026 Challenge</h1>
          <div className="header-meta">
            <span>Prague, Czech Republic</span>
            <span>2 Segments</span>
            <span>2026 Season</span>
          </div>
        </header>

        <div className="submit-banner">
          <h2>Submit Your Time</h2>
          <p>
            Run the segment on Strava, then enter your best time below.
            Find your time on the{' '}
            <a href={SEGMENT_INFO['5k'].stravaUrl} target="_blank" rel="noopener noreferrer">
              5k segment
            </a>
            {' '}or{' '}
            <a href={SEGMENT_INFO['10k'].stravaUrl} target="_blank" rel="noopener noreferrer">
              10k segment
            </a>{' '}
            page on Strava.
          </p>
          <form className="submit-form" onSubmit={handleSubmit}>
            <input
              type="text"
              className="form-input"
              placeholder="Your name"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
            />
            <input
              type="text"
              className="form-input"
              placeholder="Time (mm:ss)"
              value={formTime}
              onChange={(e) => setFormTime(e.target.value)}
              pattern="\d{1,3}:\d{2}"
              required
            />
            <div className="form-segment-toggle">
              <button
                type="button"
                className={`form-seg-btn ${formSegment === '5k' ? 'active' : ''}`}
                onClick={() => setFormSegment('5k')}
              >
                5k
              </button>
              <button
                type="button"
                className={`form-seg-btn ${formSegment === '10k' ? 'active' : ''}`}
                onClick={() => setFormSegment('10k')}
              >
                10k
              </button>
            </div>
            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Time'}
            </button>
          </form>
        </div>

        {statusMessage && (
          <div className={`status-bar ${statusMessage.type} show`}>{statusMessage.text}</div>
        )}

        <div className="segment-toggle">
          <button
            className={`seg-btn ${activeSegment === '5k' ? 'active' : ''}`}
            onClick={() => setActiveSegment('5k')}
          >
            5km — Libeňák
            <span className="seg-link">
              <a href={SEGMENT_INFO['5k'].stravaUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                View on Strava ↗
              </a>
            </span>
          </button>
          <button
            className={`seg-btn ${activeSegment === '10k' ? 'active' : ''}`}
            onClick={() => setActiveSegment('10k')}
          >
            10km — Stromovka
            <span className="seg-link">
              <a href={SEGMENT_INFO['10k'].stravaUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                View on Strava ↗
              </a>
            </span>
          </button>
        </div>

        <div className="panel">
          <div className="col-labels">
            <span></span>
            <span>Name</span>
            <span className="col-date">Date</span>
            <span style={{ textAlign: 'right' }}>Pace</span>
            <span style={{ textAlign: 'right' }}>Time</span>
          </div>
          {renderLeaderboard(currentLeaderboard)}
        </div>
      </div>
    </>
  );
}
