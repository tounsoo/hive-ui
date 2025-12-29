import { createContext } from 'react';

export interface DialogContextValue {
    setTitleId: (id: string) => void;
}

export const DialogContext = createContext<DialogContextValue | null>(null);
