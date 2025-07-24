import {vi} from 'vitest';

import * as controller from "../audio-delivery/audio.controllers.ts";
import * as service from "../audio-delivery/audio.services.ts";
import * as errors from "../audio-delivery/errors/audio.businesserrors.ts";
import * as responses from "../audio-delivery/audio.responses.ts";

import { Request, Response } from "express";
import { z } from "zod";
import fs from 'fs/promises';
import path from 'path';
// fsモジュール全体をモック
vi.mock('fs/promises');
vi.mock('../audio-delivery/audio.services.js', () => ({
    audioFilePathExtract: vi.fn().mockImplementation(
        (lQuestionID: string) => {
            const audioFilePath = path.join(__dirname, 'testfiles', `lQuestion_${lQuestionID}_20250707125209`, `audio_segment.mp3`);
            return audioFilePath;
        }
    )
}));

const mockedReq = {
    params: { lQuestionId: 'toeic-part4-q001'}
} as unknown as Request;

const mockedRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        sendFile: vi.fn().mockReturnThis()
    } as unknown as Response;

describe('audioDeliveryController', () => {
    test('01_成功', async () => {
        expect.assertions(5);
        const expectedPath = '/Users/sojikoeie/Desktop/Generative_Quiz_Application/server/__test__/testfiles/lQuestion_toeic-part4-q001_20250707125209/audio_segment.mp3';
        //fs.statモック
        vi.mocked(fs.stat).mockImplementation(() => {
            return{
            size: 1024,
            isFile: () => true} as any
        });

        await controller.audioDeliveryController(mockedReq, mockedRes);
        expect(mockedRes.set).toHaveBeenCalledWith({
            'Content-Type': 'audio/mpeg',
            'Content-Length': '1024',
            'Cache-Control': 'public, max-age=3600',
            'Accept-Ranges': 'bytes'
        });
        expect(mockedRes.sendFile).toHaveBeenCalledWith(
            expectedPath,
            expect.any(Function)
        );
        expect(mockedRes.status).not.toHaveBeenCalled();
        expect(mockedRes.json).not.toHaveBeenCalled();
        expect(mockedRes.send).not.toHaveBeenCalled();
    });
});


