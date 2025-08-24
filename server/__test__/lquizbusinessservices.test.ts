import { describe, test, expect, beforeEach, afterAll, beforeAll, afterEach, vi, Mocked, Mock, MockedFunction } from 'vitest'
import { randomUUID } from "crypto";
import { z } from "zod";

import path from "path";


import * as service from "../listening-quiz-transactions/services/lquizbusinessservice.ts"
import * as domein from "../listening-quiz-transactions/lquiz.domeinobject.ts";
import * as dto from "../listening-quiz-transactions/lquiz.dto.ts";
import * as businesserror from "../listening-quiz-transactions/errors/lquiz.businesserrors.js";
import * as apierror from "../listening-quiz-transactions/errors/lquiz.apierrors.ts";
import * as schema from "../listening-quiz-transactions/schemas/lquizapischema.ts";
import { uuid } from 'zod/v4';

//✅
describe('A_generateHash', () => {
    test("A01_ハッシュ生成", async () => {
        expect.assertions(1);
        const result = await service.generateHash("mockSessionID");
        console.log(result);
        expect(result).length(3);
    });
});

//✅
describe('B_generateLQuestionID', () => {
    const testUUID = randomUUID();
    test("B01_lQuestionID生成", async () => {
        expect.assertions(1);
        const mockDomObj: Mocked<domein.NewLQuestionInfo> = {
            userID: testUUID,
            sectionNumber: 4,
            requestedNumOfLQuizs: 5,
            speakingRate: 1.0
        };
        const testHash = "hash11111111";
        const result = await service.generateLQuestionID(mockDomObj.sectionNumber, testHash);
        console.log(result);
        expect(result).length(5);
    });
});