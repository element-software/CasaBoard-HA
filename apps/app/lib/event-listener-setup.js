/* global process */
// Event listener setup to prevent memory leak warnings
// This should be imported early in the application lifecycle

if (typeof process !== 'undefined' && process.setMaxListeners) {
  // Increase max listeners for development to prevent warnings
  // This is common in Next.js development due to hot reloading and multiple connections
  const maxListeners = process.env.NODE_ENV === 'development' ? 20 : 10;
  process.setMaxListeners(maxListeners);

  if (process.env.NODE_ENV === 'development') {
    console.log(`✓ Max listeners set to ${maxListeners} for development`);
  }
}

// Optional: Add a warning handler to catch and suppress specific warnings
if (typeof process !== 'undefined' && process.on) {
  process.on('warning', (warning) => {
    // Suppress MaxListenersExceededWarning in development
    if (warning.name === 'MaxListenersExceededWarning' && process.env.NODE_ENV === 'development') {
      // Optionally log a cleaner message or suppress entirely
      console.warn('⚠️  MaxListenersExceededWarning suppressed in development mode');
      return;
    }
    // Let other warnings through
    console.warn(warning);
  });
}
