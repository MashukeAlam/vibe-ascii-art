import { useState } from "react";

const ASCII_CHARS = "@#SX/:].".split("").reverse();

export default function App() {
  const [ascii, setAscii] = useState("");
  const [copied, setCopied] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => convertToAscii(img);
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const convertToAscii = (img) => {
    const width = 75;
    const scale = 0.55;
    const height = Math.floor(img.height * (width / img.width) * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, width, height);

    const imageData = ctx.getImageData(0, 0, width, height).data;

    let asciiStr = "";
    for (let y = 0; y < height; y++) {
      let row = "";
      for (let x = 0; x < width; x++) {
        const offset = (y * width + x) * 4;
        const r = imageData[offset];
        const g = imageData[offset + 1];
        const b = imageData[offset + 2];

        const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
        const charIndex = Math.floor(
          (brightness / 255) * (ASCII_CHARS.length - 1)
        );
        row += ASCII_CHARS[charIndex];
      }
      asciiStr += row + "\n";
    }

    setAscii(asciiStr);
    setCopied(false);
  };

  const downloadTxt = () => {
    const blob = new Blob([ascii], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "ascii-art.txt";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(ascii);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Failed to copy.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-cyan-900 via-purple-900 to-black text-white font-sans p-4">
      <h1 className="text-4xl font-extrabold mb-6 text-center drop-shadow-lg">
        🖼️ Image to ASCII Art
      </h1>

      <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-6rem)]">
        {/* Left panel */}
        <div className="w-full md:w-1/3 flex flex-col items-center justify-start gap-6 bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-xl">
          <label
            htmlFor="fileInput"
            className="cursor-pointer w-full text-center bg-white/20 border border-white/30 rounded-xl px-6 py-3
            hover:bg-white/40 transition duration-300 font-semibold"
          >
            Upload Image
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>

          
        </div>

        {/* Right panel - ASCII display */}
        <div className="flex justify-center items-center w-full md:w-2/3">
          {ascii ? (
            <div>
            <pre className="w-full h-full overflow-auto font-mono text-[13px] leading-[13px] p-6 rounded-2xl bg-white/10 border border-purple-500/30 shadow-xl backdrop-blur-md text-white whitespace-pre">
              {ascii}
            </pre>
            <div className="flex gap-4 w-full pt-2">
            <button
              onClick={downloadTxt}
              className="bg-cyan-200 hover:bg-cyan-600 text-black font-semibold py-2 px-4 rounded-lg shadow-lg transition duration-300"
            >
              Download TXT
            </button>

            <button
              onClick={copyToClipboard}
              className={`font-semibold py-2 px-4 rounded-lg shadow-lg transition duration-300 ${
                copied
                  ? "bg-green-400 text-black shadow-green-400/80"
                  : "bg-cyan-200 hover:bg-cyan-600 text-black"
              }`}
            >
              {copied ? "Copied!" : "Copy to Clipboard"}
            </button>
          </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-white/60 text-sm italic">
              Upload an image to generate ASCII art
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
