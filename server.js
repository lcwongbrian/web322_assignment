/********************************************************************************
* WEB322 – Assignment 04
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
* Name: Lap Chi Wong    Student ID: 112867221   Date: 8 Nov 2023
*
* Published URL: https://salmon-iguana-garb.cyclic.app/
*
********************************************************************************/

const express = require("express");
const path = require('path');
const legoData = require("./modules/legoSets");

const app = express();
const HTTP_PORT = process.env.PORT || 80;

app.set('view engine', 'ejs');
app.use(express.static('public'));


const start = async () => {
    await legoData.initialize();
    app.listen(HTTP_PORT, () => console.log(`server listening on: ${HTTP_PORT}`));
};

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/about", (req, res) => {
    res.render("about");
});

app.get("/lego/sets", async (req, res) => {
    try {
        let sets = null;
        if (req.query.theme) {
            sets = await legoData.getSetsByTheme(req.query.theme);
        } else {
            sets = await legoData.getAllSets();
        }
        res.render("sets", {sets});
    } catch(err) {
        res.status(404).render("404", { message: "Unable to find requested sets." });
    }
});

app.get("/lego/sets/:id", async (req, res) => {
    try {
        const set = await legoData.getSetByNum(req.params.id);
        res.render("set", {set});
    } catch(err) {
        res.status(404).render("404", { message: "Unable to find requested set." });
    }
});

app.use((req, res, next) => {
    res.status(404).render("404", { message: "I'm sorry, we're unable to find what you're looking for" });
});

start();
