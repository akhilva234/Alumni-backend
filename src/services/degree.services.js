import prisma from "../../prismaClient.js";

export async function getDegree() {
    
    try{
        const degrees = await prisma.degree.findMany({
            select:{
                degree_id:true,
                degree_name:true
            },
            orderBy:{
                degree_id:"asc"
            }
        })
        if(degrees.length === 0) throw new Error("NO DEGREES")

        return degrees    

    }catch(err){
        
        throw err

    }
}