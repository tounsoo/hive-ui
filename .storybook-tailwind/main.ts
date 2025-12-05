import type { StorybookConfig } from '@storybook/react-vite';
import tailwindcss from '@tailwindcss/vite';

const config: StorybookConfig = {
    "stories": [
        "../src/**/*.tailwind.stories.@(js|jsx|mjs|ts|tsx)"
    ],
    "addons": [
        "@chromatic-com/storybook",
        "@storybook/addon-a11y",
        "@storybook/addon-docs"
    ],
    "framework": "@storybook/react-vite",
    async viteFinal(config) {
        // Ensure plugins array exists
        if (!config.plugins) {
            config.plugins = [];
        }
        // Add Tailwind plugin
        config.plugins.push(tailwindcss());
        return config;
    },
};
export default config;
