// para validar body de requests
export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        message: "Errores de validación",
        errors: error.details.map((err) => err.message),
      });
    }
    next();
  };
};
