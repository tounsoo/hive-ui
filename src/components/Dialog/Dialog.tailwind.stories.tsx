import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Dialog } from './Dialog';
import { Button } from '../Button';
import '../../../tailwind.css';

const meta = {
    title: 'Components/Dialog',
    component: Dialog,
    parameters: {
        layout: 'centered',
        docs: {
            inlineStories: false,
        },
    },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof Dialog>;

export const TailwindCompatibility: Story = {
    render: function TailwindCompatibilityRender() {
        const [open, setOpen] = useState(false);
        return (
            <>
                <Button label="Open Tailwind Dialog" onClick={() => setOpen(true)} />
                <Dialog
                    open={open}
                    onClose={() => setOpen(false)}
                    className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 shadow-2xl"
                >
                    <h2 className="text-2xl font-bold text-purple-900 mb-4">Tailwind Styled Dialog</h2>
                    <p className="text-gray-700 mb-6">
                        This dialog demonstrates Tailwind CSS compatibility with custom styling.
                    </p>
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={() => setOpen(false)}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </Dialog>
            </>
        );
    },
};
