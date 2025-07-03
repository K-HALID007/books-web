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
  
  // Public domain indicators (old books, classics) - more specific
  const publicDomainKeywords = [
    'gutenberg', 'public domain', 'copyright expired', 'project gutenberg',
    'archive.org', 'internet archive', 'open library', 'free ebook'
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
  
  // Check publication year for public domain (pre-1923) - more strict
  const currentYear = new Date().getFullYear();
  const yearMatches = (extractedText + ' ' + title).match(/\b(18\d{2}|19[0-2]\d)\b/g) || [];
  const oldestYear = yearMatches.length > 0 ? Math.min(...yearMatches.map(y => parseInt(y))) : null;
  const isOldBook = oldestYear && oldestYear < 1923;
  
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
  
  // Check for public domain indicators - require explicit indicators
  const isPublicDomain = publicDomainKeywords.some(keyword => allText.includes(keyword)) ||
                        /gutenberg|public.*domain|copyright.*expired|archive\.org|internet.*archive/i.test(allText) ||
                        (isOldBook && /classic|vintage|historical|ancient/i.test(allText));
  
  // Decision logic (in order of priority)
  if (hasResearchFormat) {
    return 'research';
  } else if (hasEducationalContent) {
    return 'educational';
  } else if (isSelfPublished) {
    return 'self-published';
  } else if (isPublicDomain) {
    return 'public-domain';
  } else {
    // Better default logic - check if it looks like educational material
    if (/textbook|manual|guide|tutorial|course|lesson|chapter|exercise/i.test(allText)) {
      return 'educational';
    }
    // Check if it looks like self-published work
    else if (/novel|story|memoir|autobiography|personal|journey|experience/i.test(allText)) {
      return 'self-published';
    }
    // Default to personal for everything else
    else {
      return 'personal';
    }
  }
}

// Function to generate auto description from available metadata
function generateAutoDescription(title, author, subject, keywords, extractedText) {
  let description = '';
  const cleanAuthor = author !== 'Unknown Author' ? author : '';
  const genre = inferGenreFromText(extractedText + ' ' + keywords + ' ' + subject);
  
  // Start with a compelling opening paragraph
  if (title && cleanAuthor) {
    description = `"${title}" by ${cleanAuthor} is a captivating work that offers readers an immersive experience into its subject matter.`;
  } else if (title) {
    description = `"${title}" is an engaging publication that provides valuable insights and knowledge to its readers.`;
  } else {
    description = `This thoughtfully crafted work presents a comprehensive exploration of its subject matter.`;
  }
  
  // Add genre-specific content in second paragraph
  if (genre && genre !== 'Unknown') {
    description += `\n\nAs a ${genre.toLowerCase()} work, this book delivers content that is both informative and engaging. `;
    
    // Genre-specific descriptions
    switch (genre.toLowerCase()) {
      case 'fiction':
        description += `The narrative weaves together compelling characters and storylines that will keep readers engaged from beginning to end.`;
        break;
      case 'non-fiction':
        description += `The author presents factual information in an accessible and well-researched manner, making complex topics understandable for readers.`;
        break;
      case 'biography':
        description += `This biographical work provides intimate insights into the life and experiences of its subject, offering readers a deeper understanding of their journey.`;
        break;
      case 'history':
        description += `The historical content is meticulously researched and presented in a way that brings past events to life for modern readers.`;
        break;
      case 'self-help':
        description += `Practical advice and actionable strategies are presented to help readers improve their lives and achieve their goals.`;
        break;
      case 'business':
        description += `Professional insights and strategic thinking are combined to provide valuable guidance for business professionals and entrepreneurs.`;
        break;
      case 'technology':
        description += `Technical concepts are explained clearly, making this resource valuable for both beginners and experienced practitioners in the field.`;
        break;
      case 'science':
        description += `Scientific principles and discoveries are presented in an accessible format that educates and inspires curiosity about the natural world.`;
        break;
      default:
        description += `The content is carefully structured to provide maximum value and understanding for readers interested in this field.`;
    }
  } else {
    description += `\n\nThis work is carefully structured to provide comprehensive coverage of its topic, ensuring readers gain valuable knowledge and insights.`;
  }
  
  // Add subject-based content if available
  if (subject && subject.trim() && subject.length > 10 && !description.toLowerCase().includes(subject.toLowerCase().substring(0, 20))) {
    description += `\n\nThe book focuses on ${subject.toLowerCase()}, providing detailed analysis and thoughtful commentary on this important subject.`;
  }
  
  // Add keywords-based content
  if (keywords && keywords.trim()) {
    const cleanKeywords = keywords.split(',')
      .map(k => k.trim())
      .filter(k => k.length > 2 && k.length < 25)
      .slice(0, 5);
    
    if (cleanKeywords.length > 0) {
      const keywordList = cleanKeywords.slice(0, -1).join(', ') + 
        (cleanKeywords.length > 1 ? ', and ' + cleanKeywords[cleanKeywords.length - 1] : cleanKeywords[0]);
      description += `\n\nKey topics covered include ${keywordList}, making this a comprehensive resource for anyone seeking to deepen their understanding of these areas.`;
    }
  }
  
  // Add a compelling conclusion paragraph
  if (cleanAuthor) {
    description += `\n\n${cleanAuthor}'s expertise and clear writing style make this book accessible to both newcomers and those already familiar with the subject. `;
  } else {
    description += `\n\nThe author's expertise and clear presentation make this book accessible to both newcomers and those already familiar with the subject. `;
  }
  
  // Add final value proposition
  description += `Whether you're looking to expand your knowledge, gain new perspectives, or simply enjoy a well-crafted piece of writing, this book offers something valuable for every reader. The thoughtful organization and engaging content ensure that readers will find both immediate insights and lasting value in these pages.`;
  
  // Clean up and format
  description = description
    .replace(/\s+/g, ' ')
    .replace(/\n\n/g, '\n\n')
    .trim();
  
  // Ensure proper length (aim for 800-1200 characters for good paragraph length)
  if (description.length > 1200) {
    // Find the last complete sentence before 1200 characters
    const truncated = description.substring(0, 1200);
    const lastSentence = truncated.lastIndexOf('.');
    if (lastSentence > 800) {
      description = description.substring(0, lastSentence + 1);
    } else {
      description = truncated + '...';
    }
  }
  
  // Ensure it ends with proper punctuation
  if (description && !description.match(/[.!?]$/)) {
    description += '.';
  }
  
  return description;
}

// Enhanced function to clean book title and remove website names, download sources, etc.
function cleanBookTitle(rawTitle) {
  if (!rawTitle) return '';
  
  let cleanedTitle = rawTitle;
  
  // Remove common website domains and download platforms
  const websitePatterns = [
    // General domains - more comprehensive
    /www\.[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,
    /[a-zA-Z0-9.-]+\.(com|org|net|edu|gov|io|co|uk|de|fr|in|ru|ca|au|jp|cn|br|mx|es|it|nl|se|no|dk|fi|pl|cz|hu|ro|bg|hr|si|sk|ee|lv|lt|gr|pt|ie|be|lu|at|ch|li|mc|sm|va|ad|mt|cy|is|fo|gl|gg|je|im|gi|fk|sh|ac|tc|vg|ai|ag|bb|bs|bz|dm|gd|gy|ht|jm|kn|lc|ms|sr|tt|vc|vi|pr|do|cu|ni|cr|pa|gt|hn|sv|mx|bz|info|biz|name|pro|museum|aero|coop|travel|jobs|mobi|tel|asia|cat|post|xxx|tk|ml|ga|cf)/gi,
    
    // Specific book/download platforms - greatly expanded
    /z-?library?/gi,
    /zlibrary/gi,
    /z-lib/gi,
    /libgen/gi,
    /library\s*genesis/gi,
    /lib\s*gen/gi,
    /sci-?hub/gi,
    /scihub/gi,
    /academia\.edu/gi,
    /researchgate/gi,
    /scribd/gi,
    /slideshare/gi,
    /issuu/gi,
    /archive\.org/gi,
    /internet\s*archive/gi,
    /gutenberg/gi,
    /project\s*gutenberg/gi,
    /google\s*books/gi,
    /googlebooks/gi,
    /amazon/gi,
    /kindle/gi,
    /kobo/gi,
    /barnes\s*noble/gi,
    /goodreads/gi,
    /bookzz/gi,
    /bookfi/gi,
    /b-ok/gi,
    /b-ok\.org/gi,
    /pdfdrive/gi,
    /pdf\s*drive/gi,
    /pdfroom/gi,
    /pdf\s*room/gi,
    /freebookspot/gi,
    /free\s*book\s*spot/gi,
    /ebook3000/gi,
    /ebookee/gi,
    /bookboon/gi,
    /openlibrary/gi,
    /open\s*library/gi,
    /hathitrust/gi,
    /jstor/gi,
    /springer/gi,
    /elsevier/gi,
    /wiley/gi,
    /ieee/gi,
    /acm/gi,
    /arxiv/gi,
    /pubmed/gi,
    /ncbi/gi,
    /doaj/gi,
    /plos/gi,
    /nature/gi,
    /science/gi,
    /cell/gi,
    /lancet/gi,
    /nejm/gi,
    /bmj/gi,
    /jama/gi,
    /booksc/gi,
    /bookzz/gi,
    /bookfi/gi,
    /bookre/gi,
    /bookza/gi,
    /bookos/gi,
    /bookdl/gi,
    /epdf/gi,
    /pdfcoffee/gi,
    /pdf\s*coffee/gi,
    /studocu/gi,
    /coursehero/gi,
    /course\s*hero/gi,
    /chegg/gi,
    /bartleby/gi,
    /quizlet/gi,
    /studylib/gi,
    /study\s*lib/gi,
    /docplayer/gi,
    /doc\s*player/gi,
    /vdocuments/gi,
    /v\s*documents/gi,
    /documents\.tips/gi,
    /documents\s*tips/gi,
    /fdocuments/gi,
    /f\s*documents/gi,
    /idocpub/gi,
    /i\s*doc\s*pub/gi,
    /kupdf/gi,
    /ku\s*pdf/gi,
    /doku\.pub/gi,
    /doku\s*pub/gi,
    /anyflip/gi,
    /any\s*flip/gi,
    /fliphtml5/gi,
    /flip\s*html/gi,
    /calameo/gi,
    /yumpu/gi,
    /readkong/gi,
    /read\s*kong/gi,
    /pdfslide/gi,
    /pdf\s*slide/gi,
    /slideshare/gi,
    /slide\s*share/gi,
    /academia/gi,
    /researchgate/gi,
    /research\s*gate/gi,
    /mendeley/gi,
    /zotero/gi,
    /citeulike/gi,
    /cite\s*u\s*like/gi,
    /bibsonomy/gi,
    /connotea/gi,
    /delicious/gi,
    /diigo/gi,
    /stumbleupon/gi,
    /reddit/gi,
    /pinterest/gi,
    /facebook/gi,
    /twitter/gi,
    /linkedin/gi,
    /telegram/gi,
    /whatsapp/gi,
    /discord/gi,
    /slack/gi,
    /teams/gi,
    /zoom/gi,
    /skype/gi,
    /viber/gi,
    /wechat/gi,
    /line/gi,
    /kik/gi,
    /snapchat/gi,
    /instagram/gi,
    /tiktok/gi,
    /youtube/gi,
    /vimeo/gi,
    /dailymotion/gi,
    /twitch/gi,
    /mixer/gi,
    /periscope/gi,
    /live/gi,
    /stream/gi,
    /broadcast/gi,
    /webcast/gi,
    /podcast/gi,
    /radio/gi,
    /music/gi,
    /spotify/gi,
    /apple\s*music/gi,
    /soundcloud/gi,
    /bandcamp/gi,
    /last\.fm/gi,
    /pandora/gi,
    /deezer/gi,
    /tidal/gi,
    /qobuz/gi,
    /napster/gi,
    /rhapsody/gi,
    /grooveshark/gi,
    /limewire/gi,
    /kazaa/gi,
    /bearshare/gi,
    /morpheus/gi,
    /emule/gi,
    /bittorrent/gi,
    /utorrent/gi,
    /vuze/gi,
    /azureus/gi,
    /deluge/gi,
    /transmission/gi,
    /qbittorrent/gi,
    /rtorrent/gi,
    /ktorrent/gi,
    /bitcomet/gi,
    /bitlord/gi,
    /frostwire/gi,
    /ares/gi,
    /shareaza/gi,
    /dc\+\+/gi,
    /soulseek/gi,
    /gnutella/gi,
    /fasttrack/gi,
    /edonkey/gi,
    /overnet/gi,
    /kad/gi,
    /freenet/gi,
    /i2p/gi,
    /tor/gi,
    /onion/gi,
    /darknet/gi,
    /deepweb/gi,
    /piratebay/gi,
    /pirate\s*bay/gi,
    /kickass/gi,
    /kick\s*ass/gi,
    /extratorrent/gi,
    /extra\s*torrent/gi,
    /torrentz/gi,
    /isohunt/gi,
    /iso\s*hunt/gi,
    /demonoid/gi,
    /mininova/gi,
    /btjunkie/gi,
    /bt\s*junkie/gi,
    /torrentspy/gi,
    /torrent\s*spy/gi,
    /suprnova/gi,
    /bitme/gi,
    /bit\s*me/gi,
    /oink/gi,
    /what\.cd/gi,
    /waffles/gi,
    /passthepopcorn/gi,
    /pass\s*the\s*popcorn/gi,
    /broadcastthenet/gi,
    /broadcast\s*the\s*net/gi,
    /bibliotik/gi,
    /myanonamouse/gi,
    /my\s*anona\s*mouse/gi,
    /redacted/gi,
    /orpheus/gi,
    /apollo/gi,
    /gazelle/gi,
    /empornium/gi,
    /pornbay/gi,
    /porn\s*bay/gi,
    /cheggbot/gi,
    /chegg\s*bot/gi,
    /courseherobot/gi,
    /course\s*hero\s*bot/gi,
    /studocubot/gi,
    /studocu\s*bot/gi,
    /scribdbot/gi,
    /scribd\s*bot/gi,
    /libgenbot/gi,
    /libgen\s*bot/gi,
    /scihubbot/gi,
    /scihub\s*bot/gi,
    /zlibrarybot/gi,
    /zlibrary\s*bot/gi,
    /telegrambot/gi,
    /telegram\s*bot/gi,
    /discordbot/gi,
    /discord\s*bot/gi,
    /redditbot/gi,
    /reddit\s*bot/gi,
    /twitterbot/gi,
    /twitter\s*bot/gi,
    /facebookbot/gi,
    /facebook\s*bot/gi,
    /instagrambot/gi,
    /instagram\s*bot/gi,
    /youtubebot/gi,
    /youtube\s*bot/gi,
    /tiktokbot/gi,
    /tiktok\s*bot/gi,
    /snapchatbot/gi,
    /snapchat\s*bot/gi,
    /whatsappbot/gi,
    /whatsapp\s*bot/gi,
    /viberbot/gi,
    /viber\s*bot/gi,
    /wechatbot/gi,
    /wechat\s*bot/gi,
    /linebot/gi,
    /line\s*bot/gi,
    /kikbot/gi,
    /kik\s*bot/gi,
    /slackbot/gi,
    /slack\s*bot/gi,
    /teamsbot/gi,
    /teams\s*bot/gi,
    /zoombot/gi,
    /zoom\s*bot/gi,
    /skypebot/gi,
    /skype\s*bot/gi,
  ];
  
  // Remove download-related terms and platform indicators
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
    /free\s*book/gi,
    /torrent/gi,
    /magnet/gi,
    /direct\s*link/gi,
    /mirror/gi,
    /uploaded/gi,
    /rapidshare/gi,
    /mediafire/gi,
    /4shared/gi,
    /dropbox/gi,
    /google\s*drive/gi,
    /mega\.nz/gi,
    /zippyshare/gi,
    /fileshare/gi,
    /filehost/gi,
    /cloud\s*storage/gi,
  ];
  
  // Remove file format indicators
  const formatPatterns = [
    /\.pdf$/gi,
    /\.epub$/gi,
    /\.mobi$/gi,
    /\.azw$/gi,
    /\.txt$/gi,
    /\.doc$/gi,
    /\.docx$/gi,
    /\.rtf$/gi,
    /\[pdf\]/gi,
    /\[epub\]/gi,
    /\[mobi\]/gi,
    /\[ebook\]/gi,
    /\[book\]/gi,
    /\(pdf\)/gi,
    /\(epub\)/gi,
    /\(mobi\)/gi,
    /\(ebook\)/gi,
    /\(book\)/gi,
    /-\s*pdf$/gi,
    /-\s*epub$/gi,
    /-\s*ebook$/gi,
  ];
  
  // Remove common prefixes/suffixes and platform indicators
  const commonPatterns = [
    // Platform-specific patterns
    /^(the\s+)?complete\s+/gi,
    /^(the\s+)?official\s+/gi,
    /^(the\s+)?ultimate\s+/gi,
    /^(the\s+)?definitive\s+/gi,
    /\s*-\s*free\s*$/gi,
    /\s*-\s*pdf\s*$/gi,
    /\s*-\s*ebook\s*$/gi,
    /\s*-\s*book\s*$/gi,
    /\s*-\s*download\s*$/gi,
    /\s*-\s*online\s*$/gi,
    /\s*\|\s*[^|]*$/gi, // Remove everything after last pipe
    /\s*-\s*[^-]*\.(com|org|net|edu|gov|io|co|uk|de|fr|in|ru).*$/gi,
    
    // Remove version/edition indicators that look like platform names
    /\s*-\s*v?\d+(\.\d+)*$/gi, // version numbers
    /\s*-\s*(first|second|third|fourth|fifth|1st|2nd|3rd|4th|5th)\s*edition$/gi,
    /\s*-\s*edition\s*\d*$/gi,
    /\s*-\s*revised$/gi,
    /\s*-\s*updated$/gi,
    /\s*-\s*latest$/gi,
    /\s*-\s*new$/gi,
    
    // Remove quality indicators
    /\s*-\s*hq$/gi,
    /\s*-\s*high\s*quality$/gi,
    /\s*-\s*best\s*quality$/gi,
    /\s*-\s*original$/gi,
    /\s*-\s*clean$/gi,
    /\s*-\s*clear$/gi,
    
    // Remove size indicators
    /\s*-\s*\d+\s*mb$/gi,
    /\s*-\s*\d+\s*gb$/gi,
    /\s*-\s*\d+\s*kb$/gi,
    /\s*-\s*small\s*size$/gi,
    /\s*-\s*compressed$/gi,
    
    // Remove language indicators that might be confused with platforms
    /\s*-\s*english$/gi,
    /\s*-\s*en$/gi,
    /\s*\[english\]$/gi,
    /\s*\(english\)$/gi,
  ];
  
  // Apply all cleaning patterns in order
  [...websitePatterns, ...downloadPatterns, ...formatPatterns, ...commonPatterns].forEach(pattern => {
    cleanedTitle = cleanedTitle.replace(pattern, '');
  });
  
  // Additional aggressive cleaning for embedded website names
  // Remove anything that looks like a website name (word + domain)
  cleanedTitle = cleanedTitle.replace(/\b[a-zA-Z0-9]+\.(com|org|net|edu|gov|io|co|uk|de|fr|in|ru|info|biz)\b/gi, '');
  
  // Remove common patterns that indicate download sources
  cleanedTitle = cleanedTitle.replace(/\b(from|via|by|source|downloaded|obtained|courtesy|thanks|credit)\s+[a-zA-Z0-9.-]+\b/gi, '');
  
  // Remove patterns like "BookName - SiteName" or "BookName | SiteName"
  cleanedTitle = cleanedTitle.replace(/\s*[-|]\s*[a-zA-Z0-9]+\.(com|org|net|edu|gov|io|co|uk|de|fr|in|ru|info|biz).*$/gi, '');
  
  // Remove patterns like "SiteName - BookName" (reverse order)
  cleanedTitle = cleanedTitle.replace(/^[a-zA-Z0-9]+\.(com|org|net|edu|gov|io|co|uk|de|fr|in|ru|info|biz)\s*[-|]\s*/gi, '');
  
  // Remove standalone domain names that might be left
  cleanedTitle = cleanedTitle.replace(/^\s*[a-zA-Z0-9]+\.(com|org|net|edu|gov|io|co|uk|de|fr|in|ru|info|biz)\s*$/gi, '');
  
  // Remove common download indicators that might be missed
  cleanedTitle = cleanedTitle.replace(/\b(download|free|pdf|ebook|book|file|document|doc|text|read|online|digital|electronic)\s*(from|at|on|via)?\s*[a-zA-Z0-9.-]*\b/gi, '');
  
  // Clean up extra spaces, dashes, and special characters
  cleanedTitle = cleanedTitle
    .replace(/[-_]+/g, ' ') // Replace dashes and underscores with spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/^\s*[-|•·,;]\s*/g, '') // Remove leading punctuation
    .replace(/\s*[-|•·,;]\s*$/g, '') // Remove trailing punctuation
    .replace(/^\s*[(\[{]\s*/g, '') // Remove leading brackets
    .replace(/\s*[)\]}]\s*$/g, '') // Remove trailing brackets
    .replace(/^\s*["'`]\s*/g, '') // Remove leading quotes
    .replace(/\s*["'`]\s*$/g, '') // Remove trailing quotes
    .trim();
  
  // Remove standalone numbers or years that might be left over
  cleanedTitle = cleanedTitle.replace(/^\d{4}$/, ''); // Remove standalone years
  cleanedTitle = cleanedTitle.replace(/^v?\d+(\.\d+)*$/, ''); // Remove standalone version numbers
  
  // If title is too short or contains only numbers/special chars, return empty
  if (cleanedTitle.length < 3 || /^[0-9\s\-_.,!@#$%^&*()]+$/.test(cleanedTitle)) {
    return '';
  }
  
  // Remove common book-related suffixes that don't add value
  const bookSuffixes = [
    /\s*-\s*a\s+(novel|story|book|guide|manual|handbook)$/gi,
    /\s*-\s*(novel|story|book|guide|manual|handbook)$/gi,
    /\s*:\s*a\s+(novel|story|book|guide|manual|handbook)$/gi,
    /\s*:\s*(novel|story|book|guide|manual|handbook)$/gi,
  ];
  
  bookSuffixes.forEach(pattern => {
    cleanedTitle = cleanedTitle.replace(pattern, '');
  });
  
  // Final cleanup
  cleanedTitle = cleanedTitle.trim();
  
  // Capitalize first letter of each word (title case)
  cleanedTitle = cleanedTitle.replace(/\b\w+/g, (word) => {
    // Don't capitalize common small words unless they're the first word
    const smallWords = ['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'if', 'in', 'of', 'on', 'or', 'the', 'to', 'up', 'with', 'from'];
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

// Enhanced genre inference based on keywords and content analysis
function inferGenreFromText(text) {
  if (!text || text.trim().length === 0) {
    return 'Non-Fiction'; // Default fallback
  }
  
  const lowerText = text.toLowerCase();
  
  // Expanded genre keywords with more comprehensive coverage
  const genreKeywords = {
    'Fiction': [
      'novel', 'story', 'fiction', 'tale', 'narrative', 'character', 'plot', 'chapter',
      'protagonist', 'adventure', 'thriller', 'drama', 'literary', 'contemporary',
      'classic literature', 'short story', 'novella', 'epic', 'saga'
    ],
    'Non-Fiction': [
      'guide', 'manual', 'handbook', 'reference', 'how to', 'tutorial', 'facts',
      'real', 'true', 'actual', 'documentary', 'report', 'analysis', 'study',
      'research', 'investigation', 'practical', 'informational', 'educational'
    ],
    'Biography': [
      'biography', 'memoir', 'life', 'autobiography', 'personal story', 'life story',
      'born', 'died', 'childhood', 'career', 'achievements', 'legacy', 'portrait',
      'profile', 'remembering', 'tribute', 'personal account'
    ],
    'History': [
      'history', 'historical', 'war', 'ancient', 'medieval', 'century', 'era',
      'civilization', 'empire', 'revolution', 'battle', 'timeline', 'past',
      'heritage', 'tradition', 'chronicle', 'archives', 'historical account'
    ],
    'Science Fiction': [
      'sci-fi', 'science fiction', 'space', 'future', 'alien', 'robot', 'technology',
      'spaceship', 'galaxy', 'planet', 'time travel', 'dystopian', 'utopian',
      'cyberpunk', 'android', 'artificial intelligence', 'futuristic'
    ],
    'Fantasy': [
      'fantasy', 'magic', 'wizard', 'dragon', 'kingdom', 'quest', 'sword',
      'medieval', 'mythical', 'enchanted', 'spell', 'fairy', 'legend',
      'mythology', 'supernatural', 'magical', 'realm', 'epic fantasy'
    ],
    'Mystery': [
      'mystery', 'detective', 'crime', 'murder', 'investigation', 'clue',
      'suspect', 'police', 'solve', 'case', 'thriller', 'suspense',
      'whodunit', 'criminal', 'forensic', 'evidence'
    ],
    'Romance': [
      'romance', 'love', 'relationship', 'heart', 'passion', 'romantic',
      'dating', 'marriage', 'wedding', 'couple', 'affair', 'attraction',
      'intimate', 'emotional', 'love story'
    ],
    'Self-Help': [
      'self-help', 'improvement', 'success', 'motivation', 'personal development',
      'self improvement', 'life coach', 'productivity', 'habits', 'mindset',
      'confidence', 'goals', 'achievement', 'wellness', 'growth'
    ],
    'Business': [
      'business', 'management', 'leadership', 'entrepreneur', 'marketing',
      'finance', 'economics', 'strategy', 'corporate', 'startup',
      'investment', 'sales', 'profit', 'company', 'organization'
    ],
    'Technology': [
      'technology', 'programming', 'computer', 'software', 'digital',
      'coding', 'development', 'tech', 'internet', 'web', 'app',
      'algorithm', 'data', 'system', 'network', 'IT'
    ],
    'Health': [
      'health', 'medical', 'wellness', 'fitness', 'nutrition', 'diet',
      'exercise', 'medicine', 'doctor', 'treatment', 'healing',
      'therapy', 'mental health', 'physical', 'body'
    ],
    'Education': [
      'education', 'learning', 'teaching', 'academic', 'study', 'school',
      'university', 'college', 'student', 'course', 'curriculum',
      'textbook', 'lesson', 'training', 'knowledge'
    ],
    'Philosophy': [
      'philosophy', 'philosophical', 'ethics', 'wisdom', 'thought',
      'meaning', 'existence', 'consciousness', 'morality', 'truth',
      'reality', 'metaphysics', 'logic', 'reasoning'
    ],
    'Poetry': [
      'poetry', 'poems', 'verse', 'rhyme', 'poet', 'poetic', 'stanza',
      'sonnet', 'haiku', 'ballad', 'lyric', 'rhythm', 'meter'
    ],
    'Science': [
      'science', 'scientific', 'research', 'experiment', 'theory',
      'physics', 'chemistry', 'biology', 'mathematics', 'discovery',
      'laboratory', 'hypothesis', 'analysis', 'data'
    ],
    'Art': [
      'art', 'artist', 'painting', 'drawing', 'sculpture', 'design',
      'creative', 'visual', 'gallery', 'museum', 'aesthetic',
      'artistic', 'illustration', 'craft'
    ],
    'Travel': [
      'travel', 'journey', 'trip', 'destination', 'adventure', 'explore',
      'tourism', 'vacation', 'guide', 'culture', 'country', 'city',
      'world', 'places', 'exploration'
    ],
    'Cooking': [
      'cooking', 'recipe', 'food', 'kitchen', 'chef', 'cuisine',
      'culinary', 'baking', 'ingredients', 'meal', 'dish', 'flavor',
      'restaurant', 'cookbook'
    ]
  };
  
  // Score each genre based on keyword matches
  const genreScores = {};
  
  for (const [genre, keywords] of Object.entries(genreKeywords)) {
    let score = 0;
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        // Give higher scores for exact matches and longer keywords
        score += keyword.length > 5 ? 2 : 1;
      }
    }
    if (score > 0) {
      genreScores[genre] = score;
    }
  }
  
  // Find the genre with the highest score
  if (Object.keys(genreScores).length > 0) {
    const bestGenre = Object.keys(genreScores).reduce((a, b) => 
      genreScores[a] > genreScores[b] ? a : b
    );
    return bestGenre;
  }
  
  // Enhanced fallback logic based on common patterns
  if (/\b(guide|manual|how\s+to|tutorial|learn|step|method|technique)\b/i.test(lowerText)) {
    return 'Non-Fiction';
  }
  
  if (/\b(story|novel|character|plot|fiction)\b/i.test(lowerText)) {
    return 'Fiction';
  }
  
  if (/\b(business|management|corporate|company|entrepreneur)\b/i.test(lowerText)) {
    return 'Business';
  }
  
  if (/\b(health|medical|fitness|wellness|nutrition)\b/i.test(lowerText)) {
    return 'Health';
  }
  
  if (/\b(technology|tech|computer|software|programming)\b/i.test(lowerText)) {
    return 'Technology';
  }
  
  if (/\b(education|academic|university|college|study)\b/i.test(lowerText)) {
    return 'Education';
  }
  
  // Default to Non-Fiction as it's the most common category
  return 'Non-Fiction';
}