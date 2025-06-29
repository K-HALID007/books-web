import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const pdfFile = formData.get('pdf');

    if (!pdfFile) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }

    // Convert file to buffer
    const pdfBuffer = await pdfFile.arrayBuffer();
    
    try {
      // Load PDF document for metadata
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      
      // Extract basic metadata
      const title = pdfDoc.getTitle() || '';
      const author = pdfDoc.getAuthor() || '';
      const subject = pdfDoc.getSubject() || '';
      const keywords = pdfDoc.getKeywords() || '';
      const creator = pdfDoc.getCreator() || '';
      const producer = pdfDoc.getProducer() || '';
      const creationDate = pdfDoc.getCreationDate();
      const modificationDate = pdfDoc.getModificationDate();
      
      // Get page count
      const pageCount = pdfDoc.getPageCount();
      
      // Note: Cover generation will be handled on the client side
      // Server-side PDF rendering is complex and resource-intensive
      let coverImageBase64 = null;
      
      // Extract text from first few pages for content analysis
      let extractedText = '';
      try {
        // This is a simplified approach - in production you'd use a proper PDF text extraction library
        // For now, we'll use the filename and metadata
        extractedText = pdfFile.name.replace('.pdf', '').replace(/[-_]/g, ' ');
      } catch (textError) {
        console.log('Text extraction failed, using filename');
        extractedText = pdfFile.name.replace('.pdf', '').replace(/[-_]/g, ' ');
      }

      // Clean up the title to remove website names and download sources
      const cleanTitle = cleanBookTitle(title || extractedText || pdfFile.name.replace('.pdf', ''));
      
      // Clean up the author to remove website names and copyright info
      const cleanAuthor = cleanAuthorName(author);
      
      // Generate auto description
      const autoDescription = generateAutoDescription(cleanTitle, cleanAuthor, subject, keywords, extractedText);
      
      // Generate auto category
      const autoCategory = generateAutoCategory(cleanTitle, author, subject, keywords, extractedText, creator, producer);
      
      // Smart metadata extraction logic
      const extractedMetadata = {
        title: cleanTitle || 'Unknown Title',
        author: cleanAuthor || 'Unknown Author',
        description: autoDescription,
        category: autoCategory,
        pageCount: pageCount.toString(),
        language: 'English', // Default, could be enhanced with language detection
        publishedYear: creationDate ? creationDate.getFullYear().toString() : '',
        genre: inferGenreFromText(extractedText + ' ' + keywords + ' ' + subject),
        keywords: keywords,
        creator: creator,
        producer: producer,
        coverImage: coverImageBase64, // Base64 encoded cover image
        extractedAt: new Date().toISOString()
      };

      return NextResponse.json(extractedMetadata);
      
    } catch (pdfError) {
      console.error('PDF parsing error:', pdfError);
      
      // Fallback extraction using filename
      const fallbackTitle = cleanBookTitle(pdfFile.name.replace('.pdf', ''));
      const fallbackDescription = generateAutoDescription(fallbackTitle, 'Unknown Author', '', '', fallbackTitle);
      const fallbackCategory = generateAutoCategory(fallbackTitle, 'Unknown Author', '', '', fallbackTitle, '', '');
      
      const fallbackMetadata = {
        title: fallbackTitle || 'Unknown Title',
        author: 'Unknown Author',
        description: fallbackDescription,
        category: fallbackCategory,
        pageCount: '',
        language: 'English',
        publishedYear: '',
        genre: 'Unknown',
        keywords: '',
        creator: '',
        producer: '',
        coverImage: null, // No cover in fallback
        extractedAt: new Date().toISOString()
      };
      
      return NextResponse.json(fallbackMetadata);
    }
    
  } catch (error) {
    console.error('Metadata extraction error:', error);
    return NextResponse.json(
      { error: 'Failed to extract metadata' }, 
      { status: 500 }
    );
  }
}

// Function to generate auto category based on content analysis
function generateAutoCategory(title, author, subject, keywords, extractedText, creator, producer) {
  const allText = `${title} ${author} ${subject} ${keywords} ${extractedText} ${creator} ${producer}`.toLowerCase();
  
  // Academic/Educational indicators
  const academicKeywords = [
    'university', 'college', 'academic', 'research', 'study', 'thesis', 'dissertation', 
    'journal', 'paper', 'course', 'curriculum', 'textbook', 'lecture', 'education',
    'learning', 'teaching', 'student', 'professor', 'phd', 'master', 'bachelor'
  ];
  
  // Public domain indicators (old books, classics)
  const publicDomainKeywords = [
    'classic', 'vintage', 'historical', 'ancient', 'old', 'traditional', 'heritage',
    'gutenberg', 'public domain', 'copyright expired', 'free book'
  ];
  
  // Research paper indicators
  const researchKeywords = [
    'abstract', 'methodology', 'analysis', 'findings', 'conclusion', 'bibliography',
    'references', 'citation', 'peer review', 'journal', 'conference', 'proceedings',
    'ieee', 'acm', 'springer', 'elsevier', 'arxiv', 'doi'
  ];
  
  // Self-published indicators
  const selfPublishedKeywords = [
    'self published', 'independently published', 'createspace', 'kindle direct',
    'lulu', 'blurb', 'author house', 'xlibris', 'personal memoir', 'family history'
  ];
  
  // Check publication year for public domain (pre-1923)
  const currentYear = new Date().getFullYear();
  const isOldBook = extractedText.match(/\b(18|19[0-2])\d\b/) || 
                   title.match(/\b(18|19[0-2])\d\b/) ||
                   (currentYear - parseInt(extractedText.match(/\b(19[0-2]\d)\b/)?.[0] || '0')) > 100;
  
  // Check for academic institutions in creator/producer
  const hasAcademicSource = /university|college|edu|academic|institute/i.test(creator + ' ' + producer);
  
  // Check for research paper format
  const hasResearchFormat = researchKeywords.some(keyword => allText.includes(keyword)) ||
                           /abstract|methodology|references|bibliography/i.test(allText);
  
  // Check for educational content
  const hasEducationalContent = academicKeywords.some(keyword => allText.includes(keyword)) ||
                               hasAcademicSource ||
                               /textbook|course|curriculum|learning/i.test(allText);
  
  // Check for self-published indicators
  const isSelfPublished = selfPublishedKeywords.some(keyword => allText.includes(keyword)) ||
                         /memoir|autobiography|family.*story|personal.*journey/i.test(allText);
  
  // Check for public domain indicators
  const isPublicDomain = publicDomainKeywords.some(keyword => allText.includes(keyword)) ||
                        isOldBook ||
                        /gutenberg|public.*domain|copyright.*expired/i.test(allText);
  
  // Decision logic (in order of priority)
  if (hasResearchFormat) {
    return 'research';
  } else if (isPublicDomain) {
    return 'public-domain';
  } else if (hasEducationalContent) {
    return 'educational';
  } else if (isSelfPublished) {
    return 'self-published';
  } else {
    // Default to personal for everything else
    return 'personal';
  }
}

// Function to generate auto description from available metadata
function generateAutoDescription(title, author, subject, keywords, extractedText) {
  let description = '';
  
  // Start with subject if available and clean
  if (subject && subject.trim() && subject.length > 10) {
    description = subject.trim();
  }
  
  // If no good subject, create description from title and author
  if (!description && title && author) {
    const cleanAuthor = author !== 'Unknown Author' ? author : '';
    
    if (cleanAuthor) {
      description = `"${title}" by ${cleanAuthor}`;
    } else {
      description = `"${title}"`;
    }
    
    // Add genre-based description
    const genre = inferGenreFromText(extractedText + ' ' + keywords + ' ' + subject);
    if (genre && genre !== 'Unknown') {
      description += ` - A ${genre.toLowerCase()} book`;
    }
    
    // Add keywords if available
    if (keywords && keywords.trim()) {
      const cleanKeywords = keywords.split(',')
        .map(k => k.trim())
        .filter(k => k.length > 2 && k.length < 20)
        .slice(0, 3)
        .join(', ');
      
      if (cleanKeywords) {
        description += `. Topics include: ${cleanKeywords}`;
      }
    }
    
    // Add page count if available
    if (extractedText && extractedText.includes('page')) {
      description += '. A comprehensive resource for readers interested in this subject.';
    } else {
      description += '. An engaging read for those interested in this topic.';
    }
  }
  
  // Fallback if still no description
  if (!description) {
    description = `This book offers valuable insights and information for readers interested in the subject matter.`;
  }
  
  // Clean up and limit length
  description = description
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 500);
  
  // Ensure it ends with proper punctuation
  if (description && !description.match(/[.!?]$/)) {
    description += '.';
  }
  
  return description;
}

// Function to clean book title and remove website names, download sources, etc.
function cleanBookTitle(rawTitle) {
  if (!rawTitle) return '';
  
  let cleanedTitle = rawTitle;
  
  // Remove common website domains and download sources
  const websitePatterns = [
    /www\.[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,
    /[a-zA-Z0-9.-]+\.com/gi,
    /[a-zA-Z0-9.-]+\.org/gi,
    /[a-zA-Z0-9.-]+\.net/gi,
    /[a-zA-Z0-9.-]+\.edu/gi,
    /[a-zA-Z0-9.-]+\.gov/gi,
    /[a-zA-Z0-9.-]+\.io/gi,
    /[a-zA-Z0-9.-]+\.co/gi,
    /[a-zA-Z0-9.-]+\.uk/gi,
    /[a-zA-Z0-9.-]+\.de/gi,
    /[a-zA-Z0-9.-]+\.fr/gi,
    /[a-zA-Z0-9.-]+\.in/gi,
    /[a-zA-Z0-9.-]+\.ru/gi,
  ];
  
  // Remove download-related terms
  const downloadPatterns = [
    /download/gi,
    /free\s*download/gi,
    /pdf\s*download/gi,
    /ebook\s*download/gi,
    /book\s*download/gi,
    /get\s*free/gi,
    /read\s*online/gi,
    /online\s*reading/gi,
    /free\s*pdf/gi,
    /free\s*ebook/gi,
    /torrent/gi,
    /magnet/gi,
  ];
  
  // Remove file format indicators
  const formatPatterns = [
    /\.pdf$/gi,
    /\.epub$/gi,
    /\.mobi$/gi,
    /\.azw$/gi,
    /\.txt$/gi,
    /\[pdf\]/gi,
    /\[epub\]/gi,
    /\[mobi\]/gi,
    /\(pdf\)/gi,
    /\(epub\)/gi,
    /\(mobi\)/gi,
  ];
  
  // Remove common prefixes/suffixes
  const commonPatterns = [
    /^(the\s+)?complete\s+/gi,
    /^(the\s+)?official\s+/gi,
    /\s*-\s*free\s*$/gi,
    /\s*-\s*pdf\s*$/gi,
    /\s*-\s*ebook\s*$/gi,
    /\s*\|\s*[^|]*$/gi, // Remove everything after last pipe
    /\s*-\s*[^-]*\.(com|org|net|edu|gov|io|co|uk|de|fr|in|ru).*$/gi,
  ];
  
  // Apply all cleaning patterns
  [...websitePatterns, ...downloadPatterns, ...formatPatterns, ...commonPatterns].forEach(pattern => {
    cleanedTitle = cleanedTitle.replace(pattern, '');
  });
  
  // Clean up extra spaces, dashes, and special characters
  cleanedTitle = cleanedTitle
    .replace(/[-_]+/g, ' ') // Replace dashes and underscores with spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/^\s*[-|•·]\s*/g, '') // Remove leading dashes or bullets
    .replace(/\s*[-|•·]\s*$/g, '') // Remove trailing dashes or bullets
    .replace(/^\s*[(\[{]\s*/g, '') // Remove leading brackets
    .replace(/\s*[)\]}]\s*$/g, '') // Remove trailing brackets
    .trim();
  
  // If title is too short or contains only numbers/special chars, return empty
  if (cleanedTitle.length < 3 || /^[0-9\s\-_.,!@#$%^&*()]+$/.test(cleanedTitle)) {
    return '';
  }
  
  // Capitalize first letter of each word (title case)
  cleanedTitle = cleanedTitle.replace(/\b\w+/g, (word) => {
    // Don't capitalize common small words unless they're the first word
    const smallWords = ['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'if', 'in', 'of', 'on', 'or', 'the', 'to', 'up'];
    const isFirstWord = cleanedTitle.indexOf(word) === 0;
    
    if (!isFirstWord && smallWords.includes(word.toLowerCase())) {
      return word.toLowerCase();
    }
    
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
  
  return cleanedTitle;
}

// Function to clean author name and remove website names, copyright info, etc.
function cleanAuthorName(rawAuthor) {
  if (!rawAuthor) return '';
  
  let cleanedAuthor = rawAuthor;
  
  // Remove common website domains
  const websitePatterns = [
    /www\.[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,
    /[a-zA-Z0-9.-]+\.com/gi,
    /[a-zA-Z0-9.-]+\.org/gi,
    /[a-zA-Z0-9.-]+\.net/gi,
    /[a-zA-Z0-9.-]+\.edu/gi,
    /[a-zA-Z0-9.-]+\.gov/gi,
    /[a-zA-Z0-9.-]+\.io/gi,
    /[a-zA-Z0-9.-]+\.co/gi,
    /[a-zA-Z0-9.-]+\.uk/gi,
    /[a-zA-Z0-9.-]+\.de/gi,
    /[a-zA-Z0-9.-]+\.fr/gi,
    /[a-zA-Z0-9.-]+\.in/gi,
    /[a-zA-Z0-9.-]+\.ru/gi,
  ];
  
  // Remove copyright and legal terms
  const copyrightPatterns = [
    /copyright\s*©?\s*\d{4}/gi,
    /©\s*\d{4}/gi,
    /\(c\)\s*\d{4}/gi,
    /all\s*rights\s*reserved/gi,
    /rights\s*reserved/gi,
    /published\s*by/gi,
    /publisher/gi,
    /publishing/gi,
    /press/gi,
    /books/gi,
    /publications/gi,
    /ltd\.?/gi,
    /inc\.?/gi,
    /corp\.?/gi,
    /company/gi,
    /co\.?/gi,
  ];
  
  // Remove download and file-related terms
  const downloadPatterns = [
    /download/gi,
    /free\s*download/gi,
    /pdf\s*download/gi,
    /ebook/gi,
    /e-book/gi,
    /online/gi,
    /digital/gi,
    /version/gi,
  ];
  
  // Remove email addresses
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
  
  // Remove URLs
  const urlPattern = /https?:\/\/[^\s]+/gi;
  
  // Apply all cleaning patterns
  [...websitePatterns, ...copyrightPatterns, ...downloadPatterns].forEach(pattern => {
    cleanedAuthor = cleanedAuthor.replace(pattern, '');
  });
  
  // Remove emails and URLs
  cleanedAuthor = cleanedAuthor.replace(emailPattern, '');
  cleanedAuthor = cleanedAuthor.replace(urlPattern, '');
  
  // Clean up extra spaces, punctuation, and special characters
  cleanedAuthor = cleanedAuthor
    .replace(/[-_]+/g, ' ') // Replace dashes and underscores with spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/^\s*[-|•·,;]\s*/g, '') // Remove leading punctuation
    .replace(/\s*[-|•·,;]\s*$/g, '') // Remove trailing punctuation
    .replace(/^\s*[(\[{]\s*/g, '') // Remove leading brackets
    .replace(/\s*[)\]}]\s*$/g, '') // Remove trailing brackets
    .replace(/\s*[,;]\s*/g, ', ') // Normalize comma/semicolon spacing
    .trim();
  
  // Remove common non-author prefixes/suffixes
  const nonAuthorPatterns = [
    /^(by\s+)?the\s+/gi,
    /^(by\s+)?author\s+/gi,
    /^(by\s+)?written\s+by\s+/gi,
    /^(by\s+)?created\s+by\s+/gi,
    /^(by\s+)?edited\s+by\s+/gi,
    /\s+(editor|author|writer)s?$/gi,
    /\s+et\s+al\.?$/gi,
    /\s+and\s+others$/gi,
  ];
  
  nonAuthorPatterns.forEach(pattern => {
    cleanedAuthor = cleanedAuthor.replace(pattern, '');
  });
  
  // If author contains multiple names separated by commas, take only the first one
  // unless it's clearly a "Last, First" format
  const parts = cleanedAuthor.split(',').map(part => part.trim());
  if (parts.length > 1) {
    // Check if it's "Last, First" format (second part is likely a first name)
    if (parts.length === 2 && parts[1].split(' ').length === 1 && parts[1].length < 20) {
      // Keep "Last, First" format
      cleanedAuthor = `${parts[1]} ${parts[0]}`;
    } else {
      // Take only the first author
      cleanedAuthor = parts[0];
    }
  }
  
  // Final cleanup
  cleanedAuthor = cleanedAuthor.trim();
  
  // If author is too short, contains only numbers/special chars, or looks like a website
  if (cleanedAuthor.length < 2 || 
      /^[0-9\s\-_.,!@#$%^&*()]+$/.test(cleanedAuthor) ||
      /\.(com|org|net|edu|gov|io|co|uk|de|fr|in|ru)/i.test(cleanedAuthor)) {
    return '';
  }
  
  // Capitalize properly (First Last format)
  cleanedAuthor = cleanedAuthor.replace(/\b\w+/g, (word) => {
    // Handle common name prefixes/suffixes
    const prefixes = ['mc', 'mac', 'o\'', 'de', 'la', 'le', 'van', 'von', 'del', 'da', 'di'];
    const suffixes = ['jr', 'sr', 'ii', 'iii', 'iv'];
    
    const lowerWord = word.toLowerCase();
    
    if (prefixes.some(prefix => lowerWord.startsWith(prefix))) {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }
    
    if (suffixes.includes(lowerWord)) {
      return word.toUpperCase();
    }
    
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
  
  return cleanedAuthor;
}

// Simple genre inference based on keywords
function inferGenreFromText(text) {
  const lowerText = text.toLowerCase();
  
  const genreKeywords = {
    'Fiction': ['novel', 'story', 'fiction', 'tale', 'narrative'],
    'Non-Fiction': ['guide', 'manual', 'handbook', 'reference', 'how to', 'tutorial'],
    'Biography': ['biography', 'memoir', 'life', 'autobiography'],
    'History': ['history', 'historical', 'war', 'ancient', 'medieval'],
    'Science Fiction': ['sci-fi', 'science fiction', 'space', 'future', 'alien'],
    'Fantasy': ['fantasy', 'magic', 'wizard', 'dragon', 'kingdom'],
    'Mystery': ['mystery', 'detective', 'crime', 'murder', 'investigation'],
    'Romance': ['romance', 'love', 'relationship', 'heart'],
    'Self-Help': ['self-help', 'improvement', 'success', 'motivation', 'personal development'],
    'Business': ['business', 'management', 'leadership', 'entrepreneur', 'marketing'],
    'Technology': ['technology', 'programming', 'computer', 'software', 'digital'],
    'Health': ['health', 'medical', 'wellness', 'fitness', 'nutrition'],
    'Education': ['education', 'learning', 'teaching', 'academic', 'study'],
    'Philosophy': ['philosophy', 'philosophical', 'ethics', 'wisdom', 'thought'],
    'Poetry': ['poetry', 'poems', 'verse', 'rhyme']
  };
  
  for (const [genre, keywords] of Object.entries(genreKeywords)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      return genre;
    }
  }
  
  return 'Unknown';
}