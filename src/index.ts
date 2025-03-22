import { Elysia } from "elysia";

import { swagger } from "@elysiajs/swagger";

import jwtPlugin from "./plugins/jwt";
import authRoutes from "./routes/auth.routes";
import profileRoutes from "./routes/profile.routes";
import passwordResetRoutes from "./routes/passwordReset.routes";

const app = new Elysia();

app.use(
  swagger({
    path: "/docs", // URL: http://localhost:3000/docs
    documentation: {
      info: {
        title: "Auth API",
        version: "1.0.0",
        description:
          "User Authentication & Profile API with Elysia.js, Bun, and Prisma",
      },
      tags: [
        { name: "Auth", description: "User authentication routes" },
        { name: "Profile", description: "User profile management" },
        { name: "Password Reset", description: "Password reset flows" },
      ],
    },
  })
);

app.use(jwtPlugin);
app.use(authRoutes);
app.use(profileRoutes);
app.use(passwordResetRoutes);

app.listen(3000);
console.log("🚀 Server running at http://localhost:3000");
