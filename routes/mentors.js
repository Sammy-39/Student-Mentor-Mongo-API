const express = require("express")

const mongodb = require("mongodb")
const mongoClient = mongodb.MongoClient
const dbURL = `mongodb://sammy:sammydb@cluster0-shard-00-00.pvarl.mongodb.net:27017,cluster0-shard-00-01.pvarl.mongodb.net:27017,cluster0-shard-00-02.pvarl.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-wb3j6y-shard-0&authSource=admin&retryWrites=true&w=majority`

const router = express.Router()

router.get("/mentors",async (req,res)=>{
    try{
        let client = await mongoClient.connect(dbURL,{useUnifiedTopology:true})
        let db = client.db("students-mentors-db")
        let mentorsData = await db.collection("mentorsCol").find().toArray()
        client.close()
        res.status(200).json(mentorsData)
    }
    catch(err){
        res.status(400).json({
            message: err.message
        })
    }
})

router.get("/mentor/:id", async (req,res)=>{
    try{
        let client = await mongoClient.connect(dbURL,{useUnifiedTopology:true})
        let db = client.db("students-mentors-db")
        let mentorData = await db.collection("mentorsCol").findOne({id:`ment-${req.params.id}`})
        client.close()
        res.status(200).json(mentorData)
    }
    catch(err){
        res.status(400).json({
            message: err.message
        })
    }
})

router.post("/mentor", async (req,res)=>{
    try{
        let client = await mongoClient.connect(dbURL,{useUnifiedTopology:true})
        let db = client.db("students-mentors-db")
        let dbData = await db.collection("mentorsCol").find().toArray()
        let mentorData = {...req.body,...{id:`ment-${dbData.length+1}`}}
        await db.collection("mentorsCol").insertOne(mentorData)
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

router.patch("/mentor/:id", async (req,res)=>{
    try{
        let client = await mongoClient.connect(dbURL,{useUnifiedTopology:true})
        let db = client.db("students-mentors-db")
        req.body.studsId.forEach( async (studId,idx)=>{
            let student = await db.collection("studentsCol").findOne({id:studId})
            let mentor = await db.collection("mentorsCol").findOne({id:`ment-${req.params.id}`})
            if(student){
                if(!mentor.studsId){
                    await db.collection("mentorsCol").updateOne({id:`ment-${req.params.id}`},{$set: {"studsId":[]}})
                }
                else if(mentor.studsId.indexOf(studId)===-1){
                    await db.collection("mentorsCol").updateOne({id:`ment-${req.params.id}`},{$push: {"studsId":studId}})
                    await db.collection("studentsCol").updateOne({id:studId},{$set: {"mentorId":`ment-${req.params.id}`}})
                } 
            }
        })
        res.status(200).json({
            message : "Patch Success"
        })
    }
    catch(err){
        res.status(400).json({
            message: err.message
        })
    }
})

router.delete("/mentor/:id", async (req,res)=>{
    try{
        let client = await mongoClient.connect(dbURL,{useUnifiedTopology:true})
        let db = client.db("students-mentors-db")
        await db.collection("mentorsCol").deleteOne({id:`ment-${req.params.id}`})
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