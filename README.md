# HMM ITB Learning Management System

A comprehensive Learning Management System and community platform for **Himpunan Mahasiswa Mesin (HMM) Institut Teknologi Bandung**. Originally developed as a course management platform, it has evolved into a full-featured web application serving the entire HMM ITB community.

🌐 **Live at:** [hmmitb.com](https://hmmitb.com)

---

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## 🎯 About

HMM-LMS is a modern web application built to serve the academic and community needs of Himpunan Mahasiswa Mesin at Institut Teknologi Bandung. The platform provides a centralized hub for learning activities, community events, announcements, and administrative tasks.

**Primary Use Case:** Mobile-first experience for students and members, with comprehensive admin panel for content management.

---

## ✨ Features

### 🛡️ **Security \& Account Controls**

- Email verification after sign-up for security
- Reset password on login page by email

### 📚 **Course Management**

- Complete course lifecycle management with titles, descriptions, and class codes
- Learning session tracking with duration monitoring
- Resource attachment system supporting multiple file types and external links
- Course testimonials and 5-star rating system
- Student enrollment and progress tracking

### 📝 **Assessment \& Tryout System**

- Practice exam platform with multiple question types:
  - Multiple choice (single and multiple answers)
  - Short answer questions
  - Long answer (essay) questions
- Rich media support for questions and explanations
- Automated scoring with detailed feedback
- Performance analytics and history tracking
- Image integration for visual questions

### 📅 **Event Management**

- Flexible event system with multiple operational modes:
  - **Basic Events:** Simple event listings without tracking
  - **RSVP-only:** Event registration with custom form fields
  - **Attendance Tracking:** Event check-in management
  - **Combined Mode:** RSVP with attendance verification
- Timeline support for multi-stage events
- Custom RSVP forms with configurable fields
- Google Sheets integration for data export and analysis
- Event calendar with timezone support (UTC+7)

### 📢 **Communication Hub**

- Global and course-specific announcements
- Rich text editor with advanced formatting (powered by TipTap)
- Reply and discussion threads on announcements
- Image attachments and media embedding
- Real-time push notifications for important updates

### 📋 **Dynamic Forms System**

- Flexible form builder with multiple question types
- Support for surveys, registrations, and feedback collection
- Conditional logic and form validation
- Response analytics and export capabilities
- Integration with other platform features
- Collaboration by invite other admin users to manage form

### 🔗 **Link Shortener**

- URL shortening service for easy sharing
- Click analytics and tracking
- Geographic location tracking for link clicks
- Custom short codes support

### 💼 **Administrative Features**

- Role-based access control (Student, Admin, Superadmin)
- Job vacancy ("loker") posting and management
- Scholarship information system
- Resource library with access logging
- Comprehensive dashboard with analytics

### 📱 **Progressive Web App (PWA)**

- Installable on mobile devices
- Offline capability support
- App-like mobile experience
- Service worker integration
- Web push notifications

### 🔔 **Push Notification System**

- Real-time notifications for:
  - New events and announcements
  - Course updates and materials
  - Tryout availability
  - Form submissions and deadlines
  - Administrative updates
- Service worker-based delivery
- Customizable notification preferences

---

## 🛠 Tech Stack

### **Core Framework**

- **[Next.js 16](https://nextjs.org/)** - React framework with App Router
- **[TypeScript 7](https://www.typescriptlang.org/)** - Type-safe development
- **[tRPC](https://trpc.io/)** - End-to-end typesafe APIs
- **[TanStack Query](https://tanstack.com/query/latest)** - Client-side query state management
- **[nuqs](https://nuqs.dev)** - Type-safe search params state manager
- **[Payload CMS](https://payloadcms.com/)** - Headless CMS for content management
- **[Fumadocs](https://fumadocs.dev/)** - Documentation framework

### **Monitoring & Tracking**

- **[Better Stack](https://betterstack.com)** - System Uptime monitoring
- **[Sentry](https://sentry.io/welcome/)** - Error Monitoring and Tracking

### **Database \& ORM**

- **[Prisma](https://www.prisma.io/)** - Next-generation ORM
- **[PostgreSQL](https://www.postgresql.org/)** - Primary database

### **Authentication**

- **[NextAuth.js](https://next-auth.js.org/)** - Authentication solution
- **[Resend](https://resend.com/)** - Email API (email verification and reset password)
- Email/password authentication (SSO support planned)

### **UI \& Styling**

- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Re-usable component library
- **[Lucide React](https://lucide.dev/)** - Beautiful SVG icons
- **[Framer Motion](https://www.framer.com/motion/)** - Animation library
- **[TanStack Table](https://tanstack.com/table/latest)** - Data table component
- **[TipTap](https://tiptap.dev/)** - Rich text editor

### **Form \& Validation**

- **[React Hook Form](https://react-hook-form.com/)** - Form management
- **[Zod](https://zod.dev/)** - Schema validation

### **Storage \& Assets**

- **[AWS S3](https://aws.amazon.com/s3/)** - Object storage for files and media

### **Development Tools**

- **[Bun](https://bun.sh/)** - Fast JavaScript runtime and package manager
- **[Oxlint](https://oxc.rs/)** - Code linting
- **[Oxfmt](https://oxc.rs/)** - Code formatting

---

## 🚀 Getting Started

### Prerequisites

- **Bun** >= 1.0 (or Node.js >= 18.0)
- **PostgreSQL** >= 14
- **AWS S3 account** (for file storage)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/hmm-lms.git
cd hmm-lms
```

2. **Install dependencies**

```bash
bun install
```

3. **Set up environment variables**

```bash
cp .env.example .env
```

Fill in the required environment variables (see [Environment Variables](#environment-variables)) 4. **Set up the database**

```bash
# Generate Prisma client
bun run db:generate

# Run migrations
bun run db:push

# (Optional) Seed initial data
bun run db:seed
```

5. **Run the development server**

```bash
bun run dev
```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
hmm-lms/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── public/
│   ├── icons/                 # PWA icons
│   └── manifest.json          # PWA manifest
├── src/
│   ├── app/                   # Next.js App Router pages
│   ├── components/            # React components
│   ├── server/
│   │   ├── api/              # tRPC routers
│   │   ├── auth/             # Auth configuration
│   │   └── db/               # Database client
│   ├── lib/                   # Utility functions
│   ├── hooks/                 # Custom React hooks
│   └── styles/               # Global styles
├── .env.example              # Environment variables template
└── package.json              # Project dependencies
```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/hmm_lms"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# AWS S3
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="your-region"
AWS_S3_BUCKET="your-bucket-name"

# Web Push (VAPID)
NEXT_PUBLIC_VAPID_PUBLIC_KEY="your-public-vapid-key"
VAPID_PRIVATE_KEY="your-private-vapid-key"

# Optional: External Services
GOOGLE_SHEETS_API_KEY="your-api-key"
```

---

## 🚢 Deployment

The application is deployed at [hmmitb.com](https://hmmitb.com) and supports deployment on:

### **Vercel (Recommended)**

```bash
# Install Vercel CLI
bun add -g vercel

# Deploy
vercel
```

### **DigitalOcean / VPS**

```bash
# Build the application
bun run build

# Start production server
bun run start
```

### **Docker**

```bash
# Build image
docker build -t hmm-lms .

# Run container
docker run -p 3000:3000 hmm-lms
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Contact

**Himpunan Mahasiswa Mesin ITB**

- Website: [hmmitb.com](https://hmmitb.com)
- Email: bccipionirberkarya@gmail.com
- Email 2: itdbccihmmitb@gmail.com

---

## 🙏 Acknowledgments

- Built with the [T3 Stack](https://create.t3.gg/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Sub-bureau Information and Technology Development HMM ITB
- Inspiration from various open-source LMS platforms
- Thanks to all contributors and the HMM ITB community for their support
- Written mostly by [Adi Haditya Nursyam](https://instagram.com/adihnursyam) (GitHub: [@soezyxstt](https://github.com/soezyxstt)), (LinkedIn: [Adi Haditya Nursyam](https://www.linkedin.com/in/adihnursyam/))
- Maintained by [Muhamad Hanif Hafizhan](https://www.instagram.com/nfzhn/) (GitHub: [@EnvoyX](https://github.com/EnvoyX)) (LinkedIn: [Muhamad Hanif Hafizhan](https://www.linkedin.com/in/muhamad-hanif-hafizhan-824313296/)) & [Rahmat Handaru Prayoga](https://www.instagram.com/rahmathandaru_p/) (GitHub: [@Handthere](https://github.com/Handthere)) (LinkedIn: [Rahmat Handaru Prayoga](https://www.linkedin.com/in/rahmat-handaru-prayoga-803973314/))

---

**Made with ❤️ for HMM ITB**
