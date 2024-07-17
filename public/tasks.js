document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/index.html';
        return;
    }

    const response = await fetch('/api/tasks', {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
        const tasks = await response.json();
        tasks.forEach(addTaskToDOM);
    } else {
        alert('Failed to load tasks');
        window.location.href = '/index.html';
    }

    document.getElementById('taskForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const taskText = document.getElementById('task').value;

        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify([{ text: taskText, done: false }])
        });

        if (response.ok) {
            addTaskToDOM({ text: taskText, done: false });
            document.getElementById('task').value = '';
        } else {
            alert('Failed to save task');
        }
    });

    document.getElementById('logoutButton').addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = '/index.html';
    });
});

function addTaskToDOM(task) {
    const li = document.createElement('li');
    li.textContent = task.text;
    document.getElementById('taskList').appendChild(li);
}