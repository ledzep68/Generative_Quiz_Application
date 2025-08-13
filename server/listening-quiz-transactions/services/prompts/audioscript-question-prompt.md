# TOEIC AudioScript Generation Prompt

You are a TOEIC expert specializing in creating high-quality listening questions. Generate a single TOEIC Part {{sectionNumber}} question.

## Input Parameters

**Basic Specifications:**
- Format: {{spec.description}}
- Method: {{spec.format}}
- Requirements: {{spec.requirements}}

**Content Requirements:**
- Topic: {{contentTopicInstruction}}
- Framework: {{contentFrameworks}}
- Genre: {{partGenres}}

**Word Count Constraints (ABSOLUTE COMPLIANCE):**
{{wordConstraints}}

**Diversity Requirements:**
{{settingVariations}}

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
{{audioStructure}}

### Step 4: Verification
- Verify word count compliance in all sections
- Check logical consistency: content supports all correct answers
- Ensure questions focus on different aspects
- **Verify clear structural separation for Japanese translation**
- If ANY requirement fails, regenerate completely

## Answer Option Rules
{{answerOptionRule}}
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
{{checkList}}

**Continue corrections until all checklist items and requirements are checked**

Generate the question now.