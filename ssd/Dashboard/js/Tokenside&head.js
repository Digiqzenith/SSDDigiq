import { API_BASE_URL } from '../js/config.js';  // Importing the base URL from config.js
import { getTokenFromCookie, buttonProperty, showMessage } from './formUtils.js';


window.onload = function () {
    const token = getTokenFromCookie(); // Use the utility function

    if (!token) {
        window.location.href = "/ssd/franchiselogin.html"
        return;
    }

    loadSidebar()
    headerBar()
    setActiveLink();

    // fetchAndDisplayStudents(token)

    const result = JSON.parse(localStorage.getItem('result'));
    if (result) {
        updateWelcomeSection();
        if (result.user.role === 'franchise') {
            allCenters(token); ``
            allUniversities(token);
            allTransactions();
            populateCourseTable();
        } else {
            allStudents(token);
            allcenterTransactions();
        }
    }

};

function loadSidebar() {
    document.getElementById('sidebarContainer').innerHTML = ` <nav class="sidebar mt-2">
        <div class="logo"><img src="/ssd/img/SSD2@4x2.png" class="img-fluid" alt=""></div>
        <ul class="mt-3 asidebar list-unstyled">

            <a href="/ssd/Dashboard/html/Masterfranchisedashboard.html" class="d-flex align-items-center text-decoration-none" id="dashboardLink">
                <li><i class="fas fa-th-large me-2"></i>Dashboard</li>
            </a>

            <a href="/ssd/Dashboard/html/sidebar/center.html" class="d-flex align-items-center text-decoration-none" id="centerLink">
            <li><i class="fas fa-braille me-2"></i>Centers</li>
            </a>

            <a href="/ssd/Dashboard/html/sidebar/students.html" class="d-flex align-items-center text-decoration-none" id="studentsLink">
                <li><i class="fas fa-users me-2"></i>Students</li>
            </a>

            <a href="/ssd/Dashboard/html/sidebar/universities.html" class="d-flex align-items-center text-decoration-none" id="universitiesLink">
                <li><i class="fa-solid fa-building-columns me-2"></i>Universities</li>
            </a>

             <a href="/ssd/Dashboard/html/sidebar/transactions.html" class="d-flex align-items-center text-decoration-none" id="transactionsLink">
                <li><i class="fa-solid fa-money-bill-transfer me-2"></i>Transactions</li>
            </a>

            <a class="d-flex align-items-center text-decoration-none">
                <li><i class="fa-solid fa-right-from-bracket me-2"></i>
                    <button id="logOutButton" class="border-0 bg-transparent p-0">Log Out</button>
                </li>
            </a>

        </ul>
    </nav>
`;
}

function headerBar() {
    document.getElementById('headerBar').innerHTML = `<div class="search-bar">
                        </div>
                        <div class="header-icons d-flex">
                            <a class="nav-link dropdown-toggle mt-2" href="#" role="button" data-bs-toggle="dropdown"
                                aria-expanded="false">
                                <span>Profile</span>
                            </a>
                            <ul class="dropdown-menu p-3">
                            </ul>

                            <div">
                                <img src="/ssd/img/profileLogo.jpg" class="img-fluid test rounded-circle">
                            </div>
                        </div>`
    const searchBar = document.querySelector('.search-bar');
    const result = JSON.parse(localStorage.getItem('result'));
    const centerWallet = JSON.parse(localStorage.getItem('centerWall'));

    if (searchBar && result?.user.role == 'center') {

        document.getElementById('walletModal').innerHTML = `<div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="walletModalLabel">Add Money to Wallet</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="walletForm">
                        <div class="mb-3">  
                            <label for="transactionId" class="form-label">Transaction ID</label>
                            <input type="text" class="form-control" id="transactionId" name="transactionId" required>
                        </div>
                        <div class="mb-3">
                            <label for="amount" class="form-label">Amount</label>
                            <input type="number" class="form-control" id="amount" name="amount" required>
                        </div>
                        <button type="submit" class="btn btn-outline-dark" id="walletTransaction">Send Request</button>
                    </form>
                </div>
            </div>
        </div>`

        const walletMoney = document.createElement('button');
        const button = document.createElement('button');

        walletMoney.innerHTML = `<i class="fa-solid fa-indian-rupee-sign"></i> ${centerWallet.center.wallet_balance}`
        button.innerHTML = `<i class="fa-solid fa-wallet"></i> wallet`
        button.classList.add("btn", "btn-outline-secondary");
        walletMoney.classList.add("btn", "btn-outline-secondary", "ms-2");
        button.setAttribute('data-bs-toggle', 'modal');
        button.setAttribute('data-bs-target', '#walletModal'); // Open modal on click

        searchBar.appendChild(button)
        searchBar.appendChild(walletMoney)
    }

    //add money to wallet
    const walletForm = document.getElementById('walletForm');
    walletForm?.addEventListener('submit', async function (e) {
        e.preventDefault();

        const transactionId = document.getElementById('transactionId').value;
        const amount = document.getElementById('amount').value;
        const form = this;

        const token = getTokenFromCookie();
        // Basic validation for transaction ID
        if (!/^[A-Za-z0-9]{8,12}$/.test(transactionId)) {
            alert("Invalid transaction ID format. It must be 8-12 alphanumeric characters.");
            return;
        }
        const isValidTransactionId = /^[A-Za-z0-9]{8,12}$/.test(transactionId);
        if (!isValidTransactionId) {
            alert("Transaction ID must be 8-12 alphanumeric characters.");
            return;
        }

        if (isValidTransactionId && amount) {
            try {
                const response = await fetch(`${API_BASE_URL}/wallet/request-topup`, {
                    method: 'POST',
                    headers: {
                        'content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ transactionId, amount })
                })

                const result = await response.json();
                if (response.ok) {
                    showMessage(form, 'request sent successfully!');
                    buttonProperty('walletTransaction', false, "Submit");
                    localStorage.setItem('wallet', JSON.stringify(result));
                } else {
                    showMessage(form, result.message, 'danger');
                }
                // Reset form and close modal
                document.getElementById('walletForm').reset();
            } catch (error) {
                // console.log(error);
                showMessage(form, error.message, 'danger'); // Pass the form here
                buttonProperty('walletTransaction', false, "Submit");
            }
        }

    })
}

// Function to dynamically add active class based on the current page URL
function setActiveLink() {
    const currentPath = window.location.pathname;

    // Map links to their respective paths
    const links = {
        '/ssd/Dashboard/html/Masterfranchisedashboard.html': 'dashboardLink',
        '/ssd/Dashboard/html/sidebar/center.html': 'centerLink',
        '/ssd/Dashboard/html/sidebar/students.html': 'studentsLink',
        '/ssd/Dashboard/html/sidebar/universities.html': 'universitiesLink',
        '/ssd/Dashboard/html/sidebar/transactions.html': 'transactionsLink'
    };

    // Find the link that matches the current path and add the 'active' class
    for (const path in links) {
        if (currentPath.includes(path)) {
            document.getElementById(links[path]).classList.add('active');
        }
    }
}

function updateWelcomeSection() {
    const result = JSON.parse(localStorage.getItem('result'));

    const welcomeSection = document.querySelector('.welcome-section');
    const dropdownMenu = document.querySelector(".dropdown-menu");

    if (result.user.role == 'franchise') {
        updateQuickLinks('franchise');
        updateListItems('franchise');

        if (welcomeSection) {
            welcomeSection.innerHTML = `<h2>Hyy ${result.user.name} Master</h2>
                <p>Welcome, <span role="img" aria-label="waving hand">👋</span></p>`
        }

        if (dropdownMenu) {
            dropdownMenu.innerHTML = ` <li>Name: ${result.user.name}</li>
                <li>Email: ${result.user.email}</li>
                <li>MobileNo. ${result.user.MobileNo}</li>`
        }
    } else {
        if (result.user.role == 'center') {
            updateQuickLinks('center')
            updateListItems('center')
            if (welcomeSection) {
                welcomeSection.innerHTML = `<h2>Hyy ${result.user.centerName}</h2>
                    <p>Welcome, <span role="img" aria-label="waving hand">👋</span></p>`
            }
            if (dropdownMenu) {
                dropdownMenu.innerHTML = `<li>Name: ${result.user.centerName}</li>
                    <li>Email: ${result.user.email}</li>
                    <li>MobileNo. ${result.user.MobileNo}</li>`
            }
        }
    }
}

function updateQuickLinks(role) {
    const quickSection = document.querySelector('.quickSection');

    // Clear the quick section before adding new content
    if (role === 'franchise') {
        if (quickSection) {
            quickSection.innerHTML = `
            <div class="link-item">
            <h4>Create Center
            <div style="display: flex; justify-content: space-between; align-items: center;">
            <p style="color: grey; font-size: 15px; margin: 0;">create your center....</p>
            <button class="create" onclick="popupForm('center')">Create</button>
            </div>
            </div>
            <div class="link-item">
            <h4>Create University
            <div style="display: flex; justify-content: space-between; align-items: center;">
            <p style="color: grey; font-size: 15px; margin: 0;">create your university....</p>
            <button class="create" onclick="popupForm('university')">Create</button>
            </div>
            </div>`

        }
    } else if (role === 'center') {
        if (quickSection) {
            quickSection.innerHTML += `
            <div class="link-item">
            <h4>Register Student
            <div style="display: flex; justify-content: space-between; align-items: center;">
            <p style="color: grey; font-size: 15px; margin: 0;">Register your student ....</p>
            <button class="create" onclick="popupForm('student')">Create</button>
            </div>
            </div>`;
        }
    }
}

function updateListItems(formType) {
    const sidebarListItems = document.querySelectorAll('#sidebarContainer a');

    if (sidebarListItems.length >= 2 && formType === 'franchise') {
        // sidebarListItems[1].innerHTML = `<li>
        //     <i class="fas fa-braille me-2"></i>Centers
        //     </li>`;

        sidebarListItems[2].remove();
    }
    else if (sidebarListItems.length >= 5 && formType == 'center') {
        sidebarListItems[1].remove();
        sidebarListItems[3].remove();
    }

    // logOutButton logic 
    sidebarListItems[5]?.addEventListener('click', async (e) => {
        e.preventDefault(); // Prevent default behavior if necessary
        try {
            // Set the cookie to expire immediately
            document.cookie = `token=; expires=${new Date(Date.now()).toUTCString()}; path=/`;

            // Force cache to be cleared to avoid back navigation issues
            if ('caches' in window) {
                caches.keys().then(function (names) {
                    for (let name of names) caches.delete(name);
                });
            }
            window.location.href = "/ssd/franchiselogin.html";
            localStorage.removeItem('SearchStudents')
        } catch (error) {
            // console.log(error);
        }
    });

}

// overlay script 
const overlay = document.getElementById('overlay');
overlay?.addEventListener('click', function () {
    const popupCenterForm = document.getElementById('popupCenterForm');
    const popupUniversityForm = document.getElementById('popupUniversityForm');
    const popupStudentForm = document.getElementById('popupStudentForm');
    const popupCourseForm = document.getElementById('popupCourseForm');
    const overlayElement = document.getElementById('overlay');

    if (popupCenterForm) popupCenterForm.style.display = 'none';
    if (popupUniversityForm) popupUniversityForm.style.display = 'none';
    if (popupStudentForm) popupStudentForm.style.display = 'none';
    if (popupCourseForm) popupCourseForm.style.display = 'none';
    if (overlayElement) overlayElement.style.display = 'none';
});

// master franchise dashboard js 
function popupForm(formType, universityId) {
    if (formType === 'center') {
        document.getElementById('popupCenterForm').style.display = 'block'
        document.getElementById('overlay').style.display = 'block'
    } else if (formType === "university") {
        document.getElementById('popupUniversityForm').style.display = 'block'
        document.getElementById('overlay').style.display = 'block'
    } else if (formType === 'course') {
        document.getElementById('popupCourseForm').style.display = 'block'
        document.getElementById('overlay').style.display = 'block'
        document.getElementById('courseFormUniversityId').value = universityId
    }
    else {
        document.getElementById('popupStudentForm').style.display = 'block'
        document.getElementById('overlay').style.display = 'block'
    }
}
window.popupForm = popupForm;

// fetching students 
async function allStudents(token) {
    try {
        const response = await fetch(`${API_BASE_URL}/all-students`, {
            method: 'GET',
            withCredntials: true,
            credentials: 'include', // Include cookies in the request
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch students.");
        }

        const students = await response.json();
        localStorage.setItem('students', JSON.stringify(students));

        populateStudentTable(students);

    } catch (error) {
        // console.log(error);
    }
}
// showing students
function populateStudentTable(students) {
    const tableBody = document.getElementById('studentsTable')
    const sessionList = document.getElementById('session')

    students.forEach(student => {
        const row = document.createElement('tr');
        sessionList ? sessionList.innerHTML = `<option value="">Select Session</option>
        <option value="${student.session}">${student.session}</option>` : "";
        row.innerHTML = `
        <td>${student?.session}</td>
        <td>${student?.studentName}</td>
        <td>${student?.Aadhaar}</td>
        <td>${student?.Category}</td>
        <td>${student?.Gender}</td>
        <td>${student?.FatherName}</td>
        <td>${student?.MobileNo}</td>
        <td>${student?.MotherName}</td>
        <td>not available in database</td>
        <td>${student?.age}</td>
        <td>${student?.MaritalStatus}</td>
        <td>${student?.Religion}</td>
        <td>${student?.whatsappNo}</td>
        <td>${student?.nationality}</td> 
        <td>${student?.EmailId}</td>
        <td>${student?.Address}</td>
        <td>${student?.course_id?.couShortName}</td>
        <td>${student?.course_id.university_id?.universityName}</td>
        <td>${student?.coursefee}</td>
        <td>${student?.discountFee}</td>
        <td>${student?.feeStatus}</td>
        <td><img src="${student.image.url}" alt="Student Profile" width="50" height="50"></td>
        `;
        tableBody?.appendChild(row);
    })
}

// centerRegistration form 
const centerForm = document.getElementById('centerForm')
centerForm?.addEventListener('submit', async function (e) {
    e.preventDefault();

    const form = this;
    const formData = new FormData(form);
    const formObject = Object.fromEntries(formData.entries());
    const token = getTokenFromCookie();

    if (formObject) {
        buttonProperty('centerCreation', true, "Submitting...");

        try {
            const res = await fetch(`${API_BASE_URL}/add-center`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formObject),
                credentials: 'include'
            });

            const data = await res.json();

            if (res.ok) {
                showMessage(form, 'Center created successfully!')
                form.reset();
                buttonProperty('centerCreation', false, "Submit");
                localStorage.setItem('centerRegistered', JSON.stringify(data));

            } else {
                let errorMessage = data.message || 'An error occurred. Please try again.';
                // Check for duplicate email error
                if (data.error && data.error.includes('duplicate key error') && data.error.includes('email')) {
                    errorMessage = 'This email is already registered. Please use a different email address.';
                }

                showMessage(form, errorMessage, 'danger'); // Pass the form here
                buttonProperty('centerCreation', false, "Submit");
            }
        } catch (error) {
            // console.error(error);
            showMessage(form, 'Submission failed. Please try again.', 'danger'); // Pass the form here
            buttonProperty('centerCreation', false, "Submit");
        }
    }
});
//fetch all centers
async function allCenters(token) {
    try {
        const response = await fetch(`${API_BASE_URL}/all-centers`, {
            method: 'GET',
            withCredntials: true,
            credentials: 'include', // Include cookies in the request
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch centers.");
        }

        const data = await response.json();
        localStorage.setItem('data', JSON.stringify(data));

        // Pass centers array to populateTable if it is an array
        populateCenterTable(data)
    } catch (error) {
        // console.log(error);
    }
}
// showing all centers 
function populateCenterTable(data) {
    const tableBody = document.getElementById('tableBody');

    data.centers.forEach(center => {
        // Create a row for each center
        const centerRow = document.createElement("tr");
        centerRow.classList.add("text-center");
        centerRow.innerHTML = `
        <td>${center.centerName}</td>
        <td>${center.email}</td>
        <td>${center.centerId}</td>
        <td>${center.MobileNo}</td>
        <td>${center.discount}</td>
        <td>${center.wallet_balance}</td>
        <td class="expandable fw-bolder fs-3">+</td>
        <td class="p-3"><button class="bg-danger border-0 rounded text-white text-center ms-3" id="centerDelete">Delete Center</button></td>
        <td class="p-3"><button class="bg-success border-0 rounded text-white text-center ms-3">Add money</button></td>
        `;

        centerRow.querySelector(".expandable").addEventListener("click", function () {
            const studentRows = document.querySelectorAll(`.student-${center.centerId}`);
            studentRows.forEach(row => {
                row.style.display = row.style.display === "table-row" ? "none" : "table-row";
            });
            this.textContent = this.textContent === "+" ? "-" : "+";
        });
        tableBody?.appendChild(centerRow);

        // Find students associated with the current center
        const associatedStudents = data.students.filter(student => student.center_id._id === center._id);

        // Create a row for each student under this center
        associatedStudents.forEach(student => {
            const studentRow = document.createElement("thead");
            studentRow.classList.add(`student-${center.centerId}`, "student-head");
            studentRow.innerHTML = `
            <tr>
            <th>Session</th>
            <th>Student Name</th>
            <th>Aadhaar</th>
            <th>Category</th>
            <th>Gender</th>
            <th>Father Name</th>
            <th>MobileNo</th>
            <th>MotherName</th>
            <th>not available in database</th>
            <th>Email</th>
            <th>Mobile No</th>
            <th>Age</td>
            <th>Marital Status</th>
            <th>Religion</th>
            <th>Whatsapp No.:</th>
            <th>Address</th>
            <th>Course</th>
            <th>University</th>
            <th>Profile</th>
            </tr>
            <tbody>
            <tr>
            <td>${student.session}</td>
            <td>${student.studentName}</td>
            <td>${student.Aadhaar}</td>
            <td>${student.Category}</td>
            <td>${student.Gender}</td>
            <td>${student.FatherName}</td>
            <td>${student.MobileNo}</td>
            <td>${student.MotherName}</td>
            <td>not available in database</td>
            <td>${student.EmailId}</td>
            <td>${student.MobileNo}</td>
            <td>${student.age}</td>
            <td>${student.MaritalStatus}</td>
            <td>${student.Religion}</td>
            <td>${student.whatsappNo}</td>
            <td>${student.Address}</td>
            <td>${student.course_id.couShortName}</td>
            <td>${student.course_id.university_id?.universityName}</td>
            <td><img src="${student.image.url}" alt="Student Profile" width="50" height="50"></td>
            </tr>
            </tbody>`;
            studentRow.style.display = "none"; // Hide initially
            tableBody?.appendChild(studentRow);
        });
    });
}
// university register 
const univerisityForm = document.getElementById('universityForm');
univerisityForm?.addEventListener('submit', async function (e) {
    e.preventDefault();
    const form = this;
    const formData = new FormData(form);

    const token = getTokenFromCookie();

    if (formData) {
        buttonProperty('UniversityCreation', true, "Submitting...");
        try {
            const response = await fetch(`${API_BASE_URL}/university/register`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData, // Send formData directly
                credentials: 'include'
            });
            const data = await response.json();

            if (response.ok) {
                showMessage(form, 'University created successfully!');
                buttonProperty('UniversityCreation', false, "Submit");
                localStorage.setItem('universityCreate', JSON.stringify(data));

            } else {
                let errorMessage = data.message || 'An error occurred. Please try again.';

                // Check for duplicate email error
                if (data.error && data.error.includes('duplicate key error') && data.error.includes('email')) {
                    errorMessage = 'This email is already registered. Please use a different email address.';
                }

                showMessage(form, errorMessage, 'danger'); // Pass the form here
                buttonProperty('UniversityCreation', false, "Submit");
            }
        }
        catch (error) {

            showMessage(form, 'Submission failed. Please try again.', 'danger'); // Pass the form here
            buttonProperty('UniversityCreation', false, "Submit");
        }
    }
})
// fetch all universities 
async function allUniversities(token) {
    try {
        const response = await fetch(`${API_BASE_URL}/all-university`, {
            method: `GET`,
            withCredntials: true,
            credentials: 'include',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('universities', JSON.stringify(data));
            populateUniversitiesCard(data);
        }
    } catch (error) {
        // console.log(error)
    }
}
// showing all universities 
function populateUniversitiesCard(data) {
    const cardRow = document.getElementById('card-row');

    // create the card body
    data.university.forEach(university => {
        const cardWrapper = document.createElement('div')
        const card = document.createElement('div');
        const img = document.createElement('img');
        const cardBody = document.createElement('div');
        const viewCoursesLink = document.createElement('a');

        card.classList.add('card');
        img.classList.add('card-img-top');
        cardBody.classList.add("card-body");
        cardWrapper.classList.add('col-lg-5', 'col-md-5', 'col-xxl-4')

        card.style.width = '100%';
        card.style.border = '1px solid #ddd';
        card.classList.add('col-md-4', 'mb-4');

        img.classList.add('p-3')
        img.src = `${university.image.url}`
        img.alt = `${university.universityName} logo`;

        viewCoursesLink.href = '/ssd/Dashboard/html/courses/courses.html';
        viewCoursesLink.classList.add('ms-2', 'text-decoration-none', 'text-black', 'viewCourse');
        viewCoursesLink.innerHTML = `View all courses <i class="fa-solid fa-arrow-right"></i>`;
        viewCoursesLink.setAttribute('data-university-id', university._id);  // Store universityId in data attribute

        cardBody.innerHTML = `
        <h5>${university.universityName}</h5>
        <p class="card-text">${university.Email}</p>
        <p class="card-text">${university.MobileNo}</p>
        <button type="button" id="universityCourses" onclick="popupForm('course', '${university._id}')"
        class="border-0 create rounded-pill px-3 py-2">Create Courses</button> 
        `;

        // Append the newly created viewCoursesLink to cardBody
        cardBody?.appendChild(viewCoursesLink);
        card?.appendChild(img);
        card?.appendChild(cardBody);
        cardWrapper?.appendChild(card);
        cardRow?.appendChild(cardWrapper);
    })

    // Use event delegation for the dynamically created 'viewCourses' links
    cardRow?.addEventListener('click', function (event) {
        if (event.target.closest('.viewCourse')) {
            event.preventDefault(); // Prevent the default link behavior
            const universityId = event.target.closest('.viewCourse').getAttribute('data-university-id');
            allCourses(universityId); // Call the allCourses function with the correct universityId
        }
    });
}
//course register
const courseForm = document.getElementById('courseForm')
courseForm?.addEventListener('submit', async function (e) {
    e.preventDefault();

    const form = this;
    const formData = new FormData(form);
    const formObject = Object.fromEntries(formData.entries());
    const token = getTokenFromCookie();

    const universityId = document.getElementById('courseFormUniversityId').value; // Get universityId

    if (formObject) {
        buttonProperty('courseCreation', true, "Creating...");

        const response = await fetch(`${API_BASE_URL}/university/${universityId}/course/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formObject)
        });

        const result = await response.json();

        if (response.ok) {
            showMessage(form, 'Course created successfully!');
            form.reset();
            buttonProperty('courseCreation', false, "Submit");
            localStorage.setItem('courses', JSON.stringify(result));

        } else {
            let errorMessage = result.message || 'An error occurred. Please try again.';
            showMessage(form, errorMessage, 'danger'); // Pass the form here
            buttonProperty('courseCreation', false, "Submit");
            form.reset();
        }
    }
});
// fetch courses
async function allCourses(universityId) {
    const token = getTokenFromCookie();

    try {
        const response = await fetch(`${API_BASE_URL}/university/${universityId}/all-courses`, {
            method: `GET`,
            withCredentials: true,
            credentials: 'include',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('courses', JSON.stringify(data.courses));
            window.location.href = '/ssd/Dashboard/html/courses/courses.html';
            populateCourseTable();
        }
    } catch (error) {
        // console.log(error)
    }
}
// showing all courses relates to university
function populateCourseTable() {
    const courses = JSON.parse(localStorage.getItem('courses'));

    if (courses) {
        const tableBody = document.getElementById('courseTableBody'); // Ensure there's a tbody with id 'courseTableBody'
        tableBody ? tableBody.innerHTML = '' : ""; // Clear existing rows, if any

        courses.forEach(course => {
            const row = document.createElement('tr');

            const courseFullName = document.createElement('td');
            const courseShortName = document.createElement('td');
            const courseDuration = document.createElement('td');
            const courseFees = document.createElement('td');
            // const actionButton = document.createElement('td');

            courseFullName.textContent = course.courseFullName;
            courseShortName.textContent = course.couShortName;
            courseFees.textContent = course.fees;
            courseDuration.textContent = course?.courseDuration;

            row.appendChild(courseFullName);
            row.appendChild(courseShortName);
            row.appendChild(courseFees);
            row.appendChild(courseDuration);

            tableBody?.appendChild(row);
        })
    } else {
        // console.log("No courses found in localStorage.");
    }
}
// fetch transactionRequest
async function allTransactions() {
    const token = getTokenFromCookie();
    try {
        const response = await fetch(`${API_BASE_URL}/wallet/pending-transactions`, {
            method: `GET`,
            withCredentials: true,
            credentials: 'include',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('transactions', JSON.stringify(data.pendingTransactions));
            displayTransactions();
        }
    } catch (error) {
        // alert(error)
    }
}

function displayTransactions() {
    const tableHeader = document.getElementById('transactionTable')?.querySelectorAll('thead th');
    const transactions = JSON.parse(localStorage.getItem('transactions'));
    const result = JSON.parse(localStorage.getItem('result'));

    const tableBody = document.getElementById('transactionTable')?.querySelector('tbody');
    if (tableBody) {

        tableBody.innerHTML = ''; // Clear previous rows to avoid duplicates

        if (result.user.role == 'franchise') {
            transactions.forEach(transactions => {

                const { transactionId, centerId, amount, status, createdAt } = transactions;
                const row = document.createElement('tr');
                const date = new Date(createdAt).toLocaleString();
                row.innerHTML = ` <td>${transactionId}</td>
                <td>${centerId.centerName}</td>
                <td><i class="fa-solid fa-indian-rupee-sign"></i> ${amount.toLocaleString()}</td>
                <td>
                    <span class="badge ${status === 'approved' ? 'bg-success' : status === 'rejected' ? 'bg-danger' : 'bg-warning'}">
                    ${status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                    </td>
                    <td>${status == 'pending' ? `<button class="btn btn-success btn-sm approve-btn">Approve</button> <button class="btn btn-danger btn-sm reject-btn">Reject</button>` : ""
                    }</td >
                        <td>${date}</td>`

                tableBody.appendChild(row);

                if (status) {
                    const approveBtn = row.querySelector('.approve-btn');
                    const rejectBtn = row.querySelector('.reject-btn')
                    approveBtn?.addEventListener('click', () => approveTransaction(transactionId, 'approved'))
                    rejectBtn?.addEventListener('click', () => approveTransaction(transactionId, 'rejected'))
                }
            })
        } else {
            tableHeader[4]?.remove();
            transactions.forEach(transactions => {
                const { transactionId, centerId, amount, status, createdAt } = transactions;
                const row = document.createElement('tr');
                const date = new Date(createdAt).toLocaleString();
                row.innerHTML = ` <td>${transactionId}</td>
                        <td>${centerId.centerName}</td>
                        <td><i class="fa-solid fa-indian-rupee-sign"></i> ${amount.toLocaleString()}</td>
                        <td>
                        <span class="badge ${status === 'approved' ? 'bg-success' : status === 'rejected' ? 'bg-danger' : 'bg-warning'}">
                        ${status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                        </td>
                        <td>${date}</td>`

                tableBody.appendChild(row);
            })
        }
    }
}

async function approveTransaction(transactionId, approved) {
    const token = getTokenFromCookie();
    try {
        const response = await fetch(`${API_BASE_URL}/master/approve-transaction`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ transactionId, approved })
        })
        const data = await response.json();
        if (response.ok) {
            await allTransactions(); // Refresh the transaction data
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        alert(error);
    }
}
// centers transactions 
async function allcenterTransactions() {
    const token = getTokenFromCookie();
    try {
        const response = await fetch(`${API_BASE_URL}/centerTransactions/history`, {
            method: `GET`,
            withCredentials: true,
            credentials: 'include',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        })
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('transactions', JSON.stringify(data))
            displayTransactions()
        }
    } catch (error) {
        // console.log(error);
    }
}

