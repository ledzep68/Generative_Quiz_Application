import {callChatGPT} from '../listening-quiz-transactions/services/lquizapiservice.ts';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

async function main() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const promptPath = path.join(__dirname, 'testprompt.md');
    const testprompt = await fs.readFile(promptPath, 'utf8');
    console.log("testprompt: ", testprompt);
    const response = await callChatGPT(testprompt);
    console.log(response);
};

main().catch(console.error);


const generatedQuestions = 
[
    {
        "audioScript": "Good morning, everyone. This is an announcement for all employees. Due to maintenance work, the washrooms on the second floor will be closed today. Please use the facilities on the first or third floors. We apologize for any inconvenience this may cause. Thank you for your understanding. What is the main purpose of this announcement? The washrooms on the second floor are closed. The elevators are under maintenance. The cafeteria is closed today. The parking lot is full.",
        "jpnAudioScript": "おはようございます、皆さん。これは全従業員へのお知らせです。メンテナンス作業のため、本日2階の洗面所は閉鎖されます。1階または3階の施設をご利用ください。ご不便をおかけして申し訳ありません。ご理解のほどよろしくお願いいたします。このアナウンスの主な目的は何ですか？2階の洗面所が閉鎖されている。エレベーターがメンテナンス中である。カフェテリアが本日閉鎖されている。駐車場が満車である。",
        "answerOption": "B",
        "sectionNumber": 4,
        "explanation": "正解はBです。このアナウンスは、2階の洗面所がメンテナンスのため閉鎖されていることを伝えています。他の選択肢はアナウンスの内容と一致しません。'washrooms'という単語はカナダ英語でよく使われる表現です。リスニングの際には、'washrooms'や'closed'といったキーワードに注意を払いましょう。カナダ英語の特徴として、'about'が'aboot'のように聞こえることがあります。",
        "speakerAccent": "Canadian"
    },
    {
        "audioScript": "Attention shoppers! We are excited to announce a special sale happening this weekend at our downtown store. All winter clothing, including toques and jackets, will be 30% off. Don't miss this opportunity to update your wardrobe with the latest styles. What is being advertised in this announcement? A new store opening. A weekend sale on winter clothing. A special event for members. A clearance sale on electronics.",
        "jpnAudioScript": "お客様にお知らせです！今週末、ダウンタウンの店舗で特別セールを開催します。トークやジャケットを含むすべての冬服が30％オフになります。この機会に最新のスタイルでワードローブを更新することをお見逃しなく。このアナウンスで宣伝されているのは何ですか？新しい店舗のオープン。冬服の週末セール。会員向けの特別イベント。電子機器のクリアランスセール。",
        "answerOption": "D",
        "sectionNumber": 4,
        "explanation": "正解はDです。このアナウンスは、冬服の週末セールについての情報を提供しています。他の選択肢はアナウンスの内容と一致しません。'toques'はカナダ英語で冬用の帽子を指します。リスニングの際には、'sale'や'30% off'といったキーワードに注意を払いましょう。カナダ英語の特徴として、'about'が'aboot'のように聞こえることがあります。",
        "speakerAccent": "Canadian"
    },
    {
        "audioScript": "G'day everyone. This is a reminder that the company picnic will be held this Saturday at the local park. We'll start at 10 AM and go until 4 PM. Please bring your own brekkie and lunch. We'll provide drinks and snacks. What is the main topic of this announcement? A company picnic. A business meeting. A training session. A charity event.",
        "jpnAudioScript": "皆さん、こんにちは。今週の土曜日に地元の公園で会社のピクニックが開催されることをお知らせします。午前10時から午後4時まで行います。朝食と昼食は各自でご持参ください。飲み物とスナックは提供します。このアナウンスの主なトピックは何ですか？会社のピクニック。ビジネス会議。トレーニングセッション。チャリティーイベント。",
        "answerOption": "A",
        "sectionNumber": 4,
        "explanation": "正解はAです。このアナウンスは、会社のピクニックについての情報を提供しています。他の選択肢はアナウンスの内容と一致しません。'brekkie'はオーストラリア英語で朝食を指します。リスニングの際には、'picnic'や'local park'といったキーワードに注意を払いましょう。オーストラリア英語の特徴として、'day'が'die'のように聞こえることがあります。",
        "speakerAccent": "Australian"
    },
    {
        "audioScript": "Hello everyone. Just a quick note to let you know that the office will be closed next Monday for a public holiday. Please make sure to complete any urgent tasks by this Friday. Enjoy your long weekend! What is the speaker informing the listeners about? A change in office hours. A public holiday. A new office location. A staff meeting.",
        "jpnAudioScript": "皆さん、こんにちは。来週の月曜日は祝日のためオフィスが閉鎖されることをお知らせします。金曜日までに緊急のタスクを完了してください。良い週末をお過ごしください！話者はリスナーに何を知らせていますか？オフィスの営業時間の変更。祝日。新しいオフィスの場所。スタッフ会議。",
        "answerOption": "C",
        "sectionNumber": 4,
        "explanation": "正解はCです。このアナウンスは、祝日のためオフィスが閉鎖されることを伝えています。他の選択肢はアナウンスの内容と一致しません。'public holiday'は祝日を指します。リスニングの際には、'closed'や'public holiday'といったキーワードに注意を払いましょう。オーストラリア英語の特徴として、'night'が'noight'のように聞こえることがあります。",
        "speakerAccent": "Australian"
    },
    {
        "audioScript": "Good afternoon, passengers. This is your captain speaking. We are currently cruising at an altitude of 35,000 feet. The weather ahead looks pretty good, so we expect a smooth flight. Please sit back, relax, and enjoy the rest of the journey. What is the captain mainly talking about? The current altitude. The weather conditions. The flight duration. The destination city.",
        "jpnAudioScript": "乗客の皆様、こんにちは。こちらは機長です。現在、35,000フィートの高度で巡航中です。前方の天候は良好で、順調な飛行が期待されます。どうぞおくつろぎいただき、旅をお楽しみください。機長は主に何について話していますか？現在の高度。天候の状況。飛行時間。目的地の都市。",
        "answerOption": "B",
        "sectionNumber": 4,
        "explanation": "正解はBです。このアナウンスは、天候の状況についての情報を提供しています。他の選択肢はアナウンスの内容と一致しません。'cruising at an altitude'は飛行機が一定の高度で飛行していることを指します。リスニングの際には、'weather'や'smooth flight'といったキーワードに注意を払いましょう。カナダ英語の特徴として、'about'が'aboot'のように聞こえることがあります。",
        "speakerAccent": "Canadian"
    }
]

/*import { GeneratedQuestionDataResDTO } from '../listening-quiz-transactions/lquiz.dto.ts';
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
main().catch(console.error);*/