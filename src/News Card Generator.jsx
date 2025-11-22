import { useState, useEffect } from "react";
import html2canvas from "html2canvas-pro";
// import Evidence from './assets/Evidence.jpeg' // replace with your actual logo path
import "./fonts.css";


export default function NewsCardGenerator() {
  const evidenceLogoUrl = "https://raw.githubusercontent.com/SAN2022/Thiruvarur-Web-Assets/main/Evidence%20Title.png"
  const [evidenceLogo, setEvidenceLogo] = useState(evidenceLogoUrl);
  const [form, setForm] = useState({
    title: "",
    content: "",
    reporter: "",
    image: null,
    date: new Date().toLocaleDateString(),
  });
  const [downloading, setDownloading] = useState(false);

  // Preload and convert remote image to blob URL to avoid CORS issues
  useEffect(() => {
    const loadImage = async () => {
      try {
        const response = await fetch(evidenceLogoUrl, { mode: 'cors' });
        if (response.ok) {
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          setEvidenceLogo(blobUrl);
        }
      } catch (error) {
        console.warn("Failed to preload logo image, using original URL:", error);
        // Keep original URL if fetch fails
      }
    };
    loadImage();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({
      ...form,
      [name]: files ? URL.createObjectURL(files[0]) : value,
    });
  };

  // ✅ New image download function using html-to-image
  const waitForImages = (node) => {
    const images = Array.from(node.querySelectorAll("img"));
    return Promise.all(
      images.map((img) => {
        if (img.complete && img.naturalHeight !== 0) return Promise.resolve();
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error(`Image ${img.src} failed to load`));
          }, 10000); // 10 second timeout
          
          img.addEventListener("load", () => {
            clearTimeout(timeout);
            resolve();
          }, { once: true });
          
          img.addEventListener("error", () => {
            clearTimeout(timeout);
            reject(new Error(`Image ${img.src} failed to load`));
          }, { once: true });
        });
      })
    );
  };


  const downloadImage = async () => {
    const node = document.getElementById("news-card");
    if (!node) {
      alert("News card element not found. Please refresh the page.");
      console.error("news-card element not found");
      return;
    }

    setDownloading(true);

    try {
      // Wait for all images to load
      await waitForImages(node);

      // Wait for fonts to be ready
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      // Add a small delay to ensure everything is rendered
      await new Promise(resolve => setTimeout(resolve, 200));

      // Use html2canvas-pro which supports oklch colors
      // const canvas = await html2canvas(node, {
      //   scale: 2,
      //   useCORS: true,
      //   logging: false,
      //   // backgroundColor: "#ffffff",
      //   backgroundColor: "none",
      //   allowTaint: false,
      // });

      // const canvas = await html2canvas(node, {
      //   width: 1000,
      //   height: 1380,
      //   scale: 1,
      //   useCORS: true,
      //   logging: false,
      //   backgroundColor: "#ffffff", // or "none" if you really need transparency
      //   allowTaint: false,
      // });

      const canvas = await html2canvas(node, {
        width: 1000,
        // Remove fixed height - let it calculate based on content
        scale: 1,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        allowTaint: false,
      });
      
      // Convert canvas to blob for better handling
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error("Failed to create image blob");
        }
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `news-card-${Date.now()}.png`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }, "image/png");
    } catch (error) {
      console.error("Image download failed:", error);
      alert(`Failed to download image: ${error.message}\n\nPossible causes:\n- Cross-origin image restrictions\n- Image not fully loaded\n\nPlease check the browser console for details.`);
    } finally {
      setDownloading(false);
    }
  };


  return (
    <div className="min-h-screen bg-yellow-100 p-10">
      <h1 className="text-3xl font-bold mb-8 text-center">📰 News Card Generator</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        {/* =========================
              FORM SECTION
        ========================== */}
        <div className="bg-white shadow-xl p-6 rounded-2xl">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Create News</h2>
          <div className="space-y-4">
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="w-full p-2 border rounded-lg"
            />

            <input
              type="text"
              name="title"
              placeholder="Enter Title"
              value={form.title}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg"
            />

            <textarea
              name="content"
              placeholder="Enter News Content"
              value={form.content}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg h-28"
            />

            <input
              type="text"
              name="reporter"
              placeholder="Reporter Name"
              value={form.reporter}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg"
            />

            <button
              onClick={downloadImage}
              disabled={downloading}
              className={`w-full mt-4 py-2 rounded-lg transition ${
                downloading
                  ? "bg-blue-400 cursor-not-allowed text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {downloading ? "⏳ Generating Image..." : "📥 Download as Image"}
            </button>
          </div>
        </div>

        {/* =========================
              LIVE PREVIEW SECTION
        ========================== */}
        <div className="shadow-2xl rounded-2xl border relative overflow-hidden">
          <div
            id="news-card"
            className="bg-red-600 font-tamil overflow-hidden flex flex-col"
            // style={{ width: "1000px", height: "1380px" }} 
            style={{ width: "1000px", minHeight: "auto" }}
          >
            {/* Header */}
            {/* h-[1000px] */}
            <div className="bg-red-600 text-white px-6 py-4 flex items-center justify-between ">
              <img
                src={evidenceLogo}
                alt="Evidence News Logo"
                crossOrigin="anonymous"
                className="object-contain"
                // max-h-full 
              />
            </div>

            {/* Body */}
            {/* <div className="flex-1 px-6 pb-6 pt-4 text-center flex flex-col"> */}
            <div className="px-6 pb-6 pt-4 text-center flex flex-col">
              {form.image && (
                <img
                  src={form.image}
                  alt="news"
                  className="w-full h-[360px] object-cover rounded-lg mb-4"
                />
              )}
              <h2 className="text-3xl font-bold mb-2 text-yellow-300">
                {form.title || "இங்கே தலைப்பை எழுதுங்கள்"}
              </h2>
              <div className="flex items-center justify-center py-4">
                <hr className="w-1/2 border-b-4 border-white" />
              </div>
              {/* <p className="text-white leading-relaxed whitespace-pre-line font-latha text-2xl font-semibold flex-1 overflow-hidden">
                {form.content ||
                  "உங்கள் செய்தி உள்ளடக்கத்தை இங்கே பதிவு செய்யவும்..."}
              </p> */}
              <p className="text-white leading-relaxed whitespace-pre-line font-latha text-2xl font-semibold">
                {form.content ||
                  "உங்கள் செய்தி உள்ளடக்கத்தை இங்கே பதிவு செய்யவும்..."}
              </p>
            </div>

            {/* Footer */}
            {/* h-[100px] */}
            <div className="bg-gray-100 px-6 py-4 text-right text-gray-800 font-semibold  flex items-center justify-end">
              Reporter : {form.reporter || "---"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// import { useState } from "react";
// import Evidence from './assets/Evidence.jpeg'
// import html2canvas from "html2canvas";
// import "./fonts.css";

// export default function NewsCardGenerator() {
//   const [form, setForm] = useState({
//     title: "",
//     content: "",
//     reporter: "",
//     image: null,
//     date: new Date().toLocaleDateString(),
//   });

//   const handleChange = (e) => {
//     const { name, value, files } = e.target;
//     setForm({
//       ...form,
//       [name]: files ? URL.createObjectURL(files[0]) : value,
//     });
//   };

//   const downloadImage = async () => {
//   const card = document.getElementById("news-card");
//   if (!card) {
//     alert("News card not found. Make sure #news-card is present and visible.");
//     return;
//   }

//   // Wait for all <img> inside the card to finish loading (or error)
//   const imgs = Array.from(card.querySelectorAll("img"));
//   await Promise.all(
//     imgs.map((img) =>
//       img.complete
//         ? Promise.resolve()
//         : new Promise((res) => {
//             img.addEventListener("load", res, { once: true });
//             img.addEventListener("error", res, { once: true }); // resolve even on error
//           })
//     )
//   );

//   try {
//     const canvas = await html2canvas(card, {
//       useCORS: false,      // try to enable cross-origin images
//       scale: 2,           // higher resolution
//       backgroundColor: null,
//       logging: false,
//     });

//     // Convert to blob and download (works better for large images)
//     canvas.toBlob((blob) => {
//       if (!blob) {
//         alert("Failed to export image.");
//         return;
//       }
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = "news-card.png";
//       document.body.appendChild(a);
//       a.click();
//       a.remove();
//       setTimeout(() => URL.revokeObjectURL(url), 1000);
//     }, "image/png");
//   } catch (err) {
//     console.error("html2canvas error:", err);
//     alert("Failed to generate image. See console for details.");
//   }
// };

//   // const downloadImage = () => {
//   //   const card = document.getElementById("news-card");
//   //   html2canvas(card).then((canvas) => {
//   //     const link = document.createElement("a");
//   //     link.download = "news-card.png";
//   //     link.href = canvas.toDataURL();
//   //     link.click();
//   //   });
//   // };

//   return (
//     <div className="min-h-screen bg-gray-100 p-6 gap-6">
//       <h1 className="text-3xl font-bold mb-6">News Card Generator</h1>

//       {/* Form Section */}
//       <div className="grid grid-cols-1 md:grid-cols-2 p-20 flex items-center justify-center">
//       <div className="bg-white shadow-xl p-6 rounded-2xl mb-10 mr-8">
//         <h2 className="text-xl font-semibold mb-4">Create News</h2>
//         <div className="space-y-4">
//           <input
//             type="file"
//             name="image"
//             accept="image/*"
//             onChange={handleChange}
//             className="w-full p-2 border rounded-lg"
//           />

//           <input
//             type="text"
//             name="title"
//             placeholder="Enter Title"
//             value={form.title}
//             onChange={handleChange}
//             className="w-full p-2 border rounded-lg"
//           />

//           <textarea
//             name="content"
//             placeholder="Enter News Content"
//             value={form.content}
//             onChange={handleChange}
//             className="w-full p-2 border rounded-lg h-28"
//           />

//           <input
//             type="text"
//             name="reporter"
//             placeholder="Reporter Name"
//             value={form.reporter}
//             onChange={handleChange}
//             className="w-full p-2 border rounded-lg"
//           />
//         </div>
//       </div>


//       {/* News Card Preview */}
//       <div className="bg-red-600 font-tamil shadow-2xl rounded-2xl overflow-hidden border" id="news-card">
//         {/* Header */}
//         <div className="bg-red-600 text-white p-4 flex justify-between items-center">
//           {/* <h1 className="text-xl font-bold">Evidence News</h1> */}
//           <img src={Evidence} alt="news" crossOrigin="anonymous"/>
//           <p className="text-sm font-medium">{form.date}</p>
//         </div>

//         {/* Body */}
//         <div className="p-4 text-center">
//           {form.image && (
//             <img
//               src={form.image}
//               alt="news"
//               className="w-full h-64 object-cover rounded-lg mb-4"
//             />
//           )}
//           {/* <h2 className="text-xl font-bold mb-2 text-blue-700">{form.title}</h2> */}
//           <h2 className="text-xl font-bold mb-2 text-blue-100 border border-l-10 p-2">{form.title}</h2>
//           {/* <p className="text-gray-700 leading-relaxed whitespace-pre-line font-latha text-lg"> */}
//           <p className="text-white leading-relaxed whitespace-pre-line font-latha text-lg">
//             {form.content}
//           </p>
//         </div>

//         {/* Footer */}
//         <div className="bg-gray-100 p-3 text-right text-gray-800 font-semibold">
//           Reporter : {form.reporter || "---"}
//         </div>
//       </div>

//     </div>
//       <button onClick={downloadImage} className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg shadow cursor-pointer">Download as Image</button>

//     </div>
//   );
// }
