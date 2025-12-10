import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within, expect } from '@storybook/test';
import { Button } from './Button';

const meta = {
    title: 'Components/Button',
    component: Button,
    parameters: {
        layout: 'centered',
    },

    argTypes: {
        label: { control: 'text' },
    },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        label: 'Button',
    },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
        const canvas = within(canvasElement);
        const button = canvas.getByRole('button', { name: /button/i });
        await expect(button).toBeInTheDocument();
        await expect(button).toBeVisible();
    },
};

export const ClickInteraction: Story = {
    args: {
        label: 'Click Me',
        onClick: () => console.log('Clicked'),
    },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
        const canvas = within(canvasElement);
        const button = canvas.getByRole('button', { name: /click me/i });
        await userEvent.click(button);
        // Note: verifying console log or spy requires setup, but we can verify the button is still there and focused if we want.
        // For now, just ensuring the click action works without error.
        await expect(button).toHaveFocus();
    },
};
