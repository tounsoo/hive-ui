import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';
import '../../../tailwind.css';

const meta = {
    title: 'Components/Card',
    component: Card,
    parameters: {
        layout: 'centered',
    },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof Card>;

export const TailwindStyled: Story = {
    args: {
        children: (
            <div>
                <h3 className="text-xl font-bold text-indigo-900 mb-2">Tailwind Card</h3>
                <p className="text-slate-600 mb-4">
                    This card uses Tailwind CSS utility classes to override default styles (like background, border) and style the content.
                </p>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">
                    Action
                </button>
            </div>
        ),
        // Overriding/Adding styles via Tailwind classes
        className: 'bg-indigo-50 !border-indigo-200 shadow-lg max-w-sm',
    },
};

export const TailwindInteractive: Story = {
    args: {
        onClick: () => alert('Clicked!'),
        'aria-label': 'Tailwind Interactive Card',
        children: (
            <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-2xl">
                    ✓
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Task Completed</h3>
                    <p className="text-sm text-gray-500">Click to view details</p>
                </div>
            </div>
        ),
        className: 'hover:!bg-green-50 hover:!border-green-300 transition-all !duration-300',
        style: { width: '350px' },
    },
};
