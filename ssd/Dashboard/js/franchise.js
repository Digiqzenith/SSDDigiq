import { validateEmail, validateMobile, displayErrorMessage, clearErrorMessages, getTokenFromCookie, buttonProperty, showMessage } from './formUtils.js';
import { API_BASE_URL } from './config.js';  // Importing the base URL from config.js

// register franchise 
const franchiseForm = document.getElementById('franchiseForm');
franchiseForm?.addEventListener('submit', async function (e) {
    e.preventDefault();
    const form = this;
    const formData = new FormData(form);
    const formObject = Object.fromEntries(formData.entries());

    clearErrorMessages(form); // Clear previous errors

    const isValid = validateForm(formData, form, "franchiseRegister"); // Custom validation

    if (isValid) {
        const submitButton = document.getElementById('createFranchise');
        submitButton.disabled = true;
        submitButton.textContent = "Submitting...";

        try {
            // Sending a POST request to the backend to register the franchise
            const response = await fetch(`${API_BASE_URL}/create-franchise`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(formObject)
            });


            const result = await response.json(); // Parsing the JSON rsponse

            if (response.ok) {
                localStorage.setItem('result', JSON.stringify(result));

                document.cookie = `token=${result.token}; expires=" + new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString() + "; path=/`;
                window.location.href = '/ssd/Dashboard/html/Masterfranchisedashboard.html'
            } else {
                if (result.message && result.message.includes('E11000 duplicate key error')) {
                    alert("Email already exists. Please use a different email address.");
                    const emailInput = document.getElementById('email');
                    emailInput.value = "";

                    submitButton.disabled = false;
                    submitButton.textContent = "submit";
                }
            }
        } catch (error) {
            document.getElementById('message').textContent = 'Submission failed. Please try again.';
            message.style.color = 'red';
            submitButton.disabled = false;
            submitButton.textContent = "Submit";
        }

    }
});

// Custom form validation for franchise form
function validateForm(formData, form, formType) {

    let valid = true;
    if (formType === "franchiseRegister") {
        const name = formData.get('name');
        if (name.length === 0 || name.length > 25) {
            displayErrorMessage(form.querySelector('#name'), 'Name is required and should be less than 25 characters.');
            valid = false;
        }

        const email = formData.get('email');
        if (!validateEmail(email)) {
            displayErrorMessage(form.querySelector('#email'), 'Please enter a valid email address.');
            valid = false;
        }

        const mobile = formData.get('MobileNo');
        if (!validateMobile(mobile)) {
            displayErrorMessage(form.querySelector('#mobile'), 'Please enter a valid 10-digit mobile number.');
            valid = false;
        }

        const password = formData.get('password');
        if (password.length < 6 || password.length > 10) {
            displayErrorMessage(form.querySelector('#password'), 'Password should be between 6 and 10 characters.');
            valid = false;
        }
    } else if (formType === "centerLogin") {

        const password = formData.get('password')?.trim();
        if (password.length < 6 || password.length > 10) {
            displayErrorMessage(form.querySelector('#password'), 'Password should be between 6 and 10 characters.');
            valid = false;
        }

        const centerId = formData.get('centerId')?.trim();
        if (!centerId) {
            displayErrorMessage(form.querySelector("#centerId"), "centerId is required");
            valid = false;
        }
    }
    else { //franchiseLogin
        const email = formData.get('email');
        if (!validateEmail(email)) {
            displayErrorMessage(form.querySelector('#email'), 'Please enter a valid email address.');
            valid = false;
        }

        const password = formData.get('password');
        if (password.length < 6 || password.length > 10) {
            displayErrorMessage(form.querySelector('#password'), 'Password should be between 6 and 10 characters.');
            valid = false;
        }
    }
    return valid;
}

//franchise login script
const franchiseLoginForm = document.getElementById('franchiseLoginForm');
franchiseLoginForm?.addEventListener('submit', async function (event) {
    event.preventDefault();
    const form = this;
    const formData = new FormData(form);
    const formObject = Object.fromEntries(formData.entries());

    clearErrorMessages(form); // Clear previous errors
    const isValid = validateForm(formData, form, "loginForm")
    if (isValid) {
        try {
            const res = await fetch(`${API_BASE_URL}/franchise/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formObject),
                credentials: 'include' // Include cookies for session management
            })

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('result', JSON.stringify(data));
                document.cookie = `token=${data.token}; expires=" + new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString() + "; path=/`;
                window.location.href = '/ssd/Dashboard/html/Masterfranchisedashboard.html';
            } else {
                alert('Login failed. Please check your credentials.');
            }
        } catch (error) {
            alert('Login failed. Please check your credentials.');
        }
    }
})

//center login
let loginButton = document.getElementById('centerLogin');
loginButton?.addEventListener("submit", async function (e) {
    e.preventDefault(); // Prevent the default form submission

    const form = this;
    const formData = new FormData(form)
    const formObject = Object.fromEntries(formData.entries());

    clearErrorMessages(form); // Clear previous errors

    // const isValid = validateForm(formData, form, "centerLogin")
    // if (isValid) {
    if (formData) {
        try {
            const res = await fetch(`${API_BASE_URL}/center-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formObject),
                credentials: 'include' // Include cookies for session management
            })

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('result', JSON.stringify(data));
                document.cookie = `token=${data.token}; expires=" + new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString() + "; path=/`;
                window.location.href = '/ssd/Dashboard/html/Masterfranchisedashboard.html';
            } else {
                alert('Login failed. Please check your credentials.');
            }
        } catch (error) {
            alert('Login failed. Please check your credentials.');
        }

    }

})


const token = getTokenFromCookie();

if (token) {
    const result = JSON.parse(localStorage.getItem('result'));
    if (result?.user.role == 'center') {
        courseUniversity()
        centerData();
    }
}

async function courseUniversity() {
    const token = getTokenFromCookie();
    const universitySelect = document.getElementById("university");
    const courseSelect = document.getElementById("course");
    try {
        const response = await fetch(`${API_BASE_URL}/center/franchise/university-courses`, {
            method: `GET`,
            withCredentials: true,
            credentials: 'include',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });

        const result = await response.json();
        if (response.ok) {
            const { universities, courses } = result.data;
            localStorage.setItem('franchiseUniversity&courses', JSON.stringify(result));

            universities.forEach(university => {
                const option = document.createElement('option');
                option.value = university._id
                option.textContent = university.universityName;
                universitySelect.appendChild(option)
            })

            // change event listener after options are populated
            universitySelect?.addEventListener('change', () => {
                courseSelect.innerHTML = `<option value="">Select</option>`;
                const selectUniversityId = universitySelect.value;

                const filteredCourses = courses.filter(course => course.university_id._id === selectUniversityId)

                filteredCourses.forEach(course => {
                    const option = document.createElement("option");
                    option.value = course._id;
                    option.textContent = `${course.couShortName} - Fee: ₹${course.fees}`;
                    courseSelect.appendChild(option);
                })
            })
        }
    } catch (error) {
        alert(error);
    }
}
async function centerData() {
    const token = getTokenFromCookie();
    try {
        const response = await fetch(`${API_BASE_URL}/update/center`, {
            method: `GET`,
            withCredentials: true,
            credentials: 'include',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        })
        const result = await response.json();
        if (response.ok) {
            localStorage.setItem('centerWall', JSON.stringify(result))
        }
    } catch (error) {
        // console.log(error);
    }
}
let studentForm = document.getElementById('studentForm')
studentForm?.addEventListener('submit', async function (e) {

    e.preventDefault();


    const feeInfoBox = document.getElementById('feeInfoBox');
    const token = getTokenFromCookie();
    const form = this;
    const formData = new FormData(form);
    const formObject = Object.fromEntries(formData.entries());
    if (formObject) {

        buttonProperty('studentButton', true, 'Registering...');
        try {
            const response = await fetch(`${API_BASE_URL}/registerStudent`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
                credentials: 'include'
            });

            const result = await response.json();
            if (response.ok) {
                showMessage(form, result.message, 'success');
                buttonProperty('studentButton', false, "Submit");
                localStorage.setItem('Newstudent', JSON.stringify(result));

                feeInfoBox.style.display = 'block';  // Show the fee info box
                const feeInfo = result.feeInfo;

                feeInfoBox.innerHTML = `
                <h3>Fee Information</h3>
                <p>Total Fees: ₹${feeInfo.totalFees}</p>
                <p>Discount: ${feeInfo.discount}%</p>
                <p>Discounted Amount: ₹${feeInfo.discountedAmount}</p>
                <p><strong>Final Amount: ₹${feeInfo.finalAmount}</strong></p>
                `;
            } else {
                showMessage(form, result.message || 'Registration failed', 'danger');
                buttonProperty('studentButton', false, "Submit");
            }
        } catch (error) {
            showMessage(form, 'An error occurred. Please try again later.', 'danger');
        }

    }
});
