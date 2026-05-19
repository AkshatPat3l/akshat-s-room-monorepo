class TrieNode {
  children: Map<string, TrieNode> = new Map();
  isEndOfWord: boolean = false;
}

export class ContentModerator {
  private root: TrieNode = new TrieNode();

  constructor(blacklist: string[] = []) {
    for (const term of blacklist) {
      this.insert(term);
    }
  }

  /**
   * Inserts a blacklisted word/phrase into the Trie.
   */
  insert(phrase: string): void {
    const clean = phrase.trim().toLowerCase();
    if (!clean) return;

    let current = this.root;
    for (const char of clean) {
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode());
      }
      current = current.children.get(char)!;
    }
    current.isEndOfWord = true;
  }

  /**
   * Moderates the input text, replacing any blacklisted phrases with "[bobba]".
   * Traverses characters linearly to achieve optimal speed (O(N) latency).
   */
  moderate(text: string): string {
    if (!text) return '';

    let result = '';
    let i = 0;
    const n = text.length;

    while (i < n) {
      let current = this.root;
      let longestMatchLength = -1;
      let j = i;

      // Lookahead to find the longest matching blacklisted prefix in the Trie
      while (j < n) {
        const char = text[j].toLowerCase();
        if (current.children.has(char)) {
          current = current.children.get(char)!;
          if (current.isEndOfWord) {
            longestMatchLength = j - i + 1;
          }
          j++;
        } else {
          break;
        }
      }

      if (longestMatchLength !== -1) {
        // Found a blacklisted term, replace with "[bobba]"
        result += '[bobba]';
        i += longestMatchLength;
      } else {
        // No match, copy character and advance
        result += text[i];
        i++;
      }
    }

    return result;
  }
}

// Export a default pre-populated moderator
export const defaultBlacklist = [
  'spam',
  'scam',
  'hack',
  'exploit',
  'freemoney',
  'doublebooking',
  'double-booking',
  'malware',
  'phishing',
  'hacker',
];

export const globalModerator = new ContentModerator(defaultBlacklist);
