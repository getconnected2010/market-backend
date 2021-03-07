const { RDS } = require('aws-sdk')
const jwt = require('jsonwebtoken')
const pool = require('../database/dbConfig')
const { refresh } = require('../utility/jwt')

exports.changePass=(req, res)=>{
    const{hashedPass, username} = req.body
    const changePassSql = "UPDATE users SET password=? WHERE username=?"
    pool.getConnection((err, connection)=>{
        if(err) return res.status(500).json({msg:'Server error changing password. Please try again.'})
        connection.query(changePassSql, [hashedPass, username], (err)=>{
            connection.release()
            if(err) return res.status(500).json({msg:'Database error changing password. Please try again.'})
            res.status(200).json({msg:'Successfully changed password.'})
        })
    })
}

exports.checkUserInDb=(req, res, next)=>{
    const {username} = req.body
    const userSql = "SELECT user_id, password, pet, admin FROM users WHERE username=?"
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
                req.body.dbPet = result[0].pet
                req.body.admin = result[0].admin
                next()
            }
        })
    })
}

exports.resetPass= (req, res)=>{
    const {dbPet, hashedPass, pet, username} = req.body
    if(dbPet!==pet) return res.status(403).json({msg:"Your answer for 'pet name' didn't match our record."})
    const resetSql = "UPDATE users SET password= ? WHERE username=?"
    pool.getConnection((err, connection)=>{
        if(err) return res.status(500).json({msg:'Server error resetting password. Please try again.'})
        connection.query(resetSql, [hashedPass, username], (err, result)=>{
            if(err) return res.status(500).json({msg:'Database error resetting password. Please try again.'})
            res.status(200).json({msg:'Password updated. Please login using new credentials.'})
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

exports.usernameAvailable=(req, res, next)=>{
    const {username} = req.body
    const usernameSql = "SELECT COUNT(*) AS users FROM users WHERE username =?"
    pool.getConnection((err, connection)=>{
        if(err) return res.status(500).json({msg:'Server error checking username availability'})
        connection.query(usernameSql, [username], (err, result)=>{
            connection.release()
            if(err) return res.status(500).json({msg:'Database error checking username availability'})
            if(!result)  return res.status(500).json({msg:'Database error checking username availability'})
            if(result[0].users===0) return next()
            res.status(403).json({msg:'Username not available. Please choose another username.'})
        })
    })
}