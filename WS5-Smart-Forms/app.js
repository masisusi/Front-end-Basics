// 1. GET ALL THE FORM ELEMENTS WE NEED TO WORK WITH
// This line finds the entire forum using its ID "signupForm"
const form = document.getElementById('signupForm');

// This object holds references to all input fields so we can easily access them
const fields = {
    name: document.getElementById('name'),
    email: document.getElementById('email'),
    password: document.getElementById('password'),
    phone: document.getElementById('phone'),
    companyToggle: document.getElementById('companyToggle'),
    company: document.getElementById('company'),
    hp: document.getElementById('hp')
};

// This object holds the places where error messages will appear
const errorEls = {
    name: document.getElementById('nameError'),
    email: document.getElementById('emailError'),
    password: document.getElementById('passwordError'),
    phone: document.getElementById('phoneError'),
    company: document.getElementById('companyError')
};

// These are important parts of the form
const companySection = document.getElementById('companyFields'); // The company section that can be hidden/shown
const summary = document.getElementById('error-summary'); // The red box that shows all errors at the top
const clearBtn = document.getElementById('clearBtn'); // The "Clear" button

// 2. SHOW/ HIDE COMPANY FIELD WHEN CHECKBOX IS CLICKED
// When someone clicks the "Register as company" checkbox...
fields.companyToggle.addEventListener('change', () => {
    // Show or hide the company niem field
    companySection.hidden = !fields.companyToggle.checked;

    // If company is selected, make company name required
    if (!companySection.hidden) {
        fields.company.setAttribute('required', '');
    } else {
        // If not selected, remove requirement and clear error
        fields.company.removeAttribute('required');
        errorEls.company.textContent = '';
    }
});

// 3. DEBOUNCE: PREVENT TOO MANY VALIDATIONS WHEN TYPING FAST
// This funtion waits a short time before running validation
// So the browser doesn't slow down if you type quickly
function debounce(fn, wait = 250) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), wait);
    };
}

// 4. VALIDATION FUNCTIONS (ONE FOR EACH FIELD)
// Validates the name field
function validateName() {
    const el = fields.name;
    el.setCustomValidity(''); // Clear any old error

    // Check if name is empty
    if (el.validity.valueMissing) {
        el.setCustomValidity('Name is required.');
    }
    // Check if name is too short
    else if (el.value.trim().length < 2) {
        el.setCustomValidity('Name must be at least 2 characters.');
    }
    // Check if both first and last name are give
    else if (el.value.split(/\s+/).length < 2) {
        el.setCustomValidity('Please enter both first and last name.')
    }

    // Show the error message below the field
    errorEls.name.textContent = el.validationMessage;

    // Mark field as invalid so it turns red
    el.setAttribute('aria-invalid', String(!el.checkValidity()));

    // Return true if valid, false if not
    return el.checkValidity();
}

// Validates the email field
function validateEmail() {
    const el = fields.email;
    el.setCustomValidity('');

    if (el.validity.valueMissing) {
        el.setCustomValidity('Email is required.');
    } else if (el.validity.typeMismatch) {
        el.setCustomValidity('Enter a valid email address.');
    }

    errorEls.email.textContent = el.validationMessage;
    el.setAttribute('aria-invalid', String(!el.checkValidity()));
    return el.checkValidity();
}

// Validates the password field
function validatePassword() {
    const el = fields.password;
    el.setCustomValidity('');

    if (el.validity.valueMissing) {
        el.setCustomValidity('Password is required.');
    } else if (el.validity.tooShort) {
        el.setCustomValidity('Password must be at least 8 characters.');
    } else if (!/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/.test(el.value)) {
        el.setCustomValidity('Add upper case, lower case, and a number.');
    }

    errorEls.password.textContent = el.validationMessage;
    el.setAttribute('aria-invalid', String(!el.checkValidity()));
    return el.checkValidity();
}

// Validates the phone field (optional)
function validatePhone() {
    const el = fields.phone;
    el.setCustomValidity('');

    // Only check if the user entered something
    if (el.value && !el.checkValidity()) {
        el.setCustomValidity('Phone format example: +358 40 124 4567');
    }

    errorEls.phone.textContent = el.validationMessage;
    el.setAttribute('aria-invalid', String(!el.checkValidity()));
    return el.checkValidity();
}

// Validates company name (only if company is selected)
function validateCompany() {
    if (companySection.hidden) return true; // Skip if not selected

    const el = fields.company;
    el.setCustomValidity('');

    if (el.validity.valueMissing) {
        el.setCustomValidity('Company name is required when registering as a company.');
    }

    errorEls.company.textContent = el.validationMessage;
    el.setAttribute('aria-invalid', String(!el.checkValidity()));
    return el.checkValidity();
}

// 5. LIVE VALIDATION: CHECK FIELDS AS USER TYPES
// Run validation when user types in each fields
fields.name.addEventListener('input', () => { debounce(validateName, 150)(); buildSummary(); });
fields.email.addEventListener('input', () => { debounce(validateEmail, 150)(); buildSummary(); });
fields.password.addEventListener('input', () => { debounce(validatePassword, 150)(); buildSummary(); });
fields.phone.addEventListener('input', () => { debounce(validatePhone, 150)(); buildSummary(); });
fields.company.addEventListener('input', () => { debounce(validateCompany, 150)(); buildSummary(); });

// 6. ERROR SUMMARY: SHOW ALL ERRORS IN A RED BOX AT THE TOP
// This functioin checks all fields and builds a list of errors
function buildSummary() {
    const problems = [];

    if (!validateName()) problems.push('Name: ' + fields.name.validationMessage);
    if (!validateEmail()) problems.push('Email: ' + fields.email.validationMessage);
    if (!validatePassword()) problems.push('Password: ' + fields.password.validationMessage);
    if (!validatePhone()) problems.push('Phone: ' + fields.phone.validationMessage);
    if (!companySection.hidden && !validateCompany()) problems.push('Company: ' + fields.company.validationMessage);

    // If there are errors, show the red summary box
    if (problems.length) {
        summary.classList.remove('visually-hidden');
        summary.innerHTML = 'Please fix the following: ' + problems.join(' ');
    } else {
        // If no errors, hide the summary box
        summary.classList.add('visually-hidden');
        summary.innerHTML = '';
    }
}

// 7. AUTOSAVE FORM DATA TO BROWSER MEMORY
// This key is used to store data to the browser
const STORAGE_KEY = 'ws5-signup';

// Save current form data to browser storage
function saveDraft() {
    const data = {
        name: fields.name.value,
        email: fields.email.value,
        phone: fields.phone.value,
        password: fields.password.value,
        companyToggle: fields.companyToggle.value,
        company: fields.company.value
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    console.log('Save Draft:', data); // Shows in DevTools Console
}

// Load saved data when page opens
function restoreDraft() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return; // No saved data

        const data = JSON.parse(raw);

        fields.name.value = data.name || '';
        fields.email.value = data.email || '';
        fields.phone.value = data.phone || '';
        fields.password.value = data.password || '';
        fields.companyToggle.checked = Boolean('data.companyToggle');
        companySection.hidden = !fields.companyToggle.checked;
        fields.company.value = data.company || '';

        console.log('Restored Draft:', data);
    } catch (e) {
        console.error('Restore Error:', e);
    }
}

// Save data every time user types or clicks
['input', 'change'].forEach(evt => form.addEventListener(evt, debounce(saveDraft, 300)));

// Load saved data when page loads
restoreDraft();

// 8. CLEAR BUTTON: RESET FORM AND DELETE SAVED DATA
clearBtn.addEventListener('click',() => {
    form.reset(); // Clear all fields
    localStorage.removeItem(STORAGE_KEY); // Delete saved data
    Object.values(errorEls).forEach(e => e.textContent = ''); // Clear error messages
    companySection.hidden = true; // Hide company fields
    buildSummary(); // Update error summary
    console.log('Form Cleared');
});

// 9. FORM SUBMISSION: FINAL CHECK + SEND DATA
form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Stop normal form submit

    // Check all fields one last time
    const isValid = validateName() && validateEmail() && validatePassword() && validatePhone() && validateCompany();
    buildSummary();

    // If not valid, focus on first error
    const firstInvalid = form.querySelector('[aria-invalid="true"]');
    if (!isValid && firstInvalid) {
        firstInvalid.focus();
        return;
    }

    // Bot detection: if hidden field has text, block submit
    if (fields.hp.value) {
        alert('Submission blocked due to bot detection.');
        return;
    }

    // Prepare data to send
    const payload = {
        name: fields.name.value,
        email: fields.email.value,
        phone: fields.phone.value,
        company: fields.companyToggle.checked ? fields.company.value : '',
        time: new Date().toISOString()
    };
    
    try {
        // Send data to a demo server (no real database)
        const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        alert('Submitted succesfully. Demo ID: ' + data.id);
        console.log('Submitted Data: ', payload);
    } catch (error) {
        alert('Network error occurred. Please try again.');
        console.error('Submission Error:', error);
    }
});

// 10. PHONE NORMALISATION (BONUS STEP)
// When user leaves the phone field, clean up the number.
fields.phone.addEventListener('blur', () => { // Triggers on focus loss to normalise phone numbers.
    
    const value = fields.phone.value.trim();
    // If field is empty, do nothing (phone is optional)
    if (value === '') {
        return;
    };
    
    // Remove all spaces, dashes, etc. -- keep only number
    const digits = fields.phone.value.replace(/[^0-9+]/g, ''); // Extracts only numeric characters and the '+' sign.

    // If starts with 0, replace with Finland code +358
    if (digits.startsWith('0')) { // Checks if the number starts with '0' and prepends '+358'
        fields.phone.value = '+358' + digits.slice(1);
    }
    // If already has +, keep it
    else if (digits.startsWith('+')) { // Preserves numbers already starting with '+'
        fields.phone.value = digits;
    }
    // Otherwise, add +358.
    else {
        fields.phone.value = '+358' + digits; // Updates the input value with the normalised format.
    }

    // Logs the result for debugging.
    console.log('Normalised Phone:', fields.phone.value); // Shows in DevTools Console

});