// popup.js

const WEBHOOKS = {
  cse: 'https://n8n.botbhai.net/webhook/versity-data-cse',
  bba: 'https://n8n.botbhai.net/webhook/versity-data-bba',
};

document.addEventListener('DOMContentLoaded', async () => {
  const routeSelect = document.getElementById('webhookRoute');
  
  // 1️⃣ Load saved route from storage
  const storage = await chrome.storage.local.get(['selectedRoute']);
  if (storage.selectedRoute) {
    routeSelect.value = storage.selectedRoute;
  }

  // 2️⃣ Save route whenever it changes
  routeSelect.addEventListener('change', (e) => {
    chrome.storage.local.set({ selectedRoute: e.target.value });
  });

  document.getElementById('actionBtn').addEventListener('click', handleAction);
});

async function handleAction() {
  const statusDiv  = document.getElementById('status');
  const actionBtn  = document.getElementById('actionBtn');
  const route      = document.getElementById('webhookRoute').value;
  const webhookUrl = WEBHOOKS[route] || WEBHOOKS.cse;

  setStatus('info', '⏳ Fetching from portal API...');
  actionBtn.disabled = true;

  // 1️⃣  Ask the active tab to call /api/StudentInfo (same-origin, has session cookie)
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) {
    setStatus('error', '❌ No active tab found');
    actionBtn.disabled = false;
    return;
  }

  // Make sure content script is injected
  await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] });

  chrome.tabs.sendMessage(tab.id, { action: 'fetchStudentData' }, async (response) => {
    if (chrome.runtime.lastError || !response) {
      setStatus('error', '❌ Could not reach page. Are you on the student portal?');
      actionBtn.disabled = false;
      return;
    }

    if (!response.success) {
      if (response.error === 'NOT_LOGGED_IN') {
        setStatus('error', '🔒 Not logged in. Please log in to the portal first.');
      } else {
        setStatus('error', '❌ API Error: ' + response.error);
      }
      actionBtn.disabled = false;
      return;
    }

    const data = response.data;
    displayData(data);

    // 2️⃣  Forward clean JSON to n8n
    setStatus('info', `📤 Sending to n8n (${route.toUpperCase()})...`);

    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setStatus('success', `✅ Done! Data sent to ${route.toUpperCase()} sheet.`);
      } else {
        const txt = await res.text().catch(() => '');
        setStatus('error', `❌ n8n error ${res.status}: ${txt.substring(0, 80)}`);
      }
    } catch (err) {
      setStatus('error', '❌ Network error: ' + err.message);
    }

    actionBtn.disabled = false;
  });
}

function setStatus(type, msg) {
  const el = document.getElementById('status');
  el.textContent  = msg;
  el.className    = `status ${type}`;
}

function displayData(data) {
  const display = document.getElementById('dataDisplay');
  if (!display) return;

  let html = '<div class="data-preview">';
  
  if (data.post && Object.keys(data.post).length > 0) {
    html += `<div class="data-section"><h3>POST API Response:</h3>${renderRows(data.post)}</div>`;
  }
  
  if (data.get && Object.keys(data.get).length > 0) {
    html += `<div class="data-section" style="margin-top:20px; border-top:1px solid #ddd; padding-top:15px;"><h3>GET API Response:</h3>${renderRows(data.get)}</div>`;
  }

  if (html === '<div class="data-preview">') {
    html += '<p>No data found.</p>';
  }

  html += '</div>';
  display.innerHTML = html;
}

function renderRows(obj) {
  return Object.entries(obj)
    .filter(([, v]) => v !== null && v !== undefined && v !== '')
    .map(([k, v]) => `<div class="data-item"><strong>${escapeHtml(k)}</strong> ${escapeHtml(String(v))}</div>`)
    .join('');
}

function escapeHtml(text) {
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}