const jwt = require('jsonwebtoken');
const { User } = require('../models/user');
const auth =async (req,res,next)=>{
    // console.log(account)
    try{
        const token = req.header('Authorization').replace('Bearer ','')
        const decode = jwt.verify(token,'this is basic encryption')
        const user = await User.findOne({_id:decode._id,'tokens.token':token})
        if(!user)
            throw new Error()

        if(req.header('account')){
            const account = req.header('account')
            req.account=account;
        }
        req.token =token
        req.user=user
        next()
    }catch(e){
        res.status(401).json({error:'invalid credentails'})
    }
}

module.exports=auth