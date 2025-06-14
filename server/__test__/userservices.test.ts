// usermodelsをモック
jest.mock("../users/usermodels", () => ({
    userDBGetConnect: jest.fn(),
    userDBNewDataRecord: jest.fn(),
    userDBLoginDataExtract: jest.fn(),
    userDBRelease: jest.fn(),
    userDBDisconnect: jest.fn()
}));//具体的な動作（引数、戻り値）は呼び出し時に指定してもいいし、ここで指定してもいい

import pgmock, {getPool} from "pgmock2";
import * as userServices from "../users/userservice.js";
import * as usermodels from "../users/usermodels.js";
import {UserDTO} from "../users/userdto.js";
import { PoolClient } from "pg";

const MockedPG = new pgmock();

MockedPG.add(
    "INSERT INTO Users (UserId, UserName, HashedPassword) VALUES ($1, $2, $3)", 
    ["string", "string", "string"], 
    {
        rowCount: 0,
        rows: []
    }
);

MockedPG.add(
    "SELECT UserId FROM users WHERE UserName = $1 AND HashedPassword = $2", 
    ["string", "string"], 
    {
        rowCount: 0,
        rows: [
            { UserId: "test" }
        ]
    }
); //一致するレコードあり

MockedPG.add(
    "SELECT UserId FROM users WHERE UserName = $1 AND HashedPassword = $2", 
    ["string", "string"], 
    {
        rowCount: 0,
        rows:[]
    }
); //一致するレコードなし

const MockedPool = getPool();

const MockedUserDTO = new UserDTO(
    "test",
    "test",
    "test",
    "test"
 ) as jest.Mocked<UserDTO>;

test("userIDGenerate", () => {
    expect.assertions(2);
    const GeneratedId = userServices.userIdGenerate();
    expect(typeof GeneratedId).toBe("string");
    expect(GeneratedId.length).toBeGreaterThan(0);
});

test("userPasswordEncrypt", () => {
    expect.assertions(2);
    const password = 'test';
    const Hash = userServices.userPasswordEncrypt(password);
    expect(typeof Hash).toBe("string");
    expect(Hash.length).toBeGreaterThan(0);
});

test("userDBConnect_resolve", () => {
    expect.assertions(1);
    const MockedClient = MockedPool.connect();
    (usermodels.userDBGetConnect as jest.Mock).mockResolvedValue(MockedClient);
    const DBConnect = userServices.userDBConnect();
    expect(typeof DBConnect).toBe("object");
});

test("userDataRegister_resolve", async () => {
    expect.assertions(1);
    const MockedClient = await MockedPool.connect();
    (usermodels.userDBNewDataRecord as jest.Mock).mockImplementation((MockedClient: PoolClient, MockedUserDTO: jest.Mocked<UserDTO>) => {return MockedPG.query("INSERT INTO Users (UserId, UserName, HashedPassword) VALUES ($1, $2, $3)", ["string", "string", "string"])});
    const UserDataRegisterTest = userServices.userDataRegister(MockedClient, MockedUserDTO)
    await console.log (UserDataRegisterTest);
    expect(typeof UserDataRegisterTest).toBe("object");
});

test("userLogin_resolve_loginsuccess", async () => {
    expect.assertions(1);
    const MockedClient = await MockedPool.connect();
    (usermodels.userDBLoginDataExtract as jest.Mock).mockImplementation((MockedClient: PoolClient, MockedUserDTO: jest.Mocked<UserDTO>) => {return MockedPG.query("SELECT UserId FROM users WHERE UserName = $1 AND HashedPassword = $2", ["string", "string"])});
    const UserLoginTest = await userServices.userLogin(MockedClient, MockedUserDTO);
    await console.log (UserLoginTest);
    expect(UserLoginTest).toBe(true);
});

test("userLogin_resolve_loginfailed", async () => {
    expect.assertions(1);
    const MockedClient = await MockedPool.connect();
    (usermodels.userDBLoginDataExtract as jest.Mock).mockImplementation((MockedClient: PoolClient, MockedUserDTO: jest.Mocked<UserDTO>) => {return MockedPG.query("SELECT UserId FROM users WHERE UserName = $1 AND HashedPassword = $2", ["string", "string"])});
    const UserLoginTest = await userServices.userLogin(MockedClient, MockedUserDTO);
    await console.log (UserLoginTest);
    expect(UserLoginTest).toBe(false);
});