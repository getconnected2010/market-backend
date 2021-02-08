const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')

app.use(cors())
app.use(bodyParser.json())

app.get('/', (req, res)=>{
    res.send('hello world')
})

const PORT = process.env.PORT || 8000
app.listen(PORT, ()=>{
    console.log(`listening on port ${PORT}`)
})