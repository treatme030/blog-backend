import Joi from 'joi';
import User from '../../models/user';

/*
POST /api/auth/register
{
    username: 'juhee',
    password: 'mypass1234',
}
*/
//회원가입
export const register = async ctx => {
    //request body 검증하기
    const schema = Joi.object().keys({
        username: Joi.string()
        .alphanum()
        .min(3)
        .max(20)
        .required(),
        password: Joi.string().required(),
    })
    const result = schema.validate(ctx.request.body);
    if(result.error){
        ctx.status = 400;
        ctx.body = result.error;
        return;
    }

    const { username, password } = ctx.request.body;
    try {
        const exists = await User.findByUsername(username);
        if(exists){//해당 유저가 존재하는지 확인
            ctx.status = 409; //conflict
            return;
        }
        const user = new User({
            username,
        })
        await user.setPassword(password);//비밀번호 설정
        await user.save();//데이터베이스에 저장

        //응답할 데이터에서 hashedPassword 필드 제거 
        ctx.body = user.serialize();

        const token = user.generateToken();
        ctx.cookies.set('access_token', token, { 
                masAge: 1000 * 60 * 60 * 24 * 7,
                httpOnly: true,
        })
    } catch(e){
        ctx.throw(500, e);
    }
}
//로그인
//POST /api/auth/login
export const login = async ctx => {
    const { username, password } = ctx.request.body;

    // username, password가 없으면 에러처리
    if(!username || !password){
        ctx.status = 401;
        return;
    }

    try {
        const user = await User.findByUsername(username);
        if(!user){
            ctx.status = 401;
            return;
        }
        const valid = await user.checkPassword(password);
        if(!valid){
            ctx.status = 401;
            return;
        }
        ctx.body = user.serialize();

        const token = user.generateToken();
        ctx.cookies.set('access_token', token, { 
                masAge: 1000 * 60 * 60 * 24 * 7,
                httpOnly: true,
        })
    } catch(e){
        ctx.throw(500, e);
    }
}
//로그인 상태 확인
//GET /api/auth/check
export const check = async ctx => {
    const { user } = ctx.state;
    if(!user){ //로그인 중이 아님
        ctx.status = 401;
        return;
    }
    ctx.body = user;
}
//로그아웃
//POST /api/auth/logout
export const logout = async ctx => {
    ctx.cookies.set('access_token');
    ctx.status = 204;
}