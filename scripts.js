const questions = {
    "who are you": "I am Vineet Kumar Gupta, a software engineer.",
    "what is your email": "My email is vk779756@gmail.com.",
    "what is your phone number": "My phone number is +91-9598035666.",
    "where did you study": "I studied at Vellore Institute of Technology and graduated with a BTech in CSE.",
    "what are your skills": "I have skills in Python, C/C++, Django, Flask, AWS, Azure, Postgres, AWS-CLI, UNIX, Docker, Terraform, Web Scraping, GIT, CircleCi, Snowflake, SQL.",
    "what is your work experience": "I worked as a Product Engineer at Squadstack from July 2023 to April 2024.",
    "what are your achievements": "I won the INSTINCT 2.0 Innovation Challenge & Hackathon and secured AIR 1286 in Google Hash code 2021.",
    "what projects have you worked on": "I worked on projects like Squad-Gunicorn and Secure Smart Electric Meter & Network."
};

function handleDropdownChange() {
    const selectedQuestion = document.getElementById('questionSelect').value.toLowerCase();
    const chatlog = document.getElementById('chatlog');
    
    if (selectedQuestion) {
        const response = questions[selectedQuestion] || "Sorry, I don't have an answer for that.";
        chatlog.innerHTML += `<p><strong>You:</strong> ${questions[selectedQuestion]}</p>`;
        chatlog.innerHTML += `<p><strong>Chatbot:</strong> ${response}</p>`;
        document.getElementById('questionSelect').value = '';
        chatlog.scrollTop = chatlog.scrollHeight;
    }
}
