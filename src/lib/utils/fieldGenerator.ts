/**
 * Generate values based on generation rules
 * 
 * Supports:
 * - (rn[12]) - Random 12 numbers
 * - (rc[6]) - Random 6 letters
 * - FL(rn[12]) - Prefix + random numbers
 * - (rn[6])(rc[6]) - Mixed: numbers + letters
 * - (A[10]) - Duplicate character 10 times
 * - (field_name) - Copy from another field
 * - (field_name[w1]) - Extract first word
 * - (field_name[ch1-4]) - Extract characters 1-4
 */

export function generateValue(generationRule: string, allFields?: Record<string, string | number | boolean>): string {
  let result = '';
  
  // Extract all generation patterns (text)...(text)
  const patterns = generationRule.match(/([^()]+|\([^)]+\))/g) || [];
  
  for (const pattern of patterns) {
    if (pattern.startsWith('(') && pattern.endsWith(')')) {
      // This is a generation pattern
      const content = pattern.slice(1, -1); // Remove parentheses
      result += processGenerationPattern(content, allFields);
    } else {
      // This is static text (prefix/suffix)
      result += pattern;
    }
  }
  
  return result;
}

function processGenerationPattern(pattern: string, allFields?: Record<string, string | number | boolean>): string {
  // Random numbers: rn[12]
  if (pattern.startsWith('rn[') && pattern.endsWith(']')) {
    const count = parseInt(pattern.match(/\d+/)?.[0] || '0');
    return generateRandomNumbers(count);
  }
  
  // Random characters: rc[6]
  if (pattern.startsWith('rc[') && pattern.endsWith(']')) {
    const count = parseInt(pattern.match(/\d+/)?.[0] || '0');
    return generateRandomChars(count);
  }
  
  // Character duplication: A[10]
  const dupMatch = pattern.match(/^(.+)\[(\d+)\]$/);
  if (dupMatch) {
    const char = dupMatch[1];
    const count = parseInt(dupMatch[2]);
    
    // Check if it's a field reference
    if (allFields && allFields[char]) {
      return String(allFields[char]).repeat(count);
    }
    
    // Otherwise duplicate the character
    return char.repeat(count);
  }
  
  // Field reference with extraction: field_name[w1] or field_name[ch1-4]
  if (allFields) {
    return extractFromField(pattern, allFields);
  }
  
  return '';
}

function generateRandomNumbers(count: number): string {
  let result = '';
  for (let i = 0; i < count; i++) {
    result += Math.floor(Math.random() * 10);
  }
  return result;
}

function generateRandomChars(count: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < count; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function extractFromField(pattern: string, allFields: Record<string, string | number | boolean>): string {
  // Check if pattern contains extraction syntax
  const extractMatch = pattern.match(/^(.+)\[(w|ch)(.+)\]$/);
  
  if (extractMatch) {
    const fieldName = extractMatch[1];
    const extractType = extractMatch[2]; // 'w' or 'ch'
    const extractPattern = extractMatch[3]; // '1', '1,2,5', '1-4'
    
    const fieldValue = String(allFields[fieldName] || '');
    
    if (extractType === 'w') {
      // Word extraction
      return extractWord(fieldValue, extractPattern);
    } else if (extractType === 'ch') {
      // Character extraction
      return extractChars(fieldValue, extractPattern);
    }
  }
  
  // Simple field reference (no extraction)
  return String(allFields[pattern] || '');
}

function extractWord(text: string, pattern: string): string {
  const words = text.trim().split(/\s+/);
  const wordIndex = parseInt(pattern) - 1; // Convert to 0-based index
  
  return words[wordIndex] || '';
}

function extractChars(text: string, pattern: string): string {
  // Handle comma-separated: ch1,2,5
  if (pattern.includes(',')) {
    const indices = pattern.split(',').map(i => parseInt(i.trim()) - 1);
    return indices.map(i => text[i] || '').join('');
  }
  
  // Handle range: ch1-4
  if (pattern.includes('-')) {
    const [start, end] = pattern.split('-').map(i => parseInt(i.trim()));
    return text.slice(start - 1, end);
  }
  
  // Handle single character: ch1
  const index = parseInt(pattern) - 1;
  return text[index] || '';
}

/**
 * Apply max generation padding
 * Example: value="123", maxGeneration="(A[10])" → "123AAAAAAA"
 */
export function applyMaxGeneration(value: string, maxGeneration: string): string {
  const pattern = maxGeneration.slice(1, -1); // Remove parentheses
  const match = pattern.match(/^(.+)\[(\d+)\]$/);
  
  if (match) {
    const char = match[1];
    const maxLength = parseInt(match[2]);
    const currentLength = value.length;
    const paddingNeeded = Math.max(0, maxLength - currentLength);
    
    return value + char.repeat(paddingNeeded);
  }
  
  return value;
}

