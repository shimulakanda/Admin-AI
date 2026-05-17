
import { Type } from "@google/genai";
import { DocType, TicketCategory } from "../types";

const generateViaProxy = async (model: string, contents: any, config?: any) => {
  const response = await fetch("/api/gemini/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, contents, config })
  });

  const text = await response.text();
  let data: any;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    throw new Error(`Server returned invalid JSON (${response.status}): ${text.substring(0, 200)}`);
  }

  if (!response.ok) {
    let errMsg = data.error || "Failed to communicate with AI Service";
    // If the error message is itself a JSON string (like from googleapis), parse it to get the inner message
    try {
      const innerErr = JSON.parse(errMsg);
      if (innerErr && innerErr.error && innerErr.error.message) {
        errMsg = innerErr.error.message;
      }
    } catch (e) {}
    throw new Error(errMsg);
  }

  return data;
};

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
  const model = 'gemini-2.5-flash';
  const systemInstruction = `You are an expert Admin AI assistant for Daffodil International University (DIU).
  ${DIU_CONTEXT}
  
  TASK: Generate a complete formal ${type} based on the user request: "${prompt}".
  
  CRITICAL: 
  - strictly adhere to the DIU formatting patterns provided.
  - The "subject" field should contain ONLY a concise single-line subject, no "Subject:" prefix. This will be used as the internal title.
  - The "body" field should contain the full, formal written document content. For Formal Applications, you MUST include the "Subject: ..." line within this body text in its proper place before the salutation.
  - Use markdown for tables if required.`;

  const response = await generateViaProxy(
    model,
    `Generate a distinct subject and body of a document based on the following instructions: ${prompt}`,
    { 
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          subject: { type: Type.STRING, description: "A concise single-line subject header, excluding any 'Subject:' prefix." },
          body: { type: Type.STRING, description: "The full formal narrative or document body. Include the 'Subject: ...' line inside this body if it is an application." }
        }
      }
    }
  );

  try {
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Failed to parse Gemini output:", response.text);
    throw new Error("AI returned invalid or incomplete format. Please try again.");
  }
};

export const generateDraft = async (type: DocType, prompt: string, context: string) => {
  const model = 'gemini-2.5-flash';
  const systemInstruction = `You are an expert Admin AI assistant for Daffodil International University (DIU).
  ${DIU_CONTEXT}
  
  TASK: Generate a formal ${type} based on the user request: "${prompt}".
  Contextual Data: ${context}
  
  CRITICAL: 
  - Strictly adhere to the DIU formatting patterns provided. 
  - If a table is needed for courses or students, always use a clean Markdown table.
  - The signature must be professional and include the requested contact details.`;

  const response = await generateViaProxy(
    model,
    prompt,
    { systemInstruction }
  );

  return response.text || "Failed to generate draft.";
};

export const suggestResolution = async (category: TicketCategory, description: string) => {
  const model = 'gemini-2.5-flash';
  const response = await generateViaProxy(
    model,
    `Suggest 3-5 clear resolution steps for the following DIU university issue:
    Category: ${category}
    Issue: ${description}
    Return the response as a clear, numbered list.`
  );

  return response.text || "No suggestions available.";
};

export const summarizeMeeting = async (notes: string) => {
  const model = 'gemini-2.5-flash';
  const response = await generateViaProxy(
    model,
    `Convert these DIU departmental meeting notes into professional university meeting minutes:
    ${notes}
    Include sections for: Attendees, Key Discussion Points, Decisions Made, and Action Items.`
  );

  return response.text || "Failed to summarize.";
};

export const extractMetadata = async (base64Image: string) => {
  const model = 'gemini-2.5-flash';
  const response = await generateViaProxy(
    model,
    {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { text: "Extract metadata from this DIU document: Name, ID, Department, Date, Ref No. Format as JSON." }
      ]
    },
    {
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
  );

  try {
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Failed to parse Gemini output:", response.text);
    throw new Error("AI returned invalid or incomplete metadata format. Please try again.");
  }
};
