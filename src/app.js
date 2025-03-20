require('dotenv').config()
const express = require('express')
const path = require('path');
const morgan = require('morgan')
const { default: helmet } = require('helmet')
const compression = require('compression')
const cors = require('cors')

const app = express()

// init middleware

app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')))
app.use(express.json())
app.use(
    express.urlencoded({
        extended: true,
    })
)

app.use(morgan('dev'))
app.use(helmet())
app.use(compression())

// CORS configuration
app.use(cors({
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
}))

require('./dbs/init.mongodb')
require('./dbs/init.redis')

app.use('/api', require('./routes'))

app.use((req, res, next) => {
    const error = new Error('Router Not found!')
    error.status = 404
    next(error)
})

app.use((error, req, res, next) => {
    const statusCode = error.status || 500
    return res.status(statusCode).json({
        status: 'error',
        code: statusCode,
        message: error.message || 'Internal Server Error',
        // stack: error.stack,
    })
})

module.exports = app
