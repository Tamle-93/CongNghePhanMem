// Frontend/src/services/aiService.js
// ✅ AI Features: Spell check, summarization, keyword suggestion

class AIService {
  constructor() {
    this.enabled = true;
    this.apiUrl = 'https://api.anthropic.com/controllers/messages';
  }
  /**
   * Spell check and grammar correction
   */
  async checkSpelling(text) {
    if (!text || text.length < 10) {
      return { corrected: text, suggestions: [] };
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: `Check spelling and grammar in this text. Return ONLY a JSON object with:
{
  "corrected": "corrected text",
  "errors": [{"original": "word", "suggestion": "correction", "position": 0}]
}

Text: ${text}`
            }
          ]
        })
      });

      const data = await response.json();
      const result = this.parseJSON(data.content[0].text);
      
      return {
        corrected: result.corrected || text,
        errors: result.errors || []
      };
    } catch (error) {
      console.error('Spell check error:', error);
      return { corrected: text, errors: [] };
    }
  }

  /**
   * Generate neutral summary (150-250 words)
   */
  async generateSummary(text, maxWords = 200) {
    if (!text || text.length < 100) {
      return { summary: '', wordCount: 0 };
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: `Summarize this academic paper abstract in ${maxWords} words. Be objective and neutral.
Return ONLY a JSON object:
{
  "summary": "summary text",
  "keyPoints": ["point 1", "point 2", "point 3"]
}

Abstract: ${text}`
            }
          ]
        })
      });

      const data = await response.json();
      const result = this.parseJSON(data.content[0].text);
      
      return {
        summary: result.summary || '',
        keyPoints: result.keyPoints || [],
        wordCount: result.summary ? result.summary.split(' ').length : 0
      };
    } catch (error) {
      console.error('Summary error:', error);
      return { summary: '', keyPoints: [], wordCount: 0 };
    }
  }

  /**
   * Suggest keywords based on title and abstract
   */
  async suggestKeywords(title, abstract) {
    if (!title && !abstract) {
      return { keywords: [] };
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 500,
          messages: [
            {
              role: 'user',
              content: `Suggest 5-8 relevant academic keywords for this paper.
Return ONLY a JSON array: ["keyword1", "keyword2", ...]

Title: ${title}
Abstract: ${abstract}`
            }
          ]
        })
      });

      const data = await response.json();
      const keywords = this.parseJSON(data.content[0].text);
      
      return {
        keywords: Array.isArray(keywords) ? keywords : []
      };
    } catch (error) {
      console.error('Keyword suggestion error:', error);
      return { keywords: [] };
    }
  }

  /**
   * Calculate similarity between reviewer expertise and paper
   */
  async calculateSimilarity(reviewerKeywords, paperKeywords) {
    if (!reviewerKeywords || !paperKeywords) {
      return { score: 0, matches: [] };
    }

    const reviewerSet = new Set(reviewerKeywords.toLowerCase().split(',').map(k => k.trim()));
    const paperSet = new Set(paperKeywords.toLowerCase().split(',').map(k => k.trim()));
    
    const matches = [...reviewerSet].filter(k => paperSet.has(k));
    const score = matches.length / Math.max(reviewerSet.size, paperSet.size);

    return {
      score: Math.round(score * 100),
      matches,
      suggestion: score > 0.3 ? 'High match' : score > 0.15 ? 'Medium match' : 'Low match'
    };
  }

  /**
   * Generate email template
   */
  async generateEmail(type, data) {
    const templates = {
      acceptance: `Subject: Congratulations! Paper Accepted - ${data.paperTitle}

Dear ${data.authorName},

We are pleased to inform you that your paper "${data.paperTitle}" has been accepted for ${data.conferenceName}.

Please submit the camera-ready version by ${data.deadline}.

Best regards,
${data.chairName}`,
      
      rejection: `Subject: Paper Decision - ${data.paperTitle}

Dear ${data.authorName},

Thank you for submitting "${data.paperTitle}" to ${data.conferenceName}.

After careful review, we regret to inform you that your paper was not selected for acceptance.

Best regards,
${data.chairName}`,

      review_request: `Subject: Review Request - ${data.conferenceName}

Dear ${data.reviewerName},

You have been assigned to review the paper "${data.paperTitle}".

Please submit your review by ${data.deadline}.

Best regards,
${data.chairName}`
    };

    return templates[type] || templates.acceptance;
  }

  /**
   * Parse JSON from AI response
   */
  parseJSON(text) {
    try {
      // Remove markdown code blocks if present
      const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (error) {
      console.error('JSON parse error:', error);
      return {};
    }
  }
}

const aiService = new AIService();
export default aiService;