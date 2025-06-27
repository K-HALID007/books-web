class DefaultCoverGenerator {
  /**
   * Generate a default cover image with book title and author
   * @param {string} title - Book title
   * @param {string} author - Book author
   * @returns {string} - Base64 encoded SVG
   */
  generateDefaultCover(title, author) {
    return this.generateSimpleCover(title, author);
  }

  /**
   * Generate a simple text-based cover using SVG
   * @param {string} title - Book title
   * @param {string} author - Book author
   * @returns {string} - SVG as base64
   */
  generateSimpleCover(title, author) {
    // Escape XML characters
    const escapeXml = (str) => {
      return str.replace(/[<>&'"]/g, (c) => {
        switch (c) {
          case '<': return '&lt;';
          case '>': return '&gt;';
          case '&': return '&amp;';
          case "'": return '&apos;';
          case '"': return '&quot;';
          default: return c;
        }
      });
    };

    const safeTitle = escapeXml(title);
    const safeAuthor = escapeXml(author);

    // Break title into lines if too long
    const titleWords = safeTitle.split(' ');
    const titleLines = [];
    let currentLine = '';
    
    titleWords.forEach(word => {
      if ((currentLine + ' ' + word).length <= 25) {
        currentLine = currentLine ? currentLine + ' ' + word : word;
      } else {
        if (currentLine) titleLines.push(currentLine);
        currentLine = word;
      }
    });
    if (currentLine) titleLines.push(currentLine);

    // Generate title text elements
    const titleElements = titleLines.map((line, index) => {
      const y = 150 + (index * 40);
      return `<text x="200" y="${y}" font-family="Arial, sans-serif" font-size="28" font-weight="bold" 
              fill="white" text-anchor="middle" dominant-baseline="middle">${line}</text>`;
    }).join('\n        ');

    const svg = `
      <svg width="400" height="600" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#6D4C41;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#8D6E63;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#5D4037;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="400" height="600" fill="url(#grad1)" />
        <rect x="10" y="10" width="380" height="580" fill="none" stroke="#FFD180" stroke-width="4"/>
        
        ${titleElements}
        
        <text x="200" y="420" font-family="Arial, sans-serif" font-size="20" 
              fill="#FFD180" text-anchor="middle" dominant-baseline="middle">
          by ${safeAuthor.length > 30 ? safeAuthor.substring(0, 30) + '...' : safeAuthor}
        </text>
        
        <text x="200" y="510" font-family="Arial, sans-serif" font-size="16" font-weight="bold"
              fill="white" text-anchor="middle" dominant-baseline="middle">
          PDF BOOK
        </text>
        
        <!-- Decorative elements -->
        <circle cx="200" cy="480" r="3" fill="#FFD180" opacity="0.7"/>
        <circle cx="180" cy="480" r="2" fill="#FFD180" opacity="0.5"/>
        <circle cx="220" cy="480" r="2" fill="#FFD180" opacity="0.5"/>
      </svg>
    `;
    
    return Buffer.from(svg).toString('base64');
  }
}

export default new DefaultCoverGenerator();