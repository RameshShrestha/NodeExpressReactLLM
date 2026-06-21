# WebLLM - React Frontend

A modern, feature-rich React frontend for interacting with Ollama LLMs with advanced UI/UX features.

![React](https://img.shields.io/badge/react-19.2.0-blue.svg)
![Vite](https://img.shields.io/badge/vite-7.2.4-purple.svg)
![Material-UI](https://img.shields.io/badge/MUI-7.3.6-blue.svg)

## 🌟 Recent Improvements

### ✨ Enhanced Features (Latest Updates)

#### **Avatar Color Fix**
- Fixed Material-UI Avatar component styling
- Replaced Tailwind classes with MUI's `sx` prop for proper color rendering
- Consistent green background (#16a34a) for all chat avatars

#### **Code Block Copy Button**
- Automatic copy-to-clipboard functionality for all code blocks
- Visual feedback with icon change on successful copy
- Smooth animations and hover effects
- Non-intrusive positioning in top-right corner

#### **Custom Scrollbar Styling**
- Modern, minimal scrollbar design
- Removed default arrow buttons
- Transparent track with semi-transparent thumb
- Smooth hover effects
- Cross-browser support (WebKit and Firefox)

#### **Theme Toggle Relocation**
- Moved theme toggle button from App.jsx to CenterContent header
- Positioned next to Help button for better accessibility
- Purple gradient styling to distinguish from other buttons
- Dynamic icon (sun/moon) based on current theme

#### **Dark Mode as Default**
- Application now starts in dark mode by default
- User preferences still saved and restored from localStorage
- Improved initial user experience

## 🎨 UI Components

### Core Components

#### **CenterContent.jsx**
Main chat interface component featuring:
- Real-time message streaming
- File attachment support (images, PDFs, DOCX)
- URL content extraction
- Voice input and text-to-speech
- System message configuration
- Chat history management
- Code block syntax highlighting with copy functionality

#### **RightContent.jsx**
Settings and configuration panel:
- Model selection dropdown
- Voice selection for TTS
- Streaming response toggle
- Auto-read response option
- Chat list management
- New chat creation

#### **ChatList.jsx**
Chat history sidebar:
- List of all chat sessions
- Chat selection and switching
- Delete chat functionality
- Timestamp display

#### **HelpDialog.jsx**
Interactive help and instructions:
- Feature explanations
- Keyboard shortcuts
- Usage tips
- Model capabilities

### Supporting Components

- **AddNewChat.jsx** - Dialog for creating new chat sessions
- **AttachmentPopover.jsx** - File and URL attachment interface
- **BusyBar.jsx** - Loading indicator
- **ChatContainer.jsx** - Message container wrapper
- **ChatHistory.jsx** - Historical chat viewer
- **ConfirmationDialog.jsx** - Reusable confirmation dialogs
- **SystemMessageBox.jsx** - System prompt editor

## 🎨 Styling

### Theme System
- **Dark Mode** (Default): Modern dark theme with gray tones
- **Light Mode**: Clean light theme with white backgrounds
- Persistent theme preference via localStorage
- Smooth transitions between themes

### Custom Styles (index.css)

#### Code Block Styling
```css
- Gradient background (dark gray to black)
- Syntax highlighting support
- Copy button with hover effects
- Rounded corners and shadows
- Horizontal scrolling for long code
```

#### Scrollbar Customization
```css
- 8px thin scrollbar
- Transparent track
- Semi-transparent gray thumb
- Hover opacity increase
- No arrow buttons
```

#### Textarea Styling
```css
- Custom light/dark mode variants
- Integrated send button
- Auto-resize capability
- Focus state styling
```

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Setup

The frontend connects to the backend API at:
- **Development**: `http://localhost:5000`
- **Production**: Configured via Vite proxy

## 📦 Dependencies

### Core
- **react**: ^19.2.0 - UI library
- **react-dom**: ^19.2.0 - DOM rendering
- **vite**: ^7.2.4 - Build tool and dev server

### UI Framework
- **@mui/material**: ^7.3.6 - Material-UI components
- **@mui/icons-material**: ^7.3.6 - Material icons
- **@emotion/react**: ^11.14.0 - CSS-in-JS
- **@emotion/styled**: ^11.14.0 - Styled components

### Utilities
- **javascript-time-ago**: ^2.5.11 - Relative time formatting
- **tailwindcss**: ^4.1.0 - Utility-first CSS

## 🏗️ Project Structure

```
webllm/
├── public/
│   ├── index.html          # HTML template
│   └── myicon.png          # App icon
├── src/
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # React entry point
│   ├── index.css           # Global styles
│   ├── Components/         # React components
│   │   ├── CenterContent.jsx
│   │   ├── RightContent.jsx
│   │   ├── ChatList.jsx
│   │   ├── HelpDialog.jsx
│   │   ├── AddNewChat.jsx
│   │   ├── AttachmentPopover.jsx
│   │   ├── BusyBar.jsx
│   │   ├── ChatContainer.jsx
│   │   ├── ChatHistory.jsx
│   │   ├── ConfirmationDialog.jsx
│   │   └── SystemMessageBox.jsx
│   └── Dataprovider/       # State management
│       ├── DataContext.jsx # Global context
│       └── LocalStorage.js # Storage utilities
├── Dockerfile              # Production container
├── nginx.conf              # Nginx configuration
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind configuration
├── postcss.config.js       # PostCSS configuration
└── package.json            # Dependencies
```

## 🔧 Configuration

### Vite Configuration (vite.config.js)
```javascript
{
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/dataprovider': 'http://localhost:5000'
    }
  }
}
```

### Tailwind Configuration
- Custom color schemes
- Dark mode support
- Responsive breakpoints
- Custom utilities

## 🎯 Key Features

### Chat Interface
- ✅ Real-time streaming responses
- ✅ Message history with timestamps
- ✅ Avatar icons for user/assistant
- ✅ Code syntax highlighting
- ✅ Copy code functionality
- ✅ File attachments (images, documents)
- ✅ URL content extraction
- ✅ Voice input (speech-to-text)
- ✅ Text-to-speech output

### User Experience
- ✅ Dark/Light theme toggle
- ✅ Responsive design
- ✅ Smooth animations
- ✅ Loading indicators
- ✅ Error handling
- ✅ Confirmation dialogs
- ✅ Toast notifications
- ✅ Keyboard shortcuts

### State Management
- ✅ React Context API
- ✅ LocalStorage persistence
- ✅ Optimistic UI updates
- ✅ Efficient re-rendering

## 🐛 Troubleshooting

### Common Issues

**Vite Dev Server Won't Start**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**API Connection Failed**
- Verify backend is running on port 5000
- Check Vite proxy configuration
- Ensure CORS is properly configured

**Theme Not Persisting**
- Check browser localStorage
- Clear cache and reload
- Verify DataContext is properly wrapped

**Code Copy Button Not Working**
- Ensure HTTPS or localhost (clipboard API requirement)
- Check browser permissions
- Verify JavaScript is enabled

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🔒 Security

- Input sanitization for user messages
- File type validation for uploads
- Size limits on attachments
- XSS protection via React's built-in escaping
- CORS configuration

## 🚀 Deployment

### Docker Deployment
```bash
# Build image
docker build -t webllm-frontend .

# Run container
docker run -p 80:80 webllm-frontend
```

### Production Build
```bash
# Create optimized build
npm run build

# Serve with any static server
npx serve -s dist
```

## 📄 License

ISC License

## 👨‍💻 Author

**Ramesh Shrestha**
- Email: fx_ra@hotmail.com

---

**Made with ❤️ using React, Vite, and Material-UI**
