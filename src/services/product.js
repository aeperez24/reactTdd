export const saveProduct= async (product)=>  {
    return  fetch("/product",{headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'},method:"post",body:JSON.stringify(product)}).catch((e)=>{
            return{
            status:408
        }})

}