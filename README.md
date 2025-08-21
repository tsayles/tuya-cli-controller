# 🏠 Tuya Device Controller

A modern web application for discovering and controlling Tuya smart home devices. Built with React, TypeScript, and Tailwind CSS, this application provides an intuitive interface for managing your smart home ecosystem.

## ✨ Features

- **Device Discovery**: Automatically scan and discover Tuya devices on your network
- **Device Control**: Turn devices on/off with a single click
- **Real-time Status**: Monitor device online/offline status and power states
- **Modern UI**: Clean, responsive interface with dark/light theme support
- **Persistent Storage**: Remember device configurations across sessions
- **Network Health**: Visual indicators for device connectivity

## 🚀 Quick Start

### Prerequisites

- Node.js 20 or higher
- npm or yarn package manager
- Tuya devices connected to the same network

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tuya-device-controller
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to access the application.

## 🐳 Docker Deployment

### Build and Run with Docker

1. **Build the Docker image**
   ```bash
   docker build -t tuya-controller .
   ```

2. **Run the container**
   ```bash
   docker run -p 80:80 tuya-controller
   ```

3. **Access the application**
   Open `http://localhost` in your browser.

### Using Docker Compose

Create a `docker-compose.yml` file:

```yaml
version: '3.8'
services:
  tuya-controller:
    build: .
    ports:
      - "80:80"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:80/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

Run with:
```bash
docker-compose up -d
```

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # Reusable UI components (shadcn)
│   └── DeviceCard.tsx   # Device-specific components
├── lib/                 # Utilities and API logic
│   ├── tuya-api.ts     # Tuya device API integration
│   ├── types.ts        # TypeScript type definitions
│   └── utils.ts        # Helper functions
├── assets/             # Static assets
├── App.tsx             # Main application component
├── index.css           # Global styles and theme
└── main.tsx            # Application entry point
```

### Environment Configuration

The application uses browser-based device discovery. Ensure your Tuya devices are:
- Connected to the same network as your development machine
- Properly configured with the Tuya Smart app
- Powered on and responsive

## 🔧 Configuration

### Theme Customization

Edit `src/index.css` to customize the application theme:

```css
:root {
  --primary: oklch(0.397 0.174 264.376);    /* Primary brand color */
  --secondary: oklch(0.962 0.001 286.051);  /* Secondary actions */
  --accent: oklch(0.678 0.181 162.48);      /* Success/active states */
  --destructive: oklch(0.704 0.191 22.216); /* Error/warning states */
  --radius: 0.75rem;                        /* Border radius */
}
```

### Device Configuration

The application automatically discovers and stores device configurations using the browser's persistent storage. No manual configuration is required.

## 🚀 Deployment

### CI/CD Pipeline

The project includes a GitHub Actions workflow (`.github/workflows/main.yml`) that:

1. **Code Quality**: Runs linting and type checking
2. **Security Scanning**: Performs vulnerability analysis
3. **Docker Build**: Creates multi-architecture container images
4. **Automated Deployment**: Deploys to staging/production environments

### Production Deployment

1. **Using Docker Hub**
   ```bash
   docker pull ghcr.io/your-username/tuya-controller:latest
   docker run -p 80:80 ghcr.io/your-username/tuya-controller:latest
   ```

2. **Using Kubernetes**
   ```yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: tuya-controller
   spec:
     replicas: 2
     selector:
       matchLabels:
         app: tuya-controller
     template:
       metadata:
         labels:
           app: tuya-controller
       spec:
         containers:
         - name: tuya-controller
           image: ghcr.io/your-username/tuya-controller:latest
           ports:
           - containerPort: 80
   ```

## 🔒 Security

- All communications use HTTPS in production
- Device credentials are stored locally in the browser
- No sensitive data is transmitted to external servers
- Container images are regularly scanned for vulnerabilities

## 🐛 Troubleshooting

### Common Issues

1. **Devices not discovered**
   - Ensure devices are on the same network
   - Check device power status
   - Verify Tuya app configuration

2. **Control commands fail**
   - Check network connectivity
   - Verify device online status
   - Try refreshing the device list

3. **Docker container won't start**
   - Check port availability (80)
   - Verify Docker permissions
   - Review container logs: `docker logs <container-id>`

### Debug Mode

Enable debug logging by adding to your environment:
```bash
DEBUG=tuya:* npm run dev
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all CI checks pass

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Tuya Developer Platform](https://developer.tuya.com/) for device APIs
- [shadcn/ui](https://ui.shadcn.com/) for the component library
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Vite](https://vitejs.dev/) for the build system