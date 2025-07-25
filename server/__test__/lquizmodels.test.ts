import {Mocked, vi} from "vitest";
import {Pool, PoolClient} from "pg";
import * as entity from "../listening-quiz-transactions/lquiz.entity.ts";
import {newDb} from "pg-mem"

const mockedDB = newDb();
const mockedPool = mockedDB.adapters.createSlonik();

const MockedQuestionDataList: entity.LQuestionEntity[] = [
    {
        lQuestionID: "test1",
        audioScript: "test1",
        jpnAudioScript: "test1",
        answerOption: "A",
        sectionNumber: 1,
        explanation: "test1",
        speakerAccent: "American",
        speakingRate: 1,
        duration: 1,
        audioFilePath: "test1",
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        lQuestionID: "test2",
        audioScript: "test2",
        jpnAudioScript: "test2",
        answerOption: "B",
        sectionNumber: 1,
        explanation: "test2",
        speakerAccent: "British",
        speakingRate: 1,
        duration: 1,
        audioFilePath: "test2",
        createdAt: new Date(),
        updatedAt: new Date()
    }
] as Mocked<entity.LQuestionEntity[]>;

describe("A_dbGetConnect", () => {
    test("A01_成功", async () => {
        expect.assertions(1);
            const mockedClient = await mockedPool;
            console.log(mockedClient);
        expect(typeof mockedClient).toBe("object");
    });
});

describe("B_newQuestionBatchInsert", () => {
    test("B01_成功", async () => {
        
    })
})