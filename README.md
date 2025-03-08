# bitUI Framework

A simple, lightweight CSS framework for creating clean, responsive web layouts with minimal complexity.

## Features

- **Simple 12-column grid system** - Easy to understand row > column > panel structure
- **Flex columns** - Automatic column sizing based on container width
- **Panel components** - Consistent content containers with light and dark variants
- **Four themes** - Light, warm, dim, and dark themes with smooth transitions
- **Responsive by default** - Mobile-first design that works on all screen sizes
- **Minimal footprint** - Lightweight with no JavaScript dependencies
- **Form and button styling** - Clean, consistent form elements and button styles
- **CSS variables** - Easy customization of colors, spacing, and typography

## Quick Start

1. Add the CSS to your project:

```html
<link rel="stylesheet" href="src/styles/bitui.css">
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

## Grid System

- Use `row` to create a row container
- Use `col-1` through `col-12` for fixed-width columns
- Use `col-flex` for auto-adjusting columns
- Nest rows and columns for complex layouts

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
