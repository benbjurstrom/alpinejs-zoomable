export default function (Alpine) {
  // Create a single fullscreen container, image, controls, etc. for reuse.
  let isFullscreen = false;
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let translateX = 0;
  let translateY = 0;
  let currentScale = 1;
  let baseScale = 1;

  // Check if container already exists to avoid duplicates (e.g. in hot-reloading scenarios)
  let container = document.querySelector('.zoomable-fullscreen-container');
  if (!container) {
      container = document.createElement('div');
      container.className = 'zoomable-fullscreen-container';
      container.setAttribute('role', 'dialog');
      container.setAttribute('aria-modal', 'true');
      container.setAttribute('aria-label', 'Image fullscreen modal');
      document.body.appendChild(container);
  }

  // Loading indicator
  let loadingIndicator = container.querySelector('.zoomable-loading-indicator');
  if (!loadingIndicator) {
      loadingIndicator = document.createElement('div');
      loadingIndicator.className = 'zoomable-loading-indicator';
      loadingIndicator.setAttribute('role', 'status');
      loadingIndicator.setAttribute('aria-live', 'polite');

      const spinner = document.createElement('div');
      spinner.className = 'zoomable-spinner';
      const loadingText = document.createElement('div');
      loadingText.textContent = 'Loading Image...';
      loadingIndicator.appendChild(spinner);
      loadingIndicator.appendChild(loadingText);
      container.appendChild(loadingIndicator);
  }

  // Controls panel
  let controlsPanel = container.querySelector('.zoomable-controls-panel');
  if (!controlsPanel) {
      controlsPanel = document.createElement('div');
      controlsPanel.className = 'zoomable-controls-panel';

      const zoomInBtn = document.createElement('button');
      zoomInBtn.className = 'zoomable-control-button zoomable-zoom-in';
      zoomInBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>';
      zoomInBtn.setAttribute('aria-label', 'Zoom in');
      zoomInBtn.setAttribute('tabindex', '0');

      const zoomOutBtn = document.createElement('button');
      zoomOutBtn.className = 'zoomable-control-button zoomable-zoom-out';
      zoomOutBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14" /></svg>';
      zoomOutBtn.setAttribute('aria-label', 'Zoom out');
      zoomOutBtn.setAttribute('tabindex', '0');

      const closeBtn = document.createElement('button');
      closeBtn.className = 'zoomable-control-button zoomable-close';
      closeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>';
      closeBtn.setAttribute('aria-label', 'Close fullscreen view');
      closeBtn.setAttribute('tabindex', '0');

      controlsPanel.appendChild(zoomInBtn);
      controlsPanel.appendChild(zoomOutBtn);
      controlsPanel.appendChild(closeBtn);
      container.appendChild(controlsPanel);
  }

  // Fullscreen image
  let fullscreenImg = container.querySelector('.zoomable-fullscreen-image');
  if (!fullscreenImg) {
      fullscreenImg = document.createElement('img');
      fullscreenImg.className = 'zoomable-fullscreen-image';
      fullscreenImg.setAttribute('alt', '');
      container.appendChild(fullscreenImg);
  }

  // Focus trapping
  const focusableSelectors = 'button';
  let focusableElements = [];
  let firstFocusableElement = null;
  let lastFocusableElement = null;

  function trapFocus(e) {
      if (!isFullscreen) return;
      if (e.key === 'Tab') {
          if (focusableElements.length === 0) return;
          if (e.shiftKey) {
              if (document.activeElement === firstFocusableElement) {
                  lastFocusableElement.focus();
                  e.preventDefault();
              }
          } else {
              if (document.activeElement === lastFocusableElement) {
                  firstFocusableElement.focus();
                  e.preventDefault();
              }
          }
      }
  }

  function setFocusTrap() {
      if (('ontouchstart' in window) ||
          (navigator.maxTouchPoints > 0)) {
          return;
      }

      focusableElements = container.querySelectorAll(focusableSelectors);
      if (focusableElements.length > 0) {
          firstFocusableElement = focusableElements[0];
          lastFocusableElement = focusableElements[focusableElements.length - 1];
          firstFocusableElement.focus();
      }
  }

  function openImage(sourceImg) {
      fullscreenImg.src = sourceImg.src;
      fullscreenImg.alt = sourceImg.alt || 'Enlarged image view';
      container.style.display = 'block';
      isFullscreen = true;
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', trapFocus);

      loadingIndicator.hidden = false;
      translateX = 0;
      translateY = 0;
      currentScale = 1;
      updateImagePosition();

      fullscreenImg.onload = () => {
          const windowRatio = window.innerWidth / window.innerHeight;
          const imageRatio = fullscreenImg.naturalWidth / fullscreenImg.naturalHeight;
          const ratioMismatch = Math.abs(windowRatio - imageRatio);
          baseScale = ratioMismatch > 0.75 ? 1.75 : 1;
          currentScale = baseScale;

          if (imageRatio > windowRatio) {
              const baseWidth = window.innerWidth;
              fullscreenImg.style.width = `${baseWidth}px`;
              fullscreenImg.style.height = 'auto';
          } else {
              const baseHeight = window.innerHeight;
              fullscreenImg.style.height = `${baseHeight}px`;
              fullscreenImg.style.width = 'auto';
          }

          updateImagePosition();
          loadingIndicator.hidden = true;
          setFocusTrap();
      };

      fullscreenImg.onerror = () => {
          loadingIndicator.hidden = true;
          setFocusTrap();
      };
  }

  function closeImage() {
      container.style.display = 'none';
      isFullscreen = false;
      document.body.style.overflow = '';
      document.removeEventListener('keydown', trapFocus);
  }

  function updateImagePosition() {
      fullscreenImg.style.transform = `translate(calc(-50% + ${translateX}px), calc(-50% + ${translateY}px)) scale(${currentScale})`;
  }

  function zoomIn() {
      currentScale = Math.min(currentScale * 1.5, baseScale * 4);
      updateImagePosition();
  }

  function zoomOut() {
      currentScale = Math.max(currentScale / 1.5, baseScale * 0.5);
      updateImagePosition();
  }

  function startDragging(e) {
      if (!isFullscreen) return;
      if (e.target.closest('.controls-panel')) {
          return;
      }
      if (e.target === container) {
          closeImage();
          return;
      }

      isDragging = true;
      fullscreenImg.classList.add('dragging');

      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);

      startX = clientX - translateX;
      startY = clientY - translateY;
      e.preventDefault();
  }

  function stopDragging() {
      isDragging = false;
      fullscreenImg.classList.remove('dragging');
  }

  function drag(e) {
      if (!isDragging) return;

      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);

      translateX = clientX - startX;
      translateY = clientY - startY;

      updateImagePosition();
      e.preventDefault();
  }

  function onKeyDown(e) {
      if (isFullscreen && e.key === 'Escape') {
          closeImage();
      }
  }

  function preventDefault(e) {
      if (isFullscreen) {
          e.preventDefault();
      }
  }

  function addButtonListeners(button, handler) {
      const handleTouch = (e) => {
          e.preventDefault();
          handler(e);
      };

      button.addEventListener('click', handler);
      button.addEventListener('touchend', handleTouch);

      // Return cleanup function
      return () => {
          button.removeEventListener('click', handler);
          button.removeEventListener('touchend', handleTouch);
      };
  }

  // Add listeners and store cleanup functions
  const zoomInBtn = container.querySelector('.zoomable-zoom-in');
  const zoomOutBtn = container.querySelector('.zoomable-zoom-out');
  const closeBtn = container.querySelector('.zoomable-close');

  const cleanupFunctions = [
      addButtonListeners(zoomInBtn, zoomIn),
      addButtonListeners(zoomOutBtn, zoomOut),
      addButtonListeners(closeBtn, closeImage)
  ];

  // Attach other global event listeners
  container.addEventListener('mousedown', startDragging);
  window.addEventListener('mousemove', drag);
  window.addEventListener('mouseup', stopDragging);

  container.addEventListener('touchstart', startDragging, { passive: false });
  container.addEventListener('touchmove', drag, { passive: false });
  container.addEventListener('touchend', stopDragging);
  container.addEventListener('touchmove', preventDefault, { passive: false });

  document.addEventListener('keydown', onKeyDown);

  // Alpine directive definition
  Alpine.directive('zoomable', (el, { expression }, { cleanup }) => {
      if (el.tagName.toLowerCase() !== 'img') {
          console.error('The x-zoomable directive can only be used on an <img> element, but found:', el.tagName);
          return;
      }

      const onClick = () => openImage(el);
      el.addEventListener('click', onClick);

      // Cleanup when element is removed
      cleanup(() => {
          el.removeEventListener('click', onClick);
          // Clean up button listeners
          cleanupFunctions.forEach(cleanup => cleanup());
          // Clean up other global listeners
          container.removeEventListener('mousedown', startDragging);
          window.removeEventListener('mousemove', drag);
          window.removeEventListener('mouseup', stopDragging);
          container.removeEventListener('touchstart', startDragging);
          container.removeEventListener('touchmove', drag);
          container.removeEventListener('touchend', stopDragging);
          container.removeEventListener('touchmove', preventDefault);
          document.removeEventListener('keydown', onKeyDown);
      });
  });
}
