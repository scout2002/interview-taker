import fs from "fs";
import path from "path";

export const saveFile = (
  filePath: string,
  destination: string,
  threadId: string
): string => {
  const fileName = `${threadId}.pdf`;
  const newFilePath = path.join(destination, fileName);

  try {
    fs.mkdirSync(destination, { recursive: true });
    fs.copyFileSync(filePath, newFilePath);
    fs.unlinkSync(filePath);
    return newFilePath;
  } catch (error) {
    console.error("Error moving/copying file:", error);
    throw error;
  }
};
