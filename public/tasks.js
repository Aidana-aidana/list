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

function handleLogout() {
    localStorage.removeItem('token');
    window.location.href = '/';
}

// Existing code for generating week and handling tasks...