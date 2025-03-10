# bitUI Framework

A simple, lightweight CSS framework for creating clean, responsive web layouts with minimal complexity.

## Features

- **Unified grid system** - Traditional 12-column grid, auto grid, and masonry layouts in one system
- **Flexible layouts** - Choose between traditional columns, auto-fill, auto-fit, or fixed column counts
- **Panel components** - Consistent content containers with light and dark variants
- **Four themes** - Light, warm, dim, and dark themes with smooth transitions
- **Responsive by default** - Mobile-first design that works on all screen sizes
- **Minimal footprint** - Lightweight with no JavaScript dependencies
- **Form and button styling** - Clean, consistent form elements and button styles
- **CSS variables** - Easy customization of colors, spacing, and typography

## Quick Start

1. Add the CSS to your project:

```html
<link rel="stylesheet" href="src/styles/main.css">
```

2. Set a theme (optional, defaults to light):

```html
<html lang="en" data-theme="dark">
```

3. Create your layout:

```html
<div class="container">
  <div class="row">
    <div class="col-6">
      <div class="panel dark">
        <h2>Left Column</h2>
        <p>Content goes here</p>
      </div>
    </div>
    <div class="col-6">
      <div class="panel light">
        <h2>Right Column</h2>
        <p>Content goes here</p>
      </div>
    </div>
  </div>
</div>
```

## Important Note

The framework uses CSS `@import` statements to organize styles into separate files. When working locally, you'll need to run a simple HTTP server to properly load all CSS files:

```bash
# Using Python (recommended)
python3 -m http.server

# Or with Node.js
npx serve
```

Then access your site at http://localhost:8000 (or the port shown in your terminal).

## Unified Grid System

bitUI offers multiple grid approaches in one unified system:

### 1. Traditional Column Grid

- Use `row` to create a row container
- Use `col-1` through `col-12` for fixed-width columns
- Position columns with `.center`, `.right`, or `.left` classes

```html
<div class="row">
  <div class="col-6">Half width</div>
  <div class="col-6">Half width</div>
</div>
```

### 2. Auto Grid

- Use `grid` for automatically sized, responsive columns
- Items adjust based on available width and content

```html
<div class="grid">
  <div>Auto item</div>
  <div>Auto item</div>
  <div>Auto item</div>
</div>
```

### 3. Fixed Column Grid

- Use `grid cols-*` for a specific number of columns (1-6)

```html
<div class="grid cols-3">
  <div>Always 3 columns</div>
  <div>Always 3 columns</div>
  <div>Always 3 columns</div>
</div>
```

### 4. Masonry Grid

- Use `grid dense` for traditional masonry layout
- Use `grid fit dense` for adaptive masonry
- Add `.wide`, `.tall`, or `.large` to items for different sizes

```html
<div class="grid dense">
  <div class="tall">Tall item</div>
  <div>Normal item</div>
  <div class="wide">Wide item</div>
</div>
```

## Styling Components

### Typography

```html
<h1>Heading 1</h1>
<p class="f-danger">Error message</p>
<p class="f-heavy">Bold text</p>
<p class="f-small">Small text</p>
```

### Alignment

```html
<div class="flex center">Centered flex container</div>
<p class="left">Left-aligned text</p>
<p class="center">Centered text</p>
<p class="right">Right-aligned text</p>
```

### Form Elements

```html
<input type="text" placeholder="Standard input">
<input type="text" class="danger" placeholder="Error input">
<button class="btn confirm">Confirm Button</button>
<button class="btn danger">Delete Button</button>
```

## License

bitUI is licensed under the MIT License.
