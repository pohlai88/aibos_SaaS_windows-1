# AI-BOS OS Template System Guide

## 🎨 Overview

The AI-BOS OS Template System is a sophisticated theming and customization framework that provides:

- **4 Professional Dashboard Templates** (2 Light, 2 Dark themes)
- **Tenant Customization** through skin uploads
- **Semantic Component Recognition** for smart styling
- **Template Stacking** (separation of layout and styling)
- **Real-time Preview** and theme switching

## 🏗️ Architecture

### Core Principles

1. **Template Stacking**: Base templates provide structure, custom skins provide styling
2. **Semantic Recognition**: Components are identified by their semantic meaning, not just CSS classes
3. **Fixed Layout, Flexible Skins**: Layout remains consistent while visual appearance changes
4. **Real-time Application**: Changes apply instantly without page refresh

### File Structure

```
interfaces/web/
├── template-system.js      # Core template system logic
├── template-system.css     # Theme variables and component styles
├── template-system.html    # Template system interface
└── TEMPLATE_SYSTEM_GUIDE.md # This documentation
```

## 🎯 Available Themes

### 1. Developer Workspace Light
- **Category**: Light
- **Best For**: Development teams, coding sessions
- **Features**: Clean, modern, excellent readability
- **Colors**: Blue accent (#3b82f6), white background

### 2. Developer Workspace Dark
- **Category**: Dark
- **Best For**: Extended coding sessions, low-light environments
- **Features**: Dark theme, reduces eye strain
- **Colors**: Blue accent (#60a5fa), dark background (#0f172a)

### 3. Enterprise Light
- **Category**: Light
- **Best For**: Business presentations, client meetings
- **Features**: Professional, corporate styling
- **Colors**: Dark accent (#1f2937), clean white background

### 4. Enterprise Dark
- **Category**: Dark
- **Best For**: High-end business applications
- **Features**: Sophisticated, premium appearance
- **Colors**: Gold accent (#fbbf24), dark background (#111827)

## 🔧 How to Use

### Basic Theme Switching

```javascript
// Switch to a different theme
templateSystem.loadTheme('developer-dark');

// Get current theme
const currentTheme = templateSystem.getCurrentTheme();

// Get all available themes
const themes = templateSystem.getAllThemes();
```

### Custom Skin Upload

#### 1. JSON Skin Format

```json
{
  "componentType": "button",
  "styles": {
    "--button-primary-bg": "#ff6b6b",
    "--button-primary-text": "#ffffff",
    "--accent-color": "#4ecdc4",
    "--accent-hover": "#45b7aa"
  }
}
```

#### 2. CSS Skin Format

```css
/* Custom button styling */
button, .btn {
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  border-radius: 25px;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
}

/* Custom card styling */
.card, .dashboard-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

### Drag & Drop Upload

1. Navigate to the Template System interface
2. Drag skin files (JSON or CSS) to the upload area
3. Files are automatically processed and applied
4. See real-time preview of changes

## 🧠 Semantic Component Recognition

The system automatically detects and styles components based on their semantic meaning:

### Recognized Components

| Component Type | Selectors | Description |
|----------------|-----------|-------------|
| `button` | `button, .btn, [role="button"]` | All interactive buttons |
| `card` | `.card, .dashboard-card, .widget` | Content containers |
| `input` | `input, textarea, select` | Form elements |
| `navigation` | `nav, .navbar, .sidebar` | Navigation components |
| `table` | `table, .table` | Data tables |
| `modal` | `.modal, .dialog, [role="dialog"]` | Overlay dialogs |
| `alert` | `.alert, .notification, .toast` | Status messages |
| `progress` | `.progress, .progress-bar` | Progress indicators |
| `badge` | `.badge, .tag, .label` | Small labels/tags |

### Adding New Component Types

```javascript
// Extend the semantic selectors
const newSelectors = {
    'custom-component': '.custom, .my-component',
    'chart': '.chart, .graph, .visualization'
};

// The system will automatically detect and style these
```

## 🎨 CSS Variables System

### Base Variables

All themes use CSS custom properties for consistent styling:

```css
:root {
    /* Base Colors */
    --primary-bg: #ffffff;
    --secondary-bg: #f8fafc;
    --tertiary-bg: #f1f5f9;
    --primary-text: #1e293b;
    --secondary-text: #64748b;
    --accent-color: #3b82f6;
    --accent-hover: #2563eb;
    
    /* Component Colors */
    --card-bg: #ffffff;
    --input-bg: #ffffff;
    --button-primary-bg: #3b82f6;
    --button-primary-text: #ffffff;
    
    /* Typography */
    --font-family: 'Inter', sans-serif;
    --font-size-sm: 0.875rem;
    --font-size-base: 1rem;
    
    /* Spacing */
    --spacing-xs: 0.25rem;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    
    /* Border Radius */
    --radius-sm: 0.25rem;
    --radius-md: 0.375rem;
    --radius-lg: 0.5rem;
    
    /* Shadows */
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.1);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    
    /* Transitions */
    --transition-fast: 150ms ease-in-out;
    --transition-normal: 250ms ease-in-out;
}
```

### Using Variables in Custom CSS

```css
.my-custom-component {
    background: var(--card-bg);
    color: var(--primary-text);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: var(--spacing-md);
    box-shadow: var(--shadow-sm);
    transition: all var(--transition-normal);
}
```

## 🚀 Advanced Features

### Theme Configuration Export/Import

```javascript
// Export current theme configuration
templateSystem.exportThemeConfig();

// Import theme configuration
const config = {
    currentTheme: 'developer-dark',
    customSkins: {
        button: { '--button-primary-bg': '#ff6b6b' },
        card: { '--card-bg': '#fef7ff' }
    }
};
templateSystem.importThemeConfig(config);
```

### Real-time Component Observation

The system automatically detects new components added to the DOM:

```javascript
// New components are automatically styled
const newButton = document.createElement('button');
newButton.textContent = 'New Button';
document.body.appendChild(newButton);
// Button automatically gets theme styling applied
```

### Custom Skin Application

```javascript
// Apply skin to specific component type
templateSystem.uploadCustomSkin({
    componentType: 'button',
    styles: {
        '--button-primary-bg': '#ff6b6b',
        '--button-primary-text': '#ffffff',
        'border-radius': '25px',
        'box-shadow': '0 4px 15px rgba(255, 107, 107, 0.3)'
    }
});
```

## 📱 Responsive Design

The template system includes responsive design considerations:

- **Mobile-first approach** with breakpoints at 768px
- **Flexible grid layouts** that adapt to screen size
- **Touch-friendly interface** elements
- **Optimized spacing** for different screen sizes

## 🔒 Security Considerations

### File Upload Security

- Only JSON and CSS files are accepted
- File content is validated before application
- No executable code is allowed
- File size limits prevent abuse

### Theme Isolation

- Custom skins are isolated per component type
- No cross-component contamination
- Reset functionality available
- Backup of original theme settings

## 🛠️ Integration with AI-BOS OS

### Module Integration

The template system is designed to work seamlessly with the AI-BOS OS module system:

```javascript
// In a module's dashboard
class MyModuleDashboard {
    constructor() {
        // Automatically inherits current theme
        this.element = document.createElement('div');
        this.element.className = 'module-dashboard card';
        
        // Theme system automatically applies styling
        document.body.appendChild(this.element);
    }
}
```

### Tenant Customization

Each tenant can have their own custom skins:

```javascript
// Tenant-specific skin application
function applyTenantSkin(tenantId, skinConfig) {
    // Store tenant skin preferences
    localStorage.setItem(`tenant-${tenantId}-skin`, JSON.stringify(skinConfig));
    
    // Apply if current tenant
    if (getCurrentTenantId() === tenantId) {
        templateSystem.importThemeConfig(skinConfig);
    }
}
```

## 📊 Performance Optimization

### Efficient Theme Switching

- CSS variables provide instant theme switching
- No DOM manipulation required
- Minimal reflow/repaint
- Smooth transitions between themes

### Lazy Loading

- Theme assets loaded on demand
- Custom skins cached locally
- Minimal initial bundle size
- Progressive enhancement

## 🧪 Testing

### Theme Testing Checklist

- [ ] All themes load correctly
- [ ] Custom skins apply properly
- [ ] Component recognition works
- [ ] Responsive design functions
- [ ] Performance is acceptable
- [ ] Accessibility maintained
- [ ] Cross-browser compatibility

### Automated Testing

```javascript
// Example test for theme switching
describe('Template System', () => {
    test('should switch themes correctly', () => {
        templateSystem.loadTheme('developer-dark');
        expect(templateSystem.getCurrentTheme()).toBe('developer-dark');
        
        const root = document.documentElement;
        expect(root.style.getPropertyValue('--primary-bg')).toBe('#0f172a');
    });
});
```

## 🔮 Future Enhancements

### Planned Features

1. **Theme Marketplace**: Share and download community themes
2. **Advanced Animations**: Custom transition effects
3. **Accessibility Themes**: High contrast, large text options
4. **Seasonal Themes**: Automatic theme switching based on time/date
5. **AI-Generated Themes**: Machine learning theme suggestions

### Extension Points

```javascript
// Plugin system for custom theme engines
class CustomThemeEngine {
    constructor() {
        this.name = 'My Custom Engine';
        this.version = '1.0.0';
    }
    
    applyTheme(themeData) {
        // Custom theme application logic
    }
    
    detectComponents() {
        // Custom component detection
    }
}

// Register custom engine
templateSystem.registerEngine(new CustomThemeEngine());
```

## 📚 Examples

### Complete Skin Example

```json
{
  "name": "Neon Cyberpunk",
  "description": "Bright neon colors for futuristic interfaces",
  "version": "1.0.0",
  "author": "Your Name",
  "components": {
    "button": {
      "styles": {
        "--button-primary-bg": "#00ff88",
        "--button-primary-text": "#000000",
        "--accent-color": "#ff0080",
        "--accent-hover": "#ff40a0",
        "border-radius": "25px",
        "box-shadow": "0 0 20px rgba(0, 255, 136, 0.5)"
      }
    },
    "card": {
      "styles": {
        "--card-bg": "rgba(0, 0, 0, 0.8)",
        "--border-color": "#00ff88",
        "--primary-text": "#ffffff",
        "backdrop-filter": "blur(10px)",
        "border": "1px solid #00ff88"
      }
    }
  }
}
```

### CSS Skin Example

```css
/* Neon Cyberpunk Theme */
:root {
    --primary-bg: #000000;
    --secondary-bg: #1a1a1a;
    --accent-color: #00ff88;
    --accent-hover: #ff0080;
}

button, .btn {
    background: linear-gradient(45deg, #00ff88, #ff0080);
    color: #000000;
    border: none;
    border-radius: 25px;
    padding: 12px 24px;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1px;
    box-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
    transition: all 0.3s ease;
}

button:hover, .btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 30px rgba(255, 0, 128, 0.7);
}

.card, .dashboard-card {
    background: rgba(0, 0, 0, 0.8);
    border: 1px solid #00ff88;
    border-radius: 15px;
    backdrop-filter: blur(10px);
    box-shadow: 0 0 30px rgba(0, 255, 136, 0.2);
}
```

## 🆘 Troubleshooting

### Common Issues

1. **Theme not applying**: Check if CSS variables are properly set
2. **Custom skins not working**: Verify JSON format and component type
3. **Performance issues**: Check for excessive DOM manipulation
4. **Responsive problems**: Verify media queries are working

### Debug Mode

```javascript
// Enable debug mode for troubleshooting
templateSystem.debug = true;

// Check current state
console.log('Current theme:', templateSystem.getCurrentTheme());
console.log('Custom skins:', templateSystem.customSkins);
console.log('Detected components:', templateSystem.semanticComponents);
```

## 📞 Support

For questions, issues, or contributions:

1. Check this documentation first
2. Review the example files
3. Test with the provided interface
4. Report issues with detailed information

---

**The AI-BOS OS Template System** - Making beautiful, customizable dashboards accessible to everyone. 