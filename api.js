// Interaction with the API

// const fetch = require('node-fetch');

import fetch from 'node-fetch';

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

fetch(url, options)
    .then(res => res.json())
    .then(json => {
        json.result.forEach( (element) => {
            console.log(element)
            // console.log(element.posting_number, element.analytics_data.region)
        })
    })
    .catch(err => console.error('error:' + err));

