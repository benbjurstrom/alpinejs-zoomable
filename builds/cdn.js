// Adapted from the oficial Alpine.js file:
// https://github.com/alpinejs/alpine/blob/main/packages/focus/builds/cdn.js

import plugin from '../src/index.js'

document.addEventListener('alpine:init', () => {
    window.Alpine.plugin(plugin)
})