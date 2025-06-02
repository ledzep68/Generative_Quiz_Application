import pgmock, {getPool} from "pgmock2";
//import {Client, Pool, PoolClient, Query, QueryResult} from "pg";
import * as userServices from "../users/userservice";
import * as usermodels from "../users/usermodels";
import {UserDTO} from "../users/userdto";

const MockedPG = new pgmock();

MockedPG.add("INSERT INTO Users (UserId, UserName, HashedPassword) VALUES ($1, $2, $3)", ["string", "string", "string"], {
    rowCount: 0,
    rows: []
});

MockedPG.add("SELECT UserId FROM users WHERE UserName = $1 AND HashedPassword = $2", ["string", "string"], {
    rowCount: 1,
    rows: [
        { UserId: "test" }
    ]
}); //一致するレコードあり

const MockedPool = getPool();

const MockedUserDTO = new UserDTO(
    "test",
    "test",
    "test",
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