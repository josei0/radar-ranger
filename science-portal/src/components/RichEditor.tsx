"use client";

import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import { useMemo, useRef } from "react";

const QuillWrapper = dynamic(() => import("./QuillWrapper"), { ssr: false });

interface RichEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function RichEditor({ value, onChange }: RichEditorProps) {
  const quillRef = useRef<any>(null);

  const modules = useMemo(
    () => ({
      blotFormatter: {}, // Enables drag-to-resize and alignment for images/videos
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          [{ size: ["small", false, "large", "huge"] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "image", "video"],
          ["clean"],
        ],
        handlers: {
          image: () => {
            const url = prompt("Paste Image URL here (must start with http/https):");
            if (url && quillRef.current) {
              const editor = quillRef.current.getEditor();
              const range = editor.getSelection(true);
              editor.insertEmbed(range.index, "image", url);
              editor.setSelection(range.index + 1);
            }
          },
          video: () => {
            const url = prompt("Paste YouTube URL here:");
            if (url && quillRef.current) {
              let videoId = "";
              if (url.includes("v=")) {
                videoId = url.split("v=")[1].split("&")[0];
              } else if (url.includes("youtu.be/")) {
                videoId = url.split("youtu.be/")[1].split("?")[0];
              } else if (url.includes("embed/")) {
                videoId = url.split("embed/")[1].split("?")[0];
              } else if (url.includes("shorts/")) {
                videoId = url.split("shorts/")[1].split("?")[0];
              }

              if (videoId) {
                const embedUrl = `https://www.youtube.com/embed/${videoId}`;
                const editor = quillRef.current.getEditor();
                const range = editor.getSelection(true);
                editor.insertEmbed(range.index, "video", embedUrl);
                editor.setSelection(range.index + 1);
              } else {
                alert("Invalid YouTube URL. Please paste a valid YouTube link.");
              }
            }
          },
          link: () => {
            const url = prompt("Paste Link URL here:");
            if (url && quillRef.current) {
              const editor = quillRef.current.getEditor();
              const range = editor.getSelection(true);
              if (range.length > 0) {
                editor.format("link", url);
              } else {
                editor.insertText(range.index, url, "link", url);
                editor.setSelection(range.index + url.length);
              }
            }
          }
        }
      }
    }),
    []
  );

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-black/10 text-black">
      <QuillWrapper 
        ref={quillRef}
        theme="snow" 
        value={value} 
        onChange={onChange} 
        modules={modules}
        className="min-h-[200px]"
      />
    </div>
  );
}
