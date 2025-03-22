import { Elysia, t } from "elysia";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const otpStore: Record<string, string> = {};
const passwordResetRoutes = new Elysia({ prefix: "/password-reset" });

passwordResetRoutes.post(
  "/request",
  async ({ body }) => {
    const { email } = body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { error: "User not found" };

    const dummyOtp = "123456";
    otpStore[email] = dummyOtp;
    return { message: "OTP sent", otp: dummyOtp };
  },
  {
    body: t.Object({
      email: t.String({ format: "email" }),
    }),
  }
);

passwordResetRoutes.post(
  "/verify",
  async ({ body }) => {
    const { email, otp, newPassword } = body;
    if (otpStore[email] !== otp) return { error: "Invalid OTP" };

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    delete otpStore[email];
    return { message: "Password reset successful" };
  },
  {
    body: t.Object({
      email: t.String({ format: "email" }),
      otp: t.String({ minLength: 6, maxLength: 6 }),
      newPassword: t.String({ minLength: 6 }),
    }),
  }
);

export default passwordResetRoutes;
