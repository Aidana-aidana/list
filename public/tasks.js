document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = '/';
        return;
    }

    fetch('/api/tasks', {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    })
        .then(response => {
            if (response.status === 401) {
                window.location.href = '/';
            }
            return response.json();
        })
        .then(tasks => {
            if (tasks) {
                tasks.forEach(task => addTaskToDOM(task));
            }
        });

    function addTaskToDOM(task) {
        const dayContainer = document.getElementById(task.day.toLowerCase());
        if (dayContainer) {
            task.tasks.forEach(taskText => {
                const taskList = dayContainer.querySelector('.task-list');
                const newTask = document.createElement('li');
                newTask.textContent = taskText;
                taskList.appendChild(newTask);
            });
        }
    }

    const logoutButton = document.querySelector('#logout');
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = '/';
    });
});