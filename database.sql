-- Create database
CREATE DATABASE IF NOT EXISTS adaptive_elearning;
USE adaptive_elearning;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'instructor', 'admin') DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    difficulty ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
    thumbnail VARCHAR(255),
    duration INT COMMENT 'Duration in minutes',
    status ENUM('active', 'inactive', 'draft') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User courses (enrollment)
CREATE TABLE IF NOT EXISTS user_courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    progress INT DEFAULT 0 COMMENT 'Percentage completed',
    completed BOOLEAN DEFAULT FALSE,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY (user_id, course_id)
);

-- Course modules
CREATE TABLE IF NOT EXISTS course_modules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    sequence INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Module content
CREATE TABLE IF NOT EXISTS module_content (
    id INT AUTO_INCREMENT PRIMARY KEY,
    module_id INT NOT NULL,
    content_type ENUM('video', 'text', 'quiz', 'assignment') NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    duration INT COMMENT 'Duration in minutes',
    sequence INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES course_modules(id) ON DELETE CASCADE
);

-- User progress
CREATE TABLE IF NOT EXISTS user_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    content_id INT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    score INT NULL COMMENT 'For quizzes/assignments',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (content_id) REFERENCES module_content(id) ON DELETE CASCADE,
    UNIQUE KEY (user_id, content_id)
);

-- Contact messages
CREATE TABLE IF NOT EXISTS contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE
);

-- Insert sample data
INSERT INTO users (name, email, password, role) VALUES 
('Admin User', 'admin@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqSV3q7W1f6FZg.ZK7XlXyQ8CjF1O', 'admin'),
('Instructor One', 'instructor@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqSV3q7W1f6FZg.ZK7XlXyQ8CjF1O', 'instructor'),
('Student One', 'student@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqSV3q7W1f6FZg.ZK7XlXyQ8CjF1O', 'student');

INSERT INTO courses (title, description, category, difficulty, status) VALUES
('Data Science Fundamentals', 'Learn the basics of data science, including data analysis and visualization.', 'Data Science', 'beginner', 'active'),
('Web Development Mastery', 'Master full-stack web development with modern technologies.', 'Web Development', 'intermediate', 'active'),
('Artificial Intelligence Basics', 'Introduction to AI and machine learning concepts.', 'Artificial Intelligence', 'beginner', 'active');

INSERT INTO user_courses (user_id, course_id, progress, completed) VALUES
(3, 1, 25, FALSE),
(3, 2, 75, FALSE);

-- Password for all sample users is "password123"