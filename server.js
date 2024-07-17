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
const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://englishschoolala:Aidanito@1@cluster0.5hdisr4.mongodb.net/myDatabase?retryWrites=true&w=majority';

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
});

const User = mongoose.model('User', userSchema);

const taskSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    tasks: Array,
});

const Task = mongoose.model('Task', taskSchema);

// Middleware for verifying JWT token
function verifyToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(403).send('Unauthorized');
    }
    jwt.verify(token, 'your_jwt_secret', (err, decoded) => {
        if (err) {
            return res.status(403).send('Unauthorized');
        }
        req.userId = decoded.id;
        next();
    });
}

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

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the main HTML file at the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve the tasks HTML file at /tasks URL
app.get('/tasks', verifyToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'tasks.html'));
});

// Save tasks endpoint
app.post('/api/tasks', verifyToken, async (req, res) => {
    const { tasks } = req.body;
    await Task.findOneAndUpdate(
        { userId: req.userId },
        { userId: req.userId, tasks },
        { upsert: true }
    );
    res.status(200).send('Tasks saved');
});

// Get tasks endpoint
app.get('/api/tasks', verifyToken, async (req, res) => {
    const userTasks = await Task.findOne({ userId: req.userId });
    res.send(userTasks ? userTasks.tasks : []);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});