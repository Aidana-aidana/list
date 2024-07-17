async function register() {
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

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
        const error = await response.json();
        alert(`Registration failed: ${error.message}`);
    }
}

async function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    const response = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
        const { token } = await response.json();
        localStorage.setItem('token', token);
        window.location.href = '/tasks';
    } else {
        const error = await response.json();
        alert(`Login failed: ${error.message}`);
    }
}