// Data store with file-backed user persistence
// Users are saved to users.json so they survive server restarts
const fs = require('fs');
const path = require('path');

const USERS_FILE = path.join(__dirname, 'users.json');

// Load users from disk on startup
function loadUsers() {
    try {
        if (fs.existsSync(USERS_FILE)) {
            return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
        }
    } catch (e) {
        console.error('Failed to load users.json:', e.message);
    }
    return [];
}

// Save users to disk
function saveUsers() {
    try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    } catch (e) {
        console.error('Failed to save users.json:', e.message);
    }
}

const CATEGORIES = ['All', 'B.Tech', 'BCA', 'MCA', 'Diploma', 'Arts', 'Science'];

const COURSES = [
    { id: 'btech-cse', title: 'B.Tech CSE', category: 'B.Tech', rating: 4.5, students: '4.2k', instructor: 'Tech Faculty', icon: 'laptop-outline', featured: false },
    { id: 'btech-me', title: 'B.Tech ME', category: 'B.Tech', rating: 4.2, students: '2.1k', instructor: 'Mechanical Dept', icon: 'construct-outline', featured: false },
    { id: 'btech-ee', title: 'B.Tech EE', category: 'B.Tech', rating: 4.3, students: '1.8k', instructor: 'Electrical Dept', icon: 'flash-outline', featured: false },
    { id: 'bca', title: 'BCA', category: 'BCA', rating: 4.4, students: '3.5k', instructor: 'BCA Faculty', icon: 'school-outline', featured: false },
    { id: 'mca', title: 'MCA', category: 'MCA', rating: 4.7, students: '1.2k', instructor: 'Post-Grad Faculty', icon: 'document-text-outline', featured: false },
    { id: 'diploma', title: 'Polytechnic Diploma', category: 'Diploma', rating: 4.0, students: '5.2k', instructor: 'Diploma Board', icon: 'settings-outline', featured: false },
];

const FEATURED_COURSES = [
    { id: 'btech-cse', title: 'Advanced Data Structures & Algorithms', category: 'B.Tech CSE', rating: 4.8, students: '1.2k', instructor: 'Dr. Sarah Wilson', icon: 'laptop-outline', featured: true },
    { id: 'bca-web', title: 'Full Stack Web Development 2026', category: 'BCA', rating: 4.6, students: '850', instructor: 'John Doe', icon: 'code-slash-outline', featured: true },
];

const NOTES = {
    'btech-cse': [
        { id: 'n1', title: 'Data Structures - Arrays & Linked Lists', subject: 'Data Structures', unit: 'Unit 1', pdfUrl: 'http://www.africau.edu/images/default/sample.pdf' },
        { id: 'n2', title: 'Algorithm Analysis & Complexity', subject: 'Algorithms', unit: 'Unit 1', pdfUrl: 'http://www.africau.edu/images/default/sample.pdf' },
        { id: 'n3', title: 'Object Oriented Programming Concepts', subject: 'OOP', unit: 'Unit 2', pdfUrl: 'http://www.africau.edu/images/default/sample.pdf' },
        { id: 'n4', title: 'Database Management Systems - ER Model', subject: 'DBMS', unit: 'Unit 1', pdfUrl: 'http://www.africau.edu/images/default/sample.pdf' },
        { id: 'n5', title: 'Operating Systems - Process Management', subject: 'OS', unit: 'Unit 2', pdfUrl: 'http://www.africau.edu/images/default/sample.pdf' },
    ],
    'btech-me': [
        { id: 'n6', title: 'Thermodynamics - First Law', subject: 'Thermodynamics', unit: 'Unit 1', pdfUrl: 'http://www.africau.edu/images/default/sample.pdf' },
        { id: 'n7', title: 'Fluid Mechanics - Flow Properties', subject: 'Fluid Mechanics', unit: 'Unit 1', pdfUrl: 'http://www.africau.edu/images/default/sample.pdf' },
        { id: 'n8', title: 'Machine Design - Stress Analysis', subject: 'Machine Design', unit: 'Unit 2', pdfUrl: 'http://www.africau.edu/images/default/sample.pdf' },
    ],
    'btech-ee': [
        { id: 'n9', title: 'Circuit Theory - Network Theorems', subject: 'Circuit Theory', unit: 'Unit 1', pdfUrl: 'http://www.africau.edu/images/default/sample.pdf' },
        { id: 'n10', title: 'Electromagnetic Fields', subject: 'EMF', unit: 'Unit 1', pdfUrl: 'http://www.africau.edu/images/default/sample.pdf' },
        { id: 'n11', title: 'Power Systems - Generation', subject: 'Power Systems', unit: 'Unit 2', pdfUrl: 'http://www.africau.edu/images/default/sample.pdf' },
    ],
    'bca': [
        { id: 'n12', title: 'C Programming - Basics', subject: 'C Programming', unit: 'Unit 1', pdfUrl: 'http://www.africau.edu/images/default/sample.pdf' },
        { id: 'n13', title: 'Web Development - HTML & CSS', subject: 'Web Dev', unit: 'Unit 1', pdfUrl: 'http://www.africau.edu/images/default/sample.pdf' },
        { id: 'n14', title: 'Database Concepts', subject: 'Database', unit: 'Unit 2', pdfUrl: 'http://www.africau.edu/images/default/sample.pdf' },
    ],
    'mca': [
        { id: 'n15', title: 'Advanced Java - Servlets & JSP', subject: 'Advanced Java', unit: 'Unit 1', pdfUrl: 'http://www.africau.edu/images/default/sample.pdf' },
        { id: 'n16', title: 'Software Engineering - SDLC', subject: 'Software Engg', unit: 'Unit 1', pdfUrl: 'http://www.africau.edu/images/default/sample.pdf' },
        { id: 'n17', title: 'Data Mining Techniques', subject: 'Data Mining', unit: 'Unit 2', pdfUrl: 'http://www.africau.edu/images/default/sample.pdf' },
    ],
    'diploma': [
        { id: 'n18', title: 'Basic Electronics', subject: 'Electronics', unit: 'Unit 1', pdfUrl: 'http://www.africau.edu/images/default/sample.pdf' },
        { id: 'n19', title: 'Engineering Drawing', subject: 'Drawing', unit: 'Unit 1', pdfUrl: 'http://www.africau.edu/images/default/sample.pdf' },
        { id: 'n20', title: 'Workshop Practice', subject: 'Workshop', unit: 'Unit 2', pdfUrl: 'http://www.africau.edu/images/default/sample.pdf' },
    ],
    'bca-web': [
        { id: 'n21', title: 'React Native - Components & Props', subject: 'React Native', unit: 'Unit 1', pdfUrl: 'http://www.africau.edu/images/default/sample.pdf' },
        { id: 'n22', title: 'Node.js & Express REST APIs', subject: 'Backend Dev', unit: 'Unit 2', pdfUrl: 'http://www.africau.edu/images/default/sample.pdf' },
    ],
};

// Persistent users — loaded from disk, saved on every change
const users = loadUsers();

// Proxy push so every new user is auto-saved to disk
const originalPush = Array.prototype.push;
users.push = function (...args) {
    const result = originalPush.apply(this, args);
    saveUsers();
    return result;
};

const savedNotes = {};       // { userId: Set<noteId> }
const downloadedNotes = {};  // { userId: Set<noteId> }

// Helper: get a note object by its id (search across all course notes)
function findNoteById(noteId) {
    for (const notes of Object.values(NOTES)) {
        const found = notes.find((n) => n.id === noteId);
        if (found) return found;
    }
    return null;
}

module.exports = {
    CATEGORIES,
    COURSES,
    FEATURED_COURSES,
    NOTES,
    users,
    savedNotes,
    downloadedNotes,
    findNoteById,
};
