const mongoose = require('mongoose')
mongoose.set('strictQuery', true)
mongoose.set('debug', true)
mongoose.set('debug', { color: true })

const connectString = `mongodb://localhost:27017/cstore`
// const connectString = process.env.URL_MONGODB

class Database {
    constructor() {
        this.connect()
    }
    connect() {
        mongoose
            .connect(connectString)
            .then((_) => {
                console.log('Connected success')
            })
            .catch((err) => console.log(`Error Connect ${err}`))
    }
    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database()
        }

        return Database.instance
    }
}

const instanceMongodb = Database.getInstance()

module.exports = instanceMongodb
