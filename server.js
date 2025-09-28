import express from 'express'
import authRoutes from './src/routes/authRoutes.js'
import testRoute from './src/routes/testRoutes.js'
import userRoutes from './src/routes/userRoutes.js'

const app =  express()


const PORT = process.env.PORT || 5000

//middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

//endpoints

app.use('/auth',authRoutes)
app.use('/profile',userRoutes)

//testing middleware
//app.use('/test',testRoute)

// App listening

app.listen(PORT,()=>{

    console.log(`Server running on ${PORT}`)
})