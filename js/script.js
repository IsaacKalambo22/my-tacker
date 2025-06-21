// User information
const userInfo = {
    name: "Isaac",
    lastLogin: new Date().toLocaleDateString()
};

// Learning phases and tasks template
const learningTemplate = {
    "Foundation & Planning": [
        "Define specific learning goals and objectives",
        "Research industry demand and job requirements",
        "Gather primary learning resources (courses, books, docs)",
        "Find supplementary materials and tutorials",
        "Join relevant communities and forums",
        "Set up development environment and tools",
        "Create realistic study schedule with milestones"
    ],
    "Core Learning": [
        "Master fundamental concepts and terminology",
        "Complete introductory tutorials and exercises",
        "Practice basic examples and implementations",
        "Dive deeper into intermediate concepts",
        "Work through structured coding exercises",
        "Learn advanced topics and complex patterns",
        "Study best practices and industry standards"
    ],
    "Hands-On Application": [
        "Build basic implementation project",
        "Create intermediate complexity project",
        "Develop advanced portfolio-worthy project",
        "Implement proper testing strategies",
        "Follow coding standards and conventions",
        "Use version control effectively",
        "Deploy projects to production environment"
    ],
    "Community & Professional Development": [
        "Write technical blog posts or articles",
        "Answer questions in forums and communities",
        "Give presentation or demo to colleagues",
        "Contribute to open source projects",
        "Update GitHub with quality projects",
        "Update LinkedIn profile with new skills",
        "Attend relevant meetups or conferences"
    ],
    "Assessment & Certification": [
        "Complete coding challenges and assessments",
        "Take practice tests or certification exams",
        "Get peer review from colleagues",
        "Apply skills to current work projects",
        "Volunteer for relevant tasks at work",
        "Propose new initiatives using learned technology",
        "Mentor others learning the same technology"
    ]
};

// Initialize subjects from localStorage
let subjects = JSON.parse(localStorage.getItem('learningSubjects')) || [];

// DOM functions
function openModal() {
    document.getElementById('subjectModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('subjectModal').style.display = 'none';
    // Clear form
    document.getElementById('subjectName').value = '';
    document.getElementById('priority').value = 'Medium';
    document.getElementById('targetDate').value = '';
}

function addSubject() {
    const name = document.getElementById('subjectName').value.trim();
    const priority = document.getElementById('priority').value;
    const targetDate = document.getElementById('targetDate').value;

    if (!name) {
        alert('Please enter a subject name');
        return;
    }

    const subject = {
        id: Date.now(),
        name: name,
        priority: priority,
        targetDate: targetDate,
        startDate: new Date().toISOString().split('T')[0],
        phases: {},
        completedTasks: 0,
        totalTasks: 0
    };

    // Initialize phases with tasks
    let totalTasks = 0;
    for (const [phaseName, tasks] of Object.entries(learningTemplate)) {
        subject.phases[phaseName] = tasks.map(task => ({
            text: task,
            completed: false
        }));
        totalTasks += tasks.length;
    }
    subject.totalTasks = totalTasks;

    subjects.push(subject);
    saveData();
    renderSubjects();
    updateStats();
    closeModal();
    
    // Show a success notification
    showNotification(`${name} added successfully!`);
}

function deleteSubject(id) {
    const subject = subjects.find(s => s.id === id);
    if (subject && confirm(`Are you sure you want to delete "${subject.name}"?`)) {
        subjects = subjects.filter(s => s.id !== id);
        saveData();
        renderSubjects();
        updateStats();
        showNotification(`Subject deleted successfully!`);
    }
}

function toggleTask(subjectId, phaseName, taskIndex) {
    const subject = subjects.find(s => s.id === subjectId);
    if (subject) {
        const task = subject.phases[phaseName][taskIndex];
        task.completed = !task.completed;
        
        // Update completion timestamp
        if (task.completed) {
            task.completedDate = new Date().toISOString();
        } else {
            delete task.completedDate;
        }
        
        // Update completed tasks count
        subject.completedTasks = 0;
        for (const phase of Object.values(subject.phases)) {
            subject.completedTasks += phase.filter(task => task.completed).length;
        }
        
        saveData();
        renderSubjects();
        updateStats();
    }
}

function renderSubjects() {
    const grid = document.getElementById('subjectsGrid');
    grid.innerHTML = '';

    if (subjects.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 40px; color: #7f8c8d;">
                <h3>No subjects yet</h3>
                <p>Click the "Add New Subject" button to start tracking your learning progress!</p>
            </div>
        `;
        return;
    }

    subjects.forEach(subject => {
        const progress = Math.round((subject.completedTasks / subject.totalTasks) * 100);
        
        const card = document.createElement('div');
        card.className = 'subject-card';
        
        let phasesHtml = '';
        for (const [phaseName, tasks] of Object.entries(subject.phases)) {
            phasesHtml += `
                <div class="phase">
                    <div class="phase-title">${phaseName}</div>
                    ${tasks.map((task, index) => `
                        <div class="task">
                            <input type="checkbox" 
                                   id="task-${subject.id}-${phaseName.replace(/[^a-zA-Z0-9]/g, '')}-${index}"
                                   ${task.completed ? 'checked' : ''} 
                                   onchange="toggleTask(${subject.id}, '${phaseName.replace(/'/g, "\\'")}', ${index})">
                            <label for="task-${subject.id}-${phaseName.replace(/[^a-zA-Z0-9]/g, '')}-${index}">${task.text}</label>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        card.innerHTML = `
            <div class="subject-header">
                <div class="subject-title">${subject.name}</div>
                <div class="subject-progress">${progress}%</div>
                <button class="btn btn-danger" onclick="deleteSubject(${subject.id})" style="padding: 6px 12px; font-size: 12px;">Delete</button>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
            <div style="margin-bottom: 15px; font-size: 14px; color: #7f8c8d;">
                <strong>Priority:</strong> ${subject.priority} | 
                <strong>Started:</strong> ${formatDate(subject.startDate)} | 
                <strong>Target:</strong> ${subject.targetDate ? formatDate(subject.targetDate) : 'Not set'}
            </div>
            ${phasesHtml}
        `;
        
        grid.appendChild(card);
    });
}

function updateStats() {
    const totalSubjects = subjects.length;
    const completedTasks = subjects.reduce((sum, s) => sum + s.completedTasks, 0);
    const totalTasks = subjects.reduce((sum, s) => sum + s.totalTasks, 0);
    const avgProgress = subjects.length > 0 ? 
        Math.round(subjects.reduce((sum, s) => sum + (s.completedTasks / s.totalTasks), 0) / subjects.length * 100) : 0;

    document.getElementById('totalSubjects').textContent = totalSubjects;
    document.getElementById('completedTasks').textContent = completedTasks;
    document.getElementById('avgProgress').textContent = avgProgress + '%';
}

function saveData() {
    localStorage.setItem('learningSubjects', JSON.stringify(subjects));
}

function exportData() {
    const data = {
        exportDate: new Date().toISOString(),
        userName: userInfo.name,
        subjects: subjects
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `learning-progress-${formatDateForFilename(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('Data exported successfully!');
}

function clearAllData() {
    if (confirm('Are you sure you want to clear all learning data? This cannot be undone.')) {
        subjects = [];
        saveData();
        renderSubjects();
        updateStats();
        showNotification('All data cleared successfully!');
    }
}

// Helper functions
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function formatDateForFilename(date) {
    return date.toISOString().split('T')[0];
}

function showNotification(message) {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #2ecc71;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            transform: translateY(100px);
            opacity: 0;
            transition: all 0.3s ease;
        `;
        document.body.appendChild(notification);
    }
    
    // Set message and show notification
    notification.textContent = message;
    notification.style.transform = 'translateY(0)';
    notification.style.opacity = '1';
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateY(100px)';
        notification.style.opacity = '0';
    }, 3000);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('subjectModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Update welcome message with user's name
    const headerText = document.querySelector('.header p');
    if (headerText) {
        headerText.textContent = `Welcome, ${userInfo.name}! Schedule your new tasks and track your progress`;
    }
    
    renderSubjects();
    updateStats();
}); 