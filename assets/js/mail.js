/*=============== EMAIL JS ===============*/
const contactForm = document.getElementById('contact-form'),
    contactMessage = document.getElementById('contact-message')

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    const formData = new FormData(contactForm)
    const data = Object.fromEntries(formData)

    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })

        if (response.ok) {
            // Show sent message
            contactMessage.textContent = 'Message sent successfully ✅'

            // Remove message after five seconds
            setTimeout(() => {
                contactMessage.textContent = ''
            }, 5000)

            // Clear input fields
            contactForm.reset()
        } else {
            // Show error message
            const errorMessage = await response.text()
            contactMessage.textContent = `❌ There was an error: ${errorMessage}`
        }
    } catch (error) {
        console.error('Error:', error)
    }
})