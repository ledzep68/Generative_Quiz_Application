# TOEIC Listening Problem Generation Prompt (Content-First Integrated Version)

Generate {{requestedNumOfQuizs}} practice problems for TOEIC Listening Part {{sectionNumber}}.

## Part {{sectionNumber}} Specifications

- **Problem Format**: {{spec.description}}
- **Question Method**: {{spec.format}}
- **Requirements**: {{spec.requirements}}

{{speakerAccentAndPatternList}}

## Content Topics and Answer Option Specification (CRITICAL - MUST FOLLOW EXACTLY)

{{contentTopicInstruction}}

### Critical Generation Procedure (MANDATORY)
1. **FIRST**: Generate speech content focusing on the specified topic above
2. **SECOND**: Create the question that naturally relates to that content
3. **THIRD**: Design the correct choice to directly answer the question based on the content
4. **FOURTH**: Place the correct choice content in the specified position ({{answerOptionPattern}})
5. **FIFTH**: Create 3 misleading but plausible incorrect choices for other positions
6. **SIXTH**: Verify that content and correct answer are logically aligned

### Logical Consistency Verification (MANDATORY)
**Before finalizing each problem, verify:**
- ✅ Does the speech content actually discuss the specified topic?
- ✅ Does the question naturally arise from the content?
- ✅ Does the correct choice accurately reflect what was discussed in the content?
- ✅ Are the incorrect choices plausible but clearly wrong based on the content?

**Reject and regenerate if any verification fails**

## Answer Option (answerOption) Specification

{{answerOptionInstruction}}

### Important Notes
- The above correct answer choices cannot be changed
- Choice order in audioScript is always generated as A→B→C→D
- Place correct content in the specified choice position
- Place appropriate incorrect answers in other choices

## AudioScript Structure

- **Generate choices to match the specified correct answer option (answerOption)**
{{audioStructure}}

## Required Content Frameworks (Part {{sectionNumber}} Specific)

{{contentFrameworks}}

## Supported Genres

{{partGenres}}

## JpnAudioScript Format (Strict Compliance Required)

{{jpnAudioScriptFormat}}

**Critical Format Rules:**
- No line breaks within jpnAudioScript content (single line)
- Exact spacing: Single space after colons
- Choice format: "A. [content] B. [content] C. [content] D. [content]"
- Remove all placeholder brackets [ ] from actual output
- Use consistent terminology as specified in format

## Word Count Constraints (Mandatory Compliance - Immediate Correction Required for Violations)

{{wordConstraints}}

**Important**: You have difficulty accurately counting words.
Therefore, you must execute the following:
1. Be mindful of approximate word count while generating
2. Count strictly after completion
3. Modify without question if outside range
4. Do not output until perfectly within range

**Absolute Compliance Requirements:**
- Each item must be within the specified word count range (outside range is prohibited)
- If even one word short or over the range, correct immediately
- Output prohibited until correction is complete

### Mandatory Verification Process
1. Count words for each item after generation
2. Immediately adjust content if outside range
3. Repeat corrections until all items are within range
4. Output only after verification is complete

### Correction Methods
- **When exceeding**: Remove unnecessary modifiers, simplify sentences
- **When insufficient**: Add specific examples, expand detailed explanations

## Quality Assurance Process (MANDATORY)

### Pre-Generation Checklist
- [ ] Confirm the required content topic for each question
- [ ] Understand the logical connection: Content → Question → Correct Answer
- [ ] Plan speech content that naturally leads to the specified correct choice

### Post-Generation Verification
- [ ] Content actually discusses the specified topic
- [ ] Question naturally arises from the content
- [ ] Correct choice accurately reflects the content discussion
- [ ] Incorrect choices are plausible but clearly wrong
- [ ] Word counts are within specified ranges
- [ ] Accent features are appropriately reflected

**Do not proceed to next question until all checks pass**

## Other Generation Items

- **answerOption**: Correct answer choice ({{answerOptionPattern}} respectively)
- **sectionNumber**: Problem section number. Part{{sectionNumber}} (required)
- **explanation**: Detailed explanation in Japanese (required - must include the following elements)
  - **Basis for correct answer**: Clear reasoning why that choice is correct
  - **Analysis of incorrect choices**: Explanation of why other choices are wrong
  - **Vocabulary and grammar points**: Commentary on important vocabulary and grammar used in the problem
  - **Pronunciation and listening tips**: 
    * Listening points for the relevant accent
    * Sound differences Japanese learners should note
    * Explanation of sound changes and linking
  - **Accent-specific expressions**: 
    * Explanation of region-specific vocabulary used
    * Impact of pronunciation features on listening comprehension
    * Comparison with similar but different expressions from other regions
  - **Application to similar problems**: Tips and points for solving problems with the same pattern
- **speakerAccent**: Accent specified for each problem

## Diversity Requirements (Mandatory)

### Dynamic Diversity Requirements
- **1 problem**: No restrictions
- **2 problems**: 2 different genres
- **3 problems**: 3 different genres  
- **4 problems**: 4 different genres
- **5+ problems**: Include at least 5 different genres

### Setting Diversity

{{settingVariations}}

### Duplication Avoidance Rules
- **Same genre**: Maximum 2 problems (for 10 problems)
- **Same setting**: Maximum 1 problem per location
- **Same pattern**: Consecutive problems with similar structure prohibited

## Difficulty Requirements (TOEIC 600-990 point level)

### Difficulty Setting
- **Difficulty Level**: TOEIC official test level (equivalent to 600-990 points)

### Use of Indirect Expressions
- **Direct expression prohibited**: Don't state answers directly
- **Inference elements**: Questions requiring judgment from context
- **Implicit information**: Expressions like "We might consider..." "It would be advisable..."

### Complex Vocabulary and Grammar
- **Technical terms**: Appropriate use of industry terminology for each field
- **Synonyms and similar words**: Confusing vocabulary with similar meanings
- **Complex tenses**: Past perfect, future perfect, subjunctive past
- **Participial constructions**: Having completed, Being unable to, etc.

### Misleading Choices
- **Partial correct answers**: Partially correct but wrong overall
- **Context misalignment**: Related but not corresponding to the question
- **Numerical/date confusion**: Tricky similar numbers or dates

## Choice Creation Procedure (Mandatory)

1. First determine the correct content based on specified topic
2. Place that correct answer in the specified position ({{answerOptionPattern}})
3. Place incorrect choices in other positions
4. In audioScript, read in A→B→C→D order
5. Specify actual correct position with answerOption

**Note**: Choice placement follows specified pattern, not random placement

## Output Format

Must respond in JSON format with the following structure:

{{outputFormat}}

## Most Important Instructions (Takes priority over everything else)

### Absolute Compliance Items
1. **Content-Topic Alignment**: Content MUST focus on specified topics (highest priority)
2. **Logical Consistency**: Content → Question → Answer sequence must make logical sense
3. **Answer distribution**: Must distribute across multiple choices (concentration on single choice absolutely prohibited)
4. **Word count**: Must be within specified range (immediate correction if outside range)
5. **Japanese explanation**: All explanations must be written in Japanese
6. **Self-correction**: Automatically correct when requirement violations are detected

### Response to Violations
- Do not output anything that violates requirements
- Automatically adjust when correction is needed
- Continue generation until requirements are fully met

## Important Notes

1. **Content-First Priority**: Always generate content first, then ensure correct answers match that content
2. **Topic Specification Compliance**: Strictly follow the specified content topics for each question
3. **Correct answer choice placement**: Place correct answers in specified positions for each problem
4. **Choice order in audioScript**: Always structure audio content in A→B→C→D order (regardless of correct answer position, always read in this order)
5. **Omission of choice labels**: Do not read "A", "B", "C", "D" labels in audioScript
6. **Appropriate pause placement**: Structure with natural pauses between sentences and between questions and answers
7. **Adherence to Part-specific audioScript structure**: Strictly follow specified audioScript structure rules

## Absolutely Prohibited Items
❌ Content that doesn't match the specified topic
❌ Questions that don't relate to the speech content
❌ Correct answers that contradict the speech content
❌ Logical inconsistencies between content and choices
❌ Extremely biasing all problem answerOptions to a single choice
❌ Having the same choice for 3 or more consecutive problems
❌ Using formats like {"questions": [...]}
❌ Using Markdown code blocks (```json)
❌ English explanations (must be Japanese)

## Quality Standards

### Problem Content Quality Standards
- **Topic Alignment**: Perfect alignment between specified topics and actual content
- **Logical Flow**: Natural progression from content to question to answer
- **Difficulty**: TOEIC official test level (equivalent to 600-990 points)
- **Vocabulary level**: Appropriate distribution of intermediate to advanced business English, daily conversation, and academic vocabulary
- **Grammar items**: Natural incorporation of practical grammar such as tenses, subjunctive, relative clauses, participial constructions
- **Context consistency**: Consistent speakers, scenes, and situation settings with realistic scenarios

### Choice Quality Standards
- **Answer Accuracy**: Correct choices must perfectly reflect the content discussion
- **Misleading elements**: Sophisticated trap elements at actual TOEIC test level
- **Incorrect answer choices**: Not random nonsense, but choices with rational reasons that learners might mistakenly select
- **Vocabulary duplication avoidance**: Avoid duplication of words directly leading to correct answers, emphasizing context understanding
- **Length balance**: Appropriately adjust choice lengths so they don't suggest the correct answer

### Accent-specific Requirements
- **Reflection of pronunciation features**: Naturally reflect phonological characteristics of each accent in vocabulary and expression selection
- **Regional vocabulary**: Appropriate use of regional vocabulary like American "elevator" vs. British "lift"
- **Expression patterns**: Reflect idiomatic expressions, politeness levels, and conversation patterns of each region
- **Pronunciation instruction elements**: Include elements that help learners understand characteristics of each accent

### Explanation Quality Standards
- **Practical commentary directly contributing to learner level improvement**
- **Not mere correct answer announcement, but specific instruction for English proficiency improvement**
- **Solution techniques practically applicable in TOEIC preparation**
- **Comprehensive logical consistency verification in explanations**
- **Clear reasoning that demonstrates the content-to-answer connection**
- **Accent-specific learning points that help with listening comprehension**
- **Strategic insights for approaching similar problem patterns**
- **Concise yet comprehensive content (approximately 250-400 Japanese characters when output)**

### Overall Quality Requirements
- **Practicality**: Content with high probability of encounter in actual business, academic, and daily situations
- **Educational effect**: Learning elements that contribute to learner English proficiency improvement after answering
- **Cultural appropriateness**: Content appropriately reflecting cultural backgrounds of each English-speaking region
- **Contemporary relevance**: Settings reflecting modern situations, technology, and social conditions

## Verification Checklist (Must check before generation)

{{checkList}}

**Additional Content-First Verification:**
- □ Does each problem's content focus on the specified topic?
- □ Is there logical consistency between content, question, and correct answer?
- □ Are all explanations written in Japanese?
- □ Do the accent features naturally appear in the content?

**Continue corrections until all checklist items are checked**

## CRITICAL SUCCESS FACTORS

### 1. Topic-Content Alignment (HIGHEST PRIORITY)
- Speech content MUST focus on the specified topic
- Question MUST naturally arise from that content
- Correct choice MUST accurately reflect the content discussion

### 2. Logical Flow Verification
- Verify: Does this content → question → answer sequence make logical sense?
- Reject: Any combination that creates logical inconsistency

### 3. Quality Over Speed
- Take time to ensure logical consistency
- Do not rush content generation
- Verify each problem before moving to the next

## Absolute Compliance Requirements (Most Important)
1. First character of response must be "["
2. Last character of response must be "]"
3. Formats like {"questions": [...]} are absolutely prohibited
4. Return arrays directly
5. Markdown code blocks (```json) are prohibited
6. Output pure JSON only
7. Ensure complete logical consistency throughout all problems
8. All explanations must be in Japanese

**Success Metric**: Each problem must pass the logical consistency test: "Does the content naturally lead to this question and answer?"

Correct example: [{"audioScript": "..."}]
Wrong example: {"questions": [{"audioScript": "..."}]}
Wrong example: ```json [{"audioScript": "..."}] ```