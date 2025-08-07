export const SECTION_SPECS = {
            1: {
                description: "Picture description problems",
                format: "Choose the option that most appropriately describes the picture",
                requirements: "Accurately describe people's actions, object states, and location scenes"
            },
            2: {
                description: "Response problems", 
                format: "Choose the most appropriate response to the question",
                requirements: "Appropriate responses that follow natural conversation flow"
            },
            3: {
                description: "Conversation problems",
                format: "Listen to conversations and answer questions",
                requirements: "Natural conversations in business and daily life situations"
            },
            4: {
                description: "Explanatory text problems",
                format: "Listen to short talks and answer questions", 
                requirements: "Practical content such as announcements, advertisements, meetings, and lectures"
            }
        };

//audioScript構成の定義
//audioScript構成の定義
export const AUDIO_SCRIPT_STRUCTURES = {
    1: {
        structure: "Read only 4 choices consecutively",
        rules: [
            "Do not add 'A', 'B', 'C', 'D' before each choice",
            "Insert [short pause] between each choice"
        ],
        example: "A businessman wearing a dark suit is carefully reading his morning newspaper. [short pause] Two professional women are walking together through the busy office corridor. [short pause] Several children are joyfully playing on the colorful playground equipment in the park. [short pause] A golden retriever dog is energetically running across the green field."
    },
    2: {
        structure: "Question + [pause] + 3 choices read consecutively",
        rules: [
            "Question and choices are handled by different speakers",
            "Question: Read by [Speaker1]",
            "Choices: Read by [Speaker2]",
            "Do not add 'A', 'B', 'C' before choices",
            "Insert [short pause] between each choice"
        ],
        example: "[Speaker1] Could you please tell me where the main conference room is located? [pause] [Speaker2] Go down this hallway and turn right at the end. [short pause] Yes, I would be happy to attend the important meeting today. [short pause] The quarterly business meeting is scheduled to start at three o'clock."
    },
    3: {
        structure: "Conversation + [pause] + 3 questions with 4 choices each",
        rules: [
            "Insert speaker identification tags for each statement when multiple speakers are present",
            "Insert appropriate intervals between speaker changes and each choice",
            "Speaker tag format: [Speaker1], [Speaker2], [Speaker3], etc.",
            "Question text and choices: Read by narrator (no speaker tag)",
            "Insert [pause] between each question set",
            "Insert [short pause] between each choice within a question"
        ],
        example: "[Speaker1] Good morning, Sarah. I was wondering if you have finished working on the quarterly financial report that's due today. [pause] [Speaker2] Almost completely done, Mike. I just need to add the final sales figures and revenue data before submitting it. [pause] [Speaker1] That's excellent news. We really need to submit the completed report to management by noon today for the board meeting. [pause] [Speaker2] Don't worry, I'll have everything ready well before the deadline. [pause] [Speaker1] Perfect. I appreciate your dedication to getting this done on time. [pause] What does Mike need Sarah to do with the report? [pause] Add the remaining sales figures and revenue data to complete it. [short pause] Submit the finished report to management before the noon deadline. [short pause] Schedule an important meeting with the board of directors. [short pause] Review all the financial data and make necessary corrections. [pause] When is the deadline for the report? [pause] By noon today. [short pause] Next week. [short pause] At the end of the month. [short pause] Tomorrow morning. [pause] What is the purpose of the report? [pause] For a client presentation. [short pause] For the board meeting. [short pause] For budget planning. [short pause] For performance review."
    },
    4: {
        structure: "Speech content + [pause] + 3 questions with 4 choices each",
        rules: [
            "Format of announcements, presentations, advertisements, etc.",
            "Speech content and questions/choices are handled by different speakers",
            "Speech content: Read by [Speaker1]",
            "Question text and choices: Read by [Speaker2]",
            "Insert [pause] between each question set",
            "Insert [short pause] between each choice within a question"
        ],
        example: "[Speaker1] Welcome to City Bank, where we value your financial future and security. We are extremely pleased to announce the launch of our innovative new mobile banking service that will revolutionize how you manage your finances. Starting next month, all our valued customers will be able to access their accounts anytime and anywhere using our user-friendly mobile application. This convenient service will allow you to check balances, transfer funds, pay bills, and deposit checks directly from your smartphone or tablet. [pause] [Speaker2] What is the main topic of this important announcement? [pause] The launch of an innovative new mobile banking service for customers. [short pause] The grand opening of a new branch location in the city. [short pause] The results of a comprehensive customer satisfaction survey. [short pause] Scheduled maintenance of the current online banking system. [pause] When will the new service be available? [pause] Next week. [short pause] Starting next month. [short pause] By the end of this year. [short pause] It's already available. [pause] What can customers do with the mobile application? [pause] Only check account balances. [short pause] Schedule appointments with bank staff. [short pause] Check balances, transfer funds, pay bills, and deposit checks. [short pause] Apply for new credit cards only."
    }
};

export const PART_GENRES = {
        1: [
            "Workplace scenes: People descriptions in offices, meeting rooms, factories",
            "Transportation/travel: Scenes at stations, airports, bus stops, roads",
            "Commercial facilities: Activities in stores, restaurants, banks",
            "Outdoor activities: Parks, construction sites, event venues",
            "Daily life: Situations at home, hospitals, schools"
        ],
        2: [
            "Work confirmation: Questions about schedules, tasks, progress",
            "Location/directions: Questions about position, routes, facilities",
            "Suggestions/requests: Questions about cooperation, participation, changes",
            "Information confirmation: Questions about time, cost, conditions",
            "Opinions/evaluations: Questions about impressions, judgments, choices"
        ],
        3: [
            "Business conversations: Meetings, negotiations, project consultations",
            "Customer service: Complaint handling, orders, reservations, inquiries",
            "Colleague dialogues: Cooperation, information sharing, schedule coordination",
            "Service usage: Repair requests, reservation changes, consultations",
            "Academic/training: Conversations about lectures, seminars, research"
        ],
        4: [
            "Announcements: Transportation, facilities, emergencies",
            "Advertisements: Product, service, event promotions",
            "Meetings/presentations: Business reports, project proposals",
            "Lectures: Academic, training, seminars",
            "Reports: News, research results, progress updates",
            "Explanations: Procedures, rules, system descriptions",
            "Interviews: Questions to experts and experienced persons",
            "Guides: Facility, event, service guidance"
        ]
    };

//jpnAudioScript形式定義
export const JPN_AUDIO_SCRIPT_FORMAT = {
    1: "選択肢: A. [Choice 1 in Japanese] B. [Choice 2 in Japanese] C. [Choice 3 in Japanese] D. [Choice 4 in Japanese]",
    2: "質問文: [Question in Japanese] 選択肢: A. [Choice 1 in Japanese] B. [Choice 2 in Japanese] C. [Choice 3 in Japanese]",
    3: "会話内容: [Conversation in Japanese] 設問文: [Question in Japanese] 選択肢: A. [Choice 1 in Japanese] B. [Choice 2 in Japanese] C. [Choice 3 in Japanese] D. [Choice 4 in Japanese]",
    4: "スピーチ内容: [Speech in Japanese] 設問文: [Question in Japanese] 選択肢: A. [Choice 1 in Japanese] B. [Choice 2 in Japanese] C. [Choice 3 in Japanese] D. [Choice 4 in Japanese]"
};

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
           "I guess...", "You bet!", "Sure thing", "No problem", 
           "That sounds good", "I'm good", "Sounds great", "You're welcome",
           "How's it going?", "Take care", "Have a good day", "Of course",
           "I think so", "That works for me", "I'd be happy to", "Thank you so much"
       ]
   },
   Canadian: {
       description: "Canadian English",
       characteristics: [
           "Canadian raising: Sounds like about → 'aboot', house → 'hoose'",
           "Similar to American English but uses British vocabulary and spelling",
           "Use of final 'eh': It's cold, eh?",
           "Distinctive 'ou' pronunciation: out, about, house",
           "Bag vowel: Sounds like bag → 'bayg'",
           "Canadian shift: Sound changes toward bit → 'bet', bet → 'bat'",
           "Moderate rhoticity: R sound not as strong as American",
           "Mixed spelling: Uses British spelling like colour, centre"
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
           "Brilliant!", "Quite right", "I'm afraid...", "Rather good",
           "How do you do?", "Thank you very much", "I dare say", "Fair enough",
           "Not to worry", "Well done", "That's lovely", "I should think so",
           "Cheers", "I reckon...", "Quite so", "Indeed", "Certainly"
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
        "choices": {
            min: 3,
            max: 10,
            unit: "words"
        },
        "questionsCount": 1,
        "choicesPerQuestion": 3,
        "totalWords": {
            min: 20,
            max: 50,
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
            min: 8,
            max: 12,
            unit: "words"
        },
        "choices": {
            min: 3,
            max: 8,
            unit: "words"
        },
        "questionsCount": 3,
        "choicesPerQuestion": 4,
        "totalWords": {
            min: 200,
            max: 300,
            unit: "words"
        }
    },
    4: { 
        "speech": {
            min: 80,
            max: 120,
            unit: "words"
        },
        "questionText": {
            min: 8,
            max: 12,
            unit: "words"
        },
        "choices": {
            min: 3,
            max: 8,
            unit: "words"
        },
        "questionsCount": 3,
        "choicesPerQuestion": 4,
        "totalWords": {
            min: 250,
            max: 350,
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

// situationを明確なトピックに変換するマッピング
// これにより「何について話すか」が明確になり、正解選択肢との整合性が保たれる
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