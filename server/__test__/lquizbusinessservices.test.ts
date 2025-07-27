import { describe, test, expect, beforeEach, afterAll, beforeAll, afterEach, vi, Mocked, Mock, MockedFunction } from 'vitest'
import { z } from "zod";

import path from "path";


import * as service from "../listening-quiz-transactions/services/lquizbusinessservice.ts"
import * as domein from "../listening-quiz-transactions/lquiz.domeinobject.ts";
import * as dto from "../listening-quiz-transactions/lquiz.dto.ts";
import * as businesserror from "../listening-quiz-transactions/errors/lquiz.businesserrors.js";
import * as apierror from "../listening-quiz-transactions/errors/lquiz.apierrors.ts";
import * as schema from "../listening-quiz-transactions/schemas/lquizapischema.ts";

//✅
describe('A_generateHash', () => {
    test("A01_ハッシュ生成", async () => {
        expect.assertions(1);
        const mockDomObj: Mocked<domein.NewLQuestionInfo> = {
            sectionNumber: 3,
            requestedNumOfLQuizs: 3,
            speakingRate: 1.0
        };
        const result = await service.generateHash(mockDomObj);
        console.log(result);
        expect(result).length(3);
    });
});

//✅
describe('B_generateLQuestionID', () => {
    test("B01_lQuestionID生成", async () => {
        expect.assertions(1);
        const mockDomObj: Mocked<domein.NewLQuestionInfo> = {
            sectionNumber: 4,
            requestedNumOfLQuizs: 5,
            speakingRate: 1.0
        };
        const hashList = ["hash1111", "hash2222", "hash3333", "hash4444", "hash5555"];
        const result = await service.generateLQuestionID(mockDomObj, hashList);
        console.log(result);
        expect(result).length(5);
    });
});

describe('C_generateLQuestionID', () => {
    test("B01_lQuestionID生成", async () => {
        expect.assertions(1);
        const mockDomObj: Mocked<domein.NewLQuestionInfo> = {
            sectionNumber: 4,
            requestedNumOfLQuizs: 5,
            speakingRate: 1.0
        };
        const hashList = ["hash1111", "hash2222", "hash3333", "hash4444", "hash5555"];
        const result = await service.generateLQuestionID(mockDomObj, hashList);
        console.log(result);
        expect(result).length(5);
    });
});