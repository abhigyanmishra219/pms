import { cookies } from "next/headers"
import { verifyToken } from "./jwt";
import prismaclient from "./prisma";

export async function getUserFromCookies()
{
    try{
     const userCookies=await cookies();
     const token=userCookies.get("token")?.value;
     if(!token)
     {
        return null;
     }
     const data=verifyToken(token)
     if(!data?.id)
     {
        return  data;
     }
     const user = await prismaclient.user.findUnique({
  where: {
    id: data.id,
  },
  select: {
    id: true,
    name: true,
    email: true,
    role: true,
  },
});
     console.log(user)
     if(!user)
     {
        return null
     }
     return user
    }
    catch(error)
    {
        console.error("error in helper",error);
        return null;
    }
}