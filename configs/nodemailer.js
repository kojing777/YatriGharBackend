import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
    host: process.env.BREVO_SMTP_SERVER,
    port: process.env.BREVO_SMTP_PORT,
    secure: false, // Use TLS
    auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_PASS
    },
    tls: {
        ciphers: 'SSLv3'
    }
});

export default transporter;
