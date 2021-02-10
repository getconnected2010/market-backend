const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const userRoutes = require('./routes/userRoutes')
const marketRoutes = require('./routes/marketRoutes')

app.use(cors())
app.use(bodyParser.json())

app.use((req, res, next)=>{
    res.header({'Access-Control-Expose-Headers' : 'userToken'}) //allows front end to access 'userToken' header
    next()
})

//user routes
app.use('/user', userRoutes)
//market routes
app.use('/market', marketRoutes)

const PORT = process.env.PORT || 8000
app.listen(PORT, ()=>{
    console.log(`listening on port ${PORT}`)
})