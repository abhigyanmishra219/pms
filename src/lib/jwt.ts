
import jwt from 'jsonwebtoken'
export function createToken(data:string)
{
    const secret=process.env.JWT_SECRET;
    const token=jwt.sign(data,secret)
    return token
}
export function verifyToken(token:string)
{
    try{
     const secret=process.env.JWT_SECRET;
    const data=jwt.verify(token,secret)
      return data
}
    
    catch{
        return null
    }
}