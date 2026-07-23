require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Course = require('./models/Course');
const Semester = require('./models/Semester');
const Subject = require('./models/Subject');
const User = require('./models/User');
const UserReputation = require('./models/UserReputation');
const College = require('./models/College');
const CommunityNote = require('./models/CommunityNote');

const SALT_ROUNDS = 10;
const SAMPLE_PDF = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

// ── Data Definitions ──────────────────────────────────────────────────────────

const COURSES_DATA = {
    'B.Tech CSE': {
        category: 'B.Tech',
        semesters: 8,
        subjects: {
            1: ['Mathematics I', 'Physics', 'English for Communication', 'C Programming', 'Basic Electrical Engineering', 'Engineering Mechanics'],
            2: ['Mathematics II', 'Chemistry', 'Environmental Studies', 'Data Structures using C', 'Digital Electronics', 'Communication Skills'],
            3: ['Mathematics III', 'Data Structures & Algorithms', 'DBMS', 'Operating Systems', 'OOP with Java', 'Computer Networks', 'Discrete Mathematics'],
            4: ['Design & Analysis of Algorithms', 'Software Engineering', 'Computer Architecture', 'Microprocessors', 'Python Programming', 'Graph Theory'],
            5: ['Machine Learning', 'Web Technologies', 'Compiler Design', 'Computer Graphics', 'Artificial Intelligence', 'Cyber Security'],
            6: ['Cloud Computing', 'Big Data Analytics', 'Mobile Computing', 'Distributed Systems', 'Natural Language Processing', 'Internet of Things'],
            7: ['Deep Learning', 'Blockchain Technology', 'DevOps', 'Quantum Computing', 'Data Science', 'Computer Vision'],
            8: ['Major Project', 'Internship', 'Entrepreneurship', 'Technical Writing', 'Research Methodology', 'Professional Ethics'],
        },
    },
    BCA: {
        category: 'BCA',
        semesters: 6,
        subjects: {
            1: ['Mathematics I', 'C Programming', 'Computer Fundamentals', 'English', 'Principles of Management', 'Digital Logic'],
            2: ['Mathematics II', 'Data Structures', 'Object Oriented Programming', 'Financial Accounting', 'Web Development', 'Database Management Systems'],
            3: ['Operating Systems', 'Computer Networks', 'Java Programming', 'Software Engineering', 'Numerical Methods', 'Python Programming'],
            4: ['Data Mining', 'Computer Graphics', 'Cyber Security', 'Cloud Computing', 'PHP & MySQL', 'Machine Learning'],
            5: ['Artificial Intelligence', 'Big Data Analytics', 'Mobile App Development', 'Blockchain Basics', 'IoT Fundamentals', 'Research Methodology'],
            6: ['Project Work', 'Internship', 'Professional Ethics', 'Digital Marketing', 'E-Commerce', 'Entrepreneurship'],
        },
    },
    MCA: {
        category: 'MCA',
        semesters: 4,
        subjects: {
            1: ['Advanced C Programming', 'Data Structures & Algorithms', 'Computer Organization', 'Discrete Mathematics', 'Database Design', 'Software Engineering', 'Web Technologies'],
            2: ['Object Oriented Analysis & Design', 'Java & J2EE', 'Operating Systems', 'Computer Networks', 'Data Warehousing & Mining', 'Network Security'],
            3: ['Machine Learning', 'Cloud Computing', 'Big Data Analytics', 'Mobile Computing', 'Distributed Systems', 'Artificial Intelligence'],
            4: ['Major Project', 'Seminar', 'Research Methodology', 'Cyber Law & Ethics', 'DevOps', 'Blockchain Technology'],
        },
    },
    'Diploma CSE': {
        category: 'Diploma',
        semesters: 6,
        subjects: {
            1: ['Mathematics I', 'Applied Physics', 'Applied Chemistry', 'Basic Electronics', 'C Programming', 'Communication Skills'],
            2: ['Mathematics II', 'Data Structures', 'Digital Electronics', 'Computer Hardware', 'Web Programming', 'Database Concepts'],
            3: ['Operating Systems', 'Object Oriented Programming', 'Computer Networks', 'Software Engineering', 'Microprocessors', 'Python Programming'],
            4: ['Java Programming', 'Web Development', 'Data Communication', 'Multimedia Systems', 'Cyber Security', 'Cloud Fundamentals'],
            5: ['Mobile Application Development', 'IoT Basics', 'Data Analytics', 'Network Administration', 'Project Management', 'PHP Programming'],
            6: ['Major Project', 'Industrial Training', 'Professional Practices', 'Entrepreneurship', 'Computer Ethics', 'Technical Documentation'],
        },
    },
};

const COLLEGES_DATA = [
    { name: 'Indian Institute of Technology Delhi', city: 'New Delhi', state: 'Delhi' },
    { name: 'National Institute of Technology Trichy', city: 'Tiruchirappalli', state: 'Tamil Nadu' },
    { name: 'Delhi Technological University', city: 'New Delhi', state: 'Delhi' },
    { name: 'Vellore Institute of Technology', city: 'Vellore', state: 'Tamil Nadu' },
    { name: 'Amity University', city: 'Noida', state: 'Uttar Pradesh' },
    { name: 'SRM Institute of Technology', city: 'Chennai', state: 'Tamil Nadu' },
    { name: 'Manipal Institute of Technology', city: 'Manipal', state: 'Karnataka' },
    { name: 'Shivaji University', city: 'Kolhapur', state: 'Maharashtra' },
    { name: 'University of Mumbai', city: 'Mumbai', state: 'Maharashtra' },
    { name: 'Jadavpur University', city: 'Kolkata', state: 'West Bengal' },
    { name: 'Anna University', city: 'Chennai', state: 'Tamil Nadu' },
    { name: 'Punjab Technical University', city: 'Jalandhar', state: 'Punjab' },
    { name: 'Gujarat Technological University', city: 'Ahmedabad', state: 'Gujarat' },
    { name: 'Visvesvaraya Technological University', city: 'Belgaum', state: 'Karnataka' },
    { name: 'Biju Patnaik University of Technology', city: 'Rourkela', state: 'Odisha' },
];

const USERS_DATA = [
    { name: 'Arjun Sharma', email: 'arjun.sharma@example.com', course: 'B.Tech CSE', college: 'Indian Institute of Technology Delhi' },
    { name: 'Priya Patel', email: 'priya.patel@example.com', course: 'BCA', college: 'Vellore Institute of Technology' },
    { name: 'Rahul Verma', email: 'rahul.verma@example.com', course: 'MCA', college: 'Amity University' },
    { name: 'Sneha Reddy', email: 'sneha.reddy@example.com', course: 'B.Tech CSE', college: 'National Institute of Technology Trichy' },
    { name: 'Vikram Singh', email: 'vikram.singh@example.com', course: 'Diploma CSE', college: 'Delhi Technological University' },
    { name: 'Ananya Gupta', email: 'ananya.gupta@example.com', course: 'BCA', college: 'SRM Institute of Technology' },
    { name: 'Rohit Kumar', email: 'rohit.kumar@example.com', course: 'B.Tech CSE', college: 'Manipal Institute of Technology' },
    { name: 'Divya Nair', email: 'divya.nair@example.com', course: 'MCA', college: 'University of Mumbai' },
    { name: 'Akash Joshi', email: 'akash.joshi@example.com', course: 'Diploma CSE', college: 'Shivaji University' },
    { name: 'Kavita Mehta', email: 'kavita.mehta@example.com', course: 'B.Tech CSE', college: 'Jadavpur University' },
    { name: 'Siddharth Bose', email: 'siddharth.bose@example.com', course: 'BCA', college: 'Anna University' },
    { name: 'Pooja Deshmukh', email: 'pooja.deshmukh@example.com', course: 'MCA', college: 'Punjab Technical University' },
    { name: 'Manish Tiwari', email: 'manish.tiwari@example.com', course: 'Diploma CSE', college: 'Gujarat Technological University' },
    { name: 'Isha Kapoor', email: 'isha.kapoor@example.com', course: 'B.Tech CSE', college: 'Visvesvaraya Technological University' },
    { name: 'Karan Malhotra', email: 'karan.malhotra@example.com', course: 'BCA', college: 'Biju Patnaik University of Technology' },
];

const TOPICS = [
    'Complete Notes', 'Lecture Notes', 'Chapter Summary', 'Important Questions',
    'Solved Examples', 'Practice Problems', 'Revision Notes', 'Quick Guide',
    'Reference Material', 'Study Guide', 'Handwritten Notes', 'Formula Sheet',
    'Lab Manual', 'Assignment Solutions', 'Previous Year Paper',
];

const NOTE_TYPES = ['pdf', 'drive', 'text'];
const ALL_COLLEGES = COLLEGES_DATA.map(c => c.name);

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min, max, decimals = 1) {
    const val = Math.random() * (max - min) + min;
    return parseFloat(val.toFixed(decimals));
}

function generateTags(subject) {
    const tagPool = ['notes', 'study', 'exam', subject.toLowerCase().replace(/\s+/g, '-'), 'semester', 'university', 'btech', 'bca', 'mca', 'diploma', 'important', 'revision', 'questions', 'solutions', 'summary'];
    const count = randInt(2, 5);
    const shuffled = [...tagPool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

async function seed() {
    console.log('\n========================================');
    console.log('  GetNotes Database Seed');
    console.log('========================================\n');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`Connected: ${mongoose.connection.host}/${mongoose.connection.name}\n`);

    const counts = { courses: 0, subjects: 0, users: 0, notes: 0 };

    // ── 1. Courses & Semesters & Subjects ─────────────────────────────────

    const courseNames = Object.keys(COURSES_DATA);
    const courseDocMap = {};
    const semesterDocMap = {};
    const subjectDocMap = {};
    const allSubjectsByCourse = {};

    for (const courseName of courseNames) {
        const def = COURSES_DATA[courseName];
        let course = await Course.findOne({ name: courseName }).lean();
        if (!course) {
            course = await Course.create({ name: courseName, category: def.category, isActive: true });
            counts.courses++;
            console.log(`  + Course: ${courseName}`);
        } else {
            console.log(`  = Course: ${courseName} (exists)`);
        }
        courseDocMap[courseName] = course;
        allSubjectsByCourse[courseName] = [];

        for (let semNum = 1; semNum <= def.semesters; semNum++) {
            let sem = await Semester.findOne({ courseId: course._id, number: semNum }).lean();
            if (!sem) {
                sem = await Semester.create({ number: semNum, courseId: course._id, isActive: true });
                console.log(`    + Semester ${semNum}`);
            }
            semesterDocMap[`${course._id}-${semNum}`] = sem;

            const subNames = def.subjects[semNum] || [];
            for (const subName of subNames) {
                let sub = await Subject.findOne({ semesterId: sem._id, name: subName }).lean();
                if (!sub) {
                    sub = await Subject.create({ name: subName, semesterId: sem._id, isActive: true });
                    counts.subjects++;
                }
                subjectDocMap[`${sem._id}-${subName}`] = sub;
                allSubjectsByCourse[courseName].push({ sub, semNum, sem });
            }
        }
    }

    console.log(`\n  Courses : ${counts.courses} inserted`);
    console.log(`  Subjects: ${counts.subjects} inserted`);

    // ── 2. Colleges ───────────────────────────────────────────────────────

    for (const c of COLLEGES_DATA) {
        const exists = await College.findOne({ name: c.name }).lean();
        if (!exists) {
            await College.create({
                name: c.name,
                city: c.city,
                state: c.state,
                noteCount: randInt(5, 50),
                contributorCount: randInt(1, 10),
                isActive: true,
            });
        }
    }
    console.log('  Colleges: 15 defined');

    // ── 3. Users ──────────────────────────────────────────────────────────

    const createdUsers = [];
    for (const u of USERS_DATA) {
        let user = await User.findOne({ email: u.email }).lean();
        if (!user) {
            const passwordHash = await bcrypt.hash('password123', SALT_ROUNDS);
            user = await User.create({
                email: u.email,
                passwordHash,
                name: u.name,
                course: u.course,
                provider: 'email',
                isPremium: Math.random() < 0.2,
            });
            counts.users++;
            console.log(`  + User: ${u.name} (${u.email})`);
        } else {
            console.log(`  = User: ${u.name} (exists)`);
        }
        createdUsers.push(user);
    }

    // ── 4. User Reputation / Top Contributors ─────────────────────────────

    for (const user of createdUsers) {
        const exists = await UserReputation.findOne({ userId: user._id.toString() }).lean();
        if (!exists) {
            const uploads = randInt(1, 20);
            const downloads = randInt(5, 100);
            const views = randInt(50, 5000);
            const likes = randInt(5, 200);
            const points = uploads * 50 + downloads * 2 + likes * 5 + randInt(0, 500);
            await UserReputation.create({
                userId: user._id.toString(),
                points,
                totalUploads: uploads,
                totalDownloads: downloads,
                totalViews: views,
                totalLikes: likes,
                averageRating: randFloat(3.0, 5.0),
            });
        }
    }
    console.log(`  Reputation: ${createdUsers.length} users processed`);

    // ── 5. Notes ──────────────────────────────────────────────────────────

    const courseKeys = Object.keys(allSubjectsByCourse);
    let noteTarget = 100;
    let notesInserted = 0;

    for (let i = 0; i < noteTarget * 2 && notesInserted < noteTarget; i++) {
        const courseName = pick(courseKeys);
        const entry = pick(allSubjectsByCourse[courseName]);
        if (!entry) continue;
        const { sub, semNum, sem } = entry;
        const topic = pick(TOPICS);
        const title = `${sub.name} - ${topic}`;

        const existing = await CommunityNote.findOne({ title, subject: sub.name, course: courseName }).lean();
        if (existing) continue;

        const uploader = pick(createdUsers);
        const college = pick(ALL_COLLEGES);
        const isFeatured = notesInserted < 8 && Math.random() < 0.5;
        const isVerified = Math.random() < 0.25;
        const isPremium = Math.random() < 0.1;
        const downloads = randInt(0, 500);
        const views = randInt(10, 5000);
        const likes = randInt(0, 100);
        const avgRating = randFloat(2.5, 5.0);
        const ratingCount = randInt(0, 50);
        const unit = `Unit ${randInt(1, 6)}`;

        await CommunityNote.create({
            title,
            description: `${topic} for ${sub.name}. Covers key concepts with examples. Perfect for exam preparation.`,
            pdfUrl: SAMPLE_PDF,
            noteType: pick(NOTE_TYPES),
            course: courseName,
            courseId: sem.courseId,
            semester: semNum,
            semesterId: sem._id,
            subject: sub.name,
            subjectId: sub._id,
            unit,
            tags: generateTags(sub.name),
            uploadedBy: {
                id: uploader._id.toString(),
                name: uploader.name,
                course: uploader.course || courseName,
                college,
                avatar: '',
            },
            uploaderId: uploader._id.toString(),
            uploaderName: uploader.name,
            uploaderCollege: college,
            uploaderAvatar: '',
            downloads,
            views,
            saves: randInt(0, 30),
            likes,
            averageRating: avgRating,
            ratingCount,
            reportCount: 0,
            isVerified,
            isFeatured,
            isPublished: true,
            isPremium,
            status: 'approved',
        });

        notesInserted++;
        if (notesInserted % 20 === 0) {
            console.log(`  ... ${notesInserted} notes created`);
        }

        await Subject.findByIdAndUpdate(sub._id, { $inc: { noteCount: 1 } });
    }

    counts.notes = notesInserted;
    console.log(`  Notes   : ${notesInserted} inserted`);

    // Update college note counts based on actual notes
    const collegeCounts = await CommunityNote.aggregate([
        { $group: { _id: '$uploaderCollege', count: { $sum: 1 } } },
    ]);
    for (const { _id, count } of collegeCounts) {
        if (_id) {
            await College.findOneAndUpdate({ name: _id }, { noteCount: count }, { upsert: true });
        }
    }

    // ── Summary ───────────────────────────────────────────────────────────

    console.log('\n========================================');
    console.log('  Seed Complete');
    console.log('========================================');
    console.log(`  Courses inserted     : ${counts.courses}`);
    console.log(`  Subjects inserted    : ${counts.subjects}`);
    console.log(`  Users inserted       : ${counts.users}`);
    console.log(`  Notes inserted       : ${counts.notes}`);
    console.log('========================================\n');

    await mongoose.disconnect();
    process.exit(0);
}

seed().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
});
