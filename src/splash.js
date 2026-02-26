import blessed from 'blessed';

import { DASHBOARD_VERSION } from '../index.js';

// ASCII art lobster/crab logo
const SPLASH_LOGO = [
  '        ╭─────────────────────────────────╮',
  '       ╱  🦞  C L A W   D A S H B O A R D  🦞 ╲',
  '      ╱                                      ╲',
  '     │     ▀▀█▀▀  █▀▀█ █▀▀█ █▀▀█ █▀▀█ █▀▀     │',
  '     │       █   █▄▄▀ █▄▄█ █▄▄█ █▄▄█ █▄▄     │',
  '     │       █   █ ▀▄ █▄▄▄ █▄▄▄ █▄▄▄ █▄▄     │',
  '     │       █   █  ▀▄                       │',
  '     │     ▄▄█▄▄█▄▄▀▀▀▀▀▀▀▀▀▄▄█▄▄█▄▄         │',
  '     │    ▀                        ▀        │',
  '     ╲                                      ╱',
  '       ╲                                  ╱',
  '         ╰────────────────────────────╯'
];

// Status messages to cycle through during initialization
const INIT_STATUS_MESSAGES = [
  'Initializing terminal interface...',
  'Loading configuration...',
  'Connecting to database...',
  'Setting up session monitoring...',
  'Preparing system metrics...',
  'Loading themes and preferences...',
  'Starting data refresh loops...',
  'Ready!'
];

// Spinner frames for loading animation
const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const SPINNER_SPEED = 100; // ms per frame

/**
 * Displays an animated splash screen with loading indicator
 * @param {blessed.Screen} screen - The blessed screen to render on
 * @returns {Promise<void>} - Resolves when splash is dismissed
 */
export function showSplashScreen(screen) {
  return new Promise((resolve) => {
    // Create a full-screen overlay for the splash
    const splashBox = blessed.box({
      parent: screen,
      top: 'center',
      left: 'center',
      width: 54,
      height: SPLASH_LOGO.length + 8,
      border: { type: 'double', fg: 'cyan' },
      style: {
        fg: 'white',
        bg: 'black',
        border: { fg: 'cyan', bg: 'black' }
      },
      shadow: true
    });

    // Calculate centering offset
    const logoTop = 1;

    // Add logo text
    SPLASH_LOGO.forEach((line, index) => {
      blessed.text({
        parent: splashBox,
        top: logoTop + index,
        left: 'center',
        content: line,
        style: {
          fg: index === 1 ? 'brightCyan' : 'cyan',
          bold: index === 1,
          transparent: true
        }
      });
    });

    // Loading spinner element
    const spinnerText = blessed.text({
      parent: splashBox,
      top: SPLASH_LOGO.length + 2,
      left: 'center',
      content: SPINNER_FRAMES[0],
      style: { fg: 'brightGreen', bold: true }
    });

    // Status message element
    const statusText = blessed.text({
      parent: splashBox,
      top: SPLASH_LOGO.length + 2,
      left: 4,
      width: 46,
      content: INIT_STATUS_MESSAGES[0],
      style: { fg: 'gray' }
    });

    // Progress bar container
    const progressBox = blessed.box({
      parent: splashBox,
      top: SPLASH_LOGO.length + 4,
      left: 'center',
      width: 40,
      height: 1,
      style: { bg: 'black' }
    });

    // Progress bar fill
    const progressBar = blessed.text({
      parent: progressBox,
      top: 0,
      left: 0,
      content: '░'.repeat(20),
      style: { fg: 'dim' }
    });

    // Version info
    const versionText = blessed.text({
      parent: splashBox,
      bottom: 0,
      left: 'center',
      content: `v${DASHBOARD_VERSION}`,
      style: { fg: 'dim' }
    });

    // Render the splash
    screen.render();

    // Animation state
    let spinnerIndex = 0;
    let statusIndex = 0;
    let progress = 0;
    let lastStatusChange = Date.now();
    const statusChangeInterval = 400; // ms between status changes

    // Animation interval
    const animationInterval = setInterval(() => {
      // Update spinner
      spinnerIndex = (spinnerIndex + 1) % SPINNER_FRAMES.length;
      spinnerText.setContent(SPINNER_FRAMES[spinnerIndex]);

      // Update status message periodically
      if (Date.now() - lastStatusChange > statusChangeInterval) {
        statusIndex = (statusIndex + 1) % INIT_STATUS_MESSAGES.length;
        statusText.setContent(INIT_STATUS_MESSAGES[statusIndex]);
        
        // Update progress bar
        progress = Math.min(Math.floor((statusIndex / (INIT_STATUS_MESSAGES.length - 1)) * 20), 20);
        const filled = '█'.repeat(progress);
        const empty = '░'.repeat(20 - progress);
        progressBar.setContent(filled + empty);
        
        // Color the progress bar based on completion
        if (progress < 7) {
          progressBar.style.fg = 'red';
        } else if (progress < 14) {
          progressBar.style.fg = 'yellow';
        } else {
          progressBar.style.fg = 'green';
        }
        
        lastStatusChange = Date.now();
      }

      screen.render();
    }, SPINNER_SPEED);

    // Auto-dismiss after 2.5 seconds
    setTimeout(() => {
      clearInterval(animationInterval);
      splashBox.destroy();
      screen.render();
      resolve();
    }, 2500);
  });
}

export default { showSplashScreen };
