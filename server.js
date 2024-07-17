const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// MongoDB connection string
const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://englishschoolala:<password>@cluster0.5hdisr4.mongodb.net/myDatabase?retryWrites=true&w=majority';

mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log('Failed to connect to MongoDB', err));

// User schema and model
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    tasks: [{
        day: String,
        task: String,
        startTime: String,
        endTime: String,
    }]
});

const User = mongoose.model('User', userSchema);

// Register endpoint
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        res.status(201).send('User registered');
    } catch (error) {
        res.status(500).send({ message: 'Registration failed', error });
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).send('Invalid username or password');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).send('Invalid username or password');
        }

        const token = jwt.sign({ id: user._id }, 'your_jwt_secret');
        res.send({ token });
    } catch (error) {
        res.status(500).send({ message: 'Login failed', error });
    }
});

// Middleware for authentication
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, 'your_jwt_secret', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Save tasks endpoint
app.post('/save-tasks', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.tasks = req.body.tasks;
        await user.save();
        res.send('Tasks saved');
    } catch (error) {
        res.status(500).send({ message: 'Failed to save tasks', error });
    }
});

// Get tasks endpoint
app.get('/tasks', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.send(user.tasks);
    } catch (error) {
        res.status(500).send({ message: 'Failed to retrieve tasks', error });
    }
});

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the main HTML file at the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve the tasks HTML file at /tasks URL
app.get('/tasks', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'tasks.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});