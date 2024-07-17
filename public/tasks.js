document.addEventListener('DOMContentLoaded', async () => {
    generateWeek();
    await loadTasks();
});

async function loadTasks() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/';
        return;
    }

    const response = await fetch('/api/tasks', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (response.ok) {
        const tasks = await response.json();
        tasks.forEach(task => {
            addTaskElement(task.day, task.text, task.startTime, task.endTime);
        });
    } else {
        console.error('Failed to load tasks', response.statusText);
    }
}

async function saveTasks() {
    const token = localStorage.getItem('token');
    const tasks = [];

    document.querySelectorAll('.task-list li').forEach(task => {
        tasks.push({
            day: task.closest('.day-container').id,
            text: task.querySelector('span').innerText,
            startTime: task.querySelector('.start-time').innerText,
            endTime: task.querySelector('.time').innerText
        });
    });

    const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(tasks)
    });

    if (!response.ok) {
        console.error('Failed to save tasks', response.statusText);
    }
}


async function saveTasks() {
    const token = localStorage.getItem('token');
    const tasks = [];

    document.querySelectorAll('.day-container').forEach(container => {
        const day = container.id;
        container.querySelectorAll('li').forEach(taskItem => {
            const text = taskItem.querySelector('span').textContent;
            const startTime = taskItem.querySelector('.start-time .start').textContent;
            const endTime = taskItem.querySelector('.time').textContent;

            tasks.push({ day, text, startTime, endTime });
        });
    });

    await fetch('/tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        },
        body: JSON.stringify({ tasks })
    });
}

function addTaskElement(day, text, startTime, endTime) {
    const dayContainer = document.getElementById(day);
    const taskList = dayContainer.querySelector('.task-list');
    const newTask = document.createElement('li');

    newTask.innerHTML = `
        <div class="task-item">
            <div class="start-time"><span class="start">${startTime}</span></div>
            <span>${text}</span>
            <div class="task-actions">
                <div class="timer-box" style="display: none;"><span class="time">${endTime}</span></div>
                <button class="icon-button complete" onclick="toggleComplete(this)">
                    <i class="fas fa-check"></i>
                </button>
                <button class="icon-button delete" onclick="deleteTask(this)">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        <div class="timer-inputs">
            <div class="slider" id="slider-${Date.now()}"></div>
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
        values: [480, 1020],
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

function minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours < 10 ? '0' + hours : hours}:${mins === 0 ? '00' : mins < 10 ? '0' + mins : mins}`;
}

function toggleComplete(button) {
    const taskItem = button.closest('li');
    taskItem.classList.toggle('completed');
    saveTasks();
}

function deleteTask(button) {
    const taskItem = button.closest('li');
    taskItem.remove();
    saveTasks();
}

function setTaskTime(button) {
    const taskItem = button.closest('li');
    const timerInputs = button.parentElement;
    const slider = $(timerInputs.querySelector('.slider')).slider("option", "values");
    const timeDisplay = taskItem.querySelector('.time');
    const timerBox = taskItem.querySelector('.timer-box');
    const startTimeDisplay = taskItem.querySelector('.start');

    const startMinutes = slider[0];
    const endMinutes = slider[1];

    const startTime = minutesToDateTime(startMinutes);
    const endTime = minutesToDateTime(endMinutes);

    if (endTime <= startTime) {
        alert('End time must be after start time');
        return;
    }

    startTimeDisplay.textContent = `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}`;
    startTimeDisplay.parentElement.style.display = 'block';

    function updateTimer() {
        const now = new Date();
        const timeLeft = endTime - now;

        if (timeLeft <= 0) {
            timeDisplay.textContent = '00:00';
            clearInterval(timerInterval);
            return;
        }

        const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const secondsLeft = Math.floor((timeLeft % (1000 * 60)) / 1000);

        timeDisplay.textContent = `${hoursLeft.toString().padStart(2, '0')}:${minutesLeft.toString().padStart(2, '0')}:${secondsLeft.toString().padStart(2, '0')}`;
    }

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);

    timerInputs.style.display = 'none';
    timerBox.style.display = 'block';

    saveTasks();
}

function minutesToDateTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, mins);
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = '/';
}

async function addTask(day) {
    const dayContainer = document.getElementById(day);
    const taskInput = dayContainer.querySelector('input[type="text"]');
    const taskText = taskInput.value.trim();

    if (taskText !== '') {
        addTaskElement(day, taskText, 'Not set', 'Not set');
        taskInput.value = '';
        await saveTasks();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    generateWeek();
});

function generateWeek() {
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
}

function handleKeyPress(event, day) {
    if (event.key === 'Enter') {
        addTask(day);
    }
}