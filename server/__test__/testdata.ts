import { GeneratedQuestionDataResDTO } from '../listening-quiz-transactions/lquiz.dto.ts';
import { AudioURL } from '../listening-quiz-transactions/lquiz.domeinobject.ts';
import { newQuestionDataInsert } from '../listening-quiz-transactions/services/lquizbusinessservice.ts';

// テストデータをDTOとdomainに変換
const testGeneratedQuestionData: GeneratedQuestionDataResDTO[] = [
  {
    audioScript: 'A woman is watering plants in the garden.',
    jpnAudioScript: '女性が庭で植物に水をやっています。',
    answerOption: 'A',
    sectionNumber: 1,
    explanation: 'Part 1では写真描写問題が出題されます。写真に写っている動作や状況を正確に表現している選択肢を選ぶ必要があります。この問題では、女性が庭で植物に水をやっている様子が写真に描かれており、選択肢Aが正解となります。',
    speakerAccent: 'American'
  },
  {
    audioScript: 'When will the meeting start? - It starts at 3 PM.',
    jpnAudioScript: '会議はいつ始まりますか？ - 午後3時に始まります。',
    answerOption: 'B',
    sectionNumber: 2,
    explanation: 'Part 2は応答問題です。質問に対する最も適切な応答を選択します。「When will the meeting start?」という時間を尋ねる疑問文に対して、「It starts at 3 PM」が最も自然な応答となります。',
    speakerAccent: 'British'
  },
  {
    audioScript: 'Man: Good morning, I need to book a conference room for tomorrow. Woman: Sure, what time do you need it? Man: From 2 PM to 4 PM, please. Woman: Room A is available during that time.',
    jpnAudioScript: '男性：おはようございます。明日の会議室を予約したいのですが。女性：承知いたします。何時からご利用でしょうか？男性：午後2時から4時までお願いします。女性：その時間でしたら会議室Aが空いております。',
    answerOption: 'C',
    sectionNumber: 3,
    explanation: 'Part 3は会話問題です。2人以上の話者による会話を聞いて、内容に関する質問に答えます。この会話では男性が会議室の予約を取ろうとしており、女性スタッフが対応している場面です。時間と部屋の詳細が重要な情報となります。',
    speakerAccent: 'Canadian'
  },
  {
    audioScript: 'Good afternoon, everyone. This is Sarah from the marketing department. I wanted to inform you about our upcoming product launch event scheduled for March 15th. The event will be held at the downtown convention center from 10 AM to 6 PM. We expect about 200 attendees, including potential clients and media representatives. Please make sure to prepare your presentation materials by March 10th.',
    jpnAudioScript: '皆さん、こんにちは。マーケティング部のサラです。3月15日に予定されている新商品発表イベントについてお知らせします。イベントは午前10時から午後6時まで、ダウンタウンのコンベンションセンターで開催されます。顧客候補やメディア関係者を含む約200名の参加者を予定しています。プレゼンテーション資料は3月10日までに準備をお願いします。',
    answerOption: 'D',
    sectionNumber: 4,
    explanation: 'Part 4はトーク問題です。1人の話者による説明やアナウンスを聞いて、内容に関する質問に答えます。このトークは社内向けのアナウンスで、イベントの詳細（日時、場所、参加者数、準備期限）が含まれています。',
    speakerAccent: 'Australian'
  },
  {
    audioScript: 'Have you finished the quarterly report? - Almost, I just need to add the final numbers.',
    jpnAudioScript: '四半期レポートは終わりましたか？ - ほぼ完成です。最終的な数字を追加するだけです。',
    answerOption: 'A',
    sectionNumber: 2,
    explanation: 'Part 2の応答問題です。「Have you finished...?」という完了を尋ねる質問に対して、「Almost, I just need to...」という部分的完了を示す応答が適切です。この種の質問では、Yes/Noだけでなく、進捗状況を詳しく説明する応答も一般的です。',
    speakerAccent: 'American'
  }
];
//音声URLデータ
export const testAudioURLList: AudioURL[] = [
  {
    lQuestionID: 'toeic-part4-q001',
    audioFilePath: '/Users/sojikoeie/Desktop/Generative_Quiz_Application/server/resources/listening-quiz-resources/lQuestion_toeic-part4-q001_20250707125205./audio_segment.mp3',
    audioURL: undefined,
    duration: 45
  },
  {
    lQuestionID: 'toeic-part4-q002',
    audioFilePath: '/Users/sojikoeie/Desktop/Generative_Quiz_Application/server/resources/listening-quiz-resources/lQuestion_toeic-part4-q002_20250707125205./audio_segment.mp3',
    audioURL: undefined,
    duration: 42
  },
  {
    lQuestionID: 'toeic-part4-q003',
    audioFilePath: '/Users/sojikoeie/Desktop/Generative_Quiz_Application/server/resources/listening-quiz-resources/lQuestion_toeic-part4-q003_20250707125205./audio_segment.mp3',
    audioURL: undefined,
    duration: 48
  },
  {
    lQuestionID: 'toeic-part4-q004',
    audioFilePath: '/Users/sojikoeie/Desktop/Generative_Quiz_Application/server/resources/listening-quiz-resources/lQuestion_toeic-part4-q004_20250707125209./audio_segment.mp3',
    audioURL: undefined,
    duration: 50
  },
  {
    lQuestionID: 'toeic-part4-q005',
    audioFilePath: '/Users/sojikoeie/Desktop/Generative_Quiz_Application/server/resources/listening-quiz-resources/lQuestion_toeic-part4-q005_20250707125209./audio_segment.mp3',
    audioURL: undefined,
    duration: 44
  }
];

// 実行関数
async function main() {
  try {
    console.log('テストデータの挿入を開始します...');
    
    await newQuestionDataInsert(
      testGeneratedQuestionData,
      testAudioURLList,
      1.0 // デフォルトの音声再生速度
    );
    
    console.log('✅ テストデータの挿入が完了しました！');
    console.log(`挿入されたレコード数: ${testGeneratedQuestionData.length}`);
    
  } catch (error) {
    console.error('❌ テストデータの挿入に失敗しました:', error);
    process.exit(1);
  }
}

// スクリプト実行
main().catch(console.error);