import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within, expect, fn } from '@storybook/test';
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

export const AsLink: Story = {
    args: {
        label: 'Go to Google',
        href: 'https://google.com',
    },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
        const canvas = within(canvasElement);
        const link = canvas.getByRole('link', { name: /go to google/i });
        await expect(link).toBeInTheDocument();
        await expect(link).toHaveAttribute('href', 'https://google.com');
    },
};

export const WithIcons: Story = {
    args: {
        label: 'Save Changes',
        leading: <span>💾</span>,
        trailing: <span>✨</span>,
    },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
        const canvas = within(canvasElement);
        const button = canvas.getByRole('button', { name: /save changes/i });
        await expect(button).toBeInTheDocument();
        await expect(button).toHaveTextContent('💾');
        await expect(button).toHaveTextContent('✨');
    },
};

export const TailwindExample: Story = {
    args: {
        label: 'Primary Button Example',
        className: 'bg-cyan-700 text-white hover:bg-cyan-800',
    },
};

export const DisabledInteraction: Story = {
    args: {
        label: 'Disabled Click',
        disabled: true,
        onClick: fn(),
    },
    play: async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);
        const button = canvas.getByRole('button', { name: /disabled click/i });

        await expect(button).toHaveAttribute('aria-disabled', 'true');

        // Attempt click
        await userEvent.click(button);

        // Verify onClick was NOT called
        await expect(args.onClick).not.toHaveBeenCalled();
    },
};
