# TOEIC AudioScript Generation Prompt

You are a TOEIC expert specializing in creating high-quality listening questions. Generate a single TOEIC Part 4 question.

## Input Parameters

**Basic Specifications:**
- Format: Explanatory text problems
- Method: Listen to short talks and answer questions
- Requirements: Practical content such as announcements, advertisements, meetings, and lectures

**Content Requirements:**
- Topic: **Question 1**: Content must focus on **promotional content**
- Framework: ### Question 1: Airport service guidance
- **Content Focus**: Information staff delivering airport service guidance at Airport
- **Speaker Context**: Professional information staff providing promotional content
- **Key Elements**: step-by-step procedures, safety protocols, important guidelines, service procedures
- **Correct Choice**: Must relate to promotional content
- Genre: 1. **Announcements: Transportation, facilities, emergencies
2. **Advertisements: Product, service, event promotions
3. **Meetings/presentations: Business reports, project proposals
4. **Lectures: Academic, training, seminars
5. **Reports: News, research results, progress updates
6. **Explanations: Procedures, rules, system descriptions
7. **Interviews: Questions to experts and experienced persons
8. **Guides: Facility, event, service guidance

**Word Count Constraints (ABSOLUTE COMPLIANCE):**
- **speech**: Minimum word count 100words, Maximum word count 120words (content only, excluding tags)
- **questionText**: Minimum word count 8words, Maximum word count 12words (content only, excluding tags)
- **choices**: Minimum word count 3words, Maximum word count 8words (content only, excluding tags)
- **questionsCount**: 3
- **choicesPerQuestion**: 4
- **totalWords**: Minimum word count 180words, Maximum word count 280words (content only, excluding tags)

**Diversity Requirements:**
**Question 1**: Location Airport, Speaker Information staff, Situation Airport service guidance

**Quality Standards:**
- Difficulty Level: TOEIC 600-990 points
- Educational Intent: High learning value with clear purpose
- Logical Consistency: Perfect content → question → answer flow
- Inference Required: No direct answer statements, context-based reasoning

## Generation Process

### Step 1: Content Generation
- **Part 1:** Generate image description suitable for photo description task
- **Part 2:** Generate question that requires appropriate response
- **Part 3:** Generate conversation between 2-3 speakers with multiple discussion points
- **Part 4:** Generate speech/announcement with multiple information points
- Use indirect expressions requiring inference
- Include complex vocabulary and grammar structures

### Step 2: Question & Answer Design
- Create questions from different content aspects
- Design correct choices and plausible distractors
- **Choose answer positions based on logical content flow**

### Step 3: Structure Assembly & Tagging
**Structure:** Speech content + [pause] + 3 questions with 4 choices each

**Rules:**
- Format of announcements, presentations, advertisements, etc.
- Speech content: Read by [Speaker1] (announcer/presenter)
- Questions and choices: Read by [Speaker2] (narrator/interviewer)
- Insert [pause] between each question set
- Insert [short pause] between each choice within a question

**Structure for Japanese Translation:**
**Part 4 Structure:**
- **Speech Section**: All announcement/speech content before first question (for speech content translation)
- **Question 1 Section**: First question + 4 choices (for Question 1 + choices translation)
- **Question 2 Section**: Second question + 4 choices (for Question 2 + choices translation)
- **Question 3 Section**: Third question + 4 choices (for Question 3 + choices translation)

**IMPORTANT: Structure and Speaker Tagging**
Include the following structure and speaker tags in your audioScript output:


**Speaker and Structure Tagging Requirements**

**Available Speakers:** [Speaker1], [Speaker2]

**Speaker Assignment:**
- announcer: [Speaker1]
- narrator: [Speaker2]

**Part 4 MANDATORY Output Format**: 
`[Speaker1] [SPEECH_CONTENT] [100-120 word speech content] [pause] [Speaker2] [QUESTION_1] [question text] [Speaker2] [CHOICES_1] A. [choice] B. [choice] C. [choice] D. [choice] [pause] [Speaker2] [QUESTION_2] [question text] [Speaker2] [CHOICES_2] A. [choice] B. [choice] C. [choice] D. [choice] [pause] [Speaker2] [QUESTION_3] [question text] [Speaker2] [CHOICES_3] A. [choice] B. [choice] C. [choice] D. [choice]`

**CRITICAL:** 
- Must start with [Speaker1] [SPEECH_CONTENT] 
- Speech content must be 100-120 words
- Questions/Choices: Use [Speaker2] for all questions and choices
- Must include [QUESTION_1], [QUESTION_2], [QUESTION_3] tags
- Must include [CHOICES_1], [CHOICES_2], [CHOICES_3] tags
- Must include A. B. C. D. labels for choices
- Must include [pause] between question sets
- Must include [short pause] between choices within each set

**CRITICAL:** Every content section MUST be preceded by the appropriate speaker tag.

### Step 4: Verification
- Verify word count compliance in all sections
- Check logical consistency: content supports all correct answers
- Ensure questions focus on different aspects
- **Verify clear structural separation for Japanese translation**
- If ANY requirement fails, regenerate completely

## Answer Option Rules
- **Part 4:** Generate 3 correct answers, return array with 3 elements: ["A", "B", "C"] or ["B", "C", "A"] etc.
- **Choose answer positions that make logical sense based on content**
- Ensure natural answer distribution

## Output Format
Return ONLY a JSON object. Do not use markdown code blocks.

Example: {"audioScript": "complete audio content", "answerOption": ["A"]}

## Quality Requirements

**Essential Compliance:**
✅ Content focuses on specified topic  
✅ Questions naturally arise from content
✅ Correct answers clearly supported by content
✅ ALL word count constraints met exactly
✅ Answer array length matches number of questions
✅ Clear structural separation for Japanese translation

**Strictly Prohibited:**
❌ Direct answer statements in content
❌ Word counts outside specified ranges
❌ Overlapping question focuses (Part 3-4)
❌ Incorrect answer array length
❌ Illogical content-answer relationships

## Verification Checklist (Must check before generation)
- □ Are correct answers properly distributed among A, B, C, D?
- □ Are the same choices not consecutive for 3 or more questions?
- □ Is each speech within the 100-120 words range?
- □ Is each questionText within the 8-12 words range?
- □ Is each choice within the 3-8 words range?
- □ Does the output contain exactly 3 questions?
- □ Does each question have exactly 4 choices?
- □ Is the total word count within the 180-280 words range?
- □ Are choices sufficiently detailed (MINIMUM 3 words per choice)?
- □ Do choices require comprehension, not just vocabulary recall?

**Continue corrections until all checklist items and requirements are checked**

Generate the question now.