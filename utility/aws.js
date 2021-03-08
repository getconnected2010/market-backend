const AWS = require('aws-sdk')

const s3= new AWS.S3({
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
})

exports.delete = async(req, res, next)=>{
    try {
        const {image1, image2, image3, image4, keepPic} = req.body
        if(keepPic==='true') return next()
        let delArr = []
        if(image1) delArr.push(image1)
        if(image2) delArr.push(image2)
        if(image3) delArr.push(image3)
        if(image4) delArr.push(image4)
        for(const file of delArr){
            const keyArr = file.split('/')
            const key = keyArr[keyArr.length-1]
            const params ={
                Bucket: process.env.S3_BUCKET,
                Key: key
            }
            await s3.deleteObject(params).promise()
        }
        next()
    } catch (error) {
        res.status(500).json({msg:'error deleting images.'})
    }
}

exports.upload=async (req, res, next)=>{
    try {
        const {user_id, keepPic} = req.body
        if(keepPic==='true') return next()
        const files = req.files
        if(files.length===0) return next()
        let i=1
        for(const file of files){
            const params={
                ACL:'public-read',
                Bucket: process.env.S3_BUCKET,
                Body: file.buffer,
                Key: Date.now()+'.'+user_id
            }
            const result = await s3.upload(params).promise()
            req.body[`image${i}`]= result.Location
            i++
        }
        next()
    } catch (error) {
        console.log(error)
        res.status(500).json({msg:'server error uploading images'})
    }
}