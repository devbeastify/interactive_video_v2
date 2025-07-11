// @ts-check

/**
 * Test file to verify DL logic works with actual activity info structure
 */

// Mock activity info structure based on user's example
const mockActivityInfo = {
    "diagnostic": {
      "dl": "Fill123 in the forms of <strong lang=\"es\">ser</strong>.",
      "failure_message": "We suggest you repeat this tutorial.",
      "items": [
        {
          "question_type": "fill_in_the_blanks",
          "prompt": "<wol ref=\"1\"></wol> la escuela de Daniel.",
          "answers": {
            "1": ["Es"]
          }
        }
      ],
      "language": "es",
      "number_of_questions": "10",
      "threshold": "7"
    },
    "topic": "Vamos a la ciudad",
    "sub_topic": "Place in the city",
    "title": "Interactive Grammar Tutorial1: Present tense of <b>ser</b>",
    "dl": "Complete the tutorial - Test",
    "quick_checks": [
      {
        "gap": 1,
        "offset": 130,
        "quick_check_content": {
          "dl": "Which subject pronoun would you use to talk about these people?",
          "items": []
        },
        "type": "quick_check_drag_and_drop"
      }
    ],
    "reference": [
      {
        "video_path": "https://media.maestro.vhlcentral.com/video/m00329348_r00376768.mp4",
        "english_subtitles_path": "https://media.maestro.vhlcentral.com/subtitle/0022/VIS6e_L01-3_ser-present-tense_English.vtt",
        "foreign_language": "Spanish",
        "foreign_subtitles_path": null,
        "height": 486,
        "title": null,
        "type": "video",
        "width": 864
      }
    ]
  };
  
  /**
   * Test the DL logic functions
   */
  function testDLLogic() {
    console.log('Testing DL Logic...');
    
    // Test getDirectionLineForStep function
    const getDirectionLineForStep = (/** @type {string} */ stepType) => {
      switch (stepType) {
        case 'intro':
          return mockActivityInfo.dl || '';
        case 'player':
          return mockActivityInfo.dl || '';
        case 'diagnostic':
          return mockActivityInfo.diagnostic?.dl || '';
        default:
          return mockActivityInfo.dl || '';
      }
    };
  
    // Test cases
    console.log('Intro DL:', getDirectionLineForStep('intro'));
    console.log('Player DL:', getDirectionLineForStep('player'));
    console.log('Diagnostic DL:', getDirectionLineForStep('diagnostic'));
    
    // Test hasDirectionLines function
    const hasDirectionLines = () => {
      return Boolean(
        mockActivityInfo.dl ||
        mockActivityInfo.diagnostic?.dl
      );
    };
    
    console.log('Has Direction Lines:', hasDirectionLines());
    
    // Test language code function
    const getLanguageCodeForStep = (/** @type {string} */ stepType) => {
      switch (stepType) {
        case 'diagnostic':
          return mockActivityInfo.diagnostic?.language || 'en';
        default:
          return 'en';
      }
    };
    
    console.log('Intro Language:', getLanguageCodeForStep('intro'));
    console.log('Player Language:', getLanguageCodeForStep('player'));
    console.log('Diagnostic Language:', getLanguageCodeForStep('diagnostic'));
  }
  
  // Run the test
  testDLLogic(); 