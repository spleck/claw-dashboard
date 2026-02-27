/**
 * View Transitions Module
 * Provides smooth animations for modal views (fade, slide, scale)
 */

import blessed from 'blessed';

/**
 * Easing functions for animations
 */
const EASING = {
  linear: t => t,
  easeIn: t => t * t,
  easeOut: t => 1 - (1 - t) * (1 - t),
  easeInOut: t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  spring: t => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  }
};

/**
 * Default transition options
 */
const DEFAULT_OPTIONS = {
  duration: 200,        // Animation duration in ms
  easing: 'easeOut',    // Easing function name
  fade: true,          // Fade opacity
  slide: false,        // Slide from direction
  scale: false,        // Scale effect
  slideDirection: 'up', // 'up', 'down', 'left', 'right'
  fadeBackground: true // Fade background opacity
};

/**
 * Active animations map (to handle cleanup)
 * @type {Map<string, {stop: Function}>}
 */
const activeAnimations = new Map();

/**
 * Create a background overlay for modal dialogs
 * @param {blessed.Screen} screen
 * @param {Object} options
 * @returns {blessed.Box}
 */
export function createBackground(screen, options = {}) {
  const bg = blessed.box({
    parent: screen,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    style: {
      bg: 'black'
    },
    transparent: true
  });

  // Set initial opacity based on options
  const opacity = options.fadeBackground !== false ? 0 : 0.4;
  bg.style.transparent = true;
  bg._targetOpacity = options.backgroundOpacity || 0.4;
  bg._currentOpacity = opacity;

  return bg;
}

/**
 * Animate a value over time
 * @param {Object} config
 * @param {number} config.from - Start value
 * @param {number} config.to - End value
 * @param {number} config.duration - Duration in ms
 * @param {string} config.easing - Easing function name
 * @param {Function} config.onUpdate - Called with current value
 * @param {Function} config.onComplete - Called when animation completes
 * @returns {{stop: Function}} Animation controller
 */
export function animate({
  from,
  to,
  duration = 200,
  easing = 'easeOut',
  onUpdate,
  onComplete
}) {
  const easeFn = EASING[easing] || EASING.easeOut;
  const startTime = Date.now();
  let animationId = null;
  let stopped = false;

  const step = () => {
    if (stopped) return;

    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeFn(progress);
    const currentValue = from + (to - from) * easedProgress;

    onUpdate(currentValue);

    if (progress < 1) {
      // Use setImmediate for next frame to avoid blocking
      animationId = setImmediate(step);
    } else {
      onComplete?.();
    }
  };

  // Start animation
  animationId = setImmediate(step);

  return {
    stop: () => {
      stopped = true;
      if (animationId) {
        clearImmediate(animationId);
      }
    }
  };
}

/**
 * Transition a widget in (show with animation)
 * @param {blessed.Screen} screen
 * @param {blessed.Box} widget
 * @param {Object} options
 * @returns {Promise<void>}
 */
export function transitionIn(screen, widget, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const animationId = `in_${widget.uid || Math.random().toString(36).substr(2, 9)}`;

  // Stop any existing animation on this widget
  if (activeAnimations.has(animationId)) {
    activeAnimations.get(animationId).stop();
  }

  return new Promise((resolve) => {
    const animations = [];
    const originalTop = widget.top;
    const originalLeft = widget.left;
    const originalWidth = widget.width;
    const originalHeight = widget.height;

    // Store original position for restore
    widget._originalPosition = {
      top: originalTop,
      left: originalLeft,
      width: originalWidth,
      height: originalHeight
    };

    // Fade animation
    if (opts.fade) {
      widget.style.transparent = true;
      widget._opacity = 0;

      const fadeAnim = animate({
        from: 0,
        to: 1,
        duration: opts.duration,
        easing: opts.easing,
        onUpdate: (value) => {
          widget._opacity = value;
          // blessed doesn't support true opacity, so we simulate it via style
          widget.style.alpha = value;
          widget.style.transparent = value < 0.1;
        }
      });
      animations.push(fadeAnim);
    }

    // Slide animation
    if (opts.slide) {
      let fromTop = originalTop;
      let fromLeft = originalLeft;
      const slideDistance = 20;

      switch (opts.slideDirection) {
        case 'up':
          fromTop = originalTop + slideDistance;
          break;
        case 'down':
          fromTop = originalTop - slideDistance;
          break;
        case 'left':
          fromLeft = originalLeft + slideDistance;
          break;
        case 'right':
          fromLeft = originalLeft - slideDistance;
          break;
      }

      widget.top = fromTop;
      widget.left = fromLeft;

      const slideAnim = animate({
        from: 0,
        to: 1,
        duration: opts.duration,
        easing: opts.easing,
        onUpdate: (value) => {
          widget.top = fromTop + (originalTop - fromTop) * value;
          widget.left = fromLeft + (originalLeft - fromLeft) * value;
          screen.render();
        }
      });
      animations.push(slideAnim);
    }

    // Scale animation (simulated via size changes)
    if (opts.scale) {
      const parseDim = (dim) => {
        if (typeof dim === 'string' && dim.includes('%')) {
          return { value: parseInt(dim), unit: '%' };
        }
        return { value: parseInt(dim) || 10, unit: typeof dim === 'string' && dim.includes('%') ? '%' : '' };
      };

      const origW = parseDim(originalWidth);
      const origH = parseDim(originalHeight);

      // Start from smaller size
      const startScale = 0.9;
      const currentW = Math.round(origW.value * startScale);
      const currentH = Math.round(origH.value * startScale);

      widget.width = currentW + origW.unit;
      widget.height = currentH + origH.unit;

      const scaleAnim = animate({
        from: startScale,
        to: 1,
        duration: opts.duration,
        easing: opts.easing,
        onUpdate: (value) => {
          const newW = Math.round(origW.value * value);
          const newH = Math.round(origH.value * value);
          widget.width = newW + origW.unit;
          widget.height = newH + origH.unit;
          screen.render();
        },
        onComplete: () => {
          widget.width = originalWidth;
          widget.height = originalHeight;
        }
      });
      animations.push(scaleAnim);
    }

    // Background fade
    let bgAnim = null;
    if (opts.fadeBackground && opts.background) {
      bgAnim = animate({
        from: 0,
        to: opts.background._targetOpacity || 0.4,
        duration: opts.duration,
        easing: 'linear',
        onUpdate: (value) => {
          // Simulate opacity via character density or just use a flag
          opts.background._currentOpacity = value;
          opts.background.style.alpha = value;
        }
      });
    }

    // Cleanup and resolve when done
    setTimeout(() => {
      animations.forEach(a => a.stop());
      if (bgAnim) bgAnim.stop();
      activeAnimations.delete(animationId);

      // Ensure final state
      widget.top = originalTop;
      widget.left = originalLeft;
      widget.width = originalWidth;
      widget.height = originalHeight;
      widget.style.transparent = false;
      widget.style.alpha = 1;

      screen.render();
      resolve();
    }, opts.duration);

    activeAnimations.set(animationId, {
      stop: () => {
        animations.forEach(a => a.stop());
        if (bgAnim) bgAnim.stop();
        activeAnimations.delete(animationId);
      }
    });

    // Render to show initial state
    screen.render();
  });
}

/**
 * Transition a widget out (hide with animation)
 * @param {blessed.Screen} screen
 * @param {blessed.Box} widget
 * @param {Object} options
 * @returns {Promise<void>}
 */
export function transitionOut(screen, widget, options = {}) {
  if (!widget || widget.destroyed) {
    return Promise.resolve();
  }

  const opts = { ...DEFAULT_OPTIONS, ...options };
  const animationId = `out_${widget.uid || Math.random().toString(36).substr(2, 9)}`;

  // Stop any existing animation on this widget
  if (activeAnimations.has(animationId)) {
    activeAnimations.get(animationId).stop();
  }

  return new Promise((resolve) => {
    const animations = [];
    const originalPosition = widget._originalPosition || {
      top: widget.top,
      left: widget.left,
      width: widget.width,
      height: widget.height
    };

    // Fade animation
    if (opts.fade) {
      const fadeAnim = animate({
        from: 1,
        to: 0,
        duration: opts.duration,
        easing: opts.easing,
        onUpdate: (value) => {
          widget.style.alpha = value;
          widget.style.transparent = value < 0.1;
          screen.render();
        }
      });
      animations.push(fadeAnim);
    }

    // Slide animation
    if (opts.slide) {
      let toTop = originalPosition.top;
      let toLeft = originalPosition.left;
      const slideDistance = 20;

      switch (opts.slideDirection) {
        case 'up':
          toTop = originalPosition.top - slideDistance;
          break;
        case 'down':
          toTop = originalPosition.top + slideDistance;
          break;
        case 'left':
          toLeft = originalPosition.left - slideDistance;
          break;
        case 'right':
          toLeft = originalPosition.left + slideDistance;
          break;
      }

      const slideAnim = animate({
        from: 0,
        to: 1,
        duration: opts.duration,
        easing: opts.easing,
        onUpdate: (value) => {
          widget.top = originalPosition.top + (toTop - originalPosition.top) * value;
          widget.left = originalPosition.left + (toLeft - originalPosition.left) * value;
          screen.render();
        }
      });
      animations.push(slideAnim);
    }

    // Scale animation
    if (opts.scale) {
      const parseDim = (dim) => {
        if (typeof dim === 'string' && dim.includes('%')) {
          return { value: parseInt(dim), unit: '%' };
        }
        return { value: parseInt(dim) || 10, unit: typeof dim === 'string' && dim.includes('%') ? '%' : '' };
      };

      const origW = parseDim(originalPosition.width);
      const origH = parseDim(originalPosition.height);

      const endScale = 0.9;

      const scaleAnim = animate({
        from: 1,
        to: endScale,
        duration: opts.duration,
        easing: opts.easing,
        onUpdate: (value) => {
          const newW = Math.round(origW.value * value);
          const newH = Math.round(origH.value * value);
          widget.width = newW + origW.unit;
          widget.height = newH + origH.unit;
          screen.render();
        }
      });
      animations.push(scaleAnim);
    }

    // Background fade
    let bgAnim = null;
    if (opts.fadeBackground && opts.background) {
      const startOpacity = opts.background._currentOpacity || 0.4;
      bgAnim = animate({
        from: startOpacity,
        to: 0,
        duration: opts.duration,
        easing: 'linear',
        onUpdate: (value) => {
          opts.background._currentOpacity = value;
          opts.background.style.alpha = value;
          screen.render();
        }
      });
    }

    // Cleanup when done
    setTimeout(() => {
      animations.forEach(a => a.stop());
      if (bgAnim) bgAnim.stop();
      activeAnimations.delete(animationId);
      resolve();
    }, opts.duration);

    activeAnimations.set(animationId, {
      stop: () => {
        animations.forEach(a => a.stop());
        if (bgAnim) bgAnim.stop();
        activeAnimations.delete(animationId);
      }
    });
  });
}

/**
 * Quick fade in/out utility for simple cases
 * @param {blessed.Screen} screen
 * @param {blessed.Box} widget
 * @param {boolean} show - true to fade in, false to fade out
 * @param {number} duration
 * @returns {Promise<void>}
 */
export function quickFade(screen, widget, show, duration = 150) {
  if (!widget || widget.destroyed) return Promise.resolve();

  return new Promise((resolve) => {
    const from = show ? 0 : 1;
    const to = show ? 1 : 0;

    animate({
      from,
      to,
      duration,
      easing: 'easeOut',
      onUpdate: (value) => {
        widget.style.alpha = value;
        widget.style.transparent = value < 0.1;
        screen.render();
      },
      onComplete: () => {
        if (!show) {
          widget.hide();
        } else {
          widget.show();
          widget.style.alpha = 1;
          widget.style.transparent = false;
        }
        screen.render();
        resolve();
      }
    });
  });
}

/**
 * Staggered animation for lists of items
 * @param {blessed.Screen} screen
 * @param {Array<blessed.Box>} items
 * @param {boolean} show
 * @param {Object} options
 * @returns {Promise<void>}
 */
export function staggeredFade(screen, items, show, options = {}) {
  const delay = options.staggerDelay || 30;
  const duration = options.duration || 100;

  const promises = items.map((item, index) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        quickFade(screen, item, show, duration).then(resolve);
      }, index * delay);
    });
  });

  return Promise.all(promises);
}

/**
 * Check if any animation is currently running
 * @returns {boolean}
 */
export function isAnimating() {
  return activeAnimations.size > 0;
}

/**
 * Stop all active animations
 */
export function stopAll() {
  activeAnimations.forEach(anim => anim.stop());
  activeAnimations.clear();
}

export default {
  animate,
  transitionIn,
  transitionOut,
  quickFade,
  staggeredFade,
  createBackground,
  isAnimating,
  stopAll,
  EASING
};
