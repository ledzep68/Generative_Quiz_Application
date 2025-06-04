// usermodelsをモック
jest.mock("../users/usermodels", () => ({
    userDBGetConnect: jest.fn(),
    userDBNewDataRecord: jest.fn(),
    userDBLoginDataExtract: jest.fn(),
    userDBRelease: jest.fn(),
    userDBDisconnect: jest.fn()
}));//具体的な動作（引数、戻り値）は呼び出し時に指定してもいいし、ここで指定してもいい

import pgmock, {getPool} from "pgmock2";
import * as userServices from "../users/userservice";
import * as usermodels from "../users/usermodels";
import {UserDTO} from "../users/userdto";
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
        rowCount: 1,
        rows: [
            { UserId: "test" }
        ]
    }
); //一致するレコードあり

const MockedPool = getPool();

const MockedUserDTO = new UserDTO(
    "test",
    "test",
    "test",
    "test"
 ) as jest.Mocked<UserDTO>;

const MockedUserDTOtoFail = new UserDTO(
    "test",
    undefined,
    undefined,
    "test"
 ) as jest.Mocked<UserDTO>;

test("userDBConnect_reject", async() => {
    expect.assertions(1);
    const MockedClient = MockedPool.connect();
    (usermodels.userDBGetConnect as jest.Mock).mockRejectedValue(new Error("DB接続に失敗しました"));
    const DBConnect = userServices.userDBConnect();
    await expect(DBConnect).rejects.toThrow(Error("DB接続に失敗しました"));
});

test("userDataRegister_reject", async () => {
    expect.assertions(1);
    const MockedClient = await MockedPool.connect();
    (usermodels.userDBNewDataRecord as jest.Mock).mockImplementation((MockedClient: PoolClient, MockedUserDTO: jest.Mocked<UserDTO>) => {throw new Error("DB登録に失敗しました")});
    const UserDataRegisterTest = userServices.userDataRegister(MockedClient, MockedUserDTO);
    await expect(UserDataRegisterTest).rejects.toThrow("DB登録に失敗しました");
});

test("userLogin_reject", async () => {
    expect.assertions(1);
    const MockedClient = await MockedPool.connect();
    (usermodels.userDBLoginDataExtract as jest.Mock).mockImplementation((MockedClient: PoolClient, MockedUserDTO: jest.Mocked<UserDTO>) => {throw new Error("DB接続に失敗しました")});
    const UserLoginTest = userServices.userLogin(MockedClient, MockedUserDTO);
    await expect(UserLoginTest).rejects.toThrow(Error("DB接続に失敗しました"));
});

test("userDataRegister_undefinederror", async () => {
    expect.assertions(1);
    const MockedClient = await MockedPool.connect();
    const UserDataRegisterTest = userServices.userDataRegister(MockedClient, MockedUserDTOtoFail);
    await expect(UserDataRegisterTest).rejects.toThrow(Error("不明なエラー"));
});

test("userLogin_undefinederror", async () => {
    expect.assertions(1);
    const MockedClient = await MockedPool.connect();
    const UserLoginTest = userServices.userLogin(MockedClient, MockedUserDTOtoFail)
    await expect(UserLoginTest).rejects.toThrow(Error("不明なエラー"));
});