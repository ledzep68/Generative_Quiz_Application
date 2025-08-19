# TOEIC Part 2 Japanese AudioScript Generation Prompt

## Task Definition
Transform the English Script into a structured Japanese format for TOEIC learners.

## Input Information

**Original Script:**
[Speaker1_MALE] How's the afternoon shift progressing? [Speaker2_FEMALE] A. Certainly, it's on schedule. B. That's excellent, how about you? C. Of course, it starts tomorrow.

## Output Format Requirements

Create a structured Japanese version following this exact format:
質問・応答問題
設問文: [話者1 男性/女性] [Question/Comment in Japanese] 
選択肢: [話者2 男性/女性] A. [Choice 1 in Japanese] B. [Choice 2 in Japanese] C. [Choice 3 in Japanese]

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