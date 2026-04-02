const { ZodError } = require('zod');

const errorHandler = (err, req, res, next) => {
  console.error('[ErrorHandler]', err);

  // Zod v4 validation error — check both instanceof and .issues array
  const isZodError = err instanceof ZodError || (Array.isArray(err.issues) && err.issues.length > 0);
  if (isZodError) {
    const issues = err.issues || err.errors || [];
    const fields = {};
    issues.forEach(e => {
      // path can include 'body.', 'query.', 'params.' prefix — strip the wrapper
      const segments = (e.path || []).slice(1); // drop 'body'/'query'/'params' prefix
      const key = segments.length > 0 ? segments.join('.') : e.path.join('.');
      if (!fields[key]) {
        fields[key] = e.message;
      }
    });

    return res.status(422).json({
      error: 'Validation Error',
      fields,
    });
  }

  // SQLite Constraint Error
  if (err.code === 'SQLITE_CONSTRAINT') {
    return res.status(400).json({
      error: 'Database constraint violation'
    });
  }

  if (err.status) {
    return res.status(err.status).json({
      error: err.message
    });
  }

  // Log non-validation/non-constraint errors for debugging
  const logMsg = `[${new Date().toISOString()}] SERVER ERROR: ${err.stack || err}\n`;
  console.error(logMsg);
  try { require('fs').appendFileSync('server.log', logMsg); } catch (_) {}

  return res.status(500).json({
    error: 'Internal Server Error'
  });
};

module.exports = errorHandler;
