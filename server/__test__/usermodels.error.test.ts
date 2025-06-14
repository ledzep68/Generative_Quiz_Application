import {UserDTO} from "../users/userdto.js"
import * as usermodels from "../users/usermodels.js"
import pgmock, {getPool} from "pgmock2";

const MockedPG = new pgmock();

MockedPG.add("INSERT INTO Users (UserId, UserName, HashedPassword) VALUES ($1, $2, $3)", ["string", undefined, "string"], {
    rowCount: 0,
    rows: []
});
MockedPG.add("SELECT UserId FROM users WHERE UserName = $1 AND HashedPassword = $2", [undefined, "string"], {
        rowCount: 0,  // エラーケース用の結果
        rows: []
    }
);

const MockedPool = getPool(MockedPG);

const MockedUserDTOtoFail = new UserDTO(
    "test",
    undefined,
    "test",
    "test"
 ) as jest.Mocked<UserDTO>;

test("userDataRegister_reject", async() => {
    expect.assertions(1);
        const MockedClient = await MockedPool.connect();
        const UserDataRegisterTest = await usermodels.userDBNewDataRecord(MockedClient, MockedUserDTOtoFail);
        expect(typeof UserDataRegisterTest).toBe("object");
});

test("userLogin_reject", async () => {
    expect.assertions(1);
        const MockedClient = await MockedPool.connect();
        const UserLoginTest = await usermodels.userDBLoginDataExtract(MockedClient, MockedUserDTOtoFail);
        expect(typeof UserLoginTest).toBe("object");
});

test("userLogin_reject", async () => {
    expect.assertions(1);
        const MockedClient = await MockedPool.connect();
        const UserLoginTest = await usermodels.userDBLoginDataExtract(MockedClient, MockedUserDTOtoFail);
        expect(typeof UserLoginTest).toBe("object");
});

