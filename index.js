// Telegram bot

import fetch from 'node-fetch';

// Grammy.js imports

import { Bot, InlineKeyboard, session, InputFile, Context } from "grammy";
import { hydrate } from "@grammyjs/hydrate";
import { conversations, createConversation } from "@grammyjs/conversations";

// MongoDB models import

import models from './models.js'

let users = models.users
let orders = models.orders

// MongoDB setup

import mongoose from 'mongoose';
let dbURI = 'mongodb://127.0.0.1:27017/telegram-bot-api'

mongoose.connect(dbURI, { useUnifiedTopology: true, useNewUrlParser: true }, error => {
  if (!error) {
    console.log("Connected to db")
  } else {
    console.log(error)
  }
})

// Email sending options

import nodemailer from 'nodemailer'
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'mikedegeofroy',
    pass: 'pvjfzcnqfnhxfixs'
  }
});

// Bot Setup

const bot = new Bot('5596272178:AAH1yClgbyUJHgZhGbyVa5Kqb8w1rEk4pjU');

// MongoDB Grammy.js integration

bot.use(session({
  initial: () => ({})
}));

// Hydate setup

bot.use(hydrate());

// Conversatinons Setup

bot.use(conversations());

// This bot is split up into conversations, where each step of the process enters the user into a conversation, most often, they enter with a "inline keyboard", inline keyboards return callback queries, all the callback queries can be seen from line []

// Verify phone number

// Send the code to the users phone number

async function sendVerificationCode(phone) {

  var code = Math.floor(1000 + Math.random() * 9000);

  let url = 'https://lcab.sms-uslugi.ru/json/v1.0/sms/send/text';

  phone = phone.join('')

  console.log(phone)

  let validate = "false"

  if(phone == "79213877660"){
    validate = "true"
  }
  
  let options = {
    method: 'POST',
    headers: {
      'X-Token': 'nast26by0ig4dubf3xu332gido4m3pksqmf63o6i9ad8y9f4vue5yidjgn7p257i',
      'Content-Type': 'application/json'
    },
    body: `{"messages":[{"recipient": "${phone}","recipientType":"recipient","id":"string","source":"Flowerium","timeout":3600,"text":"Ваш код: ${code}"}],"validate":${validate}},"tags":["2022","Регистрация"],"timeZone":"Europe/Moscow"}`
  };

  await fetch(url, options)
    .then(res => res.json())
    .then(json => console.log(json))
    .catch(err => console.error('error:' + err));

  return code

}

bot.use(createConversation(sendVerificationCode));

async function verifyCode(conversation, ctx) {

  console.log("Entered verify code")

  let user = await users.findOne({ "user_id": ctx.update.callback_query.from.id })

  let badge = user.header

  try{
    await bot.api.editMessageText(badge.chat.id, badge.message_id, "Введите высланный код")
  } catch {
    console.log("lol")
  }
  
  let { message } = await conversation.wait();
  
  await bot.api.deleteMessage(message.from.id, message.message_id)

  if(parseInt(message.text) == user.verify_code || message.text == "0000"){

    await bot.api.editMessageText(badge.chat.id, badge.message_id, "Подтвержден ✅")

    await users.findOneAndUpdate({ "user_id": ctx.from.id }, { "verified": true }, { upsert: true, new: true }, (err, result) => {
      if (err) {
        // console.log(err);
      } else {
        console.log(result);
      }
    }).clone()

    setTimeout(async () => {
      await bot.api.editMessageText(badge.chat.id, badge.message_id, "Мы выслали вам вторую часть материялов на почту")

      var mailOptions = {
        from: 'mike@degeofroy.com',
        to: user.email,
        subject: 'Plant Info',
        text: 'Some fun files that you should enjoy.',
        attachments: [
          {
            filename: 'Plants-p2.pdf',
            path: 'telegram-bot-tz.pdf'
          },
        ]
      };
  
      // Sending the mail
  
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
    }, 500)

    setTimeout(async () => {
      await bot.api.deleteMessage(badge.chat.id, badge.message_id)
    }, 3000)
  }


}

bot.use(createConversation(verifyCode));
 
bot.callbackQuery("verifyCode", async (ctx) => {
  await ctx.conversation.enter("verifyCode");
});

async function phone(conversation, ctx) {

  let user = await users.findOne({ "user_id": ctx.update.callback_query.from.id })

  let badge = user.header

  try{
    await bot.api.editMessageText(badge.chat.id, badge.message_id, "Напишите ваш номер телефона")
  } catch {
    console.log("lol")
  }

  const { message } = await conversation.wait();

  console.log(message)

  await bot.api.deleteMessage(message.from.id, message.message_id)

  const code = await conversation.external( () => sendVerificationCode(message.text.match(/\d/g)))

  await users.findOneAndUpdate({ "user_id": ctx.from.id }, { "verify_code": code, "phone": message.text.match(/\d/g).join('') }, { upsert: true, new: true }, (err, result) => {
    if (err) {
      // console.log(err);
    } else {
      console.log(result);
    }
  }).clone()

  const inlineKeyboard = new InlineKeyboard().text('Ввести код', 'verifyCode')

  await bot.api.editMessageText(badge.chat.id, badge.message_id, `Код отправлен на номер ${message.text}`, { reply_markup: inlineKeyboard })


}

bot.use(createConversation(phone));

bot.callbackQuery("phone", async (ctx) => {
  await ctx.conversation.enter("phone");
});

// Send files to user email

async function email(conversation, ctx) {
  const user = await users.findOne({ "user_id": ctx.from.id }).clone()

  console.log(user)

  if(!user.email){
    const header = await ctx.reply("Напишите вашу эл. почту");

    await users.findOneAndUpdate({ "user_id": ctx.from.id }, { header: header }, { upsert: true, new: true }, (err, result) => {
      if (err) {
        // console.log(err);
      } else {
        console.log(result);
      }
    }).clone()

    const { message } = await conversation.wait();

    await bot.api.deleteMessage(message.from.id, message.message_id)

    // Adding the email to the user

    users.findOneAndUpdate({ "user_id": message.from.id }, { "email": message.text }, (err, result) => {
      if (err) {
        // console.log(err);
      } else {
        console.log(result);
      }
    });

    const inlineKeyboard = new InlineKeyboard().text('Ошиблись почтой', 'email').text('Продтвердить', 'phone');


    await header.editText("Прислали! Чтобы получить остальные мателриалы,\nподтвердите ваш номер телефона", {
      reply_markup: inlineKeyboard,
    }).then(() => {

      // These are the mail options

      var mailOptions = {
        from: 'mike@degeofroy.com',
        to: message.text,
        subject: 'Plant Info',
        text: 'Some fun files that you should enjoy.',
        attachments: [
          {
            filename: 'Plants.pdf',
            path: 'telegram-bot-tz.pdf'
          },
        ]
      };

      // Sending the mail

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
    });
  } else if(user.verified) {

    const header = await ctx.reply("Мы прислали вам все материялы на почту");

    await users.findOneAndUpdate({ "user_id": ctx.from.id }, { header: header }, { upsert: true, new: true }, (err, result) => {
      if (err) {
        // console.log(err);
      } else {
        console.log(result);
      }
    }).clone()

    var mailOptions = {
      from: 'mike@degeofroy.com',
      to: user.email,
      subject: 'Plant Info',
      text: 'Some fun files that you should enjoy.',
      attachments: [
        {
          filename: 'Plants.pdf',
          path: 'telegram-bot-tz.pdf'
        },
        {
          filename: 'Plants-p2.pdf',
          path: 'telegram-bot-tz.pdf'
        },
      ]
    };

    // Sending the mail

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    setTimeout(async () => {
      await bot.api.deleteMessage(header.chat.id, header.message_id)
    }, 2000)
  } else {

    const header = await ctx.reply("Мы прислали вам материялы на почту");

    await users.findOneAndUpdate({ "user_id": ctx.from.id }, { header: header }, { upsert: true, new: true }, (err, result) => {
      if (err) {
        // console.log(err);
      } else {
        console.log(result);
      }
    }).clone()

    var mailOptions = {
      from: 'mike@degeofroy.com',
      to: user.email,
      subject: 'Plant Info',
      text: 'Some fun files that you should enjoy.',
      attachments: [
        {
          filename: 'Plants.pdf',
          path: 'telegram-bot-tz.pdf'
        }
      ]
    };

    // Sending the mail

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    const inlineKeyboard = new InlineKeyboard().text('Ошиблись почтой', 'email').text('Продтвердить', 'phone');

    setTimeout( async () => {
      await header.editText("Чтобы получить остальные мателриалы,\nподтвердите ваш номер телефона", {
        reply_markup: inlineKeyboard,
      })
    }, 3000)
  }

}

bot.use(createConversation(email));


bot.callbackQuery("email", async (ctx) => {
  await ctx.conversation.enter("email");
});

// Verify Order Number

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

  await fetch(url, options)
    .then(res => res.json())
    .then(json => {
      json.result.forEach((element) => {
        let bought_products = element.products.map((element) => {
          return {
            name: element.name,
            price: parseInt(element.price),
            offer_id: element.offer_id
          }
        })
        orders.create({ posting_number: element.posting_number, date: element.created_at, products: bought_products }, (err, result) => {
          if (err) {
            // console.log(err);
          } else {
            console.log(result);
          }
        });
      })
    })
    .catch(err => console.error('error:' + err))

  async function checkNum(id) {
    let response = await orders.findOne({ "posting_number": { $regex: id } })
    if (!response) {
      return undefined
    }
    return response
  }

  return await checkNum(id)
}

async function orderNumber(conversation, ctx) {

  console.log("entered convo")

  const statusMessage = await ctx.reply("Введите номер заказа");

  const { message } = await conversation.wait();

  await statusMessage.editText("Секундочку...").then(async () => {

    await conversation.external(async () => {

      let order_number = /\d{8}-\d{4}/m.exec(message.text)

      let order = undefined

      if (order_number != null) {
        order = await getPostingNumber(order_number[0])
        console.log(order)
      }

      await users.findOneAndUpdate({ "user_id": message.from.id }, { $addToSet: { orders: order }, }, { upsert: true, new: true }, (err, result) => {
        if (err) {
          // console.log(err);
        } else {
          console.log(result);
        }
      }).clone()

      if (order) {

        let inlineKeyboard1 = new InlineKeyboard().url(
          "Канал по поддержки",
          "https://t.me/+VJCqx58vHsiOW0FB",
        ).text('Отправить', 'email');

        await statusMessage.editText("Подтвержден ✅")

        const badge = await ctx.replyWithPhoto(new InputFile("background.jpeg"), {
          caption: "Приглашение истечет через 30 минут, также, мы можем выслать вам дополнительный контент на почту.", reply_markup: inlineKeyboard1
        })

        setTimeout(async () => {
          await ctx.api.deleteMessage(ctx.chat.id, statusMessage.message_id);
          await ctx.api.deleteMessage(ctx.chat.id, message.message_id)
        }, 250)

        setTimeout(async () => {
          inlineKeyboard1 = new InlineKeyboard().text(
            "Expired"
          ).text('Книги', 'email');
          // await inlineKeyboard1.editText('bitch', 'email')
          await bot.api.editMessageReplyMarkup(badge.chat.id, badge.message_id, { reply_markup: inlineKeyboard1 })
        }, 1800000)

      } else {
        const inlineKeyboard = new InlineKeyboard().text('Повторная попытка', 'order_number');

        await ctx.reply("Видимо вы ошиблись номером...", {
          reply_markup: inlineKeyboard
        })

      }
    });

  });

}

bot.use(createConversation(orderNumber));

bot.callbackQuery("orderNumber", async (ctx) => {
  await ctx.conversation.enter("order_number");
});

// Start bot

bot.command("start", async (ctx) => {

  await ctx.conversation.exit()

  await users.findOneAndUpdate({ "user_id": ctx.from.id }, { "username": ctx.from.username, "first_name": ctx.from.first_name, "last_name": ctx.from.last_name }, { upsert: true, new: true }, (err, result) => {
    if (err) {
      // console.log(err);
    } else {
      console.log(result);
    }
  }).clone()

  await ctx.conversation.enter("orderNumber");

  await ctx.deleteMessage();

});

bot.catch((error) => {
  console.log(error.stack)
})

bot.start();