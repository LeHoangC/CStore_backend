const app = require('./src/app')
const { closeRedis } = require('./src/dbs/init.redis')

const PORT = 3000

const server = app.listen(PORT, () => {
    console.log(`WSV ecommerce start with post ${PORT}`)
})

process.on('SIGINT', async () => {
    await closeRedis()
    process.exit(0)
})