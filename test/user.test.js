const app = require("../src/app")
const request = require("supertest")
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken')

const User = require("../src/models/user")

const userOneId = new mongoose.Types.ObjectId()
const userOne = {
    _id: userOneId,
    name: "Default Test User",
    email: "default@test.com",
    password: "123442",
    tokens : [{
        token : jwt.sign({_id: userOneId}, process.env.JWT_SECRET)
    }]
}

beforeEach(async () => {
    await User.deleteMany()
    await new User(userOne).save()
});

test("Should Sing up a new User", async () => {
    await request(app).post("/users").send({
        name: "Urvish",
        email: "test@tse.com",
        password: "somepass"
    }).expect(201)
})

test("Login", async () => {
    await request(app).post("/users/login").send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)
})

test("Should not Login", async () => {
    await request(app).post("/users/login").send({
        email: userOne.email,
        password: "1212121"
    }).expect(400)
})

test("Auth me", async () => {
    await request(app)
        .get("/users/me")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .send({
        email: userOne.email,
        password: "1212121"
    }).expect(200)
})

test("Not Auth me", async () => {
    await request(app)
        .get("/users/me")
        .send({
        email: userOne.email,
        password: "1212121"
    }).expect(401)
})

test("Delete Account", async()=>{
    await request(app)
        .get("/users/logout")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test("Should not Delete Accountcfor unauth", async()=>{
    await request(app)
        .get("/users/logout")
        .send()
        .expect(401)
})