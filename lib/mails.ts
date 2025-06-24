import {Resend} from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail(token: string, email: string) {
    const link = `${process.env.SITE_BASE_URL}/verify-email?token=${token}`

    return resend.emails.send({
           from: "mail@mail.massdev.studio",
        to: email,
        subject: "Verify your email",
        html: `<p>Click <a href="${link}">here</a> to verify your email address.</p>`,
    })
}

export async function sendResetPasswordEmail(token: string, email: string) {
    const link = `${process.env.SITE_BASE_URL}/reset-password?token=${token}`

    return resend.emails.send({
       from: "mail@mail.massdev.studio",
        to: email,
        subject: "Reset your password",
        html: `<p>Click <a href="${link}">here</a> to reset your password.</p>`,
    })
}

export async function sendReset2FAEmail(token: string, email: string) {
    const link = `${process.env.SITE_BASE_URL}/reset-2fa?token=${token}`

    return resend.emails.send({
          from: "mail@mail.massdev.studio",
        to: email,
        subject: "Reset 2FA : Two Factor Authentication",
        html: `<p>Click <a href="${link}">here</a> to deactivate your 2FA.</p>`,
    })
}

