const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

app.use((req, res, next) => {
  res.append('Access-Control-Allow-Origin', ['*']);
  res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.append('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use(express.json());
app.use(bodyParser.json());
app.use(
  express.urlencoded({
    extended: true
  })
);

app.use(express.static(path.join(__dirname + '/public/')));

app.post('/submitOrder', (req, res) => {
  const { products, quantity, contact } = req.body;

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.error('Please set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in your .env file.');
    return res.status(500).send('Failed to submit order. Environment variables not set.');
  }

  const message = `New Order:\nProducts: ${products}\nQuantity: ${quantity}\nContact: ${contact}`;

  axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    chat_id: chatId,
    text: message
  })
  .then(response => {
    console.log('Message sent to Telegram:', response.data);
    res.status(200).send('Order submitted successfully!');
  })
  .catch(error => {
    console.error('Error sending message to Telegram:', error.message);
    res.status(500).send('Failed to submit order. Please try again.');
  });
});


app.listen(80, () => {
  console.log("\x1b[33m[Express]\x1b[0m \x1b[36mServer Listening at PORT 80.\x1b[0m");
});