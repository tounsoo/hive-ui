import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { userEvent, within, expect, fn, waitFor } from '@storybook/test';

import { Dialog } from './Dialog';
import { Button } from '../Button';

const meta = {
    title: 'Components/Dialog',
    component: Dialog,
    parameters: {
        layout: 'centered',
    },
    subcomponents: {
        'Dialog.Body': Dialog.Body,
        'Dialog.Sticky': Dialog.Sticky,
        'Dialog.Title': Dialog.Title,
    },

    args: {
        onClose: fn(),
        open: false,
        children: 'Default Content',
    },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: (args) => {
        const [open, setOpen] = useState(false);
        return (
            <>
                <Button label="Open Dialog" onClick={() => setOpen(true)} />
                <Dialog open={open} onClose={() => {
                    setOpen(false);
                    args.onClose();
                }} onCancel={() => console.log('Dialog canceled')}>
                    <Dialog.Body>
                        <Dialog.Title>Dialog Title</Dialog.Title>
                        <p>This is a native dialog element.</p>
                        <div className="flex gap-2 justify-end mt-2">
                            <Button label="Close" onClick={() => setOpen(false)} />
                        </div>
                    </Dialog.Body>
                </Dialog>
            </>
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        // Open the dialog
        const openButton = canvas.getByRole('button', { name: /open dialog/i });
        await userEvent.click(openButton);

        // Verify content is visible - use findByRole to wait for it
        const dialog = await canvas.findByRole('dialog');
        await waitFor(() => expect(dialog).toBeVisible());
        await expect(within(dialog).getByText('Dialog Title')).toBeVisible();

        // Close via button
        const closeButton = within(dialog).getByRole('button', { name: /close/i });
        await userEvent.click(closeButton);

        // Verify dialog is closed
        await waitFor(() => expect(dialog).not.toBeVisible());
    },
};

export const CloseOnBackdrop: Story = {
    render: (args) => {
        const [open, setOpen] = useState(false);
        return (
            <>
                <Button label="Open Dialog" onClick={() => setOpen(true)} />
                <Dialog open={open} onClose={() => {
                    setOpen(false);
                    args.onClose();
                }} onCancel={() => console.log('Dialog canceled')}>
                    <Dialog.Body>
                        <Dialog.Title>Backdrop Test</Dialog.Title>
                        <p>Click outside to close.</p>
                    </Dialog.Body>
                </Dialog>
            </>
        );
    },
    play: async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);

        // Open dialog
        await userEvent.click(canvas.getByRole('button', { name: /open dialog/i }));
        const dialog = await canvas.findByRole('dialog');
        await waitFor(() => expect(dialog).toBeVisible());

        // Click backdrop - click far outside the dialog box, on the backdrop area
        const { fireEvent } = await import('@storybook/test');
        // Click at viewport coordinates that should be outside the centered dialog
        // Using coordinates near the edge of the viewport
        fireEvent.click(dialog, { clientX: 10, clientY: 10 });

        // Verify onClose was called
        await waitFor(() => expect(args.onClose).toHaveBeenCalled());
        await waitFor(() => expect(dialog).not.toBeVisible());
    },
};

export const ClickContentDoesNotClose: Story = {
    render: (args) => {
        const [open, setOpen] = useState(false);
        const [clickCount, setClickCount] = useState(0);
        return (
            <>
                <Button label="Open Dialog" onClick={() => setOpen(true)} />
                <Dialog open={open} onClose={() => {
                    setOpen(false);
                    args.onClose();
                }}>
                    <Dialog.Body>
                        <h2>Content Click Test</h2>
                        <p data-testid="click-counter">Clicked: {clickCount} times</p>
                        <Button
                            label="Inside Action"
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent event bubbling
                                setClickCount(c => c + 1);
                            }}
                        />
                    </Dialog.Body>
                </Dialog>
            </>
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        // Open dialog
        await userEvent.click(canvas.getByRole('button', { name: /open dialog/i }));
        const dialog = await canvas.findByRole('dialog');
        await waitFor(() => expect(dialog).toBeVisible());

        // Click content button - if backdrop logic incorrectly triggers, the button won't work
        const insideButton = within(dialog).getByRole('button', { name: /inside action/i });
        const clickCounter = within(dialog).getByTestId('click-counter');

        // Verify initial state
        await expect(clickCounter).toHaveTextContent('Clicked: 0 times');

        // Click the button multiple times
        await userEvent.click(insideButton);
        await userEvent.click(insideButton);

        // If backdrop click incorrectly closed dialog, state wouldn't update
        // This proves clicking content doesn't trigger backdrop close logic
        await expect(clickCounter).toHaveTextContent('Clicked: 2 times');

        // Dialog should still be functional
        await expect(dialog).toBeVisible();
        await expect(insideButton).toBeEnabled();
    },
};

export const CloseOnEsc: Story = {
    render: (args) => {
        const [open, setOpen] = useState(false);
        return (
            <>
                <Button label="Open Dialog" onClick={() => setOpen(true)} />
                <Dialog open={open} onClose={() => {
                    setOpen(false);
                    args.onClose();
                }}>
                    <Dialog.Body>
                        <h2>ESC Test</h2>
                        <p>Press ESC to close.</p>
                    </Dialog.Body>
                </Dialog>
            </>
        );
    },
    play: async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);

        // Open dialog
        await userEvent.click(canvas.getByRole('button', { name: /open dialog/i }));
        const dialog = await canvas.findByRole('dialog');
        await waitFor(() => expect(dialog).toBeVisible());

        // Press ESC - dispatch a proper cancel event on the dialog
        // The dialog listens to onCancel which is triggered by the 'cancel' event
        const cancelEvent = new Event('cancel', { bubbles: true, cancelable: true });
        dialog.dispatchEvent(cancelEvent);

        // Verify onClose was called
        await waitFor(() => expect(args.onClose).toHaveBeenCalled());
        await waitFor(() => expect(dialog).not.toBeVisible());
    },
};

export const ResetOnClose: Story = {
    render: () => {
        const [open, setOpen] = useState(false);
        return (
            <>
                <Button label="Open Dialog" onClick={() => setOpen(true)} />
                <Dialog open={open} onClose={() => setOpen(false)}>
                    <Dialog.Body>
                        <Dialog.Title>Form with Reset (Default)</Dialog.Title>
                        <p>Type something and close the dialog. Content will reset when reopened.</p>
                        <form style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '300px', marginTop: '10px' }}>
                            <label>
                                Your Message:
                                <input
                                    type="text"
                                    placeholder="Type here..."
                                    style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                                />
                            </label>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                                <Button label="Close" onClick={() => setOpen(false)} />
                            </div>
                        </form>
                    </Dialog.Body>
                </Dialog>
            </>
        );
    },
};

export const PreserveState: Story = {
    render: () => {
        const [open, setOpen] = useState(false);
        return (
            <>
                <Button label="Open Dialog" onClick={() => setOpen(true)} />
                <Dialog open={open} onClose={() => setOpen(false)} resetOnClose={false}>
                    <Dialog.Body>
                        <Dialog.Title>Form with Preserved State</Dialog.Title>
                        <p>Type something and close the dialog. Content will be preserved when reopened.</p>
                        <form style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '300px', marginTop: '10px' }}>
                            <label>
                                Your Message:
                                <input
                                    type="text"
                                    placeholder="Type here..."
                                    style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                                />
                            </label>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                                <Button label="Close" onClick={() => setOpen(false)} />
                            </div>
                        </form>
                    </Dialog.Body>
                </Dialog>
            </>
        );
    },
};


export const WithForm: Story = {
    render: () => {
        const [open, setOpen] = useState(false);
        return (
            <>
                <Button label="Open Form Dialog" onClick={() => setOpen(true)} />
                <Dialog open={open} onClose={() => setOpen(false)}>
                    <Dialog.Body>
                        <Dialog.Title>Contact Us</Dialog.Title>
                        <form
                            style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '300px' }}
                            onSubmit={(e) => {
                                e.preventDefault();
                                alert('Form submitted!');
                                setOpen(false);
                            }}
                        >
                            <label>
                                Name:
                                <input type="text" required style={{ width: '100%', padding: '8px', marginTop: '4px' }} />
                            </label>
                            <label>
                                Email:
                                <input type="email" required style={{ width: '100%', padding: '8px', marginTop: '4px' }} />
                            </label>
                            <div style={{ marginTop: '10px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <Button label="Cancel" onClick={() => setOpen(false)} />
                                <Button label="Submit" type="submit" />
                            </div>
                        </form>
                    </Dialog.Body>
                </Dialog>
            </>
        );
    },
};

export const ScrollableContent: Story = {
    render: () => {
        const [open, setOpen] = useState(false);
        return (
            <>
                <Button label="Open Scrollable Content" onClick={() => setOpen(true)} />
                <Dialog open={open} onClose={() => setOpen(false)} style={{ maxHeight: '200px' }}>
                    <Dialog.Body>
                        <Dialog.Title data-testid="scrollable-title">Terms and Conditions</Dialog.Title>
                        {Array.from({ length: 20 }).map((_, i) => (
                            <p key={i}>This is paragraph {i + 1} of the terms and conditions. It contains important information.</p>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button label="Accept" onClick={() => setOpen(false)} />
                        </div>
                    </Dialog.Body>
                </Dialog>
            </>
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        // Open Dialog
        await userEvent.click(canvas.getByRole('button', { name: /open scrollable content/i }));
        const dialog = await canvas.findByRole('dialog');
        await waitFor(() => expect(dialog).toBeVisible());

        // Verify Default Focus is ON THE DIALOG itself
        // This ensures we start at the top of the scrollable content
        await waitFor(() => expect(dialog).toHaveFocus());

        // Verify we are actually at the top
        // If the browser pre-scrolled to the bottom button before our focus logic ran, 
        // scrollTop would be > 0. We want it to be 0.
        // Note: We use a small tolerance or just checks 0 if we are sure.
        expect(dialog.scrollTop).toBe(0);

        // Verify the Accept button is NOT focused (which would cause scrolling to bottom)
        const acceptButton = within(dialog).getByRole('button', { name: /accept/i });
        expect(acceptButton).not.toHaveFocus();
    },
};

export const MultipleDialogs: Story = {
    render: () => {
        const [open1, setOpen1] = useState(false);
        const [open2, setOpen2] = useState(false);

        return (
            <>
                <Button label="Open Dialog 1" onClick={() => setOpen1(true)} />
                <Dialog open={open1} onClose={() => setOpen1(false)}>
                    <Dialog.Body>
                        <h2>Dialog 1</h2>
                        <p>First level dialog.</p>
                        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                            <Button label="Open Dialog 2" onClick={() => setOpen2(true)} />
                            <Button label="Close Dialog 1" onClick={() => setOpen1(false)} />
                        </div>
                    </Dialog.Body>
                </Dialog>

                <Dialog open={open2} onClose={() => setOpen2(false)}>
                    <Dialog.Body>
                        <Dialog.Title>Dialog 2</Dialog.Title>
                        <p>Second level dialog (stacked).</p>
                        <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <Button label="Close Dialog 2" onClick={() => setOpen2(false)} />
                        </div>
                    </Dialog.Body>
                </Dialog>
            </>
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        // Open Dialog 1
        await userEvent.click(canvas.getByRole('button', { name: /open dialog 1/i }));

        // Wait for Dialog 1 to be visible
        // We look for the text content. We use 'findByText' which has built-in waitFor
        const dialog1Text = await canvas.findByText('First level dialog.');

        // Get the dialog element from the text
        const dialog1 = dialog1Text.closest('dialog');
        if (!dialog1) throw new Error('Dialog 1 element not found');

        // Wait for open animation to finish
        await Promise.all(dialog1.getAnimations().map((a) => a.finished));
        await expect(dialog1).toBeVisible();

        // Open Dialog 2 from within Dialog 1
        const openDialog2Btn = within(dialog1).getByRole('button', { name: /open dialog 2/i });
        await userEvent.click(openDialog2Btn);

        // Wait for Dialog 2
        // We look for the text content of the second dialog
        const dialog2Text = await canvas.findByText('Second level dialog (stacked).');

        // Get the dialog element from the text
        const dialog2 = dialog2Text.closest('dialog');
        if (!dialog2) throw new Error('Dialog 2 element not found');

        // Wait for open animation to finish
        await Promise.all(dialog2.getAnimations().map((a) => a.finished));
        await expect(dialog2).toBeVisible();

        // Verify Dialog 1 is still open (underneath)
        await expect(dialog1).toBeVisible();

        // Close Dialog 2
        const closeDialog2Btn = within(dialog2).getByRole('button', { name: /close dialog 2/i });
        await userEvent.click(closeDialog2Btn);

        // Wait for Dialog 2 to close
        await waitFor(() => expect(dialog2).not.toBeVisible());

        // Verify Dialog 1 is still visible
        await expect(dialog1).toBeVisible();

        // Close Dialog 1
        const closeDialog1Btn = within(dialog1).getByRole('button', { name: /close dialog 1/i });
        await userEvent.click(closeDialog1Btn);

        // Verify Dialog 1 is closed
        await waitFor(() => expect(dialog1).not.toBeVisible());
    },
};

export const ScrollClamp: Story = {
    render: () => {
        const [open, setOpen] = useState(false);
        return (
            <div style={{ background: 'linear-gradient(to bottom, #fff, red)' }}>
                <div style={{ padding: '20px' }}>
                    <h1>Scroll Clamp Test (Overflow Hidden)</h1>
                    <Button label="Open Scroll Clamp Dialog" onClick={() => setOpen(true)} />
                    {Array.from({ length: 50 }).map((_, i) => (
                        <p key={i}>Background content {i + 1}</p>
                    ))}
                </div>
                <Dialog open={open} onClose={() => setOpen(false)}>
                    <Dialog.Body>
                        <Dialog.Title>Scroll Clamp Enabled</Dialog.Title>
                        <p>Body scroll should be disabled via <code>overflow: hidden</code>.</p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                            <Button label="Close" onClick={() => setOpen(false)} />
                        </div>
                    </Dialog.Body>
                </Dialog>
            </div>
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        // 1. Initial State: Normal
        expect(document.body.style.overflow).not.toBe('hidden');
        expect(document.body.getAttribute('data-scroll-clamp')).toBeNull();

        // 2. Open Dialog
        await userEvent.click(canvas.getByRole('button', { name: /open scroll clamp dialog/i }));
        const dialog = await canvas.findByRole('dialog');
        await waitFor(() => expect(dialog).toBeVisible());

        // 3. Verify Locked State
        expect(document.body.style.overflow).toBe('hidden');
        expect(document.body.getAttribute('data-scroll-clamp')).toBe('1');

        // 4. Close Dialog
        // Note: Storybook interaction can be tricky with backdrop clicks if covered?
        // Let's click the close button inside.
        const closeButton = within(dialog).getByRole('button', { name: /close/i });
        await userEvent.click(closeButton);
        await waitFor(() => expect(dialog).not.toBeVisible());

        // 5. Verify Unlocked State
        await waitFor(() => {
            expect(document.body.style.overflow).toBe('');
            expect(document.body.getAttribute('data-scroll-clamp')).toBeNull();
        });
    },
};

export const AutoFocusSecondInput: Story = {
    render: () => {
        const [open, setOpen] = useState(false);
        return (
            <>
                <Button label="Open Focus Test Dialog" onClick={() => setOpen(true)} />
                <Dialog open={open} onClose={() => setOpen(false)}>
                    <Dialog.Body>
                        <Dialog.Title>Auto Focus Second Input</Dialog.Title>
                        <input
                            data-testid="first-input"
                            placeholder="I am first (default focus?)"
                            style={{ marginBottom: '10px', display: 'block' }}
                        />
                        <input
                            data-testid="autofocus-input"
                            data-autofocus
                            placeholder="I should be focused"
                            style={{ marginBottom: '10px', display: 'block' }}
                        />
                        <Button label="Close" onClick={() => setOpen(false)} />
                    </Dialog.Body>
                </Dialog>
            </>
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        // Open Dialog
        await userEvent.click(canvas.getByRole('button', { name: /open focus test dialog/i }));
        const dialog = await canvas.findByRole('dialog');
        await waitFor(() => expect(dialog).toBeVisible());

        // Check if SECOND input is focused
        const secondInput = within(dialog).getByTestId('autofocus-input');
        const firstInput = within(dialog).getByTestId('first-input');

        // Wait for focus to settle
        await waitFor(() => expect(secondInput).toHaveFocus());

        expect(firstInput).not.toHaveFocus();
    },
};

export const StickyHeaderFooter: Story = {
    render: () => {
        const [open, setOpen] = useState(false);
        return (
            <>
                <Button label="Open Sticky Dialog" onClick={() => setOpen(true)} />
                <Dialog
                    open={open}
                    onClose={() => setOpen(false)}
                    className="max-h-[300px]"
                >
                    <Dialog.Sticky align="top" className="justify-between items-center border-b border-gray-200">
                        <Dialog.Title className="mb-0">Sticky Header</Dialog.Title>
                        <Button label="✕" onClick={() => setOpen(false)} />
                    </Dialog.Sticky>

                    <Dialog.Body className="py-2">
                        <p>Scroll down to see the header stay fixed and the footer appear at the bottom.</p>
                        {Array.from({ length: 15 }).map((_, i) => (
                            <p key={i} className="my-2">
                                Paragraph {i + 1}: The content here is scrollable.
                                Notice how the header remains visible at the top, and the footer is anchored at the bottom (or flushes to bottom of content).
                            </p>
                        ))}
                    </Dialog.Body>

                    <Dialog.Sticky align="bottom" className="justify-end border-t border-gray-200">
                        <Button label="Cancel" onClick={() => setOpen(false)} />
                        <Button label="Confirm" onClick={() => setOpen(false)} />
                    </Dialog.Sticky>
                </Dialog>
            </>
        );
    },
    play: async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);

        await step('Open sticky dialog', async () => {
            await userEvent.click(canvas.getByRole('button', { name: /Open Sticky Dialog/i }));
        });

        const dialog = canvasElement.querySelector('dialog');
        if (!dialog) throw new Error('Dialog not found');

        const withinDialog = within(dialog);

        // Wait for dialog animation
        await waitFor(() => expect(withinDialog.getByText('Sticky Header')).toBeVisible());

        await step('Verify header sticks on scroll', async () => {
            const headerText = withinDialog.getByText('Sticky Header');
            const header = headerText.closest('div[class*="sticky"]');
            expect(header).toBeTruthy();

            // Get initial position
            const initialRect = header!.getBoundingClientRect();

            // Scroll the body, not the dialog, because sticky is now inside the dialog column layout
            // Wait, Dialog.module.css: .dialog is display: flex column. .body is flex-grow. overflow-y: auto should be on .body?
            // Actually, previously scrolling was on .dialog. 
            // In new design: .dialog (flex col) -> .sticky (fixed-ish) + .body (overflow-y: auto).
            // So we need to scroll the .body element!

            const body = dialog.querySelector('div[class*="body"]');
            if (!body) throw new Error('Dialog Body not found to scroll');

            body.scrollTop = 100;
            body.dispatchEvent(new Event('scroll'));

            // Wait a tick for any layout updates
            await new Promise(resolve => setTimeout(resolve, 100));

            // Verify header is still visible
            await expect(withinDialog.getByText('Sticky Header')).toBeVisible();

            // Verify position
            const scrolledRect = header!.getBoundingClientRect();
            expect(Math.abs(scrolledRect.top - initialRect.top)).toBeLessThan(20);
        });

        await step('Close dialog', async () => {
            await userEvent.click(withinDialog.getByRole('button', { name: /✕/i }));
            await waitFor(() => expect(dialog).not.toHaveAttribute('open'));
        });
    }
};

export const TailwindExample: Story = {
    render: function TailwindExampleRender() {
        const [open, setOpen] = useState(false);
        return (
            <>
                <Button label="Open Tailwind Dialog" onClick={() => setOpen(true)} />
                <Dialog
                    open={open}
                    onClose={() => setOpen(false)}
                    className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 shadow-2xl"
                >
                    <Dialog.Body>
                        <Dialog.Title className="text-2xl font-bold text-purple-900 mb-4">Tailwind Styled Dialog</Dialog.Title>
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
                    </Dialog.Body>
                </Dialog>
            </>
        );
    },
};

export const TailwindPaddingOverride: Story = {
    render: () => {
        const [open, setOpen] = useState(false);
        return (
            <>
                <Button label="Open Custom Padding Dialog" onClick={() => setOpen(true)} />
                <Dialog
                    open={open}
                    onClose={() => setOpen(false)}
                >
                    <div className="w-full h-32 bg-indigo-500 text-white flex items-center justify-center text-4xl font-bold p-8">
                        Header Banner
                    </div>
                    <Dialog.Body className="p-8 space-y-4">
                        <Dialog.Title>Zero-Conflict Padding</Dialog.Title>
                        <p>
                            This dialog has a full-width header image (no padding) and a body with extra large padding (p-8).
                        </p>
                        <p className="text-gray-500">
                            Because we separated container logic from content logic, this "header" is just a direct child of the dialog, sitting naturally flush.
                        </p>
                        <div className="flex justify-end">
                            <Button label="Understand" onClick={() => setOpen(false)} />
                        </div>
                    </Dialog.Body>
                </Dialog>
            </>
        );
    }
};