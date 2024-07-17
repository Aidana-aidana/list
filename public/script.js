document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        fetchTasks(token);
    } else {
        window.location.href = '/';
    }
});

function fetchTasks(token) {
    fetch('/api/tasks', {
        headers: {
            'Authorization': token
        }
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to fetch tasks');
            }
        })
        .then(tasks => {
            generateWeek(tasks);
        })
        .catch(error => {
            console.error(error);
            alert('Failed to fetch tasks');
        });
}

function saveTasks(token, tasks) {
    fetch('/api/tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        },
        body: JSON.stringify(tasks)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to save tasks');
            }
        })
        .catch(error => {
            console.error(error);
            alert('Failed to save tasks');
        });
}

function handleLogin(event) {
    event.preventDefault();

    const username = document.querySelector('#login-username').value;
    const password = document.querySelector('#login-password').value;

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Login failed');
            }
        })
        .then(data => {
            localStorage.setItem('token', data.token);
            window.location.href = '/tasks';
        })
        .catch(error => {
            console.error(error);
            alert('Login failed');
        });
}

document.querySelector('#login-form').addEventListener('submit', handleLogin);