const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Подключение к MongoDB
mongoose.connect('mongodb://localhost:27017/todo-app', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Failed to connect to MongoDB', err);
});

const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    tasks: [
        {
            text: String,
            start: String,
            end: String,
            completed: Boolean,
        },
    ],
});

const User = mongoose.model('User', UserSchema);

app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).send('User created');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ userId: user._id }, 'your_jwt_secret');
        res.json({ token });
    } else {
        res.status(401).send('Invalid credentials');
    }
});

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
    jwt.verify(token, 'your_jwt_secret', (err, user) => {
        if (err) {
            res.status(401).send('Unauthorized');
        } else {
            req.user = user;
            next();
        }
    });
};

app.get('/tasks', authMiddleware, async (req, res) => {
    const user = await User.findById(req.user.userId);
    res.json(user.tasks);
});

app.post('/tasks', authMiddleware, async (req, res) => {
    const { text, start, end, completed } = req.body;
    const user = await User.findById(req.user.userId);
    user.tasks.push({ text, start, end, completed });
    await user.save();
    res.status(201).send('Task added');
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});