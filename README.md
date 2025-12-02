# Ridar - Full Stack Mobile App

Expo React Native frontend + Node.js Express backend + Supabase

## Quick Setup

```bash
# Clone repo
git clone https://github.com/pihuvijay/Ridar.git
cd Ridar

# Install dependencies, need to ensure u do all three
npm install

cd frontend && npm install && cd ..
cd backend && npm install && cd ..

#or do this

npm install && cd frontend && npm install && cd ../backend && npm install && cd ..

# Setup environment
cp backend/.env.example backend/.env
# Add your Supabase keys to backend/.env

# Run development
cd frontend && npm start          # Start Expo app
cd backend && npm run dev         # Start Express server
```

## Structure
- `frontend/` - Expo React Native app
- `backend/` - Node.js Express API
- `shared/` - Shared TypeScript types


# Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "Add your feature"

# Push feature branch
git push origin feature/your-feature-name

# Create pull request on GitHub
# After review, merge to main
git checkout main
git pull origin main
```

# Stop Development

```bash
# Stop Expo app: Ctrl + C
# Stop Express server: Ctrl + C
```