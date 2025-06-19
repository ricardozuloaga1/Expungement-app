# 🏛️ NY Expungement Helper

A comprehensive web application that helps individuals in New York assess their eligibility for marijuana record expungement and provides professional legal assistance services.

## 🎯 Overview

The NY Expungement Helper is a full-stack web application designed to simplify the complex process of marijuana record expungement in New York State. It combines automated eligibility assessment with premium legal services to provide both free self-help tools and professional attorney assistance.

## ✨ Key Features

### 🔍 **Eligibility Assessment**
- **5-minute interactive questionnaire** covering all NY expungement pathways
- **Smart eligibility analysis** for MRTA automatic expungement, Clean Slate Act sealing, and petition-based relief
- **Automatic timeline calculations** based on conviction and release dates
- **Personalized recommendations** with specific next steps and timelines

### 📄 **Document Generation**
- **Free pre-filled legal documents** for all eligible cases
- **Professional PDF reports** with detailed eligibility analysis
- **Legal templates** for petitions, verification requests, and court filings
- **Downloadable documents** ready for court submission

### 🎓 **Legal Education System**
- **Interactive learning modules** on NY record relief laws
- **Progress tracking** with achievements and badges
- **Comprehensive coverage** of MRTA, Clean Slate Act, and petition procedures
- **Self-paced learning** with quizzes and knowledge checks

### 💼 **Premium Legal Assistance**
- **Two-tier service structure**:
  - **Attorney Consultation ($149)**: 30-min consultation, case review, action plan
  - **Full Legal Service ($299)**: Complete document prep, ongoing support, filing guidance
- **Smart recommendations** based on case complexity
- **Premium dashboard** for case tracking and progress monitoring
- **Remote service delivery** with professional case management

## 🛠️ Technology Stack

### **Frontend**
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for modern, responsive design
- **Wouter** for lightweight routing
- **TanStack Query** for server state management
- **Lucide React** for consistent iconography

### **Backend**
- **Express.js** with TypeScript
- **Drizzle ORM** for type-safe database operations
- **PostgreSQL** for production (with mock storage for development)
- **Express Session** for authentication
- **Zod** for runtime type validation

### **Development Tools**
- **tsx** for TypeScript execution
- **ESLint** and **Prettier** for code quality
- **Git** for version control
- **Node.js 18+** runtime

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ricardozuloaga1/Expungement-app.git
   cd Expungement-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5001`

### Development Setup

The app is configured to run in development mode with:
- **Mock authentication** (automatic login as dev user)
- **In-memory storage** (no database required)
- **Hot module replacement** for fast development
- **TypeScript compilation** with error checking

## 📁 Project Structure

```
Expungement-app/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Route-based page components
│   │   ├── lib/           # Utility functions and configurations
│   │   ├── hooks/         # Custom React hooks
│   │   └── index.css      # Global styles
├── server/                # Backend Express application
│   ├── routes.ts          # API route definitions
│   ├── storage.ts         # Database abstraction layer
│   ├── localAuth.ts       # Development authentication
│   └── index.ts           # Server entry point
├── shared/                # Shared types and schemas
│   └── schema.ts          # Database schema and types
└── package.json           # Dependencies and scripts
```

## 🔧 Configuration

### Environment Variables

For production deployment, set these environment variables:

```bash
# Database (required for production)
DATABASE_URL=postgresql://user:password@host:port/database

# Session security (required for production)
SESSION_SECRET=your-secure-session-secret

# Development mode
NODE_ENV=development
```

### Database Setup (Production)

The app uses Drizzle ORM with PostgreSQL. For production:

1. Set up a PostgreSQL database (recommended providers: Neon, Supabase, Railway)
2. Set the `DATABASE_URL` environment variable
3. Run database migrations (schema will auto-sync with Drizzle)

## 🎮 Usage Guide

### For End Users

1. **Start Assessment**: Click "Start Assessment" to begin the eligibility questionnaire
2. **Complete Questionnaire**: Answer questions about your conviction details and circumstances
3. **Review Results**: Get instant eligibility analysis with personalized recommendations
4. **Download Documents**: Access free pre-filled legal documents for your case
5. **Upgrade to Premium**: Get professional attorney assistance for complex cases

### For Developers

1. **Development**: Use `npm run dev` for local development with hot reloading
2. **Building**: Use `npm run build` to create production builds
3. **Testing**: Test eligibility logic with the built-in test runners
4. **Deployment**: Deploy to any Node.js hosting platform (Vercel, Railway, etc.)

## 🏗️ Architecture

### Frontend Architecture
- **Component-based** React architecture with TypeScript
- **Custom hooks** for authentication, API calls, and state management
- **Responsive design** with mobile-first approach
- **Progressive enhancement** with graceful fallbacks

### Backend Architecture
- **RESTful API** design with Express.js
- **Type-safe** database operations with Drizzle ORM
- **Modular storage** system supporting both mock and real databases
- **Session-based authentication** with development and production modes

### Data Flow
1. User completes questionnaire → Frontend validation → API request
2. Server processes eligibility logic → Database storage → Response with results
3. Frontend displays results → Document generation → Premium service options

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes** with proper TypeScript types
4. **Test thoroughly** in development mode
5. **Commit with clear messages**: `git commit -m "feat: add new feature"`
6. **Push and create a pull request**

### Code Standards

- **TypeScript** for all new code
- **ESLint** configuration for code quality
- **Responsive design** for all UI components
- **Comprehensive error handling** for all API endpoints
- **Clear documentation** for complex logic

## 📄 Legal Compliance

### Important Disclaimers

- **Not Legal Advice**: This application provides information and tools but does not constitute legal advice
- **NY Law Specific**: Designed specifically for New York State marijuana expungement laws
- **Professional Review Recommended**: Complex cases should always be reviewed by qualified attorneys
- **User Responsibility**: Users are responsible for verifying information and filing requirements

### Data Privacy

- **Minimal Data Collection**: Only collects information necessary for eligibility assessment
- **Secure Storage**: All user data is encrypted and securely stored
- **No Sharing**: User information is never shared with third parties without consent
- **User Control**: Users can delete their data at any time

## 📞 Support

### For Users
- **In-App Help**: Use the help tooltips and guidance throughout the application
- **Premium Support**: Premium subscribers get direct attorney access
- **Documentation**: Comprehensive legal education modules available

### For Developers
- **GitHub Issues**: Report bugs and request features via GitHub issues
- **Documentation**: Refer to inline code comments and TypeScript types
- **Community**: Join discussions in the repository

## 📈 Roadmap

### Upcoming Features
- **Payment Integration**: Stripe integration for premium services
- **Attorney Dashboard**: Case management interface for legal professionals
- **Multi-State Support**: Expansion to other states' expungement laws
- **Mobile App**: Native mobile application for iOS and Android
- **API Access**: Public API for legal aid organizations

### Long-term Vision
- **Comprehensive Legal Platform**: Expand beyond expungement to other legal services
- **AI-Powered Assistance**: Enhanced document generation and legal analysis
- **Community Features**: User forums and peer support networks
- **Professional Network**: Directory of participating attorneys and legal aid organizations

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **New York State Legislature** for progressive expungement laws
- **Legal Aid Organizations** for guidance on user needs and workflows
- **Open Source Community** for the excellent tools and libraries used
- **Beta Users** for testing and feedback during development

---

**Built with ❤️ to help people get a fresh start**

For questions, support, or contributions, please visit our [GitHub repository](https://github.com/ricardozuloaga1/Expungement-app).
