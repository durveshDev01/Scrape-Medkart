import mongoose from 'mongoose';


mongoose.connect('mongodb+srv://durveshDev01:dbDurvesh0001@college-project.dijxg.mongodb.net/?retryWrites=true&w=majority&appName=College-Project');

const UserSchema = mongoose.Schema({email: String, name: String, password: String, address: [String]});
const User = mongoose.model('User', UserSchema);



export {User}
