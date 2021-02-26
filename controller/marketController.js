const pool = require('../database/dbConfig')
const nodeMailer = require('nodemailer')

exports.emailSeller=(req, res)=>{
    const {email, message} = req.body
    const transporter = nodeMailer.createTransport({
        service:'outlook',
        auth:{
            user: process.env.NODEMAILER_USER,
            pass: process.env.NODEMAILER_PASS
        }
    })
    const options = {
        from:'mysmallmarket@outlook.com',
        to: email,
        subject:'buyer inquiry to a post on Market',
        text: message + '.  ' + "This is an unmonitored inbox. Please don't reply to this email."
    }
    transporter.sendMail(options, (err, info)=>{
        if(err) return res.status(500).json({msg:'server error contacting seller'})
        if(info.rejected.length===0) return res.status(200).json({msg:'message successfully sent to seller'})
        res.status(403).json({msg:'message rejected by seller email server'})
    })
}

exports.fetchPostDetails=(req, res, next)=>{
    const {post_id} = req.body
    const detailSql= "SELECT email FROM posts WHERE post_id=?"
    pool.getConnection((err, connection)=>{
        if(err) return res.status(500).json({msg:'sever error contacting seller'})
        connection.query(detailSql, [post_id], (err, result)=>{
            connection.release()
            if(err) return res.status(500).json({msg:'database error contacting seller'})
            req.body.email= result[0].email
            next()
        })
    })
}

exports.getList = (req, res)=>{
    const {catagory} = req.params
    pool.getConnection((err, connection)=>{
        if(err) return res.status(500).json({msg:`server error fetching items in ${catagory} catagory.`})
        //fetch list from a specific catagory
        if(catagory!=='undefined'){
            const fetchSql = "SELECT post_id, user_id, title, description, price, image1, image2, image3, image4, contact FROM posts WHERE catagory=? order by post_id desc"
            connection.query(fetchSql, [catagory], (err, result)=>{
                if(err) return res.status(500).json({msg:`database error fetching items in ${catagory} catagory`})
                res.status(200).json(result)
            })
        }else{
            //fetch list of last 10 recent posts for home page initial list
            const fetchSql = "SELECT post_id, user_id, title, description, price, image1, image2, image3, image4, contact FROM posts order by post_id desc LIMIT 10"
            connection.query(fetchSql, (err, result)=>{
                connection.release()
                if(err) return res.status(500).json({msg:'database error fetching pictures'})
                res.status(200).json(result)
            })
        }
    })
}

exports.newPost = (req, res)=>{
    let {user_id, catagory, title, description, image1, image2, image3, image4, price, contact, email} = req.body
    image1===undefined? image1=null: image1;
    image2===undefined? image2=null: image2;
    image3===undefined? image3=null: image3;
    image4===undefined? image4=null: image4;
    email===undefined? email=null: email;
    price? price: price=null
    const uploadSql = "INSERT INTO posts (user_id, catagory, title, description, image1, image2, image3, image4, price, contact, email) Values(?,?,?,?,?,?,?,?,?,?,?)"
    pool.getConnection((err, connnection)=>{
        if(err) return res.status(500).json({msg:'server error posting to classifieds'})
        connnection.query(uploadSql, [user_id, catagory, title, description, image1, image2, image3, image4, price, contact, email], (err)=>{
            connnection.release()
            if(err) return res.status(500).json({msg:'database error posting to classifieds'})
            res.status(200).json({msg:'successfully posted to classifieds'})
        })
    })
}

exports.searchPosts = (req, res)=>{
    const {criteria} = req.params
    const searchSql= "SELECT post_id, user_id, title, description, price, image1, image2, image3, image4, contact FROM posts WHERE title LIKE ? order by post_id desc"
    pool.getConnection((err, connection)=>{
        if(err) return res.status(500).json({msg:'server error searching keyword'})
        connection.query(searchSql,[`%${criteria}%`],(err, result)=>{
            if(err) return res.status(500).json({msg:'database error searching keyword'})
            connection.release()
            res.status(200).json(result)
        })
    })
}