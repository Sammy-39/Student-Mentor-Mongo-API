const express = require("express")

const mongodb = require("mongodb")
const mongoClient = mongodb.MongoClient
const dbURL = `mongodb://sammy:sammydb@cluster0-shard-00-00.pvarl.mongodb.net:27017,cluster0-shard-00-01.pvarl.mongodb.net:27017,cluster0-shard-00-02.pvarl.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-wb3j6y-shard-0&authSource=admin&retryWrites=true&w=majority`

const router = express.Router()

router.get("/students",async (req,res)=>{
    try{
        let client = await mongoClient.connect(dbURL,{useUnifiedTopology:true})
        let db = client.db("students-mentors-db")
        let studentsData = await db.collection("studentsCol").find().toArray()
        client.close()
        res.status(200).json(studentsData)
    }
    catch(err){
        res.status(400).json({
            message: err.message
        })
    }
})

router.post("/student", async (req,res)=>{
    try{
        let client = await mongoClient.connect(dbURL,{useUnifiedTopology:true})
        let db = client.db("students-mentors-db")
        let dbData = await db.collection("studentsCol").find().toArray()
        let studentData = {...req.body,...{id:`stud-${dbData.length+1}`}}
        await db.collection("studentsCol").insertOne(studentData)
        client.close()
        res.status(200).json({
            message: "Added 1 entry"
        })
    }
    catch(err){
        res.status(400).json({
            message: err.message
        })
    }
})

router.patch("/student/:id", async (req,res)=>{
    try{
        let client = await mongoClient.connect(dbURL,{useUnifiedTopology: true})
        let db = client.db("students-mentors-db")
        let mentor = await db.collection("mentorsCol").findOne({id:req.body.mentorId})
        let student = await db.collection("studentsCol").findOne({id:`stud-${req.params.id}`})
        if(mentor){
            if(student.mentorId){
                let prevMentor = student.mentorId
                let x = await db.collection("mentorsCol").updateOne({id:prevMentor},{$pull: {"studsId": `stud-${req.params.id}`}})
                console.log(x)
            }
            await db.collection("studentsCol").updateOne({id:`stud-${req.params.id}`},{$set: {"mentorId": req.body.mentorId}})
            if(!mentor.studsId){ 
                await db.collection("mentorsCol").updateOne({id:req.body.mentorId},{$set: {"studsId": []}})
                mentor = await db.collection("mentorsCol").findOne({id:req.body.mentorId})
            }
            if(mentor.studsId.indexOf(`stud-${req.params.id}`)===-1){
                await db.collection("mentorsCol").updateOne({id:req.body.mentorId},{$push: {"studsId": `stud-${req.params.id}`}})
            }
            
            res.status(200).json({
                message : "Mentor assigned to Student and Student added to mentor"
            })
        }
        else{
            throw new Error("Mentor Id not found")
        } 
    }
    catch(err){
        res.status(400).send({
            message: err.message
        })
    }
})

router.delete("/student/:id", async (req,res)=>{
    try{
        let client = await mongoClient.connect(dbURL,{useUnifiedTopology:true})
        let db = client.db("students-mentors-db")
        await db.collection("studentsCol").deleteOne({id:`stud-${req.params.id}`})
        await db.collection("mentorsCol").updateMany({"studsId":`stud-${req.params.id}`},{$pull:{"studsId":`stud-${req.params.id}`}})
        client.close()
        res.status(200).json({
            message: "Delete Success"
        })
    }
    catch(err){
        res.status(400).json({
            message: err.message
        })
    }
})

module.exports = router