const pool = require('../database/dbConfig')

exports.newPost = (req, res)=>{
    let {user_id, catagory, title, description, image1, image2, image3, image4, contact, email} = req.body
    image1===undefined? image1=null: image1;
    image2===undefined? image2=null: image2;
    image3===undefined? image3=null: image3;
    image4===undefined? image4=null: image4;
    email===undefined? email=null: email;
    const uploadSql = "INSERT INTO posts (user_id, catagory, title, description, image1, image2, image3, image4, contact, email) Values(?,?,?,?,?,?,?,?,?,?)"
    pool.getConnection((err, connnection)=>{
        if(err) return res.status(500).json({msg:'server error posting to classifieds'})
        connnection.query(uploadSql, [user_id, catagory, title, description, image1, image2, image3, image4, contact, email], (err)=>{
            connnection.release()
            if(err) return res.status(500).json({msg:'database error posting to classifieds'})
            res.status(200).json({msg:'successfully posted to classifieds'})
        })
    })
}