import { XMLParser } from 'fast-xml-parser';

/**
 * Parses XML product feed and extracts id, title, and description
 * @param {string} xmlContent - Raw XML content
 * @returns {Array} Array of products with {id, title, description}
 */
export function parseXMLFeed(xmlContent) {
  const parser = new XMLParser();

  const result = parser.parse(xmlContent);

  const products = extractProducts(result);

  return products.map(product => ({
    id: extractField(product, 'id'),
    title: extractField(product, 'title'),
    description: extractField(product, 'description'),
  })).filter(p => p.id);
}


function extractProducts(parsedXML) {
  if (parsedXML.rss?.channel?.item) {
    return Array.isArray(parsedXML.rss.channel.item) 
      ? parsedXML.rss.channel.item 
      : [parsedXML.rss.channel.item];
  }
  
  throw new Error('Unable to locate products in XML feed. Please check feed format.');
}

// Extracts field value from product object
function extractField(product, fieldName) {
  // Try direct field name first
  if (product[fieldName]) {
    return String(product[fieldName] || '').trim();
  }

  // Try with g: prefix (Google Shopping Feed)
  const googleField = `g:${fieldName}`;
  if (product[googleField]) {
    return String(product[googleField] || '').trim();
  }

  return '';
}