// /api/contact.js

const EMAILJS_URL = 'https://api.emailjs.com/api/v1.0/email/send'

export default async (req, res) => {
    // Set CORS headers for all requests
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    // Handle pre-flight OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end()
    }

    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed')
    }

    try {
        // This is a more robust way to parse the JSON request body
        const data = await new Promise((resolve, reject) => {
            let body = ''
            req.on('data', chunk => (body += chunk.toString()))
            req.on('end', () => {
                try {
                    resolve(JSON.parse(body))
                } catch (error) {
                    reject(error)
                }
            })
            req.on('error', reject)
        })

        const { name, email, message } = data

        // Verify that the data was correctly parsed
        if (!name || !email || !message) {
            return res.status(400).send('Missing form data')
        }

        const serviceId = process.env.EMAILJS_SERVICE_ID
        const templateId = process.env.EMAILJS_TEMPLATE_ID
        const publicKey = process.env.EMAILJS_PUBLIC_KEY

        // Final sanity check for environment variables
        if (!serviceId || !templateId || !publicKey) {
            console.error('EmailJS environment variables are not set!')
            return res.status(500).send('Configuration Error')
        }

        const emailParams = {
            service_id: serviceId,
            template_id: templateId,
            user_id: publicKey,
            template_params: {
                from_name: name,
                from_email: email,
                message: message,
            },
        }

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
        console.error('API Contact Error:', error)
        return res.status(500).send('Internal Server Error.')
    }
}