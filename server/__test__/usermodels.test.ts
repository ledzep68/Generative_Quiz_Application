import * as supertest from "supertest";
import {UserDTO} from "../users/userdto"
import * as usermodels from "../users/usermodels"
import {newDb} from "pg-mem"
import { Pool, Client, getTestDb } from "./pg";

jest.mock("./pg")

const MockedUserDTO = new UserDTO(
    "test",
    "test",
    "test",
    "test"
 ) as jest.Mocked<UserDTO>;

test("userDBGetConnect_resolve", () => {
    expect.assertions(1);
    const MockedClient = MockedPool.connect();
    expect(typeof MockedClient).toBe("object");
});

test("userDataRegister_resolve", () => {
    expect.assertions(1);
    const MockedClient = MockedPool.connect();
    return MockedClient
    .then((client) => {
        const UserDataRegisterTest = usermodels.userDBNewDataRecord(client, MockedUserDTO)
        expect(typeof UserDataRegisterTest).toBe("object");
    });
});

test("userLogin_resolve", () => {
    expect.assertions(1);
    const MockedClient = MockedPool.connect();
    return MockedClient
    .then((client) => {
        const UserLoginTest = usermodels.userDBLoginDataExtract(client, MockedUserDTO);
        expect(typeof UserLoginTest).toBe("object");
    });
});

