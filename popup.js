const WEBHOOK_URL = 'https://n8n.botbhai.net/webhook/versity-data-cse';

const WEBHOOK_URL_2 = 'https://n8n.botbhai.net/webhook/versity-data-bba';

document.addEventListener('DOMContentLoaded', () => {
  const actionBtn = document.getElementById('actionBtn');
  if (actionBtn) {
    actionBtn.addEventListener('click', handleAction);
  }
  const floatingSendBtn = document.getElementById('floatingSendBtn');
  if (floatingSendBtn) {
    floatingSendBtn.addEventListener('click', handleAction);
  }
});

function handleAction() {
  const statusDiv = document.getElementById('status');
  const actionBtn = document.getElementById('actionBtn');
  
  statusDiv.textContent = '⏳ Grabbing data...';
  statusDiv.className = 'status info';
  actionBtn.disabled = true;

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) {
      statusDiv.textContent = '❌ No active tab found';
      statusDiv.className = 'status error';
      actionBtn.disabled = false;
      return;
    }

    // Inject content script first if needed
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      files: ['content.js']
    }, () => {
      // After injection, send message to extract data
      setTimeout(() => {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: 'extractData' },
          (response) => {
            if (chrome.runtime.lastError) {
              statusDiv.textContent = '❌ Error: ' + chrome.runtime.lastError.message;
              statusDiv.className = 'status error';
              actionBtn.disabled = false;
              return;
            }

            if (!response || !response.data || Object.keys(response.data).length === 0) {
              statusDiv.textContent = '❌ No data found on page';
              statusDiv.className = 'status error';
              actionBtn.disabled = false;
              return;
            }

            const extractedData = response.data;
            displayData(extractedData);
            
            // Send to webhook
            statusDiv.textContent = '📤 Sending to n8n...';
            statusDiv.className = 'status info';

            console.log('Sending data to n8n:', extractedData);

            const selectedRoute = document.getElementById('webhookRoute').value;
            const selectedUrl = selectedRoute === 'bba' ? 'https://n8n.botbhai.net/webhook/versity-data-bba' : 'https://n8n.botbhai.net/webhook/versity-data-cse';

            fetch(selectedUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(extractedData)
            })
            .then(async response => {
              if (response.ok) {
                statusDiv.textContent = '✅ Success! Data sent to n8n';
                statusDiv.className = 'status success';
              } else {
                let errorMsg = `Error: ${response.status} ${response.statusText}`;
                try {
                  const errorData = await response.text();
                  if (errorData) {
                    errorMsg += ` - ${errorData.substring(0, 100)}`;
                  }
                } catch (e) {
                  // ignore
                }
                statusDiv.textContent = '❌ ' + errorMsg;
                statusDiv.className = 'status error';
              }
              actionBtn.disabled = false;
            })
            .catch(error => {
              statusDiv.textContent = '❌ Error: ' + error.message;
              statusDiv.className = 'status error';
              actionBtn.disabled = false;
            });

          }
        );
      }, 100);
    });
  });
}

function displayData(data) {
  const dataDisplay = document.getElementById('dataDisplay');
  if (!dataDisplay) return;
  
  let html = '<div class="data-preview"><h3>Extracted Data:</h3>';
  for (const [key, value] of Object.entries(data)) {
    if (value) {
      html += `<div class="data-item"><strong>${key}</strong> ${escapeHtml(value)}</div>`;
    }
  }
  html += '</div>';
  dataDisplay.innerHTML = html;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
