# AI Chat Assistant Setup Guide

## Overview

The NY Expungement Helper now includes an AI-powered chat assistant that provides accurate information about New York marijuana expungement and sealing laws. The chat is context-aware and includes strict guardrails to ensure only relevant, accurate legal information is provided.

## Features

- **Persistent Chat Widget**: Floating chat bubble available on all pages
- **Context-Aware Responses**: Knows about user's assessment status and questionnaire progress
- **Legal Knowledge Base**: Pre-loaded with comprehensive NY expungement law information
- **Strict Guardrails**: Only responds to relevant legal questions, denies off-topic requests
- **Professional Disclaimers**: Always includes appropriate legal disclaimers
- **Chat History**: Saves conversation history per user session
- **Demo Mode**: Works without API key for testing with fallback responses

## Configuration

### OpenAI API Key (Optional)

To enable full AI functionality, set your OpenAI API key as an environment variable:

```bash
export OPENAI_API_KEY="your-openai-api-key-here"
```

**Without API Key**: The chat works in demo mode with pre-written responses about NY expungement laws.

**With API Key**: Full ChatGPT-3.5-turbo integration with dynamic, context-aware responses.

### Cost Considerations

- **Model**: GPT-3.5-turbo (cost-effective option)
- **Token Limits**: 500 max tokens per response
- **Temperature**: 0.3 (lower temperature for consistent legal information)
- **Context**: Limited to last 4 messages to control costs

## Knowledge Base Coverage

The AI assistant has comprehensive knowledge about:

### MRTA 2021 (Automatic Expungement)
- Marijuana possession convictions before March 31, 2021
- 3 ounces or less limitation
- Automatic process (no petition required)
- Current status and verification process

### Clean Slate Act (Effective November 2024)
- Automatic sealing criteria
- Misdemeanor: 3+ years after sentence completion
- Felony: 8+ years after sentence completion
- Exclusions and disqualifiers

### Petition-Based Sealing (CPL § 160.59)
- 10+ year waiting period
- Conviction count limitations
- Court petition process
- Timeline expectations

### Legal Definitions
- Expungement vs. sealing differences
- Excluded offenses
- Automatic vs. petition processes

## Usage Guidelines

### What the Chat CAN Do:
- Explain NY expungement and sealing laws
- Define legal terms and processes
- Provide general procedural information
- Cite relevant legal statutes
- Explain eligibility requirements
- Discuss timelines and expectations

### What the Chat CANNOT Do:
- Provide specific legal advice for individual cases
- Predict case outcomes
- Advise on other states' laws
- Handle immigration consequences
- Provide employment law guidance
- Recommend specific legal strategies

## User Experience

### Chat Interface
- **Floating Widget**: Bottom-right corner, minimizable
- **Professional Design**: Matches app's legal theme
- **Message History**: Scrollable conversation view
- **Typing Indicators**: Shows when AI is responding
- **Legal Disclaimers**: Always visible in input area

### Response Quality
- **Accurate Information**: Based on verified NY law sources
- **Professional Tone**: Appropriate for legal context
- **Consistent Formatting**: Structured responses with citations
- **Appropriate Length**: Concise but comprehensive answers

## Technical Implementation

### Frontend Components
- `ChatProvider`: React context for state management
- `ChatWidget`: Main floating chat interface
- `ChatMessage`: Individual message display component
- `chat-knowledge-base.ts`: Legal information database

### Backend API
- `POST /api/chat`: Main chat endpoint
- Authentication required
- Request validation and error handling
- OpenAI integration with fallback mode

### Security Features
- User authentication required
- Input validation and sanitization
- Rate limiting (inherent through OpenAI)
- Error handling and graceful degradation

## Testing

### Demo Mode Testing
1. Start the application without OPENAI_API_KEY
2. Click the chat bubble (bottom-right)
3. Ask: "What's the difference between expungement and sealing?"
4. Verify demo response with legal information

### Full AI Testing (with API key)
1. Set OPENAI_API_KEY environment variable
2. Restart the application
3. Test various legal questions
4. Verify responses include proper disclaimers
5. Test off-topic questions (should be redirected)

## Troubleshooting

### Chat Not Appearing
- Check browser console for JavaScript errors
- Verify user is authenticated
- Ensure ChatProvider wraps the application

### API Errors
- Check OPENAI_API_KEY is set correctly
- Verify OpenAI account has sufficient credits
- Check server logs for detailed error messages

### Slow Responses
- Normal for AI responses (2-5 seconds)
- Check internet connection
- Verify OpenAI service status

## Legal Compliance

### Disclaimers
- All responses include legal disclaimers
- Clear distinction between information and advice
- Recommendations to consult qualified attorneys

### Accuracy
- Responses based on verified legal sources
- Regular updates needed as laws change
- Conservative approach to uncertain areas

### Privacy
- Chat history stored locally per user
- No sensitive information sent to OpenAI
- Standard authentication protections

## Future Enhancements

### Planned Features
- Document upload and analysis
- Case tracking integration
- Premium chat features
- Multi-language support

### Knowledge Base Expansion
- Additional NY legal topics
- Court procedure details
- Form completion guidance
- Attorney referral integration

---

**Note**: This chat assistant provides general legal information only, not legal advice. Users should always consult with qualified attorneys for case-specific guidance. 