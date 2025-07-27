const fs = require('fs');
const path = require('path');

// List of new template names that need placeholder images
const newTemplates = [
  'charizard',
  'blastoise', 
  'venusaur',
  'mewtwo',
  'mew',
  'lugia',
  'ho-oh',
  'rayquaza',
  'dialga',
  'palkia',
  'giratina',
  'arceus',
  'reshiram',
  'zekrom',
  'kyurem',
  'xerneas',
  'yveltal',
  'zygarde',
  'solgaleo',
  'lunala',
  'necrozma',
  'zacian',
  'zamazenta',
  'eternatus'
];

// Color schemes for different template types
const colorSchemes = {
  charizard: '#ea580c', // orange
  blastoise: '#0e7490', // cyan
  venusaur: '#65a30d', // lime
  mewtwo: '#6d28d9', // violet
  mew: '#be185d', // pink
  lugia: '#4338ca', // indigo
  'ho-oh': '#be123c', // rose
  rayquaza: '#166534', // green
  dialga: '#1e40af', // blue
  palkia: '#581c87', // purple
  giratina: '#374151', // gray
  arceus: '#92400e', // amber
  reshiram: '#f8fafc', // white
  zekrom: '#0f172a', // black
  kyurem: '#52525b', // zinc
  xerneas: '#166534', // green
  yveltal: '#991b1b', // red
  zygarde: '#166534', // green
  solgaleo: '#a16207', // yellow
  lunala: '#581c87', // purple
  necrozma: '#6d28d9', // violet
  zacian: '#1e40af', // blue
  zamazenta: '#991b1b', // red
  eternatus: '#581c87', // purple
};

// Create SVG placeholder for each template
function createSVGPlaceholder(templateName, color) {
  const width = 400;
  const height = 300;
  
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="${color}" opacity="0.1"/>
  <rect x="20" y="20" width="${width-40}" height="${height-40}" fill="${color}" opacity="0.2" rx="8"/>
  
  <!-- Template name -->
  <text x="${width/2}" y="${height/2 - 20}" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="${color}">
    ${templateName.charAt(0).toUpperCase() + templateName.slice(1)}
  </text>
  
  <!-- Template type -->
  <text x="${width/2}" y="${height/2 + 20}" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="${color}" opacity="0.7">
    Template
  </text>
  
  <!-- Decorative elements -->
  <circle cx="50" cy="50" r="15" fill="${color}" opacity="0.3"/>
  <circle cx="${width-50}" cy="50" r="10" fill="${color}" opacity="0.3"/>
  <circle cx="50" cy="${height-50}" r="12" fill="${color}" opacity="0.3"/>
  <circle cx="${width-50}" cy="${height-50}" r="8" fill="${color}" opacity="0.3"/>
</svg>`;
}

// Convert SVG to base64 (simplified - in real implementation you'd use a proper SVG to image converter)
function svgToBase64(svg) {
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
}

// Create HTML file that can be used to generate images
function createImageGeneratorHTML() {
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>Template Image Generator</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .template { margin: 20px; display: inline-block; }
    canvas { border: 1px solid #ccc; }
  </style>
</head>
<body>
  <h1>Template Image Generator</h1>
  <p>Right-click on each template and "Save image as..." to download the JPG files.</p>
  
  ${newTemplates.map(template => {
    const color = colorSchemes[template];
    const svg = createSVGPlaceholder(template, color);
    return `
    <div class="template">
      <h3>${template}.jpg</h3>
      <canvas id="canvas-${template}" width="400" height="300"></canvas>
      <script>
        (function() {
          const canvas = document.getElementById('canvas-${template}');
          const ctx = canvas.getContext('2d');
          const img = new Image();
          img.onload = function() {
            ctx.drawImage(img, 0, 0);
          };
          img.src = '${svgToBase64(svg)}';
        })();
      </script>
    </div>`;
  }).join('')}
</body>
</html>`;

  fs.writeFileSync('template-image-generator.html', htmlContent);
  console.log('Generated template-image-generator.html');
  console.log('Open this file in a browser to generate the template images');
}

// Create the HTML generator
createImageGeneratorHTML();

console.log('Template image generator created!');
console.log('Open template-image-generator.html in a browser to generate the missing template images.');
console.log('Save each canvas as a JPG file in the public/templates/jpg/ directory.'); 