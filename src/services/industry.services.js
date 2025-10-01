import prisma from "../../prismaClient.js";

export async function getIndustry() {

    try{
        const industries = await prisma.industry.findMany({
            select:{
                industry_id:true,
                industry_name:true
            },
            orderBy:{
                industry_id:"asc"
            }
        })
        if(industries.length === 0) throw new Error("NO_INDUSTRIES")
        
        return industries    
    }catch(err){
        throw err
    }
    
}