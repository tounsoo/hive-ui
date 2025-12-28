import React, { useState, useEffect, useCallback } from 'react';
import { useVirtualizer, type VirtualItem } from '@tanstack/react-virtual';

export interface VirtualGridActionContext<T> {
    item: T;
    row: number;
    col: number;
    setFocus: React.Dispatch<React.SetStateAction<{ row: number; col: number }>>;
}

export interface UseVirtualGridOptions<T> {
    items: T[];
    columnCount: number;
    parentRef: React.RefObject<HTMLDivElement | null>;
    estimateSize?: () => number;
    overscan?: number;
    onItemAction?: (context: VirtualGridActionContext<T>) => void;
    containerHeight?: number | string;
    onEndReached?: () => void;
    endReachedThreshold?: number;
}

export interface UseVirtualGridResult {
    virtualRows: VirtualItem[];
    totalSize: number;
    focus: { row: number; col: number };
    setFocus: React.Dispatch<React.SetStateAction<{ row: number; col: number }>>;
    handleKeyDown: (e: React.KeyboardEvent) => void;
    gridContainerProps: React.HTMLAttributes<HTMLElement>;
    gridContentProps: React.HTMLAttributes<HTMLDivElement>;
    getRowProps: (row: VirtualItem) => React.HTMLAttributes<HTMLElement>;
}

export function useVirtualGrid<T>({
    items,
    columnCount,
    parentRef,
    estimateSize = () => 50,
    overscan = 5,
    onItemAction,
    containerHeight,
    onEndReached,
    endReachedThreshold = 2,
}: UseVirtualGridOptions<T>): UseVirtualGridResult {
    // 1. Navigation State
    const [focus, setFocus] = useState({ row: 0, col: 0 });

    // 2. Virtualizer
    const rowVirtualizer = useVirtualizer({
        count: items.length,
        getScrollElement: () => parentRef.current,
        estimateSize,
        overscan,
    });

    // 3. Auto-scroll to focused row
    useEffect(() => {
        rowVirtualizer.scrollToIndex(focus.row, { align: 'auto' });
    }, [focus.row, rowVirtualizer]);

    // 4. Keyboard Logic
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            const rowCount = items.length;
            const { row, col } = focus;

            switch (e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    (e.currentTarget as HTMLElement).focus(); // Reclaim focus
                    setFocus((p) => ({ ...p, row: Math.max(0, p.row - 1) }));
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    (e.currentTarget as HTMLElement).focus(); // Reclaim focus
                    setFocus((p) => ({ ...p, row: Math.min(rowCount - 1, p.row + 1) }));
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    (e.currentTarget as HTMLElement).focus(); // Reclaim focus
                    setFocus((p) => ({ ...p, col: Math.max(0, p.col - 1) }));
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    (e.currentTarget as HTMLElement).focus(); // Reclaim focus
                    setFocus((p) => ({ ...p, col: Math.min(columnCount - 1, p.col + 1) }));
                    break;
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    if (onItemAction) {
                        onItemAction({
                            item: items[row],
                            row,
                            col,
                            setFocus
                        });
                    }
                    break;
            }
        },
        [focus, items, columnCount, onItemAction]
    );

    // 5. Props
    const gridContainerProps: React.HTMLAttributes<HTMLElement> = {
        role: 'grid',
        tabIndex: 0,
        'aria-activedescendant': `cell-${focus.row}-${focus.col}`,
        onKeyDown: handleKeyDown,
        style: {
            height: containerHeight,
            overflow: 'auto',
            position: 'relative',
        },
    };

    // 6. Helper for Row Props
    const getRowProps = (row: VirtualItem): React.HTMLAttributes<HTMLElement> => ({
        role: 'row',
        'aria-rowindex': row.index + 1,
        style: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: `${row.size}px`,
            transform: `translateY(${row.start}px)`,
        },
    });

    // 7. Inner Container Props
    const gridContentProps: React.HTMLAttributes<HTMLDivElement> = {
        style: {
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
        },
    };

    const virtualRows = rowVirtualizer.getVirtualItems();

    // 8. Infinite Scroll
    useEffect(() => {
        if (!onEndReached || virtualRows.length === 0) return;

        const lastItem = virtualRows[virtualRows.length - 1];
        if (lastItem.index >= items.length - 1 - endReachedThreshold) {
            onEndReached();
        }
    }, [virtualRows, items.length, endReachedThreshold, onEndReached]);

    return {
        virtualRows,
        totalSize: rowVirtualizer.getTotalSize(),
        focus,
        setFocus,
        handleKeyDown,
        gridContainerProps,
        gridContentProps,
        getRowProps,
    };
}
