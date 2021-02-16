const pool = require('../database/dbConfig')

exports.getList = (req, res)=>{
    const {catagory} = req.params
    const fetchSql = "SELECT post_id, user_id, title, description, image1, image2, image3, image4, contact FROM posts WHERE catagory=?"
    pool.getConnection((err, connection)=>{
        if(err) return res.status(500).json({msg:`server error fetching items in ${catagory} catagory.`})
        connection.query(fetchSql, [catagory], (err, result)=>{
            if(err) return res.status(500).json({msg:`database error fetching items in ${catagory} catagory`})
            res.status(200).json(result)
        })
    })
}

exports.getPics = (req, res)=>{
    const picsSql = "SELECT image1 FROM posts WHERE image1 IS NOT NULL LIMIT 10"
    pool.getConnection((err, connection)=>{
        if(err) return res.status(500).json({msg:'server error fetcing pictures'})
        connection.query(picsSql, (err, result)=>{
            connection.release()
            console.log(err)
            if(err) return res.status(500).json({msg:'database error fetching pictures'})
            res.status(200).json(result)
        })
    })
}

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