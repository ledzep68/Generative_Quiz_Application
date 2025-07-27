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