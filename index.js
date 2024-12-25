const express = require('express');
const app = express();
const port = 3000;

app.get('/time', (req, res) => {
    const currentTime = new Date().toISOString();
    res.json({ currentTime });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
