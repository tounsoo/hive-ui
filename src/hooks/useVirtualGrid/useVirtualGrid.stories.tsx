import type { Meta, StoryObj } from '@storybook/react';
import { useRef, useState, useCallback, useEffect } from 'react';
import { expect, userEvent, within, fn } from '@storybook/test';
import { useVirtualGrid, type VirtualGridActionContext, type UseVirtualGridOptions, type UseVirtualGridResult } from './useVirtualGrid';

// Generate dummy data
interface GridItem {
    id: number;
    title: string;
}

const myData: GridItem[] = Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    title: `Hook Test Row ${i}`
}));

const meta = {
    title: 'Hooks/useVirtualGrid',
    excludeStories: ['VirtualGridResultDocs'],
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component: 'A custom hook for virtualizing grids and lists with keyboard navigation support.',
            },
        },
    },
    argTypes: {
        columnCount: {
            control: { type: 'number', min: 1, max: 5 },
            description: 'Number of columns in the grid.',
            table: {
                defaultValue: { summary: '1' },
            }
        },
        overscan: {
            control: { type: 'number' },
            description: 'Number of items to render outside the visible area.',
            table: {
                defaultValue: { summary: '5' },
            }
        },
        containerHeight: {
            control: { type: 'text' },
            description: 'Height of the scrolling container (e.g. "300px").',
        },
        endReachedThreshold: {
            control: { type: 'number' },
            description: 'Threshold for infinite scroll loading.',
        },
        items: { table: { disable: true } },
        parentRef: { table: { disable: true } },
        estimateSize: { table: { disable: true } },
        onItemAction: { table: { disable: true } },
        onEndReached: { table: { disable: true } },
    },
} satisfies Meta<UseVirtualGridOptions<GridItem>>;

export default meta;

/**
 * A dummy component used to generate documentation for the hook's return values.
 * Not intended for use in the UI.
 */
export const VirtualGridResultDocs = (_props: UseVirtualGridResult) => <div />;

type Story = StoryObj<UseVirtualGridOptions<GridItem>>;

export const HookTest: Story = {
    args: {
        items: myData,
        columnCount: 1,
        overscan: 5,
        containerHeight: '300px',
    },
    render: (args) => {
        const parentRef = useRef<HTMLDivElement>(null);

        // Use the hook with args from controls
        const { virtualRows, gridContainerProps, gridContentProps, focus, getRowProps } = useVirtualGrid({
            ...args,
            parentRef,
            estimateSize: () => 40,
        });

        return (
            <div className="p-4">
                <h3 className="mb-2">Hook Focus State: {JSON.stringify(focus)}</h3>

                <div
                    ref={parentRef}
                    {...gridContainerProps}
                    data-testid="virtual-grid"
                    style={{
                        ...gridContainerProps.style,
                        width: '100%',
                        border: '1px solid #ccc'
                    }}
                >
                    <div {...gridContentProps}>
                        {virtualRows.map(row => {
                            const item = args.items[row.index];
                            if (!item) return null;
                            const rowProps = getRowProps(row);
                            return (
                                <div
                                    key={row.key}
                                    {...rowProps}
                                    style={{
                                        ...rowProps.style,
                                        borderBottom: '1px solid #eee',
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '0 8px',
                                        backgroundColor: focus.row === row.index ? '#e0f2fe' : 'white'
                                    }}
                                >
                                    <div role="gridcell" id={`cell-${row.index}-0`}>
                                        {item.title}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    },
    play: async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);
        const grid = canvas.getByTestId('virtual-grid');

        await step('Initial render checks', async () => {
            await expect(grid).toBeInTheDocument();
            await expect(grid).toHaveAttribute('aria-activedescendant', 'cell-0-0');
        });

        await step('Keyboard navigation', async () => {
            grid.focus();
            await expect(grid).toHaveFocus();

            // Arrow Down -> Row 1
            await userEvent.keyboard('[ArrowDown]');
            await expect(grid).toHaveAttribute('aria-activedescendant', 'cell-1-0');

            // Arrow Down -> Row 2
            await userEvent.keyboard('[ArrowDown]');
            await expect(grid).toHaveAttribute('aria-activedescendant', 'cell-2-0');

            // Arrow Up -> Row 1
            await userEvent.keyboard('[ArrowUp]');
            await expect(grid).toHaveAttribute('aria-activedescendant', 'cell-1-0');
        });
    }
};

export const GridNavigation: Story = {
    args: {
        items: myData,
        columnCount: 2, // 2 Columns to test left/right
        overscan: 2,
        containerHeight: '300px',
        onItemAction: fn(),
    },
    render: (args) => {
        const parentRef = useRef<HTMLDivElement>(null);
        const { virtualRows, gridContainerProps, gridContentProps, focus, getRowProps } = useVirtualGrid({
            ...args,
            parentRef,
            estimateSize: () => 40,
        });

        return (
            <div className="p-4">
                <div
                    ref={parentRef}
                    {...gridContainerProps}
                    data-testid="nav-grid"
                    style={{ ...gridContainerProps.style, width: '100%', border: '1px solid #ccc' }}
                >
                    <div {...gridContentProps}>
                        {virtualRows.map(row => {
                            const item = args.items[row.index];
                            if (!item) return null;
                            const rowProps = getRowProps(row);
                            return (
                                <div
                                    key={row.key}
                                    {...rowProps}
                                    style={{
                                        ...rowProps.style,
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        backgroundColor: focus.row === row.index ? '#f0f9ff' : 'white'
                                    }}
                                >
                                    {[0, 1].map(colIndex => (
                                        <div
                                            key={colIndex}
                                            role="gridcell"
                                            id={`cell-${row.index}-${colIndex}`}
                                            style={{
                                                padding: '8px',
                                                border: '1px solid #eee',
                                                // Visual focus indicator
                                                outline: focus.row === row.index && focus.col === colIndex ? '2px solid blue' : 'none',
                                                outlineOffset: '-2px'
                                            }}
                                        >
                                            {colIndex === 0 ? item.title : `Col 2 - ${item.id}`}
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    },
    play: async ({ canvasElement, step, args }) => {
        const canvas = within(canvasElement);
        const grid = canvas.getByTestId('nav-grid');
        grid.focus();

        await step('Horizontal Navigation', async () => {
            // Start 0,0
            await expect(grid).toHaveAttribute('aria-activedescendant', 'cell-0-0');

            // Right -> 0,1
            await userEvent.keyboard('[ArrowRight]');
            await expect(grid).toHaveAttribute('aria-activedescendant', 'cell-0-1');

            // Right (Boundary) -> 0,1 (Should not move)
            await userEvent.keyboard('[ArrowRight]');
            await expect(grid).toHaveAttribute('aria-activedescendant', 'cell-0-1');

            // Left -> 0,0
            await userEvent.keyboard('[ArrowLeft]');
            await expect(grid).toHaveAttribute('aria-activedescendant', 'cell-0-0');

            // Left (Boundary) -> 0,0 (Should not move)
            await userEvent.keyboard('[ArrowLeft]');
            await expect(grid).toHaveAttribute('aria-activedescendant', 'cell-0-0');
        });

        await step('Vertical Boundary', async () => {
            // Up from 0,0 -> 0,0 (Boundary)
            await userEvent.keyboard('[ArrowUp]');
            await expect(grid).toHaveAttribute('aria-activedescendant', 'cell-0-0');
        });

        await step('Action Triggering', async () => {
            // Enter
            await userEvent.keyboard('[Enter]');
            await expect(args.onItemAction).toHaveBeenCalledWith(expect.objectContaining({
                row: 0,
                col: 0
            }));

            // Move to 0,1
            await userEvent.keyboard('[ArrowRight]');

            // Space
            await userEvent.keyboard(' '); // Space
            await expect(args.onItemAction).toHaveBeenCalledWith(expect.objectContaining({
                row: 0,
                col: 1
            }));
        });
    }
};

export const TwoColumnAction: Story = {
    args: {
        items: myData,
        columnCount: 2,
        overscan: 5,
        containerHeight: '300px',
    },
    render: (args) => {
        const parentRef = useRef<HTMLDivElement>(null);

        // A. Shared Business Logic for Actions (Keyboard or Mouse)
        const handleAction = (ctx: VirtualGridActionContext<GridItem>) => {
            const { item, setFocus, row, col } = ctx;

            console.log(`Action triggered on item: ${item.id}`);
            alert(`Action: ${item.id}`);

            // We can control focus here safely!
            setFocus({ row, col });
        };

        // 1. Hook with 2 columns
        const { virtualRows, gridContainerProps, gridContentProps, focus, setFocus, getRowProps } = useVirtualGrid({
            ...args,
            parentRef,
            estimateSize: () => 40,
            // B. Wired up directly to the hook
            onItemAction: (ctx) => {
                if (ctx.col === 1) {
                    handleAction(ctx);
                }
            }
        });

        return (
            <div className="p-4">
                <h3 className="mb-2">2-Column Grid (Option C: Enriched Callback)</h3>
                <div className="mb-2 text-sm text-gray-500">
                    Use Left/Right arrows to switch columns. Press Enter on the "Log" button cell.
                </div>

                <div
                    ref={parentRef}
                    {...gridContainerProps}
                    style={{
                        ...gridContainerProps.style,
                        width: '100%',
                        border: '1px solid #ccc'
                    }}
                >
                    <div {...gridContentProps}>
                        {virtualRows.map(row => {
                            const item = args.items[row.index];
                            if (!item) return null;
                            const rowProps = getRowProps(row);
                            const isRowFocused = focus.row === row.index;

                            return (
                                <div
                                    key={row.key}
                                    {...rowProps}
                                    style={{
                                        ...rowProps.style,
                                        borderBottom: '1px solid #eee',
                                        display: 'flex',
                                        alignItems: 'center',
                                        // Highlight row slightly if any cell in it is focused (optional style)
                                        backgroundColor: isRowFocused ? '#f8fafc' : 'white'
                                    }}
                                >
                                    {/* Column 0: Text */}
                                    <div
                                        role="gridcell"
                                        id={`cell-${row.index}-0`}
                                        style={{
                                            flex: 1,
                                            padding: '0 8px',
                                            // Visual focus for Cell 0
                                            outline: isRowFocused && focus.col === 0 ? '2px solid blue' : 'none',
                                            outlineOffset: '-2px'
                                        }}
                                        onClick={() => setFocus({ row: row.index, col: 0 })}
                                    >
                                        {item.title}
                                    </div>

                                    {/* Column 1: Button */}
                                    <div
                                        role="gridcell"
                                        id={`cell-${row.index}-1`}
                                        style={{
                                            width: '100px',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            // Visual focus for Cell 1
                                            outline: isRowFocused && focus.col === 1 ? '2px solid blue' : 'none',
                                            outlineOffset: '-2px'
                                        }}
                                        onClick={() => setFocus({ row: row.index, col: 1 })}
                                    >
                                        <button
                                            tabIndex={-1}
                                            // Mouse Action (Reusing shared logic)
                                            onClick={() => {
                                                handleAction({
                                                    item,
                                                    row: row.index,
                                                    col: 1,
                                                    setFocus
                                                });
                                            }}
                                        >
                                            Log
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }
};

// --- Infinite Scroll Mock Data & Helpers ---

// Global counter to simulate database IDs
let idCounter = 0;

const fetchMockData = (limit: number): Promise<GridItem[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newItems = Array.from({ length: limit }).map((_, i) => ({
                id: idCounter + i,
                title: `Infinite Row ${idCounter + i}`,
            }));
            idCounter += limit;
            resolve(newItems);
        }, 400); // 400ms delay
    });
};

export const InfiniteScroll: Story = {
    loaders: [
        async () => {
            idCounter = 0;
            const initialItems = await fetchMockData(20);
            return { initialItems };
        },
    ],
    render: (_args, { loaded: { initialItems } }) => {
        const parentRef = useRef<HTMLDivElement>(null);

        // State - start with loaded data from loaders
        const [items, setItems] = useState<GridItem[]>(initialItems);
        const [isLoading, setIsLoading] = useState(false);
        const [hasMore, setHasMore] = useState(true);

        const loadMore = useCallback(async () => {
            if (isLoading || !hasMore) return;

            setIsLoading(true);
            try {
                // Simulate a limit of 1000 items total
                if (items.length >= 1000) {
                    setHasMore(false);
                    setIsLoading(false);
                    return;
                }

                const newItems = await fetchMockData(20);
                setItems((prev) => [...prev, ...newItems]);
            } finally {
                setIsLoading(false);
            }
        }, [isLoading, hasMore, items.length]);

        // Hook
        const { virtualRows, gridContainerProps, gridContentProps, focus, getRowProps } = useVirtualGrid({
            items,
            columnCount: 1,
            parentRef,
            estimateSize: () => 40,
            containerHeight: '400px',
            overscan: 10,
            onEndReached: loadMore,
            endReachedThreshold: 5,
        });

        return (
            <div className="p-4 max-w-md mx-auto">
                <h3 className="mb-2 font-bold text-lg">Infinite Scroll Example</h3>
                <p className="mb-4 text-sm text-gray-600">
                    Scroll down to load more items. Stops at 1000 items.
                    <br />Current Count: {items.length}
                </p>

                <div
                    ref={parentRef}
                    {...gridContainerProps}
                    className="border border-gray-300 rounded-md shadow-sm bg-white"
                >
                    <div {...gridContentProps}>
                        {virtualRows.map((row) => {
                            const item = items[row.index];
                            if (!item) return null; // Safety check

                            const rowProps = getRowProps(row);
                            return (
                                <div
                                    key={row.key}
                                    {...rowProps}
                                    className={`
                                        flex items-center px-4 border-b border-gray-100
                                        ${focus.row === row.index ? 'bg-blue-50 ring-1 ring-inset ring-blue-500' : 'hover:bg-gray-50'}
                                    `}
                                >
                                    <div role="gridcell" id={`cell-${row.index}-0`} className="flex items-center w-full">
                                        <span className="font-mono mr-3 w-8">{item.id}</span>
                                        <span>{item.title}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {isLoading && (
                    <div className="mt-2 text-center text-blue-600 animate-pulse">
                        Loading more items...
                    </div>
                )}
                {!hasMore && (
                    <div className="mt-2 text-center text-gray-500">
                        No more items to load.
                    </div>
                )}
            </div>
        );
    },
};

export const MissingActionHandler: Story = {
    args: {
        items: myData,
        columnCount: 1,
        containerHeight: '300px',
        onItemAction: undefined, // Explicitly undefined
    },
    render: (args) => {
        const parentRef = useRef<HTMLDivElement>(null);
        const { virtualRows, gridContainerProps, gridContentProps, focus, getRowProps } = useVirtualGrid({
            ...args,
            parentRef,
        });

        return (
            <div className="p-4">
                <div
                    ref={parentRef}
                    {...gridContainerProps}
                    data-testid="missing-action-grid"
                    style={{ ...gridContainerProps.style, width: '100%', border: '1px solid #ccc' }}
                >
                    <div {...gridContentProps}>
                        {virtualRows.map(row => {
                            const item = args.items[row.index];
                            if (!item) return null;
                            const rowProps = getRowProps(row);
                            return (
                                <div
                                    key={row.key}
                                    {...rowProps}
                                    className="p-2 border-b"
                                    style={{
                                        ...rowProps.style,
                                        background: focus.row === row.index ? '#e0e7ff' : 'transparent',
                                    }}
                                >
                                    {/* Make the content a cell */}
                                    <div role="gridcell" id={`cell-${row.index}-0`}>
                                        {item.title}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    },
    play: async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);
        const grid = canvas.getByTestId('missing-action-grid');

        await step('Interact without handler', async () => {
            grid.focus();
            // Should not throw and hit the branch
            await userEvent.keyboard('[Enter]');
            await userEvent.keyboard(' ');
            await expect(grid).toHaveFocus();
        });
    }
};

export const EmptyList: Story = {
    args: {
        items: [],
        columnCount: 1,
        containerHeight: '300px',
        onEndReached: fn(),
    },
    render: (args) => {
        const parentRef = useRef<HTMLDivElement>(null);
        const { virtualRows, gridContainerProps, gridContentProps } = useVirtualGrid({
            ...args,
            parentRef,
        });

        return (
            <div className="p-4">
                <div
                    ref={parentRef}
                    {...gridContainerProps}
                    data-testid="empty-grid"
                    style={{ ...gridContainerProps.style, width: '100%', border: '1px solid #ccc' }}
                >
                    <div {...gridContentProps}>
                        {virtualRows.length === 0 && (
                            <div role="row" aria-rowindex={1}>
                                <div role="gridcell" className="p-4">No items</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    },
    play: async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);
        const grid = canvas.getByTestId('empty-grid');
        await expect(grid).toBeInTheDocument();
        await expect(canvas.getByText('No items')).toBeVisible();

        // Confirm onEndReached is NOT called (hits empty check branch)
        expect(args.onEndReached).not.toHaveBeenCalled();
    }
};
