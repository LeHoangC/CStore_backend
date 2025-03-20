const app = require('./src/app')

const PORT = 3000

const server = app.listen(PORT, () => {
    console.log(`WSV ecommerce start with post ${PORT}`)
})
