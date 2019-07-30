const rp = require('request-promise');
const cheerio = require('cheerio');
const connection = require('./db');
const puppeteer = require('puppeteer');

const onlineJobs = 'https://www.onlinejobs.ph/workers';
const kalibrr = 'https://www.kalibrr.com/job-board/i/it-and-software/work_from_home/y/1';
const bestjobs = 'https://www.bestjobs.ph/jobs';
const jobstreet = 'https://www.jobstreet.com.ph/en/job-search/job-vacancy.php?ojs=1';

connection.connect((err) => {
    if (err) console.log('Error connecting to database');
    console.log('Connection established');
});

function close(company, payload) {
    connection.query(`INSERT INTO ${company} SET ?`, payload, (err, response) => {
        if (err) throw err;
        console.log(`Last insert ${company} ID: `, response.insertId);
    });
}

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(kalibrr);

    let content = await page.content();
    const $ = cheerio.load(content);

    $('.job-card-info').each((i, elem) => {
        const kalibrrJob = {
            title: $(elem).find('.job-card-title span').text(),
            position: $(elem).find('[itemprop=addressLocality]').text() + ', ' + $(elem).find('[itemprop=addressCountry]').text(),
            url: $(elem).find('.job-card-title a').attr('href'),
        };

        close('kalibrr', kalibrrJob);
    });

    setTimeout(() => { browser.close() }, 15000);
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
            close('onlinejobs', onlineJob);
        });
    })
    .catch(err => console.log(err));

rp(bestjobs)
    .then((res) => {
        const $ = cheerio.load(res);

        $('.iO').each((i, elem) =>{
            const bestJobs = {
                title: $(elem).find('h2 a').text(),
                position: $(elem).find('[itemprop=addressLocality]').text(),
                url: $(elem).find('h2 a').attr('href'),
            };
            close('bestjobs', bestJobs);
        });
    })
    .catch(err => console.log(err));

rp(jobstreet)
    .then((res) => {
        const $ = cheerio.load(res);

        $('.panel-body').each((i, elem) =>{
            const jobstreet = {
                title: $(elem).find('.position-title-link h2').text(),
                position: $(elem).find('.job-location span').text(),
                url: $(elem).find('.position-title-link').attr('href'),
            };
            close('jobstreet', jobstreet);
        });
    })
    .catch(err => console.log(err));


