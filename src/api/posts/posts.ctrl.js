let postId = 1 // id의 초깃값

//posts 배열 초기 데이터
const posts = [
    {
        id: 1,
        title: '제목',
        body: '내용',
    }
]
//포스트 작성
//POST/api/posts
//{ title, body }
export const write = ctx => {
    //REST API의 Request body는 ctx.request.body에서 확인
    const { title, body } = ctx.request.body 
    postId += 1
    const post = { id: postId, title, body }
    posts.push(post)
    ctx.body = post
}

//포스트 목록 조회
//GET/api/posts
export const list = ctx => {
    ctx.body = posts
}

//특정 포스트 조회
//GET/api/posts/:id
export const read = ctx => {
    const { id } = ctx.params 
    const post = posts.find(p => p.id.toString() === id)
    if(!post){
        ctx.status = 404
        ctx.body = {
            message: '포스트가 존재하지 않습니다.'
        }
        return;
    }
    ctx.body = post
}

//특정 포스트 제거
//DELETE/api/posts/:id
export const remove = ctx => {
    const { id } = ctx.params 
    const idx = posts.findIndex(p => p.id.toString() === id)
    if(idx === -1){
        ctx.status = 404
        ctx.body = {
            message: '포스트가 존재하지 않습니다.'
        }
        return;
    }
    posts.splice(idx, 1)
    ctx.status = 204
}

//포스트 수정(교체)
//PUT/api/posts/:id
//{ title, body }
export const replace = ctx => {
    const { id } = ctx.params 
    const idx = posts.findIndex(p => p.id.toString() === id)
    if(idx === -1){
        ctx.status = 404
        ctx.body = {
            message: '포스트가 존재하지 않습니다.'
        }
        return;
    }
    //id를 제외한 전체 기존 정보를 모두 날리고, 객체를 새로 만듦
    posts[idx] = {
        id,
        ...ctx.request.body,
    }
    ctx.body = posts[idx]
}

//포스트 수정(특정 필드 변경)
//PATCH/api/posts/:id
//{ title, body }
export const update = ctx => {
    const { id } = ctx.params
    const idx = posts.findIndex(p => p.id.toString() === id)
    if(idx === -1){
        ctx.status = 404
        ctx.body = {
            message: '포스트가 존재하지 않습니다.'
        }
        return;
    }
    //기존 값에 정보를 덮어 씌우기
    posts[idx] = {
        ...posts[idx],
        ...ctx.request.body
    }
    ctx.body = posts[idx]
}