import Groq from "groq-sdk";
import { z } from "zod";
import { NextResponse } from "next/server";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const paletteSchema = z.object({
  colors: z
    .array(
      z.object({
        name: z.string(),
        hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
        percentage: z.coerce.number().min(0).max(100),
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

    const completion = await groq.chat.completions.create({
      model: "qwen/qwen3.8-27b",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `
                Analyze this image and identify exactly 5 dominant colors.

                Return a JSON object with a "colors" array.
                Each color must include:
                - name: A descriptive color name
                - hex: A valid 6-digit HEX color code
                - percentage: Estimated percentage of the image

                Percentages must add up to approximately 100.
                Return only valid JSON.
              `,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${file.type};base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_completion_tokens: 1024,
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error("Groq returned an empty response.");
    }

    const palette = paletteSchema.parse(JSON.parse(content));

    return NextResponse.json(palette);
  } catch (error) {
    console.error("Image analysis error:", error);

    return NextResponse.json(
      { error: "Image analysis failed. Please try again." },
      { status: 500 },
    );
  }
}
