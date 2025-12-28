import type { Meta, StoryObj } from '@storybook/react';
import { useRef } from 'react';
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
                                            onClick={(e) => {
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
