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
    //query는 문자열로 숫자로 변환, 값이 주어지지 않았다면 1을 기본으로 사용
    const page = parseInt(ctx.query.page || '1', 10);

    if(page < 1){
        ctx.status = 400;
        return;
    }

    try {
        const posts = await Post.find()
        .sort({ _id: -1 })//내림차순 정렬
        .limit(10)//보이는 개수 제한
        .skip((page - 1)*10)//한 페이지에 보이는 개수
        .lean()//데이터를 JSON 형태로 조회 가능
        .exec();
        //마지막 페이지 커스텀 헤더에 설정 
        const postCount = await Post.countDocuments().exec();
        ctx.set('Last-Page', Math.ceil(postCount / 10));
        ctx.body = posts //내용 길이 제한
        .map(post => ({
            ...post,
            body:
            post.body.length < 200 ? post.body : `${post.body.slice(0, 200)}...`,
        }))
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