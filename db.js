import mongoose from 'mongoose'

let dbURI = 'mongodb://127.0.0.1:27017/Orders'

mongoose.connect(dbURI, { useUnifiedTopology: true, useNewUrlParser: true }, error => {
    if (!error) {
        console.log("Connected to db")
    } else {
        console.log(error)
    }
})

var OrderSchema = new mongoose.Schema({
    posting_number: { type: String, unique: true },
    user_id: { type: Number, unique: true },
    username: { type: String, required: false },
    name: { type: String, required: false },
    email: { type: String, required: false },
    phone: { type: String, required: false }
}, { collection: "people" });

let orders = mongoose.model("people", OrderSchema);

await orders.create({ "user_id": 123122131, "username": undefined})

// orders.create({posting_number: '61575285-0040-1'}, (err, result) =>{
//     if(err){
//         console.log(err);
//     } else {
//         console.log(result);
//     }
// });

// const Cat = mongoose.model('Cat', { name: String });

// const kitty = new Cat({ name: 'Zildjian' });
// kitty.save().then(() => console.log('meow'));


console.log(await orders.find());