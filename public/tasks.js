document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/';
    }

    const response = await fetch('/api/tasks', {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (response.ok) {
        const tasks = await response.json();
        generateWeek(tasks);
    } else {
        window.location.href = '/';
    }
});

function generateWeek(tasks) {
    const weekContainer = document.getElementById('week-container');
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    const startOfWeek = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    for (let i = 0; i < 7; i++) {
        const date = new Date(currentYear, currentMonth, startOfWeek + i);
        const dayName = daysOfWeek[date.getDay()];
        const dayDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        const dayContainer = document.createElement('div');
        dayContainer.className = 'day-container';
        dayContainer.id = dayName.toLowerCase();

        dayContainer.innerHTML = `
            <h2>${dayName} - ${dayDate}</h2>
            <input type="text" placeholder="Add a new task" onkeypress="handleKeyPress(event, '${dayName.toLowerCase()}')">
            <button onclick="addTask('${dayName.toLowerCase()}')">Add</button>
            <ul class="task-list"></ul>
        `;

        weekContainer.appendChild(dayContainer);
    }

    // Add existing tasks to the week
    tasks.forEach(task => {
        const dayContainer = document.getElementById(task.day.toLowerCase());
        if (dayContainer) {
            const taskList = dayContainer.querySelector('.task-list');
            const newTask = document.createElement('li');
            newTask.innerHTML = `
                <div class="task-item">
                    <div class="start-time"><span class="start">${task.start}</span></div>
                    <span>${task.text}</span>
                    <div class="task-actions">
                        <div class="timer-box" style="display: ${task.time ? 'block' : 'none'};"><span class="time">${task.time || 'Not set'}</span></div>
                        <button class="icon-button complete" onclick="toggleComplete(this)">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="icon-button delete" onclick="deleteTask(this)">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="timer-inputs">
                    <div class="slider" id="slider-${task.id}"></div>
                    <button onclick="setTaskTime(this)">Set Task Time</button>
                </div>
            `;
            taskList.appendChild(newTask);

            const slider = newTask.querySelector('.slider');
            $(slider).slider({
                range: true,
                min: 0,
                max: 1440,
                step: 30,
                values: task.time ? task.time.split('-').map(time => timeToMinutes(time)) : [480, 1020],
                slide: function (event, ui) {
                    $(slider).find('.ui-slider-handle').eq(0).attr('data-value', minutesToTime(ui.values[0]));
                    $(slider).find('.ui-slider-handle').eq(1).attr('data-value', minutesToTime(ui.values[1]));
                },
                create: function (event, ui) {
                    $(slider).find('.ui-slider-handle').eq(0).attr('data-value', minutesToTime(480));
                    $(slider).find('.ui-slider-handle').eq(1).attr('data-value', minutesToTime(1020));
                }
            });
        }
    });
}