

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

const USERS_FILE = path.join(__dirname, 'database', 'users.json');
const BLOGS_FILE = path.join(__dirname, 'database', 'blog.json');

app.use(bodyParser.json());

const readJSON = (filePath) => {
    if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify([]));
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

const writeJSON = (filePath, data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

app.post('/register', (req, res) => {
    const { username, password, fullName, age, email, gender } = req.body;

    if (!username || username.length < 3) return res.status(400).json({ error: "Username must be at least 3 characters." });
    if (!password || password.length < 5) return res.status(400).json({ error: "Password must be at least 5 characters." });
    if (fullName && fullName.length < 10) return res.status(400).json({ error: "Full name must be at least 10 characters." });
    if (!age || age < 10) return res.status(400).json({ error: "Age must be at least 10." });
    if (!email) return res.status(400).json({ error: "Email is required." });

    const users = readJSON(USERS_FILE);
    if (users.find(user => user.username === username || user.email === email)) {
        return res.status(400).json({ error: "Username or email already exists." });
    }

    const newUser = {
        id: users.length + 1,
        username,
        password,
        fullName,
        age,
        email,
        gender
    };

    users.push(newUser);
    writeJSON(USERS_FILE, users);
    res.status(201).json({ message: "User registered successfully.", user: newUser });
});

app.get('/profile/:identifier', (req, res) => {
    const identifier = req.params.identifier;
    const users = readJSON(USERS_FILE);
    const user = users.find(user => user.username === identifier || user.email === identifier);

    if (!user) return res.status(404).json({ error: "User not found." });
    res.json(user);
});

app.put('/profile/:identifier', (req, res) => {
    const identifier = req.params.identifier;
    const users = readJSON(USERS_FILE);
    const userIndex = users.findIndex(user => user.username === identifier || user.email === identifier);

    if (userIndex === -1) return res.status(404).json({ error: "User not found." });

    const updatedData = req.body;
    users[userIndex] = { ...users[userIndex], ...updatedData };
    writeJSON(USERS_FILE, users);

    res.json({ message: "User profile updated.", user: users[userIndex] });
});
app.delete('/profile/:identifier', (req, res) => {
    const identifier = req.params.identifier;
    const users = readJSON(USERS_FILE);
    const newUsers = users.filter(user => user.username !== identifier && user.email !== identifier);

    if (newUsers.length === users.length) return res.status(404).json({ error: "User not found." });

    writeJSON(USERS_FILE, newUsers);
    res.json({ message: "User profile deleted." });
});

app.post('/blog', (req, res) => {
    const { title, slug, content, tags } = req.body;

    if (!title || !slug || !content) return res.status(400).json({ error: "Title, slug, and content are required." });

    const blogs = readJSON(BLOGS_FILE);
    const newBlog = {
        id: blogs.length + 1,
        title,
        slug,
        content,
        tags: tags || [],
        comments: []
    };

    blogs.push(newBlog);
    writeJSON(BLOGS_FILE, blogs);

    res.status(201).json({ message: "Blog post created.", blog: newBlog });
});

app.get('/blog', (req, res) => {
    const blogs = readJSON(BLOGS_FILE);
    res.json(blogs);
});

app.put('/blog/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const blogs = readJSON(BLOGS_FILE);
    const blogIndex = blogs.findIndex(blog => blog.id === id);

    if (blogIndex === -1) return res.status(404).json({ error: "Blog post not found." });

    const updatedData = req.body;
    blogs[blogIndex] = { ...blogs[blogIndex], ...updatedData };
    writeJSON(BLOGS_FILE, blogs);

    res.json({ message: "Blog post updated.", blog: blogs[blogIndex] });
});

app.delete('/blog/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const blogs = readJSON(BLOGS_FILE);
    const newBlogs = blogs.filter(blog => blog.id !== id);

    if (newBlogs.length === blogs.length) return res.status(404).json({ error: "Blog post not found." });

    writeJSON(BLOGS_FILE, newBlogs);
    res.json({ message: "Blog post deleted." });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});