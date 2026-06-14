const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 🔐 SECURE TRANSPORTER CONFIGURATION
const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: 'learndevops753@gmail.com',         // Your Gmail account
        pass: 'rpyjezmggpmijjnd'                 // Your 16-character Google App Password (no spaces)
    }
});

// 📬 EMAIL SENDING POST GATEWAY ENDPOINT
app.post('/api/send-report', async (req, res) => {
    const { toEmail, totalSales, totalProfit, csvContent } = req.body;

    const mailOptions = {
        from: '"Metrics Dashboard" <learndevops753@gmail.com>', // Matches authorized sender
        to: toEmail,
        subject: '📈 System Performance Ledger Export',
        text: `Hello,\n\nPlease find attached the generated sales ledger report summary.\n\nTotal Sales: ${totalSales}\nTotal Profit: ${totalProfit}\n\nRegards,\nDashboard System`,
        attachments: [
            {
                filename: 'performance_report.csv',
                content: csvContent // Raw text string automatically compiles into a standalone file attachment
            }
        ]
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'Email sent successfully!' });
    } catch (err) {
        console.error("Transporter Error Details:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// 🚀 START LOCAL SERVER ON PORT 5000
app.listen(5000, () => console.log('🚀 Secure Mail Gateway running on port 5000'));