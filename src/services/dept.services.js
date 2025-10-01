import prisma from "../../prismaClient.js"

export async function getDepartments() {

  try{

    const departments = await prisma.department.findMany({
        select:{department_id:true,
                department_name:true
        },
        orderBy:{department_id:"asc"}
    })

    if(departments.length === 0) throw new Error("NO DEPARTMENTS")

    return departments
  }catch(err){
    throw err
  }  
    
}