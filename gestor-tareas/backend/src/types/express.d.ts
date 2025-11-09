// src/types/express.d.ts
import "express";

declare global {
  namespace Express {
    interface UserPayload {
      id: number;
      role: "propietario" | "miembro";
      email?: string;
    }
    interface Request {
      user?: UserPayload;
    }
  }
}

export {};
