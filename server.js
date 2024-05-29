const app = require('./app');

const port = 8888;
app.listen(port, () => {
  console.log(`App running on ${port}...`);
});
