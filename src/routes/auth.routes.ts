import { Elysia } from "elysia";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { t } from "elysia";

const prisma = new PrismaClient();
const authRoutes = new Elysia({ prefix: "/auth" });

authRoutes.post(
  "/signup",
  async ({ body }) => {
    const { email, password, name } = body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
    });

    return { message: "User created", userId: user.id };
  },
  {
    body: t.Object({
      email: t.String(),
      password: t.String(),
      name: t.String(),
    }),
  }
);

authRoutes.post(
  "/login",
  async (ctx) => {
    const { body, jwt } = ctx as any;
    const { email, password } = body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { error: "Invalid credentials" };

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return { error: "Invalid credentials" };

    const token = await jwt.sign({ userId: user.id });
    return { token };
  },
  {
    body: t.Object({
      email: t.String(),
      password: t.String(),
    }),
  }
);

export default authRoutes;
