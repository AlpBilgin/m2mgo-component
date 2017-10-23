const Axios = require("axios");

// This function will be called by the platform to verify credentials
module.exports = function verifyCredentials(credentials, cb) {
    console.log('Does adding a comment here have any effect?');
    console.log('Credentials passed for verification %j', credentials);

    //
    const http = Axios.create({
        baseURL: 'https://pst.m2mgo.com/api',
    });

    const payload = {
        "Email": credentials.email,
        "Password": credentials.password
    }

    console.log('POST req payload %j', payload);


    http.post('/cms/membership-user/token', payload, {
        responseType: 'json'
    }).then(function (response) {
        console.log('a');
        console.log(response);
        cb(null, {
            verified: true
        });
    }).catch(function (error) {
        console.log('b');
        console.log(error);
        cb(null, {
            verified: false
        });
    });
};