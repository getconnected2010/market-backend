const express = require('express')
const router = express.Router()
const JWT = require('../utility/jwt')
const password = require('../utility/password')
const UC = require('../controller/userController')

//signin route
router.post('/signin', UC.checkUserInDb, password.check, JWT.sign)
//signout route
router.get('/signout', UC.signout)
//sign up route
router.post('/signup', password.hash, UC.signup)


module.exports=router;