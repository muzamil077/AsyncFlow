
const BASE_URL = 'http://localhost:3002/api';

async function test() {
    try {
        // 0. Test Ping
        console.log('Testing ping...');
        const pingRes = await fetch(`${BASE_URL}/projects/ping`);
        if (pingRes.ok) {
            const text = await pingRes.text();
            console.log('Ping response:', text);
        } else {
            console.error('Ping failed:', pingRes.status);
        }

        // 0.5. Test Direct Ping
        console.log('Testing direct ping...');
        const directPingRes = await fetch(`${BASE_URL}/projects/ping-direct`);
        if (directPingRes.ok) {
            const text = await directPingRes.text();
            console.log('Direct Ping response:', text);
        } else {
            console.error('Direct Ping failed:', directPingRes.status);
        }

        // 1. Register a new user
        const email = `test${Date.now()}@example.com`;
        const password = 'password123';
        console.log('Registering user:', email);

        const registerRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name: 'Test User' }),
        });

        if (!registerRes.ok) {
            const text = await registerRes.text();
            console.error('Registration failed:', registerRes.status, text);
            return;
        }

        const authData = await registerRes.json();
        const token = authData.token;
        console.log('Registration successful, token received.');

        // 2. Create a project
        console.log('Creating project...');
        const projectRes = await fetch(`${BASE_URL}/projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                name: 'Test Project',
                description: 'Created via test script',
            }),
        });

        if (!projectRes.ok) {
            const text = await projectRes.text();
            console.error('Create project failed:', projectRes.status, text);
            return;
        }

        const project = await projectRes.json();
        console.log('Project created successfully:', project);



    } catch (error) {
        console.error('Test script error:', error);
    }
}

test();
