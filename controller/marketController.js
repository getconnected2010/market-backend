//const multer = require('multer')
//const multerMiddleware= multer()

exports.newPost = (req, res)=>{
    const{email, title, description} = req.body
    const files = req.files
    
}