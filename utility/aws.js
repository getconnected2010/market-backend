const AWS = require('aws-sdk')

const s3= new AWS.S3({
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
})

exports.upload=async (req, res, next)=>{
    try {
        const {user_id} = req.body
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