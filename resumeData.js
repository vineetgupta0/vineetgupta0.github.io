// Resume Data for Vineet Kumar Gupta - Updated
const resumeData = {
    profile: {
        name: "Vineet Kumar Gupta",
        title: "Associate, Gen-AI Engineering @ Goldman Sachs",
        tagline: "Building the future of AI-powered finance",
        phone: "+91 9598035666",
        email: "vk779756@gmail.com",
        website: "https://vineetkumargupta.com",
        location: "Bangalore, India",
        social: {
            linkedin: "https://linkedin.com/in/vineet-kumar-gupta/",
            github: "https://github.com/vineetkumar0",
            leetcode: "https://leetcode.com/u/vineetkrgupta/"
        },
        summary: "Gen-AI Engineer at Goldman Sachs, building enterprise-scale AI platforms serving 50,000+ users. Passionate about LLMs, RAG systems, and cloud-native architectures."
    },

    education: [
        {
            institution: "Vellore Institute of Technology",
            degree: "Bachelor of Technology in Computer Science & Engineering",
            cgpa: "9.12",
            duration: "March 2019 - May 2023",
            location: "Bhopal, India"
        }
    ],

    experience: [
        {
            company: "Goldman Sachs",
            role: "Associate, Gen-AI Engineering",
            duration: "Nov 2024 - Present",
            location: "Bengaluru, India",
            color: "#00a7e1",
            icon: "🏦",
            highlights: [
                "Architecting and scaling the GS AI Platform, the firm's internal generative AI ecosystem, using FastAPI, LangChain, and Large Language Models (LLMs)",
                "Engineered Chain-of-Thought (CoT) agents to automate the generation of complex financial reports, enhancing accuracy and reducing manual turnaround time",
                "Optimized infrastructure and MLOps workflows to support a global rollout to 50,000+ internal users, ensuring high availability and low-latency responses",
                "Implementing robust Retrieval-Augmented Generation (RAG) patterns to provide context-aware insights from proprietary financial datasets"
            ]
        },
        {
            company: "Barraiser",
            role: "Software Development Engineer - 1",
            duration: "Sep 2024 - Nov 2024",
            location: "Bengaluru, India",
            color: "#8b5cf6",
            icon: "🎯",
            highlights: [
                "Developed serverless data processing pipelines using AWS Lambda to automate the transcription of interview data and extract actionable insights",
                "Built an 'LLM as a judge' framework to standardize and automate candidate performance evaluations, increasing grading consistency",
                "Decomposed monolithic repositories into scalable microservices by leveraging AWS SQS, SNS, and EventBridge, improving system modularity",
                "Orchestrated cross-regional cloud infrastructure migrations, ensuring seamless service continuity and optimized resource allocation"
            ]
        },
        {
            company: "Squadstack",
            role: "Product Engineer - 1, Platform (DevOps)",
            duration: "July 2023 - April 2024",
            location: "Bengaluru, India",
            color: "#10b981",
            icon: "⚙️",
            highlights: [
                "Reduced organization-wide AWS EC2 costs by 10% through strategic migration to AWS Graviton-based instances",
                "Automated deployment workflows using Python and AWS SSM, replacing legacy SSH-based methods and reducing deployment operational costs by 90%",
                "Developed and open-sourced 'squad-gunicorn', a custom wrapper enhancing observability for auto-scaling Django applications serving 100k+ monthly views",
                "Streamlined logging infrastructure by consolidating multiple tools into Vector.dev, piping logs to Grafana and Elastic Cloud"
            ]
        },
        {
            company: "Squadstack",
            role: "Software Engineering Intern, Platform Team",
            duration: "January 2023 - June 2023",
            location: "Noida, India",
            color: "#10b981",
            icon: "🚀",
            highlights: [
                "Designed and implemented a 3-tier AWS architecture network, improving maintainability and scalability for 10+ major enterprise clients",
                "Automated resource provisioning and monitoring using Terraform (IaC), integrating CloudWatch alarms and ALB configurations into CI/CD pipeline"
            ]
        }
    ],

    projects: [
        {
            name: "Squad-Gunicorn",
            tech: ["Python", "Gunicorn", "Web-Sockets"],
            link: "https://pypi.org/project/squad-gunicorn/121.0.4/",
            icon: "📦",
            description: [
                "Developed an enhanced drop-in replacement for Gunicorn with advanced process observability (RSS, VSS, worker status)",
                "Implemented telemetry that allowed for more granular auto-scaling triggers based on real-time worker memory consumption"
            ]
        }
    ],

    skills: {
        "Languages & AI": ["Python", "C++", "FastAPI", "Flask", "LangChain", "LLMs", "RAG", "PostgreSQL", "MongoDB"],
        "Cloud & DevOps": ["AWS Lambda", "SQS", "EventBridge", "Terraform", "Docker", "Kubernetes", "Ansible", "CI/CD", "GitHub Actions"],
        "Technologies": ["MLOps", "Kafka", "Snowflake", "CoT", "MCP", "Agents", "Redis", "RESTful APIs", "Linux", "Git"]
    },

    certifications: [
        {
            name: "Microsoft Certified: Azure Fundamentals (AZ-900)",
            icon: "☁️"
        },
        {
            name: "IBM: Machine Learning with Python",
            icon: "🤖"
        }
    ],

    achievements: [
        {
            title: "INSTINCT 2.0 - Innovation Challenge",
            description: "Winner with ₹10,000 Prize",
            icon: "🥇"
        },
        {
            title: "Microsoft BIAL Genie Hackathon",
            description: "Semifinalist - Top 1% of 5,000+ teams",
            icon: "🚀"
        }
    ],

    stats: {
        yearsExp: "2+",
        usersImpacted: "50K+",
        costSaved: "90%",
        openSource: "Yes"
    }
};

// Zone configurations with positions and colors
const zoneConfigs = {
    home: {
        name: "Welcome",
        icon: "👋",
        position: { x: 0, z: 0 },
        color: 0xff6b9d,
        secondaryColor: 0xc44cff,
        description: "Start here"
    },
    education: {
        name: "Education",
        icon: "🎓",
        position: { x: 35, z: -25 },
        color: 0x4cc9ff,
        secondaryColor: 0x00f5d4,
        description: "VIT Bhopal"
    },
    experience: {
        name: "Experience",
        icon: "💼",
        position: { x: 45, z: 10 },
        color: 0xc44cff,
        secondaryColor: 0xff6b9d,
        description: "Goldman Sachs & more"
    },
    projects: {
        name: "Projects",
        icon: "🛠️",
        position: { x: 20, z: 40 },
        color: 0xff9e00,
        secondaryColor: 0xfee440,
        description: "Open source work"
    },
    skills: {
        name: "Skills",
        icon: "⚡",
        position: { x: -30, z: 30 },
        color: 0x00f5d4,
        secondaryColor: 0x4cc9ff,
        description: "Tech stack"
    },
    achievements: {
        name: "Achievements",
        icon: "🏆",
        position: { x: -45, z: 0 },
        color: 0xfee440,
        secondaryColor: 0xff9e00,
        description: "Hackathons & certs"
    },
    contact: {
        name: "Contact",
        icon: "📬",
        position: { x: -25, z: -30 },
        color: 0xff6b9d,
        secondaryColor: 0x4cc9ff,
        description: "Get in touch"
    }
};

// Navigation order for guided tour
const navigationOrder = ['home', 'experience', 'education', 'skills', 'projects', 'achievements', 'contact'];
