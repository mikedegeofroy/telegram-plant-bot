// Interaction with the API

import mongoose from 'mongoose'

let dbURI = 'mongodb://127.0.0.1:27017/Orders'

mongoose.connect(dbURI, { useUnifiedTopology: true, useNewUrlParser: true }, error => {
    mongoose.connection.db.dropDatabase().then( () => {
        console.log("Cleared!")
    });

    return
})
