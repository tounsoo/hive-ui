# Component Development

All components in Hive UI follow a strict file structure to maintain consistency and scalability.

## Development Guidelines
Before implementing any component or feature, **ALWAYS check the versions of your dependencies** (e.g., in `package.json`).
- Verify the React version (e.g., React 19 may imply using `ref` prop over `forwardRef`).
- Verify Storybook, Tailwind, or other utility versions to ensure compatibility.
- Don't assume legacy patterns; prefer modern approaches supported by the installed versions.

## Accessibility Requirements
**Full Accessibility Coverage is Mandatory.**
- **Semantic HTML**: Always use the correct HTML5 elements (`<button>`, `<a>`, `<dialog>`, `<input>`, etc.).
- **Keyboard Navigation**: Ensure all interactive elements are reachable and usable via keyboard.
- **Screen Reader Support**: Verify proper ARIA attributes, labels, and roles.
- **Focus Management**: Handle focus trapping (modals) and restoration appropriately.
- **Automated Testing**: Use `storybook-addon-a11y` or similar tools to catch basic violations.
- **Focusable Disabled Elements**: Avoid `disabled` attribute if the element needs to remain focusable for screen reader users. Use `aria-disabled="true"` and `aria-disabled` styling hooks instead. Ensure to prevent interactions (clicks, keypresses) manually.

## TypeScript Guidelines
**Robust and Type-Safe Code is Mandatory.**
- **No `any`**: Never use the `any` type. If dynamic content is truly unknown, use `unknown` and narrow it safely.
- **Strict Interfaces**: Define precise interfaces for all props and state.
- **Discriminated Unions**: Use discriminated unions for polymorphic props (e.g., a component that renders as `<a>` vs `<button>`). behavior matches the props.
- **String Unions vs Enums**: Prefer union strings (`'small' | 'medium' | 'large'`) over TypeScript Enums.
  - **Open-ended Unions**: If you need to allow specific values *plus* any string (while keeping autocomplete), use the `(string & {})` hack: `type MyType = 'known' | (string & {});`.
- **HTML Attributes**: Extend standard React HTML attributes (e.g., `React.ButtonHTMLAttributes<HTMLButtonElement>`) when building wrappers around native elements to preserve standard API compatibility.

## Implementation Standards
Derived from existing robust components (`Button`, `Card`, `Dialog`):

### 1. Style Encapsulation
-   **CSS Layers**: Wrap all component styles in `@layer components` to ensure proper cascading order with Tailwind or other global styles.
-   **Naming**: Use camelCase class names (e.g., `.overlay`, `.interactive`) to match `styles.className` usage.
-   **No Global Variables**: **Do not assume the existence of global CSS variables** (e.g., `var(--text-primary)`). Unless the project explicitly defines a global theme, use hardcoded values (hex, rem) or defined project tokens. This ensures components are self-contained and portable.
-   **Units**: Prioritize `rem` over `px` for spacing, sizing, and borders to ensure accessibility and respect user settings (e.g., `0.0625rem` instead of `1px`).
-   **Color Syntax**: Prefer Hex codes (e.g., `#3b82f6`) for solid colors. For alpha transparency or relative color manipulation, **prioritize standard CSS `color()` function** (e.g., `color(from #3b82f6 srgb r g b / 0.2)`) over legacy formats like `rgba()` or `hsla()`.
-   **Focus Ring**: Use the "Double Inset" standard (Blue Border > White Gap > Faint Ring).
    -   **Concept**:
        1.  **Blue Edge**: 0.0625rem solid blue `#3b82f6` (via Border or Inset Shadow).
        2.  **White Gap**: 0.0625rem solid white `#fff` (via Inset Shadow).
        3.  **Faint Ring**: 0.125rem solid faint blue `color(from #3b82f6 srgb r g b / 0.2)` (via Outset Shadow).
    -   **Implementation**:
        -   **With Border** (Input, Card): `border-color: #3b82f6; box-shadow: inset 0 0 0 0.0625rem #fff, 0 0 0 0.125rem color(from #3b82f6 srgb r g b / 0.2); outline: none;`
        -   **Without Border** (Button): `box-shadow: inset 0 0 0 0.0625rem #3b82f6, inset 0 0 0 0.125rem #fff, 0 0 0 0.25rem color(from #3b82f6 srgb r g b / 0.2); outline: none;`
    -   **Selector**: Use `:focus-visible`.
    -   **Selector**: Use `:focus-visible`.


### 2. Form Components
-   **Strict Identity**: All form fields MUST require `id` or `name` props to ensure they can be correctly associated with labels and forms.
-   **Pure Components**: Prefer creating "pure" input components that style the native element directly, rather than wrapping them in heavy layout containers (like `div.input-group`). Composition should be handled by the consumer or separate layout components.

### 3. Polymorphic Components
- **Patterns**: Use **Discriminated Unions** for components that can render different root elements based on props (see `ButtonProps` in `Button/Button.tsx`).
- **Safety**: Ensure invalid prop combinations are impossible by type definition (e.g., `href` implies `<a>` props, preventing `onClick` if not supported).

### 3. Native Element Enhancement
- **Principle**: Whenever possible, wrap native HTML elements (`<dialog>`, `<button>`) rather than re-inventing them with `<div>`.
- **Extension**: Extend the native props interface (e.g., `interface DialogProps extends DialogHTMLAttributes<HTMLDialogElement>`) to inherit standard attributes like `id`, `style`, `aria-*`.

## Directory Layout

Each component resides in its own directory under `src/components/[ComponentName]`.

```text
src/components/[ComponentName]/
├── [ComponentName].tsx                  # Main component implementation
├── [ComponentName].module.css           # CSS Modules for styling (default)
├── [ComponentName].default.stories.tsx  # Standard Storybook stories
├── [ComponentName].tailwind.stories.tsx # Storybook stories for Tailwind integration
├── [ComponentName].mdx                  # Documentation (Props, Usage, Accessibility)
└── index.ts                             # Public API export
```

## File Responsibilities

### `[ComponentName].tsx`
- Defines the React component.
- Accepts `ref` directly as a prop (React 19+).
- **Avoid** `forwardRef` as it is deprecated in React 19.
- Imports styles from the module CSS file.
- Defines and exports `[ComponentName]Props`.

### `[ComponentName].module.css`
- Contains standard CSS.
- Scoped to the component via CSS Modules.
- Should avoid global selectors.

### `[ComponentName].default.stories.tsx`
- Uses the default CSS Module styling.
- Covers all major states (default, hover, active, disabled).
- Includes interaction tests (play functions) where applicable.

### `[ComponentName].tailwind.stories.tsx`
- demonstrating that the component can also work with utility classes (if supported) or just to have a separate test suite for tailwind integration if needed.

### `[ComponentName].mdx`
- See `context/DOCUMENTATION_CONTEXT.md` for details.
- The single source of truth for documentation.

### `index.ts`
- Re-exports the component and its props.
- `export { ComponentName, type ComponentNameProps } from './ComponentName';`
