// middleware/role.middleware.js
export const hasRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "No autorizado" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "No tenés permisos para esta acción" });
    }

    next();
  };
};
