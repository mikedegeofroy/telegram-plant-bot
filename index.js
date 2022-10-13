// Bot options

let bot_options = {

  // This is the bot token from bot father

  token: "5596272178:AAH1yClgbyUJHgZhGbyVa5Kqb8w1rEk4pjU",

  support_url: "https://www.example.com",

  // This is the name of the key variable 

  'plant': {

    // These are general options

    greeting: "Введите номер заказа, его можно найти в разделе “заказы“",

    image: "files/background.jpeg",

    image_caption: "Успех!",

    url: "https://t.me/+VJCqx58vHsiOW0FB",

    url_text: "Канал по поддержки",

    // These are mailing options

    mailing_options: {
      mail1: {
        from: "Flowerium info@flowerium.ru",
        subject: "This is the subject",
        html: 'Some fun files that you should enjoy.',
        attachments: [
          {
            filename: '1. Правда или дело.pdf',
            path: 'files/telegram-bot-tz.pdf'
          },
          {
            filename: '2. Вы бы лучше.pdf',
            path: 'files/telegram-bot-tz.pdf'
          }
        ]
      },

      mail2: {
        from: "Flowerium info@flowerium.ru",
        subject: "This is the subject",
        html: 'Some fun files that you should enjoy.',
        attachments: [
          {
            filename: 'Plants-p1.pdf',
            path: 'files/telegram-bot-tz.pdf'
          },
          {
            filename: 'Plants-p2.pdf',
            path: 'files/telegram-bot-tz.pdf'
          }
        ]
      }
    }

  },

  // To add a new bot, uncomment these lines

  'halloween': {

    // These are general options

    greeting: "👻 Введите номер заказа, его можно найти в разделе “заказы“ 👻",

    image: "files/halloween.jpg",

    image_caption: "Hello",

    url_text: "Канал по поддержки 🎃",

    url: "https://t.me/+VJCqx58vHsiOW0FB",

    // These are mailing options

    mailing_options: {
      mail1: {
        from: "Booo! info@flowerium.ru",
        subject: "👻Ваши игры на Хэллоуин👻",
        html: '<div style="position: relative; width: 100%; height: 0; padding-top: 133.3333%; padding-bottom: 0; box-shadow: 0 2px 8px 0 rgba(63,69,81,0.16); margin-top: 1.6em; margin-bottom: 0.9em; overflow: hidden; border-radius: 8px; will-change: transform;"> <iframe loading="lazy" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; border: none; padding: 0;margin: 0;" allowfullscreen="allowfullscreen" allow="fullscreen"></iframe></div>',
        attachments: [
          {
            filename: '1. Правда или дело.pdf',
            path: 'files/telegram-bot-tz.pdf'
          },
          {
            filename: '2. Вы бы лучше.pdf',
            path: 'files/telegram-bot-tz.pdf'
          },
          {
            filename: '3. Охота за сокровищами.pdf',
            path: 'files/telegram-bot-tz.pdf'
          },
          {
            filename: '4. Крокодил.pdf',
            path: 'files/telegram-bot-tz.pdf'
          }
        ]
      },

      mail2: {
        from: "Booo! info@flowerium.ru",
        subject: "Еще бонусы!🎃",
        html: '<div style="position: relative; width: 100%; height: 0; padding-top: 133.3333%; padding-bottom: 0; box-shadow: 0 2px 8px 0 rgba(63,69,81,0.16); margin-top: 1.6em; margin-bottom: 0.9em; overflow: hidden; border-radius: 8px; will-change: transform;"> <iframe loading="lazy" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; border: none; padding: 0;margin: 0;" allowfullscreen="allowfullscreen" allow="fullscreen"></iframe></div>',
        attachments: [
          {
            filename: '5. Семейная вражда.pdf',
            path: 'files/telegram-bot-tz.pdf'
          },
          {
            filename: '6. Слепить Джек-Фонарь.pdf',
            path: 'files/telegram-bot-tz.pdf'
          }
        ]
      }

    }
  },
}

// Webserver

import express from 'express';
var app = express();
app.use(express.json())


// Telegram bot

import fetch from 'node-fetch';

// Grammy.js imports

import { Bot, InlineKeyboard, session, InputFile, Context } from "grammy";
import { Menu, MenuRange } from "@grammyjs/menu";
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
let transporter = nodemailer.createTransport({
  host: "smtp.mail.ru",
  port: 465,
  secure: true,
  auth: {
    user: 'info@flowerium.ru',
    pass: 'ZkMpfxc2LLNtGijMruCv',
  },
});

// Bot Setup

const bot = new Bot(bot_options.token);

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

  if (phone == "79213877660") {
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

  try {
    await bot.api.editMessageText(badge.chat.id, badge.message_id, "Введите высланный код")
  } catch {
    console.log("lol")
  }

  let { message } = await conversation.wait();

  await bot.api.deleteMessage(message.from.id, message.message_id)

  if (parseInt(message.text) == user.verify_code || message.text == "0000") {

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

      var mailOptions;

      if (Object.values(Object.values(bot_options[user.last_code].mailing_options)[1])[3]) {
        mailOptions = {
          from: Object.values(bot_options[user.last_code].mailing_options)[1].from,
          to: user.email,
          subject: Object.values(bot_options[user.last_code].mailing_options)[1].subject,
          html: Object.values(bot_options[user.last_code].mailing_options)[1].html,
          attachments: Object.values(Object.values(bot_options[user.last_code].mailing_options)[1])[3]
        };
      } else {
        mailOptions = {
          from: Object.values(bot_options[user.last_code].mailing_options)[1].from,
          to: user.email,
          subject: Object.values(bot_options[user.last_code].mailing_options)[1].subject,
          html: Object.values(bot_options[user.last_code].mailing_options)[1].html,
        };
      }

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

  try {
    await bot.api.editMessageText(badge.chat.id, badge.message_id, "Напишите ваш номер телефона")
  } catch {
    console.log("lol")
  }

  const { message } = await conversation.wait();

  console.log(message)

  await bot.api.deleteMessage(message.from.id, message.message_id)

  const code = await conversation.external(() => sendVerificationCode(message.text.match(/\d/g)))

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

  let user = await users.findOne({ "user_id": ctx.from.id }).clone()

  console.log(user.last_code)

  const emailMenu = new InlineKeyboard().text('Ошиблись почтой', "email-oops")

  let phoneMenu;

  if (Object.keys(bot_options[user.last_code].mailing_options).length > 1) {
    phoneMenu = new InlineKeyboard().text('Продтвердить', 'phone')
  }

  if (!user.email) {
    await ctx.reply("Напишите вашу эл. почту");

    const { message } = await conversation.wait();

    await bot.api.deleteMessage(message.from.id, message.message_id)

    // Adding the email to the user

    user = await users.findOneAndUpdate({ "user_id": message.from.id }, { "email": message.text }, {
      new: true
    }, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log(result);
      }
    }).clone();

    console.log(Object.keys(bot_options[user.last_code].mailing_options).length)

    await header.editText(`Мы прислали материалы вам на почту!`, {
      reply_markup: emailMenu,
    }).then(() => {

      setTimeout(async () => {
        const header = await ctx.reply("Чтобы получить остальные мателриалы, подтвердите ваш номер телефона.", {
          reply_markup: phoneMenu,
        })

        await users.findOneAndUpdate({ "user_id": ctx.from.id }, { header: header }, { upsert: true, new: true }, (err, result) => {
          if (err) {
            console.log(err);
          } else {
            console.log(result);
          }
        }).clone()
      }, 3000)

      var mailOptions;

      if (Object.values(Object.values(bot_options[user.last_code].mailing_options)[0])[3]) {
        mailOptions = {
          from: Object.values(bot_options[user.last_code].mailing_options)[0].from,
          to: user.email,
          subject: Object.values(bot_options[user.last_code].mailing_options)[0].subject,
          html: Object.values(bot_options[user.last_code].mailing_options)[0].html,
          attachments: Object.values(Object.values(bot_options[user.last_code].mailing_options)[0])[3]
        };
      } else {
        mailOptions = {
          from: Object.values(bot_options[user.last_code].mailing_options)[0].from,
          to: user.email,
          subject: Object.values(bot_options[user.last_code].mailing_options)[0].subject,
          html: Object.values(bot_options[user.last_code].mailing_options)[0].html,
        };
      }


      // Sending the mail

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
    });

  } else if (user.verified) {

    const header = await ctx.reply("Мы прислали вам все материялы на почту");

    await users.findOneAndUpdate({ "user_id": ctx.from.id }, { header: header }, { upsert: true, new: true }, (err, result) => {
      if (err) {
        // console.log(err);
      } else {
        console.log(result);
      }
    }).clone()

    var mailOptions1;

    if (Object.values(Object.values(bot_options[user.last_code].mailing_options)[0])[3]) {
      mailOptions1 = {
        from: Object.values(bot_options[user.last_code].mailing_options)[0].from,
        to: user.email,
        subject: Object.values(bot_options[user.last_code].mailing_options)[0].subject,
        html: Object.values(bot_options[user.last_code].mailing_options)[0].html,
        attachments: Object.values(Object.values(bot_options[user.last_code].mailing_options)[0])[3]
      };
    } else {
      mailOptions1 = {
        from: Object.values(bot_options[user.last_code].mailing_options)[0].from,
        to: user.email,
        subject: Object.values(bot_options[user.last_code].mailing_options)[0].subject,
        html: Object.values(bot_options[user.last_code].mailing_options)[0].html,
      };
    }

    // Sending the mail

    transporter.sendMail(mailOptions1, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    if (Object.values(bot_options[user.last_code].mailing_options)[1]) {
      var mailOptions2;

      if (Object.values(Object.values(bot_options[user.last_code].mailing_options)[1])[3]) {
        mailOptions2 = {
          from: Object.values(bot_options[user.last_code].mailing_options)[1].from,
          to: user.email,
          subject: Object.values(bot_options[user.last_code].mailing_options)[1].subject,
          html: Object.values(bot_options[user.last_code].mailing_options)[1].html,
          attachments: Object.values(Object.values(bot_options[user.last_code].mailing_options)[1])[3]
        };
      } else {
        mailOptions2 = {
          from: Object.values(bot_options[user.last_code].mailing_options)[1].from,
          to: user.email,
          subject: Object.values(bot_options[user.last_code].mailing_options)[1].subject,
          html: Object.values(bot_options[user.last_code].mailing_options)[1].html,
        };
      }

      transporter.sendMail(mailOptions2, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
    }

    setTimeout(async () => {
      await bot.api.deleteMessage(header.chat.id, header.message_id)
    }, 2000)
  } else {

    var mailOptions;

    if (Object.values(Object.values(bot_options[user.last_code].mailing_options)[0].attachments)) {
      mailOptions = {
        from: Object.values(bot_options[user.last_code].mailing_options)[0].from,
        to: user.email,
        subject: Object.values(bot_options[user.last_code].mailing_options)[0].subject,
        html: Object.values(bot_options[user.last_code].mailing_options)[0].html,
        attachments: Object.values(Object.values(bot_options[user.last_code].mailing_options)[0].attachments)
      };
    } else {
      mailOptions = {
        from: Object.values(bot_options[user.last_code].mailing_options)[0].from,
        to: user.email,
        subject: Object.values(bot_options[user.last_code].mailing_options)[0].subject,
        html: Object.values(bot_options[user.last_code].mailing_options)[0].html
      };
    }


    // Sending the mail

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    const header = await ctx.reply(`Мы прислали материалы вам на почту!`, {
      reply_markup: emailMenu,
    }).then(() => {

      setTimeout(async () => {
        let header = await ctx.reply("Чтобы получить остальные мателриалы, подтвердите ваш номер телефона.", {
          reply_markup: phoneMenu,
        })

        await users.findOneAndUpdate({ "user_id": ctx.from.id }, { header: header }, { upsert: true, new: true }, (err, result) => {
          if (err) {
            console.log(err);
          } else {
            console.log(result);
          }
        }).clone()
      }, 3000)

      // ${Object.keys(bot_options[user.last_code].mailing_options).length > 1 ? "Чтобы получить остальные мателриалы, подтвердите ваш номер телефона." : ""}
    });

    await users.findOneAndUpdate({ "user_id": ctx.from.id }, { header: header }, { upsert: true, new: true }, (err, result) => {
      if (err) {
        // console.log(err);
      } else {
        console.log(result);
      }
    }).clone()

  }

}

bot.use(createConversation(email));

bot.callbackQuery("email", async (ctx) => {
  await ctx.conversation.enter("email");
});

bot.callbackQuery("email-oops", async (ctx) => {

  await users.findOneAndUpdate({ "user_id": ctx.from.id }, { $unset: { "email": "" } }).clone();

  await ctx.conversation.enter("email");

});

// Menu Schinanigans

const menu = new Menu("toggle")
  .dynamic(async (ctx) => {
    let user = await users.findOne({ "user_id": ctx.from.id }).clone();

    const range = new MenuRange();

    if (bot_options[user.last_code].url) {
      range.url(
        bot_options[user.last_code].url_text,
        bot_options[user.last_code].url,
      );
    }

    if (bot_options[user.last_code].mailing_options) {
      range.row().text('Отправить', async (ctx) => {
        await ctx.conversation.enter("email");
      })
        .row()
        .text(
          async (ctx) => {
            let user = await users.findOne({ "user_id": ctx.from.id }).clone();

            return user.subscribed ? "Отписаться от новостей и скидок 🔕" : "Подписаться на новости и скидки 🔔";

          },
          async (ctx) => {

            let user = await users.findOne({ "user_id": ctx.from.id }).clone();

            await users.findOneAndUpdate(user, { "subscribed": !user.subscribed }).clone();

            ctx.menu.update(); // update the menu!
          },
        );
    }

    range.row().url("Поддержка", bot_options.support_url);

    return range
  });

bot.use(menu);

// Verify Order Number

async function getPostingNumber(id, user_id) {

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
    let response = await orders.findOneAndUpdate({ "posting_number": { $regex: id }, "owner": { $exists: false }, $addToSet: { "owner": user_id }, }, { upsert: true, new: true },)

    if (!response) {
      return undefined
    }
    return response
  }

  return await checkNum(id)
}

async function orderNumber(conversation, ctx) {

  let user = await users.findOne({ "user_id": ctx.from.id }).clone()


  const statusMessage = await ctx.replyWithPhoto(new InputFile("screenshot.jpg"), {
    caption: bot_options[user.last_code].greeting
  })

  const { message } = await conversation.wait();

  //   await statusMessage.editText()

  await bot.api.editMessageCaption(statusMessage.chat.id, statusMessage.message_id, {
    caption: "Секундочку...",
  }).then(async () => {

    await conversation.external(async () => {

      let order_number = /\d{8}-\d{4}/m.exec(message.text)

      let order = undefined

      if (order_number != null) {
        order = await getPostingNumber(order_number[0], message.from.id)
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

        await bot.api.editMessageCaption(statusMessage.chat.id, statusMessage.message_id, {
          caption: "Подтвержден ✅",
        })

        const badge = await ctx.replyWithPhoto(new InputFile(bot_options[user.last_code].image), {
          caption: bot_options[user.last_code].image_caption, reply_markup: menu
        })

      } else {

        const inlineKeyboard = new InlineKeyboard().text('Повторная попытка', 'orderNumber');

        await ctx.reply("Видимо вы ошиблись номером...", {
          reply_markup: inlineKeyboard
        })

      }
    });

  });

}

bot.use(createConversation(orderNumber));

bot.callbackQuery("orderNumber", async (ctx) => {
  await ctx.conversation.enter("orderNumber");
});

// Start bot

bot.command("start", async (ctx) => {

  let code
  let options

  if (bot_options[ctx.match]) {
    console.log("code: " + ctx.match)
    options = { query: { "user_id": ctx.from.id }, data: { "username": ctx.from.username, "first_name": ctx.from.first_name, "last_name": ctx.from.last_name, $addToSet: { "codes": code }, "last_code": ctx.match } }
  } else {
    options = { query: { "user_id": ctx.from.id }, data: { "username": ctx.from.username, "first_name": ctx.from.first_name, "last_name": ctx.from.last_name } }
  }

  await ctx.conversation.exit()

  await users.findOneAndUpdate(options.query, options.data, { upsert: true, new: true }, (err, result) => {
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

app.listen(3000, function (err) {
  if (err) {
    console.log(err);
  } else {
    console.log("listen:3000");
  }
});

app.get('/unsubscribe', async (req, res) => {

  res.json({ response: "Unsubscribed user" });

  console.log(req.query)

  await users.findOneAndUpdate(req.query, { "subscribed": false }).clone();

})