const express = require('express')
const router= express.Router()
const multer = require('multer')
const AWS= require('../utility/aws')
const JWT = require('../utility/jwt')
const MC = require('../controller/marketController')
const VAL = require('../utility/validate')
const multerMiddleware= multer()

//list of items
router.get('/list/:catagory', MC.getList)
//message seller
router.post('/message', MC.fetchPostDetails,  MC.emailSeller) 
//post to classifieds route
router.post('/post', multerMiddleware.array('pics'), JWT.verify, VAL.files, AWS.upload, MC.newPost)   
//search listings
router.get('/search/:criteria', MC.searchPosts)

module.exports= router