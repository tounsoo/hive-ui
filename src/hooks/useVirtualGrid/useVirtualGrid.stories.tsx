import type { Meta, StoryObj } from '@storybook/react';
import { useRef, useState, useCallback, useEffect } from 'react';
import { useVirtualGrid, type VirtualGridActionContext } from './useVirtualGrid';

const meta: Meta = {
    title: 'Hooks/useVirtualGrid',
    parameters: {
        layout: 'padded',
    },
};

export default meta;

// Generate dummy data
interface GridItem {
    id: number;
    title: string;
}

const myData: GridItem[] = Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    title: `Hook Test Row ${i}`
}));

export const HookTest: StoryObj = {
    render: () => {
        const parentRef = useRef<HTMLDivElement>(null);

        // Use the hook
        const { virtualRows, gridContainerProps, gridContentProps, focus, getRowProps } = useVirtualGrid({
            items: myData,
            columnCount: 1,
            parentRef,
            estimateSize: () => 40,
            containerHeight: '300px',
        });

        return (
            <div className="p-4">
                <h3 className="mb-2">Hook Focus State: {JSON.stringify(focus)}</h3>

                {/* Manual Scroll Container Implementation */}
                {/* Style is now partly provided by gridContainerProps due to containerHeight opt */}
                <div
                    ref={parentRef}
                    {...gridContainerProps}
                    style={{
                        ...gridContainerProps.style,
                        width: '100%',
                        border: '1px solid #ccc'
                    }}
                >
                    {/* Inner Container for Total Height */}
                    <div {...gridContentProps}>
                        {virtualRows.map(row => {
                            const item = myData[row.index];
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
                                    {item.title}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }
};

export const TwoColumnAction: StoryObj = {
    render: () => {
        const parentRef = useRef<HTMLDivElement>(null);

        // A. Shared Business Logic for Actions (Keyboard or Mouse)
        // Accepts the Context from the hook, or a manual context from mouse
        const handleAction = (ctx: VirtualGridActionContext<GridItem>) => {
            const { item, setFocus, row, col } = ctx;

            console.log(`Action triggered on item: ${item.id}`);
            alert(`Action: ${item.id}`);

            // We can control focus here safely!
            setFocus({ row, col });
        };

        // 1. Hook with 2 columns
        const { virtualRows, gridContainerProps, gridContentProps, focus, setFocus, getRowProps } = useVirtualGrid({
            items: myData,
            columnCount: 2, // <--- 2 Columns
            parentRef,
            estimateSize: () => 40,
            containerHeight: '300px',
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
                            const item = myData[row.index];
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

export const InfiniteScroll: StoryObj = {
    render: () => {
        const parentRef = useRef<HTMLDivElement>(null);

        // State
        const [items, setItems] = useState<GridItem[]>([]);
        const [isLoading, setIsLoading] = useState(false);
        const [hasMore, setHasMore] = useState(true);

        // Initial Load
        useEffect(() => {
            // Reset counter on mount for fresh story experience
            idCounter = 0;
            setItems([]);
            setHasMore(true);

            // Trigger first load
            const loadInitial = async () => {
                setIsLoading(true);
                const initial = await fetchMockData(20);
                setItems(initial);
                setIsLoading(false);
            };
            loadInitial();

            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);

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
                                    <span className="font-mono text-gray-400 mr-3 w-8">{item.id}</span>
                                    <span>{item.title}</span>
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
