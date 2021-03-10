const express = require('express')
const router= express.Router()
const multer = require('multer')
const AWS= require('../utility/aws')
const JWT = require('../utility/jwt')
const MC = require('../controller/marketController')
const VAL = require('../utility/validate')
const multerMiddleware= multer()
//admin delete post
router.delete('/admin/:post_id', JWT.verifyAdmin, JWT.verifyUser, MC.fetchPostDetails, AWS.delete, MC.deletePost)
//delete post
router.delete('/:post_id', JWT.verifyUser, MC.fetchPostDetails,  VAL.userIdMatch, AWS.delete, MC.deletePost)
//list of items
router.get('/list/:catagory', MC.getList)
//message seller
router.post('/message', MC.fetchPostDetails,  MC.emailSeller) 
//my posts
router.get('/myposts', JWT.verifyUser, MC.myPosts)
//post to classifieds route
router.post('/post', multerMiddleware.array('pics'), JWT.verifyUser, VAL.files, AWS.upload, MC.newPost)   
//search listings
router.get('/search/:criteria', MC.searchPosts)
//update post
router.post('/update', multerMiddleware.array('pics'), JWT.verifyUser, MC.fetchPostDetails, VAL.userIdMatch, VAL.files, AWS.delete, AWS.upload, MC.updatePost)

module.exports= router