# Aquazone Billing Application

A comprehensive billing and invoice management system built with Next.js, React, and TypeScript.

## Features

- **Multi-terminal Billing Workflow**: Complete product selection, customer management, and payment processing
- **Product Catalog**: Full-screen product browsing with categories and search
- **Customer Management**: Search, create, and manage customer records
- **Invoice Generation**: Automated invoice creation with PDF download
- **Transaction Tracking**: Complete payment and transaction history
- **Global Search**: Search across customers, products, and invoices
- **Real-time Updates**: Live cart updates and inventory management

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun
- A backend API server (see API Configuration below)
- Firebase project for authentication

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd aquazone-billing
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Configure environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
# API Configuration (Required)
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com/api

# Firebase Configuration (Required)
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

4. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Authentication

The application uses a **two-tier authentication system**:

### 1. Firebase Google Sign-In (Primary)
- Users sign in with Google via Firebase
- Immediate access to application features
- User data populated from Google profile

### 2. Backend Integration (Optional/Manual)
- Manual sync with backend API via "Sync with Backend" button
- Enhanced user data including roles and permissions
- Called only when explicitly needed

### Authentication Flow
1. **Google Sign-In** → Instant access with Firebase data
2. **Optional Backend Sync** → Enhanced profile with roles
3. **Seamless Integration** → Works with or without backend

This approach provides fast sign-in while allowing backend integration when needed.

## API Configuration

This application can work with or without a backend API server. The API endpoints are documented in `api.md`. 

**Note**: The application functions with Firebase authentication alone. Backend integration is optional and provides enhanced features like user roles and data synchronization.

### Required API Endpoints

- `/health` - Health check
- `/category/` - Product categories
- `/product/` - Products and inventory
- `/customer/` - Customer management
- `/invoice/` - Invoice creation and retrieval
- `/transaction/` - Payment processing

See `api.md` for complete API documentation.

## Production Deployment

### Environment Setup

1. Set production environment variables:
```env
NODE_ENV=production
NEXT_PUBLIC_API_BASE_URL=https://your-production-api.com/api
# ... other Firebase config
```

2. Build the application:
```bash
npm run build
```

3. Start the production server:
```bash
npm start
```

### Deployment Options

- **Vercel**: Deploy directly from GitHub with automatic builds
- **Docker**: Build and deploy as a containerized application
- **Self-hosted**: Deploy to your own server infrastructure

## Architecture

- **Frontend**: Next.js 15 with React 19 and TypeScript
- **Styling**: Tailwind CSS with responsive design
- **State Management**: React hooks and context
- **Authentication**: Firebase Auth integration
- **API Client**: Custom fetch wrapper with error handling
- **UI Components**: Custom components with Lucide React icons

## Development

### Project Structure

```
app/
├── components/          # Reusable UI components
│   ├── billing/        # Billing workflow components
│   └── GlobalSearch.tsx # Global search functionality
├── customers/          # Customer management pages
├── products/           # Product management pages
├── invoices/           # Invoice management pages
├── transactions/       # Transaction history pages
└── page.tsx           # Main billing workspace

lib/
├── api.ts             # API client and endpoints
└── firebase.ts        # Firebase configuration
```

### Key Components

- **BillingWorkspace**: Main billing interface with product catalog and cart
- **ProductCatalog**: Full-screen product browsing with search and filters
- **CustomerSection**: Customer search and creation
- **PaymentSection**: Payment processing and invoice generation
- **GlobalSearch**: Universal search across all entities

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

[Your License Here]
