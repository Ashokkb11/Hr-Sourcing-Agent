class HRSourcingApp {
    constructor() {
        this.searchForm = document.getElementById('searchForm');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.resultsSection = document.getElementById('results');
        this.candidatesList = document.getElementById('candidatesList');
        this.resultsCount = document.getElementById('resultsCount');
        this.exportBtn = document.getElementById('exportBtn');
        this.errorMessage = document.getElementById('errorMessage');
        
        this.candidates = [];
        this.init();
    }

    init() {
        this.searchForm.addEventListener('submit', this.handleSearch.bind(this));
        this.exportBtn.addEventListener('click', this.exportToCSV.bind(this));
    }

    async handleSearch(e) {
        e.preventDefault();
        
        const formData = new FormData(this.searchForm);
        const searchParams = {
            jobTitle: formData.get('jobTitle'),
            location: formData.get('location'),
            skills: formData.get('skills'),
            experience: formData.get('experience')
        };

        this.showLoading();
        this.hideError();

        try {
            const response = await fetch('/api/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(searchParams)
            });

            const data = await response.json();

            if (data.success) {
                this.candidates = data.results;
                this.displayResults();
            } else {
                this.showError(data.message || 'Search failed. Please try again.');
            }
        } catch (error) {
            console.error('Search error:', error);
            this.showError('Network error. Please check your connection and try again.');
        } finally {
            this.hideLoading();
        }
    }

    showLoading() {
        this.loadingSpinner.classList.remove('hidden');
        this.resultsSection.classList.add('hidden');
        this.searchForm.querySelector('button[type="submit"]').disabled = true;
    }

    hideLoading() {
        this.loadingSpinner.classList.add('hidden');
        this.searchForm.querySelector('button[type="submit"]').disabled = false;
    }

    displayResults() {
        this.resultsCount.textContent = `${this.candidates.length} candidates found`;
        this.candidatesList.innerHTML = '';

        if (this.candidates.length === 0) {
            this.candidatesList.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search" style="font-size: 3em; color: #bbb; margin-bottom: 20px;"></i>
                    <h3>No candidates found</h3>
                    <p>Try adjusting your search criteria or broadening your requirements.</p>
                </div>
            `;
        } else {
            this.candidates.forEach(candidate => {
                const candidateCard = this.createCandidateCard(candidate);
                this.candidatesList.appendChild(candidateCard);
            });
        }

        this.resultsSection.classList.remove('hidden');
    }

    createCandidateCard(candidate) {
        const card = document.createElement('div');
        card.className = 'candidate-card';

        const skills = candidate.skills ? candidate.skills.split(',').map(s => s.trim()) : [];
        const skillsHTML = skills.length > 0 ? `
            <div class="candidate-skills">
                ${skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
        ` : '';

        card.innerHTML = `
            <div class="candidate-header">
                <div>
                    <div class="candidate-name">${candidate.name || 'Name not available'}</div>
                    <div class="candidate-title">${candidate.title || 'Title not specified'}</div>
                </div>
                <div class="candidate-source">${candidate.source || 'Unknown'}</div>
            </div>
            
            <div class="candidate-details">
                ${candidate.email ? `
                    <div class="candidate-detail">
                        <i class="fas fa-envelope"></i>
                        <span>${candidate.email}</span>
                    </div>
                ` : ''}
                
                ${candidate.phone ? `
                    <div class="candidate-detail">
                        <i class="fas fa-phone"></i>
                        <span>${candidate.phone}</span>
                    </div>
                ` : ''}
                
                ${candidate.location ? `
                    <div class="candidate-detail">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${candidate.location}</span>
                    </div>
                ` : ''}
                
                ${candidate.experience ? `
                    <div class="candidate-detail">
                        <i class="fas fa-clock"></i>
                        <span>${candidate.experience}</span>
                    </div>
                ` : ''}
                
                ${candidate.profile ? `
                    <div class="candidate-detail">
                        <i class="fas fa-external-link-alt"></i>
                        <a href="${candidate.profile}" target="_blank" rel="noopener noreferrer">View Profile</a>
                    </div>
                ` : ''}
            </div>
            
            ${skillsHTML}
        `;

        return card;
    }

    exportToCSV() {
        if (this.candidates.length === 0) {
            alert('No candidates to export');
            return;
        }

        const headers = ['Name', 'Title', 'Email', 'Phone', 'Location', 'Experience', 'Skills', 'Source', 'Profile'];
        const csvContent = [
            headers.join(','),
            ...this.candidates.map(candidate => [
                this.escapeCsvValue(candidate.name || ''),
                this.escapeCsvValue(candidate.title || ''),
                this.escapeCsvValue(candidate.email || ''),
                this.escapeCsvValue(candidate.phone || ''),
                this.escapeCsvValue(candidate.location || ''),
                this.escapeCsvValue(candidate.experience || ''),
                this.escapeCsvValue(candidate.skills || ''),
                this.escapeCsvValue(candidate.source || ''),
                this.escapeCsvValue(candidate.profile || '')
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `hr-candidates-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    escapeCsvValue(value) {
        if (typeof value !== 'string') return '';
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            return '"' + value.replace(/"/g, '""') + '"';
        }
        return value;
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.classList.remove('hidden');
    }

    hideError() {
        this.errorMessage.classList.add('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new HRSourcingApp();
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered: ', registration))
            .catch(registrationError => console.log('SW registration failed: ', registrationError));
    });
}
