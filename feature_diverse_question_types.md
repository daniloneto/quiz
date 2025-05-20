# Feature: Support for Diverse Question Types

This document outlines the "Support for Diverse Question Types" feature for QuizGPT, aiming to enhance its versatility and pedagogical effectiveness.

## 1. Supported Question Types

QuizGPT will be expanded to generate and manage a variety of question formats. The initial set of supported types will include:

*   **Multiple-Choice Questions (MCQs):**
    *   Users can specify the topic or provide context, and optionally the correct answer.
    *   The system will leverage GPT to generate the question stem and automatically create plausible distractors (incorrect options). If the user provides the correct answer, GPT focuses on generating distractors; if not, GPT generates the question, correct answer, and distractors.
    *   Users should be able to configure the number of choices (e.g., 3, 4, or 5 options).
*   **True/False Questions:**
    *   Binary choice questions where users must determine if a given statement is true or false.
    *   GPT will be used to generate factual statements related to the input topic/content, ensuring they are clearly true or false.
*   **Short Answer Questions:**
    *   Open-ended questions that require users to formulate and type a concise free-text answer.
    *   These questions are designed to encourage recall, basic explanation, and understanding beyond simple recognition.

Future enhancements could explore other formats such as fill-in-the-blanks, matching pairs, or sequencing questions, depending on user demand and technical feasibility.

## 2. User Selection of Question Types

QuizGPT will provide users with intuitive ways to select or specify the desired question types during the quiz creation phase:

*   **Global Quiz Setting:** Users might select a single question type for an entire quiz (e.g., "Generate a 10-question True/False quiz").
*   **Mixed Question Types:**
    *   **Proportional Specification:** Users could specify the total number of questions and then define the desired mix (e.g., "Create a 15-question quiz with 50% MCQs, 30% True/False, and 20% Short Answer questions"). The system would then calculate the number of each type.
    *   **Specific Counts:** Users could directly input the number for each type (e.g., "7 MCQs, 5 True/False, 3 Short Answer questions").
*   **Question Editor/Builder:** An interface where users can add questions one by one or in batches, selecting the type for each addition.
*   **Checkboxes/Toggles:** During quiz setup, users could use checkboxes or toggles for the types of questions they wish to include. If multiple types are selected, the system could either distribute them based on pre-set proportions or allow users to define these.

The interface should be clear and flexible, allowing users to easily customize the composition of their quizzes.

## 3. Advantages of Supporting Diverse Question Formats

Introducing a variety of question types offers significant benefits:

*   **Assesses a Broader Range of Cognitive Skills:**
    *   **MCQs** are effective for testing recognition, comprehension, and application of knowledge.
    *   **True/False** questions are useful for quickly checking factual knowledge and identifying common misconceptions.
    *   **Short Answer** questions can assess recall, understanding, and the ability to articulate thoughts and explanations concisely.
*   **Enhances Quiz Engagement and Reduces Test Fatigue:** Varying the question formats can make quizzes more dynamic and less monotonous, potentially leading to improved user focus, motivation, and knowledge retention.
*   **Caters to Different Learning Preferences and Strengths:** Individuals may interact with and respond to different question types in different ways. Offering diversity can lead to a more inclusive and equitable assessment experience.
*   **Provides More Comprehensive Evaluation:** By employing a mix of question types, educators and learners can gain a more holistic and nuanced understanding of the grasp of the subject matter.
*   **Increases Flexibility in Assessment Design:** Educators can select question types that best align with their specific learning objectives for a given topic, module, or skill level. For example, using short answers for critical definitions and MCQs for application scenarios.

## 4. Implementation and Grading Considerations

Successfully implementing diverse question types requires careful thought regarding both generation and grading:

*   **Prompt Engineering for Question Generation:**
    *   The generation of each question type will necessitate distinct and well-crafted prompts for the GPT model.
    *   **MCQs:** Prompts must instruct GPT to generate a clear question, a correct answer, and a specified number of plausible yet incorrect distractors. For example: `"Generate a multiple-choice question on the topic of [topic] about [specific concept]. The correct answer is '[correct_answer_if_provided]'. Generate 3 distinct, incorrect but plausible distractors that are relevant to the topic."` If the correct answer isn't provided by the user, the prompt would ask GPT to generate it as well.
    *   **True/False:** Prompts will guide GPT to formulate a declarative statement about the given topic that is unambiguously true or false. E.g., `"Generate a factual statement about [historical_event] that is clearly false."`
    *   **Short Answer:** Prompts will request questions that necessitate a brief, free-text response, often focusing on definitions, brief explanations, or key facts. E.g., `"Generate a question that asks for a short answer defining [scientific_term]. The answer should be approximately 1-2 sentences."`
*   **Distractor Generation for MCQs (GPT-based):**
    *   The quality of MCQs heavily relies on the plausibility and relevance of distractors. GPT should be prompted to create distractors that are:
        *   Related to the subject matter to avoid easy guessing.
        *   Clearly incorrect upon careful consideration.
        *   Not obviously wrong, absurd, or grammatically inconsistent.
        *   Distinct from each other and from the correct answer.
    *   This will require significant prompt tuning and iterative testing.
*   **Grading Mechanisms:**
    *   **MCQs and True/False:** These formats are suitable for fully automated grading. The system will compare the user's selected option against the stored correct answer.
    *   **Short Answer Questions:** Grading is more challenging and may involve a multi-faceted approach:
        *   **Exact Match (Limited Use):** Only suitable for very specific, single-word, or highly standardized answers.
        *   **Keyword/Phrase Analysis (Automated Assistance):** The system could attempt partial auto-grading by checking for the presence or absence of predefined keywords or key phrases in the user's response. These keywords could even be suggested by GPT during question generation. This would be an assistive feature, and its accuracy would need to be clearly communicated.
        *   **Manual Grading:** For most short answer questions, especially those requiring nuanced understanding or explanation, manual review and grading by an educator or administrator will be necessary for accurate assessment. QuizGPT should provide an interface for this.
        *   **AI-Assisted Grading (Future Scope):** More advanced implementations could explore using a separate GPT call to evaluate the semantic similarity or correctness of a user's short answer against an ideal answer or rubric. This would require careful calibration, testing for reliability and bias, and clear indication to users that AI is assisting in the grading.
        *   **Character/Word Limits:** Enforcing or suggesting answer length limits can guide users and simplify review.

By thoughtfully implementing support for diverse question types, QuizGPT can become a significantly more powerful, flexible, and effective tool for educational assessment and learning.
