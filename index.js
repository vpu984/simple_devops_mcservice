const express = require('express');
const client = require('prom-client');

const app = express();
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.005, 0.01, 0.05, 0.1, 0.5, 1, 2]
});

app.get('/', (req, res) => {
  const end = httpRequestDurationMicroseconds.startTimer({ method: req.method, route: '/', code: 200 });
  // simulate work
  setTimeout(() => {
    end({ code: 200 });
    res.send('Hello from simple service!');
  }, Math.random() * 200);
});

app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  } catch (ex) {
    res.status(500).end(ex);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`service listening on ${PORT}`));