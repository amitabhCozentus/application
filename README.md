# ITT Portal

A modern Angular 19 application for Integrated Tracking and Tracing with comprehensive role and user management capabilities.

## 🚀 Tech Stack

### Core Framework
- **Angular 19.0.0** - Latest Angular with standalone components and new control flow
- **TypeScript 5.6.2** - Type-safe development
- **RxJS 7.8.0** - Reactive programming
- **Zone.js 0.15.0** - Change detection

### UI Framework & Styling
- **PrimeNG 19.1.2** - Modern Angular UI components
- **PrimeFlex 4.0.0** - CSS utilities
- **PrimeIcons 7.0.0** - Icon library
- **@primeng/themes 19.1.2** - Advanced theming with Aura preset
- **Tailwind CSS (via tailwindcss-primeui 0.6.1)** - Custom styling utilities

### Authentication & Security
- **Auth0 Angular 1.11.0** - Enterprise authentication
- **auth0-js 9.19.1** - Auth0 JavaScript SDK

### Maps & Visualization
- **Mapbox GL 2.15.0** - Interactive maps
- **Mapbox GL Draw Circle 1.1.2** - Drawing tools
- **Mapbox GL Draw Rectangle Mode 1.0.4** - Shape drawing
- **Proj4 2.12.2** - Coordinate system transformations

### Charts & Data Visualization
- **Chart.js 4.3.0** - Flexible charting
- **Highcharts 12.1.2** - Advanced charting
- **Highcharts Angular 4.0.1** - Angular integration

### File Processing & Utilities
- **xlsx 0.18.5** - Excel file processing
- **jsPDF 2.4.0** - PDF generation
- **jsPDF AutoTable 3.8.4** - PDF table generation
- **file-saver 2.0.5** - File download utilities
- **lz-string 1.5.0** - String compression
- **moment 2.29.1** - Date manipulation

### Development Tools
- **Angular CLI 19.0.6** - Build and development tools
- **Webpack 5.97.1** - Module bundling
- **Karma 6.4.0** - Test runner
- **Jasmine 5.4.0** - Testing framework

## 🏗️ Project Structure

```
src/
├── app/
│   ├── core/                    # Core functionality
│   │   ├── cache/              # Caching services (localStorage + IndexedDB)
│   │   ├── guards/             # Route guards (auth, no-auth)
│   │   └── interceptor/        # HTTP interceptors
│   ├── shared/                 # Shared modules and services
│   │   ├── component/          # Reusable components
│   │   ├── service/            # Business services
│   │   ├── primeng/           # PrimeNG module wrapper
│   │   └── lib/               # Constants and utilities
│   ├── pages/                  # Feature pages
│   │   ├── role-management/    # Role CRUD operations
│   │   ├── user-management/    # User management
│   │   └── release-management/ # Release notes
│   └── assets/                 # Static assets
├── environments/               # Environment configurations
└── styles.scss               # Global styles
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm 9+
- Angular CLI 19+

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd itt_portal

# Install dependencies
npm install --force

# Start development server
npm run start
```

### Environment Configuration

Update `src/assets/config.json` with your environment settings:

```json
{
  "profiles": {
    "local": {
      "apiUrl": "http://localhost:8080/api/portal-service/",
      "auth": {
        "domain": "your-domain.auth0.com",
        "clientId": "your-client-id"
      }
    }
  },
  "activeProfile": "local"
}
```

## 🔧 Available Scripts

- `npm start` - Start development server with memory optimization
- `npm run build` - Build for production
- `npm test` - Run unit tests
- `npm run lint` - Run TSLint
- `npm run e2e` - Run end-to-end tests

## 🎨 Features

### Modern Angular 19 Features
- **Standalone Components** - No NgModules required
- **New Control Flow** - `@if`, `@for`, `@switch` syntax
- **Signals** - Reactive state management
- **New Angular DevKit** - Enhanced build system

### Authentication & Authorization
- Auth0 integration with multiple environments
- Route guards for protected routes
- JWT token management
- Role-based access control

### Advanced Caching System
- **Dual Storage Strategy**: localStorage + IndexedDB
- **Configurable TTL**: Time-based cache expiration
- **Persistent Cache**: Survives until logout
- **Force Refresh**: Bypass cache when needed
- **Compression**: LZ-String compression for large data

### Theme & Styling
- **Dark/Light Mode**: Automatic theme switching
- **Custom PrimeNG Presets**: Aura-based theming
- **Dynamic Color Schemes**: Multiple color palette support
- **Responsive Design**: Mobile-first approach

### Internationalization
- Multi-language support (English/French)
- Translation service with dynamic loading
- RTL support for Arabic/Hebrew languages

## 📁 Key Components

### Role Management
- Dynamic role type selection from API
- Comprehensive privilege management
- Status tracking (Active/Inactive)
- CRUD operations with validation

### User Management
- User assignment and role mapping
- Company association management
- Bulk operations support
- Advanced filtering and search

### Navigation & Layout
- Responsive topbar with overflow detection
- Dynamic menu generation
- Theme selector integration
- Language switcher

## 🔒 Security Features

- **HTTP Interceptors**: Request/response transformation
- **Error Handling**: Centralized error management
- **API Security**: Token-based authentication
- **Route Protection**: Guard-based access control

## 🧪 Testing

The project includes comprehensive testing setup:
- Unit tests with Jasmine/Karma
- Component testing
- Service testing
- Integration tests

Run tests with:
```bash
npm test
```

## 🔧 Build Configuration

### Development
```bash
ng serve --configuration=development
```

### Production
```bash
ng build --configuration=production
```

### Build Optimization
- Tree shaking enabled
- Code splitting by routes
- Lazy loading modules
- Bundle analysis available

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Follow the development guidelines in `DEVELOPMENT_GUIDELINES.md`
2. Use Angular 19+ features (control flow, signals)
3. Maintain PrimeNG theming standards
4. Write comprehensive tests
5. Follow TypeScript strict mode

## 📄 License

Commercial License - All rights reserved