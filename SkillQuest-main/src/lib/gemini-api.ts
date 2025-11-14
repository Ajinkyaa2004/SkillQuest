interface Block {
  id: number;
  row: number;
  col: number;
  length: number;
  orientation: 'horizontal' | 'vertical';
  isTarget: boolean;
  color: string;
}

const GEMINI_API_KEY = 'AIzaSyDDo2eii8ycmzlHfHm5AF_ajYsNZ_77jNg';

// Try these models in order - first available one will be used
// Updated with latest model names
const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-flash-latest',
  'gemini-pro-latest',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-pro',
];

// Track ongoing requests to prevent duplicate calls
let ongoingRequest: Promise<{ puzzle: Block[]; model: string } | null> | null = null;

// Try both v1 and v1beta API versions
const API_VERSIONS = ['v1beta', 'v1'];

function getGeminiApiUrl(model: string, version: string = 'v1beta'): string {
  return `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent`;
}

const COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-orange-500',
  'bg-teal-500',
  'bg-cyan-500',
];

const GRID_SIZE = 6;
const TARGET_ROW = 2;
const TARGET_EXIT_COL = 5;

function createPuzzlePrompt(level: number): string {
  // Reversed difficulty: Level 1 is hardest, later levels are easier
  const difficulty = level <= 5 ? 'challenging' : level <= 10 ? 'medium' : 'easy';
  // Reversed block count: Level 1 has most blocks (hardest), later levels have fewer blocks (easier)
  const numBlocks = level <= 3 ? 7 : level <= 7 ? 6 : level <= 12 ? 5 : level <= 15 ? 4 : 3;

  return `Generate a solvable Unblock Me puzzle for level ${level} (${difficulty} difficulty).

Requirements:
- Grid size: 6x6 (rows and columns from 0 to 5)
- Target block: Must be horizontal, length 2, on row ${TARGET_ROW}, and must be able to reach column ${TARGET_EXIT_COL} (exit)
- Total blocks: ${numBlocks} (including the target block)
- All blocks must be either horizontal or vertical
- Block lengths: 2 or 3 cells
- No overlapping blocks
- Puzzle must be solvable (the red target block can reach the exit)
- Target block color: bg-red-500
- Other blocks: Use different colors from: ${COLORS.join(', ')}

Return ONLY a valid JSON array of blocks in this exact format:
[
  {"id": 0, "row": 2, "col": 0, "length": 2, "orientation": "horizontal", "isTarget": true, "color": "bg-red-500"},
  {"id": 1, "row": 0, "col": 2, "length": 2, "orientation": "vertical", "isTarget": false, "color": "bg-blue-500"},
  ...
]

Rules:
- id starts from 0 and increments
- row and col must be between 0 and 5
- length must be 2 or 3
- orientation must be "horizontal" or "vertical"
- Only one block has isTarget: true
- All blocks must fit within the 6x6 grid
- No two blocks should overlap
- The target block must be on row ${TARGET_ROW} and horizontal
- Ensure the puzzle is solvable (target can reach column ${TARGET_EXIT_COL})

Return ONLY the JSON array, no other text.`;
}

function validatePuzzle(puzzle: Block[]): boolean {
  if (!Array.isArray(puzzle) || puzzle.length === 0) return false;

  const grid: boolean[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(false));
  let targetCount = 0;

  for (const block of puzzle) {
    // Validate block structure
    if (
      typeof block.id !== 'number' ||
      typeof block.row !== 'number' ||
      typeof block.col !== 'number' ||
      typeof block.length !== 'number' ||
      !['horizontal', 'vertical'].includes(block.orientation) ||
      typeof block.isTarget !== 'boolean' ||
      typeof block.color !== 'string'
    ) {
      return false;
    }

    // Validate target block
    if (block.isTarget) {
      targetCount++;
      if (block.orientation !== 'horizontal' || block.row !== TARGET_ROW) {
        return false;
      }
    }

    // Validate position and length
    if (block.row < 0 || block.col < 0 || block.length < 2 || block.length > 3) {
      return false;
    }

    // Check if block fits in grid
    if (block.orientation === 'horizontal') {
      if (block.col + block.length > GRID_SIZE) return false;
      for (let i = 0; i < block.length; i++) {
        if (grid[block.row][block.col + i]) return false; // Overlap detected
        grid[block.row][block.col + i] = true;
      }
    } else {
      if (block.row + block.length > GRID_SIZE) return false;
      for (let i = 0; i < block.length; i++) {
        if (grid[block.row + i][block.col]) return false; // Overlap detected
        grid[block.row + i][block.col] = true;
      }
    }
  }

  // Must have exactly one target block
  if (targetCount !== 1) return false;

  return true;
}

export async function generatePuzzleFromGemini(level: number): Promise<{ puzzle: Block[]; model: string } | null> {
  // If there's already an ongoing request, return it instead of making a duplicate call
  if (ongoingRequest) {
    console.log('⏸️ Request already in progress, reusing existing request...');
    return ongoingRequest;
  }

  const prompt = createPuzzlePrompt(level);
  console.log('🔍 Calling Gemini API for level:', level);
  
  // Create the request and store it
  ongoingRequest = (async () => {
    try {
      return await generatePuzzleInternal(prompt);
    } finally {
      // Clear the ongoing request when done
      ongoingRequest = null;
    }
  })();
  
  return ongoingRequest;
}

async function generatePuzzleInternal(prompt: string): Promise<{ puzzle: Block[]; model: string } | null> {
  
  // First, try to list available models (optional, for debugging)
  try {
    const listResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`);
    if (listResponse.ok) {
      const listData = await listResponse.json();
      if (listData.models) {
        const availableModelNames = listData.models.map((m: any) => m.name.replace('models/', ''));
        console.log('📋 Available models:', availableModelNames.slice(0, 8).join(', '), '...');
      }
    }
  } catch (err) {
    console.log('⚠️ Could not list models, continuing with direct calls...');
  }
  
  // Try each model and API version combination until one works
  console.log(`🔍 Trying ${GEMINI_MODELS.length} models in order: ${GEMINI_MODELS.join(', ')}`);
  for (const model of GEMINI_MODELS) {
    for (const version of API_VERSIONS) {
      try {
        const apiUrl = getGeminiApiUrl(model, version);
        console.log(`🔄 Trying model: ${model} (${version})`);
        
        const response = await fetch(
          `${apiUrl}?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: prompt,
                    },
                  ],
                },
              ],
            }),
          }
        );

        console.log(`📊 Response status for ${model} (${version}):`, response.status);

        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch {
            const errorText = await response.text();
            errorData = { error: { message: errorText } };
          }
          
          // If it's a 404, try next model/version
          if (response.status === 404) {
            console.log(`   ❌ ${model} (${version}) not found, trying next...`);
            continue;
          }
          
          // If it's a 503 (overloaded), wait a bit and retry once, then try next
          if (response.status === 503) {
            console.log(`   ⏳ ${model} (${version}) is overloaded (503), waiting 1 second before trying next model...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
          
          // For other errors, log and try next
          console.error(`   ❌ ${model} (${version}) failed:`, response.status, errorData.error?.message || 'Unknown error');
          continue;
        }

        const data = await response.json();
        
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
          console.error(`   ❌ No text in Gemini response for ${model} (${version})`);
          continue; // Try next model/version
        }

        // Extract JSON from response (might have markdown code blocks or extra text)
        let jsonText = text.trim();
        
        // Remove markdown code blocks if present
        if (jsonText.includes('```json')) {
          const jsonMatch = jsonText.match(/```json\s*([\s\S]*?)\s*```/);
          if (jsonMatch) jsonText = jsonMatch[1].trim();
        } else if (jsonText.includes('```')) {
          const jsonMatch = jsonText.match(/```\s*([\s\S]*?)\s*```/);
          if (jsonMatch) jsonText = jsonMatch[1].trim();
        }
        
        // Try to extract JSON array if there's extra text
        const jsonArrayMatch = jsonText.match(/\[[\s\S]*\]/);
        if (jsonArrayMatch) {
          jsonText = jsonArrayMatch[0];
        }

        const puzzle = JSON.parse(jsonText) as Block[];

        // Validate the puzzle
        if (!validatePuzzle(puzzle)) {
          console.error(`   ❌ Invalid puzzle generated by ${model} (${version}), trying next...`);
          continue; // Try next model/version
        }

        const workingModel = `${model} (${version})`;
        console.log(`✅ Successfully generated puzzle from ${workingModel}!`);
        console.log(`🎯 ==========================================`);
        console.log(`🎯 WORKING MODEL: ${workingModel}`);
        console.log(`🎯 ==========================================`);
        return { puzzle, model: workingModel };
      } catch (error: any) {
        console.error(`   ❌ Error with ${model} (${version}):`, error.message || error);
        // Continue to next model/version
        continue;
      }
    }
  }
  
  // If all models failed, return null
  console.error('❌ All Gemini models failed, falling back to predefined puzzles');
  console.log('❌ No working model found - all models failed');
  return null;
}

