
 //usermodelsのモジュールをモック
/*jest.mock("../users/usermodels", () => ({
  userDBGetConnect: jest.fn().mockImplementation(() => {return MockedPool.connect()}),
  userDBNewDataRecord: jest.fn().mockImplementation(() => Promise.resolve(MockedQueryResultToNewRecord)),
  userDBLoginDataExtract: jest.fn().mockImplementation(() => Promise.resolve(MockedQueryResultToLogin)),
  userDBRelease: jest.fn().mockImplementation(() => {}),
  userDBDisconnect: jest.fn().mockImplementation(() => Promise.resolve())
}));*/

import * as supertest from "supertest";
//import {Client, Pool, PoolClient, Query, QueryResult} from "pg";
import * as userServices from "../users/userservice";
import {UserDTO} from "../users/userdto"
import {newDb} from "pg-mem"

const MockedDB = newDb();
const { Pool, Client } = MockedDB.adapters.createPg();

const MockedPool = new Pool();
/*const MockedPool = new Pool({
    database: "test",
    host: "test",
    port: 12345,
    user: "test",
    password: "test"
}) as jest.Mocked<Pool>;
console.log(MockedPool);*/

const MockedUserDTO = new UserDTO(
    "test",
    "test",
    "test",
    "test"
 ) as jest.Mocked<UserDTO>;

 const MockedUserDTOtoFail = new UserDTO(
    undefined,
    "test",
    undefined,
    "test"
 ) as jest.Mocked<UserDTO>;

 /*const MockedQueryResultToNewRecord = {
    rowCount: 1,
    rows: [{ userId: 1, username: "test", hashedpassword: "test" }],
    command: "INSERT"
 } as jest.Mocked<QueryResult>;

 const MockedQueryResultToLogin = {
    rowCount: 1,
    rows: [{ userId: 1 }],
    command: "SELECT"
 } as jest.Mocked<QueryResult>;*/

test("userIDGenerate", () => {
    const GeneratedId = userServices.userIdGenerate();
    expect(typeof GeneratedId).toBe("string");
    expect(GeneratedId.length).toBeGreaterThan(0);
});

test("userPasswordEncrypt", () => {
    const password = 'test';
    const Hash = userServices.userPasswordEncrypt(password);
    expect(typeof Hash).toBe("string");
    expect(Hash.length).toBeGreaterThan(0);
});

test("userDBConnect_resolve", () => {
    expect.assertions(1);
    const DBConnect = userServices.userDBConnect();
    expect(typeof DBConnect).toBe("object");
});

/*test("userDataRegister_resolve", () => {
    expect.assertions(1);
    const MockedClient = MockedPool.connect();
    return MockedClient
    .then((client) => {
        const UserDataRegisterTest = userServices.userDataRegister(client, MockedUserDTO)
        expect(typeof UserDataRegisterTest).toBe("object");
    });
});

test("userDataRegister_reject", () => {
    expect.assertions(1);
    const MockedClient = MockedPool.connect();
    return MockedClient
    .then((client) => {
        const UserDataRegisterTest = userServices.userDataRegister(client, MockedUserDTOtoFail)
        expect(typeof UserDataRegisterTest).toBe("object");
    });
});

test("userLogin_resolve", () => {
    expect.assertions(1);
    const MockedClient = MockedPool.connect();
    return MockedClient
    .then((client) => {
        const UserLoginTest = userServices.userLogin(client, MockedUserDTO);
        expect(typeof UserLoginTest).toBe("object");
    });
});

test("userLogin_reject", () => {
    expect.assertions(1);
    const MockedClient = MockedPool.connect();
    return MockedClient
    .then((client) => {
        const UserLoginTest = userServices.userLogin(client, MockedUserDTOtoFail);
        expect(typeof UserLoginTest).toBe("object");
    });
});
*/