// Create an instance of the `Bot` class and pass your authentication token to it.
import { Bot } from "grammy";

// Create an instance of the `Bot` class and pass your authentication token to it.
const bot = new Bot('5596272178:AAH1yClgbyUJHgZhGbyVa5Kqb8w1rEk4pjU');

// You can now register listeners on your bot object `bot`.
// grammY will call the listeners when users send messages to your bot.

// Handle the /start command.
bot.command("start", async (ctx) => {ctx.reply('Order number:')});
// Handle other messages.
// bot.on("message", (ctx) => ctx.reply("Got another message!"));
// bot.command("message").filter(async (ctx) => {

// });

bot.hears(/\d{8}-\d{4}/m, (ctx) => {
    console.log(ctx.update.message)
})

// Now that you specified how to handle messages, you can start your bot.
// This will connect to the Telegram servers and wait for messages.

// function shootGrapple(author){
//     bot.on("message").filter(
//         async (ctx) => {
//             const user = await ctx.getAuthor();
//             return user.id == author.id
//           },
//           async (ctx) => {
//             const user = await ctx.getAuthor();
//             console.log(user)
//           },
//     )
// }

// Start the bot.
bot.start();