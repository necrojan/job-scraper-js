const rp = require('request-promise');
const cheerio = require('cheerio');
const connection = require('./db');
const puppeteer = require('puppeteer');

const onlineJobs = 'https://www.onlinejobs.ph/workers';
const kalibrr = 'https://www.kalibrr.com/job-board/i/it-and-software/work_from_home/y/1';

connection.connect((err) => {
    if (err) console.log('Error connecting to database');
    console.log('Connection established');
});

(async () => {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto(kalibrr);

    let content = await page.content();
    const $ = cheerio.load(content);

    $('.job-card-info').each((i, elem) => {
        const kalibrrJob = {
            title: $(elem).find('.job-card-title span').text(),
            position: $(elem).find('[itemprop=addressLocality]').text() + ', ' + $(elem).find('[itemprop=addressCountry]').text(),
            url: $(elem).find('.job-card-title').attr('href'),
        };

            connection.query('INSERT INTO kalibrr SET ?', kalibrrJob, (err, response) => {
                if (err) throw err;
                console.log('Last insert kalibrr ID: ', response.insertId);
            });
    })
})();
rp(onlineJobs)
    .then((res) => {
        const $ = cheerio.load(res);

        $('.latest-job-post').each((i, elem) =>{

            const onlineJob = {
                title: $(elem).find('h4').text(),
                position: $(elem).find('h4 > span').text(),
                url: $(elem).find('a').attr('href'),
            };

            connection.query('INSERT INTO onlinejobs SET ?', onlineJob, (err, response) => {
                if (err) throw err;
                console.log('Last insert onlinejobs ID: ', response.insertId);
            });
        });
    })
    .catch(err => console.log(err));


