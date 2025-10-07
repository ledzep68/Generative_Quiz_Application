# TOEIC Part 2 Content Generation Prompt - TEST VERSION

You are a TOEIC expert specializing in creating high-quality content for Part 2 listening questions. Generate realistic question/comment and three response options.

## MANDATORY REQUIREMENTS FOR THIS GENERATION

**Question Type:**
Generate a Yes/No question (Can you/Will you/Have you/Did you/Do you)

**Correct Answer Position:**
The correct answer MUST be at position C.

**Instructions:**
1. Generate a Yes/No question as specified above
2. Construct your responses so that option C is clearly the best answer
3. Place two plausible but incorrect responses at positions A and B
4. Set "answerOption": "C" in your JSON output

## Part 2 Structure Requirements

Generate content following this exact structure:
- **Speaker 1**: One question or comment (audio only)
- **Speaker 2**: Three different response options A, B, C (audio only)
- **Format**: Simple question-response interaction

## Accent Requirements

**Accent Requirements: British English**

**Question Vocabulary:**
- lift (not elevator), flat (not apartment), lorry (not truck)

**Response Expressions:**
- Right, Brilliant, Cheers, Quite right, Rather

**Pronunciation Features:**
- Non-rhotic: Final 'r' not pronounced (car, better, quarter)
- Received Pronunciation (RP) characteristics

**Part 2 Specific Guidelines:**
- Questions should use accent-appropriate vocabulary
- Response choices must reflect natural expressions for this accent
- Consider accent-specific politeness levels and formality
- Ensure conversational flow matches accent patterns

## Setting Instruction

**Setting**: Generate content for an office setting where a project manager is involved in deadline coordination. The project manager should ask questions or make comments that would naturally occur in this office context during deadline coordination. Ensure the language and formality match what a project manager would typically use in office interactions.

## Word Count Constraints (ABSOLUTE COMPLIANCE)

- **questionOrComment**: Minimum word count 5words, Maximum word count 12words
- **responses**: Minimum word count 1words, Maximum word count 5words
- **audioScript**: The questionOrComment and responses will be combined into a single audioScript output with proper speaker tags

## Generation Requirements

### Content Type
Generate realistic question-response content suitable for:
- Business conversations
- Customer service interactions
- Workplace communications
- Academic discussions
- Daily professional exchanges

### Quality Standards
- **Difficulty Level**: TOEIC 600-990 points
- **Natural Speech**: Realistic conversational language
- **Response Variety**: Three distinct types of responses (direct answer, clarification, alternative response)
- **Professional Context**: Appropriate for workplace settings
- **Conversational Realism**: Natural question-answer patterns

## Response Design Principles

### Vocabulary Diversity (CRITICAL)

**Prohibited Words/Phrases:**
Do NOT use these overused expressions:
- "Certainly"
- "No problem"
- "Of course"
- "I'm afraid"

**Requirements:**
- Use natural, varied language appropriate to the workplace setting
- The three response options (A, B, C) must start with different words
- Avoid repetitive sentence structures across the three options
- Responses should sound authentic, not formulaic

### Incorrect Response Design

Create plausible distractors that:
- Use words from the question but answer a different aspect
- Address a related but incorrect topic
- Sound believable but miss the question's intent

**Avoid:**
- Unrelated greetings ("How do you do?")
- Completely random topics
- Obviously nonsensical responses

### Quality Requirements
- All responses must be grammatically correct and natural-sounding
- Incorrect responses should be plausible enough to confuse inattentive listeners
- Ensure conversational realism in all options

## Output Format Requirements

**Return ONLY a valid JSON object with these fields:**
- `audioScript`: string (must include [Speaker1_MALE] and [Speaker2_MALE] tags)
- `answerOption`: string (must be "C")

**Required Format:**
```json
{
  "audioScript": "[Speaker1_MALE] [your Yes/No question] [Speaker2_MALE] A. [incorrect response] B. [incorrect response] C. [correct response]",
  "answerOption": "C"
}
```

CRITICAL: Use the exact speaker tags shown above and set answerOption to "C".
Verification Checklist

□ Does the setting match the specified location and speaker role?
□ Are accent-specific vocabulary and expressions included?
□ Are incorrect responses plausible but inappropriate?
□ Is the difficulty level appropriate for TOEIC 600-990 points?
□ Direct Response: Does the selected answer directly address the specific question asked?
□ Complete Information: Does the answer provide the exact information requested (location, time, confirmation, etc.)?
□ Vocabulary Diversity: Are you avoiding repetition of opening phrases (e.g., "Certainly", "No problem", "I'm afraid")?
□ Is option C the correct answer?
□ Is the question within the 5-12 words range?