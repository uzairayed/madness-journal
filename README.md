# Madness Journal

A unique digital journaling application with multiple writing modes that transform your thoughts into different realities. Built with Next.js 15, React 19, TypeScript, Tailwind CSS, and Firebase.

## 🌟 Features

### Multiple Journaling Modes
- **Madness Journal**: Progressive text corruption with visual glitches
- **Time-Locked Mode**: Entries locked for specific durations
- **Echo Mode**: Words echo back with variations
- **Shadow Journaling**: Hidden layers of text
- **Irreversible Mode**: Once written, cannot be edited (backspace disabled)
- **Alternative Reality Mode**: Parallel versions in different realities

### Core Features
- 🔐 Google Authentication via Firebase
- ✍️ Real-time typing sound effects
- 🎨 Dark ambient theme with glassmorphism effects
- 💾 Cloud storage with Firestore
- 📱 Responsive design
- ⚡ Real-time corruption effects

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- Firebase project

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd madness-journal
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up Firebase**
   - Create a new Firebase project
   - Enable Google Authentication
   - Create a Firestore database
   - Get your Firebase configuration

4. **Environment Variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Fill in your Firebase configuration in `.env.local`:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
madness-journal/
├── app/                    # Next.js App Router
│   ├── auth/              # Authentication pages
│   ├── read/              # Read diary entries
│   ├── write/             # Write diary entries
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Shadcn/ui components
│   └── firebase-auth-provider.tsx
├── lib/                  # Utility functions
│   ├── firebase.ts       # Firebase configuration
│   └── utils.ts          # Helper functions
└── public/               # Static assets
```

## 🎮 Usage

1. **Sign In**: Use Google authentication to access your journal
2. **Choose Mode**: Select from various journaling modes
3. **Write**: Start typing with real-time effects
4. **Save**: Your entries are automatically saved to the cloud
5. **Read**: Revisit your past entries and explore alternate realities

## 🔧 Technical Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3.4.0
- **UI Components**: Shadcn/ui
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **Fonts**: Geist Sans & Geist Mono
- **Icons**: Lucide React

## 🎨 Theme

The application features a dark ambient theme with:
- Deep blue-gray backgrounds
- Vibrant purple accents
- Glassmorphism effects
- Floating particle animations
- Custom CSS animations

## 🔒 Security

- Environment variables are properly configured
- Firebase security rules should be set up
- No sensitive data is exposed in the codebase
- Authentication is handled securely

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🐛 Troubleshooting

### Common Issues

1. **Firebase Connection Error**
   - Verify environment variables are set correctly
   - Check Firebase project configuration
   - Ensure Firestore is enabled

2. **Authentication Issues**
   - Verify Google OAuth is enabled in Firebase
   - Check authorized domains in Firebase console

3. **Styling Issues**
   - Clear browser cache
   - Restart development server
   - Check Tailwind CSS configuration

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**"The mind is its own place, and in itself can make a heaven of hell, a hell of heaven."** - John Milton 