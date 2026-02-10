# Stromohrot 2026 Challenge Leaderboard

A Next.js app for tracking running times on Strava segments in Prague.

## Features

- 🏃 Two segment leaderboards: Libeňák 5km and Stromovka 10km
- 🔗 Strava OAuth integration
- 🏆 Real-time leaderboard with top 10 rankings
- 🌲 Connected user badge (tree icon)
- 📊 Displays rank, name, date, pace, and time
- 🔄 Manual refresh to update times
- 💾 Persistent storage across sessions

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Strava API

1. Go to https://www.strava.com/settings/api
2. Click "Create App"
3. Fill in the form:
   - **Application Name**: Stromohrot 2026 Challenge (or any name)
   - **Category**: Any
   - **Website**: http://localhost:3000
   - **Authorization Callback Domain**: `localhost` (critical!)
   - **Description**: Optional
4. Copy your **Client ID**
5. Update `CONFIG.clientId` in `app/page.tsx`:
   ```typescript
   const CONFIG = {
     clientId: 'YOUR_CLIENT_ID_HERE', // Replace with your Client ID
     segmentId5k: '40839456',
     segmentId10k: '40863161',
     redirectUri: typeof window !== 'undefined' ? window.location.origin : '',
   };
   ```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Connect with Strava

1. Click "Connect with Strava"
2. Authorize the app on Strava
3. Your times will automatically be fetched and displayed

## Build for Production

```bash
npm run build
npm start
```

## Deployment

For production deployment, update the **Authorization Callback Domain** in your Strava API settings to match your production domain (e.g., `yourdomain.com`).

## Project Structure

```
stromohrot-leaderboard/
├── app/
│   ├── page.tsx        # Main leaderboard component
│   ├── layout.tsx      # Root layout
│   └── globals.css     # Styles
├── package.json
├── next.config.js
└── tsconfig.json
```

## Technologies

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Strava API** - OAuth and segment data
- **LocalStorage** - Persistent data storage
