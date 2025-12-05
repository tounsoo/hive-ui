import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import '../../../tailwind.css';

const meta = {
    title: 'Components/Button',
    component: Button,
    parameters: {
        layout: 'centered',
        docs: {
            inlineStories: false,
        },
    },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TailwindCompatibility: Story = {
    args: {
        label: 'Tailwind Button',
        className: 'bg-red-600 text-white hover:bg-red-700',
    },
};
