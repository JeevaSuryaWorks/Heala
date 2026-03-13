# Doctor Appointment App - Run Guide

This project is a React application built with [Vite](https://vitejs.dev/).

## Prerequisites
- **Node.js**: Ensure you have Node.js installed on your machine.
- **npm**: npm is included with Node.js.

## Installation
1. Open your terminal.
2. Navigate to the project directory:
   ```bash
   cd "Heala"
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```

## Running the Development Server
To start the local development server, run:
```bash
npm run dev
```
Once the server starts, it will output a local URL (usually `http://localhost:5173/`). Open this URL in your web browser to view the application.

## Project Structure
- `src/components/`: Reusable React components.
- `src/contexts/`: React context providers for global state management.
- `src/pages/`: Top-level page components for routing.
- `src/services/`: API or business logic services.
- `src/App.jsx`: The root component and main layout containing routing.
- `src/index.css`: Global styles.

## Building for Production
To create a production-ready build, run:
```bash
npm run build
```
The compiled files will be generated in the `dist` directory. You can preview the production build locally by running:
```bash
npm run preview
```
