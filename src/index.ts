import express from "express"
import cors from 'cors'
import { Config } from "./config"


const app = express()
app.use(cors())
app.use(express.json())
const config = Config.getInstance()

app.listen(config.PORT ,()=>{
    console.log("Server is running on PORT:" , config.PORT)
})