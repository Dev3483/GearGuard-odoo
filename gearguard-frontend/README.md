# GearGuard - The Ultimate Maintenance Tracker

A full-featured, modern maintenance tracking web application built with Next.js, React, TailwindCSS, and Framer Motion.

## Features

### Authentication
- Login and Register pages with JWT authentication
- Role-based access control (Admin, Manager, Technician, Requester)
- Automatic token refresh and session management
- Protected routes with role-based redirects

### Role-Based Dashboards

#### Requester Dashboard
- Create new maintenance requests
- View all personal requests with filtering by status
- Real-time statistics (Total, In Progress, Completed, Overdue)
- Auto-fill equipment details when creating requests
- Color-coded status pills and urgency indicators

#### Technician Dashboard
- Drag-and-drop Kanban board with 4 stages (New, In Progress, Repaired, Scrap)
- Mobile-friendly stage selectors
- Real-time workload statistics
- Overdue task highlighting with pulse animations
- Quick stage updates via API

#### Manager Dashboard
- Control center with analytics widgets
- Tabbed interface: Overview, Equipment, Teams, Requests
- Equipment status breakdown (Operational, Maintenance, Broken)
- Recent requests overview
- Team member counts and assignments

#### Admin Dashboard
- User management with CRUD operations
- System-wide statistics
- Database health monitoring
- Role assignment and permissions
- Animated system health indicators

### Additional Features
- Equipment management with team assignments
- Team creation and management
- Request filtering and search
- Calendar view placeholder for preventive maintenance
- Toast notifications for user feedback
- Skeleton loaders for loading states
- Glassmorphism UI effects
- Smooth page transitions and micro-interactions

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19.2
- **Styling**: TailwindCSS v4
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Notifications**: Sonner (React Hot Toast)
- **Date Handling**: date-fns

## API Configuration

The frontend connects to a backend API at `http://localhost:5000/api`

### Key API Endpoints

#### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/me` - Get current user

#### Equipment
- `POST /equipment` - Create equipment
- `GET /equipment` - List all equipment
- `GET /equipment/:id/requests` - Get equipment request history
- `PATCH /equipment/:id` - Update equipment

#### Teams
- `POST /teams` - Create team
- `GET /teams` - List all teams

#### Requests
- `POST /requests` - Create maintenance request
- `GET /requests` - List all requests
- `GET /requests/my` - Get user's requests
- `GET /requests/assigned` - Get assigned requests (technicians)
- `PATCH /requests/:id/stage` - Update request stage

## Test Accounts

The following test accounts are available:

| Email                      | Password    | Role        |
|---------------------------|-------------|-------------|
| admin@gearguard.com       | password123 | Admin       |
| manager@gearguard.com     | password123 | Manager     |
| tech@gearguard.com        | password123 | Technician  |
| requester@gearguard.com   | password123 | Requester   |

## Getting Started

### Prerequisites
- Node.js 18+ 
- Backend API running on `http://localhost:5000`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/
│   ├── dashboard/
│   │   ├── admin/         # Admin dashboard
│   │   ├── manager/       # Manager dashboard
│   │   ├── technician/    # Technician dashboard
│   │   └── requester/     # Requester dashboard
│   ├── equipment/         # Equipment management
│   ├── teams/             # Team management
│   ├── requests/          # All requests view
│   ├── calendar/          # Calendar view (placeholder)
│   ├── login/             # Login page
│   ├── register/          # Register page
│   └── layout.tsx         # Root layout
├── components/
│   ├── layout/            # Layout components (Sidebar, Topbar)
│   ├── ui/                # Shadcn UI components
│   ├── request-card.tsx   # Request card component
│   └── stat-card.tsx      # Statistics card component
├── context/
│   └── auth-context.tsx   # Authentication context
├── lib/
│   ├── axios.ts           # Axios instance with interceptors
│   └── utils.ts           # Utility functions
└── globals.css            # Global styles with design tokens
```

## Design System

### Color Palette
- **Primary**: Blue (#67A3E1) - Main brand color
- **Accent**: Cyan (#62D2F0) - Secondary actions
- **Success**: Green - Completed states
- **Warning**: Orange - In-progress states
- **Destructive**: Red - Errors and critical states

### Typography
- **Font Family**: Geist (sans-serif)
- **Headings**: Bold, gradient text effects
- **Body**: Regular weight with relaxed line-height

### Effects
- **Glassmorphism**: Backdrop blur with transparency
- **Animations**: Framer Motion for page transitions
- **Micro-interactions**: Hover effects, button bounces
- **Loading States**: Skeleton loaders and spinners

## Key Features Implementation

### Auto-Fill Behavior
When creating a request, selecting equipment automatically populates the team and technician via backend API.

### Overdue Highlighting
Requests past their due date display red borders and pulse animations.

### Drag & Drop Kanban
Technicians can drag request cards between stages. Mobile users have dropdown selectors.

### Token Management
Axios interceptor automatically attaches JWT tokens to all requests and redirects to login on 401 errors.

### Role-Based Navigation
Sidebar navigation items are filtered based on the user's role.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is created for demonstration purposes.
