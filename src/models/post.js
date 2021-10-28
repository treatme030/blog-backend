import mongoose from "mongoose";

const { Schema } = mongoose;

const PostSchema = new Schema({
    title: String,
    body: String,
    tags: [String], //문자열로 이루어진 배열
    publishedDate: {
        type: Date,
        default: Date.now,
    },
    user: {
        _id: mongoose.Types.ObjectId,
        username: String,
    }
})

//model 생성, mongoose.model('스키마 이름', 스키마 객체)
const Post = mongoose.model('Post', PostSchema);//만들어지는 컬렉션 이름은 posts
export default Post;