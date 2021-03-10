const jwt= require('jsonwebtoken')
const pool = require('../database/dbConfig')

exports.sign=(req, res, next)=>{
    let {user_id, admin, count} = req.body
    count===undefined? count=0: count;
    try {
        const usertoken = jwt.sign({'user_id' : user_id, 'admin': admin}, process.env.JWT_USER_TOKEN,{
            expiresIn: 60*1
        })
        const refresh_token= jwt.sign({'user_id': user_id, 'admin':admin, 'count': count}, process.env.JWT_REFRESH_TOKEN,{
            expiresIn: 60*45
        })
        const tokenSql ="UPDATE users SET refresh_token=? WHERE user_id=?"
        pool.getConnection((err, connection)=>{
            if(err) return res.status(500).json({msg:'server error with session tokens'})
            connection.query(tokenSql, [refresh_token, user_id], (err)=>{
                connection.release()
                if(err) return res.status(500).json({msg:'database error with session tokens'})
                res.set({'usertoken': usertoken})
                if(count>0) return next()
                res.status(200).json({msg:'welcome'})
            })
        })
    } catch (error) {
        res.status(401).json({msg:'error signing session tokens'})
    }
}

exports.refresh=(req, res, next)=>{
    const usertoken= req.headers.authorization
    const{user_id}= jwt.decode(usertoken)
    const dbTknSql ="SELECT admin, refresh_token FROM users WHERE user_id=?"
    pool.getConnection((err, connection)=>{
        if(err) return res.status(401).json({msg:'server error refreshing your session. Please login'})
        connection.query(dbTknSql, [user_id], (err, result)=>{
            connection.release()
            if(err) return res.status(401).json({msg:'databases error refreshing your session. Please login'})
            if(result.length!==1) return res.status(401).json({msg:'Your session cannot be refreshed. Please login'})
            if(result.length===1){
                const refresh_token=result[0].refresh_token
                if(!refresh_token) return res.status(401).json({msg:'Your session has expired. Please login.'})
                let {count} = jwt.decode(refresh_token)
                if(count>5) return res.status(401).json({msg:'your session has expired and reached a maximum refresh count. Please login using credentials'})
                req.body.count = count+1
                req.body.user_id = user_id
                req.body.admin = result[0].admin
                this.sign(req, res, next)
                return
            }
        })
    })
}

exports.verifyAdmin=(req, res, next)=>{
    const usertoken = req.headers.authorization
    if(!usertoken) return res.status(401).json({msg:'You are not logged in'})
    const {admin} = jwt.decode(usertoken)
    if(admin==='true') return next()
    res.status(401).json({msg:'You do not have admin priviledge.'})
}

exports.verifyUser=(req, res, next)=>{
    const usertoken= req.headers.authorization
    if(!usertoken) return res.status(401).json({msg:'You are not logged in.'})
    jwt.verify(usertoken, process.env.JWT_USER_TOKEN, (err, decoded)=>{
        if(err&&err.name==='TokenExpiredError') return this.refresh(req, res, next)
        if(err) return res.status(401).json({msg:'Server error verifying session token'})
        req.body.user_id = decoded.user_id
        req.body.admin = decoded.admin
        next()
    })
}