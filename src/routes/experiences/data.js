export default {
  companies: [
    {
      name: "STOQO",
      link: "https://stoqo.com/",
      current: true,
      title: 'Software Engineer Intern & Part Time',
      works: [
        {
          title: 'STOQO Landing Page',
          description: 'Built the web application from scratch, expanding STOQO distribution channel',
          tags: [
            'React',
            'Redux',
            'Node.js',
            'Styled Components',
            'Server Side Rendering',
            'Algolia',
          ]
        },
        {
          title: 'STOQO Customer Dashboard',
          description: 'A web application for customer to review their orders and generate reports, increasing customer engagement and transparency. Developed from scratch, including cached report generation API',
          tags: [
            'React',
            'Redux',
            'Styled Components',
            'Django',
            'Django Rest Framework',
            'AWS S3'
          ]
        },
        {
          title: 'STOQO Task Management',
          description: 'An application with two client: Mobile and Web, developed to ease and streamline the operational team task management.',
          tags: [
            'React',
            'React Native',
            'Expo',
            'Django',
            'Django Rest Framework',
            'Algolia',
          ]
        }
      ]
    },
    {
      name: "Dekoruma",
      link: "https://dekoruma.com/",
      current: false,
      title: 'Software Engineer Intern & Part Time',
      works: [
        {
          title: "Shoppable Magazine",
          description:
            "Added a feature for editors to tag products to images and show them to the customer, allowing them to add the product to cart directly from these banner images. Developed the API, Editor, and customer-facing view.",
          tags: ["React", "Redux", "Node.js", "MongoDB", "React DND"]
        },
        {
          title: "Mobile Application",
          description:
            "A new user acquisition channel in form of a mobile application developed in React Native. Bootstrapped the project and worked on some core views.",
          tags: ["React Native", "Redux", "Algolia"]
        },
        {
          title: "Search Component Abstraction",
          description:
            "Created a universal abstraction for search components leveraging patterns such as higher order components, render props, and adapters.",
          tags: [
            "React",
            "React Native Web",
            "Redux",
            "Algolia",
            "Design patterns"
          ]
        }
      ]
    }
  ]
};
