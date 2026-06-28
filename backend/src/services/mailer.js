const nodemailer = require('nodemailer')

let transporter = null
function getTransporter() {
  if (transporter) return transporter
  if (!process.env.SMTP_HOST) return null
  transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  })
  return transporter
}

// Si aucun SMTP n'est configuré (dev local), affiche le mail dans la console au lieu
// d'échouer — le lien (reset / vérification) reste ainsi récupérable pendant le dev.
async function sendMail({ to, subject, html, text }) {
  const t = getTransporter()
  if (!t) {
    console.log(`\n[mailer] SMTP non configuré — email non envoyé.\nÀ: ${to}\nSujet: ${subject}\n${text || html}\n`)
    return
  }
  await t.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to, subject, html, text,
  })
}

module.exports = { sendMail }
