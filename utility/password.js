const bcrypt = require('bcryptjs')

exports.hash=(req, res, next)=>{
    const {password} = req.body
    const salt =Number(process.env.BCRYPT_SALT)
    bcrypt.hash(password, salt, (err, hashed)=>{
        if(err) return res.status(500).json({msg:'error processing password'})
        req.body.hashedPass= hashed
        next()
    })
}