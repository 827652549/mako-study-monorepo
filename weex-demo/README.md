# Weex Demo

Minimal Weex demo project for interview preparation.

## Quick Start

```bash
npm install
npm run dev        # Web preview at http://localhost:8080
npm run build      # Build web bundle
npm run build:weex # Build Weex JS bundle (for native)
```

## Project Structure

```
src/
  app.vue          # Root app component
  components/
    hello.vue      # Basic Weex component demo
    list.vue       # Weex <list> component demo
  entry.js         # Web entry
  entry.weex.js    # Weex native entry
build/
  webpack.config.js       # Web build config
  webpack.weex.config.js  # Weex native build config
index.html                # Web preview page
```

## Key Weex Concepts Demonstrated

- Weex-specific tags: `<div>`, `<text>`, `<image>`, `<list>`, `<scroller>`
- Flexbox layout (Weex default)
- Event binding (@click, @appear)
- Data binding & computed properties
- Weex module API: modal, navigator
