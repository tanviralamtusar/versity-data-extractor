// content.js — Student Data Extractor
// Uses the portal's own /api/StudentInfo endpoint directly (no DOM scraping needed)

const STUDENT_API_URL = 'https://studentportal.green.edu.bd/api/StudentInfo';

// ── Fetch student data from the portal's own JSON API ──────────────────────
async function fetchStudentData() {
  const headers = {
    'accept': 'application/json, text/plain, */*',
    'referer': 'https://studentportal.green.edu.bd/Student/StudentProfile',
  };

  // Perform both POST and GET requests in parallel
  const [postRes, getRes] = await Promise.all([
    fetch(STUDENT_API_URL, { method: 'POST', headers }),
    fetch(STUDENT_API_URL, { 
      method: 'GET', 
      headers: { 
        ...headers, 
        'cache-control': 'no-cache', 
        'pragma': 'no-cache' 
      } 
    })
  ]);

  // Check for session expiry
  if (postRes.status === 401 || postRes.redirected || getRes.status === 401 || getRes.redirected) {
    throw new Error('NOT_LOGGED_IN');
  }

  let postData = {};
  let getData = {};

  if (postRes.ok) postData = await postRes.json();
  if (getRes.ok)  getData  = await getRes.json();

  // If both failed, throw error
  if (!postRes.ok && !getRes.ok) {
    throw new Error(`API error: POST(${postRes.status}), GET(${getRes.status})`);
  }

  // Return both results separately to avoid key collisions
  return { post: postData, get: getData };
}


// ── Inject the floating "Grab Data" button ──────────────────────────────────
async function injectFloatingButton() {
  if (document.getElementById('extractor-floating-btn')) return;

  const btn = document.createElement('button');
  btn.id = 'extractor-floating-btn';
  btn.innerHTML = '📥 Grab Data';

  const storage = await chrome.storage.local.get(['btnBottom', 'btnRight']);
  const savedBottom = storage.btnBottom || '20px';
  const savedRight  = storage.btnRight  || '20px';

  Object.assign(btn.style, {
    position:        'fixed',
    bottom:          savedBottom,
    right:           savedRight,
    zIndex:          '999999',
    padding:         '12px 20px',
    backgroundColor: '#007bff',
    color:           'white',
    border:          'none',
    borderRadius:    '50px',
    cursor:          'move',
    boxShadow:       '0 4px 12px rgba(0,0,0,0.15)',
    fontWeight:      'bold',
    fontSize:        '14px',
    display:         'flex',
    alignItems:      'center',
    gap:             '8px',
    transition:      'transform 0.2s, background-color 0.2s',
    fontFamily:      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    userSelect:      'none',
    touchAction:     'none',
  });

  // ── Drag logic ──────────────────────────────────────────────────────────
  let isDragging = false, hasMoved = false;
  let startX, startY, initialRight, initialBottom;

  btn.onmousedown = (e) => {
    isDragging = true; hasMoved = false;
    startX = e.clientX; startY = e.clientY;
    const rect = btn.getBoundingClientRect();
    initialRight  = window.innerWidth  - rect.right;
    initialBottom = window.innerHeight - rect.bottom;
    btn.style.transition = 'none';
    e.preventDefault();
  };

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = startX - e.clientX;
    const dy = startY - e.clientY;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) hasMoved = true;
    btn.style.right  = `${initialRight  + dx}px`;
    btn.style.bottom = `${initialBottom + dy}px`;
    btn.style.top    = 'auto';
    btn.style.left   = 'auto';
  });

  document.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    btn.style.transition = 'transform 0.2s, background-color 0.2s';
    if (hasMoved) {
      chrome.storage.local.set({ btnBottom: btn.style.bottom, btnRight: btn.style.right });
    }
  });

  btn.onmouseover = () => { if (!isDragging) { btn.style.transform = 'scale(1.05)'; btn.style.backgroundColor = '#0056b3'; } };
  btn.onmouseout  = () => { if (!isDragging) { btn.style.transform = 'scale(1)';    btn.style.backgroundColor = '#007bff'; } };

  // ── Click: fetch API → send to n8n ─────────────────────────────────────
  btn.onclick = async () => {
    if (hasMoved) return;

    btn.disabled = true;
    btn.innerHTML = '⏳ Fetching...';

    try {
      const data = await fetchStudentData();

      btn.innerHTML = '📤 Sending...';

      // Get route from storage (saved by popup.js)
      const storage = await chrome.storage.local.get(['selectedRoute']);
      const route   = storage.selectedRoute || 'cse';

      const WEBHOOKS = {
        cse: 'https://n8n.botbhai.net/webhook/versity-data-cse',
        bba: 'https://n8n.botbhai.net/webhook/versity-data-bba',
      };

      const webhookUrl = WEBHOOKS[route] || WEBHOOKS.cse;

      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        btn.innerHTML = '✅ Sent!';
        btn.style.backgroundColor = '#28a745';
      } else {
        throw new Error(`n8n responded with ${res.status}`);
      }
    } catch (err) {
      if (err.message === 'NOT_LOGGED_IN') {
        btn.innerHTML = '🔒 Login first';
      } else {
        console.error('Extractor error:', err);
        btn.innerHTML = '❌ Error';
      }
      btn.style.backgroundColor = '#dc3545';
    }

    setTimeout(() => {
      btn.innerHTML = '📥 Grab Data';
      btn.style.backgroundColor = '#007bff';
      btn.disabled = false;
    }, 3000);
  };

  document.body.appendChild(btn);
}

// ── Message listener (for popup.js) ────────────────────────────────────────
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchStudentData') {
    fetchStudentData()
      .then(data  => sendResponse({ success: true,  data }))
      .catch(err  => sendResponse({ success: false, error: err.message }));
    return true; // keep channel open for async
  }
});

// ── Boot ────────────────────────────────────────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectFloatingButton);
} else {
  injectFloatingButton();
}