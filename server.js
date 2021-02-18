const express = require("express")
const cors = require("cors")

const app = express()
app.use(cors())
app.use(express.json())

const port = process.env.PORT || 5000

const studentsRouter = require("./routes/students")
const mentorsRouter = require("./routes/mentors")

app.use("/",express.static("public"))
app.use("/api",studentsRouter)
app.use("/api",mentorsRouter)

app.listen(port,()=>{
    console.log("Server running on: http://localhost:"+port)
})
