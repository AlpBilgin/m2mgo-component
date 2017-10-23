const Axios = require("axios");

// This function will be called by the platform to verify credentials
module.exports = function verifyCredentials(credentials, cb) {

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
        console.log(response.data);
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