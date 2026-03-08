import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export async function sendDailyReminder(to: string, userName: string) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log(`[MOCK EMAIL] To: ${to}, User: ${userName}`);
        console.log(`Subject: 🚨 4 Hours Left! Solve Today's Daily Bug 🪲`);
        console.log(`Message: Hi ${userName}, don't forget to solve today's challenge to maintain your streak!`);
        return;
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: '🚨 4 Hours Left! Solve Today\'s Daily Bug 🪲',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #030303; color: #898989; border-radius: 12px; border: 1px solid #89898933;">
                <h1 style="color: #898989;">Hi ${userName}! 👋</h1>
                <p style="font-size: 16px; color: #898989;">Only 4 hours left to solve today's Daily Bug and maintain your streak!</p>
                <div style="background-color: #8989891A; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #89898926;">
                    <p style="margin: 0; font-weight: bold; color: #898989;">Current Streak: Keep it alive! 🔥</p>
                </div>
                <p style="color: #898989;">Don't let your Rhythm Score drop. Head over to DebugHub now!</p>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/daily-bug" style="display: inline-block; background-color: #898989; color: #030303; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Solve Now 🪲</a>
                <p style="margin-top: 30px; font-size: 12px; color: #89898973;">Best regards,<br>The DebugHub Team</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

export async function sendWelcomeEmail(to: string, userName: string) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log(`[MOCK EMAIL] To: ${to}, User: ${userName}`);
        console.log(`Subject: Welcome to DebugHub! 🚀`);
        return;
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: 'Welcome to DebugHub! 🚀',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #030303; color: #E0E0E0; border-radius: 12px; border: 1px solid #434343;">
                <h1 style="color: #E0E0E0;">Welcome, ${userName}! 👋</h1>
                <p style="font-size: 16px; color: #898989;">We're incredibly excited to have you join DebugHub.</p>
                <div style="background-color: #000000; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #2E2E2E;">
                    <p style="margin: 0; color: #898989; line-height: 1.6;">Get ready to sharpen your debugging skills on production-grade code, track your diagnostic insights, and experience real historical outages. We built DebugHub to help engineers like you master the art of problem-solving. We can't wait to see you conquer the leaderboard!</p>
                </div>
                <p style="color: #898989;">Start your first challenge now:</p>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/practice" style="display: inline-block; background-color: #616161; color: #000000; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">Start Debugging 🪲</a>
                <p style="margin-top: 30px; font-size: 12px; color: #626262;">With love and zero bugs,<br>The DebugHub Team</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Welcome email sent to ${to}`);
    } catch (error) {
        console.error('Error sending welcome email:', error);
    }
}
