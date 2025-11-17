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
