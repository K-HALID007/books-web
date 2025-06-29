// Simple PDF worker fallback
// This is a minimal worker to avoid external CDN dependencies
self.onmessage = function(e) {
  // Basic worker functionality
  self.postMessage({ type: 'ready' });
};