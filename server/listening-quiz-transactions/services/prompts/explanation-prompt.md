# TOEIC Part {{sectionNumber}} Explanation Generation

Generate a detailed explanation in Japanese for the following TOEIC question.

## Question Information
**Part**: {{sectionNumber}}
**Speaker Accent**: {{speakerAccent}}
**AudioScript**: {{audioScript}}
**Correct Answer Options**: {{answerOptionList}}

## Accent Features Found
{{relevantAccentFeatures}}

## Explanation Requirements

Generate a comprehensive explanation of 500-700 characters in Japanese including:

1. **正答解説**: Why the correct answers are right based on content
2. **誤答分析**: Why incorrect options are wrong  
3. **{{speakerAccent}}発音ポイント**: Pronunciation tips for accent-specific features found in this audio
4. **学習アドバイス**: Practical listening tips for similar questions

Focus on content comprehension while incorporating {{speakerAccent}} accent guidance where relevant.

## Output Instructions
Return ONLY the Japanese explanation text. No formatting or additional text.