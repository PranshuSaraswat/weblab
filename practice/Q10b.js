
// install node_modules (folder) + node_mongo_2024 (folder)
// make sure mongodb is running in your system
// gedit server.js (add given content)
// gedit form.html (add the respective given code below) 
// node server.js
// visit localhost:3000 (on any browser)
// Visit http://localhost:3000/cse-professors to see all.

sudo systemctl start mongod (to start mongodb)

--------------------------------------------------------

// server.js

const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();
const uri = 'mongodb://127.0.0.1:27017';
const dbName = 'facultydb';
const collectionName = 'faculty';

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'form.html'));
});

app.post('/submit', async (req, res) => {
  const { ID, Title, Name, branch } = req.body;

  if (!ID || !Title || !Name || !branch) {
    return res.send('Please fill all fields.');
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    await collection.insertOne({ ID, Title, Name, branch });

    res.send('Faculty data inserted successfully. <a href="/">Add another</a> | <a href="/cse-professors">View CSE Professors</a>');
  } catch (err) {
  } finally {
    await client.close();
  }
});

app.get('/cse-professors', async (req, res) => {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const professors = await collection.find({ branch: 'CSE', Title: 'PROFESSOR' }).toArray();

    if (professors.length === 0) {
      return res.send('No CSE Professors found. <a href="/">Go back</a>');
    }

    let html = `<h2>CSE Professors</h2><ul>`;
    professors.forEach(faculty => {
      html += `<li>ID: ${faculty.ID}, Name: ${faculty.Name}, Title: ${faculty.Title}, Branch: ${faculty.branch}</li>`;
    });
    html += `</ul><a href="/">Go back</a>`;

    res.send(html);
  } catch (err) {
  } finally {
    await client.close();
  }
});

app.listen(3000);

-------------------------------------------------------------

// form.html

<html>
<body>
  <h1>Enter Faculty Details</h1>
  <form action="/submit" method="POST">
    <label>ID:</label><br>
    <input type="text" required><br>

    <label>Title:</label><br>
    <input type="text" required><br>

    <label>Name:</label><br>
    <input type="text" required><br>

    <label>Branch:</label><br>
    <input type="text" required><br>

    <button type="submit">Submit</button>
  </form>
</body>
</html>