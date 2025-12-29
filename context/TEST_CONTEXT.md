# Testing Context

Hive UI uses **Storybook** as the primary testing platform. We leverage Storybook's `play` functions and the `test` runner (powered by Vitest) to execute interaction tests.

## Testing Strategy

1.  **Storybook First**: Write stories for every component and hook.
2.  **Interaction Tests**: Use `play` functions to simulate user behavior (clicks, keyboard navigation) and assert DOM states.
3.  **Visual Regression**: (Optional/Future) Chromatic or similar tools can use these stories.
4.  **Unit Logic**: For pure logic that is hard to test via UI, simple Vitest unit tests are acceptable, but prefer testing behaviors via the hook's effect on the DOM in a test component.

## Tools

-   **@storybook/addon-interactions**: For `play` functions.
-   **@storybook/test**: For `expect`, `userEvent`, `within`, `canvasElement`.
-   **Vitest**: Runner for the stories.

## Guidelines

-   **Accessibility**: Always check for a11y violations (handled by `addon-a11y`, but explicit checks in `play` are good too).
-   **Selectors**: Use accessible selectors (`getByRole`, `getByLabelText`) from `@storybook/test` (which re-exports `@testing-library/dom`).
-   **Mocking**: Use `fn()` from `@storybook/test` to mock callbacks and assert they are called.
