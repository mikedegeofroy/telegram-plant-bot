// Telegram bot

import fetch from 'node-fetch';
import mongoose from 'mongoose';
import { Bot, InlineKeyboard } from "grammy";
import {
  conversations,
  createConversation,
} from "@grammyjs/conversations";
import nodemailer from 'nodemailer'

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'mikedegeofroy',
    pass: 'pvjfzcnqfnhxfixs'
  }
});

var mailOptions = {
  from: 'mike@degeofroy.com',
  to: 'mikejustmikethemike@gmail.com',
  subject: 'Sending Email using Node.js',
  text: 'Fuck you x2',
  attachments: [
    {
      filename: 'banana.txt',
      path: 'banana.txt'
    },
  ]
};

let dbURI = 'mongodb://127.0.0.1:27017/telegram-bot-api'

var OrderSchema = new mongoose.Schema({
  posting_number: { type: String, unique: true },
}, { collection: "orders" });

var PersonSchema = new mongoose.Schema({
  user_id: { type: Number, unique: true, required: false },
  username: { type: String, required: false },
  first_name: { type: String, required: false },
  last_name: { type: String, required: false },
  email: { type: String, required: false },
  phone: { type: String, required: false },
  orders: { type: Array, required: false }
}, { collection: "people" });

mongoose.connect(dbURI, { useUnifiedTopology: true, useNewUrlParser: true }, error => {
  if (!error) {
    console.log("Connected to db")
  } else {
    console.log(error)
  }
})

async function getPostingNumber(id) {

  let url = 'https://api-seller.ozon.ru/v2/posting/fbo/list';

  let options = {
    method: 'POST',
    headers: {
      'Client-Id': '170246',
      'Api-Key': '4ff27aa0-e807-42f0-bb11-6ab376b39356',
      'Content-Type': 'application/json'
    },
    body: '{"dir":"DESC","limit":500,"offset":0,"filter":{"status":"delivered"},"translit":true,"with":{"analytics_data":true,"financial_data":false}}'
  };

  let orders = mongoose.model("orders", OrderSchema);

  await fetch(url, options)
    .then(res => res.json())
    .then(json => {
      json.result.forEach((element) => {
        orders.create({ posting_number: element.posting_number }, (err, result) => {
          if (err) {
            // console.log(err);
          } else {
            console.log(result);
          }
        });
      })
    })
    .catch(err => console.error('error:' + err))

  async function checkNum(id){
    let response = await orders.findOne({ "posting_number": { $regex: id } })
    return response
  }

  return checkNum(id)

}

const bot = new Bot('5596272178:AAH1yClgbyUJHgZhGbyVa5Kqb8w1rEk4pjU');


bot.command("start", async (ctx) => {

  ctx.reply('Order number:')

});


bot.hears(/\d{8}-\d{4}/m, async (ctx) => {
  // Explicit usage
  // ctx.telegram.sendMessage(ctx.message.chat.id, `Hello ${ctx.update.message.from.first_name}`)
  // /\d{8}-\d{4}/m

  // lets pretend this outputs true await getPostingNumber(ctx.update.message.text)

  let people = mongoose.model("people", PersonSchema);

  let posting_number = await getPostingNumber(ctx.update.message.text)

  console.log(posting_number)

  people.findOneAndUpdate({ "user_id": ctx.update.message.from.id }, { "username": ctx.update.message.from.username, "first_name": ctx.update.message.from.first_name, "last_name": ctx.update.message.from.last_name, $addToSet: { orders: posting_number }, }, { upsert: true, new: true }, (err, result) => {
    if (err) {
      // console.log(err);
    } else {
      console.log(result);
    }
  })


  if (posting_number) {

    const inlineKeyboard = new InlineKeyboard().url(
      "Channel",
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    ).text('Email', 'email');

    await ctx.reply("fuck", {
      reply_markup: inlineKeyboard,
    })

  }

  // orders.findOneAndUpdate({ "posting_number": { $regex: ctx.update.message.text } }, { "user_id": ctx.update.message.from.id, "username": ctx.update.message.from.username, "first_name": ctx.update.message.from.first_name, "last_name": ctx.update.message.from.last_name }, (err, something) => {
  //   if (!err) {
  //     console.log(something)
  //   } else {
  //     console.log(err)
  //   }

  //   ctx.telegram.sendMessage(ctx.message.chat.id, `${something}`)


})

bot.callbackQuery("email", async (ctx) => {
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });

  ctx.reply('Fuck you!', { reply_markup: { force_reply: true } })
});

bot.start();