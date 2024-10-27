const addPatientBtn = document.getElementById('addPatient');
const patientTableBody = document.getElementById('patientTableBody');
const notesPopup = document.getElementById('notesPopup');
const editNotesText = document.getElementById('editNotesText');
const saveNotesBtn = document.getElementById('saveNotesBtn');
const discardNotesBtn = document.getElementById('discardNotesBtn');
const settingsBtn = document.getElementById('settingsBtn');
const settingsPopup = document.getElementById('settingsPopup');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');

let currentEditIndex = null;

document.addEventListener('DOMContentLoaded', loadPatients);
addPatientBtn.addEventListener('click', addPatient);
closeSettingsBtn.addEventListener('click', () => settingsPopup.style.display = 'none');

function loadPatients() {
    const patients = JSON.parse(localStorage.getItem('patients')) || [];
    patientTableBody.innerHTML = '';

    patients.forEach((patient, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${patient.name || 'Not Set'}</td>
            <td>
                <span class="date-display" data-column="prepDate">${patient.prepDate || 'Not Set'}</span>
                <input type="date" class="calendar-input" style="display:none;" onchange="updateDate(this, ${index}, 'prepDate')">
                <button type="button" class="calendar-btn" onclick="toggleDateInput(this)">📅</button>
            </td>
            <td>
                <select class="lab-status-dropdown" data-column="labStatusPrep" onchange="updateLabStatus(this, ${index})">
                    <option value="awaiting lab" ${patient.labStatusPrep === "awaiting lab" ? "selected" : ""}>Awaiting Lab</option>
                    <option value="lab followed up" ${patient.labStatusPrep === "lab followed up" ? "selected" : ""}>Lab Followed Up</option>
                    <option value="lab back" ${patient.labStatusPrep === "lab back" ? "selected" : ""}>Lab Back</option>
                    <option value="not needed" ${patient.labStatusPrep === "not needed" ? "selected" : ""}>Not Needed</option>
                </select>
            </td>
            <td>
                <span class="date-display" data-column="ftpDate">${patient.ftpDate || 'Not Set'}</span>
                <input type="date" class="calendar-input" style="display:none;" onchange="updateDate(this, ${index}, 'ftpDate')">
                <button type="button" class="calendar-btn" onclick="toggleDateInput(this)">📅</button>
            </td>
            <td>
                <span class="date-display" data-column="insertDate">${patient.insertDate || 'Not Set'}</span>
                <input type="date" class="calendar-input" style="display:none;" onchange="updateDate(this, ${index}, 'insertDate')">
                <button type="button" class="calendar-btn" onclick="toggleDateInput(this)">📅</button>
            </td>
            <td>
                <select class="lab-status-dropdown" data-column="labStatusInsert" onchange="updateLabStatus(this, ${index})">
                    <option value="awaiting lab" ${patient.labStatusInsert === "awaiting lab" ? "selected" : ""}>Awaiting Lab</option>
                    <option value="lab followed up" ${patient.labStatusInsert === "lab followed up" ? "selected" : ""}>Lab Followed Up</option>
                    <option value="lab back" ${patient.labStatusInsert === "lab back" ? "selected" : ""}>Lab Back</option>
                    <option value="not needed" ${patient.labStatusInsert === "not needed" ? "selected" : ""}>Not Needed</option>
                </select>
            </td>
            <td>
                <span class="date-display" data-column="offboardingDate">${patient.offboardingDate || 'Not Set'}</span>
                <input type="date" class="calendar-input" style="display:none;" onchange="updateDate(this, ${index}, 'offboardingDate')">
                <button type="button" class="calendar-btn" onclick="toggleDateInput(this)">📅</button>
            </td>
            <td>
                <span class="notes-display" onclick="openNotesPopup(${index})">${patient.notes.length > 10 ? patient.notes.slice(0, 10) + '...' : patient.notes || 'Not Set'}</span>
            </td>
            <td>
                <button onclick="deletePatient(${index})">Delete</button>
            </td>
        `;
        
        // Apply color based on lab status
        applyLabStatusColors(row, patient);

        patientTableBody.appendChild(row);
    });
}

function addPatient() {
    const name = document.getElementById('patientName').value.trim();
    const notes = document.getElementById('notes').value.trim();

    if (name === "") {
        alert("Patient name is required.");
        return;
    }

    const patients = JSON.parse(localStorage.getItem('patients')) || [];
    const newPatient = {
        name,
        prepDate: '',
        labStatusPrep: 'awaiting lab',
        ftpDate: '',
        insertDate: '',
        labStatusInsert: 'awaiting lab',
        offboardingDate: '',
        labStatusOffboarding: 'awaiting lab',
        notes
    };

    patients.push(newPatient);
    localStorage.setItem('patients', JSON.stringify(patients));
    loadPatients();

    // Clear input fields
    document.getElementById('patientName').value = '';
    document.getElementById('notes').value = '';
}

function toggleDateInput(button) {
    const input = button.previousElementSibling;
    input.style.display = input.style.display === 'none' ? 'block' : 'none';
}

function updateDate(input, index, column) {
    const patients = JSON.parse(localStorage.getItem('patients'));
    patients[index][column] = input.value;
    localStorage.setItem('patients', JSON.stringify(patients));
    loadPatients(); // Reload patients to reflect changes
}

function updateLabStatus(select, index) {
    const patients = JSON.parse(localStorage.getItem('patients'));
    const column = select.getAttribute('data-column');
    patients[index][column] = select.value;
    localStorage.setItem('patients', JSON.stringify(patients));
    loadPatients(); // Reload patients to reflect changes

    // Apply color based on new lab status
    applyLabStatusColors(select.closest('tr'), patients[index]);
}

function applyLabStatusColors(row, patient) {
    const today = new Date();

    // Helper function to apply color
    function setRowColor(cell, condition, color) {
        if (condition) {
            cell.classList.add(color);
        } else {
            cell.classList.remove('red', 'yellow', 'green'); // Remove all colors
        }
    }

    // Prep Lab Status
    setRowColor(row.cells[2], patient.labStatusPrep === "awaiting lab" && daysBetween(today, new Date(patient.prepDate)) < parseInt(document.getElementById('prepLabFollowUpWarning').value), 'red');
    setRowColor(row.cells[2], patient.labStatusPrep === "awaiting lab" && daysBetween(today, new Date(patient.prepDate)) < parseInt(document.getElementById('prepLabFollowUpWarning').value) + 1, 'yellow');
    setRowColor(row.cells[2], patient.labStatusPrep === "lab back", 'green');

    // Insert Lab Status
    setRowColor(row.cells[6], patient.labStatusInsert === "awaiting lab" && daysBetween(today, new Date(patient.insertDate)) < parseInt(document.getElementById('insertLabFollowUpWarning').value), 'red');
    setRowColor(row.cells[6], patient.labStatusInsert === "awaiting lab" && daysBetween(today, new Date(patient.insertDate)) < parseInt(document.getElementById('insertLabBackWarning').value), 'red');
    setRowColor(row.cells[6], patient.labStatusInsert === "lab back", 'green');

    // Offboarding Lab Status
    setRowColor(row.cells[8], patient.labStatusOffboarding === "awaiting lab" && daysBetween(today, new Date(patient.offboardingDate)) < parseInt(document.getElementById('offboardingLabFollowUpWarning').value), 'red');
    setRowColor(row.cells[8], patient.labStatusOffboarding === "lab back", 'green');
}

function daysBetween(date1, date2) {
    const diffTime = Math.abs(date2 - date1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
}

function deletePatient(index) {
    const patients = JSON.parse(localStorage.getItem('patients'));
    patients.splice(index, 1);
    localStorage.setItem('patients', JSON.stringify(patients));
    loadPatients(); // Reload patients to reflect changes
}

function openNotesPopup(index) {
    const patients = JSON.parse(localStorage.getItem('patients'));
    currentEditIndex = index;
    editNotesText.value = patients[index].notes;
    notesPopup.style.display = 'block';
}

saveNotesBtn.addEventListener('click', () => {
    const patients = JSON.parse(localStorage.getItem('patients'));
    patients[currentEditIndex].notes = editNotesText.value;
    localStorage.setItem('patients', JSON.stringify(patients));
    loadPatients();
    notesPopup.style.display = 'none';
});

discardNotesBtn.addEventListener('click', () => {
    notesPopup.style.display = 'none';
});

settingsBtn.addEventListener('click', () => {
    settingsPopup.style.display = 'block';
});
