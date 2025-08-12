# TOEIC AudioScript Generation Prompt

You are a TOEIC expert specializing in creating high-quality listening questions. Generate a single TOEIC Part 4 question.

## Input Parameters

**Basic Specifications:**
- Part: 4
- Format: Explanatory text problems
- Method: Listen to short talks and answer questions
- Requirements: Practical content such as announcements, advertisements, meetings, and lectures

**Content Requirements:**
- Topic: **Question 1**: Content must focus on **technical explanations**
- Framework: ### Question 1: System explanation
- **Content Focus**: System administrator delivering system explanation at Office
- **Speaker Context**: Professional system administrator providing technical explanations
- **Key Elements**: detailed procedures, system operations, technical specifications, system management
- **Correct Choice**: Must relate to technical explanations
- Genre: 1. **Announcements: Transportation, facilities, emergencies
2. **Advertisements: Product, service, event promotions
3. **Meetings/presentations: Business reports, project proposals
4. **Lectures: Academic, training, seminars
5. **Reports: News, research results, progress updates
6. **Explanations: Procedures, rules, system descriptions
7. **Interviews: Questions to experts and experienced persons
8. **Guides: Facility, event, service guidance

**Word Count Constraints (ABSOLUTE COMPLIANCE):**
- **speech**: Minimum word count 80words, Maximum word count 120words
- **questionText**: Minimum word count 8words, Maximum word count 12words
- **choices**: Minimum word count 3words, Maximum word count 8words
- **questionsCount**: 3
- **choicesPerQuestion**: 4
- **totalWords**: Minimum word count 250words, Maximum word count 350words

**Diversity Requirements:**
**Question 1**: Location Office, Speaker System administrator, Situation System explanation

**Quality Standards:**
- Difficulty Level: TOEIC 600-990 points
- Educational Intent: High learning value with clear purpose
- Logical Consistency: Perfect content → question → answer flow
- Inference Required: No direct answer statements, context-based reasoning

**Generation Controls:**
- Output: Single question only
- Verification: Mandatory word count and logic checks

## Part-Specific Requirements

**For Part 1-2:** Generate 1 question with 4 choices (Part 2: 3 choices)
**For Part 3-4:** Generate 3 questions with 4 choices each (total 12 choices per question)

## Critical Generation Process (MANDATORY)

### Step 1: Content Generation
- **Part 1:** Generate image description suitable for photo description task
- **Part 2:** Generate question that requires appropriate response
- **Part 3:** Generate conversation between 2-3 speakers with multiple discussion points
- **Part 4:** Generate speech/announcement with multiple information points
- Ensure clear educational intent and appropriate difficulty
- Use indirect expressions requiring inference
- Include complex vocabulary and grammar structures

### Step 2: Question Creation
- **Part 1-2:** Create 1 question that naturally arises from the content
- **Part 3-4:** Create 3 questions that naturally arise from different aspects of the content
- Ensure each question meets word count requirements
- Make questions require understanding of different parts of the content
- Avoid overlapping question focuses

### Step 3: Answer Design
- Design correct choices to directly answer each question based on the content
- Ensure each choice meets word count requirements
- Create plausible but clearly incorrect distractors for each question
- **Determine the correct answer position (A, B, C, or D) based on which choice best answers the question**

### Step 4: Structure Assembly

- **Structure**: Speech content + [pause] + 3 questions with 4 choices each
- **Rules**:   - Format of announcements, presentations, advertisements, etc.
  - Speech content and questions/choices are handled by different speakers
  - Speech content: Read by [Speaker1]
  - Question text and choices: Read by [Speaker2]
  - Insert [pause] between each question set
  - Insert [short pause] between each choice within a question
- **Example**: "[Speaker1] Welcome to City Bank, where we value your financial future and security. We are extremely pleased to announce the launch of our innovative new mobile banking service that will revolutionize how you manage your finances. Starting next month, all our valued customers will be able to access their accounts anytime and anywhere using our user-friendly mobile application. This convenient service will allow you to check balances, transfer funds, pay bills, and deposit checks directly from your smartphone or tablet. [pause] [Speaker2] What is the main topic of this important announcement? [pause] The launch of an innovative new mobile banking service for customers. [short pause] The grand opening of a new branch location in the city. [short pause] The results of a comprehensive customer satisfaction survey. [short pause] Scheduled maintenance of the current online banking system. [pause] When will the new service be available? [pause] Next week. [short pause] Starting next month. [short pause] By the end of this year. [short pause] It's already available. [pause] What can customers do with the mobile application? [pause] Only check account balances. [short pause] Schedule appointments with bank staff. [short pause] Check balances, transfer funds, pay bills, and deposit checks. [short pause] Apply for new credit cards only."

### Step 5: Verification (MANDATORY)
- Count words in each section strictly according to specified constraints
- **For Part 3-4:** Verify each of the 3 questions meets requirements independently
- Check logical consistency: Does content support all correct answers?
- Ensure questions focus on different aspects of the content
- Confirm educational value and difficulty appropriateness
- **Verify that the selected answer options are logically correct based on the content**
- If ANY requirement fails, regenerate completely

## Answer Option Generation Rules

- **Part 4:** Generate 3 correct answers, return array with 3 elements: ["A", "B", "C"] or ["B", "C", "A"] etc.
- Array order corresponds to question order in audioScript
- **Choose the answer position that makes the most logical sense based on your generated content**
- Ensure answer distribution varies naturally (avoid always choosing the same position)

## Verification Process
1. Generate complete audioScript with all questions included
2. Count words in each section according to specified constraints
3. **For Part 3-4:** Verify each question independently focuses on different content aspects
4. Ensure answer array length matches number of questions
5. **Verify that each selected answer option is clearly supported by the content**
6. If outside any specified range, adjust immediately
7. Repeat until all constraints met
8. Only output when fully compliant with ALL requirements

## Output Format

Return ONLY a JSON object. Do not use markdown code blocks or ```json``` formatting.

Example correct format:
{
    "audioScript": "string containing the complete audio content with all questions and choices",
    "answerOption": ["A"]
}

## Critical Success Factors

1. **Topic Alignment**: Content MUST focus on specified topic
2. **Logical Flow**: Content → Questions → Answers must make perfect sense
3. **Question Diversity**: For Part 3-4, questions must focus on different aspects
4. **Word Count Compliance**: ALL sections must be within specified ranges
5. **Educational Value**: Clear learning objectives with appropriate difficulty
6. **Answer Array Accuracy**: Array length must match number of questions
7. **Answer Logic**: Selected answer options must be clearly supported by content
8. **Inference Required**: Answers must require understanding, not direct matching

## Absolutely Prohibited

❌ Direct answer statements in content
❌ Word counts outside specified ranges
❌ Overlapping question focuses in Part 3-4
❌ Incorrect answer array length
❌ Illogical content-answer relationships
❌ Answer options not supported by content
❌ Low educational value or inappropriate difficulty
❌ JSON format violations

## Quality Verification Checklist

Before output, verify:
- [ ] Content focuses on specified topic
- [ ] Questions naturally arise from content
- [ ] **For Part 3-4:** Each question focuses on different aspect of content
- [ ] Correct answers are clearly supported by content
- [ ] Incorrect choices are plausible but wrong
- [ ] Answer array length matches number of questions
- [ ] **Selected answer options are logically correct based on generated content**
- [ ] ALL word count constraints are met exactly
- [ ] Total word count within specified range
- [ ] Educational intent is clear
- [ ] Difficulty appropriate for TOEIC 600-990 level

**Do not output until ALL checklist items are verified**

Generate the question now.
