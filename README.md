# hive-ui

A lightweight, modern React component library with zero runtime overhead. Built for performance and developer experience.

## Features

- 🚀 **Vite 7.2** - Lightning-fast builds with the latest Vite
- ⚡ **LightningCSS** - Blazing fast CSS processing and minification
- 🌳 **Tree-shakeable** - Auto-injected CSS, only bundle what you use
- 🎨 **CSS Modules** - Scoped styling with zero runtime overhead
- 📦 **ES Modules** - Modern, optimized bundle format
- 🔧 **TypeScript** - Full type safety and IntelliSense
- 📖 **Storybook** - Interactive component documentation
- 🧪 **Vitest** - Fast unit and interaction testing
- 🎯 **ESNext target** - Modern, optimized bundle output

## Installation

```bash
npm install hive-ui
# or
pnpm add hive-ui
# or
yarn add hive-ui
```

## Usage

```tsx
import { Button, Dialog } from 'hive-ui';
import { useState } from 'react';

function App() {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      <Button label="Open Dialog" onClick={() => setOpen(true)} />
      <Dialog open={open} onClose={() => setOpen(false)}>
        <h2>Welcome to Hive UI</h2>
        <p>A modern component library for React.</p>
      </Dialog>
    </>
  );
}
```

> **Note**: CSS is automatically injected per component. Only the styles for components you import will be bundled in your app!

## Development

This project uses **pnpm** for package management.

### Prerequisites

- Node.js 16+
- pnpm 8+

### Setup

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Available Scripts

```bash
# Build the library
pnpm build

# Run tests
pnpm test

# Run Storybook (default components)
pnpm storybook

# Run Storybook (Tailwind CSS examples)
pnpm storybook-tailwind

# Lint code
pnpm lint

# Preview production build
pnpm preview
```

## Build Output

The library uses a **tree-shakeable architecture**:
- **ES Modules** - Separate files per component for optimal tree-shaking
- **Auto-injected CSS** - Each component automatically imports its styles
- **Type definitions** - Full TypeScript support
- **Source maps** - For production debugging

When you import a component, you only get:
- The component's JavaScript
- The component's CSS (automatically injected)
- No unused code or styles!

## Tech Stack

### Core
- **React 19** - UI framework
- **TypeScript 5.9** - Type safety
- **Vite 7** - Build tool

### Build Optimization
- **LightningCSS** - Fast CSS processing (10-100x faster than PostCSS)
- **ESNext target** - Smaller, more efficient bundles
- **Source maps** - Production debugging support

### Development
- **Storybook 10** - Component development environment
- **Vitest 4** - Unit and interaction testing
- **Playwright** - Browser testing
- **ESLint** - Code quality

### Styling
- **CSS Modules** - Component-scoped styles
- **Tailwind CSS** - Utility-first CSS (Storybook examples)

## Project Structure

```
src/
├── components/
│   └── Button/
│       ├── Button.tsx
│       ├── Button.module.css
│       ├── Button.default.stories.tsx
│       ├── Button.tailwind.stories.tsx
│       └── index.ts
└── index.ts
.storybook/          # Default Storybook configuration
.storybook-tailwind/ # Tailwind CSS examples
dist/                # Build output
```

## Configuration

### Vite
- Lightning-fast CSS transformation
- ESNext build target for modern browsers
- Rollup for optimized production builds
- Source map generation

### TypeScript
- Strict mode enabled
- Path aliases configured
- React JSX support

## Performance

Build optimizations applied:
- ✅ Vite 7 with native CSS processing
- ✅ LightningCSS for faster builds
- ✅ ESNext target for smaller bundles
- ✅ Tree-shaking enabled (`sideEffects: false`)
- ✅ Source maps for debugging

Typical build time: **~400-800ms**

## Browser Support

Targeting modern browsers with ES2022+ support:
- Chrome/Edge 90+
- Firefox 88+
- Safari 15+

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `pnpm test`
5. Submit a pull request

---

Built with ❤️ using Vite 7 and LightningCSS
