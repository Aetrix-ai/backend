export function getUserPromt(task: string){
    return `

PROJECT: current info:
${portfolioStarterInfo}
TASK TO IMPLENT: 


    ${task}


  Do not fecht any file already provided in the context

`
}

const portfolioStarterInfo = `
# Portfolio Starter - Vite

## Brief Explanation

This is a modern, lightweight portfolio starter template built with **Vite** and **React**. It provides a fast development experience with hot module replacement (HMR) and optimized production builds. The project is designed to showcase your work, skills, and projects in a clean, professional manner.

### Key Features
- ⚡ **Vite** - Next generation frontend tooling
- ⚛️ **React 18** - UI library
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 📱 **Responsive Design** - Mobile-first approach
- 🚀 **Fast Build & HMR** - Instant feedback during development
- 📦 **Optimized Bundle** - Production-ready builds

---

## Directory Structure

\`\`\`
portfolio-starter-vite/
├── src/
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── About.tsx
│   │   ├── Projects.tsx
│   │   ├── Contact.tsx
│   │   └── NotFound.tsx
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── Hero.tsx
│   │   └── ProjectCard.tsx
│   ├── App.tsx
│   ├── main.tsx
│   ├── App.css
│   └── index.css
├── public/
│   └── favicon.svg
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── project.md
\`\`\`

---

## Pages Code

### **Home.tsx**
\`\`\`typescript
// filepath: /Users/ashintv/Desktop/tv/finalyear/templates/portfolio-starter-vite/src/pages/Home.tsx

import Hero from '../components/Hero';
import ProjectCard from '../components/ProjectCard';

export default function Home() {
  const featuredProjects = [
    {
      id: 1,
      title: 'Project One',
      description: 'A brief description of your first project',
      image: '/project1.jpg',
      link: '/projects'
    },
    {
      id: 2,
      title: 'Project Two',
      description: 'A brief description of your second project',
      image: '/project2.jpg',
      link: '/projects'
    },
  ];

  return (
    <div className="min-h-screen">
      <Hero />
      
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Featured Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredProjects.map(project => (
              <ProjectCard key={project.id} {...project} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
\`\`\`

### **About.tsx**
\`\`\`typescript
// filepath: /Users/ashintv/Desktop/tv/finalyear/templates/portfolio-starter-vite/src/pages/About.tsx

export default function About() {
  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">About Me</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <img 
            src="/profile.jpg" 
            alt="Profile" 
            className="rounded-lg shadow-lg col-span-1"
          />
          
          <div className="col-span-2">
            <p className="text-lg text-gray-700 mb-4">
              Hi! I'm a passionate developer with experience in building modern web applications.
            </p>
            <p className="text-lg text-gray-700 mb-4">
              I specialize in React, TypeScript, and full-stack development.
            </p>
            
            <h3 className="text-2xl font-bold mb-4">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {['React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'PostgreSQL'].map(skill => (
                <span key={skill} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
\`\`\`

### **Projects.tsx**
\`\`\`typescript
// filepath: /Users/ashintv/Desktop/tv/finalyear/templates/portfolio-starter-vite/src/pages/Projects.tsx

import ProjectCard from '../components/ProjectCard';

export default function Projects() {
  const projects = [
    {
      id: 1,
      title: 'E-Commerce Platform',
      description: 'Full-stack e-commerce solution with React and Node.js',
      image: '/project1.jpg',
      link: 'https://github.com'
    },
    {
      id: 2,
      title: 'Task Management App',
      description: 'Collaborative task management tool with real-time updates',
      image: '/project2.jpg',
      link: 'https://github.com'
    },
    {
      id: 3,
      title: 'Weather Dashboard',
      description: 'Real-time weather tracking with API integration',
      image: '/project3.jpg',
      link: 'https://github.com'
    },
  ];

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-12">My Projects</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map(project => (
            <ProjectCard key={project.id} {...project} />
          ))}
        </div>
      </div>
    </div>
  );
}
\`\`\`

### **Contact.tsx**
\`\`\`typescript
// filepath: /Users/ashintv/Desktop/tv/finalyear/templates/portfolio-starter-vite/src/pages/Contact.tsx

import { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Get In Touch</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Message</label>
            <textarea 
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={5}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <button 
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
\`\`\`

### **NotFound.tsx**
\`\`\`typescript
// filepath: /Users/ashintv/Desktop/tv/finalyear/templates/portfolio-starter-vite/src/pages/NotFound.tsx

import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-2xl text-gray-600 mb-8">Page Not Found</p>
        <Link 
          to="/"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
\`\`\`

---

## App.tsx

\`\`\`typescript
// filepath: /Users/ashintv/Desktop/tv/finalyear/templates/portfolio-starter-vite/src/App.tsx

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Projects from './pages/Projects';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;
\`\`\`

---

## Entry Point

### **main.tsx**
\`\`\`typescript
// filepath: /Users/ashintv/Desktop/tv/finalyear/templates/portfolio-starter-vite/src/main.tsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
\`\`\`

### **index.html**
\`\`\`html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Portfolio</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
\`\`\`


\`\`\`

---

## Technologies Used

| Technology | Purpose |
|------------|---------|
| **Vite** | Build tool & dev server |
| **React 18** | UI Framework |
| **TypeScript** | Type safety |
| **React Router** | Client-side routing |
| **Tailwind CSS** | Styling |
`