// Function to extract student profile data from the webpage
function extractStudentData() {
  const data = {};
  
  const fieldMap = {
    'Name': 'name',
    'Student ID': 'student_id',
    'Program': 'program',
    'Batch': 'batch',
    'Probation': 'probation',
    'Email': 'email',
    'DOB': 'dob',
    'Religion': 'religion',
    'Blood Group': 'blood_group',
    'Number': 'number',
    'Gender': 'gender',
    'Father Name': 'father_name',
    'Mother Name': 'mother_name',
    'Matrial Status': 'marital_status',
    'Father Profession': 'father_profession',
    'Mother Profession': 'mother_profession',
    'Guardian Name': 'guardian_name',
    'Guardian Phone': 'guardian_phone',
    'Guardian Address': 'guardian_address',
    'Nationality': 'nationality',
    'Evaluation Pending': 'evaluation_pending',
    'Active Status': 'active_status',
    'Admission Cancel': 'admission_cancel',
    'Disciplinary Block': 'disciplinary_block',
    'Permanent Address': 'permanent_address',
    'Present Address': 'present_address',
    'Mailing Address': 'mailing_address'
  };

  const ignoreValues = [
    'Basic Information',
    'Permanent Address',
    'Present Address',
    'Mailing Address',
    'Status',
    'Contact Information',
    'Academic Information',
    'Guardian Information',
    'Student Information',
    'Profile',
    'Student Admit Card',
    '© 2026 - Edusoft Consultants Ltd.'
  ];

  try {
    // 1. Try DOM traversal (Tables)
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
      const rows = table.querySelectorAll('tr');
      rows.forEach(row => {
        const cells = row.querySelectorAll('td, th');
        if (cells.length >= 2) {
          const labelText = cells[0].innerText.trim().replace(/:$/, '');
          const valueText = cells[1].innerText.trim();
          
          let bestMatch = null;
          for (const [label, key] of Object.entries(fieldMap)) {
            if (labelText.toLowerCase() === label.toLowerCase()) {
              bestMatch = { label, key };
              break;
            }
            if (labelText.toLowerCase().includes(label.toLowerCase())) {
              if (!bestMatch || label.length > bestMatch.label.length) {
                bestMatch = { label, key };
              }
            }
          }
          
          if (bestMatch) {
            const { key } = bestMatch;
            if (valueText && !ignoreValues.some(iv => valueText.includes(iv)) && !data[key]) {
              data[key] = valueText;
            }
          }

        }
      });
    });

    // 2. Try DOM traversal (Divs/Labels)
    const allElements = document.querySelectorAll('div, span, label, p, b, strong');
    allElements.forEach(el => {
      if (el.children.length === 0) { // Text-only leaf nodes
        const text = el.innerText.trim().replace(/:$/, '');
        for (const [label, key] of Object.entries(fieldMap)) {
          if (text.toLowerCase() === label.toLowerCase()) {
            // Try to find value in sibling or next element
            let nextEl = el.nextElementSibling || el.parentElement.nextElementSibling;
            if (nextEl) {
              const val = nextEl.innerText.trim();
              if (val && !ignoreValues.some(iv => val.includes(iv)) && !data[key]) {
                data[key] = val;
              }
            }
          }
        }
      }
    });

    // 3. Fallback to Regex/Text Search
    const bodyText = document.body.innerText || '';
    const lines = bodyText.split('\n').map(l => l.trim()).filter(l => l);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const [label, key] of Object.entries(fieldMap)) {
        if (!data[key]) {
          // Check for "Label: Value" pattern
          if (line.toLowerCase().startsWith(label.toLowerCase() + ':')) {
            const val = line.substring(label.length + 1).trim();
            if (val && !ignoreValues.some(iv => val.includes(iv))) {
              data[key] = val;
            }
          } 
          // Check for "Label" on one line, "Value" on next
          else if (line.toLowerCase() === label.toLowerCase()) {
            const val = lines[i + 1];
            if (val && !ignoreValues.some(iv => val.includes(iv)) && !Object.keys(fieldMap).some(l => val.toLowerCase().includes(l.toLowerCase()))) {
              data[key] = val;
            }
          }
        }
      }
    }

    // Special handling for Student ID if it's in the Name field incorrectly
    if (data.name && data.name.toLowerCase().includes('student id')) {
      const match = data.name.match(/student id[:\s]+([^\s]+)/i);
      if (match && match[1]) {
        if (!data.student_id) data.student_id = match[1];
        data.name = data.name.split(/student id/i)[0].trim().replace(/:$/, '');
      }
    }

  } catch (error) {
    console.error('Error extracting data:', error);
  }
  
  return data;
}

// Function to create and inject the floating button
async function injectFloatingButton() {
  if (document.getElementById('extractor-floating-btn')) return;

  const btn = document.createElement('button');
  btn.id = 'extractor-floating-btn';
  btn.innerHTML = '📥 Grab Data';
  
  // Load saved position
  const storage = await chrome.storage.local.get(['btnBottom', 'btnRight']);
  const savedBottom = storage.btnBottom || '20px';
  const savedRight = storage.btnRight || '20px';

  // Style the button
  Object.assign(btn.style, {
    position: 'fixed',
    bottom: savedBottom,
    right: savedRight,
    zIndex: '999999',
    padding: '12px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    cursor: 'move',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    fontWeight: 'bold',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'transform 0.2s ease-in-out, background-color 0.2s ease-in-out',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    userSelect: 'none',
    touchAction: 'none'
  });

  // Dragging logic variables
  let isDragging = false;
  let hasMoved = false;
  let startX, startY;
  let initialRight, initialBottom;

  // Mouse Down
  btn.onmousedown = (e) => {
    isDragging = true;
    hasMoved = false;
    startX = e.clientX;
    startY = e.clientY;
    
    // Get current position relative to viewport
    const rect = btn.getBoundingClientRect();
    initialRight = window.innerWidth - rect.right;
    initialBottom = window.innerHeight - rect.bottom;
    
    btn.style.transition = 'none'; // Disable transition during drag
    e.preventDefault();
  };

  // Mouse Move
  const onMouseMove = (e) => {
    if (!isDragging) return;
    
    const dx = startX - e.clientX;
    const dy = startY - e.clientY;
    
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      hasMoved = true;
    }

    const newRight = initialRight + dx;
    const newBottom = initialBottom + dy;
    
    btn.style.right = `${newRight}px`;
    btn.style.bottom = `${newBottom}px`;
    btn.style.top = 'auto'; // Ensure we use bottom/right
    btn.style.left = 'auto';
  };

  // Mouse Up
  const onMouseUp = () => {
    if (!isDragging) return;
    isDragging = false;
    btn.style.transition = 'transform 0.2s ease-in-out, background-color 0.2s ease-in-out';
    
    // Save final position
    if (hasMoved) {
      chrome.storage.local.set({
        btnBottom: btn.style.bottom,
        btnRight: btn.style.right
      });
    }
  };

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);

  // Hover effects
  btn.onmouseover = () => {
    if (!isDragging) {
      btn.style.transform = 'scale(1.05)';
      btn.style.backgroundColor = '#0056b3';
    }
  };
  btn.onmouseout = () => {
    if (!isDragging) {
      btn.style.transform = 'scale(1)';
      btn.style.backgroundColor = '#007bff';
    }
  };

  // Click handler (only trigger if not moved)
  btn.onclick = async () => {
    if (hasMoved) return; // Don't trigger if it was a drag
    
    btn.disabled = true;
    btn.innerHTML = '⏳ Grabbing...';
    
    try {
      const data = extractStudentData();
      if (!data || Object.keys(data).length === 0) {
        alert('No student data found on this page.');
        btn.innerHTML = '📥 Grab Data';
        btn.disabled = false;
        return;
      }

      btn.innerHTML = '📤 Sending...';
      
      const webhookUrl = 'https://n8n.botbhai.net/webhook/versity-data-cse';
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        btn.innerHTML = '✅ Success!';
        btn.style.backgroundColor = '#28a745';
        setTimeout(() => {
          btn.innerHTML = '📥 Grab Data';
          btn.style.backgroundColor = '#007bff';
          btn.disabled = false;
        }, 3000);
      } else {
        throw new Error('Server responded with ' + response.status);
      }
    } catch (error) {
      console.error('Extraction error:', error);
      btn.innerHTML = '❌ Error';
      btn.style.backgroundColor = '#dc3545';
      setTimeout(() => {
        btn.innerHTML = '📥 Grab Data';
        btn.style.backgroundColor = '#007bff';
        btn.disabled = false;
      }, 3000);
    }
  };

  document.body.appendChild(btn);
}

// Inject button on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectFloatingButton);
} else {
  injectFloatingButton();
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractData') {
    const studentData = extractStudentData();
    sendResponse({ data: studentData });
  }
  return true; // Keep message channel open for async
});

