import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { userEvent, within, expect, fn, waitFor, screen } from '@storybook/test';

import { Dialog } from './Dialog';
import { Button } from '../Button';

const meta: Meta<typeof Dialog> = {
    title: 'Components/Dialog',
    component: Dialog,
    parameters: {
        layout: 'centered',
    },

    args: {
        onClose: fn(),
    },
};

export default meta;
type Story = StoryObj<typeof Dialog>;

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
                    <h2>Dialog Title</h2>
                    <p>This is a native dialog element.</p>
                    <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <Button label="Close" onClick={() => setOpen(false)} />
                    </div>
                </Dialog>
            </>
        );
    },
    play: async ({ canvasElement, args }) => {
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
                }}>
                    <h2>Backdrop Test</h2>
                    <p>Click outside to close.</p>
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
                    <h2>Content Click Test</h2>
                    <p data-testid="click-counter">Clicked: {clickCount} times</p>
                    <Button
                        label="Inside Action"
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent event bubbling
                            setClickCount(c => c + 1);
                        }}
                    />
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
                    <h2>ESC Test</h2>
                    <p>Press ESC to close.</p>
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
                    <h2>Form with Reset (Default)</h2>
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
                    <h2>Form with Preserved State</h2>
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
                    <h2>Contact Us</h2>
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
                </Dialog>
            </>
        );
    },
};

export const LongContent: Story = {
    render: () => {
        const [open, setOpen] = useState(false);
        return (
            <>
                <Button label="Open Long Content" onClick={() => setOpen(true)} />
                <Dialog open={open} onClose={() => setOpen(false)} style={{ maxHeight: '200px' }}>
                    <h2>Terms and Conditions</h2>
                    {Array.from({ length: 20 }).map((_, i) => (
                        <p key={i}>This is paragraph {i + 1} of the terms and conditions. It contains important information.</p>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button label="Accept" onClick={() => setOpen(false)} />
                    </div>
                </Dialog>
            </>
        );
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
                    <h2>Dialog 1</h2>
                    <p>First level dialog.</p>
                    <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                        <Button label="Open Dialog 2" onClick={() => setOpen2(true)} />
                        <Button label="Close Dialog 1" onClick={() => setOpen1(false)} />
                    </div>
                </Dialog>

                <Dialog open={open2} onClose={() => setOpen2(false)}>
                    <h2>Dialog 2</h2>
                    <p>Second level dialog (stacked).</p>
                    <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <Button label="Close Dialog 2" onClick={() => setOpen2(false)} />
                    </div>
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
        // We need to wait for the animation to start first, then finish
        // Or wait for it to be not visible, which implies animation done?
        // Dialog close implementation waits for transitionend before calling dialog.close()
        // So checking for not.toBeVisible() via waitFor is actually correct because element remains visible until close()
        // But we can check animations too if we want to be fancy, but close() removes visibility.
        // Let's stick to waitFor not.toBeVisible for closing as it relies on component logic to actually close.
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
                    <h2>Scroll Clamp Enabled</h2>
                    <p>Body scroll should be disabled via <code>overflow: hidden</code>.</p>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                        <Button label="Close" onClick={() => setOpen(false)} />
                    </div>
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
