import { GoogleGenAI } from "@google/genai";
import { ENVIRONMENTS } from "../constants";
import { Difficulty } from "../types";

const ai = new GoogleGenAI({ apiKey: ENVIRONMENTS.GEMINI_API_KEY });

/**
 * Generates flashcards from a text using Gemini API
 * @param text - The text to generate flashcards from
 * @param count - The number of flashcards to generate
 * @returns An array of flashcards or undefined if an error occurs
 */
export const generateFlashcard = async (
  text: string,
  count = 10
): Promise<
  { question: string; answer: string; difficulty: Difficulty }[] | undefined
> => {
  const prompt = `Generate exactly ${count} educational flashcards from the following text.
  Format each flashcard as:
  Q: [Clear, specific question]
  A: [Concise, accurate answer]
  D: [Difficulty level: easy, medium, or hard]

  Separate each flashcard with "---"

  Text:
  ${text.substring(0, 15000)}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: [prompt],
    });

    const generatedText = response.text ?? "";

    // Parse the response
    const flashcards: {
      question: string;
      answer: string;
      difficulty: Difficulty;
    }[] = [];
    const cards = generatedText.split("---").filter((c) => c.trim());

    for (const card of cards) {
      const lines = card.trim().split("\n");
      let question = "",
        answer = "",
        difficulty = Difficulty.MEDIUM;

      for (const line of lines) {
        if (line.startsWith("Q:")) question = line.substring(2).trim();
        else if (line.startsWith("A:")) answer = line.substring(2).trim();
        else if (line.startsWith("D:")) {
          const diff = line.substring(2).trim().toLowerCase();
          if (
            [Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD].includes(
              diff as Difficulty
            )
          )
            difficulty = diff as Difficulty;
        }
      }

      if (question && answer) flashcards.push({ question, answer, difficulty });
    }

    return flashcards.slice(0, count);
  } catch (error) {
    console.error("Gemini Service Error", error);
    throw new Error("Failed to generate flashcards");
  }
};

/**
 * Generates a quiz from a text using Gemini API
 * @param text - The text to generate a quiz from
 * @param numQuestions - The number of questions to generate
 * @returns An array of questions or undefined if an error occurs
 */
export const generateQuiz = async (
  text: string,
  numQuestions = 5
): Promise<
  | {
      question: string;
      options: string[];
      correctAnswer: string;
      explanation: string;
      difficulty: Difficulty;
    }[]
  | undefined
> => {
  const prompt = `Generate exactly ${numQuestions} multiple-choice questions from the following text.
  Format each question as:
  Q: [Question]
  O1: [Option 1]
  O2: [Option 2]
  O3: [Option 3]
  O4: [Option 4]
  C: [Correct option - exactly as written above]
  E: [Brief explanation]
  D: [Difficulty level: easy, medium, or hard]
  
  Separate each question with "---"

  Text:
  ${text.substring(0, 15000)}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: [prompt],
    });

    const generatedText = response.text ?? "";

    const questions: {
      question: string;
      options: string[];
      correctAnswer: string;
      explanation: string;
      difficulty: Difficulty;
    }[] = [];
    const questionBlocks = generatedText.split("---").filter((q) => q.trim());

    for (const block of questionBlocks) {
      const lines = block.trim().split("\n");
      let question = "",
        options: string[] = [],
        correctAnswer = "",
        explanation = "",
        difficulty = Difficulty.MEDIUM;

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith("Q:"))
          question = trimmedLine.substring(2).trim();
        else if (trimmedLine.match(/^O\d+: /))
          options.push(trimmedLine.substring(3).trim());
        else if (trimmedLine.startsWith("C:"))
          correctAnswer = trimmedLine.substring(2).trim();
        else if (trimmedLine.startsWith("E:"))
          explanation = trimmedLine.substring(2).trim();
        else if (trimmedLine.startsWith("D:")) {
          const diff = trimmedLine.substring(2).trim().toLowerCase();
          if (
            [Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD].includes(
              diff as Difficulty
            )
          ) {
            difficulty = diff as Difficulty;
          }
        }
      }

      if (question && options.length === 4 && correctAnswer) {
        questions.push({
          question,
          options,
          correctAnswer,
          explanation,
          difficulty,
        });
      }
    }

    return questions.slice(0, numQuestions);
  } catch (error) {
    console.error("Gemini Service Error", error);
    throw new Error("Failed to generate quiz");
  }
};

/**
 * Generates a summary from a text using Gemini API
 * @param text - The text to generate a summary from
 * @returns A summary or undefined if an error occurs
 */
export const genrateSummary = async (
  text: string
): Promise<string | undefined> => {
  const prompt = `Provide a concise summary of the following text, highlighting the main points and key concepts, main ideas, and important details.
  Keep it clear, concise, structured, and easy to understand.

  Text:
  ${text.substring(0, 20000)}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: [prompt],
    });
    const generatedText = response.text ?? "";
    return generatedText;
  } catch (error) {
    console.error("Gemini Service Error", error);
    throw new Error("Failed to generate summary");
  }
};

/**
 * Chats with context using Gemini API
 * @param question - The question to answer
 * @param chunks - The chunks of the document
 * @returns An answer or undefined if an error occurs
 */
export const chatWithContext = async (
  question: string,
  chunks: { content: string; chunkIndex: number; pageNumber: number }[]
): Promise<string | undefined> => {
  const context = chunks
    .map((chunk, index) => `[Chunk] ${index + 1}\n${chunk.content}`)
    .join("\n\n");

  console.log("Context______", context);

  const prompt = `Based on the following context from a document. Analyse the context and answer the user's question.
  If the answer is not in the context ,say so.

  Context:
  ${context}

  Question: ${question}

  Answer:`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: [prompt],
    });
    const generatedText = response.text ?? "";
    return generatedText;
  } catch (error) {
    console.error("Gemini Service Error", error);
    throw new Error("Failed to chat with context");
  }
};

/**
 * Explains a concept using Gemini API
 * @param concept - The concept to explain
 * @param context - The context to use for the explanation
 * @returns An explanation or undefined if an error occurs
 */
export const explainConcept = async (
  concept: string,
  context: string
): Promise<string | undefined> => {
  const prompt = `Explain the concept of "${concept}" based on the following context.
  Provide a clear, educational explaination that's easy to understand.
  Inlude examples if relevant.
  
  Context:
  ${context.substring(0, 10000)}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: [prompt],
    });
    const generatedText = response.text ?? "";
    return generatedText;
  } catch (error) {
    console.error("Gemini Service Error", error);
    throw new Error("Failed to explain concept");
  }
};
