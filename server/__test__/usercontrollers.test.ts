import * as supertest from "supertest";
import * as express from "express";
import {userLoginController, userRegisterController} from "../users/usercontrollers";
import usersRouter from "../users/userroutes";

jest.mock('../users/userservice', () => ({
  userPasswordEncrypt: jest.fn(() => 'hashed'),
  userIdGenerate: jest.fn(() => '12345'),
  userDBConnect: jest.fn(),
  userDataRegister: jest.fn(() => Promise.resolve()),
  userLogin: jest.fn(() => Promise.resolve(true))
}));


test("test1", () => {
    const req = {
        body: {
            username: "test",
            password: "test"
        }
    } as express.Request;
    userLoginController(req, {} as express.Response);
});

test("test2", () => {
    const req = {
        body: {
            username: "test",
            password: "test"
        }
    } as express.Request;
    userRegisterController(req, {} as express.Response);
});