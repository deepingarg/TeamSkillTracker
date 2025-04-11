# Team Skills Management Application

A comprehensive team skills management platform that enables organizations to track, visualize, and optimize team member skill development through advanced reporting and analytics.

## Features

- Track team member skills and proficiency levels
- Generate weekly and monthly reports
- Visualize skill growth and improvement over time 
- Identify training and development opportunities
- Export reports in JSON format

## Technology Stack

- **Frontend:** React, Vite, TailwindCSS, Shadcn UI
- **Backend:** Node.js, Express
- **Database:** PostgreSQL (via Neon Database)
- **Deployment:** Vercel

## Deploying to Vercel

This project is configured for deployment on Vercel.

### Step 1: Clone the Repository

```bash
git clone <your-repository-url>
cd team-skills-management
```

### Step 2: Set Up Vercel

Install the Vercel CLI:

```bash
npm install -g vercel
```

Login to Vercel:

```bash
vercel login
```

### Step 3: Connect to Neon Database

Create a PostgreSQL database on [Neon](https://neon.tech/) and obtain your connection string.

### Step 4: Configure Environment Variables

Create a `.env` file for local development:

```
DATABASE_URL=your_neon_database_connection_string
```

For production deployment, add the environment variables on Vercel:

```bash
vercel env add DATABASE_URL
```

Enter your Neon Database connection string when prompted.

### Step 5: Deploy to Vercel

Run the following command to deploy:

```bash
vercel --prod
```

This will:
1. Run the build process with Vercel
2. Deploy both the frontend and API to Vercel's edge network
3. Configure the environment variables for production

## Local Development

To run the project locally:

```bash
npm install
npm run dev
```

The application will be available at `http://localhost:5000`.

## Database Schema

The application uses a PostgreSQL database with the following key tables:

- `team_members`: Stores information about team members
- `skills`: Defines the skills being tracked
- `weekly_snapshots`: Captures points in time for historical reporting
- `skill_assessments`: Records skill levels for team members at a given snapshot

## Project Structure

- `/client` - Frontend React application
- `/server` - Backend Express server
- `/shared` - Shared types and utilities
- `/api` - Vercel serverless API endpoints

## License

MIT