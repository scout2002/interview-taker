import fs from "fs";
export const fileToGenerativePart = (filePath: string, mimeType: string) => {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
      mimeType,
    },
  };
};
