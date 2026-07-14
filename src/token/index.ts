import type { UserAccountModel } from '@/generated/prisma/models/UserAccount';
import moment from 'moment';
import  jwt  from  'jsonwebtoken';

const secret = 'my_app_secret';
// const payload = {user_name:'Jack', id:3, email: '1234@gmail.com'};

const generateToken = (user:UserAccountModel)=>{
  return jwt.sign(user, secret, { expiresIn:  '12h' })
}

const verify =(token:string)=>{
  //iat 签发时间
  //exp 签发时间
  const result = jwt.verify(token, secret, {
    complete: true
  });
  const payload:any = result.payload
  if(payload.exp-moment().valueOf()<1000*60*60*11.5){
    return generateToken({
      id: payload.id,
      userName: payload.userName,
      userAccount: payload.userAccount,
      password: null,
      email: null,
      phone: null,
      avatar: null,
      status: 0,
      createdTime: new Date(),
      updatedTime: new Date(),
    } as UserAccountModel)
  }
  return null
}

const getUserInfo = (authorization:string):UserAccountModel=>{
  const parts = authorization.split(' ');
  const token = parts[1];
  const result = jwt.verify(token, secret, {
    complete: true
  });
  const payload:any = result.payload
  return {
    id: payload.id,
    userName: payload.userName,
    userAccount: payload.userAccount,
    password: null,
    email: null,
    phone: null,
    avatar: null,
    status: 0,
    createdTime: new Date(),
    updatedTime: new Date(),
  } as UserAccountModel
}

export const miniToken  = {
  generateToken,
  verify,
  getUserInfo
}
