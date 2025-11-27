# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
npm run dev          # Start development server with hot reload (port 3000)
npm run test         # Run all tests (to be added)
npm run lint         # Run ESLint for code quality
```

### Production
```bash
npm run build        # Build for production
npm run start        # Start production server
```

### Docker
```bash
docker build -t surveillance .
docker run -p 3000:3000 -e PERSON_FOLDER=/path/to/surveillance surveillance
```

## Architecture Overview

This is a modern surveillance video management application built with **Next.js 15** (App Router). It provides a beautiful, responsive web interface for viewing surveillance camera footage organized by date.

### Technology Stack
- **Framework**: Next.js 15 with React 19
- **Routing**: App Router with file-based routing
- **Styling**: Tailwind CSS with glass morphism effects
- **UI Components**: Shadcn/ui with Radix UI primitives
- **Animations**: Framer Motion for smooth transitions
- **Icons**: Lucide React
- **TypeScript**: Full type safety with strict mode

### Core Architecture

#### 1. Events System (`lib/events.ts`)
The heart of the application - handles all surveillance data management:
- **File Parsing**: Parses camera filenames with pattern `{CameraId}_{ID}_{YYYYMMDDHHmmss}.{ext}`
- **Event Loading**: `loadEvents()` loads events for a specific date from filesystem
- **MP4 Association**: Automatically links video files to image events based on timestamps
- **Storage Calculation**: Computes file sizes for storage statistics
- **Timezone Handling**: Uses Europe/Berlin timezone for all timestamp operations

#### 2. App Router Structure
```
app/
├── layout.tsx              # Root layout with theme provider
├── page.tsx                # Home page listing event days
├── events/
│   └── [date]/
│       └── page.tsx        # Event details for specific date
└── api/
    ├── events/
    │   └── [date]/route.ts # API endpoint for event data
    └── files/
        └── [...path]/route.ts # Dynamic file serving endpoint
```

#### 3. Modern UI Components
```
components/
├── ui/                     # Shadcn/ui components (toast, etc)
├── event-day-card.tsx      # Modern glass card for event days
├── header.tsx              # Navigation with glass effects
├── surveillance-view.tsx   # Image/video viewer with modals
├── empty-state.tsx         # Engaging empty state
└── theme-provider.tsx      # Dark theme management
```

#### 4. Data Flow
1. **Filesystem**: Surveillance files stored as `{PERSON_FOLDER}/{YEAR}/{MONTH}/{DAY}/`
2. **API Routes**: Next.js route handlers serve metadata and file content
3. **Server Components**: React Server Components for fast initial load
4. **Client Components**: Interactive UI with animations and state management
5. **File Association**: JPG files are primary events, MP4s are associated based on timestamp proximity

### Modern UI Features

#### Glass Morphism Design
- Frosted glass effects with `backdrop-blur`
- Subtle gradients and transparency
- Modern card-based layouts

#### Animations & Interactions
- Smooth hover effects with Framer Motion
- Staggered animation delays for grid items
- Responsive scaling and transforms

#### Mobile-First Design
- Responsive grid layouts (1-4 columns)
- Touch-friendly interactions
- Mobile navigation menu

### Key Implementation Details

#### File Naming Convention
Files must follow this exact pattern:
- `Camera1_00_20250607000730.jpg` 
  - Camera ID: `Camera1`
  - Sequence: `00`  
  - Timestamp: `2025-06-07 00:07:30`
  - Extension: `jpg` or `mp4`

#### MP4 Association Logic
- Each JPG event can have associated MP4 files
- MP4s are linked if their timestamp falls between current JPG and next JPG
- Last JPG event includes all remaining MP4s in the directory

#### Modern Features
- **Image Optimization**: Next.js automatic image optimization (ready to implement)
- **Caching**: Built-in request caching and deduplication
- **Streaming**: Server Components for fast page loads
- **Error Boundaries**: Graceful error handling
- **Dark Mode**: Consistent dark theme throughout

### Environment Configuration
- **PERSON_FOLDER**: Path to surveillance data directory (defaults to `./surveillance`)
- **PORT**: Server port (defaults to 3000)

### Component Architecture
- **EventDayCard**: Modern glass card with hover effects and delete functionality
- **SurveillanceView**: Grid layout with modal viewers for images and videos
- **Header**: Responsive navigation with glass effects and mobile menu
- **EmptyState**: Engaging animation for when no events exist

### API Design
- **GET /api/events/[date]**: Returns events array for specific date
- **DELETE /api/events/[date]**: Deletes entire event day
- **GET /api/files/[...path]**: Serves surveillance files with proper headers

### Important Notes
- Always preserve exact filename format when working with surveillance files
- Timezone is hardcoded to Europe/Berlin for consistency
- File sizes are calculated on-demand, not cached
- Modern video playback with custom modal and controls
- All API responses use proper Content-Type headers and caching
- Glass morphism effects require backdrop-blur support