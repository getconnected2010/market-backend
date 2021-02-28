const fileType = require('file-type')

exports.files=async(req, res, next)=>{
    const files = req.files
    if(!files || files.length===0) return next()
    if(files.length>4) return res.status(403).json({msg:'Maximum of four images allowed.'})
    let fileError=[]
    let allowed = ['img', 'jpg', 'jpeg', 'png', 'image/img', 'image/jpg', 'image/jpeg', 'image/png']
    for(const file of files){
        const type = await fileType.fromBuffer(file.buffer)
        if(!type){
            fileError.push('Invalid type of file detected. Only img, jpg, jpeg and png file types allowed.')
            break
        }
        const {ext, mime} = type
        if(!allowed.includes(ext) || !allowed.includes(mime)){
            fileError.push('Invalid type of file detected. Only img, jpg, jpeg and png file types allowed.')
            break
        }
        if(file.size>2000000){
            fileError.push('Maximum size for each image is 2MB')
        }
    }
    if(fileError.length!==0) return res.status(403).json({msg: fileError[0]})
    next()
}

exports.userIdMatch = (req, res, next)=>{
    try {
        const {dbUser_id, user_id} = req.body
        if(dbUser_id===user_id) return next()
        res.status(403).json({msg:"you don't have access to delete this posting."})
    } catch (error) {
        res.status(500).json({msg:'server error verifying user id'})
    }
}