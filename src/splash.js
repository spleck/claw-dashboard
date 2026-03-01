import blessed from 'blessed';
import { DASHBOARD_VERSION } from './config.js';

/**
 * Shows a fullscreen splash screen with loading progress
 * @param {blessed.Screen} screen - The blessed screen
 * @param {Function} loadFn - Async function that performs loading
 * @returns {Promise<void>}
 */
export async function showSplashScreen(screen, loadFn) {
  // Create fullscreen overlay
  const splashBox = blessed.box({
    parent: screen,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    style: { bg: 'black' }
  });

  // Simple centered text - no ASCII art, just basic characters
  blessed.text({
    parent: splashBox,
    top: Math.floor(screen.height / 2) - 4,
    left: 'center',
    content: 'CLAW DASHBOARD',
    style: { fg: 'brightCyan', bold: true }
  });

  blessed.text({
    parent: splashBox,
    top: Math.floor(screen.height / 2) - 2,
    left: 'center',
    content: '================',
    style: { fg: 'cyan' }
  });

  blessed.text({
    parent: splashBox,
    top: Math.floor(screen.height / 2),
    left: 'center',
    content: `v${DASHBOARD_VERSION}`,
    style: { fg: 'gray' }
  });

  // Status line
  const statusText = blessed.text({
    parent: splashBox,
    top: Math.floor(screen.height / 2) + 3,
    left: 'center',
    width: 35,
    height: 1,
    content: 'Initializing...',
    style: { fg: 'white', bold: true },
    align: 'center'
  });

  // Spinner next to status
  const spinnerText = blessed.text({
    parent: splashBox,
    top: Math.floor(screen.height / 2) + 3,
    left: Math.floor(screen.width / 2) + 18,
    content: '*',
    style: { fg: 'brightGreen', bold: true }
  });

  // Progress bar
  const progressBar = blessed.text({
    parent: splashBox,
    top: Math.floor(screen.height / 2) + 5,
    left: 'center',
    width: 30,
    content: '[----------------------]',
    style: { fg: 'gray' },
    align: 'center'
  });

  screen.render();

  // Spinner animation
  const spinnerFrames = ['|', '/', '-', '\\\\'];
  let spinnerIdx = 0;
  const spinnerInterval = setInterval(() => {
    spinnerIdx = (spinnerIdx + 1) % spinnerFrames.length;
    spinnerText.setContent(spinnerFrames[spinnerIdx]);
    screen.render();
  }, 150);

  // Update progress function
  const updateProgress = (progress, status) => {
    if (status) statusText.setContent(status);
    
    const filled = Math.floor((progress / 100) * 22);
    const bar = '[' + '#'.repeat(filled) + '-'.repeat(22 - filled) + ']';
    progressBar.setContent(bar);
    progressBar.style.fg = progress < 50 ? 'red' : progress < 80 ? 'yellow' : 'green';
    
    screen.render();
  };

  // Execute loading
  try {
    if (loadFn) {
      await loadFn(updateProgress);
    }
    updateProgress(100, 'Ready!');
    await new Promise(r => setTimeout(r, 400));
  } finally {
    clearInterval(spinnerInterval);
    splashBox.destroy();
    screen.render();
  }
}

export default { showSplashScreen };
