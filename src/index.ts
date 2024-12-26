import  express, { Request, Response }  from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const app=express()
app.use(express.json())

const client=new PrismaClient()


app.get("/",(req,res)=>{
    res.json({
        msg:"hello"
    })
})


app.get("/test",async (req, res)=>{
    
    const response=await client.user.findFirst({
        where:{
            id:2
        }
    })

    console.log(response)
    res.json({
        msg:response
    })
})


app.post('/signup',async (req:any,res:any)=>{
    try {
        const {email,username,password,age}=req.body

    const hashedPassword=await bcrypt.hash(password,10)
    const existingUser=await client.user.findFirst({
        where:{
            email:email
        }
    })

    if(existingUser!==null){
        return res.json({
            error:"email already exist"
        })
    }
    await client.user.create({
       data:{
        email,
        password:hashedPassword,
        username,
        age
       }
    })
   res.json({
    msg:"your are signedup successfully"
   })
    } catch (error:any) {
        res.send({
            error:error.message
        })
    }

})

app.post('/signin',async (req:any,res:any)=>{
  try {
    const{email,password}=req.body

    const user=await client.user.findFirst({
        where:{
            email
        }
    })
    if(user===null){
        return res.send({
            error:"email does not exist"
        })
    }
    const matchedPassword=await bcrypt.compare(password,user.password)
    if(!matchedPassword){
        return res.send({
            error:"password does not match"
        })
    }

    const token=jwt.sign({email:user.email},"my_key")
    res.send({
        msg:"login success",
        token
    })
  } catch (error:any) {
    res.send({
        msg:"something went wrong",
        error:error.message
    })
  }
   
})

app.post('/todo',async (req:any,res:any)=>{
 try {
    console.log(req.body)
    const {title,description,done,userId}=req.body
    console.log(title,description,done,userId)
    await client.todo.create({
        data:{
            title,
            description,
            done,
            userId
        }
    })

    res.send({
        msg:"todo created successfully"
    })
 } catch (error:any) {
    res.send({
        error:error.message
    })
 }

})


app.get("/todos",async (req:any,res:any)=>{
   
    const id=req.params.id
    const response=await client.todo.findMany({
        where:{
            userId:2
        },
        select:{
            user:true,
           
            title:true,
            description:true
        }
    })
    res.send({
        todos:response
    })
})

app.put('/todo',async(req:any,res:any)=>{
   try {
    const {id}=req.body
    console.log(id)
    const {description,done}=req.body
    await client.todo.update({
       where:{
        id:id
       },
       data:{
        done,
        description
       }
    })
    res.send({
        msg:"Todo updated successfully"
    })
   } catch (error:any) {
    res.send({
        error:error.message
    })
   }
})


app.listen(3000,()=>{
    console.log("server started")
})