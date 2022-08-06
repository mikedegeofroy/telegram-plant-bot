// Interaction with the API

import fetch from 'node-fetch';
import mongoose from 'mongoose'

let dbURI = 'mongodb://127.0.0.1:27017/Orders'

var OrderSchema = new mongoose.Schema({
    posting_number: { type: String, unique: true },
    name: { type: String, required: false },
    email: { type: String, required: false },
    phone: { type: String, required: false }
}, { collection: "people" });

let orders = mongoose.model("people", OrderSchema);

mongoose.connect(dbURI, { useUnifiedTopology: true, useNewUrlParser: true }, error => {
    if (!error) {
        console.log("Connected to db")
    } else {
        console.log(error)
    }
})

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
            orders.create({posting_number: element.posting_number}, (err, result) =>{
                if(err){
                    console.log(err);
                } else {
                    console.log(result);
                }
            });
            // console.log(element.posting_number, element.analytics_data.region)
        })
    })
    .catch(err => console.error('error:' + err));
    
    // const Cat = mongoose.model('Cat', { name: String });
    
    // const kitty = new Cat({ name: 'Zildjian' });
    // kitty.save().then(() => console.log('meow'));