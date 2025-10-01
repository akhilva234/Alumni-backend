import express from 'express'
import authRoutes from './src/routes/authRoutes.js'
import testRoute from './src/routes/testRoutes.js'
import userRoutes from './src/routes/userRoutes.js'
import deptRoutes from './src/routes/departmentRoutes.js'
import courseRoutes from './src/routes/courseRoutes.js'
import degreeRoutes from './src/routes/degreeRoutes.js'
import industryRoutes from './src/routes/industryRoutes.js'
import cors from "cors";

const app =  express()


const PORT = process.env.PORT || 5000

//middleware
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

//endpoints

app.use('/auth',authRoutes)
app.use('/profile',userRoutes)
app.use('/department',deptRoutes)
app.use('/courses',courseRoutes)
app.use('/degree',degreeRoutes)
app.use('/industries',industryRoutes)

//testing middleware
//app.use('/test',testRoute)

// App listening

app.listen(PORT,()=>{

    console.log(`Server running on ${PORT}`)
})