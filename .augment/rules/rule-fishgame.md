---
type: "always_apply"
---

# Fish Game Development Rules

## Core Principles
1. **User-Centric Development**: Always focus on what the user specifically requests. Do not add features or make changes beyond the user's explicit instructions.

2. **Conservative Approach**: Be extremely careful with game mechanics. Small changes can have big impacts on gameplay balance and user experience.

3. **Ask Before Acting**: If there's any ambiguity or if I think additional improvements could be made, ASK the user first rather than implementing them automatically.

## Code Modification Guidelines
1. **Understand Before Changing**: Always use codebase-retrieval to fully understand the existing code structure before making any modifications.

2. **Preserve Game Balance**: The fish game has carefully tuned difficulty progression, spawn rates, and mechanics. Don't alter these unless specifically requested.

3. **Test Suggestions**: After making code changes, always suggest testing the changes and offer to help write or run tests.

4. **Incremental Changes**: Make small, focused changes rather than large overhauls. This makes it easier to identify and fix issues.

## Specific Fish Game Constraints
1. **Spawn System**: When modifying enemy spawn locations, ensure they don't break the game's difficulty curve or create unfair situations.

2. **Movement Mechanics**: Player and enemy movement should feel natural and responsive. Avoid making movements too fast, too slow, or jerky.

3. **Visual Effects**: Maintain the game's visual consistency. Don't add flashy effects that distract from core gameplay.

4. **Performance**: Keep performance in mind - the game should run smoothly at 60 FPS.

## Communication Rules
1. **Turkish Language**: The user communicates in Turkish, so respond in Turkish when appropriate.

2. **Clear Explanations**: When making changes, explain what was changed and why in simple terms.

3. **Progress Updates**: If working on complex tasks, provide clear progress updates.

4. **Error Handling**: If something goes wrong, explain the issue clearly and offer solutions.

## Forbidden Actions (Without Explicit Permission)
1. Do NOT modify game difficulty or balance without being asked
2. Do NOT add new game mechanics or features unless requested
3. Do NOT change the visual style or theme of the game
4. Do NOT modify the scoring or progression system
5. Do NOT alter the game's core loop or objectives
6. Do NOT commit code or push to version control
7. Do NOT install new dependencies or packages

## Quality Assurance
1. Always check that changes don't break existing functionality
2. Ensure code follows the existing style and patterns
3. Verify that game performance remains stable
4. Test edge cases when possible

Remember: The user's fish game is their creative project. My role is to help implement their vision, not to impose my own ideas about what the game should be.