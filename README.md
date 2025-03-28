![zoomable](https://github.com/user-attachments/assets/eda8c6b2-03ee-4a28-bc5f-262540863f3e)

# @benbjurstrom/alpinejs-zoomable

A fullscreen image viewer (lightbox) for Alpine.js, which offers modern accessibility features.

## Installation

### Via NPM
```bash
npm install @benbjurstrom/alpinejs-zoomable
```

Then initialize it inside your bundle:

```javascript
import Alpine from 'alpinejs'
import Zoomable from '@benbjurstrom/alpinejs-zoomable'

// Attach the plugin
Alpine.plugin(Zoomable)

Alpine.start()
```

### Via CDN

Add the following script tag BEFORE your Alpine.js core script:

```html
<!-- Zoomable Plugin (example version) -->
<script defer src="https://unpkg.com/@benbjurstrom/alpinejs-zoomable@0.5.0/dist/cdn.min.js"></script>

<!-- Alpine Core -->
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.1/dist/cdn.min.js"></script>
```

## Usage

1. Ensure you have an Alpine component scope somewhere in your DOM (e.g., a parent element with `x-data`).  
2. Add the `x-zoomable` directive to any <img> element that you wish to enlarge on click.

Example:
```html
<div x-data>
  <img x-zoomable src="example.jpg" alt="A scenic vista" />
</div>
```

When the image is clicked, a fullscreen view will open, allowing zooming and dragging. Pressing the Escape key, clicking outside the image, or pressing the close button will exit the fullscreen view.

## Custom CSS

To allow for maxiumum customization this plugin does not include any styles. Below is an example CSS snippet you can include in your project to ensure a pleasant fullscreen experience. Feel free to customize as needed:

```css
<style>
    img[x-zoomable]:hover {
        cursor: zoom-in;
    }

    .zoomable-fullscreen-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        background: rgba(255,255,255, 0.9);
        display: none;
        z-index: 998;
        cursor: zoom-out;
        overflow: hidden;
        touch-action: none;
    }

    .zoomable-fullscreen-image {
        position: absolute;
        max-height: none;
        max-width: none;
        cursor: grab;
        transition: transform 0.2s ease-out;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        touch-action: none;
        -webkit-user-select: none;
        user-select: none;
    }

    .zoomable-fullscreen-image.dragging {
        cursor: grabbing;
        transition: none;
    }

    .zoomable-controls-panel {
        position: fixed;
        top: 20px;
        right: 20px;
        display: flex;
        gap: 10px;
        z-index: 999;
    }

    .zoomable-control-button {
        background: #a1a1aa;
        border: none;
        color: white;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s;
    }

    .zoomable-control-button > svg {
        width: 20px;
        height: 20px;
    }

    .zoomable-control-button:hover,
    .zoomable-control-button:focus {
        background: #71717a;
        outline: none;
    }

    @media (max-width: 768px) {
        .zoomable-controls-panel {
            top: 10px;
            right: 10px;
        }

        .zoomable-control-button {
            width: 44px;
            height: 44px;
            -webkit-tap-highlight-color: transparent; /* Prevents gray flash on iOS */
            touch-action: manipulation; /* Optimize for touch */
        }
    }

    .zoomable-loading-indicator {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 1000;
        display: flex;
        flex-direction: column;
        align-items: center;
        color: #737373;
        font-size: 1rem;
    }

    .zoomable-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid rgba(255, 255, 255, 0.3);
        border-top: 4px solid #737373;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 10px;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    .zoomable-loading-indicator[hidden] {
        display: none;
    }
</style>
```

Add the above CSS to your <head> or your app.css file.
