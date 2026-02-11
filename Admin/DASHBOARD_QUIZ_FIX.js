// ============================================
// UPDATED QUIZ FUNCTIONS FOR DASHBOARD
// ============================================
// Replace your existing quiz functions with these

let currentQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = {};

// Open Quiz Modal
async function openQuizModal(weekNumber) {
    try {
        const response = await fetch(`ajax-quiz.php?week=${weekNumber}`);
        const data = await response.json();
        
        if (!data.success) {
            alert(data.message || 'No quiz available for this week yet.');
            return;
        }
        
        if (data.alreadyTaken) {
            if (!confirm(`You've already taken this quiz (Score: ${data.previousScore}%). Take it again?`)) {
                return;
            }
        }
        
        currentQuestions = data.questions;
        currentQuestionIndex = 0;
        userAnswers = {};
        
        displayQuestion();
        document.getElementById('quizModal').style.display = 'flex';
        
    } catch (error) {
        console.error('Quiz error:', error);
        alert('Error loading quiz. Please try again.');
    }
}

// Display Current Question
function displayQuestion() {
    if (currentQuestionIndex >= currentQuestions.length) {
        submitQuiz();
        return;
    }
    
    const question = currentQuestions[currentQuestionIndex];
    const modal = document.getElementById('quizModal');
    
    if (!modal) {
        console.error('Quiz modal not found');
        return;
    }
    
    const modalContent = modal.querySelector('.modal-content');
    
    modalContent.innerHTML = `
        <div class="modal-header">
            <h2>📝 Week ${question.weekNumber || ''} Quiz</h2>
            <span class="close" onclick="closeModal('quizModal')">&times;</span>
        </div>
        <div class="modal-body">
            <div class="quiz-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${((currentQuestionIndex + 1) / currentQuestions.length) * 100}%"></div>
                </div>
                <div class="progress-text">Question ${currentQuestionIndex + 1} of ${currentQuestions.length}</div>
            </div>
            
            <div class="quiz-question">
                <h3>${escapeHtml(question.question)}</h3>
            </div>
            
            <div class="quiz-options">
                ${Object.entries(question.options).map(([letter, text]) => `
                    <div class="quiz-option" data-answer="${letter}" onclick="selectAnswer('${letter}', ${question.quiz_id})">
                        <div class="option-letter">${letter}</div>
                        <div class="option-text">${escapeHtml(text)}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Select Answer
function selectAnswer(answer, quizId) {
    const question = currentQuestions[currentQuestionIndex];
    const isCorrect = answer === question.correct_answer;
    const options = document.querySelectorAll('.quiz-option');
    
    // Store answer
    userAnswers[quizId] = answer;
    
    // Disable all options
    options.forEach(opt => {
        opt.style.pointerEvents = 'none';
        opt.style.cursor = 'default';
    });
    
    // Find selected and correct options
    let selectedOption = null;
    let correctOption = null;
    
    options.forEach(opt => {
        if (opt.dataset.answer === answer) {
            selectedOption = opt;
        }
        if (opt.dataset.answer === question.correct_answer) {
            correctOption = opt;
        }
    });
    
    if (isCorrect) {
        // Correct answer selected
        if (selectedOption) {
            selectedOption.classList.add('correct');
        }
        setTimeout(() => {
            currentQuestionIndex++;
            displayQuestion();
        }, 500);
    } else {
        // Wrong answer selected
        if (selectedOption) {
            selectedOption.classList.add('incorrect');
        }
        // Show correct answer
        if (correctOption) {
            correctOption.classList.add('correct');
        }
        setTimeout(() => {
            currentQuestionIndex++;
            displayQuestion();
        }, 2000);
    }
}

// Submit Quiz
async function submitQuiz() {
    try {
        const firstQuizId = currentQuestions[0].quiz_id;
        const formData = new FormData();
        formData.append('quiz_id', firstQuizId);
        formData.append('answers', JSON.stringify(userAnswers));
        
        const response = await fetch('ajax-submit-quiz.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            showQuizResults(data);
        } else {
            alert('Error: ' + (data.message || 'Failed to submit quiz'));
            closeModal('quizModal');
        }
    } catch (error) {
        console.error('Submit error:', error);
        alert('Error submitting quiz. Please try again.');
        closeModal('quizModal');
    }
}

// Show Quiz Results
function showQuizResults(data) {
    const modal = document.getElementById('quizModal');
    if (!modal) return;
    
    const modalContent = modal.querySelector('.modal-content');
    
    let emoji = '😊';
    if (data.score >= 90) emoji = '🌟';
    else if (data.score >= 80) emoji = '🎉';
    else if (data.score >= 70) emoji = '👍';
    else if (data.score < 60) emoji = '📚';
    
    modalContent.innerHTML = `
        <div class="modal-header">
            <h2>📝 Quiz Complete!</h2>
            <span class="close" onclick="closeModal('quizModal')">&times;</span>
        </div>
        <div class="modal-body" style="text-align: center;">
            <div style="font-size: 80px; margin: 20px 0;">${emoji}</div>
            <h2 style="font-size: 48px; color: #667eea; margin: 20px 0;">${data.score}%</h2>
            <p style="font-size: 20px; color: #64748b; margin: 20px 0;">
                You got ${data.correct} out of ${data.total} correct!
            </p>
            <button onclick="closeModal('quizModal'); location.reload();" 
                    style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                           color: white; padding: 16px 32px; border: none; 
                           border-radius: 12px; font-size: 16px; font-weight: 600; 
                           cursor: pointer; margin-top: 20px;">
                Awesome! 🎉
            </button>
        </div>
    `;
    
    setTimeout(() => {
        closeModal('quizModal');
        location.reload();
    }, 3000);
}

// Helper: Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
