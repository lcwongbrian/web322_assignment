require('dotenv').config(); 
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
let Schema = mongoose.Schema;

let loginHistorySchema = new Schema({
    dateTime: Date,
    userAgent: String
})

let userSchema = new Schema({
    userName: {
        type: String,
        unique: true
    },
    password: String,
    email: String,
    loginHistory: [ loginHistorySchema ]
});

let User;

const initialize = () => {
    return new Promise((resolve, reject) => {
        let db = mongoose.createConnection(process.env.MONGODB);

        db.on('error', (err) => {
            console.log(`[auth => initialize] Error: ${err}`);
            reject(err);
        });
        db.once('open', () => {
           User = db.model("users", userSchema);
           console.log(`[auth => initialize] Successfully access DB`);
           resolve();
        });
    });
};

const registerUser = (userData) => {
    return new Promise(async (resolve, reject) => {
        if (userData.password !== userData.password2) {
            console.log("[registerUser] Password error"); 
            reject("Passwords do not match");
        } else {
            try {
                const hash = await bcrypt.hash(userData.password, 10);
                userData.password = hash;
            } catch(err) {
                console.log(`[registerUser] Encryption error: ${err}`); 
                reject("There was an error encrypting the password");
            }
            
            let newUser = new User(userData);

            try {
                const res = await newUser.save();
                console.log(`[registerUser] Successfully created ${res}`);
                resolve();
            } catch (err) {
                console.log(`[registerUser] Registration Error: ${err}`);
                reject(err.code == 11000 ? "User Name already taken" : `There was an error creating the user: ${err}`);
            }            
        }
    });
};

const checkUser = (userData) => {
    return new Promise(async (resolve, reject) => {
        try {
            const users = await User.find({ userName: userData.userName }).exec();

            if (users.length === 0 ) {
                reject(`Unable to find user: ${userData.userName}`);
            }

            const isPwMatched = await bcrypt.compare(userData.password, users[0].password);
            
            if (!isPwMatched) {
                reject(`Incorrect Password for user: ${userData.userName}`);
            } else {
                if (users[0].loginHistory.length === 8) {
                    users[0].loginHistory.pop()
                }
    
                users[0].loginHistory.unshift({
                    dateTime: (new Date()).toString(),
                    userAgent: userData.userAgent
                });
    
                try {
                    const res = await User.updateOne({ userName: users[0].userName },
                    { $set: { loginHistory: users[0].loginHistory }}).exec();
                    console.log(`[checkUser] Successfully updated: ${JSON.stringify(res)}`);
                    resolve(users[0]);
                } catch (err) {
                    console.log(`[checkUser] Error: ${err}`);
                    reject(`There was an error verifying the user: ${err}`);
                }            
            }
        } catch (err) {
            reject(`Unable to find user: ${userData.userName}`);
        }
    });
};

module.exports = {
    initialize,
    registerUser,
    checkUser
};