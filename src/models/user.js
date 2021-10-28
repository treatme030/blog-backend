import mongoose, { Schema } from "mongoose";
import bcrypt from 'bcrypt';

const UserSchema = new Schema({
    username: String,
    hashedPassword: String,
})

//함수 내부에서 this로 접근해야 하기때문에 화살표 함수가 아닌 function 사용
//인스턴스 메서드
UserSchema.methods.setPassword = async function(password){
    const hash = await bcrypt.hash(password, 10);
    this.hashedPassword = hash;//this는 문서의 인스턴스를 가리킴
}

UserSchema.methods.checkPassword = async function(password){
    const result = await bcrypt.compare(password, this.hashedPassword);
    return result;
}

//스태틱 메서드
UserSchema.statics.findByUsername = function(username){
    return this.findOne({ username });//this는 모델을 가리킴 
}

const User = mongoose.model('User', UserSchema);
export default User;