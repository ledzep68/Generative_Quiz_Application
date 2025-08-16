# TOEIC Part 4 Japanese AudioScript Generation Prompt

## Task Definition
Transform the English Script into a structured Japanese format for TOEIC learners.

## Input Information

**Original Script:**
Content: [Speaker1_MALE] Good morning, everyone. As we gather here in the meeting room, I'm pleased to present our quarterly report. Over the past three months, our department has seen a 15% increase in productivity, thanks to the new software implementation. I guess the training sessions really paid off. Our customer satisfaction scores have also improved, reaching an impressive 92%. You bet that's a result of our dedicated team efforts. Additionally, we've managed to reduce operational costs by 10%, which is a significant achievement. Looking ahead, we aim to focus on expanding our market reach and enhancing our product line. Sure thing, collaboration will be key to achieving these goals. Let's continue to work together to maintain this positive momentum. Thank you for your hard work and dedication.

Questions and Choices: [QUESTION_1] What is the main focus of the speech? [CHOICES_1] A. Increasing customer satisfaction B. Reducing operational costs C. Presenting the quarterly report D. Discussing new software [QUESTION_2] How much did productivity increase? [CHOICES_2] A. 10% B. 15% C. 20% D. 25% [QUESTION_3] What is the next goal mentioned? [CHOICES_3] A. Hiring more staff B. Improving training sessions C. Expanding market reach D. Increasing salaries

## Output Format Requirements

Create a structured Japanese version following this exact format:
説明文問題
スピーチ内容: [話者1 男性/女性] [Speech in Japanese] 
設問1: [Question 1 in Japanese] 
選択肢: A. [Choice 1 in Japanese] B. [Choice 2 in Japanese] C. [Choice 3 in Japanese] D. [Choice 4 in Japanese] 
設問2: [Question 2 in Japanese] 
選択肢: A. [Choice 1 in Japanese] B. [Choice 2 in Japanese] C. [Choice 3 in Japanese] D. [Choice 4 in Japanese] 
設問3: [Question 3 in Japanese] 
選択肢: A. [Choice 1 in Japanese] B. [Choice 2 in Japanese] C. [Choice 3 in Japanese] D. [Choice 4 in Japanese]

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