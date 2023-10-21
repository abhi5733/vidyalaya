import React, { useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { pdfjs } from 'react-pdf';
import {jsPDF} from 'jspdf';
import './App.css';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

function App() {
  const [selectedPages, setSelectedPages] = useState([]);
  const [pdf, setPdf] = useState(null);
  const createdPdfRef = useRef(null);

  function uploadPDF() {
    const fileInput = document.getElementById('pdfFile');
    const file = fileInput.files[0];

    if (file) {
      if (file.type === 'application/pdf') {
        const reader = new FileReader();
        reader.onload = function (e) {
          const data = new Uint8Array(e.target.result);
          pdfjsLib.getDocument(data).promise.then(function (pdfDoc) {
            setPdf(pdfDoc);
            // Clear selected pages when a new PDF is uploaded
            setSelectedPages([]);
            // Render pages immediately after the PDF is loaded
            renderPages(pdfDoc);
          });
        };
        reader.readAsArrayBuffer(file);
      } else {
        alert('Please select a valid PDF file.');
      }
    } else {
      alert('Please select a PDF file.');
    }
  }

  function handlePageCheckboxChange(pageNum) {
    // Toggle the selected state for the page
    setSelectedPages((prevSelectedPages) => {
      if (prevSelectedPages.includes(pageNum)) {
        // If page is already selected, remove it
        return prevSelectedPages.filter((page) => page !== pageNum);
      } else {
        // If page is not selected, add it
        return [...prevSelectedPages, pageNum];
      }
    });
  }

  function extractSelectedPages() {
    // Implement your logic to extract selected pages here
    console.log('Selected Pages:', selectedPages);
  }




// ... other imports and component code ...

async function createNewPDF() {
  if (!pdf) {
    alert('Please upload a PDF first.');
    return;
  }

  const selectedPagesArray = Array.from(selectedPages);
  const newPdf = new jsPDF();

  for (let i = 0; i < selectedPagesArray.length; i++) {
    const pageNum = selectedPagesArray[i];
    const page = await pdf.getPage(pageNum);

    // Get the viewport
    const viewport = page.getViewport({ scale: 1 });

    // Create a canvas to render the page
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const context = canvas.getContext('2d');

    // Render the page on the canvas
    await page.render({ canvasContext: context, viewport: viewport }).promise;

    // Add the rendered page to the new PDF
    if (i > 0) {
      newPdf.addPage();
    }
    newPdf.addImage(canvas.toDataURL('image/jpeg', 1.0), 'JPEG', 0, 0, viewport.width, viewport.height);
  }

  // Save the new PDF to createdPdfRef
  createdPdfRef.current = newPdf.output('bloburl');
  alert('New PDF created!');

  // Scroll to the download link
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: 'smooth',
  });
}

  // async function createNewPDF() {
  //   if (!pdf) {
  //     alert('Please upload a PDF first.');
  //     return;
  //   }
  
  //   const selectedPagesArray = Array.from(selectedPages);
  //   const newPages = [];
  
  //   for (let i = 0; i < selectedPagesArray.length; i++) {
  //     const pageNum = selectedPagesArray[i];
  //     const page = await pdf.getPage(pageNum);
  //     const viewport = page.getViewport({ scale: 1 });
  //     const canvas = document.createElement('canvas');
  //     const context = canvas.getContext('2d');
  
  //     canvas.width = viewport.width;
  //     canvas.height = viewport.height;
  
  //     const renderContext = {
  //       canvasContext: context,
  //       viewport: viewport,
  //     };
  
  //     await page.render(renderContext).promise;
  //     newPages.push(canvas.toDataURL('image/png')); // Convert each page to a data URL
  //   }
  
  //   // Combine data URLs into a single PDF
  //   const combinedPDF = newPages.map((dataURL) => {
  //     const byteString = atob(dataURL.split(',')[1]);
  //     const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
  //     const ab = new ArrayBuffer(byteString.length);
  //     const ia = new Uint8Array(ab);
  
  //     for (let i = 0; i < byteString.length; i++) {
  //       ia[i] = byteString.charCodeAt(i);
  //     }
  
  //     return new Blob([ab], { type: mimeString });
  //   });
  
  //   const blob = new Blob(combinedPDF, { type: 'application/pdf' });
  //   const url = URL.createObjectURL(blob);
  
  //   // Display the new PDF or offer a download link
  //   createdPdfRef.current = url;
  //   alert('New PDF created!');
  // console.log( createdPdfRef)
  //   // Scroll to the download link
  //   window.scrollTo({
  //     top: document.body.scrollHeight,
  //     behavior: 'smooth',
  //   });
  // }
  
  

  // async function downloadNewPDF() {
  //   if (!createdPdfRef.current) {
  //     alert('Please create a new PDF first.');
  //     return;
  //   }

  //   const blob = await createdPdfRef.current.save();

  //   const link = document.createElement('a');
  //   link.href = URL.createObjectURL(blob);
  //   link.download = 'new_pdf.pdf';
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // }

  async function downloadNewPDF() {
    if (!createdPdfRef.current) {
      alert('Please create a new PDF first.');
      return;
    }
  
    const link = document.createElement('a');
    link.href = createdPdfRef.current;
    link.download = 'new_pdf.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  


  function renderPages(pdfDoc) {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = ''; // Clear previous content

    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      const canvas = document.createElement('canvas');
      canvas.classList.add('page');
      gallery.appendChild(canvas);

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = selectedPages.includes(pageNum);
      checkbox.addEventListener('change', () => handlePageCheckboxChange(pageNum));
      gallery.appendChild(checkbox);

      pdfDoc.getPage(pageNum).then(function (page) {
        const viewport = page.getViewport({ scale: 0.5 });
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        page.render(renderContext);
      });
    }
  }

  return (
    <>
      <form id="pdfForm" encType="multipart/form-data">
        <input type="file" id="pdfFile" accept=".pdf" required />
        <button type="button" onClick={uploadPDF}>
          Upload
        </button>
      </form>

      <div id="gallery"></div>

      <div>
        <button type="button" onClick={extractSelectedPages}>
          Extract Selected Pages
        </button>
        <button type="button" onClick={createNewPDF}>
          Create PDF from Selected Pages
        </button>
      </div>

      <div>
        <a href="#" onClick={downloadNewPDF}>
          Download New PDF
        </a>
      </div>
    </>
  );
}

export default App;
