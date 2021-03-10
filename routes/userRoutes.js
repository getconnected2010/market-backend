const express = require('express')
const router = express.Router()
const JWT = require('../utility/jwt')
const password = require('../utility/password')
const UC = require('../controller/userController')

//change password
router.post('/change', JWT.verifyUser, UC.checkUserInDb, password.check, password.hash, UC.changePass)
//reset
router.post('/reset', UC.checkUserInDb, password.hash, UC.resetPass)
//signin route
router.post('/signin', UC.checkUserInDb, password.check, JWT.sign)
//signout route
router.get('/signout', UC.signout)
//sign up route
router.post('/signup', UC.usernameAvailable, password.hash, UC.signup)


module.exports=router;