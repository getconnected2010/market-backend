const bcrypt = require('bcryptjs')

exports.check= (req, res, next)=>{
    const {password, dbPassword} = req.body
    bcrypt.compare(password, dbPassword, (err, same)=>{
        if(err) return res.status(500).json({msg:'server error verifying password'})
        if(same) return next()
        res.status(401).json({msg:'wrong password'})
    })
}

exports.checkOldPass=(req, res, next)=>{
    const{dbPassword, oldPassword} = req.body
    bcrypt.compare(oldPassword, dbPassword, (err, same)=>{
        if(err) return res.status(500).json({msg:'server error verifying password'})
        if(same) return next()
        res.status(401).json({msg:'wrong password'})
    })
}

exports.hash=(req, res, next)=>{
    const {password} = req.body
    const salt =Number(process.env.BCRYPT_SALT)
    bcrypt.hash(password, salt, (err, hashed)=>{
        if(err) return res.status(500).json({msg:'error processing password'})
        req.body.hashedPass= hashed
        next()
    })
}