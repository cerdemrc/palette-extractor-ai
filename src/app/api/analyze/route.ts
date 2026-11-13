import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const paletteSchema = z.object({
  colors: z
    .array(
      z.object({
        name: z.string(),
        hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
        percentage: z.number().min(0).max(100),
      }),
    )
    .length(5),
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("image");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Please upload an image." },
        { status: 400 },
      );
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPG, PNG and WEBP images are supported." },
        { status: 400 },
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image size must be under 5 MB." },
        { status: 400 },
      );
    }

    const imageBase64 = Buffer.from(await file.arrayBuffer()).toString(
      "base64",
    );

    const response = await ai.interactions.create({
      model: "gemini-3.8-flash",
      input: [
        {
          type: "text",
          text: `Analyze this image and identify exactly 5 dominant colors.
Return each color's name, HEX code and estimated percentage of the image.
The percentages should add up to approximately 100.
Return only valid JSON matching the requested schema.`,
        },
        {
          type: "image",
          data: imageBase64,
          mime_type: file.type,
        },
      ],
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: {
          type: "object",
          properties: {
            colors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  hex: { type: "string" },
                  percentage: { type: "number" },
                },
                required: ["name", "hex", "percentage"],
              },
            },
          },
          required: ["colors"],
        },
      },
    });

    if (!response.output_text) {
      throw new Error("Gemini returned an empty response.");
    }

    const palette = paletteSchema.parse(JSON.parse(response.output_text));

    return NextResponse.json(palette);
  } catch (error) {
    console.error("Image analysis error:", error);

    return NextResponse.json(
      { error: "Image analysis failed. Please try again." },
      { status: 500 },
    );
  }
}
