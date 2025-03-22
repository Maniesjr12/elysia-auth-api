import { Elysia, t } from "elysia";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const profileRoutes = new Elysia({ prefix: "/profile" });

profileRoutes.get(
  "/",
  async ({
    jwt,
    headers,
  }: {
    jwt: any;
    headers: Record<string, string | undefined>;
  }) => {
    const token = headers.authorization?.split(" ")[1];
    const payload = await jwt.verify(token);
    if (!payload) return { error: "Invalid token" };

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });
    return { email: user?.email, name: user?.name };
  }
);

profileRoutes.put(
  "/",
  async ({
    jwt,
    headers,
    body,
  }: {
    jwt: any;
    headers: Record<string, string | undefined>;
    body: { name: string };
  }) => {
    const token = headers.authorization?.split(" ")[1];
    const payload = await jwt.verify(token);
    if (!payload) return { error: "Invalid token" };

    const { name } = body;
    const user = await prisma.user.update({
      where: { id: payload.userId },
      data: { name },
    });

    return { message: "Profile updated", name: user.name };
  },
  {
    body: t.Object({
      name: t.String({ minLength: 1 }),
    }),
  }
);

export default profileRoutes;
