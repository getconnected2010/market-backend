const jwt= require('jsonwebtoken')

exports.sign=(req, res)=>{
    const {user_id} = req.body
    try {
        const userToken = jwt.sign({'user_id' : user_id}, process.env.JWT_USER_TOKEN,{
            expiresIn: 60*30
        })
        res.set({'usertoken': userToken})
        res.status(200).json({msg:'welcome'})
    } catch (error) {
        res.status(500).json({msg:'error signing session tokens'})
    }
}