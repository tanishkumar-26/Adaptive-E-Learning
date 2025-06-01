require('dotenv').config();
const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Tanish@SQL00',
    database: process.env.DB_NAME || 'adaptive_elearning'
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to database.');
});

// Session store
const sessionStore = new MySQLStore({
    expiration: 86400000,
    createDatabaseTable: true,
    schema: {
        tableName: 'sessions',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        }
    }
}, db);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
    key: 'session_cookie_name',
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 86400000,
        httpOnly: true
    }
}));
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));

// Set view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

// Global variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.user = req.session.user || null;
    next();
});

app.use(express.static(path.join(__dirname, 'views'))); 

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/index.html'));
});

// app.get('/about', (req, res) => {
//     res.render('about.html');
// });

app.get('/about.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/about.html'));
});


app.get('/courses', (req, res) => {
    const query = 'SELECT * FROM courses WHERE status = "active"';
    db.query(query, (err, courses) => {
        if (err) {
            console.error(err);
            req.flash('error_msg', 'Error fetching courses');
            return res.render('courses.html', { courses: [] });
        }
        res.render('courses.html', { courses });
    });
});

app.get('/course/:id', (req, res) => {
    const courseId = req.params.id;
    const query = 'SELECT * FROM courses WHERE id = ? AND status = "active"';
    
    db.query(query, [courseId], (err, results) => {
        if (err || results.length === 0) {
            req.flash('error_msg', 'Course not found');
            return res.redirect('/courses');
        }
        
        const course = results[0];
        res.render('course-detail.html', { course });
    });
});

app.get('/contact', (req, res) => {
    res.render('contact.html');
});

app.post('/contact', (req, res) => {
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
        req.flash('error_msg', 'Please fill in all fields');
        return res.redirect('/contact');
    }
    
    const query = 'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)';
    db.query(query, [name, email, message], (err, result) => {
        if (err) {
            console.error(err);
            req.flash('error_msg', 'Error sending message');
            return res.redirect('/contact');
        }
        
        req.flash('success_msg', 'Thank you for your message! We will get back to you soon.');
        res.redirect('/contact');
    });
});

app.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    res.render('login.html');
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        req.flash('error_msg', 'Please provide email and password');
        return res.redirect('/login');
    }
    
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], (err, results) => {
        if (err || results.length === 0) {
            req.flash('error_msg', 'Invalid credentials');
            return res.redirect('/login');
        }
        
        const user = results[0];
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err || !isMatch) {
                req.flash('error_msg', 'Invalid credentials');
                return res.redirect('/login');
            }
            
            req.session.user = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            };
            
            req.flash('success_msg', 'You are now logged in');
            res.redirect('/dashboard');
        });
    });
});

app.get('/signup', (req, res) => {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    res.render('signup.html');
});

app.post('/signup', (req, res) => {
    const { name, email, password, confirm_password } = req.body;
    
    // Validation
    if (!name || !email || !password || !confirm_password) {
        req.flash('error_msg', 'Please fill in all fields');
        return res.redirect('/signup');
    }
    
    if (password !== confirm_password) {
        req.flash('error_msg', 'Passwords do not match');
        return res.redirect('/signup');
    }
    
    if (password.length < 6) {
        req.flash('error_msg', 'Password must be at least 6 characters');
        return res.redirect('/signup');
    }
    
    // Check if user exists
    const checkQuery = 'SELECT id FROM users WHERE email = ?';
    db.query(checkQuery, [email], (err, results) => {
        if (err) {
            console.error(err);
            req.flash('error_msg', 'Database error');
            return res.redirect('/signup');
        }
        
        if (results.length > 0) {
            req.flash('error_msg', 'Email already registered');
            return res.redirect('/signup');
        }
        
        // Hash password
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password, salt, (err, hash) => {
                if (err) {
                    console.error(err);
                    req.flash('error_msg', 'Error processing password');
                    return res.redirect('/signup');
                }
                
                // Create user
                const insertQuery = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, "student")';
                db.query(insertQuery, [name, email, hash], (err, result) => {
                    if (err) {
                        console.error(err);
                        req.flash('error_msg', 'Error creating account');
                        return res.redirect('/signup');
                    }
                    
                    req.flash('success_msg', 'You are now registered and can log in');
                    res.redirect('/login');
                });
            });
        });
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error(err);
        }
        res.redirect('/login');
    });
});

// Dashboard route (protected)
app.get('/dashboard', ensureAuthenticated, (req, res) => {
    const userId = req.session.user.id;
    
    // Get user courses
    const query = `
        SELECT c.* FROM courses c
        JOIN user_courses uc ON c.id = uc.course_id
        WHERE uc.user_id = ? AND c.status = "active"
    `;
    
    db.query(query, [userId], (err, courses) => {
        if (err) {
            console.error(err);
            req.flash('error_msg', 'Error fetching your courses');
            courses = [];
        }
        
        res.render('dashboard.html', {
            user: req.session.user,
            courses
        });
    });
});

// Middleware to ensure user is authenticated
function ensureAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    
    req.flash('error_msg', 'Please log in to view that page');
    res.redirect('/login');
}

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// // Start server
// app.listen(port, () => {
//     console.log(`Server running on port ${port}`);
// });