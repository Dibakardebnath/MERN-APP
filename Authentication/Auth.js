var jwt = require('jsonwebtoken');


const Auth=(req,res,next)=>{
    const token=req.headers.authorization?.split(" ")[1];
//  console.log(token);
    if(!token){
        res.status(401).send("Login first ")
    }else{
        jwt.verify(token, 'Dibakar',async function(err, decoded) {
           if(err){
            res.status(500).send("password is incorrect")
           }else{
           
            const user_id=decoded.user_id
            req.user_id=user_id
            
            next()
           }
          });
    }
}
module.exports = {Auth}