const axios = require('axios');

class IndeedScraper {
    constructor() {
        this.baseUrl = 'https://www.indeed.com/api';
    }

    async search({ jobTitle, location, skills, experience }) {
        try {
            console.log('Indeed scraper: Searching for candidates...');
            
            const mockCandidates = [
                {
                    name: 'David Kim',
                    title: `${jobTitle || 'Software Engineer'} II`,
                    email: 'david.kim@email.com',
                    phone: '+1-555-0201',
                    location: location || 'Seattle, WA',
                    experience: '6 years experience',
                    skills: skills || 'Python, Django, PostgreSQL, Redis',
                    source: 'Indeed',
                    profile: 'https://indeed.com/resume/david-kim'
                },
                {
                    name: 'Lisa Thompson',
                    title: `Senior ${jobTitle || 'Backend Developer'}`,
                    email: 'lisa.thompson@email.com',
                    phone: '+1-555-0202',
                    location: location || 'Denver, CO',
                    experience: '8 years experience',
                    skills: skills || 'Go, Kubernetes, MongoDB, GCP',
                    source: 'Indeed',
                    profile: 'https://indeed.com/resume/lisa-thompson'
                },
                {
                    name: 'James Wilson',
                    title: `${jobTitle || 'DevOps Engineer'}`,
                    email: 'james.wilson@email.com',
                    phone: '+1-555-0203',
                    location: location || 'Chicago, IL',
                    experience: '4 years experience',
                    skills: skills || 'Docker, Jenkins, Terraform, AWS',
                    source: 'Indeed',
                    profile: 'https://indeed.com/resume/james-wilson'
                }
            ];

            await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1500));

            console.log(`Indeed scraper: Found ${mockCandidates.length} candidates`);
            return mockCandidates;

        } catch (error) {
            console.error('Indeed scraper error:', error);
            return [];
        }
    }
}
