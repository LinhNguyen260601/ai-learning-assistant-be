import { PDFParse } from "pdf-parse";

/**
 * Extracts text and metadata from a PDF file
 * @param file - The PDF file as a Buffer
 * @returns An object containing the text, number of pages, and metadata
 */
export const extractTextFromPdf = async (
  file: Buffer
): Promise<{ text: string; numPages: number; info: any }> => {
  let parser: PDFParse | null = null;
  try {
    parser = new PDFParse({ data: file });

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
