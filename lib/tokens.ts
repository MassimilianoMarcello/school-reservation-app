import { TokenType } from "@prisma/client";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

   export async function getTokenByEmail(email:string){

    try{
        const token= await prisma.token.findFirst({where:{email}})
        return token
    }catch (error) {
        console.log(error);
        throw error

   }}
    



export async function generateToken(email:string, type:TokenType){
    const token = randomBytes(48).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000 * 24); // 1 hour from now
    const existingToken= await getTokenByEmail(email)

    if(existingToken){
        await prisma.token.delete(
            {where:{id:existingToken.id}}
        )
    }
    return prisma.token.create(
       { data:{
            email,
            token,
            expiresAt,
            type
        }}
    )
}

export async function getTokenByToken(token: string) {
    try {
      console.log('Cerco il token:', token);  // Log per vedere il token in ingresso
      const result = await prisma.token.findFirst({
        where: { token },
      });
  
      console.log('Risultato della query:', result);  // Log per vedere cosa restituisce la query
  
      return result;
    } catch (error) {
      console.log('Errore durante la ricerca del token:', error);
      throw error;
    }
  }

 

export async function isValidResetToken(token: string) {
  const tokenData = await getTokenByToken(token);
  if (!tokenData) return false;
  return tokenData.expiresAt > new Date();
}

  
    