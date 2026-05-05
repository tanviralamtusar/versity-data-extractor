// This script is injected into the page context to intercept API calls
// It runs in the page's context, not the extension's sandbox

(function() {
  const requests = [];

  // Intercept Fetch API
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';
    const method = (args[1]?.method || 'GET').toUpperCase();
    const requestId = Math.random().toString(36).substr(2, 9);
    
    const request = {
      id: requestId,
      url: url,
      method: method,
      type: 'fetch',
      timestamp: new Date().toLocaleTimeString(),
      status: null,
      statusText: ''
    };

    // Send via window event
    window.postMessage({
      type: 'API_EXTRACTOR_REQUEST',
      request: request
    }, '*');

    return originalFetch.apply(this, args)
      .then(response => {
        request.status = response.status;
        request.statusText = response.statusText;
        
        window.postMessage({
          type: 'API_EXTRACTOR_REQUEST',
          request: request
        }, '*');
        
        return response;
      })
      .catch(error => {
        request.status = 0;
        request.statusText = 'Error';
        
        window.postMessage({
          type: 'API_EXTRACTOR_REQUEST',
          request: request
        }, '*');
        
        throw error;
      });
  };

  // Intercept XMLHttpRequest
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function(method, url) {
    this._apiExtractorUrl = url;
    this._apiExtractorMethod = method;
    this._apiExtractorRequestId = Math.random().toString(36).substr(2, 9);
    
    return originalOpen.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function() {
    const request = {
      id: this._apiExtractorRequestId,
      url: this._apiExtractorUrl,
      method: this._apiExtractorMethod || 'GET',
      type: 'xmlhttprequest',
      timestamp: new Date().toLocaleTimeString(),
      status: null,
      statusText: ''
    };

    window.postMessage({
      type: 'API_EXTRACTOR_REQUEST',
      request: request
    }, '*');

    const onLoadEnd = () => {
      request.status = this.status;
      request.statusText = this.statusText;
      
      window.postMessage({
        type: 'API_EXTRACTOR_REQUEST',
        request: request
      }, '*');
    };

    this.addEventListener('loadend', onLoadEnd);
    this.addEventListener('error', () => {
      request.status = 0;
      request.statusText = 'Error';
      
      window.postMessage({
        type: 'API_EXTRACTOR_REQUEST',
        request: request
      }, '*');
    });

    return originalSend.apply(this, arguments);
  };
})();
