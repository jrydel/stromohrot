import { config } from 'dotenv';
config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, serial, text, integer, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { lte } from 'drizzle-orm';

const athletes = pgTable('athletes', {
  id: serial('id').primaryKey(),
  stravaAthleteId: integer('strava_athlete_id').notNull(),
  name: text('name').notNull(),
  segment: text('segment').notNull(),
  timeInSeconds: integer('time_in_seconds').notNull(),
  timeDisplay: text('time_display').notNull(),
  pace: text('pace'),
  speed: text('speed'),
  date: text('date'),
  stravaRank: integer('strava_rank'),
  activityUrl: text('activity_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('athlete_segment_idx').on(table.stravaAthleteId, table.segment),
]);

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const top10_5k = [
  { stravaAthleteId: -1, name: 'Kuba Dostál', timeInSeconds: 1307, timeDisplay: '21:47', pace: '4:21 /km', speed: '13.8 km/h', date: 'May 3, 2024', stravaRank: 1 },
  { stravaAthleteId: -2, name: 'Petr Fojtík', timeInSeconds: 1383, timeDisplay: '23:03', pace: '4:36 /km', speed: '13.0 km/h', date: 'Nov 4, 2025', stravaRank: 2 },
  { stravaAthleteId: -3, name: 'Vladimír Pavlík', timeInSeconds: 1384, timeDisplay: '23:04', pace: '4:36 /km', speed: '13.0 km/h', date: 'Sep 11, 2025', stravaRank: 3 },
  { stravaAthleteId: -4, name: 'Sylvestr Janák', timeInSeconds: 1390, timeDisplay: '23:10', pace: '4:37 /km', speed: '13.0 km/h', date: 'Sep 9, 2025', stravaRank: 4 },
  { stravaAthleteId: -5, name: 'steven shaughnessy', timeInSeconds: 1390, timeDisplay: '23:10', pace: '4:37 /km', speed: '13.0 km/h', date: 'Dec 17, 2024', stravaRank: 4 },
  { stravaAthleteId: -6, name: 'Max Pierik', timeInSeconds: 1390, timeDisplay: '23:10', pace: '4:37 /km', speed: '13.0 km/h', date: 'Aug 1, 2024', stravaRank: 4 },
  { stravaAthleteId: -7, name: 'Franz Z', timeInSeconds: 1404, timeDisplay: '23:24', pace: '4:40 /km', speed: '12.8 km/h', date: 'Apr 4, 2025', stravaRank: 7 },
  { stravaAthleteId: -8, name: 'Standa Pech', timeInSeconds: 1430, timeDisplay: '23:50', pace: '4:45 /km', speed: '12.6 km/h', date: 'Sep 9, 2025', stravaRank: 8 },
  { stravaAthleteId: -9, name: 'Hepcat G', timeInSeconds: 1473, timeDisplay: '24:33', pace: '4:54 /km', speed: '12.2 km/h', date: 'Oct 4, 2023', stravaRank: 9 },
  { stravaAthleteId: -10, name: 'Ola Jedrzejewska', timeInSeconds: 1476, timeDisplay: '24:36', pace: '4:54 /km', speed: '12.2 km/h', date: 'Oct 5, 2023', stravaRank: 10 },
];

async function seed() {
  console.log('Clearing existing seeded data...');
  await db.delete(athletes).where(lte(athletes.stravaAthleteId, 0));

  console.log('Seeding 5k leaderboard...');

  for (const athlete of top10_5k) {
    await db.insert(athletes).values({
      stravaAthleteId: athlete.stravaAthleteId,
      name: athlete.name,
      segment: '5k',
      timeInSeconds: athlete.timeInSeconds,
      timeDisplay: athlete.timeDisplay,
      pace: athlete.pace,
      speed: athlete.speed,
      date: athlete.date,
      stravaRank: athlete.stravaRank,
      activityUrl: null,
    });
    console.log(`  Added: ${athlete.name} - ${athlete.timeDisplay}`);
  }

  console.log('Done!');
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
