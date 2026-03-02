import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use true for port 465, false for port 587
  auth: {
    user: process.env.APP_USER,
    pass: process.env.APP_PASS,
  },
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  trustedOrigins: [process.env.APP_URL!],

  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "USER",
        required: false,
      },
      phone: {
        type: "string",
        required: false,
      },
      status: {
        type: "string",
        defaultValue: "ACTIVE",
        required: false,
      },
    },
  },

  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
  },

  emailVerification: {
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      console.log(user);
      try {
        const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`;
        const info = await transporter.sendMail({
          from: '"Ismail Nayef" <addirasah@gmail.com>',
          to: user.email,
          subject: "Email Testing",
          html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0; padding:0; background-color:#f4f7f9; font-family:Arial, Helvetica, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f7f9; padding:20px 0;">
    <tr>
      <td align="center">

        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background-color:#206380; padding:22px; text-align:center;">
              <h1 style="margin:0; color:#ffffff; font-size:24px;">
                Verify Your Email
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:30px; color:#333333;">
              <h2 style="margin-top:0; color:#206380; font-size:20px;">
                Welcome ${user.name}
              </h2>

              <p style="font-size:15px; line-height:1.6;">
                Thank you for creating an account. Please confirm your email address by clicking the button below.
              </p>

              <!-- Verify Button -->
              <div style="text-align:center; margin:32px 0;">
                <a href="${verificationUrl}"
                   style="
                     background-color:#206380;
                     color:#ffffff;
                     text-decoration:none;
                     padding:14px 28px;
                     border-radius:6px;
                     font-size:15px;
                     display:inline-block;
                     font-weight:bold;
                   ">
                  Verify Email
                </a>
              </div>

              <p style="font-size:14px; color:#555555;">
                Or copy and paste this link into your browser:
              </p>

              <p style="font-size:13px; word-break:break-all; color:#206380;">
                ${verificationUrl}
              </p>

              <p style="font-size:14px; color:#666666; margin-top:24px;">
                This verification link will expire in <strong>24 hours</strong>.
                If you didn’t create an account, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f0f4f6; padding:16px; text-align:center; font-size:13px; color:#666666;">
              © 2026 Ad-Dirasah Online Academy<br/>
              <span style="color:#206380;">addirasah@gmail.com</span>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`, // HTML version of the message
        });

        console.log("Message sent:", info.messageId);
      } catch (error) {
        console.log(error);
      }
    },
  },

  socialProviders: {
    google: {
      prompt: "select_account consent",
      accessType: "offline",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});
