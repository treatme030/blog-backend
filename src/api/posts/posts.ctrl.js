import mongoose from "mongoose";
import Joi from "joi";
import Post from "../../models/post"


const { ObjectId } = mongoose.Types;

//클라이언트가 요청을 잘못 보낸건지 ObjectId 확인
export const checkObjectId = (ctx, next) => {
    const { id } = ctx.params;
    if(!ObjectId.isValid(id)){
        ctx.status = 400; 
        return;
    }
    return next();
}

//포스트 작성
//POST/api/posts
/*
{
    title: '제목',
    body: '내용',
    tags: ['tag1', 'tag2'],
}
*/
export const write = async ctx => {
    const schema = Joi.object().keys({
        title: Joi.string().required(),//필수항목
        body: Joi.string().required(),
        tags: Joi.array()
        .items(Joi.string())
        .required(),
    })
    //검증하고 나서 검증 실패인 경우 에러 처리
    const result = schema.validate(ctx.request.body);
    if(result.error){
        ctx.status = 400;
        ctx.body = result.error;
        return;
    }

    const { title, body, tags } = ctx.request.body;
    const post = new Post({
        title,
        body,
        tags,
    })
    try {
        await post.save();//데이터베이스에 저장
        ctx.body = post;
    } catch(e){
        ctx.throw(500, e);
    }
}

//포스트 목록 조회
//GET/api/posts
export const list = async ctx => {
    try {
        const posts = await Post.find().exec();
        ctx.body = posts;
    } catch(e){
        ctx.throw(500, e);
    }
}

//특정 포스트 조회
//GET/api/posts/:id
export const read = async ctx => {
    const { id } = ctx.params;
    try {
        const post = await Post.findById(id).exec();
        if(!post){
            ctx.status = 404;
            return;
        }
        ctx.body = post;
    } catch(e){
        ctx.throw(500, e);
    }
}

//특정 포스트 제거
//DELETE/api/posts/:id
export const remove = async ctx => {
    const { id } = ctx.params;
    try {
        await Post.findByIdAndRemove(id).exec();
        ctx.status = 204;
    } catch(e){
        ctx.throw(500, e);
    }
}

//포스트 수정(특정 필드 변경)
//PATCH/api/posts/:id
export const update = async ctx => {
    const { id } = ctx.params;
    const schema = Joi.object().keys({
        title: Joi.string(),
        body: Joi.string(),
        tags: Joi.array()
        .items(Joi.string()),
    })
    //검증하고 나서 검증 실패인 경우 에러 처리
    const result = schema.validate(ctx.request.body);
    if(result.error){
        ctx.status = 400;
        ctx.body = result.error;
        return;
    }

    try {
        const post = await Post.findByIdAndUpdate(id, ctx.request.body, {
            new: true //업데이트된 데이터 반환해 줌
        }).exec();
        if(!post){
            ctx.status = 404;
            return;
        }
        ctx.body = post;
    } catch(e){
        ctx.throw(500, e);
    }
}