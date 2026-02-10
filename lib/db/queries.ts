import { db } from './index';
import { athletes } from './schema';
import { eq, asc } from 'drizzle-orm';

export async function getLeaderboard() {
  const [athletes5k, athletes10k] = await Promise.all([
    db.select().from(athletes).where(eq(athletes.segment, '5k')).orderBy(asc(athletes.timeInSeconds)),
    db.select().from(athletes).where(eq(athletes.segment, '10k')).orderBy(asc(athletes.timeInSeconds)),
  ]);

  return { athletes5k, athletes10k };
}
