import { readFile } from "fs/promises";
import { PDFParse } from "pdf-parse";

/**
 * Extracts text and metadata from a PDF file
 * @param filePath - The path to the PDF file
 * @returns An object containing the text, number of pages, and metadata
 */
export const extractTextFromPdf = async (
  filePath: string
): Promise<{ text: string; numPages: number; info: any }> => {
  let parser: PDFParse | null = null;
  try {
    const dataBuffer = await readFile(filePath);
    parser = new PDFParse({ data: dataBuffer });

    const textResult = await parser.getText();
    const infoResult = await parser.getInfo();

    return {
      text: textResult.text,
      numPages: textResult.total,
      info: infoResult,
    };
  } catch (error) {
    console.error("Error extracting text from PDF", error);
    throw new Error("Failed to extract text from PDF");
  } finally {
    // Clean up parser resources
    if (parser) {
      await parser.destroy().catch(() => {});
    }
  }
};
