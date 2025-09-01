# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NEXQ is an Angular 17 web application built with standalone components, using modern web technologies for animations and styling. The project follows Angular best practices and includes server-side rendering (SSR) support.

## Technology Stack

- **Angular 17**: Uses standalone components architecture
- **Angular Material**: UI component library
- **SCSS**: Styling with component-scoped styles
- **Tailwind CSS**: Utility-first CSS framework
- **Animations**: AOS (Animate On Scroll), GSAP, Anime.js, Three.js
- **TypeScript**: Strict typing enabled
- **ESLint**: Code linting with Angular ESLint rules

## Common Development Commands

### Development
- `ng serve` or `npm start` - Start development server (localhost:4200)
- `ng build --watch --configuration development` or `npm run watch` - Build with file watching

### Build & Production
- `ng build` or `npm run build` - Build for production
- `npm run serve:ssr:NEXQ` - Serve SSR production build

### Testing & Quality
- `ng test` or `npm test` - Run unit tests with Karma/Jasmine
- `ng lint` or `npm run lint` - Run ESLint on TypeScript and HTML files

### Code Generation
- `ng generate component component-name` - Generate new component
- `ng generate service service-name` - Generate new service

## Project Architecture

### Component Structure
```
src/app/
├── animations/          # Custom animation components
├── directives/         # Custom directives (e.g., title-animation)
├── layouts/           # Layout components (main-layout)
├── features/          # Feature-specific components
├── services/          # Shared services
└── assets/           # Static assets (images, etc.)
```

### Key Architectural Patterns

- **Standalone Components**: All components use the standalone: true pattern
- **Main Layout Pattern**: Uses MainLayoutComponent as the primary layout wrapper
- **Animation Integration**: AOS is globally initialized in AppComponent with mobile-responsive settings
- **Platform Detection**: Uses PLATFORM_ID injection for SSR compatibility
- **Route Management**: MainLayoutComponent handles global route changes and scroll behavior

### Important Implementation Details

- **AOS Configuration**: Mobile-optimized settings with shorter durations/delays for smaller screens
- **SSR Support**: Platform detection implemented for browser-specific code
- **Styling**: Combination of Angular Material, Tailwind CSS, and component SCSS
- **Bundle Optimization**: Configured with specific budgets (2MB initial, 5MB max)

### Linting & Code Style

- ESLint configuration includes Angular-specific rules
- TypeScript strict mode enabled
- Component style language set to SCSS
- File patterns for linting: `src/**/*.ts` and `src/**/*.html`

## Testing Configuration

- **Framework**: Jasmine with Karma runner
- **Coverage**: Karma coverage reports enabled
- **Browser**: Chrome launcher for testing
- **Assets**: Same asset configuration as build process