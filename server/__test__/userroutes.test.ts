import express from "express";
import request from "supertest";
import UsersRouter from "../users/user.routes.ts";
import {userLoginController, userRegisterController} from "../users/user.controllers.ts";
import * as UserResponse from "../users/user.response.ts"

jest.mock("../users/usercontrollers", () => ({
    userRegisterController: jest.fn().mockImplementation((req, res)=>{res.status(200).json(UserResponse.UserResponses.USER_REGISTER_SUCCESS)}),
    userLoginController: jest.fn().mockImplementation((req, res)=>{res.status(200).json(UserResponse.UserResponses.LOGIN_SUCCESS)})
}));

const app = express();
app.use(express.json());
app.use(UsersRouter);

test("routetest_userRegisterController", async () => {
    expect.assertions(2);
    const response = await request(app).post("/register").send({username: "testusername", password: "12345UserTest"}).expect(200);
    expect(userRegisterController).toHaveBeenCalledTimes(1);
    expect(response.body).toEqual(UserResponse.UserResponses.USER_REGISTER_SUCCESS);
});

test("routetest_userLoginController", async () => {
    expect.assertions(2);
    const response = await request(app).post("/login").send({username: "testusername", password: "12345UserTest"}).expect(200);
    expect(userLoginController).toHaveBeenCalledTimes(1);
    expect(response.body).toEqual(UserResponse.UserResponses.LOGIN_SUCCESS);
});