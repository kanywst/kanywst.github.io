# kanywst's Terminal Portfolio

A modern, elegant terminal-style self-introduction web application built with 2026's cutting-edge technology.

## ✨ Features

- **Terminal UI** with interactive command interface
- **Modern Design** - Glassmorphism, smooth animations, neon accents
- **Command System** - Extensible command architecture with easy customization
- **Built with** - React, TypeScript, Vite, Tailwind CSS, Framer Motion
- **Command History** - Navigate through command history with ↑/↓
- **Responsive** - Works seamlessly on desktop and tablet

## 🎮 Available Commands

### Core Commands
- `whoami` - Show current user
- `about` - Display personal information
- `projects` - List notable projects
- `skills` - Show technical skills
- `contact` - Display contact information
- `social` - Show social media links
- `help` - Show all available commands

### System Commands
- `ls` - List available sections
- `cat [file]` - Read file contents
- `pwd` - Print working directory
- `date` - Show current date/time
- `echo [text]` - Echo text to terminal
- `clear` - Clear terminal screen

## 🚀 Quick Start

### Development
```bash
npm install
npm run dev
```

Visit `http://localhost:5173`

### Build
```bash
npm run build
```

### Preview
```bash
npm run preview
```

## 📝 Customization

### Adding Custom Commands

Edit `src/terminal.ts` in the `registerBuiltInCommands()` method:

```typescript
this.register('mycommand', () => 'My custom output');
```

### Updating Profile Information

Edit `src/config.ts`:

```typescript
const config: CommandConfig = {
  profile: {
    name: 'your-name',
    title: 'Your Title',
    bio: 'Your bio',
    // ... more fields
  },
  // ... rest of config
};
```

### Styling

The app uses Tailwind CSS for styling. Customize colors and animations in `tailwind.config.ts`.

## 🛠️ Tech Stack

- **Frontend Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4 + Framer Motion
- **Node Runtime**: Node 20+

## 📦 Project Structure

```
src/
├── components/
│   └── TerminalUI.tsx      # Main terminal component
├── config.ts               # Profile & command config
├── terminal.ts             # Command system logic
├── App.tsx                 # Root component
├── main.tsx                # Entry point
└── index.css               # Global styles
```

## 🌐 Deployment

This project is deployed to GitHub Pages via GitHub Actions.

### Manual Deploy
```bash
npm run build
# The dist/ folder contains your static site
```

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to fork, modify, and use this project as a template for your own portfolio!

---

**Made with ❤️ by kanywst**
