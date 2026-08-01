import Mailgen from "mailgen";
import nodemailer from "nodemailer";
import "dotenv/config";

// Sending email is always async process
export const sendEmail = async (options) => {
    const mailGenerator = new Mailgen({
        theme: "default",
        product: {
            name: "Project Manager Project",
            link: "https://project.com"
        }
    });

    const emailTextual = mailGenerator.generatePlaintext(options.mailContent); // plain text email
    const emailHTML = mailGenerator.generate(options.mailContent); // HTML text email

    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        port: process.env.MAILTRAP_SMTP_PORT,
        auth: {
            user: process.env.MAILTRAP_SMTP_USERNAME,
            pass: process.env.MAILTRAP_SMTP_PASSWORD
        }
    });

    ( async () => {
        try {
            const info = await transporter.sendMail({
                from: "project.manager@example.com",
                to: options.email,
                subject: options.subject,
    
                // browser ( client ) will automatically pick text or html whichever is supported
                text: emailTextual,
                html: emailHTML
            });

        } catch (error) {
            console.log("Error occured while sendind email:", error);
        }
    })();
};

export const emailVerificatinMailgenContent = (username, verificationURL) => {
    return {
        body: {
            name: username, 
            intro: "Welcome to Project Management Project. We're very excited to have you on board",
            action: {
                instructions: "To get your email verified click the button below.",
                button: {
                    color: "#0d6dda",
                    text: "Verify your email",
                    link: verificationURL
                }
            },
            outro: "Need help, or have questions? Just reply to this email, we'd love to help."
        }
    };
};

export const forgorPasswordMailgenContent = (username, passwordResetURL) => {
    return {
        body: {
            name: username, 
            intro: "We got a request password to reset your account's password",
            action: {
                instructions: "Click the button below to change your password",
                button: {
                    color: "#0d6dda",
                    text: "Change password",
                    link: passwordResetURL
                }
            },
            outro: "Need help, or have questions? Just reply to this email, we'd love to help."
        }
    };
};
