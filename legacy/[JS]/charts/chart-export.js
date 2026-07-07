// Chart export utilities
function exportChartToImage(canvas, filename = 'chart.png', type = 'image/png') {
  // Create a temporary link element
  const link = document.createElement('a');
  
  // Get the image data URL from the canvas
  const imageDataURL = canvas.toDataURL(type);
  
  // Set the link's href to the image data URL
  link.href = imageDataURL;
  
  // Set the download attribute with the filename
  link.download = filename;
  
  // Programmatically click the link to trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the data URL
  URL.revokeObjectURL(imageDataURL);
}

function exportChartToPDF(canvas, filename = 'chart.pdf') {
  // Use jsPDF library for PDF export (if available)
  if (typeof jsPDF !== 'undefined') {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    
    // Calculate dimensions to fit in PDF
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    // If image is taller than page, add additional pages
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    pdf.save(filename);
  } else {
    console.error('jsPDF library not found. Please include it in your project.');
  }
}

function exportChartToSVG(container, filename = 'chart.svg') {
  // Get the chart as a canvas element
  const canvas = container.querySelector('canvas');
  if (!canvas) {
    console.error('No canvas found in the chart container');
    return;
  }
  
  // Convert canvas to SVG (simplified approach)
  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">
      <image href="${canvas.toDataURL('image/png')}" width="${canvas.width}" height="${canvas.height}" />
    </svg>
  `;
  
  // Create blob from SVG content
  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  
  // Create a link to download the SVG
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the object URL
  URL.revokeObjectURL(url);
}

function exportChartData(data, filename = 'chart-data.json', format = 'json') {
  let content = '';
  let mimeType = '';
  let downloadName = filename;
  
  if (format === 'json') {
    content = JSON.stringify(data, null, 2);
    mimeType = 'application/json';
    downloadName = downloadName.endsWith('.json') ? downloadName : downloadName + '.json';
  } else if (format === 'csv') {
    // Convert data to CSV format (simplified for basic array of objects)
    if (Array.isArray(data) && data.length > 0) {
      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => row[header]).join(','))
      ].join('\n');
      
      content = csvContent;
      mimeType = 'text/csv';
      downloadName = downloadName.endsWith('.csv') ? downloadName : downloadName + '.csv';
    } else {
      console.error('CSV export requires an array of objects');
      return;
    }
  } else {
    console.error('Unsupported export format:', format);
    return;
  }
  
  // Create a Blob and download it
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = downloadName;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the object URL
  URL.revokeObjectURL(url);
}

function exportChart(container, options = {}) {
  const {
    filename = 'chart',
    type = 'png', // png, pdf, svg, data
    data = null, // Chart data to export if type is 'data'
    canvas = container.querySelector('canvas') // Use the canvas from container if not provided
  } = options;
  
  switch (type) {
    case 'png':
      if (canvas) {
        exportChartToImage(canvas, `${filename}.png`);
      } else {
        console.error('No canvas found for PNG export');
      }
      break;
      
    case 'pdf':
      if (canvas) {
        exportChartToPDF(canvas, `${filename}.pdf`);
      } else {
        console.error('No canvas found for PDF export');
      }
      break;
      
    case 'svg':
      exportChartToSVG(container, `${filename}.svg`);
      break;
      
    case 'data':
      if (data) {
        exportChartData(data, `${filename}-data.json`, 'json');
      } else {
        console.error('Chart data required for data export');
      }
      break;
      
    default:
      console.error('Unsupported export type:', type);
  }
}

// Export the functions
export { exportChartToImage, exportChartToPDF, exportChartToSVG, exportChartData, exportChart };