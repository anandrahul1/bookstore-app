// This file contains intentionally bad code to test Amazon Q review

const express = require('express');
const app = express();

// BAD: Hardcoded password (Security issue)
const dbPassword = "mypassword123";

// BAD: SQL injection vulnerability (Security issue)
app.get('/user/:id', async (req, res) => {
  const userId = req.params.id;
  const query = "SELECT * FROM users WHERE id = " + userId;
  
  // BAD: Missing error handling (Error handling issue)
  const result = await db.execute(query);
  
  // BAD: Loose equality (Code quality issue)
  if (result == null) {
    // BAD: Console.log in production (Best practice issue)
    console.log("No user found");
    return res.status(404).send("User not found");
  }
  
  res.json(result);
});

// BAD: Using var instead of const/let (Code quality issue)
var port = 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
