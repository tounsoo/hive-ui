import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { Input } from './Input';

const meta = {
    title: 'Components/Input',
    component: Input,
    parameters: {
        layout: 'centered',
    },
    args: {
        placeholder: 'Enter text here...',
        id: 'input-default',
    },
    argTypes: {
        error: { control: 'boolean' },
        disabled: { control: 'boolean' },
    },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Placeholder: Story = {
    args: {
        placeholder: 'This is a placeholder',
        id: 'input-placeholder', // unique id
    },
};

export const Disabled: Story = {
    args: {
        disabled: true,
        value: 'Disabled input',
        id: 'input-disabled',
    },
};

export const ErrorState: Story = {
    args: {
        error: true,
        defaultValue: 'Invalid input',
        id: 'input-error',
    },
};

/**
 * Example of composing the Input with a native Label.
 */
export const WithLabel: Story = {
    render: (args) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '300px' }}>
            <label htmlFor="input-with-label" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                Email Address
            </label>
            <Input id="input-with-label" {...args} />
        </div>
    ),
    args: {
        placeholder: 'user@example.com',
        id: 'input-with-label-args',
    },
};

export const Interaction: Story = {
    args: {
        placeholder: 'Type something...',
        id: 'input-interaction',
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const input = canvas.getByRole('textbox');

        await expect(input).toBeVisible();

        // Test focus
        await userEvent.click(input);
        await expect(input).toHaveFocus();

        // Test typing
        await userEvent.type(input, 'Hello World');
        await expect(input).toHaveValue('Hello World');
    },
};
