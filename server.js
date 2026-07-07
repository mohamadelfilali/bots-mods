const express = require('express');
const mineflayer = require('mineflayer');
const cors = require('cors');

const app = express();
app.use(cors()); 
app.use(express.json());

let bot = null;

// مسار تشغيل البوت
app.post('/start', (req, res) => {
    const serverIP = req.body.ip;
    const serverPort = req.body.port;
    const mcVersion = req.body.version;

    // التحقق من وجود كافة البيانات
    if (!serverIP || !serverPort || !mcVersion) {
        return res.status(400).json({ message: "الرجاء إرسال الآي بي، البورت، والإصدار." });
    }

    if (bot) return res.status(400).json({ message: "البوت متصل بالسيرفر بالفعل!" });

    try {
        bot = mineflayer.createBot({
            host: serverIP,
            port: serverPort,
            username: "AternosBot", // يمكنك تغيير اسم البوت هنا
            version: mcVersion // يتم قراءة الإصدار المختار من الواجهة
        });

        bot.on('spawn', () => {
            console.log(`البوت دخل السيرفر بنجاح بإصدار ${mcVersion}`);
        });

        bot.on('end', () => {
            console.log('تم خروج البوت.');
            bot = null;
        });

        bot.on('error', (err) => {
            console.log('حدث خطأ:', err);
        });

        res.json({ message: `جاري تشغيل البوت على إصدار ${mcVersion}...` });
    } catch (error) {
        res.status(500).json({ message: "حدث خطأ أثناء الاتصال بالسيرفر." });
    }
});

// مسار إرسال رسالة في الشات
app.post('/chat', (req, res) => {
    const message = req.body.message;
    
    if (!bot) return res.status(400).json({ message: "البوت لا يعمل حالياً. قم بتشغيله أولاً!" });
    if (!message) return res.status(400).json({ message: "محتوى الرسالة فارغ." });
    
    try {
        bot.chat(message); // إرسال الرسالة إلى سيرفر ماين كرافت
        res.json({ message: "تم إرسال الرسالة بنجاح!" });
    } catch(err) {
        res.status(500).json({ message: "حدث خطأ أثناء إرسال الرسالة." });
    }
});

// مسار إيقاف البوت
app.post('/stop', (req, res) => {
    if (!bot) return res.status(400).json({ message: "البوت غير متصل حالياً." });
    
    bot.quit();
    bot = null;
    res.json({ message: "تم إيقاف البوت بنجاح." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
