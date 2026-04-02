const validate = (schema) => (req, res, next) => {
  try {
    console.log('[Validator] Schema Body:', JSON.stringify(schema.shape.body._def, (key, value) => typeof value === 'function' ? '[Function]' : value, 2));
    const data = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    
    // Replace req object properties with validated (and potentially coerced/transformed) ones
    req.body = data.body;
    req.query = data.query;
    req.params = data.params;
    
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = validate;
