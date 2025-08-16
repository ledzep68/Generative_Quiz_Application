# TOEIC Part 4 Questions Generation Prompt

## 1. Task Definition
Generate 3 questions with 4 multiple-choice answers each for TOEIC Part 4, based on the provided content.

## 2. Input Information - Content Analysis

### Accent Context (Consider while analyzing content)
**Accent Context from Content: American English**

**Consider these accent features when creating questions:**
- Vocabulary used: elevator (not lift), apartment (not flat), truck (not lorry), gas (not petrol)
- Expressions used: I guess..., You bet!, Sure thing

**Question Design Guidelines:**
- Questions should test comprehension of accent-specific vocabulary
- Answer choices may include accent-related synonyms
- Consider pronunciation variations that affect meaning
- Ensure questions are fair regardless of accent familiarity

**Provided Content:**
[Speaker1_MALE] Good morning, everyone. As we gather here in the meeting room, I'm pleased to present our quarterly report. Over the past three months, our department has seen a 15% increase in productivity, thanks to the new software implementation. I guess the training sessions really paid off. Our customer satisfaction scores have also improved, reaching an impressive 92%. You bet that's a result of our dedicated team efforts. Additionally, we've managed to reduce operational costs by 10%, which is a significant achievement. Looking ahead, we aim to focus on expanding our market reach and enhancing our product line. Sure thing, collaboration will be key to achieving these goals. Let's continue to work together to maintain this positive momentum. Thank you for your hard work and dedication.

## 3. Question Structure Requirements
**Structure:** Generate 3 questions with 4 choices each (based on provided speech)

**Rules:**
- Each question should focus on different aspects of the speech
- Questions require inference rather than direct information recall

## 4. Constraint Requirements

### Word Count Constraints
- **questions**: Minimum word count 5words, Maximum word count 10words
- **choices**: Minimum word count 2words, Maximum word count 7words

### Smart Keyword Usage Rules
- **For specific facts/numbers**: Direct usage is acceptable
- **For main ideas/concepts**: Use paraphrasing when natural
- **Wrong answers**: Should include some direct keywords to create realistic traps
- **Avoid**: Obvious word-for-word copying in ALL choices

### Answer Option Generation Rules
- **Part 4:** Generate 3 DIFFERENT correct answers, return array with 3 elements like ["B", "D", "A"], ["C", "A", "B"], ["A", "D", "C"] etc. **CRITICAL:** Each question MUST have a different correct answer letter. NEVER use clustering like ["A", "A", "B"] or ["C", "C", "A"]

### Choice Quality Requirements
- ALL choices must be based on content mentioned or clearly implied
- Wrong choices should be plausible but distinguishable upon careful analysis
- Each choice must be grammatically correct and contextually appropriate

## 5. Quality Standards

### Question Type Distribution
- **Question 1:** Main idea or overall purpose 
- **Question 2:** Specific detail or factual information
- **Question 3:** Inference or next action

## 6. Output Format Requirements

**Return ONLY a valid JSON object in this exact format:**

```json
{
  "audioScript": "[QUESTION_1] question text [CHOICES_1] A. choice A B. choice B C. choice C D. choice D [QUESTION_2] question text [CHOICES_2] A. choice A B. choice B C. choice C D. choice D [QUESTION_3] question text [CHOICES_3] A. choice A B. choice B C. choice C D. choice D",
  "answerOptionList": [CORRECT_ARRAY]
}
```

## 7. Verification Checklist
### Smart Keyword Usage
- □ Specific facts/numbers use direct keywords when appropriate?
- □ Main ideas/concepts use natural paraphrasing?
- □ Wrong answers include direct keywords for realistic traps?
- □ Avoid obvious word-for-word copying in all choices?

### TOEIC Requirements
- □ Do the 3 questions cover different types (main idea, detail, inference)?
- □ Are all choices based on content mentioned or clearly implied?
- □ Is the difficulty level appropriate for TOEIC 600-990 points?
- □ Is each question within 5-10 words?
- □ Is each choice within 2-7 words?

### Technical Requirements
- □ Does JSON contain both "audioScript" and "answerOptionList" fields?
- □ Are structure tags ([QUESTION_1], [CHOICES_1]) used correctly?
- □ **Do all choices include A. B. C. D. labels?**