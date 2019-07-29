const rp = require('request-promise');
const cheerio = require('cheerio');
const connection = require('./db');

const url = 'https://www.onlinejobs.ph/workers';

connection.connect((err) => {
    if (err) console.log('Error connecting to database');
    console.log('Connection established');
});
rp(url)
    .then((res) => {
        const $ = cheerio.load(res);

        $('.latest-job-post h4').each((i, elem) =>{
            const onlineJob = {
                title: $(elem).text(),
                position: ''
            };

            connection.query('INSERT INTO onlinejobs SET ?', onlineJob, (err, response) => {
                if (err) throw err;
                console.log('Last insert ID: ', response.insertId);
            });
        });
        connection.end();
    })
    .catch(err => console.log(err));
