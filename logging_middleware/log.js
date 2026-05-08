import axios from "axios";

export async function Log(stack,level,pkg,message,token){
    try {
        const response=await axios.post("http://4.224.186.213/evaluation-service/logs",{
            stack,
            level,
            package:pkg,
            message,
        },{
            headers:{
                Authorization:`Bearer ${token}`
            }
        })
        console.log(`${response.data.logID} :   ${response.data.message}`);
    } catch (error) {
        console.log("error")
        console.log(error.response.data);
    }
}