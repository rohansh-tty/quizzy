// Font Configuration - Change fonts here in one place
// TO CHANGE FONT: Change the fontName below to any of: 'inter', 'poppins', 'roboto', 'openSans', 'montserrat', 'nunito'
const FONT_NAME: 'inter' | 'poppins' | 'roboto' | 'openSans' | 'montserrat' | 'nunito' = 'openSans'; // CHANGE THIS LINE TO SWITCH FONTS

// Predefined font configurations for easy switching
export const FONT_PRESETS = {
  inter: {
    name: 'Inter',
    url: 'https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap',
    family: 'Inter'
  },
  poppins: {
    name: 'Poppins',
    url: 'https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap',
    family: 'Poppins'
  },
  roboto: {
    name: 'Roboto',
    url: 'https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700;900&display=swap',
    family: 'Roboto'
  },
  openSans: {
    name: 'Open Sans',
    url: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700;800&display=swap',
    family: 'Open Sans'
  },
  montserrat: {
    name: 'Montserrat',
    url: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@100;200;300;400;500;600;700;800;900&display=swap',
    family: 'Montserrat'
  },
  nunito: {
    name: 'Nunito',
    url: 'https://fonts.googleapis.com/css2?family=Nunito:wght@200;300;400;500;600;700;800;900&display=swap',
    family: 'Nunito'
  }
};

// Get the selected font configuration
const selectedFont = FONT_PRESETS[FONT_NAME];

export const FONT_CONFIG = {
  // Primary font family
  primary: selectedFont.family,
  
  // Google Fonts URL - Update this to change fonts
  googleFontsUrl: selectedFont.url,
  
  // Font family stack with fallbacks
  fontFamily: {
    sans: [
      selectedFont.family,
      'ui-sans-serif',
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Helvetica Neue',
      'Arial',
      'Noto Sans',
      'sans-serif'
    ],
    inter: ['Inter', 'sans-serif'],
    // Add more font families as needed
    poppins: ['Poppins', 'sans-serif'],
    roboto: ['Roboto', 'sans-serif'],
    openSans: ['Open Sans', 'sans-serif'],
  },
  
  // Font weights available
  weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
  
  // CSS variables for easy theming
  cssVariables: {
    '--font-primary': selectedFont.family,
    '--font-fallback': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  }
};

// Helper function to get font configuration
export const getFontConfig = (fontName: keyof typeof FONT_PRESETS = 'poppins') => {
  const preset = FONT_PRESETS[fontName];
  return {
    ...FONT_CONFIG,
    primary: preset.family,
    googleFontsUrl: preset.url,
    fontFamily: {
      ...FONT_CONFIG.fontFamily,
      sans: [
        preset.family,
        'ui-sans-serif',
        'system-ui',
        '-apple-system',
        'BlinkMacSystemFont',
        'Segoe UI',
        'Roboto',
        'Helvetica Neue',
        'Arial',
        'Noto Sans',
        'sans-serif'
      ],
      [fontName]: [preset.family, 'sans-serif'],
    },
    cssVariables: {
      '--font-primary': preset.family,
      '--font-fallback': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    }
  };
};

// Export default configuration
export default FONT_CONFIG; 