const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const userRoutes = require('./routes/userRoutes')

app.use(cors())
app.use(bodyParser.json())


//user routes
app.use('/user', userRoutes)

const PORT = process.env.PORT || 8000
app.listen(PORT, ()=>{
    console.log(`listening on port ${PORT}`)
})