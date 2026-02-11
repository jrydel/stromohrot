import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { athletes } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

const SEGMENTS = {
  '5k': { distance: 5.0 },
  '10k': { distance: 10.0 },
} as const;

function parseTime(time: string): number | null {
  const match = time.trim().match(/^(\d{1,3}):(\d{2})$/);
  if (!match) return null;
  const minutes = parseInt(match[1], 10);
  const seconds = parseInt(match[2], 10);
  if (seconds >= 60) return null;
  return minutes * 60 + seconds;
}

function secondsToDisplay(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function secondsToPace(s: number, distance: number): string {
  const paceSeconds = s / distance;
  const m = Math.floor(paceSeconds / 60);
  const sec = Math.floor(paceSeconds % 60);
  return `${m}:${sec.toString().padStart(2, '0')} /km`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, segment, time, gender } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (segment !== '5k' && segment !== '10k') {
      return NextResponse.json({ error: 'Segment must be 5k or 10k' }, { status: 400 });
    }

    const segmentKey = segment as keyof typeof SEGMENTS;

    if (!time || typeof time !== 'string') {
      return NextResponse.json({ error: 'Time is required (format: mm:ss)' }, { status: 400 });
    }

    const timeInSeconds = parseTime(time);
    if (timeInSeconds === null || timeInSeconds <= 0) {
      return NextResponse.json({ error: 'Invalid time format. Use mm:ss (e.g. 25:30)' }, { status: 400 });
    }

    const validGender = gender === 'female' ? 'female' : 'male';
    const trimmedName = name.trim();
    const { distance } = SEGMENTS[segmentKey];
    const timeDisplay = secondsToDisplay(timeInSeconds);
    const pace = secondsToPace(timeInSeconds, distance);
    const date = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    // Check existing entry for this name + segment
    const existing = await db
      .select()
      .from(athletes)
      .where(and(eq(athletes.name, trimmedName), eq(athletes.segment, segment)))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(athletes)
        .set({
          timeInSeconds,
          timeDisplay,
          pace,
          gender: validGender,
          date,
          updatedAt: new Date(),
        })
        .where(eq(athletes.id, existing[0].id));

      return NextResponse.json({
        success: true,
        action: 'updated',
        message: `Time updated! ${timeDisplay} (was ${existing[0].timeDisplay})`,
      });
    }

    await db.insert(athletes).values({
      name: trimmedName,
      segment,
      timeInSeconds,
      timeDisplay,
      pace,
      gender: validGender,
      date,
    });

    return NextResponse.json({
      success: true,
      action: 'created',
      message: `Time submitted! ${timeDisplay} for ${segment}.`,
    });
  } catch (error) {
    console.error('Submit error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
