import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within, expect, fn } from '@storybook/test';
import { Card } from './Card';
import cardImage from '../../assets/card-placeholder.png';
import { Button } from '../Button';

const meta = {
    title: 'Components/Card',
    component: Card,
    parameters: {
        layout: 'centered',
    },
    subcomponents: {
        'Card.Body': Card.Body,
        'Card.Title': Card.Title,
    }
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        children: (
            <Card.Body>
                <Card.Title>Card Title</Card.Title>
                <p style={{ margin: 0, color: '#666' }}>
                    This is a basic card. It uses <code>Card.Body</code> to provide standard padding.
                </p>
            </Card.Body>
        ),
        style: { width: '300px' },
    },
};

export const WithImage: Story = {
    args: {
        children: (
            <>
                {/* Direct child is flush by default now */}
                <img
                    src={cardImage}
                    alt="Abstract Blue and Purple Shapes"
                    style={{ width: '100%', display: 'block' }}
                />
                <Card.Body>
                    <Card.Title>Image Card</Card.Title>
                    <p style={{ margin: 0, color: '#666' }}>
                        This card has an image that bleeds to the edge. No special 'Flush' component is strictly needed anymore, just place it outside the Body.
                    </p>
                </Card.Body>
            </>
        ),
        style: { width: '300px' },
    },
};

export const PaddingOverride: Story = {
    args: {
        children: (
            <>
                <img
                    src={cardImage}
                    alt="Header"
                    style={{ width: '100%', height: '100px', objectFit: 'cover', display: 'block' }}
                />
                <Card.Body className="p-0">
                    <div className="p-4 bg-gray-50 border-b">
                        <Card.Title className="mb-0">Zero Padding Body</Card.Title>
                    </div>
                    <div className="p-4">
                        <p className="m-0 text-gray-600">
                            This body has <code>p-0</code> class, allowing full control over internal spacing.
                            The header and this section are flush with the container edges.
                        </p>
                    </div>
                </Card.Body>
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
            <Card.Body>
                <Card.Title>Link Card</Card.Title>
                <p style={{ margin: 0, color: '#666' }}>
                    This entire card is a link. Hover over it to see the cursor change.
                </p>
            </Card.Body>
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
            <Card.Body>
                <Card.Title>Button Card</Card.Title>
                <p style={{ margin: 0, color: '#666' }}>
                    This entire card is a button. Click it to trigger an alert.
                </p>
            </Card.Body>
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
            <Card.Body>
                <Card.Title>Nested Actions</Card.Title>
                <p style={{ marginBottom: '16px', color: '#666' }}>
                    Clicking the text triggers the card.
                </p>

                <div style={{ display: 'flex', gap: '8px' }}>
                    {/* 
                      IMPORTANT: Nested interactive elements need z-index > 1 
                      and position: relative to sit above the card's overlay.
                    */}
                    <Button
                        onClick={(e) => {
                            e.stopPropagation();
                            console.log('Secondary Button Clicked!');
                        }}
                        style={{ zIndex: 2 }}
                        label="Learn More"
                    />

                    <Button
                        onClick={(e) => {
                            e.stopPropagation();
                            console.log('Tertiary Button Clicked!');
                        }}
                        style={{ zIndex: 2 }}
                        className="z-2 bg-cyan-700 text-white hover:bg-cyan-800"
                        label="Add to Cart"
                    />
                </div>
            </Card.Body>
        </Card>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        // 1. Verify Card Button (Background)
        // Access via aria-label since text is inside but overlay is empty
        const cardButton = canvas.getByRole('button', { name: "View Details" });
        await expect(cardButton).toBeInTheDocument();

        // 2. Verify Nested Buttons
        const secondaryBtn = canvas.getByRole('button', { name: /learn more/i });
        const primaryBtn = canvas.getByRole('button', { name: /add to cart/i });

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

export const TailwindExample: Story = {
    args: {
        onClick: () => alert('Clicked!'),
        'aria-label': 'Tailwind Interactive Card',
        children: (
            <Card.Body>
                <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-2xl">
                        ✓
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Task Completed</h3>
                        <p className="text-sm text-gray-500">Click to view details</p>
                    </div>
                </div>
            </Card.Body>
        ),
        className: 'hover:!bg-green-50 hover:!border-green-300 transition-all !duration-300',
        style: { width: '350px' },
    },
};
