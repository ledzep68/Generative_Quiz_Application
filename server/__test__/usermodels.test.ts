import {UserDTO} from "../users/userdto.js";
import * as usermodels from "../users/usermodels.js";
import pgmock, {getPool} from "pgmock2";

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

const MockedPool = getPool(MockedPG);

const MockedUserDTO = new UserDTO(
    "test",
    "test",
    "test",
    "test"
 ) as jest.Mocked<UserDTO>;

 const MockedUserDTOtoFail = new UserDTO(
    "test",
    undefined,
    "test",
    "test"
 ) as jest.Mocked<UserDTO>;

test("userDBGetConnect_resolve", async () => {
    expect.assertions(1);
        const MockedClient = await MockedPool.connect();
        console.log(MockedClient);
        expect(typeof MockedClient).toBe("object");
});

test("userDataRegister_resolve", async() => {
    expect.assertions(1);
        const MockedClient = await MockedPool.connect();
        const UserDataRegisterTest = await usermodels.userDBNewDataRecord(MockedClient, MockedUserDTO);
        expect(typeof UserDataRegisterTest).toBe("object");
});

test("userLogin_resolve", async () => {
    expect.assertions(3);
        const MockedClient = await MockedPool.connect();
        const UserLoginTest = await usermodels.userDBLoginDataExtract(MockedClient, MockedUserDTO);
        expect(typeof UserLoginTest).toBe("object");
        expect(UserLoginTest.rowCount).toBe(1);
        expect(UserLoginTest.rows[0].UserId).toBe("test");
});
