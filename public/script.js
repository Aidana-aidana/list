document.addEventListener('DOMContentLoaded', function () {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');

    registerForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;

        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.text();
            if (response.ok) {
                alert('Registration successful');
            } else {
                alert(`Registration failed: ${data}`);
            }
        } catch (error) {
            alert('An error occurred during registration');
        }
    });

    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            if (response.ok) {
                alert('Login successful');
                window.location.href = '/tasks'; // Перенаправление на страницу списка задач
            } else {
                alert(`Login failed: ${data.message}`);
            }
        } catch (error) {
            alert('An error occurred during login');
        }
    });
});