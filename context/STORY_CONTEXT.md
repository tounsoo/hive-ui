# Storybook Context

This document defines the standards for writing Storybook stories (`*.stories.tsx`) in the Hive UI library.

## General Principles
- **CSF3**: We use the Component Story Format 3.0 (Object-based stories).
- **TypeScript**: All stories must be strongly typed.
- **Interactivity**: Use `play` functions to test user interactions.

## File Structure

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Component } from './Component';

// 1. Meta Definition
const meta = {
    title: 'Components/Component',
    component: Component,
    parameters: {
        layout: 'centered', // 'centered' for components, 'padded' for layouts/hooks
    },
    argTypes: {
        // Define controls here
    },
} satisfies Meta<typeof Component>;

export default meta;

// 2. Story Type Alias
// Infer the Story type from the specific Meta definition to ensure args match
type Story = StoryObj<typeof meta>;

// 3. Stories
export const Default: Story = {
    args: {
        // Props
    },
};
```

## detailed Guidelines

### 1. Meta Definition
- **Type**: Use `satisfies Meta<typeof Component>` at the end of the object. This is preferred over `const meta: Meta<typeof Component>` as it allows TS to infer the exact shape of `meta` for the `Story` type alias.
- **Title**: Use pascal case categories: `Components/Name`, `Hooks/Name`, `Patterns/Name`.

### 2. Story Type
- **Components**: `type Story = StoryObj<typeof meta>;`
  - Requires `meta` to have a `component` property.
  - **Constraint**: If your component has required props (e.g., `children`, `open`), you *must* provide them in `meta.args` or explicitly in every story, otherwise TS will error.
- **Hooks / No Component**: `type Story = StoryObj<PropsInterface>;`
  - When there is no `component` in meta (e.g. hooks), `typeof meta` cannot infer props. Use the explicit props interface.

### 3. Rendering
- **Components**: Prefer using `args` for simple prop passing.
- **Hooks / Complex State**: Use a `render` function if you need to manage local state (e.g., `useState` for Dialogs) or wrap components.
  ```tsx
  render: (args) => {
      // args will be typed correctly based on your Story alias
      const [isOpen, setIsOpen] = useState(false);
      return <Component {...args} open={isOpen} />;
  }
  ```

### 4. Interaction Tests (Play Function)
- Use `@storybook/test` (which wraps `testing-library`).
- **Queries**: Use `within(canvasElement)` to scope queries.
- **Actions**: Use `userEvent` for clicking/typing.
- **Assertions**: Use `expect` for validation.

### 5. Args & Controls
- **Explicit Args**: Define `argTypes` in `meta` to create nice controls (e.g., specific select options, ranges).
- **Actions**: Use `fn()` from `@storybook/test` for event handlers (`onClick`, `onClose`) to verify calls in the Actions panel.

## MDX Integration
- We use manual `*.mdx` files for comprehensive documentation.
- The `*.stories.tsx` file serves as the *source of truth* for the examples rendered in the MDX via `<Canvas of={Stories.Name} />`.
