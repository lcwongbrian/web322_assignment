/********************************************************************************
* WEB322 – Assignment 03
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
* Name: Lap Chi Wong    Student ID: 112867221   Date: 24 Oct 2023
*
* Published URL: https://salmon-iguana-garb.cyclic.app/
*
********************************************************************************/

const express = require("express");
const path = require('path');
const legoData = require("./modules/legoSets");

const app = express();
const HTTP_PORT = process.env.PORT || 80;

app.use(express.static('public'));

const start = async () => {
    await legoData.initialize();
    app.listen(HTTP_PORT, () => console.log(`server listening on: ${HTTP_PORT}`));
};

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, '/views/home.html'));
});

app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, '/views/about.html'));
});

app.get("/lego/sets", async (req, res) => {
    try {
        let sets = null;
        if (req.query.theme) {
            sets = await legoData.getSetsByTheme(req.query.theme);
        } else {
            sets = await legoData.getAllSets();
        }        
        res.json(sets);
    } catch(err) {
        res.status(404).send(err);
    }
});

app.get("/lego/sets/:id", async (req, res) => {
    try {
        const set = await legoData.getSetByNum(req.params.id);
        res.json(set);
    } catch(err) {
        res.status(404).send(err);
    }
});

app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, '/views/404.html'));
});

start();
