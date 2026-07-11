const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.EMAIL_FROM || "OUTLIER <noreply@outlier.trading>";

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  const subject = "Redefinir a sua password — OUTLIER";
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #0f0d1a; color: #e5e2ff; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <span style="font-size: 22px; font-weight: 900; letter-spacing: 0.12em; color: #7c5cfc;">OUTLIER</span>
      </div>
      <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 8px; color: #fff;">Redefinir password</h2>
      <p style="font-size: 14px; color: #a09dc5; line-height: 1.6; margin-bottom: 24px;">
        Recebemos um pedido para redefinir a password da sua conta. Clique no botão abaixo para criar uma nova password. O link é válido durante <strong style="color:#e5e2ff;">1 hora</strong>.
      </p>
      <a href="${resetUrl}" style="display: block; text-align: center; background: linear-gradient(135deg, #5c3fd6 0%, #7c5cfc 100%); color: #fff; font-weight: 700; font-size: 15px; text-decoration: none; padding: 14px 24px; border-radius: 10px; margin-bottom: 24px;">
        Redefinir Password
      </a>
      <p style="font-size: 12px; color: #6b6590; line-height: 1.6;">
        Se não solicitou a redefinição da password, pode ignorar este email — a sua password permanece a mesma.<br/><br/>
        O link irá expirar em 1 hora por motivos de segurança.
      </p>
      <hr style="border: none; border-top: 1px solid #2a2545; margin: 24px 0;" />
      <p style="font-size: 11px; color: #4a4570; text-align: center;">
        OUTLIER — Plataforma de Gestão SMC/ICT
      </p>
    </div>
  `;

  if (RESEND_API_KEY) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Resend API error ${res.status}: ${body}`);
    }
  } else {
    console.log("\n=== [DEV] Password Reset Email ===");
    console.log(`To: ${to}`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log("===================================\n");
  }
}
