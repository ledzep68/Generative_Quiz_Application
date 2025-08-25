import {userLoginController, userRegisterController} from "../users/user.controllers.ts";
import * as pgmock from "pgmock2";
import { PoolClient } from "pg";
import { userIdGenerate, userPasswordEncrypt, userDataRegister, userLogin, userDBConnect } from "../users/user.service.ts";
import { UserDTO } from "../users/user.dto.ts";
import * as UserResponse from "../users/user.response.ts";
import { Request, Response } from 'express';
import * as userdberrors from "../users/errors/user.dberrors.ts";

vi.mock('../users/userservice', () => ({
  userPasswordEncrypt: vi.fn().mockImplementation((password: string) => {return "hashedtest"}),
  userIdGenerate: vi.fn().mockImplementation(() => {return "0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"}),
  userDBConnect: vi.fn().mockImplementation(() => {return MockedPool.connect()}),
  userDataRegister: vi.fn().mockImplementation((MockedClient: PoolClient, MockedUserDTO: jest.Mocked<UserDTO>) => {return true}),
  userLogin: vi.fn().mockImplementation((MockedClient: PoolClient, MockedUserDTO: jest.Mocked<UserDTO>) => {return true})
}));

const mockedDBConnection = () => ({
    query: vi.fn(),
    release: vi.fn(),
    connect: vi.fn()
});

const MockedPG = new pgmock.default();
const MockedPool = pgmock.getPool(MockedPG);

const MockedReq = {
    body: {
        username: "testusername",
        password: "12345UserTest"
    }
} as Request;

const MockedReqToFail = {
    body: {
        username: 12345,
        password: "12345UserTest"
    }
} as Request;

const MockedRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
} as unknown as Response; //「どのメソッドが、どの引数で呼ばれたか」を記録するだけ　実際のレスポンスは返さない

test("userRegisterController_resolve", async () => {
    expect.assertions(3);
    const MockedHashedPassword = userPasswordEncrypt("test");
    const MockedUserID = userIdGenerate();
    const MockedUserDTO = new UserDTO(
        MockedUserID,
        MockedReq.body.username,
        MockedReq.body.password,
        MockedHashedPassword
    ) as Mocked<UserDTO>;
    const MockedClient = await userDBConnect();
    await userDataRegister(MockedClient, MockedUserDTO);
    const userDataRegisterContTest = await userRegisterController(MockedReq, MockedRes);
    expect(userDataRegisterContTest).toBe(void 0);
    expect(MockedRes.status).toHaveBeenCalledWith(200); //MockedRes.statusが引数200で呼ばれたか
    expect(MockedRes.json).toHaveBeenCalledWith(
        expect.objectContaining(UserResponse.UserResponses.USER_REGISTER_SUCCESS)
    ); //MockedRes.jsonがUserResponse.UserResponses.USER_REGISTER_SUCCESSを含むオブジェクトを引数として呼ばれたか
});

test("userRegisterController_reject_ValidationErr", async () => {
    expect.assertions(3);
    const MockedHashedPassword = userPasswordEncrypt("test");
    const MockedUserID = userIdGenerate();
    const MockedUserDTO = new UserDTO(
        MockedUserID,
        MockedReqToFail.body.username,
        MockedReqToFail.body.password,
        MockedHashedPassword
    ) as jest.Mocked<UserDTO>;
    
    const userDataRegisterContTest = await userRegisterController(MockedReqToFail, MockedRes);
    expect(userDataRegisterContTest).toBe(void 0);
    expect(MockedRes.status).toHaveBeenCalledWith(400); 
    expect(MockedRes.json).toHaveBeenCalledWith(
        expect.objectContaining(UserResponse.UserResponses.VALIDATION_FAILED)
    ); 
});

test("userRegisterController_reject_DBOpeErr", async () => {
    expect.assertions(3);
    const MockedHashedPassword = userPasswordEncrypt("test");
    const MockedUserID = userIdGenerate();
    const MockedUserDTO = new UserDTO(
        MockedUserID,
        MockedReq.body.username,
        MockedReq.body.password,
        MockedHashedPassword
    ) as jest.Mocked<UserDTO>;
    const MockedClient = await userDBConnect();
    (userDataRegister as jest.Mock).mockImplementation((MockedClient: PoolClient, MockedUserDTO: jest.Mocked<UserDTO>)=>{throw new userdberrors.DBOperationError("test")});
    const userDataRegisterContTest = await userRegisterController(MockedReq, MockedRes);
    expect(userDataRegisterContTest).toBe(void 0);
    expect(MockedRes.status).toHaveBeenCalledWith(500); 
    expect(MockedRes.json).toHaveBeenCalledWith(
        expect.objectContaining(UserResponse.UserResponses.DB_OPERATION_ERROR)
    );
});

test("userRegisterController_reject_DBConErr", async () => {
    expect.assertions(3);
    const MockedHashedPassword = userPasswordEncrypt("test");
    const MockedUserID = userIdGenerate();
    const MockedUserDTO = new UserDTO(
        MockedUserID,
        MockedReq.body.username,
        MockedReq.body.password,
        MockedHashedPassword
    ) as jest.Mocked<UserDTO>;
    (userDBConnect as jest.Mock).mockImplementation(() => {throw new userdberrors.DBConnectError("test")}); //userDBConnectの戻り値Errorに再定義⇨PoolClient返すようにするには後で再定義し直す必要あり
    const userDataRegisterContTest = await userRegisterController(MockedReq, MockedRes);
    expect(userDataRegisterContTest).toBe(void 0);
    expect(MockedRes.status).toHaveBeenCalledWith(503); 
    expect(MockedRes.json).toHaveBeenCalledWith(
        expect.objectContaining(UserResponse.UserResponses.DB_CONNECT_ERROR)
    );
});

test("userRegisterController_reject_unknownErr", async () => {
    expect.assertions(3);
    const MockedHashedPassword = userPasswordEncrypt("test");
    const MockedUserID = userIdGenerate();
    const MockedUserDTO = new UserDTO(
        MockedUserID,
        MockedReq.body.username,
        MockedReq.body.password,
        MockedHashedPassword
    ) as jest.Mocked<UserDTO>;
    (userDBConnect as jest.Mock).mockImplementation(() => {return MockedPool.connect();});
    const MockedClient = await userDBConnect();
    (userDataRegister as jest.Mock).mockImplementation((MockedClient: PoolClient, MockedUserDTO: jest.Mocked<UserDTO>)=>{throw new Error("test")}); 
    const userDataRegisterContTest = await userRegisterController(MockedReq, MockedRes);
    expect(userDataRegisterContTest).toBe(void 0);
    expect(MockedRes.status).toHaveBeenCalledWith(500); 
    expect(MockedRes.json).toHaveBeenCalledWith(
        expect.objectContaining(UserResponse.UserResponses.UNKNOWN_SERVER_ERROR)
    );
});

test("userLoginController_resolve_LoginSuccess", async () => {
    expect.assertions(3);
    const MockedHashedPassword = userPasswordEncrypt("test");
    (userDBConnect as jest.Mock).mockImplementation(() => {return MockedPool.connect();});
    const MockedClient = await userDBConnect();
    const MockedUserDTO = new UserDTO(
        undefined,
        MockedReq.body.username,
        MockedReq.body.password,
        MockedHashedPassword
    ) as jest.Mocked<UserDTO>;
    await userLogin(MockedClient, MockedUserDTO);
    const userLoginContTest = await userLoginController(MockedReq, MockedRes);
    expect(userLoginContTest).toBe(void 0);
    expect(MockedRes.status).toHaveBeenCalledWith(200); //MockedRes.statusが引数200で呼ばれたか
    expect(MockedRes.json).toHaveBeenCalledWith(
        expect.objectContaining(UserResponse.UserResponses.LOGIN_SUCCESS)
    );
});

test("userLoginController_resolve_LoginFailed", async () => {
    expect.assertions(3);
    const MockedHashedPassword = userPasswordEncrypt("test");
    const MockedClient = await userDBConnect();
    const MockedUserDTO = new UserDTO(
        undefined,
        MockedReq.body.username,
        MockedReq.body.password,
        MockedHashedPassword
    ) as jest.Mocked<UserDTO>;
    (userLogin as jest.Mock).mockImplementation((MockedClient: PoolClient, MockedUserDTO: jest.Mocked<UserDTO>) => {return false});
    const userLoginContTest = await userLoginController(MockedReq, MockedRes);
    expect(userLoginContTest).toBe(void 0);
    expect(MockedRes.status).toHaveBeenCalledWith(401); //MockedRes.statusが引数200で呼ばれたか
    expect(MockedRes.json).toHaveBeenCalledWith(
        expect.objectContaining(UserResponse.UserResponses.LOGIN_FAILED)
    );
});

test("userLoginController_reject_ValidationErr", async () => {
    expect.assertions(3);
    const MockedHashedPassword = userPasswordEncrypt("test");
    const userLoginContTest = await userLoginController(MockedReqToFail, MockedRes);
    expect(userLoginContTest).toBe(void 0);
    expect(MockedRes.status).toHaveBeenCalledWith(400); 
    expect(MockedRes.json).toHaveBeenCalledWith(
        expect.objectContaining(UserResponse.UserResponses.VALIDATION_FAILED)
    );
});

test("userLoginController_reject_DBConErr", async () => {
    expect.assertions(3);
    const MockedHashedPassword = userPasswordEncrypt("test");
    (userDBConnect as jest.Mock).mockImplementation(() => {throw new userdberrors.DBConnectError("test");});
    //const MockedClient = await userDBConnect();
    const MockedUserDTO = new UserDTO(
        undefined,
        MockedReq.body.username,
        MockedReq.body.password,
        MockedHashedPassword
    ) as jest.Mocked<UserDTO>;
    const userLoginContTest = await userLoginController(MockedReq, MockedRes);
    expect(userLoginContTest).toBe(void 0);
    expect(MockedRes.status).toHaveBeenCalledWith(503); 
    expect(MockedRes.json).toHaveBeenCalledWith(
        expect.objectContaining(UserResponse.UserResponses.DB_CONNECT_ERROR)
    );
});

test("userLoginController_reject_DBOpeErr", async () => {
    expect.assertions(3);
    const MockedHashedPassword = userPasswordEncrypt("test");
    (userDBConnect as jest.Mock).mockImplementation(() => {return MockedPool.connect();});
    const MockedClient = await userDBConnect();
    const MockedUserDTO = new UserDTO(
        undefined,
        MockedReq.body.username,
        MockedReq.body.password,
        MockedHashedPassword
    ) as jest.Mocked<UserDTO>;
    (userLogin as jest.Mock).mockImplementation((MockedClient: PoolClient, MockedUserDTO: jest.Mocked<UserDTO>) => {throw new userdberrors.DBOperationError("test")});
    const userLoginContTest = await userLoginController(MockedReq, MockedRes);
    expect(userLoginContTest).toBe(void 0);
    expect(MockedRes.status).toHaveBeenCalledWith(500); 
    expect(MockedRes.json).toHaveBeenCalledWith(
        expect.objectContaining(UserResponse.UserResponses.DB_OPERATION_ERROR)
    );
});

test("userLoginController_reject_unknownErr", async () => {
    expect.assertions(3);
    const MockedHashedPassword = userPasswordEncrypt("test");
    (userDBConnect as jest.Mock).mockImplementation(() => {return MockedPool.connect();});
    const MockedClient = await userDBConnect();
    const MockedUserDTO = new UserDTO(
        undefined,
        MockedReq.body.username,
        MockedReq.body.password,
        MockedHashedPassword
    ) as jest.Mocked<UserDTO>;
    (userLogin as jest.Mock).mockImplementation((MockedClient: PoolClient, MockedUserDTO: jest.Mocked<UserDTO>) => {throw new Error("test")});
    const userLoginContTest = await userLoginController(MockedReq, MockedRes);
    expect(userLoginContTest).toBe(void 0);
    expect(MockedRes.status).toHaveBeenCalledWith(500); 
    expect(MockedRes.json).toHaveBeenCalledWith(
        expect.objectContaining(UserResponse.UserResponses.UNKNOWN_SERVER_ERROR)
    );
});