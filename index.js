// SERVER AND MIDDLEWARE
const express = require('express');
require('dotenv').config();
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const yup = require('yup');
const monk = require('monk');
const ejs = require('ejs');
// ID CREATION
const {encrypt, hash_id} = require('./crypto');


const db = monk(process.env.MONGO_URI);
const pastes = db.get('pastes');
pastes.createIndex({id: 1}, {unique: true});

const app = express(); 
app.use(morgan('tiny'));
app.use(express.json());
app.use(express.static("./public"));
app.use(helmet());

// ROUTING
app.get("/", function(req, res) {
    res.json({
        message: "FirePaste - Another on fire pasting service"
    });
});

app.get('/paste/:id', async function(req, res, next) {
    let {id: id} = req.params;    
    try {
        id = Buffer.from(id, 'base64').toString();
        const paste = await pastes.findOne({id: id});
        res.json(paste);
    } catch (error) {
        next(error);
    }
});

let schema = yup.object().shape({
    id: yup.string().trim(),
    code: yup.string().trim().required(),
    date: yup.date(),
    iv: yup.string().trim(),
    want_password: yup.bool().required()
});

app.post("/paste", async function(req, res, next) {
    let { code, password, want_password} = req.body;
    date = new Date();
    const id = hash_id(date, req.headers['x-forwarded-for']);
    try {      
        let iv;

        if (want_password) {      
            code_hash = encrypt(Buffer.from(code, 'utf8'), Buffer.from(password, 'utf8'));
            code = code_hash.content;
            iv = code_hash.iv;
        }
        await schema.validate({
            id,
            code,
            iv,
            want_password
        });
        const newPaste = {
            id, code, date, iv, want_password
        }
        //console.log(newPaste);
        const created = await pastes.insert(newPaste);
        res.json(created);
    } catch (error) {
        next(error);
    }

});

app.use((error, req, res, next) => {
    console.log("Ma funzioni?");
    if (error.status) {
        res.status(error.status);
    } else {
        res.status(500);
    }
    res.json({
        message: error.message,
        stack: process.env.NODE_ENV === 'production' ? '🐛' : error.stack,
    })
})

port = process.env.PORT
app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
});