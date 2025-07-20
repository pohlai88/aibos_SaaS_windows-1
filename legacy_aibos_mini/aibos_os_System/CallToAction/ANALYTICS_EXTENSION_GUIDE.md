# 🚀 AI-BOS Analytics Extension Guide

## Overview

The AI-BOS Developer Workspace includes a powerful **extensible analytics framework** that allows you to create custom metrics, widgets, and visualizations. This guide shows you how to extend the analytics capabilities for your personal use.

## 🎯 What You Can Create

### 1. **Custom Metrics**
- Track any data point you want
- Automatic calculations and formulas
- Real-time updates
- Historical tracking

### 2. **Custom Widgets**
- Visual components for your data
- Interactive charts and graphs
- Real-time dashboards
- Personal insights

### 3. **Custom Analytics**
- Advanced calculations
- Predictive analytics
- Performance monitoring
- Usage patterns

## 📊 Built-in Analytics Framework

### Core Features
```javascript
// Access the analytics framework
window.analytics

// Register new metrics
analytics.registerMetric('myMetric', {
    title: 'My Custom Metric',
    icon: '📊',
    unit: '',
    description: 'Description of my metric'
});

// Update metric values
analytics.updateMetric('myMetric', 42);

// Create custom calculations
analytics.createCustomMetric('efficiency', (metrics) => {
    // Your calculation logic here
    return someValue;
});
```

## 🔧 How to Extend Analytics

### Method 1: Browser Console (Quick Testing)

1. Open the dashboard in your browser
2. Press `F12` to open Developer Tools
3. Go to Console tab
4. Use the analytics framework directly:

```javascript
// Example: Add a custom productivity metric
analytics.registerMetric('codeLines', {
    title: 'Lines of Code',
    icon: '💻',
    unit: 'lines',
    description: 'Total lines of code written'
});

analytics.updateMetric('codeLines', 1500);

// Create a custom efficiency metric
analytics.createCustomMetric('efficiency', (metrics) => {
    const codeLines = metrics.get('codeLines')?.value || 0;
    const tasks = metrics.get('completedTasks')?.value || 0;
    return Math.round((codeLines / (tasks + 1)) * 10);
}, {
    title: 'Code Efficiency',
    icon: '⚡',
    unit: '/100'
});

// Refresh the dashboard
loadAnalytics();
```

### Method 2: Create Custom JavaScript Files

Create a new file: `custom-analytics.js`

```javascript
// Custom Analytics Extension
class CustomAnalytics {
    constructor() {
        this.initializeCustomMetrics();
        this.initializeCustomWidgets();
    }

    initializeCustomMetrics() {
        // Personal Development Metrics
        analytics.registerMetric('learningHours', {
            title: 'Learning Hours',
            icon: '📚',
            unit: 'hours',
            description: 'Time spent learning new technologies'
        });

        analytics.registerMetric('projectsStarted', {
            title: 'Projects Started',
            icon: '🚀',
            unit: '',
            description: 'Number of new projects initiated'
        });

        analytics.registerMetric('bugsFixed', {
            title: 'Bugs Fixed',
            icon: '🐛',
            unit: '',
            description: 'Number of bugs resolved'
        });

        // Custom calculations
        analytics.createCustomMetric('developerScore', (metrics) => {
            const learningHours = metrics.get('learningHours')?.value || 0;
            const projectsStarted = metrics.get('projectsStarted')?.value || 0;
            const bugsFixed = metrics.get('bugsFixed')?.value || 0;
            const tasksCompleted = metrics.get('completedTasks')?.value || 0;

            return Math.round(
                (learningHours * 0.3) +
                (projectsStarted * 10) +
                (bugsFixed * 5) +
                (tasksCompleted * 2)
            );
        }, {
            title: 'Developer Score',
            icon: '🏆',
            unit: 'points'
        });
    }

    initializeCustomWidgets() {
        // Custom productivity widget
        analytics.registerWidget('productivityTracker', {
            title: 'Productivity Tracker',
            icon: '📈',
            content: `
                <div class="productivity-widget">
                    <div class="productivity-bar">
                        <div class="progress" style="width: 75%"></div>
                    </div>
                    <p>Daily Goal: 75% Complete</p>
                </div>
            `
        });

        // Custom learning widget
        analytics.registerWidget('learningProgress', {
            title: 'Learning Progress',
            icon: '📚',
            content: `
                <div class="learning-widget">
                    <h4>Current Focus</h4>
                    <p>React Advanced Patterns</p>
                    <div class="progress-circle">
                        <span>65%</span>
                    </div>
                </div>
            `
        });
    }

    // Update metrics with real data
    updateMetrics() {
        // You can connect this to your actual data sources
        analytics.updateMetric('learningHours', 12);
        analytics.updateMetric('projectsStarted', 3);
        analytics.updateMetric('bugsFixed', 8);
    }
}

// Initialize custom analytics
const customAnalytics = new CustomAnalytics();
customAnalytics.updateMetrics();
```

### Method 3: API Integration

Connect to external APIs for real-time data:

```javascript
// Example: GitHub integration
class GitHubAnalytics {
    constructor(token) {
        this.token = token;
        this.baseUrl = 'https://api.github.com';
    }

    async fetchGitHubStats() {
        try {
            const response = await fetch(`${this.baseUrl}/user`, {
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            const user = await response.json();
            
            // Update metrics with GitHub data
            analytics.registerMetric('githubRepos', {
                title: 'GitHub Repositories',
                icon: '📦',
                unit: '',
                description: 'Total repositories on GitHub'
            });
            
            analytics.updateMetric('githubRepos', user.public_repos);
            
        } catch (error) {
            console.error('GitHub API error:', error);
        }
    }
}

// Usage
const githubAnalytics = new GitHubAnalytics('your-github-token');
githubAnalytics.fetchGitHubStats();
```

## 🎨 Creating Custom Widgets

### Widget Structure
```javascript
analytics.registerWidget('myWidget', {
    title: 'My Custom Widget',
    icon: '🎯',
    content: `
        <div class="custom-widget">
            <h4>Widget Title</h4>
            <div class="widget-data">
                <!-- Your custom HTML here -->
            </div>
        </div>
    `
});
```

### Interactive Widgets
```javascript
analytics.registerWidget('interactiveWidget', {
    title: 'Interactive Widget',
    icon: '🎮',
    content: `
        <div class="interactive-widget">
            <button onclick="updateWidgetData()">Update Data</button>
            <div id="widgetData">Loading...</div>
        </div>
    `
});

function updateWidgetData() {
    const dataDiv = document.getElementById('widgetData');
    dataDiv.innerHTML = `Updated at ${new Date().toLocaleTimeString()}`;
}
```

## 📈 Advanced Analytics Examples

### 1. **Time Tracking Analytics**
```javascript
class TimeTrackingAnalytics {
    constructor() {
        this.initializeTimeMetrics();
    }

    initializeTimeMetrics() {
        analytics.registerMetric('focusTime', {
            title: 'Focus Time',
            icon: '🎯',
            unit: 'minutes',
            description: 'Deep work time today'
        });

        analytics.registerMetric('meetingTime', {
            title: 'Meeting Time',
            icon: '🤝',
            unit: 'minutes',
            description: 'Time spent in meetings'
        });

        // Efficiency calculation
        analytics.createCustomMetric('focusEfficiency', (metrics) => {
            const focusTime = metrics.get('focusTime')?.value || 0;
            const totalTime = 480; // 8 hours
            return Math.round((focusTime / totalTime) * 100);
        }, {
            title: 'Focus Efficiency',
            icon: '⚡',
            unit: '%'
        });
    }
}
```

### 2. **Project Analytics**
```javascript
class ProjectAnalytics {
    constructor() {
        this.initializeProjectMetrics();
    }

    initializeProjectMetrics() {
        analytics.registerMetric('activeProjects', {
            title: 'Active Projects',
            icon: '🚀',
            unit: '',
            description: 'Currently active projects'
        });

        analytics.registerMetric('projectMilestones', {
            title: 'Milestones Reached',
            icon: '🎯',
            unit: '',
            description: 'Project milestones completed'
        });

        // Project health score
        analytics.createCustomMetric('projectHealth', (metrics) => {
            const activeProjects = metrics.get('activeProjects')?.value || 0;
            const milestones = metrics.get('projectMilestones')?.value || 0;
            const tasks = metrics.get('completedTasks')?.value || 0;

            if (activeProjects === 0) return 0;
            
            return Math.round(
                ((milestones + tasks) / activeProjects) * 10
            );
        }, {
            title: 'Project Health',
            icon: '❤️',
            unit: '/100'
        });
    }
}
```

### 3. **Learning Analytics**
```javascript
class LearningAnalytics {
    constructor() {
        this.initializeLearningMetrics();
    }

    initializeLearningMetrics() {
        analytics.registerMetric('coursesCompleted', {
            title: 'Courses Completed',
            icon: '🎓',
            unit: '',
            description: 'Online courses finished'
        });

        analytics.registerMetric('skillsLearned', {
            title: 'New Skills',
            icon: '🆕',
            unit: '',
            description: 'New skills acquired'
        });

        // Learning velocity
        analytics.createCustomMetric('learningVelocity', (metrics) => {
            const courses = metrics.get('coursesCompleted')?.value || 0;
            const skills = metrics.get('skillsLearned')?.value || 0;
            const learningHours = metrics.get('learningHours')?.value || 0;

            if (learningHours === 0) return 0;
            
            return Math.round(
                ((courses * 10) + (skills * 5)) / learningHours
            );
        }, {
            title: 'Learning Velocity',
            icon: '📈',
            unit: 'points/hour'
        });
    }
}
```

## 🔌 Integration Examples

### 1. **Todoist Integration**
```javascript
class TodoistAnalytics {
    constructor(apiToken) {
        this.apiToken = apiToken;
        this.baseUrl = 'https://api.todoist.com/rest/v2';
    }

    async fetchTodoistData() {
        try {
            const response = await fetch(`${this.baseUrl}/tasks`, {
                headers: {
                    'Authorization': `Bearer ${this.apiToken}`
                }
            });
            
            const tasks = await response.json();
            
            const completed = tasks.filter(task => task.completed);
            const pending = tasks.filter(task => !task.completed);
            
            analytics.updateMetric('completedTasks', completed.length);
            analytics.registerMetric('pendingTasks', {
                title: 'Pending Tasks',
                icon: '⏳',
                unit: '',
                description: 'Tasks waiting to be completed'
            });
            analytics.updateMetric('pendingTasks', pending.length);
            
        } catch (error) {
            console.error('Todoist API error:', error);
        }
    }
}
```

### 2. **RescueTime Integration**
```javascript
class RescueTimeAnalytics {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://www.rescuetime.com/anapi/data';
    }

    async fetchProductivityData() {
        try {
            const response = await fetch(
                `${this.baseUrl}?key=${this.apiKey}&format=json&rs=day&rk=productivity`
            );
            
            const data = await response.json();
            
            // Process RescueTime data
            const productiveTime = data.rows
                .filter(row => row[3] >= 2) // Productive activities
                .reduce((sum, row) => sum + row[1], 0);
            
            analytics.updateMetric('focusTime', productiveTime);
            
        } catch (error) {
            console.error('RescueTime API error:', error);
        }
    }
}
```

## 🎯 Personal Use Cases

### 1. **Developer Productivity**
- Track coding hours
- Monitor project progress
- Measure learning velocity
- Analyze bug resolution time

### 2. **Learning Analytics**
- Course completion rates
- Skill acquisition tracking
- Study time optimization
- Knowledge retention metrics

### 3. **Project Management**
- Milestone tracking
- Team productivity
- Resource utilization
- Risk assessment

### 4. **Health & Wellness**
- Work-life balance
- Break time tracking
- Stress level monitoring
- Energy optimization

## 🚀 Getting Started

1. **Open the dashboard**: Navigate to `dashboard.html`
2. **Open browser console**: Press `F12`
3. **Start experimenting**: Use the examples above
4. **Create your own**: Build custom metrics and widgets
5. **Integrate APIs**: Connect to your favorite services

## 📝 Best Practices

1. **Start Simple**: Begin with basic metrics
2. **Iterate**: Refine your analytics over time
3. **Automate**: Use APIs for real-time data
4. **Visualize**: Create meaningful charts and graphs
5. **Personalize**: Focus on metrics that matter to you

## 🔮 Future Enhancements

The analytics framework is designed to be extensible. Future versions will include:

- **Machine Learning**: Predictive analytics
- **Data Export**: CSV, JSON, PDF reports
- **Mobile App**: Dashboard on your phone
- **Team Analytics**: Collaborative metrics
- **AI Insights**: Automated recommendations

---

**Ready to build your personal analytics empire? Start with the examples above and create the insights that matter most to you!** 🚀 