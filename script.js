const form = document.getElementById('registrationForm');
const feedback = document.getElementById('formFeedback');

const fields = {
    fullName: document.getElementById('fullName'),
    email: document.getElementById('email'),
    password: document.getElementById('password'),
    confirmPassword: document.getElementById('confirmPassword'),
    age: document.getElementById('age'),
};

const errorEls = {
    fullName: document.getElementById('fullNameError'),
    email: document.getElementById('emailError'),
    password: document.getElementById('passwordError'),
    confirmPassword: document.getElementById('confirmPasswordError'),
    age: document.getElementById('ageError'),
};

const validators = {
    fullName(value) {
        if (!value.trim()) return 'Full name is required.';
        if (value.trim().length < 3) return 'Please enter at least 3 characters.';
        return '';
    },
    email(value) {
        if (!value.trim()) return 'Email is required.';
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value)) return 'Enter a valid email address.';
        return '';
    },
    password(value) {
        if (!value) return 'Password is required.';
        if (value.length < 8) return 'Password must be at least 8 characters long.';
        const numberPattern = /\d/;
        const letterPattern = /[A-Za-z]/;
        if (!numberPattern.test(value) || !letterPattern.test(value)) {
            return 'Password should include letters and numbers.';
        }
        return '';
    },
    confirmPassword(value) {
        if (!value) return 'Please confirm your password.';
        if (value !== fields.password.value) return 'Passwords do not match.';
        return '';
    },
    age(value) {
        if (!value.trim()) return 'Age is required.';
        const ageValue = Number(value);
        if (Number.isNaN(ageValue) || !Number.isInteger(ageValue)) {
            return 'Enter a valid whole number for age.';
        }
        if (ageValue < 13) {
            return 'You must be at least 13 years old.';
        }
        return '';
    },
};

function showError(fieldName, message) {
    errorEls[fieldName].textContent = message;
}

function clearErrors() {
    Object.values(errorEls).forEach(el => el.textContent = '');
    feedback.textContent = '';
    feedback.className = '';
}

function validateField(fieldName) {
    const value = fields[fieldName].value;
    const errorMessage = validators[fieldName](value);
    showError(fieldName, errorMessage);
    return errorMessage === '';
}

Object.keys(fields).forEach(fieldName => {
    fields[fieldName].addEventListener('input', () => {
        validateField(fieldName);
        feedback.textContent = '';
        feedback.className = '';
    });
});

form.addEventListener('submit', event => {
    event.preventDefault();
    clearErrors();

    const isValid = Object.keys(fields).every(fieldName => validateField(fieldName));

    if (!isValid) {
        feedback.textContent = 'Please fix the highlighted errors before submitting.';
        feedback.className = 'form-error';
        return;
    }

    feedback.textContent = 'Registration successful! Your form has been submitted.';
    feedback.className = 'success-message';
    form.reset();
});
