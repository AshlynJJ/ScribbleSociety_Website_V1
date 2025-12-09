const express = require('express');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const saltRounds = 10; 


const users = new Map(); 

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'SignUp.html'));
});


app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'Login.html'));
});


app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).send('Please fill out all fields.');
    }
 if (users.has(username) || Array.from(users.values()).some(u => u.email === email)) {
    return res.status(409).send('Username or email already taken.');
  }

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    users.set(username, { email, passwordHash: hashedPassword });
    res.send(`<h1>Account created successfully!</h1><p>Welcome, ${username}!</p>`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error during account creation.');
  }
});


app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Please provide a username and password.');
    }

    const user = users.get(username);
  if (!user) {
    return res.status(401).send('<h1>Login Failed</h1><p>Invalid username or password.</p><a href="/login">Try again</a>');
  }

  try {
    const match = await bcrypt.compare(password, user.passwordHash);
    if (match) {
      res.send(`<h1>Login Successful!</h1><p>Welcome back, ${username}!</p>`);
    } else {
      res.status(401).send('<h1>Login Failed</h1><p>Invalid username or password.</p><a href="/login">Try again</a>');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error during login.');
  }
   
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});