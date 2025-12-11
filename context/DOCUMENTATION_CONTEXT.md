# Documentation Context

This document serves as a guide for writing and maintaining documentation in the Hive UI library.

## Tone and Style
- **Technical yet accessible**: Write for developers. precise but easy to understand.
- **Concise**: Avoid fluff. Get straight to the point.
- **Explicit**: Don't assume knowledge of internal decisions. Explain *why* things work the way they do.

## Structure
Standard MDX files should follow this structure:

1.  **Date/Meta**: Standard Storybook meta import.
2.  **Title**: Component name.
3.  **Description**: Broad overview of the component.
4.  **Import**: Code snippet showing how to import the component.
5.  **Props**: Table or description of key props.
6.  **Usage**: Examples of common use cases.
7.  **Accessibility**: Specific accessibility features, requirements, or behaviors.
8.  **Internal Design / Architecture**: (Optional but recommended) Explanation of non-obvious implementation details (e.g., event handling, DOM structure choices, state management).

## Component Specific Guidelines

### Internal Design & Choices
We must document *why* we made certain choices.
- **Stretched Links**: Explain the "overlay" pattern for Cards and comparable components.
- **Scroll Locking**: Document how we handle `document.body` styles (e.g., ref-counting).
- **Control Flow**: Explain how state is managed if it's not obvious (e.g., `resetOnClose` in Dialogs).

### Accessibility (a11y)
**This section is critical and must be comprehensive.**
- **Semantic HTML**: Explicitly state which native elements are used and why (e.g., `<dialog>` for focus features).
- **Keyboard Support**: List supported keys and their behaviors (e.g., `Enter`, `Space`, `Escape`, `Tab`).
- **Screen Reader Experience**: Explain how the component is announced (e.g., labels, state changes like `aria-expanded`).
- **Focus Management**: Detail any custom focus logic (trap, restore, auto-focus).
- **Requirements**: clearly state any required props for a11y (e.g., `aria-label` on icon-only buttons).
