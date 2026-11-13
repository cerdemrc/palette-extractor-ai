"use client";

import { useState } from "react";
import Image from "next/image";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  return (
    <main className="min-h-screen bg-[#faf9f6] px-6 py-8 text-zinc-900">
      <div className="mx-auto max-w-7xl">
        <header className="flex items-center justify-end gap-3">
          <span className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-sm font-medium text-violet-700">
            AI-powered color extraction
          </span>
        </header>

        <section className="mx-auto mt-24 max-w-2xl text-center">
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
            Discover the colors
            <span className="block text-violet-600">behind every image.</span>
          </h1>

          <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-zinc-500">
            Upload an image and let AI discover its dominant colors. Get a
            beautiful color palette in seconds.
          </p>

          <label className="mt-12 flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 bg-white p-8 transition hover:border-violet-400 hover:bg-violet-50/40">
            {preview ? (
              <Image
                src={preview}
                alt="Selected image preview"
                width={600}
                height={400}
                unoptimized
                className="max-h-56 max-w-full rounded-xl object-contain"
              />
            ) : (
              <>
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-2xl text-violet-600">
                  ↑
                </div>

                <span className="text-base font-semibold">
                  Drop your image here
                </span>

                <span className="mt-2 text-sm text-zinc-500">
                  or click to browse your files
                </span>

                <span className="mt-5 text-xs text-zinc-400">
                  PNG, JPG or WEBP
                </span>
              </>
            )}

            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(event) => {
                const selectedFile = event.target.files?.[0];

                if (selectedFile) {
                  setFile(selectedFile);
                  setPreview(URL.createObjectURL(selectedFile));
                }
              }}
            />
          </label>

          {file && (
            <div className="mt-5 flex flex-col items-center gap-3">
              <p className="text-sm text-zinc-500">
                Selected:{" "}
                <span className="font-medium text-zinc-800">{file.name}</span>
              </p>

              <button
                onClick={() => {
                  URL.revokeObjectURL(preview);
                  setFile(null);
                  setPreview("");
                }}
                className="text-sm font-medium text-violet-600 hover:text-violet-800"
              >
                Remove image
              </button>
            </div>
          )}
        </section>

        <footer className="mt-24 text-center text-xs text-zinc-400">
          Palette Extractor AI · Turn images into colors
        </footer>
      </div>
    </main>
  );
}
