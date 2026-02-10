import { pgTable, serial, text, integer, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

export const athletes = pgTable('athletes', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  segment: text('segment').notNull(), // '5k' or '10k'
  timeInSeconds: integer('time_in_seconds').notNull(),
  timeDisplay: text('time_display').notNull(),
  pace: text('pace'),
  date: text('date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('athlete_name_segment_idx').on(table.name, table.segment),
]);

export type Athlete = typeof athletes.$inferSelect;
export type NewAthlete = typeof athletes.$inferInsert;
