/**
 * API Integration Tests
 * Tests for Perplexity API client with mocked responses
 */

// Mock fetch for API tests
const originalFetch = global.fetch;

// Mock API response
const mockApiResponse = {
  choices: [{
    message: {
      content: JSON.stringify({
        platforms: [
          {
            id: 'netflix',
            name: 'Netflix',
            releases: [
              {
                title: 'Test Movie',
                release_date: '2024-12-05',
                type: 'movie',
                genre: 'Drama',
                description: 'A test movie description'
              }
            ]
          }
        ]
      })
    }
  }]
};

beforeEach(() => {
  // Reset fetch mock before each test
  global.fetch = jest.fn();
});

afterAll(() => {
  // Restore original fetch after all tests
  global.fetch = originalFetch;
});

// Import the module after setting up mocks
const { 
  callPerplexityAPI, 
  parseResponse, 
  buildPrompt,
  generateWeekData 
} = require('../../scripts/fetch-releases');

describe('Perplexity API Client', () => {
  
  describe('callPerplexityAPI', () => {
    
    test('should throw error when API key is not set', async () => {
      delete process.env.PERPLEXITY_API_KEY;
      
      await expect(callPerplexityAPI('test prompt')).rejects.toThrow(
        'PERPLEXITY_API_KEY environment variable is not set'
      );
    });

    test('should make POST request to Perplexity API', async () => {
      process.env.PERPLEXITY_API_KEY = 'test-api-key';
      
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockApiResponse)
      });
      
      await callPerplexityAPI('test prompt');
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.perplexity.ai/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key',
            'Content-Type': 'application/json'
          })
        })
      );
    });

    test('should use sonar model', async () => {
      process.env.PERPLEXITY_API_KEY = 'test-api-key';
      
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockApiResponse)
      });
      
      await callPerplexityAPI('test prompt');
      
      const callBody = JSON.parse(global.fetch.mock.calls[0][1].body);
      expect(callBody.model).toBe('sonar');
    });

    test('should include web_search_options', async () => {
      process.env.PERPLEXITY_API_KEY = 'test-api-key';
      
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockApiResponse)
      });
      
      await callPerplexityAPI('test prompt');
      
      const callBody = JSON.parse(global.fetch.mock.calls[0][1].body);
      expect(callBody.web_search_options).toEqual({
        search_context_size: 'low'
      });
    });

    test('should throw error on API failure', async () => {
      process.env.PERPLEXITY_API_KEY = 'test-api-key';
      
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        text: () => Promise.resolve('Unauthorized')
      });
      
      await expect(callPerplexityAPI('test prompt')).rejects.toThrow(
        'Perplexity API error (401)'
      );
    });
  });

  describe('parseResponse', () => {
    
    test('should parse valid JSON from API response', () => {
      const result = parseResponse(mockApiResponse);
      
      expect(result).toHaveProperty('platforms');
      expect(result.platforms).toHaveLength(1);
      expect(result.platforms[0].id).toBe('netflix');
    });

    test('should throw error when response has no content', () => {
      expect(() => parseResponse({})).toThrow('No content in API response');
    });

    test('should extract JSON from markdown code blocks', () => {
      const responseWithCodeBlock = {
        choices: [{
          message: {
            content: '```json\n{"platforms": []}\n```'
          }
        }]
      };
      
      const result = parseResponse(responseWithCodeBlock);
      expect(result).toEqual({ platforms: [] });
    });

    test('should throw error for invalid JSON', () => {
      const invalidResponse = {
        choices: [{
          message: {
            content: 'This is not JSON'
          }
        }]
      };
      
      expect(() => parseResponse(invalidResponse)).toThrow(
        'Could not parse API response as JSON'
      );
    });
  });

  describe('buildPrompt', () => {
    
    test('should include week date range', () => {
      const prompt = buildPrompt('December 2-8, 2024');
      
      expect(prompt).toContain('December 2-8, 2024');
    });

    test('should include all 8 platforms', () => {
      const prompt = buildPrompt('December 2-8, 2024');
      
      expect(prompt).toContain('Netflix');
      expect(prompt).toContain('Prime Video');
      expect(prompt).toContain('Disney+');
      expect(prompt).toContain('Hulu');
      expect(prompt).toContain('Apple TV+');
      expect(prompt).toContain('Max');
      expect(prompt).toContain('Paramount+');
      expect(prompt).toContain('Peacock');
    });

    test('should request JSON format', () => {
      const prompt = buildPrompt('December 2-8, 2024');
      
      expect(prompt).toContain('JSON');
    });
  });

  describe('generateWeekData', () => {
    
    test('should include week metadata', () => {
      const releaseData = { platforms: [] };
      const mockDate = new Date('2024-12-04T09:00:00Z');
      
      const result = generateWeekData(releaseData, mockDate);
      
      expect(result).toHaveProperty('week_number');
      expect(result).toHaveProperty('year');
      expect(result).toHaveProperty('week_id');
      expect(result).toHaveProperty('week_start');
      expect(result).toHaveProperty('week_end');
      expect(result).toHaveProperty('week_range');
      expect(result).toHaveProperty('week_title');
      expect(result).toHaveProperty('generated_at');
      expect(result).toHaveProperty('platforms');
    });

    test('should calculate correct week number', () => {
      const releaseData = { platforms: [] };
      const mockDate = new Date('2024-12-04T09:00:00Z');
      
      const result = generateWeekData(releaseData, mockDate);
      
      expect(result.week_number).toBe(49);
      expect(result.year).toBe(2024);
      expect(result.week_id).toBe('2024-49');
    });

    test('should include platforms from release data', () => {
      const releaseData = { 
        platforms: [
          { id: 'netflix', name: 'Netflix', releases: [] }
        ] 
      };
      const mockDate = new Date('2024-12-04T09:00:00Z');
      
      const result = generateWeekData(releaseData, mockDate);
      
      expect(result.platforms).toHaveLength(1);
      expect(result.platforms[0].id).toBe('netflix');
    });
  });
});
