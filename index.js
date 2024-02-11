const TelegramBot = require("node-telegram-bot-api");
const Jimp = require("jimp");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const folderPath = "./images";
const output = "./tempresults";

async function textOverlay(inputFolder, outputFolder, text, id) {
  // Reading image
  const image = await Jimp.read(inputFolder);
  // Defining the text font
  const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

  image.print(font, 10, 10, text);

  image.resize(300, 400);
  // Writing image after processing
  const resultstring = outputFolder + "/" + text + id + ".png";
  await image.writeAsync(resultstring);
  return resultstring;
}

fs.readdir(folderPath, (err, files) => {
  if (err) {
    console.error("Error reading directory:", err);
    return;
  }

  // Log the array of files
  files.forEach((file) => {
    const filepath = folderPath + "/" + file;
    textOverlay(filepath);
  });
});

const editImages = (id, text) => {
  const resArray = [];

  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      return;
    }

    // Log the array of files
    files.forEach((file) => {
      const filepath = folderPath + "/" + file;
      const response = textOverlay(filepath, output, text, id);
      resArray.push(response);
    });
  });

  return resArray;
};

const TOKEN = "6838781221:AAHCETgAMdgiGXbnhyFmnLtX-YQC0FHLjYA";
// Replace 'YOUR_BOT_TOKEN' with your actual bot token
const bot = new TelegramBot(TOKEN, { polling: true });

bot.on("message", (msg) => {
  console.log(msg.text);
});

// Handle inline queries

bot.on("inline_query", (query) => {
  const id = uuidv4();
  const searchText = query.query;
  const responseArray = editImages(id, searchText);

  const results = [
    {
      type: "article",
      id: "2",
      title: " text result",
      input_message_content: {
        message_text: "result 2",
      },
    },
  ];

  responseArray.forEach((res) => {
    results.push({
      type: "photo",
      id: results.length.toString(),
      photo_url: output + "/" + res,
      thumb_url: output + "/" + res,
      title: res,
    });
  });
  results.push({
    type: "article",
    id: results.length.toString(),
    title: searchText,
    input_message_content: {
      message_text: searchText.toUpperCase(),
    },
  });

  // Send the results back to the user
  console.log(results);
  bot.answerInlineQuery(query.id, results);
});

// Log any errors
bot.on("polling_error", (error) => {
  console.error(error);
});

console.log("Bot is running...");
