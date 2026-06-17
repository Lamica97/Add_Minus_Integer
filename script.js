document.addEventListener('DOMContentLoaded', () => {
    const problemElement = document.getElementById('problem');
    const choicesContainer = document.getElementById('choices');
    const nextBtn = document.getElementById('next-btn');
    const feedbackElement = document.getElementById('feedback');
    const scoreElement = document.getElementById('score');

    let currentAnswer = 0;
    let score = 0;
    let choicesBtns = [];

    // Helper: generate random integer between min and max (inclusive)
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Helper: shuffle array
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function generateProblem() {
        // Clear previous state
        choicesContainer.innerHTML = '';
        choicesBtns = [];
        nextBtn.classList.add('hidden');
        feedbackElement.classList.remove('show', 'correct', 'incorrect');
        problemElement.classList.remove('pop');

        // Generate numbers between -25 and 25
        const num1 = getRandomInt(-25, 25);
        const num2 = getRandomInt(-25, 25);
        
        // Generate operator: 0 for '+', 1 for '-'
        const isAddition = getRandomInt(0, 1) === 0;
        const operatorStr = isAddition ? '+' : '-';

        // Calculate correct answer
        currentAnswer = isAddition ? num1 + num2 : num1 - num2;

        // Format problem display
        let displayStr = `${num1} ${operatorStr} `;
        
        // Wrap negative second numbers in parentheses for clarity
        if (num2 < 0) {
            displayStr += `(${num2})`;
        } else {
            displayStr += `${num2}`;
        }
        displayStr += ' = ?';

        problemElement.textContent = displayStr;
        
        // Generate smart choices (distractors based on common mistakes)
        let choicesSet = new Set();
        choicesSet.add(currentAnswer);
        
        // Mistake 1: Wrong sign of the correct answer
        // Note: Object.is used to handle -0 if any, though standard 0 is fine
        choicesSet.add(currentAnswer === 0 ? 0 : -currentAnswer);

        // Mistake 2: Adding instead of subtracting, or subtracting instead of adding (absolute values)
        let mag1 = Math.abs(num1);
        let mag2 = Math.abs(num2);
        
        let sumMag = mag1 + mag2;
        let diffMag = Math.abs(mag1 - mag2);

        choicesSet.add(sumMag);
        choicesSet.add(-sumMag);
        choicesSet.add(diffMag);
        choicesSet.add(-diffMag);

        // Convert set to array and prioritize filling the 4 slots
        let allPossibleChoices = Array.from(choicesSet);
        let choices = [currentAnswer];
        
        for (let c of allPossibleChoices) {
            if (choices.length >= 4) break;
            if (c !== currentAnswer) {
                choices.push(c);
            }
        }
        
        // If we still don't have 4 choices (e.g. num1=0 or num2=0), add small offsets
        let offset = 1;
        while (choices.length < 4) {
            let val1 = currentAnswer + offset;
            let val2 = currentAnswer - offset;
            
            if (!choices.includes(val1)) {
                choices.push(val1);
            }
            if (choices.length >= 4) break;
            
            if (!choices.includes(val2)) {
                choices.push(val2);
            }
            offset++;
        }
        
        choices = shuffleArray(choices);

        // Render choice buttons
        choices.forEach(choice => {
            const btn = document.createElement('button');
            btn.classList.add('choice-btn');
            btn.textContent = choice;
            btn.addEventListener('click', () => checkAnswer(choice, btn));
            choicesContainer.appendChild(btn);
            choicesBtns.push(btn);
        });

        // Trigger pop animation
        setTimeout(() => {
            problemElement.classList.add('pop');
        }, 10);
    }

    function checkAnswer(selectedAnswer, clickedBtn) {
        // Disable all buttons
        choicesBtns.forEach(btn => btn.disabled = true);
        
        nextBtn.classList.remove('hidden');
        nextBtn.focus();

        feedbackElement.classList.remove('correct', 'incorrect');
        feedbackElement.classList.add('show');

        if (selectedAnswer === currentAnswer) {
            score += 10;
            scoreElement.textContent = score;
            feedbackElement.textContent = 'ถูกต้อง! เยี่ยมมาก 🎉';
            feedbackElement.classList.add('correct');
            clickedBtn.classList.add('correct');
        } else {
            // Apply shake animation to card
            const card = document.querySelector('.card');
            card.classList.remove('shake');
            setTimeout(() => card.classList.add('shake'), 10);
            
            feedbackElement.textContent = `ผิดครับ! คำตอบที่ถูกต้องคือ ${currentAnswer}`;
            feedbackElement.classList.add('incorrect');
            clickedBtn.classList.add('incorrect');
            
            // Highlight correct answer
            choicesBtns.forEach(btn => {
                if (parseInt(btn.textContent) === currentAnswer) {
                    btn.classList.add('correct');
                }
            });
        }
    }

    // Event listeners
    nextBtn.addEventListener('click', generateProblem);

    nextBtn.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            generateProblem();
        }
    });

    // Init first problem
    generateProblem();
});
