import session from 'express-session';

declare module 'express-session' {
    interface SessionData {
        questionSet?: {
            sectionNumber: 1 | 2 | 3 | 4;
            //問題番号管理用パラメータ
            totalQuestionNum: number;
            currentIndex: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
            //問題生成用パラメータ
            speakerList?: string[]; //Part2専用
            speakerAccentList: ("American"|"British"|"Australian"|"Canadian")[];
            settingList: { location: string; speaker: string; situation: string; }[];
            contentTopicInstructionList?: string[]; //Part3,4専用
            contentFrameworkTextList?: string[]; //Part3,4専用
            //音声生成用パラメータ
            speakingRate?: number;
        }
    }
};

//audioScriptタグ構造定義用
//基本的な話者パターン定義
export type GenderPattern = 'MALE' | 'FEMALE';
export type SpeakerTag = `[Speaker${number}_${GenderPattern}]`;
//Part別の話者パターン（ナレーターは除く）
export const SPEAKER_PATTERNS = {
    part1: [
        { pattern: 'male_speaker', speakers: ['[Speaker1_MALE]'] as const },
        { pattern: 'female_speaker', speakers: ['[Speaker1_FEMALE]'] as const }
    ],
    part2: [
        { pattern: 'male_to_female', speakers: ['[Speaker1_MALE]', '[Speaker2_FEMALE]'] as const },
        { pattern: 'female_to_male', speakers: ['[Speaker1_FEMALE]', '[Speaker2_MALE]'] as const },
        { pattern: 'male_to_male', speakers: ['[Speaker1_MALE]', '[Speaker2_MALE]'] as const },
        { pattern: 'female_to_female', speakers: ['[Speaker1_FEMALE]', '[Speaker2_FEMALE]'] as const }
    ],
    part3: [
        { pattern: 'male_female', speakers: ['[Speaker1_MALE]', '[Speaker2_FEMALE]'] as const },
        { pattern: 'female_male', speakers: ['[Speaker1_FEMALE]', '[Speaker2_MALE]'] as const },
        { pattern: 'male_male', speakers: ['[Speaker1_MALE]', '[Speaker2_MALE]'] as const },
        { pattern: 'female_female', speakers: ['[Speaker1_FEMALE]', '[Speaker2_FEMALE]'] as const }
    ],
    part4: [
        { pattern: 'female_presenter', speakers: ['[Speaker1_FEMALE]'] as const },
        { pattern: 'male_presenter', speakers: ['[Speaker1_MALE]'] as const }
    ]
} as const;

export const JPN_AUDIO_SCRIPT_FORMAT = {
    1: `写真描写問題
選択肢: A. [Choice 1 in Japanese] B. [Choice 2 in Japanese] C. [Choice 3 in Japanese] D. [Choice 4 in Japanese]`,
    
    2: `質問・応答問題
設問文: [話者1 男性/女性] [Question/Comment in Japanese] 
選択肢: [話者2 男性/女性] A. [Choice 1 in Japanese] B. [Choice 2 in Japanese] C. [Choice 3 in Japanese]`,
    
    3: `会話問題
会話内容: [Conversation in Japanese with speaker labels]
設問1: [Question 1 in Japanese] 
選択肢: A. [Choice 1 in Japanese] B. [Choice 2 in Japanese] C. [Choice 3 in Japanese] D. [Choice 4 in Japanese] 
設問2: [Question 2 in Japanese] 
選択肢: A. [Choice 1 in Japanese] B. [Choice 2 in Japanese] C. [Choice 3 in Japanese] D. [Choice 4 in Japanese] 
設問3: [Question 3 in Japanese] 
選択肢: A. [Choice 1 in Japanese] B. [Choice 2 in Japanese] C. [Choice 3 in Japanese] D. [Choice 4 in Japanese]`,
    
    4: `説明文問題
スピーチ内容: [話者1 男性/女性] [Speech in Japanese] 
設問1: [Question 1 in Japanese] 
選択肢: A. [Choice 1 in Japanese] B. [Choice 2 in Japanese] C. [Choice 3 in Japanese] D. [Choice 4 in Japanese] 
設問2: [Question 2 in Japanese] 
選択肢: A. [Choice 1 in Japanese] B. [Choice 2 in Japanese] C. [Choice 3 in Japanese] D. [Choice 4 in Japanese] 
設問3: [Question 3 in Japanese] 
選択肢: A. [Choice 1 in Japanese] B. [Choice 2 in Japanese] C. [Choice 3 in Japanese] D. [Choice 4 in Japanese]`
};
//例: [話者1 男性] おはようございます。サラ。休日はどうでしたか? [話者1 女性] 最高でした! 家族とハイキングに行きましたよ。 [話者1 男性] いいですね。どこに行ったんですか？

export const ACCENT_PATTERNS = {
   American: {
       description: "American English",
       characteristics: [
           "Rhoticity: Clear pronunciation of final 'r' (car, better, quarter)",
           "Flat 'a': Flat 'a' sound in cat, hat, last, etc.",
           "T-flapping: Sounds like better → 'bedder', water → 'wadder'",
           "Final 't' weakening: mountain → 'moun'in', important → 'impor'ant'",
           "Cot-caught merger: Hot and haught sound the same",
           "Dark L: Final L becomes a dark sound (call, will)",
           "Schwa reduction: Vowels become schwa in unstressed syllables",
           "Stress-timed rhythm: Rhythm based on stressed syllables"
       ],
       vocabulary: [
           "elevator (not lift)", "apartment (not flat)", "truck (not lorry)", "gas (not petrol)",
           "vacation (not holiday)", "cookie (not biscuit)", "candy (not sweets)",
           "drugstore/pharmacy (not chemist)", "movies (not cinema)", "fall (not autumn)",
           "garbage/trash (not rubbish)", "restroom (not toilet)", "parking lot (not car park)",
           "flashlight (not torch)", "cell phone (not mobile)", "sidewalk (not pavement)"
       ],
       expressions: [
           "Certainly", "Of course", "No problem", "That sounds good", 
           "Sounds great", "You're welcome", "How are you today?", "Have a good day",
           "I think so", "That works for me", "I'd be happy to", "Thank you very much",
           "I'd be pleased to help", "That would be fine", "Absolutely"
       ]
   },
   Canadian: {
       description: "Canadian English",
       characteristics: [
           "Canadian raising: Sounds like about → 'aboot', house → 'hoose'",
           "Similar to American English but uses British vocabulary and spelling",
           "Distinctive 'ou' pronunciation: out, about, house",
           "Bag vowel: Sounds like bag → 'bayg'",
           "Canadian shift: Sound changes toward bit → 'bet', bet → 'bat'",
           "Moderate rhoticity: R sound not as strong as American",
           "Mixed spelling: Uses British spelling like colour, centre"
       ],
       vocabulary: [
           "washroom (not bathroom/toilet)", "toque (winter hat)", "loonie (one dollar coin)",
           "toonie (two dollar coin)", "runners (sneakers)", 
           "holiday (vacation)", "colour (color)", "centre (center)",
           "cheque (check)", "programme (program)"
       ],
       expressions: [
           "Certainly", "Of course", "No problem", "That would be great", 
           "How are you today?", "Thank you very much", "I appreciate it", 
           "That works", "How are you doing?", "That sounds fine", 
           "I'd be pleased to", "Absolutely", "I'd be happy to help"
       ]
   },
   British: {
       description: "British English",
       characteristics: [
           "Non-rhotic: Final 'r' not pronounced (car, better, quarter)",
           "Received Pronunciation (RP) features: clear articulation",
           "'a' sound length differences: bath → 'baath', dance → 'daance'",
           "Clear distinction of short and long vowels",
           "Glottal stop: better → 'be'er', water → 'wa'er'",
           "Dark L weakening: Final L weakens, sometimes disappears",
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
           "Certainly", "Of course", "I'm afraid...", "Thank you very much", 
           "How do you do?", "That's excellent", "Well done", "That's lovely", 
           "I should think so", "Indeed", "Quite right", "Fair enough",
           "I'd be pleased to", "That would be fine", "Absolutely"
       ]
   },
   Australian: {
       description: "Australian English",
       characteristics: [
           "Vowel shifts: Sounds like 'day' → 'die', 'night' → 'noight'",
           "Rising intonation: Even declarative sentences end with rising tone (High Rising Terminal)",
           "Short vowel changes: Sound changes like 'bit' → 'bet', 'bet' → 'bat'",
           "Consonant reduction: 'going' → 'goin'', 'nothing' → 'nothin''",
           "Three accent levels: Broad, General, Cultivated",
           "Yod-dropping: tune → 'toon', duke → 'dook'",
           "L-vocalization: Final L becomes vowel-like (milk → 'miok')",
           "Non-rhotic tendency: British English-like features"
       ],
       vocabulary: [
           "university (not uni)", "afternoon (not arvo)", "breakfast (not brekkie)", 
           "friend (not mate)", "barbecue (not barbie)", "service station (not servo)", 
           "bottle shop (liquor store)", "football (not footy)", "sunglasses (not sunnies)", 
           "flip-flops (not thongs)", "pickup truck (not ute)", "cooler (not esky)"
       ],
       expressions: [
           "Certainly", "Of course", "No problem", "That's excellent", 
           "How are you today?", "Thank you", "I'd be pleased to", 
           "That sounds fine", "Absolutely", "How are you going?",
           "I'd be happy to help", "That would be great"
       ]
   }
};

//WaveNetの音声設定
export const TTS_VOICE_CONFIG = {
    American: {
        languageCode: 'en-US',
        voices: [
            { name: 'en-US-Wavenet-A', gender: 'MALE' },
            { name: 'en-US-Wavenet-B', gender: 'MALE' },
            { name: 'en-US-Wavenet-C', gender: 'FEMALE' },
            { name: 'en-US-Wavenet-D', gender: 'MALE' },
            { name: 'en-US-Wavenet-E', gender: 'FEMALE' },
            { name: 'en-US-Wavenet-F', gender: 'FEMALE' }
        ]
    },
    Canadian: {
        languageCode: 'en-US', // カナダ英語は en-US で代用
        voices: [
            { name: 'en-US-Wavenet-C', gender: 'FEMALE' },
            { name: 'en-US-Wavenet-B', gender: 'MALE' }
        ]
    },
    British: {
        languageCode: 'en-GB',
        voices: [
            { name: 'en-GB-Wavenet-A', gender: 'FEMALE' },
            { name: 'en-GB-Wavenet-B', gender: 'MALE' },
            { name: 'en-GB-Wavenet-C', gender: 'FEMALE' },
            { name: 'en-GB-Wavenet-D', gender: 'MALE' }
        ]
    },
    Australian: {
        languageCode: 'en-AU',
        voices: [
            { name: 'en-AU-Wavenet-A', gender: 'FEMALE' },
            { name: 'en-AU-Wavenet-B', gender: 'MALE' },
            { name: 'en-AU-Wavenet-C', gender: 'FEMALE' },
            { name: 'en-AU-Wavenet-D', gender: 'MALE' }
        ]
    }
} as const; //リテラル型の保持、readonlyによる値の変更防止 によって設定値の予期しない変更を防ぎ、より厳密な型チェックが可能になる
/*
Neural2版
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
*/

//part別単語数指定
export const WORD_CONSTRAINTS = {
    1: { 
        "description": {
            min: 15,
            max: 25,
            unit: "words"
        },
        "questionText": {
            min: 5,
            max: 10,
            unit: "words"
        },
        "choices": {
            min: 4,
            max: 10,
            unit: "words"
        },
        "questionsCount": 1,
        "totalWords": {
            min: 40,
            max: 70,
            unit: "words"
        }
    },
    2: { 
        "question": {
            min: 5,
            max: 12,
            unit: "words"
        },
        "responses": {
            min: 1,
            max: 5,
            unit: "words"
        },
        "questionsCount": 1,
        "choicesPerQuestion": 3,
        "totalWords": {
            min: 11,
            max: 30,
            unit: "words"
        }
    },
    3: { 
        "conversation": {
            min: 60,
            max: 100,
            unit: "words"
        },
        "questionText": {
            min: 5,
            max: 10,
            unit: "words"
        },
        "choices": {
            min: 2,
            max: 7,
            unit: "words"
        },
        "questionsCount": 3,
        "choicesPerQuestion": 4,
        "totalWords": {
            min: 150,
            max: 250,
            unit: "words"
        }
    },
    4: { 
        "speech": {
            min: 100,
            max: 120,
            unit: "words"
        },
        "questionText": {
            min: 5,
            max: 10,
            unit: "words"
        },
        "choices": {
            min: 2,
            max: 7,
            unit: "words"
        },
        "questionsCount": 3,
        "choicesPerQuestion": 4,
        "totalWords": {
            min: 150,
            max: 250,
            unit: "words"
        }
    }
};

//Part別関連性のあるシナリオ設定
export const PART_SPECIFIC_SCENARIOS = {
   1: [ // 写真描写問題
       // 職場シーン: オフィス、会議室、工場での人物描写
       { location: "Office", speaker: "Employee", situation: "Working at desk" },
       { location: "Office", speaker: "Manager", situation: "Reviewing documents" },
       { location: "Meeting room", speaker: "Employee", situation: "Preparing presentation" },
       { location: "Meeting room", speaker: "Executive", situation: "Participating in meeting" },
       { location: "Factory", speaker: "Technician", situation: "Inspecting machinery" },
       { location: "Factory", speaker: "Worker", situation: "Manufacturing work" },
       
       // 交通・移動: 駅、空港、バス停、道路での場面
       { location: "Station", speaker: "Passenger", situation: "Waiting for train" },
       { location: "Station", speaker: "Station staff", situation: "Providing guidance" },
       { location: "Airport", speaker: "Passenger", situation: "Waiting for boarding" },
       { location: "Airport", speaker: "Information desk", situation: "Handling check-in" },
       { location: "Bus stop", speaker: "Passenger", situation: "Waiting for bus" },
       { location: "Road", speaker: "Pedestrian", situation: "Crossing" },
       
       // 商業施設: 店舗、レストラン、銀行での活動
       { location: "Department store", speaker: "Customer", situation: "Shopping" },
       { location: "Department store", speaker: "Staff", situation: "Customer service" },
       { location: "Restaurant", speaker: "Customer", situation: "Dining" },
       { location: "Restaurant", speaker: "Waiter", situation: "Taking orders" },
       { location: "Bank", speaker: "Customer", situation: "Processing procedures" },
       { location: "Bank", speaker: "Teller", situation: "Customer service" },
       
       // 屋外活動: 公園、建設現場、イベント会場
       { location: "Park", speaker: "Visitor", situation: "Walking" },
       { location: "Park", speaker: "Child", situation: "Using playground equipment" },
       { location: "Construction site", speaker: "Worker", situation: "Construction work" },
       { location: "Construction site", speaker: "Supervisor", situation: "Site inspection" },
       { location: "Event venue", speaker: "Participant", situation: "Attending event" },
       { location: "Event venue", speaker: "Staff", situation: "Venue preparation" },
       
       // Daily life: Home, hospital, school situations
       { location: "Hospital", speaker: "Patient", situation: "Waiting for examination" },
       { location: "Hospital", speaker: "Doctor", situation: "Conducting examination" },
       { location: "School", speaker: "Student", situation: "Attending class" },
       { location: "School", speaker: "Teacher", situation: "Teaching class" }
   ],
   
   2: [ // Response problems
       // Work confirmation: Schedule, task, progress-related questions
       { location: "Office", speaker: "Employee", situation: "Schedule confirmation" },
       { location: "Office", speaker: "Manager", situation: "Task confirmation" },
       { location: "Meeting room", speaker: "Team leader", situation: "Progress confirmation" },
       { location: "Factory", speaker: "Site supervisor", situation: "Work progress confirmation" },
       
       // Location/Direction: Position, directions, facility-related questions
       { location: "Station", speaker: "Passenger", situation: "Asking for directions" },
       { location: "Airport", speaker: "Traveler", situation: "Facility information inquiry" },
       { location: "Hospital", speaker: "Visitor", situation: "Location confirmation" },
       { location: "University", speaker: "Student", situation: "Classroom direction inquiry" },
       { location: "Hotel", speaker: "Guest", situation: "Facility information inquiry" },
       
       // Suggestions/Requests: Cooperation, participation, change-related questions
       { location: "Office", speaker: "Colleague", situation: "Request for cooperation" },
       { location: "Meeting room", speaker: "Manager", situation: "Participation request" },
       { location: "University", speaker: "Professor", situation: "Research cooperation request" },
       { location: "Event venue", speaker: "Organizer", situation: "Participation invitation" },
       
       // Information confirmation: Time, cost, condition-related questions
       { location: "Restaurant", speaker: "Customer", situation: "Price confirmation" },
       { location: "Hotel", speaker: "Guest", situation: "Check-in time confirmation" },
       { location: "Bank", speaker: "Customer", situation: "Fee confirmation" },
       { location: "Pharmacy", speaker: "Patient", situation: "Medication condition confirmation" },
       
       // Opinions/Evaluation: Impressions, judgment, choice-related questions
       { location: "Restaurant", speaker: "Friend", situation: "Food evaluation question" },
       { location: "Movie theater", speaker: "Friend", situation: "Movie impression question" },
       { location: "Office", speaker: "Boss", situation: "Proposal evaluation question" },
       { location: "University", speaker: "Professor", situation: "Research evaluation question" }
   ],
   
   3: [ // Conversation problems
       // Business conversations: Meetings, negotiations, project consultations
       { location: "Meeting room", speaker: "Manager", situation: "Regular meeting" },
       { location: "Office", speaker: "Sales", situation: "Business negotiation" },
       { location: "Meeting room", speaker: "Project manager", situation: "Project consultation" },
       { location: "Bank", speaker: "Loan officer", situation: "Loan consultation" },
       
       // Customer service: Complaint handling, orders, reservations, inquiries
       { location: "Call center", speaker: "Operator", situation: "Complaint handling" },
       { location: "Restaurant", speaker: "Staff", situation: "Order taking" },
       { location: "Hotel", speaker: "Reception", situation: "Reservation handling" },
       { location: "Hospital", speaker: "Reception", situation: "Appointment booking" },
       { location: "Travel agency", speaker: "Staff", situation: "Travel consultation" },
       
       // Colleague dialogue: Cooperation, information sharing, schedule coordination
       { location: "Office", speaker: "Colleague", situation: "Cooperation consultation" },
       { location: "Office", speaker: "Team member", situation: "Information sharing" },
       { location: "Meeting room", speaker: "Project member", situation: "Schedule coordination" },
       { location: "Research lab", speaker: "Researcher", situation: "Research information sharing" },
       
       // Service usage: Repair requests, reservation changes, consultations
       { location: "Repair shop", speaker: "Customer", situation: "Repair request" },
       { location: "Hospital", speaker: "Patient", situation: "Appointment change" },
       { location: "Law firm", speaker: "Client", situation: "Legal consultation" },
       { location: "Real estate office", speaker: "Customer", situation: "Property consultation" },
       
       // Academic/Training: Lectures, seminars, research-related conversations
       { location: "University", speaker: "Professor", situation: "Lecture discussion" },
       { location: "Seminar venue", speaker: "Instructor", situation: "Training guidance" },
       { location: "Research lab", speaker: "Researcher", situation: "Research discussion" },
       { location: "Library", speaker: "Librarian", situation: "Reference consultation" }
   ],
   
   4: [ // Explanatory text problems
       // Announcements: Transportation, facilities, emergencies
       { location: "Airport", speaker: "Airport staff", situation: "Boarding announcement" },
       { location: "Station", speaker: "Station staff", situation: "Service information" },
       { location: "Hospital", speaker: "Nurse", situation: "Examination guidance" },
       { location: "Department store", speaker: "Store announcement", situation: "Business hours information" },
       { location: "Office", speaker: "Disaster prevention officer", situation: "Evacuation drill announcement" },
       { location: "School", speaker: "Administrative staff", situation: "Emergency notice" },
       
       // Advertising: Product, service, event promotion
       { location: "Radio station", speaker: "Announcer", situation: "Product advertisement" },
       { location: "TV station", speaker: "Narrator", situation: "Service introduction" },
       { location: "Event venue", speaker: "Host", situation: "Event promotion" },
       { location: "Exhibition hall", speaker: "Demonstrator", situation: "Product introduction" },
       
       // Meetings/Presentations: Business reports, project proposals
       { location: "Meeting room", speaker: "Department head", situation: "Quarterly report" },
       { location: "Presentation venue", speaker: "Sales department", situation: "Project proposal" },
       { location: "Shareholders meeting venue", speaker: "CEO", situation: "Performance report" },
       { location: "Office", speaker: "Project leader", situation: "Progress report" },
       
       // Lectures: Academic, training, seminars
       { location: "University", speaker: "Professor", situation: "Academic lecture" },
       { location: "Training center", speaker: "Instructor", situation: "Technical training" },
       { location: "Seminar venue", speaker: "Expert", situation: "Professional seminar" },
       { location: "Convention center", speaker: "Keynote speaker", situation: "Keynote speech" },
       
       // Reports: News, survey results, progress reports
       { location: "Broadcasting station", speaker: "Reporter", situation: "News report" },
       { location: "Research lab", speaker: "Researcher", situation: "Survey results presentation" },
       { location: "Meeting room", speaker: "Survey officer", situation: "Market research report" },
       { location: "Office", speaker: "Manager", situation: "Monthly report" },
       
       // Explanations: Procedures, rules, system explanations
       { location: "Training room", speaker: "Instructor", situation: "Procedure explanation" },
       { location: "Office", speaker: "System administrator", situation: "System explanation" },
       { location: "Bank", speaker: "Teller", situation: "Procedure explanation" },
       { location: "Hospital", speaker: "Pharmacist", situation: "Medication guidance" },
       
       // Interviews: Questions to experts, experienced persons
       { location: "TV station", speaker: "Interviewer", situation: "Expert interview" },
       { location: "Radio station", speaker: "Host", situation: "Guest interview" },
       { location: "Magazine company", speaker: "Editor", situation: "News interview" },
       { location: "University", speaker: "Student reporter", situation: "Professor interview" },
       
       // Guidance: Facility, event, service guides
       { location: "Museum", speaker: "Guide", situation: "Exhibition guidance" },
       { location: "Tourist site", speaker: "Tour guide", situation: "Tourism guidance" },
       { location: "Hotel", speaker: "Concierge", situation: "Facility guidance" },
       { location: "Airport", speaker: "Information staff", situation: "Airport service guidance" },
       { location: "Hospital", speaker: "Information staff", situation: "Hospital facility guidance" }
   ]
};

//situationを明確なトピックに変換するマッピング
//これにより「何について話すか」が明確になり、正解選択肢との整合性が保たれる
export const TOPIC_MAPPING: Record<string, string> = {
        // 医療・健康関連
        'examination guidance': 'medical procedures',
        'conducting examination': 'medical procedures', 
        'medication guidance': 'medical instructions',
        'waiting for examination': 'medical appointments',
        'hospital facility guidance': 'medical facility information',
        
        // ビジネス・報告関連
        'progress report': 'status reporting',
        'quarterly report': 'business reporting',
        'performance report': 'performance analysis',
        'monthly report': 'periodic reporting',
        'project proposal': 'business proposals',
        
        // 教育・研修関連
        'academic lecture': 'educational presentations',
        'professional seminar': 'professional development',
        'technical training': 'training programs',
        'teaching class': 'instructional content',
        'training guidance': 'skill development',
        'lecture discussion': 'educational discourse',
        
        // 案内・説明関連
        'system explanation': 'technical explanations',
        'procedure explanation': 'operational procedures',
        'facility guidance': 'service information',
        'exhibition guidance': 'cultural presentations',
        'tourism guidance': 'travel information',
        
        // 発表・広告関連
        'product advertisement': 'marketing presentations',
        'service introduction': 'promotional content',
        'event promotion': 'event announcements',
        'product introduction': 'product demonstrations',
        'keynote speech': 'keynote presentations',
        
        // 交通・移動関連
        'boarding announcement': 'transportation announcements',
        'service information': 'operational updates',
        'evacuation drill announcement': 'safety procedures',
        'emergency notice': 'emergency communications',
        
        // 業務・作業関連
        'business hours information': 'operational announcements',
        'working at desk': 'workplace activities',
        'reviewing documents': 'document management',
        'preparing presentation': 'presentation preparation',
        'inspecting machinery': 'equipment inspection',
        'manufacturing work': 'production processes',
        
        // 顧客サービス関連
        'customer service': 'customer assistance',
        'complaint handling': 'customer service',
        'order taking': 'order processing',
        'reservation handling': 'booking services',
        'appointment booking': 'scheduling services',
        
        // 相談・確認関連
        'schedule confirmation': 'scheduling information',
        'task confirmation': 'work assignments',
        'price confirmation': 'pricing information',
        'fee confirmation': 'cost information',
        'location confirmation': 'navigation assistance',
        
        // インタビュー・取材関連
        'expert interview': 'expert discussions',
        'professor interview': 'academic interviews',
        'guest interview': 'interview content',
        'news interview': 'journalistic interviews',
        
        // 会議・相談関連
        'regular meeting': 'business meetings',
        'business negotiation': 'commercial discussions',
        'project consultation': 'project planning',
        'legal consultation': 'professional advice',
        'travel consultation': 'travel planning',
        
        // その他の活動
        'shopping': 'retail experiences',
        'dining': 'restaurant services',
        'attending event': 'event participation',
        'research discussion': 'academic research'
    };

// situation別の基本要素（何を含めるべきか）
export const SITUATION_ELEMENTS: Record<string, string[]> = {
        // 案内・説明系
        'announcement': ['important information', 'timing details', 'procedural instructions'],
        'guidance': ['step-by-step procedures', 'safety protocols', 'important guidelines'],
        'explanation': ['detailed procedures', 'system operations', 'technical specifications'],
        'information': ['service details', 'operational status', 'important updates'],
        
        // 報告・発表系
        'report': ['data analysis', 'progress metrics', 'performance indicators'],
        'presentation': ['key findings', 'strategic insights', 'actionable recommendations'],
        'lecture': ['educational content', 'theoretical concepts', 'practical applications'],
        'seminar': ['specialized knowledge', 'industry trends', 'professional development'],
        'speech': ['main message', 'supporting evidence', 'call to action'],
        
        // 医療・健康系
        'examination': ['medical procedures', 'health protocols', 'patient instructions'],
        'medication': ['dosage information', 'safety precautions', 'administration guidelines'],
        'facility': ['service locations', 'operating procedures', 'patient navigation'],
        
        // 研修・教育系
        'training': ['skill development', 'practical applications', 'best practices'],
        'teaching': ['learning objectives', 'key concepts', 'student engagement'],
        'instruction': ['procedural steps', 'safety requirements', 'quality standards'],
        
        // サービス・顧客系
        'service': ['service features', 'customer benefits', 'usage procedures'],
        'customer': ['service quality', 'customer satisfaction', 'problem resolution'],
        'consultation': ['expert advice', 'solution strategies', 'professional guidance'],
        
        // ビジネス・業務系
        'meeting': ['agenda items', 'decision points', 'action plans'],
        'negotiation': ['proposal terms', 'mutual benefits', 'agreement conditions'],
        'confirmation': ['verification processes', 'information accuracy', 'procedural compliance'],
        
        // インタビュー・取材系
        'interview': ['expert insights', 'professional experience', 'industry knowledge'],
        'discussion': ['topic analysis', 'different perspectives', 'collaborative insights']
    };
    
//speaker別の専門性要素（誰の視点から話すか）
export const SPEAKER_ELEMENTS: Record<string, string[]> = {
        // 医療関係者
        'doctor': ['medical expertise', 'clinical procedures', 'patient safety'],
        'nurse': ['patient care', 'health protocols', 'medical assistance'],
        'pharmacist': ['medication safety', 'drug interactions', 'dosage guidelines'],
        
        // 教育関係者
        'professor': ['academic knowledge', 'research insights', 'educational methods'],
        'teacher': ['learning objectives', 'student engagement', 'educational content'],
        'instructor': ['skill development', 'practical training', 'learning outcomes'],
        
        // ビジネス関係者
        'manager': ['strategic planning', 'team coordination', 'operational efficiency'],
        'ceo': ['organizational vision', 'strategic direction', 'performance metrics'],
        'supervisor': ['quality control', 'team management', 'workflow optimization'],
        'coordinator': ['project coordination', 'resource management', 'timeline adherence'],
        
        // 専門職
        'expert': ['specialized knowledge', 'industry expertise', 'professional insights'],
        'engineer': ['technical specifications', 'system design', 'problem solving'],
        'analyst': ['data analysis', 'trend identification', 'strategic recommendations'],
        'consultant': ['professional advice', 'solution development', 'best practices'],
        
        // サービス業
        'staff': ['service procedures', 'customer assistance', 'quality assurance'],
        'assistant': ['support services', 'administrative procedures', 'customer care'],
        'representative': ['company policies', 'service information', 'customer relations'],
        'guide': ['informational content', 'navigation assistance', 'educational guidance'],
        
        // 技術・専門職
        'administrator': ['system management', 'operational procedures', 'policy implementation'],
        'technician': ['technical operations', 'equipment maintenance', 'safety procedures'],
        'specialist': ['domain expertise', 'specialized procedures', 'quality standards']
    };
    
//location別の環境要素（どこで行われるか）
export const LOCATION_ELEMENTS: Record<string, string[]> = {
        'hospital': ['medical environment', 'patient safety', 'healthcare standards'],
        'office': ['professional setting', 'business operations', 'workplace efficiency'],
        'university': ['academic environment', 'educational resources', 'learning objectives'],
        'training': ['learning environment', 'skill development', 'practical application'],
        'meeting': ['collaborative setting', 'decision making', 'team coordination'],
        'seminar': ['professional development', 'knowledge sharing', 'industry insights']
    };