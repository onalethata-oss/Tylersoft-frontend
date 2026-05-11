# Tylersoft Ecclectics - Frontend

This is the frontend application for the Tylersoft Ecclectics platform.

## Technology Stack
- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Hooks / Context API
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Installation
```bash
npm install
```

### Environment Variables
Copy `.env.example` to `.env.local` and set the `NEXT_PUBLIC_API_BASE_URL` to point to your backend service (default: `http://localhost:8080/api`).

### Running the Application
```bash
npm run dev
```
The application will be available at `http://localhost:3000`.

## Features
- Real-time admin dashboard
- User role management
- API resource tracking
- Secure authentication flow
## Shared Types
The TypeScript interfaces used for API communication are located in the backend repository under `shared/types/index.ts`.
