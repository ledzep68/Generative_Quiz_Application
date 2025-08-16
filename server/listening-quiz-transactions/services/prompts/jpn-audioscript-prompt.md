# TOEIC Part {{sectionNumber}} Japanese AudioScript Generation Prompt

## Task Definition
Transform the English Script into a structured Japanese format for TOEIC learners.

## Input Information

**Original Script:**
{{audioScript}}

## Output Format Requirements

Create a structured Japanese version following this exact format:
{{jpnAudioScriptFormat}}

## Translation Requirements

### Speaker Information
- Transform "[Speaker1_MALE]" → "[話者1 男性]"
- Transform "[Speaker1_FEMALE]" → "[話者1 女性]"
- Transform "[Speaker2_MALE]" → "[話者2 男性]"
- Transform "[Speaker2_FEMALE]" → "[話者2 女性]"

### Content Translation
- Use natural, formal Japanese appropriate for business contexts
- Maintain the original meaning and nuance
- Use polite/formal tone (です/である調)
- Preserve technical terms and numbers accurately

## Output Instructions
**Return ONLY the structured Japanese text in the specified format. No explanations or additional text.**