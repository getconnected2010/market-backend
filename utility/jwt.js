const jwt= require('jsonwebtoken')

exports.sign=(req, res)=>{
    const {user_id} = req.body
    try {
        const usertoken = jwt.sign({'user_id' : user_id}, process.env.JWT_USER_TOKEN,{
            expiresIn: 60*30
        })
        res.set({'usertoken': usertoken})
        res.status(200).json({msg:'welcome'})
    } catch (error) {
        res.status(401).json({msg:'error signing session tokens'})
    }
}

exports.verify=(req, res, next)=>{
    const usertoken= req.headers.authorization
    if(!usertoken) return res.status(401).json({msg:'you are not logged in.'})
    jwt.verify(usertoken, process.env.JWT_USER_TOKEN,(err, decoded)=>{
        if(err) return res.status(401).json({msg:'server error verifying session token'})
        req.body.user_id = decoded.user_id
        next()
    })
}