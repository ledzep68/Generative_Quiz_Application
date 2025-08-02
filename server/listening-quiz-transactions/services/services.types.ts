export const ACCENT_PATTERNS = {
   American: {
       description: "アメリカ英語",
       characteristics: [
           "Rhoticity: 語尾のrを明確に発音 (car, better, quarter)",
           "Flat 'a': cat, hat, last等で平坦な'a'音",
           "T-flapping: better → 'bedder', water → 'wadder'のような音",
           "語尾の't'の弱化: mountain → 'moun'in', important → 'impor'ant'",
           "Cot-caught merger: hotとhaughtが同じ音に聞こえる",
           "Dark L: 語尾のLが暗い音になる (call, will)",
           "Schwa reduction: unstressed syllablesで母音が曖昧音に",
           "Stress-timed rhythm: 強勢のある音節を基準とするリズム"
       ],
       vocabulary: [
           "elevator (not lift)", "apartment (not flat)", "truck (not lorry)", "gas (not petrol)",
           "vacation (not holiday)", "cookie (not biscuit)", "candy (not sweets)",
           "drugstore/pharmacy (not chemist)", "movies (not cinema)", "fall (not autumn)",
           "garbage/trash (not rubbish)", "restroom (not toilet)", "parking lot (not car park)",
           "flashlight (not torch)", "cell phone (not mobile)", "sidewalk (not pavement)"
       ],
       expressions: [
           "I guess...", "You bet!", "Sure thing", "No problem", 
           "That sounds good", "I'm good", "Sounds great", "You're welcome",
           "How's it going?", "Take care", "Have a good day", "Of course",
           "I think so", "That works for me", "I'd be happy to", "Thank you so much"
       ]
   },
   Canadian: {
       description: "カナダ英語",
       characteristics: [
           "Canadian raising: about → 'aboot', house → 'hoose'のような音",
           "アメリカ英語に近いがイギリス英語の語彙・スペルも使用",
           "語尾の'eh'の使用: It's cold, eh?",
           "'ou'音の特徴的な発音: out, about, house",
           "Bag vowel: bag → 'bayg'のような音",
           "Canadian shift: bit → 'bet', bet → 'bat'の方向への音変化",
           "Moderate rhoticity: アメリカほど強くないR音",
           "Mixed spelling: colour, centre等のイギリス式スペル使用"
       ],
       vocabulary: [
           "washroom (not bathroom/toilet)", "toque (winter hat)", "loonie (one dollar coin)",
           "double-double (coffee with cream and sugar)", "toonie (two dollar coin)",
           "chesterfield (sofa/couch)", "runners (sneakers)", "serviette (napkin)",
           "hydro (electricity)", "pop (soda)", "parkade (parking garage)",
           "pencil crayon (colored pencil)", "bachelor (studio apartment)",
           "holiday (vacation)", "colour (color)", "centre (center)"
       ],
       expressions: [
           "That's pretty good", "No worries", "Take care", "You betcha",
           "Not too bad", "That would be great", "How are you doing?", 
           "Thank you very much", "I appreciate it", "That works", "Certainly",
           "How's it going, eh?", "That sounds fine", "I'd be pleased to"
       ]
   },
   British: {
       description: "イギリス英語",
       characteristics: [
           "Non-rhotic: 語尾のrを発音しない (car, better, quarter)",
           "Received Pronunciation (RP)の特徴: clear articulation",
           "'a'音の長さの違い: bath → 'baath', dance → 'daance'",
           "Clear distinction of short and long vowels",
           "Glottal stop: better → 'be'er', water → 'wa'er'",
           "Dark L weakening: 語尾のLが弱くなる、時に消失",
           "Linking R: idea of → 'idea-r-of'",
           "Yod coalescence: tune → 'chune', duke → 'juke'"
       ],
       vocabulary: [
           "lift (not elevator)", "flat (not apartment)", "lorry (not truck)", "petrol (not gas)",
           "holiday (not vacation)", "biscuit (not cookie)", "sweets (not candy)",
           "chemist (not drugstore)", "cinema (not movies)", "autumn (not fall)",
           "rubbish (not garbage)", "toilet/loo (not restroom)", "car park (not parking lot)",
           "torch (not flashlight)", "mobile (not cell phone)", "pavement (not sidewalk)",
           "queue (not line)", "jumper (not sweater)", "rubber (eraser)"
       ],
       expressions: [
           "Brilliant!", "Quite right", "I'm afraid...", "Rather good",
           "How do you do?", "Thank you very much", "I dare say", "Fair enough",
           "Not to worry", "Well done", "That's lovely", "I should think so",
           "Cheers", "I reckon...", "Quite so", "Indeed", "Certainly"
       ]
   },
   Australian: {
       description: "オーストラリア英語",
       characteristics: [
           "Vowel shifts: 'day' → 'die', 'night' → 'noight'のような音",
           "Rising intonation: 平叙文でも語尾が上がる (High Rising Terminal)",
           "Short vowel changes: 'bit' → 'bet', 'bet' → 'bat'のような音変化",
           "Consonant reduction: 'going' → 'goin'', 'nothing' → 'nothin''",
           "Broad, General, Cultivated の3つのアクセントレベル",
           "Yod-dropping: tune → 'toon', duke → 'dook'",
           "L-vocalization: 語尾のLが母音化 (milk → 'miok')",
           "Non-rhotic tendency: イギリス英語的な特徴"
       ],
       vocabulary: [
           "arvo (afternoon)", "brekkie (breakfast)", "uni (university)", "mate (friend)",
           "barbie (barbecue)", "servo (service station)", "bottle shop (liquor store)",
           "footy (football)", "sunnies (sunglasses)", "thongs (flip-flops)",
           "ute (pickup truck)", "esky (cooler)", "tucker (food)",
           "bloke (man)", "sheila (woman)", "fair dinkum (genuine/true)"
       ],
       expressions: [
           "No worries", "Good on you", "How are you going?", "Too right",
           "That's great", "No problem at all", "Thank you", "Certainly",
           "I'd be pleased to", "That sounds fine", "Absolutely", "Of course",
           "She'll be right", "Fair dinkum", "How's it going?", "Cheers"
       ]
   }
};

export const TTS_VOICE_CONFIG = {
    American: {
        languageCode: 'en-US',
        voices: [
            { name: 'en-US-Neural2-A', gender: 'FEMALE' },
            { name: 'en-US-Neural2-C', gender: 'FEMALE' },
            { name: 'en-US-Neural2-D', gender: 'MALE' },
            { name: 'en-US-Neural2-F', gender: 'MALE' }
        ]
    },
    Canadian: {
        languageCode: 'en-US', // カナダ英語は en-US で代用
        voices: [
            { name: 'en-US-Neural2-A', gender: 'FEMALE' },
            { name: 'en-US-Neural2-D', gender: 'MALE' }
        ]
    },
    British: {
        languageCode: 'en-GB',
        voices: [
            { name: 'en-GB-Neural2-A', gender: 'FEMALE' },
            { name: 'en-GB-Neural2-B', gender: 'MALE' },
            { name: 'en-GB-Neural2-C', gender: 'FEMALE' },
            { name: 'en-GB-Neural2-D', gender: 'MALE' }
        ]
    },
    Australian: {
        languageCode: 'en-AU',
        voices: [
            { name: 'en-AU-Neural2-A', gender: 'FEMALE' },
            { name: 'en-AU-Neural2-B', gender: 'MALE' },
            { name: 'en-AU-Neural2-C', gender: 'FEMALE' },
            { name: 'en-AU-Neural2-D', gender: 'MALE' }
        ]
    }
} as const; //リテラル型の保持、readonlyによる値の変更防止 によって設定値の予期しない変更を防ぎ、より厳密な型チェックが可能になる

//Part別関連性のあるシナリオ設定
export const partSpecificScenarios = {
   1: [ // 写真描写問題
       // 職場シーン: オフィス、会議室、工場での人物描写
       { location: "オフィス", speaker: "社員", situation: "デスクワーク中" },
       { location: "オフィス", speaker: "管理職", situation: "書類確認中" },
       { location: "会議室", speaker: "社員", situation: "プレゼン準備中" },
       { location: "会議室", speaker: "役員", situation: "会議参加中" },
       { location: "工場", speaker: "技術者", situation: "機械点検中" },
       { location: "工場", speaker: "作業員", situation: "製造作業中" },
       
       // 交通・移動: 駅、空港、バス停、道路での場面
       { location: "駅", speaker: "乗客", situation: "電車待ち中" },
       { location: "駅", speaker: "駅員", situation: "案内業務中" },
       { location: "空港", speaker: "乗客", situation: "搭乗待ち中" },
       { location: "空港", speaker: "案内係", situation: "チェックイン対応中" },
       { location: "バス停", speaker: "乗客", situation: "バス待ち中" },
       { location: "道路", speaker: "歩行者", situation: "横断中" },
       
       // 商業施設: 店舗、レストラン、銀行での活動
       { location: "デパート", speaker: "客", situation: "買い物中" },
       { location: "デパート", speaker: "店員", situation: "接客中" },
       { location: "レストラン", speaker: "客", situation: "食事中" },
       { location: "レストラン", speaker: "ウェイター", situation: "注文受付中" },
       { location: "銀行", speaker: "客", situation: "手続き中" },
       { location: "銀行", speaker: "窓口係", situation: "応対中" },
       
       // 屋外活動: 公園、建設現場、イベント会場
       { location: "公園", speaker: "来園者", situation: "散歩中" },
       { location: "公園", speaker: "子供", situation: "遊具使用中" },
       { location: "建設現場", speaker: "作業員", situation: "建設作業中" },
       { location: "建設現場", speaker: "監督", situation: "現場確認中" },
       { location: "イベント会場", speaker: "参加者", situation: "イベント参加中" },
       { location: "イベント会場", speaker: "スタッフ", situation: "会場準備中" },
       
       // 日常生活: 家庭、病院、学校での様子
       { location: "病院", speaker: "患者", situation: "診察待ち中" },
       { location: "病院", speaker: "医師", situation: "診察中" },
       { location: "学校", speaker: "学生", situation: "授業受講中" },
       { location: "学校", speaker: "教師", situation: "授業中" }
   ],
   
   2: [ // 応答問題
       // 業務確認: スケジュール、タスク、進捗に関する質問
       { location: "オフィス", speaker: "社員", situation: "スケジュール確認" },
       { location: "オフィス", speaker: "管理職", situation: "タスク確認" },
       { location: "会議室", speaker: "チームリーダー", situation: "進捗確認" },
       { location: "工場", speaker: "現場監督", situation: "作業進捗確認" },
       
       // 場所・方向: 位置、道順、施設に関する質問
       { location: "駅", speaker: "乗客", situation: "道順質問" },
       { location: "空港", speaker: "旅行者", situation: "施設案内質問" },
       { location: "病院", speaker: "来院者", situation: "場所確認" },
       { location: "大学", speaker: "学生", situation: "教室案内質問" },
       { location: "ホテル", speaker: "宿泊客", situation: "施設案内質問" },
       
       // 提案・依頼: 協力、参加、変更に関する質問
       { location: "オフィス", speaker: "同僚", situation: "協力依頼" },
       { location: "会議室", speaker: "管理職", situation: "参加依頼" },
       { location: "大学", speaker: "教授", situation: "研究協力依頼" },
       { location: "イベント会場", speaker: "主催者", situation: "参加依頼" },
       
       // 情報確認: 時間、費用、条件に関する質問
       { location: "レストラン", speaker: "客", situation: "料金確認" },
       { location: "ホテル", speaker: "宿泊客", situation: "チェックイン時間確認" },
       { location: "銀行", speaker: "客", situation: "手数料確認" },
       { location: "薬局", speaker: "患者", situation: "服薬条件確認" },
       
       // 意見・評価: 感想、判断、選択に関する質問
       { location: "レストラン", speaker: "友人", situation: "料理評価質問" },
       { location: "映画館", speaker: "友人", situation: "映画感想質問" },
       { location: "オフィス", speaker: "上司", situation: "提案評価質問" },
       { location: "大学", speaker: "教授", situation: "研究評価質問" }
   ],
   
   3: [ // 会話問題
       // ビジネス会話: 会議、商談、プロジェクト相談
       { location: "会議室", speaker: "管理職", situation: "定例会議" },
       { location: "オフィス", speaker: "営業", situation: "商談" },
       { location: "会議室", speaker: "プロジェクトマネージャー", situation: "プロジェクト相談" },
       { location: "銀行", speaker: "融資担当", situation: "融資相談" },
       
       // 顧客対応: 苦情処理、注文、予約、問い合わせ
       { location: "コールセンター", speaker: "オペレーター", situation: "苦情処理" },
       { location: "レストラン", speaker: "店員", situation: "注文受付" },
       { location: "ホテル", speaker: "受付", situation: "予約対応" },
       { location: "病院", speaker: "受付", situation: "診察予約" },
       { location: "旅行代理店", speaker: "スタッフ", situation: "旅行相談" },
       
       // 同僚間対話: 協力、情報共有、スケジュール調整
       { location: "オフィス", speaker: "同僚", situation: "協力相談" },
       { location: "オフィス", speaker: "チームメンバー", situation: "情報共有" },
       { location: "会議室", speaker: "プロジェクトメンバー", situation: "スケジュール調整" },
       { location: "研究所", speaker: "研究員", situation: "研究情報共有" },
       
       // サービス利用: 修理依頼、予約変更、相談
       { location: "修理工場", speaker: "客", situation: "修理依頼" },
       { location: "病院", speaker: "患者", situation: "予約変更" },
       { location: "法律事務所", speaker: "相談者", situation: "法律相談" },
       { location: "不動産会社", speaker: "顧客", situation: "物件相談" },
       
       // 学術・研修: 講義、セミナー、研究に関する会話
       { location: "大学", speaker: "教授", situation: "講義討論" },
       { location: "セミナー会場", speaker: "講師", situation: "研修指導" },
       { location: "研究所", speaker: "研究者", situation: "研究討論" },
       { location: "図書館", speaker: "司書", situation: "資料相談" }
   ],
   
   4: [ // 説明文問題
       // アナウンス: 交通機関、施設、緊急事態
       { location: "空港", speaker: "空港職員", situation: "搭乗案内" },
       { location: "駅", speaker: "駅員", situation: "運行情報" },
       { location: "病院", speaker: "看護師", situation: "診察案内" },
       { location: "デパート", speaker: "店内放送", situation: "営業案内" },
       { location: "オフィス", speaker: "防災担当", situation: "避難訓練案内" },
       { location: "学校", speaker: "事務員", situation: "緊急連絡" },
       
       // 広告: 商品、サービス、イベント宣伝
       { location: "ラジオ局", speaker: "アナウンサー", situation: "商品広告" },
       { location: "テレビ局", speaker: "ナレーター", situation: "サービス紹介" },
       { location: "イベント会場", speaker: "司会者", situation: "イベント宣伝" },
       { location: "展示会場", speaker: "説明員", situation: "製品紹介" },
       
       // 会議・プレゼン: ビジネス報告、企画提案
       { location: "会議室", speaker: "部長", situation: "四半期報告" },
       { location: "プレゼン会場", speaker: "営業部", situation: "企画提案" },
       { location: "株主総会会場", speaker: "社長", situation: "業績報告" },
       { location: "オフィス", speaker: "プロジェクトリーダー", situation: "進捗報告" },
       
       // 講演: 学術、研修、セミナー
       { location: "大学", speaker: "教授", situation: "学術講演" },
       { location: "研修センター", speaker: "講師", situation: "技術研修" },
       { location: "セミナー会場", speaker: "専門家", situation: "専門セミナー" },
       { location: "コンベンションセンター", speaker: "基調講演者", situation: "基調講演" },
       
       // レポート: ニュース、調査結果、進捗報告
       { location: "放送局", speaker: "記者", situation: "ニュース報告" },
       { location: "研究所", speaker: "研究員", situation: "調査結果発表" },
       { location: "会議室", speaker: "調査担当", situation: "市場調査報告" },
       { location: "オフィス", speaker: "マネージャー", situation: "月次報告" },
       
       // 説明: 手順、ルール、システム解説
       { location: "研修室", speaker: "インストラクター", situation: "操作手順説明" },
       { location: "オフィス", speaker: "システム管理者", situation: "システム説明" },
       { location: "銀行", speaker: "窓口係", situation: "手続き説明" },
       { location: "病院", speaker: "薬剤師", situation: "服薬指導" },
       
       // インタビュー: 専門家、経験者への質問
       { location: "テレビ局", speaker: "インタビュアー", situation: "専門家インタビュー" },
       { location: "ラジオ局", speaker: "司会者", situation: "ゲストインタビュー" },
       { location: "雑誌社", speaker: "編集者", situation: "取材インタビュー" },
       { location: "大学", speaker: "学生記者", situation: "教授インタビュー" },
       
       // 案内: 施設、イベント、サービスガイド
       { location: "博物館", speaker: "ガイド", situation: "展示案内" },
       { location: "観光地", speaker: "観光ガイド", situation: "観光案内" },
       { location: "ホテル", speaker: "コンシェルジュ", situation: "施設案内" },
       { location: "空港", speaker: "案内係", situation: "空港サービス案内" },
       { location: "病院", speaker: "案内係", situation: "病院施設案内" }
   ]
};