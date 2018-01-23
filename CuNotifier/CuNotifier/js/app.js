process.on('unhandledRejection', (err) => {
    console.error(err)
    process.exit(1)
})

const jsonfile = require('jsonfile');
const fs = require('fs');
const request = require('request');
const cron = require('node-cron');
const teleAPI = require('./teleAPI');
const needle = require('needle');
const cheerio = require('cheerio');
const fetch = require('node-fetch');

const dbFile = 'js/db.json';
const config = readJson('js/config.json');

function readJson(path) {
    return JSON.parse(fs.readFileSync(path, 'utf8'))
}

const getGPUs = async (limit) => {
    const url = 'https://www.computeruniverse.net/en/list.asp?props=30008512_lowerlimit|10000362&props_groupfilter=30001069&props_manufilter=10201,11108&searchname=rx580&v=0&o=%5BN1%5D%2C+%5BN2%5D';


    // request
    let response = await fetch(url);
    // parsing
    let data = await response.text();

    let $ = cheerio.load(data);
    let cards = [];


    $('.productsTableRow').each(function () {
        cards.push({
            name: $('.listProductTitle a', this).text(),
            price: $('.priceItalicBig', this).text().substring(2, 5),
            status1: $('.listStatusInfo strong', this).text(),
            status2: $('.listStatusInfo span', this).text()
        });
    });


    return cards;
}


const main = async () => {
    console.log("main");

    const cards = await getGPUs();
    let db = jsonfile.readFileSync(dbFile);
    let msg = '';

    for (const i in db) {
        for (const j in cards) {
            if (db[i].name == cards[j].name && JSON.stringify(db[i]) !== JSON.stringify(cards[j])) {

                let cardMsg = `${db[i].name}\n`;

                if (db[i].status1 !== cards[j].status1) {
                    cardMsg += teleAPI.bold(`${db[i].status1} -> ${cards[j].status1}\n`);
                    db[i].status1 = cards[j].status1;
                } else {
                    cardMsg += `${db[i].status1}\n`;
                }

                if (db[i].status2 !== cards[j].status2) {
                    cardMsg += teleAPI.bold(`${db[i].status2} -> ${cards[j].status2}\n`);
                    db[i].status2 = cards[j].status2;
                } else {
                    cardMsg += `${db[i].status2}\n`;
                }

                if (db[i].price !== cards[j].price) {
                    cardMsg += teleAPI.bold(`${db[i].price} -> ${cards[j].price}\n`);
                    db[i].price = cards[j].price;
                } else {
                    cardMsg += `${db[i].price}\n`;
                }

                msg += `${cardMsg}\n\n`;
            }
        }
    }
    await teleAPI.sendMessage(msg);




    jsonfile.writeFileSync(dbFile, db)

    console.log("main exit");
}

teleAPI.init(config.telegram.APIkey, config.telegram.chatID);

main();

const test = async () => {
    console.log("Test");
}


var task = cron.schedule('*/10 * * * *', function () {
    main().catch(err => {
        console.log(err);
    });
});

task.start();