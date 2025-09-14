# Atlantis E-commerce Platform

## 🚀 Project Overview

**Lovable Project URL**: https://lovable.dev/projects/bcb1c4b5-98be-4432-b045-2bf9a24e6860

An integrated e-commerce system with affiliate marketing and multi-store support built with React, TypeScript, and Supabase.

## 🛠️ Local Development Setup

### Prerequisites
- Node.js 18+ ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- npm or yarn

### Quick Start

```bash
# 1. Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# 2. Install dependencies
npm install

# 3. Setup environment variables (for local development only)
cp .env.example .env
# Edit .env and add your Supabase credentials

# 4. Start development server
npm run dev
```

### 🔐 Environment Variables

**⚠️ IMPORTANT SECURITY NOTES:**
- **NEVER** commit `.env` files to git
- Use `.env.example` as a template
- In production, use Supabase Secrets instead of `.env` files

For local development outside of Lovable:
1. Copy `.env.example` to `.env`
2. Fill in your Supabase project URL and anon key
3. Get these values from your Supabase dashboard

### 📝 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🔄 Development Workflow

### Using Lovable (Recommended)
Simply visit the [Lovable Project](https://lovable.dev/projects/bcb1c4b5-98be-4432-b045-2bf9a24e6860) and start prompting. Changes are automatically committed to this repo.

### Using Local IDE
All changes pushed to this repo will automatically sync to Lovable.

### Branch & PR Workflow
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: your feature description"

# Push and create PR
git push origin feature/your-feature-name
```

### GitHub Integration
- **Direct GitHub Editing**: Edit files directly on GitHub
- **Codespaces**: Use GitHub Codespaces for cloud development
- **Automatic Sync**: All changes sync bidirectionally with Lovable

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/bcb1c4b5-98be-4432-b045-2bf9a24e6860) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
