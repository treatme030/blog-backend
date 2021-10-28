import mongoose, { Schema } from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const UserSchema = new Schema({
    username: String,
    hashedPassword: String,
})

//함수 내부에서 this로 접근해야 하기때문에 화살표 함수가 아닌 function 사용
//비밀번호 설정 메서드
UserSchema.methods.setPassword = async function(password){
    const hash = await bcrypt.hash(password, 10);
    this.hashedPassword = hash;//this는 문서의 인스턴스를 가리킴
}

//비밀번호 확인 메서드
UserSchema.methods.checkPassword = async function(password){
    const result = await bcrypt.compare(password, this.hashedPassword);
    return result;
}

//해당 모델에서 전달된 username이 있는지 찾는 메서드
UserSchema.statics.findByUsername = function(username){
    return this.findOne({ username });//this는 모델을 가리킴 
}

//응답 데이터에서 hashedPassword 필드 제거 메서드
UserSchema.methods.serialize = function(){
    const data = this.toJSON();
    delete data.hashedPassword;
    return data;
}

//토큰 만드는 메서드
UserSchema.methods.generateToken = function(){
    const token = jwt.sign(
        {
            _id: this._id,
            username: this.username,
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' },
    )
    return token;
}

const User = mongoose.model('User', UserSchema);
export default User;