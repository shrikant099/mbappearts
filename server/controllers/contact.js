import { mailSender} from '../utils/emailsender.js';

export const sendEmail = async (req, res) => {
    try {
        const { email, title, body } = req.body;

        if (!email || !title || !body) {
            return res.status(400).json({
                success: false,
                message: 'Email, title, and body are required',
            });
        }

        const response = await mailSender(email, title, body);

        return res.status(200).json({
            success: true,
            message: 'Email sent successfully',
            info: response,
        });
    } catch (error) {
        console.error('Error in sendEmail controller:', error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong while sending the email',
        });
    }
};
