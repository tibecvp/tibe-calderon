// /api/contact.js

const EMAILJS_URL = 'https://api.emailjs.com/api/v1.0/email/send'

export default async (req, res) => {
    if (req.method === 'POST') {
        try {
            // Manually read the body from the request stream
            const bodyChunks = []
            req.on('data', (chunk) => {
                bodyChunks.push(chunk)
            })

            req.on('end', async () => {
                const body = JSON.parse(Buffer.concat(bodyChunks).toString())

                // These variables are securely pulled from Vercel's environment variables.
                const serviceId = process.env.EMAILJS_SERVICE_ID
                const templateId = process.env.EMAILJS_TEMPLATE_ID
                const publicKey = process.env.EMAILJS_PUBLIC_KEY

                // The data sent from your form's front-end.
                const { user_name, user_email, user_project } = body

                const emailParams = {
                    service_id: serviceId,
                    template_id: templateId,
                    user_id: publicKey,
                    template_params: {
                        from_name: user_name,
                        from_email: user_email,
                        message: user_project,
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
            })
        } catch (error) {
            console.error('API Contact Error:', error)
            console.log('API Contact Error:', error)
            return res.status(500).send('Internal Server Error.')
        }
    } else {
        // Handle any requests that aren't POST.
        res.status(405).send('Method Not Allowed')
    }
}