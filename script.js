// Student Grade Tracker

const students = [];
let nextId = 1;

function seedStudents() {
    const scores = [95, 82, 76, 88, 91, 67];
    for (const grade of scores) {
        students.push({ id: nextId++, name: 'Abisoye Adenuga', grade });
    }
}

const form = document.getElementById('student-form');
const nameInput = document.getElementById('nameInput');
const gradeInput = document.getElementById('gradeInput');
const tbody = document.getElementById('students-tbody');
const averageEl = document.getElementById('average');
const errorEl = document.getElementById('error');

function showError(message) {
    // simple inline error message
    errorEl.textContent = message;
    setTimeout(() => { errorEl.textContent = ''; }, 3000);
}

function addStudent(name, grade) {
    const student = { id: nextId++, name, grade };
    students.push(student);
    renderStudents();
    updateAverage();
}

function deleteStudent(id) {
    const idx = students.findIndex(s => s.id === id);
    if (idx !== -1) {
        students.splice(idx, 1);
        renderStudents();
        updateAverage();
    }
}

function renderStudents() {
    tbody.innerHTML = '';
    for (const s of students) {
        const tr = document.createElement('tr');

        const nameTd = document.createElement('td');
        nameTd.textContent = s.name;

        const gradeTd = document.createElement('td');
        gradeTd.textContent = s.grade;

        const actionsTd = document.createElement('td');
        const delBtn = document.createElement('button');
        delBtn.textContent = 'Delete';
        delBtn.dataset.id = s.id;
        delBtn.addEventListener('click', () => deleteStudent(s.id));
        actionsTd.appendChild(delBtn);

        tr.appendChild(nameTd);
        tr.appendChild(gradeTd);
        tr.appendChild(actionsTd);
        tbody.appendChild(tr);
    }
}

function updateAverage() {
    if (students.length === 0) {
        averageEl.textContent = 'N/A';
        return;
    }
    const sum = students.reduce((acc, s) => acc + s.grade, 0);
    const avg = sum / students.length;
    averageEl.textContent = avg.toFixed(2);
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const gradeRaw = gradeInput.value;
    const grade = parseFloat(gradeRaw);

    if (!name) {
        showError('Student name must not be empty.');
        return;
    }
    if (Number.isNaN(grade) || gradeRaw === '') {
        showError('Grade must be a number between 0 and 100.');
        return;
    }
    if (grade < 0 || grade > 100) {
        showError('Grade must be between 0 and 100.');
        return;
    }

    addStudent(name, grade);
    form.reset();
    nameInput.focus();
});

seedStudents();
renderStudents();
updateAverage();
