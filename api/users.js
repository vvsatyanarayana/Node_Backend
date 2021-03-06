const { Router } = require("express");
const { PhoneOtp } = require("../models/reg");
const jwt = require('jsonwebtoken')
const { User} = require("../models/user");
const auth = require("./auth");
const bcrypt = require('bcryptjs');
const account_check = require("./permission");
const router = Router()

// display user data
router.get("/user",auth,async (req,res)=>{
    res.status(201).send(req.user)
})
// updating user
router.put('/user',auth, async (req,res)=>{
    
})
// listing all users in the office
router.get('/office/users',auth,async (req,res)=>{
    if(!req.account){
        res.status(400).send({error:'account id is required'})
    }
    var v = account_check(req.user.accounts,req.account)
    if(!v){
        res.status(400).send({error:'account not found'})
    }else{
        const users = await User.find({office:req.user.office})
        try{
            res.status(200).json(users)
        }catch(e){
            res.status(500).json(e)
        }
    }
})

// listing all users in the account
router.get('/account/users',auth,async (req,res)=>{
    
    if(!req.account){
        res.status(400).send({error:'account id is required'})
    }
    var v =await account_check(req.user.accounts,req.account)
    if(!v){
        res.status(400).send({error:'account not found'})
    }else{
        try{
            const users = await User.find({accounts:req.account})
            res.status(200).json(users)
        }catch(e){
            res.status(500).json(e)
        }
    }
})

// adding new users in account
router.post('/account/users',auth,async (req,res)=>{
    if(!req.account){
        res.status(400).send({error:'account id is required'})
    }
    var v = account_check(req.user.accounts,req.account)
    if(!v){
        res.status(400).send({error:'account not found'})
    }else{
        const user = new User(req.body)
        user.password="finance"
        user.office=req.user.office
        if(!req.body.is_staff)
            user.accounts=req.account
        try{
            await user.save()
            res.status(201).json(user);
        }catch(e){
            res.status(500).json(e);
        }
    }
})
// updating users in the office
router.put('/users/:id',auth, async (req,res)=>{
    if(!req.account){
        res.status(400).send({error:'account id is required'})
    }
    var v = account_check(req.user.accounts,req.account)
    if(!v){
        res.status(400).send({error:'account not found'})
    }else{
        const _id = req.params.id
        try{
            User.findByIdAndUpdate({_id:_id},req.body,(err,doc)=>{
                console.log(doc)
            })
            res.status(201).send({success:'user updated'})
        }catch(e){
            res.status(500).send(e)
        }
    }
})
//deleting users
router.delete('/users/:id',auth, async (req,res)=>{
    if(!req.account){
        res.status(400).send({error:'account id is required'})
    }
    var v = account_check(req.user.accounts,req.account)
    if(!v){
        res.status(400).send({error:'account not found'})
    }else{
        const _id = req.params.id
        try{
            await User.remove({_id:_id})
            res.status(201).json({success:'user deleted'})
        }catch(e){
            res.status(500).json(e)
        }
    }

})
router.post("/fin/register",async (req,res)=>{
    console.log(req.body)
    // const phoneverify = await PhoneOtp.findOne({userphone:req.body.userphone})
    const user =new User(req.body)
    try{
        // if(!phoneverify){
        //     res.send('you need to verify your mobile');
        // }
        // else{
        //     if(!phoneverify.verify)
        //         res.send('you need to verify otp')
        //     else{
        //         const token = jwt.sign({_id:user._id.toString()},'this is basic encryption')
        //         user.tokens = user.tokens.concat({token})
        //         await user.save()
        //         res.send(user)
        //     }
        // }
        await user.save()
        const token = await user.generateToken()
        // const userObject = await user.removeObjects()
        res.send({user,token})
    }catch(e){
        res.status(400).send(e)
    }
    // res.json(msg)
})
// router.post('/account',async (req,res)=>{
    
// })
router.post('/fin/login',async (req,res)=>{
    console.log(req.body)
    const user = await User.findOne({userphone:req.body.userphone})
    if(user){
        try{
            const check =await bcrypt.compare(req.body.password,user.password)
            if(!check){
                res.status(400).send({error:"Wrong password"})
            }
            else{
                const token =await user.generateToken()
                res.send({user,token})
            }
        }catch(e){
            res.send(e)
        }
    }else{
        res.status(400).send({error:'wrong userphone or password'})
    }
})
module.exports = router