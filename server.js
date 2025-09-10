import express from 'express'
import authRoutes from './src/routes/authRoutes.js'

const app =  express()


const PORT = process.env.PORT || 5000

//middleware
app.use(express.json())

//endpoints

app.use('/auth',authRoutes)

// App listening

app.listen(PORT,()=>{

    console.log(`Server running on ${PORT}`)
})