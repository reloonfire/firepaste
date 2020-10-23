const express = require('express');
require('dotenv').config();
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const nanoid = require('nanoid');
const yup = require('yup');
const monk = require('monk');

const db = monk(process.env.MONGO_URI);
const pastes = db.get('pastes');
pastes.createIndex({id: 1}, {unique: true});

const app = express(); 
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, "views"));
app.use(morgan('tiny'));
app.use(express.json());
app.use(express.static("./public"));
app.use(helmet());

app.get("/", function(req, res) {
    res.json({
        message: "FirePaste - Another on fire pasting service"
    });
});

app.get('/:id', async function(req, res, next) {
    const {id: id} = req.params;
    try {
        const paste = await pastes.findOne({id: id});
        if (paste) {
            //console.log(paste);
            res.render('paste', paste);
        }
    } catch (error) {
        next(error);
    }
});

let schema = yup.object().shape({
    id: yup.string().trim(),
    title: yup.string().required(),
    text: yup.string().trim().required(),
});

app.post("/paste", async function(req, res, next) {
    const { title, text} = req.body;
    id = nanoid.nanoid(6).toLowerCase();
    date = new Date();
    try {
        await schema.validate({
            id,
            title,
            text,
        });
        const newPaste = {
            id, title, text, date
        }
        const created = await pastes.insert(newPaste);
        res.json(created);
    } catch (error) {
        next(error);
    }

});

app.use((error, req, res, next) => {
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