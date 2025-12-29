import React, { useContext, type ElementType, type HTMLAttributes } from 'react';
import styles from './Dialog.module.css';
import { DialogContext } from './DialogContext';

export interface DialogTitleProps extends HTMLAttributes<HTMLHeadingElement> {
    /**
     * The component or tag to render the title as.
     * @default 'h2'
     */
    as?: ElementType;
}

export const DialogTitle = ({ as: Component = 'h2', className, children, id, ...rest }: DialogTitleProps) => {
    const context = useContext(DialogContext);
    const generatedId = React.useId();
    const titleId = id || generatedId;

    React.useEffect(() => {
        if (context) {
            context.setTitleId(titleId);
        }
    }, [context, titleId]);

    return (
        <Component
            id={titleId}
            className={`${styles.title} ${className || ''}`.trim()}
            {...rest}
        >
            {children}
        </Component>
    );
};
