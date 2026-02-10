import { getLeaderboard } from '@/lib/db/queries';
import { LeaderboardClient } from './LeaderboardClient';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const { athletes5k, athletes10k } = await getLeaderboard();

  return (
    <LeaderboardClient
      initialAthletes5k={athletes5k}
      initialAthletes10k={athletes10k}
    />
  );
}
