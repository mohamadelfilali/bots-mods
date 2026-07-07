const express = require('express');
const mineflayer = require('mineflayer');
const cors = require('cors');

const app = express();
app.use(cors()); // ضروري جداً للسماح لبلوجر بالاتصال بهذا السيرفر
app.use(express.json());

let bot = null;

// مسار تشغيل البوت
app.post('/start', (req, res) => {
    // يجب استبدال YOUR_SERVER_IP بـ IP سيرفرك في أترنوس
    const serverIP = req.body.ip || "YOUR_SERVER_IP.aternos.me"; 
    const serverPort = req.body.port || 25565; // أترنوس غالباً يغير البورت، تأكد منه

    if (bot) return res.status(400).json({ message: "البوت يعمل داخل السيرفر بالفعل!" });

    try {
        bot = mineflayer.createBot({
            host: serverIP,
            port: serverPort,
            username: "AternosBot", // اسم البوت
            version: "1.21.1" // تحديد إصدار الفابرك
        });

        bot.on('spawn', () => {
            console.log('البوت دخل السيرفر بنجاح!');
        });

        bot.on('end', () => {
            console.log('تم خروج البوت.');
            bot = null;
        });

        bot.on('error', (err) => {
            console.log('حدث خطأ:', err);
        });

        res.json({ message: "جاري إدخال البوت إلى السيرفر..." });
    } catch (error) {
        res.status(500).json({ message: "حدث خطأ أثناء التشغيل." });
    }
});

// مسار إيقاف البوت
app.post('/stop', (req, res) => {
    if (!bot) return res.status(400).json({ message: "البوت لا يعمل حالياً." });
    
    bot.quit();
    bot = null;
    res.json({ message: "تم إيقاف البوت بنجاح." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
