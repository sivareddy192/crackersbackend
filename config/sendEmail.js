import { Resend } from 'resend';
import dotenv from 'dotenv'
dotenv.config()

if(!process.env.RESEND_API){
    console.log("Provide RESEND_API inside the .env file (currently disabled/commented out)")
}

const sendEmail = async({sendTo, subject, html })=>{
    try {
        const apiKey = process.env.RESEND_API;
        if (!apiKey) {
            console.error("CRITICAL: RESEND_API missing in production environment variables!");
            throw new Error("Email system not configured in cloud dashboard.");
        }

        const resend = new Resend(apiKey);
        const { data, error } = await resend.emails.send({
            from: 'Trace <tracesupport@tracly.store>',
            to: sendTo,
            subject: subject,
            html: html,
        });

        if (error) {
            console.error("[Resend API Error]:", error);
            throw new Error(`Resend Error: ${error.message || "Failed to send email"}`);
        }

        return data;
    } catch (error) {
        console.log(error)
    }
}

export default sendEmail


