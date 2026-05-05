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

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractData') {
    const studentData = extractStudentData();
    sendResponse({ data: studentData });
  }
  return true; // Keep message channel open for async
});

