const { RDS } = require('aws-sdk')
const jwt = require('jsonwebtoken')
const pool = require('../database/dbConfig')

exports.checkUserInDb=(req, res, next)=>{
    const {username} = req.body
    const userSql = "SELECT user_id, password, admin FROM users WHERE username=?"
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
                req.body.admin = result[0].admin
                next()
            }
        })
    })
}

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

exports.signout=(req, res)=>{
    const usertoken = req.headers.authorization
    if(!usertoken) return res.status(401).json({msg:'no current session'})
    const {user_id} = jwt.decode(usertoken)
    if(!user_id) return res.status(401).json({msg:'no current session'})
    const delSql="UPDATE users SET refresh_token=null WHERE user_id=?"
    pool.getConnection((err, connection)=>{
        if(err) return res.status(500).json({msg:'server error deleting session tokens'})
        connection.query(delSql,[user_id], (err)=>{
            connection.release()
            if(err) return res.status(401).json({msg:'database error deleting session tokens'})
            res.status(200).json({msg:'successfully logged out'})
        })
    })
}