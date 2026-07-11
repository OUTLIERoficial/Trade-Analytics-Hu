import { Router, type IRouter, type Request, type Response } from "express";
import { db, usersTable, passwordResetTokensTable } from "@workspace/db";
import { eq, and, gt, isNull } from "drizzle-orm";
import crypto from "crypto";
import {
  clearSession,
  createSession,
  getSessionId,
  hashPassword,
  verifyPassword,
  updateSession,
  SESSION_COOKIE,
  SESSION_TTL,
  type SessionData,
} from "../lib/auth";
import { sendPasswordResetEmail } from "../lib/email";

const router: IRouter = Router();

function setSessionCookie(res: Response, sid: string) {
  res.cookie(SESSION_COOKIE, sid, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL,
  });
}

router.get("/auth/user", (req: Request, res: Response) => {
  res.json({ user: req.isAuthenticated() ? req.user : null });
});

router.post("/auth/register", async (req: Request, res: Response) => {
  const { email, password, name } = req.body ?? {};

  if (!email || !password || !name) {
    res.status(400).json({ error: "Nome, email e password são obrigatórios." });
    return;
  }
  if (typeof email !== "string" || !email.includes("@")) {
    res.status(400).json({ error: "Email inválido." });
    return;
  }
  if (typeof password !== "string" || password.length < 6) {
    res.status(400).json({ error: "A password deve ter pelo menos 6 caracteres." });
    return;
  }

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase()));
  if (existing) {
    res.status(409).json({ error: "Já existe uma conta com este email." });
    return;
  }

  const passwordHash = await hashPassword(password);
  const nameParts = (name as string).trim().split(" ");
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ") || null;

  await db
    .insert(usersTable)
    .values({ email: email.toLowerCase(), passwordHash, firstName, lastName });

  res.json({ success: true });
});

router.post("/auth/login", async (req: Request, res: Response) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    res.status(400).json({ error: "Email e password são obrigatórios." });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, (email as string).toLowerCase()));

  if (!user || !user.passwordHash) {
    res.status(401).json({ error: "Email ou password incorretos." });
    return;
  }

  const valid = await verifyPassword(password as string, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Email ou password incorretos." });
    return;
  }

  const sessionData: SessionData = {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
    },
  };

  const sid = await createSession(sessionData);
  setSessionCookie(res, sid);
  const isMobile = req.query["mobile"] === "1";
  res.json({ user: sessionData.user, ...(isMobile ? { sid } : {}) });
});

router.post("/auth/logout", async (req: Request, res: Response) => {
  const sid = getSessionId(req);
  await clearSession(res, sid);
  res.json({ ok: true });
});

router.get("/logout", async (req: Request, res: Response) => {
  const sid = getSessionId(req);
  await clearSession(res, sid);
  res.redirect("/");
});

// Update profile (name + email)
router.put("/auth/profile", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Não autenticado." });
    return;
  }
  const { firstName, lastName, email, profileImageUrl } = req.body ?? {};
  if (!firstName || typeof firstName !== "string" || !firstName.trim()) {
    res.status(400).json({ error: "O primeiro nome é obrigatório." });
    return;
  }
  if (email && (typeof email !== "string" || !email.includes("@"))) {
    res.status(400).json({ error: "Email inválido." });
    return;
  }
  const userId = req.user.id;
  if (email && email.toLowerCase() !== req.user.email?.toLowerCase()) {
    const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase()));
    if (existing && existing.id !== userId) {
      res.status(409).json({ error: "Este email já está em uso." });
      return;
    }
  }
  await db.update(usersTable).set({
    firstName: firstName.trim(),
    lastName: lastName ? (lastName as string).trim() || null : null,
    ...(email ? { email: email.toLowerCase() } : {}),
    ...(profileImageUrl !== undefined ? { profileImageUrl: profileImageUrl || null } : {}),
  }).where(eq(usersTable.id, userId));
  const updatedUser = {
    ...req.user,
    firstName: firstName.trim(),
    lastName: lastName ? (lastName as string).trim() || null : null,
    ...(email ? { email: email.toLowerCase() } : {}),
    ...(profileImageUrl !== undefined ? { profileImageUrl: profileImageUrl || null } : {}),
  };
  const sid = getSessionId(req);
  if (sid) await updateSession(sid, { user: updatedUser });
  res.json({ user: updatedUser });
});

// Forgot password — generate token and send email
router.post("/auth/forgot-password", async (req: Request, res: Response) => {
  const { email } = req.body ?? {};
  if (!email || typeof email !== "string") {
    res.status(400).json({ error: "Email é obrigatório." });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase()));

  // Always respond with success to avoid email enumeration
  if (!user) {
    res.json({ ok: true });
    return;
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await db.insert(passwordResetTokensTable).values({
    userId: user.id,
    token,
    expiresAt,
  });

  const appUrl = process.env.APP_URL || `https://${process.env.REPLIT_DEV_DOMAIN}`;
  const resetUrl = `${appUrl}/redefinir-password?token=${token}`;

  try {
    await sendPasswordResetEmail(user.email!, resetUrl);
  } catch (err) {
    console.error("Failed to send reset email:", err);
  }

  res.json({ ok: true });
});

// Reset password — validate token and update password
router.post("/auth/reset-password", async (req: Request, res: Response) => {
  const { token, newPassword } = req.body ?? {};

  if (!token || typeof token !== "string") {
    res.status(400).json({ error: "Token inválido." });
    return;
  }
  if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
    res.status(400).json({ error: "A nova password deve ter pelo menos 6 caracteres." });
    return;
  }

  const [record] = await db
    .select()
    .from(passwordResetTokensTable)
    .where(
      and(
        eq(passwordResetTokensTable.token, token),
        isNull(passwordResetTokensTable.usedAt),
        gt(passwordResetTokensTable.expiresAt, new Date()),
      ),
    );

  if (!record) {
    res.status(400).json({ error: "Este link de recuperação é inválido ou já expirou." });
    return;
  }

  const passwordHash = await hashPassword(newPassword);

  await db.transaction(async (tx) => {
    await tx.update(usersTable).set({ passwordHash }).where(eq(usersTable.id, record.userId));
    await tx.update(passwordResetTokensTable).set({ usedAt: new Date() }).where(eq(passwordResetTokensTable.id, record.id));
  });

  res.json({ ok: true });
});

// Change password
router.put("/auth/password", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Não autenticado." });
    return;
  }
  const { currentPassword, newPassword } = req.body ?? {};
  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: "Password actual e nova password são obrigatórias." });
    return;
  }
  if (typeof newPassword !== "string" || newPassword.length < 6) {
    res.status(400).json({ error: "A nova password deve ter pelo menos 6 caracteres." });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user.id));
  if (!user?.passwordHash) {
    res.status(400).json({ error: "Utilizador não encontrado." });
    return;
  }
  const valid = await verifyPassword(currentPassword as string, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "A password actual está incorrecta." });
    return;
  }
  const newHash = await hashPassword(newPassword as string);
  await db.update(usersTable).set({ passwordHash: newHash }).where(eq(usersTable.id, req.user.id));
  res.json({ success: true });
});

export default router;
