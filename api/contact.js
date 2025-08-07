// /api/contact.js

// This is a simple serverless function that Vercel will run.
// It receives a POST request from your form and sends an email.

// We need a way to send the email. You can use a library like 'emailjs-com'
// here, but it's easier to just use the EmailJS REST API directly
// with a simple fetch request from the server.

const EMAILJS_URL = 'https://api.emailjs.com/api/v1.0/email/send'

export default async (req, res) => {
    if (req.method === 'POST') {
        // These variables are securely pulled from Vercel's environment variables.
        const serviceId = process.env.EMAILJS_SERVICE_ID
        const templateId = process.env.EMAILJS_TEMPLATE_ID
        const publicKey = process.env.EMAILJS_PUBLIC_KEY

        // The data sent from your form's front-end.
        const { name, email, message } = req.body

        const emailParams = {
            service_id: serviceId,
            template_id: templateId,
            user_id: publicKey,
            template_params: {
                from_name: name,
                from_email: email,
                message: message,
            }
        }

        try {
            const response = await fetch(EMAILJS_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(emailParams),
            })

            if (response.ok) {
                return res.status(200).send('Email sent successfully!')
            } else {
                const errorData = await response.json()
                return res.status(response.status).send(`Error sending email: ${errorData.text || 'Unknown error'}`)
            }
        } catch (error) {
            return res.status(500).send('Internal Server Error.')
        }
    } else {
        // Handle any requests that aren't POST.
        res.status(405).send('Method Not Allowed')
    }
}