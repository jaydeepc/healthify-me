const { httpRequestDurationSeconds, httpRequestsTotal } = require('../prometheus-metrics/httpMetrics');

const responseTimeMetrics = (req, res, next) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const duration = process.hrtime(start);
    const durationInSeconds = duration[0] + duration[1] / 1e9;

    // Use the full URL path to capture all requests
    const path = req.baseUrl + req.path;

    const labels = {
      method: req.method,
      route: path,
      status_code: res.statusCode.toString(),
    };

    // Record request duration
    httpRequestDurationSeconds.observe(labels, durationInSeconds);

    // Increment request counter
    httpRequestsTotal.inc(labels);
  });

  next();
};

module.exports = responseTimeMetrics;
