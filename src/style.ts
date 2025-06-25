import { definePreset } from '@primeng/themes';
import Material from '@primeng/themes/material';

export const MyPreset = definePreset(Material, {
    semantic: {
        colorScheme: {
            light: {
                primary: {
                    50: '{blue.50}',
                    100: '{blue.100}',
                    200: '{blue.200}',
                    300: '{blue.300}',
                    400: '{blue.400}',
                    500: '{blue.500}',
                    600: '{blue.600}',
                    700: '{blue.700}',
                    800: '{blue.800}',
                    900: '{blue.900}',
                    950: '{blue.950}'
                },
                overlay: {
                    modal: {
                        borderRadius: '1.5rem'
                    },
                    popover: {
                        borderRadius: '10px'
                    }
                },
                highlight: {
                    background: '{blue.700}',
                    focusBackground: '{blue.700}',
                    color: '#ffffff',
                    focusColor: '#ffffff',
                },
                custom: {
                    'multiselect-background': '{blue.500}',
                },
            },
            dark: {
                primary: {
                    50: '{indigo.50}',
                    100: '{indigo.100}',
                    200: '{indigo.200}',
                    300: '{indigo.300}',
                    400: '{indigo.400}',
                    500: '{indigo.500}',
                    600: '{indigo.600}',
                    700: '{indigo.700}',
                    800: '{indigo.800}',
                    900: '{indigo.900}',
                    950: '{indigo.950}',
                },
                highlight: {
                    background: 'rgba(4, 19, 179, 0.16)',
                    focusBackground: 'rgba(5, 22, 154, 0.24)',
                    color: 'rgba(255,255,255,.87)',
                    focusColor: 'rgba(255,255,255,.87)',
                },
                custom: {
                    cardcolor: '{green.500}',
                },
            },
        },
    },
    components: {
        menubar: {
            colorScheme: {
                light: {
                    root: {
                        background: '#1e2a38',
                        color: '#ffffff'
                    },
                    item: {
                        background: 'transparent', // Default for top-level items
                        color: '#ffffff',
                        focusColor: '#ffffff',
                        activeColor: '#ffffff',
                        hoverBackground: '#2e3b4d',
                        activeBackground: '#3a4b63'
                    },
                    submenu: {
                        background: '#273444',
                        color: '#ffffff',
                        border: 'none',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                    },
                    submenuItem: {
                        background: '#273444',
                        color: '#ffffff',
                        hoverBackground: '#2e3b4d'
                    }
                },
                dark: {
                    root: {
                        background: '#1e2a38',
                        color: '#ffffff'
                    },
                    item: {
                        background: 'transparent',
                        color: '#ffffff',
                        focusColor: '#ffffff',
                        activeColor: '#ffffff',
                        hoverBackground: '#2e3b4d',
                        activeBackground: '#3a4b63'
                    },
                    submenu: {
                        background: '#273444',
                        color: '#ffffff',
                        border: 'none',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                    },
                    submenuItem: {
                        background: '#273444',
                        color: '#ffffff',
                        hoverBackground: '#2e3b4d'
                    }
                }
            }
        }
    }
});
