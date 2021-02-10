const express = require('express')
const router = express.Router()
const JWT = require('../utility/jwt')
const password = require('../utility/password')
const UC = require('../controller/userController')

//sign up route
router.post('/signup', password.hash, UC.signup)
router.post('/signin', UC.checkUserInDb, password.check, JWT.sign)

module.exports=router;