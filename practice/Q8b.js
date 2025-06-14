
// install node_modules (folder) + node_mongo_2024 (folder)
// make sure mongodb is running in your system
// gedit server.js (add given content)
// mkdir views(folder)
// cd views
// gedit form.html (add the respective given code below) 
// cd ..
// node server.js
// visit localhost:3000 (on any browser)

sudo systemctl start mongod (to start mongodb)

--------------------------------------------------------
// server.js

const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');
const app = express();
const uri = 'mongodb://127.0.0.1:27017';

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'form.html'));
});

app.get('/submit', async (req, res) => {
  const { usn, name, company } = req.query;

  if (!usn || !name || !company) {
    return res.send('All fields are required!');
  }

  let client;
  try {
    client = await MongoClient.connect(uri, { useUnifiedTopology: true });
    const db = client.db('FinalYears');
    const collection = db.collection('students');

    await collection.insertOne({ usn, name, company });

    res.send(`<p>Student record added.</p><a href="/">Go Back</a>`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error storing data');
  } finally {
    if (client) await client.close();
  }
});

app.get('/infosys', async (req, res) => {
  let client;
  try {
    client = await MongoClient.connect(uri, { useUnifiedTopology: true });
    const db = client.db('FinalYears');
    const collection = db.collection('students');

    const infosysStudents = await collection.find({ company: /infosys/i }).toArray();

    let output = `<h2>Infosys Selected Students</h2><ul>`;
    infosysStudents.forEach(s => {
      output += `<li>${s.name} (${s.usn})</li>`;
    });
    output += '</ul><a href="/">Go Back</a>';

    res.send(output);
  } catch (err) {} 
  finally {
    if (client) await client.close();
  }
});

app.listen(3000);


------------------------------------------------------
// form.html

<html>
<body>
  <h2>Campus Selection Form</h2>
  <form action="/submit" method="get">
    USN: <input type="text" name="usn" required /><br /><br />
    Name: <input type="text" name="name" required /><br /><br />
    Company Name: <input type="text" name="company" required /><br /><br />
    <input type="submit" value="Submit" />
  </form>
  <a href="/infosys">View Infosys Selected Students</a>
</body>
</html>