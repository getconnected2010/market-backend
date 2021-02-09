const express = require('express')
const router = express.Router()
const password = require('../utility/password')
const UC = require('../controller/userController')

//sign up route
router.post('/signup', password.hash, UC.signup)

module.exports=router;