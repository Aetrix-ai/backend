import { Router } from "express"
export const UserRouter = Router()

UserRouter.post("/signup" , (req,res)=>{
    res.send("User Registered")
})

UserRouter.post("/signin" , (req,res)=>{
    res.send("User Logged In")
})

UserRouter.get("/profile" , (req,res)=>{
    res.send("User Profile")
})

UserRouter.put("/profile" , (req,res)=>{
    res.send("User Profile Updated")
})