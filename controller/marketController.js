const pool = require('../database/dbConfig')
const nodeMailer = require('nodemailer')
const { post } = require('../routes/marketRoutes')
//const template = require('../utility/template')

exports.deletePost=(req, res)=>{
    const post_id = req.params.post_id
    const delSql= "DELETE FROM posts WHERE post_id=?"
    pool.getConnection((err, connection)=>{
        if(err) return res.status(500).json({msg:'Server error deleting post'})
        connection.query(delSql, [post_id], (err)=>{
            connection.release()
            if(err) return res.status(500).json({msg:'Database error deleting post'})
            res.status(200).json({msg:'Successfully deleted post.'})
        })
    })

}

exports.emailSeller=(req, res)=>{
    const {dbEmail, dbTitle, message} = req.body
    const transporter = nodeMailer.createTransport({
        service:'outlook',
        auth:{
            user: process.env.NODEMAILER_USER,
            pass: process.env.NODEMAILER_PASS
        }
    })
    const options = {
        from:'mysmallmarket@outlook.com',
        to: dbEmail,
        subject:'buyer inquiry to a post on Market',
        html: `<div>${message}</div>
                <div><u><b>This is unmonitored email inbox. Please contact seller directly.</b></u></div>
                <div>${dbTitle}</div>`
    }
    transporter.sendMail(options, (err, info)=>{
        if(err) return res.status(500).json({msg:'server error contacting seller'})
        if(info.rejected.length===0) return res.status(200).json({msg:'message successfully sent to seller'})
        res.status(403).json({msg:'message rejected by seller email address'})
    })
}

exports.fetchPostDetails=(req, res, next)=>{
    const post_id = req.body.post_id || req.params.post_id
    const {keepPic} = req.body
    let detailSql;
    //for update post route, this will determine to get image details from database
    keepPic==='false' ?
    detailSql= "SELECT user_id FROM posts WHERE post_id=?"
    :
    detailSql= "SELECT user_id, email, title, image1, image2, image3, image4 FROM posts WHERE post_id=?"
    pool.getConnection((err, connection)=>{
        if(err) return res.status(500).json({msg:'sever error contacting seller'})
        connection.query(detailSql, [post_id], (err, result)=>{
            connection.release()
            if(err) return res.status(500).json({msg:'database error contacting seller'})
            if(result.length===0) return res.status(403).json({msg:"Post couldn't be found in database."})
            req.body.dbUser_id = result[0].user_id
            req.body.dbEmail = result[0].email
            req.body.dbTitle = result[0].title
            req.body.image1 = result[0].image1
            req.body.image2 = result[0].image2
            req.body.image3 = result[0].image3
            req.body.image4 = result[0].image4
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
            const fetchSql = "SELECT post_id, catagory, title, description, price, image1, image2, image3, image4, contact FROM posts WHERE catagory=? order by post_id desc"
            connection.query(fetchSql, [catagory], (err, result)=>{
                if(err) return res.status(500).json({msg:`database error fetching items in ${catagory} catagory`})
                res.status(200).json(result)
            })
        }else{
            //fetch list of last 10 recent posts for home page initial list
            const fetchSql = "SELECT post_id, catagory, title, description, price, image1, image2, image3, image4, contact FROM posts order by post_id desc LIMIT 10"
            connection.query(fetchSql, (err, result)=>{
                connection.release()
                if(err) return res.status(500).json({msg:'database error fetching pictures'})
                res.status(200).json(result)
            })
        }
    })
}

exports.myPosts = (req, res)=>{
    const {user_id} = req.body
    const myPostSql =  "SELECT post_id, user_id, catagory, title, description, price, contact, email, image1, image2, image3, image4 FROM posts WHERE user_id=? order by post_id desc"
    pool.getConnection((err, connection)=>{
        if(err) return res.status(500).json({msg:'server error fetching your posts'})
        connection.query(myPostSql, [user_id], (err, result)=>{
            connection.release()
            if(err) return res.status(500).json({msg:'database error fetching your posts'})
            res.status(200).json(result)
        })
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
    const searchSql= "SELECT post_id, catagory, title, description, price, image1, image2, image3, image4, contact FROM posts WHERE title LIKE ? order by post_id desc"
    pool.getConnection((err, connection)=>{
        if(err) return res.status(500).json({msg:'server error searching keyword'})
        connection.query(searchSql,[`%${criteria}%`],(err, result)=>{
            if(err) return res.status(500).json({msg:'database error searching keyword'})
            connection.release()
            res.status(200).json(result)
        })
    })
}

exports.updatePost = (req, res)=>{
    let {post_id, catagory, title, description, image1, image2, image3, image4, price, contact, email, keepPic} = req.body
    image1===undefined? image1=null: image1;
    image2===undefined? image2=null: image2;
    image3===undefined? image3=null: image3;
    image4===undefined? image4=null: image4;
    email===undefined? email=null: email;
    price? price: price=null
    //ternary opeator to check if old pics are kept or new one's have been uploaded to aws
    keepPic==='true'?
    pool.getConnection((err, connection)=>{
        if(err) return res.status(500).json({msg:'Server error updating post. Please try again. Note: if old post had images, they have been deleted.'})
        const updateSql = "UPDATE posts SET catagory=?, title=?, description=?, price=?, contact=?, email=? where post_id=?"
        connection.query(updateSql, [catagory, title, description, price, contact, email, post_id], (err)=>{
            connection.release()
            if(err) return res.status(500).json({msg:'Database error updating post. Please try again. Note: if old post had images, they have been deleted.'})
            res.status(200).json({msg:'post has been successfully updated'})
        })
    })
    :
    pool.getConnection((err, connection)=>{
        if(err) return res.status(500).json({msg:'Server error updating post. Please try again. Note: if old post had images, they have been deleted.'})
        const updateSql = "UPDATE posts SET catagory=?, title=?, description=?, image1=?, image2=?, image3=?, image4=?, price=?, contact=?, email=? where post_id=?"
        connection.query(updateSql, [catagory, title, description, image1, image2, image3, image4, price, contact, email, post_id], (err)=>{
            connection.release()
            if(err) return res.status(500).json({msg:'Database error updating post. Please try again. Note: if old post had images, they have been deleted.'})
            res.status(200).json({msg:'post has been successfully updated'})
        })
    })
}