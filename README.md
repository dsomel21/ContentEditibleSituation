# ContentEditable Situation

A minimal React/Vue demo illustrating the hidden complexity behind seemingly simple "dynamic variable" editors. 

This project demonstrates how typing, deletion, and chip insertion create DOM mutations that frameworks can't always safely reconcile, exposing the need for custom DOM-managed islands.

## What This Demonstrates

When building editors that allow users to type text and insert dynamic variables (like `{{firstName}}`), the interaction between:
- User typing
- Chip/tag insertion
- Deletion operations

...creates complex DOM mutations that React/Vue's virtual DOM can't always safely reconcile. This project shows why custom DOM-managed islands are necessary for such use cases.

## How It Works

Type text like `Hello {{firstName}}` and watch as the `{{firstName}}` pattern is automatically converted into a Tag component. The challenge lies in maintaining the DOM state while allowing natural typing behavior without breaking the framework's reconciliation process.

## Local Testing

### Prerequisites
- Node.js (v14 or higher recommended)
- npm or yarn

### Setup and Run

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173` (or another port if 5173 is in use).

3. **Build for production:**
   ```bash
   npm run build
   ```
   The built files will be in the `dist` directory.

### Testing the Demo

Once running, try these interactions:
- Type text normally in the editor
- Type `{{firstName}}` or `{{lastName}}` to see variables convert to chips
- Use backspace to delete chips and observe the behavior
- Try typing before, after, and between chips
