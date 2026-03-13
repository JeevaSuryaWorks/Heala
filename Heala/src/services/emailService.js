// Email service using the Resend API directly to ensure browser compatibility
const RESEND_API_URL = 'https://api.resend.com/emails';
const RESEND_KEY = import.meta.env.VITE_RESEND_KEY;

/**
 * Sends a welcome email to new users
 * @param {string} toEmail - Recipient email address
 * @param {string} userName - Name of the user
 */
export const sendWelcomeEmail = async (toEmail, userName) => {
    try {
        const response = await fetch(RESEND_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: 'Heala Onboarding <onboarding@resend.dev>',
                to: [toEmail],
                subject: 'Welcome to Heala!',
                html: `
                    <div style="font-family: 'Outfit', sans-serif; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 16px">
                        <h1 style="color: #8b5cf6; font-size: 24px; font-weight: 800; margin-bottom: 20px">Welcome to Heala, ${userName}!</h1>
                        <p style="font-size: 16px; line-height: 1.6; color: #4b5563">
                            We are thrilled to have you join our community. At Heala, we are committed to providing you with the best healthcare experience.
                        </p>
                        <p style="font-size: 16px; line-height: 1.6; color: #4b5563">
                            You can now start booking appointments with our top-rated doctors and manage your health information seamlessly.
                        </p>
                        <div style="margin-top: 30px; padding: 20px; background: #f9fafb; border-radius: 12px">
                            <p style="margin: 0; font-size: 14px; color: #6b7280">
                                If you have any questions, feel free to reply to this email or visit our support center.
                            </p>
                        </div>
                    </div>
                `
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Resend API Error:', data);
            return { success: false, error: data };
        }

        return { success: true, data };
    } catch (err) {
        console.error('Unexpected email error:', err);
        return { success: false, error: err.message };
    }
};

/**
 * Generic email sender for special subjects/content
 */
export const sendEmail = async ({ to, subject, html }) => {
    try {
        const response = await fetch(RESEND_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: 'Heala <onboarding@resend.dev>',
                to,
                subject,
                html
            })
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.message || 'Email failed');
        return { success: true, data };
    } catch (error) {
        console.error('Email failed:', error);
        return { success: false, error: error.message };
    }
};
