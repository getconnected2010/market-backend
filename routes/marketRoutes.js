const express = require('express')
const router= express.Router()
const multer = require('multer')
const MC = require('../controller/marketController')

const multerMiddleware= multer()
//post to classifieds route
router.use('/post', multerMiddleware.array('pics'), MC.newPost)   


module.exports= router