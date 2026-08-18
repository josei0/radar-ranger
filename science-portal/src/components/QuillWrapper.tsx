"use client";

import ReactQuill, { Quill } from "react-quill-new";
import BlotFormatter from "quill-blot-formatter";
import { forwardRef } from "react";
import "react-quill-new/dist/quill.snow.css";

// Register the module to add resize/alignment capabilities for images and iframes
if (!Quill.imports["modules/blotFormatter"]) {
  Quill.register("modules/blotFormatter", BlotFormatter);
}

const QuillWrapper = forwardRef((props: any, ref: any) => {
  return <ReactQuill ref={ref} {...props} />;
});

QuillWrapper.displayName = "QuillWrapper";

export default QuillWrapper;
