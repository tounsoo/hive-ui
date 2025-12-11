import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within, expect, fn } from '@storybook/test';
import { Card } from './Card';
import cardImage from '../../assets/card-placeholder.png';

const meta: Meta<typeof Card> = {
    title: 'Components/Card',
    component: Card,
    parameters: {
        layout: 'centered',
    },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
    args: {
        children: (
            <div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem' }}>Card Title</h3>
                <p style={{ margin: 0, color: '#666' }}>
                    This is a basic card. It is not interactive itself, but contains content.
                </p>
            </div>
        ),
        style: { width: '300px' },
    },
};

export const WithImage: Story = {
    args: {
        children: (
            <>
                <img
                    src={cardImage}
                    alt="Abstract Blue and Purple Shapes"
                    style={{ width: 'calc(100% + 32px)', margin: '-16px -16px 16px -16px', display: 'block' }}
                />
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem' }}>Image Card</h3>
                <p style={{ margin: 0, color: '#666' }}>
                    This card has an image that bleeds to the edge (managed by negative margins here for demo).
                </p>
            </>
        ),
        style: { width: '300px' },
    },
};

export const InteractiveLink: Story = {
    args: {
        href: '#',
        'aria-label': 'Go to example link',
        children: (
            <div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem' }}>Link Card</h3>
                <p style={{ margin: 0, color: '#666' }}>
                    This entire card is a link. Hover over it to see the cursor change.
                </p>
            </div>
        ),
        style: { width: '300px' },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        // Verify link role and accessible name
        const link = canvas.getByRole('link', { name: "Go to example link" });
        await expect(link).toBeInTheDocument();
        await expect(link).toHaveAttribute('href', '#');
    },
};

export const InteractiveButton: Story = {
    args: {
        onClick: fn(),
        'aria-label': 'Perform card action',
        children: (
            <div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem' }}>Button Card</h3>
                <p style={{ margin: 0, color: '#666' }}>
                    This entire card is a button. Click it to trigger an alert.
                </p>
            </div>
        ),
        style: { width: '300px' },
    },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        // Verify button role and accessible name
        const button = canvas.getByRole('button', { name: "Perform card action" });
        await expect(button).toBeInTheDocument();

        await userEvent.click(button);
        await expect(args.onClick).toHaveBeenCalled();
    },
};

export const InteractiveWithNestedActions: Story = {
    // We can't use 'args' easily with render function to mock onClick, 
    // so we rely on interaction testing finding the elements.
    render: () => (
        <Card
            onClick={() => console.log('Card Background Clicked!')}
            aria-label="View Details"
            style={{ width: '300px' }}
        >
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem' }}>Nested Actions</h3>
            <p style={{ marginBottom: '16px', color: '#666' }}>
                Clicking the text triggers the card.
            </p>

            <div style={{ display: 'flex', gap: '8px' }}>
                {/* 
                  IMPORTANT: Nested interactive elements need z-index > 1 
                  and position: relative to sit above the card's overlay.
                */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        console.log('Secondary Button Clicked!');
                    }}
                    style={{
                        position: 'relative',
                        zIndex: 2,
                        padding: '8px 16px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        background: 'white',
                        cursor: 'pointer'
                    }}
                >
                    Secondary Action
                </button>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        console.log('Tertiary Button Clicked!');
                    }}
                    style={{
                        position: 'relative',
                        zIndex: 2,
                        padding: '8px 16px',
                        borderRadius: '4px',
                        border: 'none',
                        background: '#3b82f6',
                        color: 'white',
                        cursor: 'pointer'
                    }}
                >
                    Primary Action
                </button>
            </div>
        </Card>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        // 1. Verify Card Button (Background)
        // Access via aria-label since text is inside but overlay is empty
        const cardButton = canvas.getByRole('button', { name: "View Details" });
        await expect(cardButton).toBeInTheDocument();

        // 2. Verify Nested Buttons
        const secondaryBtn = canvas.getByRole('button', { name: /secondary action/i });
        const primaryBtn = canvas.getByRole('button', { name: /primary action/i });

        await expect(secondaryBtn).toBeInTheDocument();
        await expect(primaryBtn).toBeInTheDocument();

        // 3. Verify they are click-able (not covered)
        // Attempting to click nested buttons should not fail / should reach them.
        await userEvent.click(secondaryBtn);
        await userEvent.click(primaryBtn);
        // Note: Without spies/mocks on the render function, we mainly verify 
        // that userEvent.click() succeeds and targets the correct element.
    }
};
