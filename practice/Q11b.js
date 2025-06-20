
// install node_modules (folder) + node_mongo_2024 (folder)
// make sure mongodb is running in your system
// gedit server.js (add given content)
// gedit form.html (add the respective given code below) 
// cd ..
// node server.js
// visit localhost:3000 (on any browser)

sudo systemctl start mongod (to start mongodb)

------------------------------------------------------

// server.js

const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();
const uri = 'mongodb://127.0.0.1:27017';
const dbName = 'attendanceDB';
const collectionName = 'students';

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'form.html'));
});

app.post('/submit', async (req, res) => {
  const { name, usn, dept, attendance } = req.body;
  const attendanceNum = parseFloat(attendance);

  if (!name || !usn || !dept || isNaN(attendanceNum)) {
    return res.send('Invalid input. Please fill all fields correctly.');
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    await collection.insertOne({
      name,
      usn,
      dept,
      attendance: attendanceNum,
    });

    res.send('Student attendance recorded successfully! <a href="/">Add another</a> | <a href="/low-attendance">View low attendance</a>');
  } catch (err) {
  } finally {
    await client.close();
  }
});

app.get('/low-attendance', async (req, res) => {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const lowAttendanceStudents = await collection.find({ attendance: { $lt: 75 } }).toArray();

    if (lowAttendanceStudents.length === 0) {
      return res.send('No students with attendance below 75%. <a href="/">Go back</a>');
    }

    let html = '<h2>Students with Attendance below 75%</h2><ul>';
    for(let student of lowAttendanceStudents){
        html+=`<li>Name: ${student.name} usn : ${student.usn}</li>`;
    }
    html += '</ul><a href="/">Go back</a>';

    res.send(html);
  } catch (err) {
  } finally {
    await client.close();
  }
});

app.listen(3000);


----------------------------------------------------

// form.html

<html lang="en">
<body>
  <h1>Student Attendance Entry</h1>
  <form action="/submit" method="POST">
    <label>Name:</label><br>
    <input type="text" name="name" required /><br><br>

    <label>USN:</label><br>
    <input type="text" name="usn" required /><br><br>

    <label>Department:</label><br>
    <input type="text" name="dept" required /><br><br>

    <label>Attendance (%):</label><br>
    <input type="number" name="attendance" min="0" max="100" step="0.01" required /><br><br>

    <button type="submit">Submit</button>
  </form>
  <a href="/low-attendance">View Students Below 75% Attendance</a>
</body>
</html>