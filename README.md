# SCL-2026 Auction App

A comprehensive cricket player auction management system built with Next.js, TypeScript, and Tailwind CSS.

## Features

### 1. Home Page
- Overview of the auction system
- Quick access to Players and Auction screens
- Display of auction rules and team information

### 2. Players Screen
- View all players with their categories (Legend, Youngstar, Gold, Silver, Bronze)
- Search players by name
- Filter players by category
- Add new players to the database
- Remove unsold players
- View player details including role, age, location, and contact

### 3. Team Auction Screen
- Select current player for auction
- View maximum bid amount each team can make for the selected player
- Add players to teams with sold amount
- Track team budgets and remaining purse
- Monitor category limits for each team
- View team compositions with player details
- Real-time validation of team constraints

## Auction Rules

- **Total Teams**: 7
- **Team Purse**: 2 Crores (₹20,000,000)
- **Players per Team**: Min 11, Max 13

### Category Limits
- **Legend**: 1 player (required)
- **Youngstar**: 1 player (required)
- **Gold**: Max 2 players (required: 2)
- **Silver**: Max 5 players (required: 5)
- **Bronze**: Min 4 players

### Minimum Bid Amounts
- **Gold**: ₹15 Lakhs
- **Silver**: ₹10 Lakhs
- **Legend, Youngstar, Bronze**: ₹5 Lakhs each

## Teams
1. Gujarat Lions
2. Chhava Sena
3. Team Lagaan
4. Pratham 11
5. Yohan's Warriors
6. Khalsa Warriors
7. Shree Siddhivinayak Strikers

## Getting Started

### Prerequisites
- Node.js 18+ installed

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Data Storage

The application uses browser's localStorage to persist:
- Player database
- Team compositions
- Auction state

Data is automatically saved when:
- Adding/removing players
- Assigning players to teams
- Updating player information

To reset the auction:
- Clear browser localStorage
- Refresh the page

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Home page
│   ├── players/
│   │   └── page.tsx          # Players management screen
│   ├── auction/
│   │   └── page.tsx          # Team auction screen
│   ├── layout.tsx            # Root layout with AuctionProvider
│   └── globals.css           # Global styles
├── components/
│   └── ui/                   # Reusable UI components
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── select.tsx
│       └── badge.tsx
├── lib/
│   ├── auction-context.tsx   # State management
│   ├── constants.ts          # Auction rules and constants
│   ├── players-data.ts       # Seeded player data from PDF
│   └── utils.ts              # Utility functions
└── types/
    └── index.ts              # TypeScript type definitions
```

## Features in Detail

### Smart Bid Calculation
The app automatically calculates the maximum bid each team can make for a player based on:
- Remaining team purse
- Category limits (max players in each category)
- Total player count limits
- Minimum budget needed to complete the team

### Category Management
- Real-time tracking of category counts per team
- Visual indicators for completed and maxed-out categories
- Automatic validation when adding players

### Player Management
- Add new players with complete details
- Remove unsold players
- Search and filter functionality
- Category-based organization

## Technologies Used

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom shadcn-inspired components
- **Icons**: Lucide React
- **State Management**: React Context API
- **Data Persistence**: Browser localStorage
