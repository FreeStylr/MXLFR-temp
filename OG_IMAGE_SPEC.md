# OG Preview Image Specification

## File Details
- **Filename**: `og-preview-france-light.jpg`
- **Location**: `/public/assets/og-preview-france-light.jpg`
- **Dimensions**: 1200 × 630 px (standard OG image size)
- **File Size**: < 250 KB (optimized for fast loading)
- **Format**: JPG (for optimal compression)

## Design Specifications

### Background
- **Base Color**: White (#FFFFFF)
- **Gradient Overlay**: Subtle gradient from white to pale gray (#F9FAFB)
- **Direction**: Diagonal, top-left to bottom-right

### Accent Elements
- **Diagonal Line**: Thin teal line (#2DD4BF) at 15-degree angle
- **Position**: Starting from top-right, extending to bottom-left
- **Thickness**: 4-6px
- **Optional**: Subtle cyan (#38BDF8) secondary accent

### Typography

#### Main Brand Name
- **Text**: "MAXILOCAL FRANCE"
- **Font**: Poppins Bold or Inter Extra Bold
- **Size**: 72-80pt
- **Color**: Black (#111827)
- **Kerning**: Slightly tightened (-20)
- **Position**: Upper third of canvas, left-aligned with 80px margin

#### Tagline
- **Text**: "Connecter les marques au cœur des territoires."
- **Font**: Inter Regular or Light
- **Size**: 32-36pt
- **Color**: Dark Gray (#374151)
- **Position**: Below brand name, 24px gap

#### Copyright
- **Text**: "© 2025 Maxilocal France"
- **Font**: Inter Regular
- **Size**: 16pt
- **Color**: Light Gray (#9CA3AF)
- **Position**: Bottom-right corner, 40px margins

### Layout Grid
- **Margins**: 80px on all sides (safe area)
- **Content Area**: 1040 × 470 px
- **Alignment**: Left-aligned text with generous whitespace
- **Spacing**: Hierarchical spacing between text elements

### Color Palette
```
White Background: #FFFFFF
Pale Gray: #F9FAFB
Teal Accent: #2DD4BF
Cyan Accent: #38BDF8
Black Text: #111827
Dark Gray: #374151
Medium Gray: #6B7280
Light Gray: #9CA3AF
```

### Export Settings
- **Format**: JPG
- **Quality**: 85-90% (balance between quality and file size)
- **Color Space**: sRGB
- **Resolution**: 72 DPI (web standard)
- **Compression**: Optimize for web

## Implementation Notes

1. Ensure all text is rendered, not embedded as system fonts
2. Test preview appearance on:
   - Facebook posts and shares
   - Twitter cards
   - LinkedIn posts
   - WhatsApp and messaging apps
3. Verify contrast ratios meet accessibility standards (WCAG AA minimum)
4. Test loading speed and caching behavior

## Alternative Formats (Optional)
- Create a PNG version for platforms requiring transparency
- Create 2x version (2400 × 1260 px) for high-DPI displays
- Create square version (1200 × 1200 px) for platforms like Instagram

## Tool Recommendations
- **Design**: Figma, Adobe Illustrator, or Canva
- **Export**: ImageOptim, TinyPNG, or Squoosh for compression
- **Preview Testing**: Facebook Sharing Debugger, Twitter Card Validator

## Content to Include (FINAL)
Only the following text should appear on the image:
- **MAXILOCAL FRANCE** (main brand name)
- **Connecter les marques au cœur des territoires.** (tagline)
- **© 2025 Maxilocal France** (copyright)

**DO NOT include**: Any reference to MXL Group or Helsinki
