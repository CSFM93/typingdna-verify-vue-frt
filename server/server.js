let express = require('express')
let cors = require('cors')
var history = require('connect-history-api-fallback');
require('dotenv').config()
const typingDnaVerifyClient = require("typingdna-verify-client");



let app = express()
let port = 4000
const path = __dirname + '/dist/';


app.use(cors())
app.use(history());
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static(path));


const typingDNAVerifyClient = new typingDnaVerifyClient({
    clientId: process.env.CLIENT_ID,
    applicationId: process.env.APPLICATION_ID,
    secret: process.env.CLIENT_SECRET
})


app.get("/verifyAccount", (req, res) => {
    console.log('verify request received', req.query)
    let email = req.query.email

    const typingDnaDataAttributes = typingDNAVerifyClient.getDataAttributes({
        email: email,
        language: "EN",
        mode: "standard"
    });

    console.log("typingDNA Atributes: ", typingDnaDataAttributes)

    res.json(typingDnaDataAttributes)
});



app.post("/validateOTP", async (req, res) => {
    console.log('validateOTP request received',req.body.data)
    let email = req.body.data.email
    let otp = req.body.data.otp
    const validatedOTP = await typingDNAVerifyClient.validateOTP({ email }, otp)
    console.log('validated OTP: ', validatedOTP)

    res.json({ validatedOTP: validatedOTP })
});




app.listen(port, function () {
    console.log(`CORS-enabled web server listening on port ${port}`)
})