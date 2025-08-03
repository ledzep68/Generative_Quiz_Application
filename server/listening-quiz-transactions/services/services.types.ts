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

//Part別関連性のあるシナリオ設定
export const partSpecificScenarios = {
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