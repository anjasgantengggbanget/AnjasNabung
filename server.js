     const express = require('express');
     const app = express();
     const bodyParser = require('body-parser');
     const axios = require('axios');
     const fs = require('fs');
     const path = require('path');

     app.use(bodyParser.json());
     app.use(express.static(path.join(__dirname, 'public')));

     const token = '7660856384:AAHQuKHv8XcCSqmDoSaNsjS6X_HtjCquD3M';
     const chatId = '7562559526';

     let savings = [];
     let currentPeriod = 'minggu';

     // Load savings data from file if exists
     const savingsFilePath = path.join(__dirname, 'savings.json');
     if (fs.existsSync(savingsFilePath)) {
         savings = JSON.parse(fs.readFileSync(savingsFilePath, 'utf8'));
     }

     function saveSavings() {
         fs.writeFileSync(savingsFilePath, JSON.stringify(savings, null, 2), 'utf8');
     }

     function checkPeriodEnd() {
         const now = new Date();
         const firstSavingDate = savings[0]?.date;
         if (!firstSavingDate) return;

         let periodEnd;

         if (currentPeriod === 'minggu') {
             periodEnd = new Date(firstSavingDate.getFullYear(), firstSavingDate.getMonth(), firstSavingDate.getDate() + 7);
         } else if (currentPeriod === 'bulan') {
             periodEnd = new Date(firstSavingDate.getFullYear(), firstSavingDate.getMonth() + 1, firstSavingDate.getDate());
         } else if (currentPeriod === 'tahun') {
             periodEnd = new Date(firstSavingDate.getFullYear() + 1, firstSavingDate.getMonth(), firstSavingDate.getDate());
         }

         if (now >= periodEnd) {
             sendTelegramMessage();
             resetSavings();
         }
     }

     function resetSavings() {
         savings = [];
         saveSavings();
         updateSummary();
     }

     function sendTelegramMessage() {
         let message = `📊 *Ringkasan Nabung ${currentPeriod}*\n\n`;
         let total = 0;
         let sources = {};

         savings.forEach(saving => {
             total += saving.amount;
             message += `📅 ${new Date(saving.date).toLocaleDateString()}: *Rp ${saving.amount.toLocaleString()}* (Sumber: ${saving.source})\n`;
             if (!sources[saving.source]) {
                 sources[saving.source] = 0;
             }
             sources[saving.source] += saving.amount;
         });

         message += `\n💰 *Total Nabung: Rp ${total.toLocaleString()}*\n\n`;
         message += `🔍 *Rincian Sumber Uang:*\n`;
         for (const source in sources) {
             message += `• ${source}: *Rp ${sources[source].toLocaleString()}*\n`;
         }

         axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
             chat_id: chatId,
             text: message,
             parse_mode: 'MarkdownV2'
         })
         .then(response => {
             if (response.data.ok) {
                 console.log('Ringkasan nabung telah dikirim ke Telegram');
             } else {
                 console.log('Gagal mengirim ringkasan nabung ke Telegram');
             }
         })
         .catch(error => {
             console.error('Error:', error);
             console.log('Terjadi kesalahan saat mengirim ringkasan nabung ke Telegram');
         });
     }

     function updateSummary() {
         let summary = `📊 *Ringkasan Nabung ${currentPeriod}*\n\n`;
         let total = 0;
         let sources = {};

         savings.forEach(saving => {
             total += saving.amount;
             summary += `📅 ${new Date(saving.date).toLocaleDateString()}: *Rp ${saving.amount.toLocaleString()}* (Sumber: ${saving.source})\n`;
             if (!sources[saving.source]) {
                 sources[saving.source] = 0;
             }
             sources[saving.source] += saving.amount;
         });

         summary += `\n💰 *Total Nabung: Rp ${total.toLocaleString()}*\n\n`;
         summary += `🔍 *Rincian Sumber Uang:*\n`;
         for (const source in sources) {
             summary += `• ${source}: *Rp ${sources[source].toLocaleString()}*\n`;
         }

         return summary;
     }

     app.post('/add-saving', (req, res) => {
         const { amount, source } = req.body;
         if (amount < 20000) {
             return res.status(400).send('Minimal jumlah nabung adalah 20000');
         }
         savings.push({ date: new Date(), amount: parseInt(amount), source: source });
         saveSavings();
         checkPeriodEnd();
         res.send('Saving added');
     });

     app.get('/summary', (req, res) => {
         const summary = updateSummary();
         res.send(summary);
     });

     app.listen(process.env.PORT, () => {
         console.log(`Server is running on port ${process.env.PORT}`);
         // Check period end on server start
         checkPeriodEnd();
     });
     ```
                
