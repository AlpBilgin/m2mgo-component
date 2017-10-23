const axios = require("axios");

// This function will be called by the platform to verify credentials
module.exports = function verifyCredentials(credentials, cb) {
    console.log('Credentials passed for verification %j', credentials);

    //
    this.http = Axios.create({
        baseURL: 'https://pst.m2mgo.com/api',
    });
    const payload = {
        "Email": credentials.email,
        "Password": credentials.password
    }


    this.http.post('/cms/membership-user/token' + endpointName, payload, {
            responseType: 'json'
        }).then(function (response) {
            console.log(response);
            cb(null, {
                verified: true
            });
        })
        .catch(function (error) {
            console.log(error);
            cb(null, {
                verified: false
            });
        });
};