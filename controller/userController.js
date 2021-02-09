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