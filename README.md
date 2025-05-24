# EduSports Frontend

A modern, responsive React application for tournament management system built with React, Tailwind CSS, and modern web technologies.

## 🚀 Features

- **Modern UI/UX**: Clean, responsive design with Tailwind CSS
- **Authentication**: Complete login/register system with JWT
- **Tournament Management**: Browse, view details, and register for tournaments
- **Admin Dashboard**: Comprehensive admin panel for managing tournaments, teams, and matches
- **Real-time Updates**: Live data with React Query
- **Responsive Design**: Mobile-first approach, works on all devices
- **Dark Mode Ready**: Prepared for dark mode implementation

## 🛠️ Tech Stack

- **React 18** - Latest React with hooks and modern features
- **React Router 6** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **React Query** - Server state management
- **React Hook Form** - Form handling with validation
- **Axios** - HTTP client for API calls
- **React Hot Toast** - Beautiful notifications
- **Lucide React** - Modern icon library
- **Date-fns** - Date manipulation library

## 📦 Installation

1. **Navigate to frontend directory:**
   ```bash
   cd fe
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables:**
   ```env
   REACT_APP_API_URL=http://localhost:8080
   ```

5. **Start development server:**
   ```bash
   npm start
   ```

## 🏗️ Project Structure

```
fe/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Header.js
│   │   ├── Footer.js
│   │   ├── Layout.js
│   │   └── LoadingSpinner.js
│   ├── pages/              # Page components
│   │   ├── HomePage.js
│   │   ├── LoginPage.js
│   │   ├── RegisterPage.js
│   │   ├── TournamentsPage.js
│   │   ├── TournamentDetailPage.js
│   │   ├── NewsPage.js
│   │   ├── NewsDetailPage.js
│   │   ├── DashboardPage.js
│   │   ├── ProfilePage.js
│   │   └── AdminDashboard.js
│   ├── services/           # API service functions
│   │   ├── api.js
│   │   └── index.js
│   ├── context/            # React Context for state management
│   │   └── AuthContext.js
│   ├── utils/              # Utility functions
│   │   └── helpers.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── tailwind.config.js
└── package.json
```

## 🎨 Design System

### Colors
- **Primary**: Blue tones (#3b82f6)
- **Sports Theme**: 
  - Orange (#ff6b35)
  - Green (#2dd4bf) 
  - Purple (#8b5cf6)
  - Pink (#ec4899)

### Typography
- **Font**: Inter (imported from Google Fonts)
- **Weights**: 300, 400, 500, 600, 700, 800

### Components
- **Cards**: Rounded corners with subtle shadows
- **Buttons**: Primary and secondary variants
- **Forms**: Clean input fields with focus states
- **Navigation**: Responsive header with mobile menu

## 🔐 Authentication Flow

1. **Registration**: Users can create accounts with email/password
2. **Login**: JWT-based authentication with refresh tokens
3. **Protected Routes**: Role-based access control
4. **User Roles**:
   - `USER`: Basic user (can register teams)
   - `ORGANIZER`: Can create and manage tournaments
   - `ADMIN`: Full system access

## 📱 Pages Overview

### Public Pages
- **Home**: Landing page with featured tournaments and news
- **Tournaments**: Browse all tournaments with filtering
- **Tournament Detail**: Detailed view with registration
- **News**: Latest sports news and updates
- **Login/Register**: Authentication pages

### Protected Pages
- **Dashboard**: User dashboard with stats and activities
- **Profile**: User profile management
- **Admin Panel**: Tournament and system management

## 🚀 Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run test suite
- `npm eject` - Eject from Create React App

## 🔌 API Integration

The frontend integrates with the Spring Boot backend through:

- **Base URL**: Configurable via `REACT_APP_API_URL`
- **Authentication**: JWT tokens in Authorization headers
- **Interceptors**: Automatic token handling and error management
- **Services**: Organized API calls for different domains

### API Endpoints Used
- `/api/v1/auth/*` - Authentication
- `/api/tournaments/*` - Tournament management
- `/api/teams/*` - Team operations
- `/api/matches/*` - Match data
- `/api/v1/news/*` - News articles

## 🎯 Key Features

### Tournament Management
- Browse tournaments with search and filters
- View detailed tournament information
- Register teams for tournaments
- Track tournament progress and results

### User Dashboard
- Personal statistics and activities
- Quick access to registered tournaments
- Profile management
- Role-based navigation

### Admin Panel
- Create and manage tournaments
- Monitor system statistics
- User and team management
- Analytics and reporting

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimized
- Touch-friendly interactions
- Accessible navigation

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Static Hosting
The build folder can be deployed to any static hosting service:
- Netlify
- Vercel
- AWS S3 + CloudFront
- GitHub Pages

### Environment Variables for Production
```env
REACT_APP_API_URL=https://your-api-domain.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 Notes

- **Backend Required**: This frontend requires the Spring Boot backend to be running
- **Demo Data**: Some components show placeholder data until backend integration
- **Icons**: Using Lucide React for consistent iconography
- **State Management**: React Query for server state, Context API for auth state
- **Error Handling**: Comprehensive error boundaries and user feedback

## 🐛 Known Issues

- Some advanced features require backend implementation
- File uploads need additional configuration
- Real-time notifications not yet implemented

## 📄 License

This project is part of the EduSports tournament management system.

---

**Happy Coding! 🎉**