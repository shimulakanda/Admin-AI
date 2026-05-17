
import { GoogleGenAI, Type } from "@google/genai";
import { DocType, TicketCategory } from "../types";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const DIU_CONTEXT = `
Institution: Daffodil International University (DIU)
Location: Daffodil Smart City, Birulia, Savar, Dhaka-1216
Department: Department of Information and Communication Engineering (ICE)
Admin Persona: Md. Shahidul Islam Shimul, Assistant Coordination Officer.

CONTACT INFORMATION (To be used in signatures and footers):
Name: Md. Shahidul Islam Shimul
Designation: Assistant Coordination Officer
Department: Department of Information and Communication Engineering
Address: Daffodil Smart City, Birulia, Savar, Dhaka-1216
Phone/WhatsApp: +8801811 458828 | Ext.: 50111
Email: iceoffice@daffodilvarsity.edu.bd
Web: https://daffodilvarsity.edu.bd/department/ice

FORMATTING PATTERNS:

1. APPLICATIONS:
   - Header:
     Date: DD/MM/YYYY
     To
     The [Recipient: Registrar / Controller of Examinations / etc.]
     Daffodil International University
     Daffodil Smart City, Birulia, Savar, Dhaka-1216
   - Chain of Command (Indented):
     Through: [Relevant chain, e.g., Dean, Faculty of Engineering / Head, Department of ICE]
   - Subject: Application for [Subject Line].
   - Salutation: "Respected Sir," or "Dear Sir,"
   - Body: Formal, clear, and concise. Mention Student Name, ID, and Department clearly.
   - Tables: If listing courses, use a Markdown table with columns: SL, Course Code, Course Title, Credit.
   - Signature Block:
     Sincerely,
     
     Md. Shahidul Islam Shimul
     Assistant Coordination Officer
     Department of Information and Communication Engineering
     Daffodil International University

2. NOTICES:
   - Header: Reference no.: DIU/ICE/REF/[YEAR]/[MONTH]/[SEQ]     Date: DD/MM/YYYY
   - Title: Centered bold "NOTICE" or "Notice".
   - Body: Use bullet points for instructions.
   - Tables: If listing students or board members, use a Markdown table with SL, ID, Name columns.
   - Signature: Typically Md. Shahidul Islam Shimul or other Faculty as specified in the prompt.

3. EMAILS:
   - Greeting: "Respected Concern," or specific name, followed by "Assalamualaikum. I hope this email finds you well."
   - Body: Professional and helpful.
   - Closing: "Thank you in advance for your kind support and assistance."
   - Signature:
     Md. Shahidul Islam Shimul
     Assistant Coordination Officer
     Department of Information and Communication Engineering
     Savar, Dhaka-1216
     Phone/WhatsApp: +8801811 458828 | Ext.: 50111
     Email: iceoffice@daffodilvarsity.edu.bd
`;

export const generateFullDocument = async (type: DocType, prompt: string, context: string) => {
  const model = 'gemini-3-pro-preview';
  const systemInstruction = `You are an expert Admin AI assistant for Daffodil International University (DIU).
  ${DIU_CONTEXT}
  
  TASK: Generate a complete formal ${type} based on the user request: "${prompt}".
  
  CRITICAL: 
  - strictly adhere to the DIU formatting patterns provided.
  - The "subject" field should contain ONLY a concise single-line subject, no "Subject:" prefix.
  - The "body" field should contain the full, formal written document content WITHOUT the subject line. Treat it as the main letter or notice text.`;

  const response = await ai.models.generateContent({
    model,
    contents: `Generate a distinct subject and body of a document based on the following instructions: ${prompt}`,
    config: { 
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          subject: { type: Type.STRING, description: "A concise single-line subject header, excluding any 'Subject:' prefix." },
          body: { type: Type.STRING, description: "The full formal narrative or document body, excluding the subject header." }
        }
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

export const generateDraft = async (type: DocType, prompt: string, context: string) => {
  const model = 'gemini-3-pro-preview';
  const systemInstruction = `You are an expert Admin AI assistant for Daffodil International University (DIU).
  ${DIU_CONTEXT}
  
  TASK: Generate a formal ${type} based on the user request: "${prompt}".
  Contextual Data: ${context}
  
  CRITICAL: 
  - Strictly adhere to the DIU formatting patterns provided. 
  - If a table is needed for courses or students, always use a clean Markdown table.
  - The signature must be professional and include the requested contact details.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: { systemInstruction }
  });

  return response.text || "Failed to generate draft.";
};

export const suggestResolution = async (category: TicketCategory, description: string) => {
  const model = 'gemini-3-flash-preview';
  const response = await ai.models.generateContent({
    model,
    contents: `Suggest 3-5 clear resolution steps for the following DIU university issue:
    Category: ${category}
    Issue: ${description}
    Return the response as a clear, numbered list.`,
  });

  return response.text || "No suggestions available.";
};

export const summarizeMeeting = async (notes: string) => {
  const model = 'gemini-3-pro-preview';
  const response = await ai.models.generateContent({
    model,
    contents: `Convert these DIU departmental meeting notes into professional university meeting minutes:
    ${notes}
    Include sections for: Attendees, Key Discussion Points, Decisions Made, and Action Items.`,
  });

  return response.text || "Failed to summarize.";
};

export const extractMetadata = async (base64Image: string) => {
  const model = 'gemini-3-flash-preview';
  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { text: "Extract metadata from this DIU document: Name, ID, Department, Date, Ref No. Format as JSON." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          department: { type: Type.STRING },
          date: { type: Type.STRING },
          refNo: { type: Type.STRING },
          purpose: { type: Type.STRING }
        }
      }
    }
  });

  return JSON.parse(response.text || "{}");
};
