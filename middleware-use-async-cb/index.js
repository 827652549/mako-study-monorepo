const express = require('express');
const app = express();

app.use(async (req, res, next) => {
    setTimeout(() => {
        next();
    }, 2000);
});
app.get('/', (req, res) => {
    res.send('Hello World');
});

app.listen(2846, () => {
    console.log('Server is listening on port 2846');
    // log url open
    console.log('http://localhost:2846');
});