document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.querySelector('#register-form');
    const loginForm = document.querySelector('#login-form');

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.querySelector('#register-username').value;
        const password = document.querySelector('#register-password').value;

        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            alert('Registration successful');
        } else {
            alert('Registration failed');
        }
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.querySelector('#login-username').value;
        const password = document.querySelector('#login-password').value;

        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            window.location.href = '/tasks';
        } else {
            alert('Login failed');
        }
    });
});