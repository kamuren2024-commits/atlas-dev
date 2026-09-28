export const typography = {
  fonts: {
    sans: '"Inter Variable", "Inter", ui-sans-serif, system-ui, sans-serif',
    display: '"Space Grotesk", system-ui, sans-serif',
    mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
  },
  sizes: {
    display: {
      large: 'text-[64px] font-display tracking-tight leading-none',
      medium: 'text-[48px] font-display tracking-tight leading-none',
      small: 'text-[36px] font-display tracking-tight leading-none',
    },
    heading: {
      h1: 'text-[40px] font-display font-medium tracking-tight leading-tight',
      h2: 'text-[32px] font-display font-medium tracking-tight leading-tight',
      h3: 'text-[24px] font-sans font-medium tracking-tight leading-snug',
      h4: 'text-[20px] font-sans font-medium tracking-tight leading-snug',
    },
    body: {
      primary: 'text-[16px] leading-[1.625]',
      secondary: 'text-[14px] leading-[1.5]',
      metadata: 'text-[12px] leading-[1.4]',
      micro: 'text-[11px] leading-none font-mono',
    }
  }
};
