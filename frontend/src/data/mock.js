// Mock data for AIzamo website
export const mockData = {
  // Services data
  services: [
    {
      id: 1,
      title: "AI Automations",
      description: "End-to-end automation solutions tailored to help you work faster, serve better, and grow stronger.",
      icon: "Bot",
      features: ["Workflow Automation", "Task Scheduling", "CRM Optimization", "Automated Messaging Pipelines"]
    },
    {
      id: 2,
      title: "Website Management + SEO",
      description: "Professional website development and optimization to boost visibility, lead conversions, and long-term growth.",
      icon: "Globe",
      features: ["Custom Website Development", "Tailored SEO Designs", "Content Management", "Performance Monitoring"]
    },
    {
      id: 3,
      title: "Ad Optimization",
      description: "Maximize your advertising ROI with AI tools that prioritize efficiency and conversion.",
      icon: "Target",
      features: ["AI Optimized Campaign Setup & Tracking", "ROI Reporting & Insights", "Google & Meta Ads Management", "Email Ad Integration"]
    },
    {
      id: 4,
      title: "Lead Conversion",
      description: "Engage, qualify, and convert leads with intelligent systems tailored to your customer journey.",
      icon: "Users",
      features: ["Lead Scoring", "Nurture Sequences", "Conversion Tracking", "Sales Funnel Optimization"]
    }
  ],

  // Testimonials data
  testimonials: [
    {
      id: 1,
      name: "Sarah Johnson",
      company: "TechStart Solutions",
      rating: 5,
      review: "AIzamo transformed our business operations. Their AI automation saved us 15+ hours per week and increased our lead conversion by 40%.",
      image: "https://images.unsplash.com/photo-1494790108755-2616b811428c?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 2,
      name: "Michael Chen",
      company: "Growth Marketing Co.",
      rating: 5,
      review: "The ad management service delivered incredible results. Our ROAS improved by 60% within the first month. Highly recommend!",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      company: "Local Retail Chain",
      rating: 5,
      review: "Professional, reliable, and results-driven. AIzamo's team helped us automate our entire customer journey with impressive outcomes.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 4,
      name: "David Thompson",
      company: "Consulting Firm",
      rating: 5,
      review: "From website optimization to lead generation, AIzamo exceeded our expectations. Our online presence has never been stronger.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 5,
      name: "Lisa Park",
      company: "E-commerce Store",
      rating: 5,
      review: "The AI automation solutions streamlined our operations perfectly. Customer satisfaction increased and operational costs decreased significantly.",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face"
    }
  ],

  // Roadmap data
  roadmap: [
    {
      id: 1,
      phase: "Discovery",
      title: "Business Analysis",
      description: "We analyze your current processes and identify automation opportunities.",
      duration: "Week 1",
      icon: "Search"
    },
    {
      id: 2,
      phase: "Strategy",
      title: "Solution Design",
      description: "Custom AI strategy development tailored to your business needs.",
      duration: "Week 2",
      icon: "Lightbulb"
    },
    {
      id: 3,
      phase: "Development",
      title: "Implementation",
      description: "Building and deploying your AI automation solutions.",
      duration: "Week 3-4",
      icon: "Cog"
    },
    {
      id: 4,
      phase: "Launch",
      title: "Go Live & Support",
      description: "Launch your solutions with ongoing monitoring and optimization.",
      duration: "Week 5+",
      icon: "Rocket"
    }
  ],

  // Contact form fields
  contactFields: [
    { name: "firstName", label: "First Name", type: "text", required: true },
    { name: "lastName", label: "Last Name", type: "text", required: true },
    { name: "email", label: "Email Address", type: "email", required: true },
    { name: "company", label: "Company", type: "text", required: false },
    { name: "phone", label: "Phone Number", type: "tel", required: false },
    { name: "service", label: "Service Interest", type: "select", required: true, options: [
      "AI Automations",
      "Website Management + SEO", 
      "Ad Management",
      "Lead Conversion",
      "Multiple Services"
    ]},
    { name: "message", label: "Tell us about your project", type: "textarea", required: true }
  ]
};