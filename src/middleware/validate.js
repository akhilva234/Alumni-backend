import { z } from 'zod';

export const validate = (schema) => {
    return (req, res, next) => {
        try {
            // Validate body, query, and params against the schema
            const validatedData = schema.parse({
                body: req.body,
                query: req.query,
                params: req.params,
            });

            // Replace request data with validated (and potentially stripped/coerced) data
            // Replace request data with validated (and potentially stripped/coerced) data
            if (validatedData.body) req.body = validatedData.body;
            if (validatedData.query) {
                // req.query is sometimes a getter, safely assign properties instead of overriding the object
                for (const key in validatedData.query) {
                    req.query[key] = validatedData.query[key];
                }
            }
            if (validatedData.params) {
                for (const key in validatedData.params) {
                    req.params[key] = validatedData.params[key];
                }
            }

            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                // Return 400 Bad Request with detailed validation errors
                return res.status(400).json({
                    error: "Validation failed",
                    details: error.errors?.map(err => ({
                        path: err.path?.join('.') || 'unknown',
                        message: err.message
                    })) || [{ message: error.message }]
                });
            }
            next(error);
        }
    };
};
