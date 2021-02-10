const pool = require('../database/dbConfig')

exports.signup=(req, res)=>{
    const {username, hashedPass, pet} = req.body
    const signupSql= "INSERT INTO users (username, password, pet) values(?,?,?)"
    pool.getConnection((err, connection)=>{
        if(err) return res.status(500).json({msg:'server error connecting to db'})
        connection.query(signupSql, [username, hashedPass, pet], (err, result)=>{
            connection.release()
            if(err) return res.status(500).json({msg:'database error signing up'})
            if(result.affectedRows===1) return res.status(200).json({msg:'successfully signed up'})
            res.status(500).json({msg:'database error signing up'})
        })
    })
}

exports.checkUserInDb=(req, res, next)=>{
    const {username} = req.body
    const userSql = "SELECT user_id, password FROM users WHERE username=?"
    pool.getConnection((err, connection)=>{
        if(err) return res.status(500).json({msg:'server error verifying username'})
        connection.query(userSql, [username], (err, result)=>{
            connection.release()
            if(err) return res.status(500).json({msg:'database error verifying username'})
            if(result.length===0) return res.status(401).json({msg:'not a registered username'})
            if(result.length>1) return res.status(401).json({msg:'illegal attempt'})
            if(result.length===1){
                req.body.user_id= result[0].user_id
                req.body.dbPassword = result[0].password
                next()
            }
        })
    })
}